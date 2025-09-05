"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestaurantModel = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
class RestaurantModel {
    // Create restaurant
    static async createRestaurant(data) {
        const query = `
      INSERT INTO restaurants 
        (name, address, city, state, country, postal_code, phone_number, latitude, longitude, owner_id)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *;
    `;
        const values = [
            data.name,
            data.address || null,
            data.city || null,
            data.state || null,
            data.country || null,
            data.postal_code || null,
            data.phone_number || null,
            data.latitude || null,
            data.longitude || null,
            data.owner_id
        ];
        const result = await dbconn_1.default.query(query, values);
        return result.rows[0];
    }
    // Fetch all restaurants (Admin can see all)
    static async getAll() {
        const result = await dbconn_1.default.query(`SELECT * FROM restaurants ORDER BY created_at DESC;`);
        return result.rows;
    }
    // Fetch restaurants by owner (sub-admin sees only his/her restaurants)
    static async getByOwner(ownerId) {
        const result = await dbconn_1.default.query(`SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC;`, [ownerId]);
        return result.rows;
    }
    // Get single restaurant by ID
    static async getById(id) {
        const result = await dbconn_1.default.query(`SELECT * FROM restaurants WHERE id = $1;`, [id]);
        return result.rows[0] || null;
    }
    // Delete restaurant
    static async delete(id, ownerId) {
        let query = `DELETE FROM restaurants WHERE id = $1`;
        let params = [id];
        // if sub-admin, ensure they can only delete their own
        if (ownerId) {
            query += ` AND owner_id = $2`;
            params.push(ownerId);
        }
        const result = await dbconn_1.default.query(query, params);
        return result.rowCount > 0;
    }
}
exports.RestaurantModel = RestaurantModel;
//# sourceMappingURL=RestaurantsModel.js.map