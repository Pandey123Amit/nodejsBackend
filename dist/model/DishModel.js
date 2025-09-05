"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DishModel = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
class DishModel {
    // Create dish
    static async create(data) {
        var _a;
        const query = `
      INSERT INTO dishes (restaurant_id, name, description, price, is_available, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;
        const values = [
            data.restaurant_id,
            data.name,
            data.description || null,
            data.price,
            (_a = data.is_available) !== null && _a !== void 0 ? _a : true,
            data.created_by
        ];
        const result = await dbconn_1.default.query(query, values);
        return result.rows[0];
    }
    // Get all dishes for a restaurant
    static async getByRestaurant(restaurantId) {
        const result = await dbconn_1.default.query(`SELECT * FROM dishes WHERE restaurant_id = $1 ORDER BY created_at DESC;`, [restaurantId]);
        return result.rows;
    }
    // Get dish by ID
    static async getById(id) {
        const result = await dbconn_1.default.query(`SELECT * FROM dishes WHERE id = $1;`, [id]);
        return result.rows[0] || null;
    }
    // Delete dish (admin can delete any, sub-admin only their own)
    static async delete(id, createdBy) {
        let query = `DELETE FROM dishes WHERE id = $1`;
        let params = [id];
        if (createdBy) {
            query += ` AND created_by = $2`;
            params.push(createdBy);
        }
        const result = await dbconn_1.default.query(query, params);
        return result.rowCount > 0;
    }
}
exports.DishModel = DishModel;
//# sourceMappingURL=DishModel.js.map