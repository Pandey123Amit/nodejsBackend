import pool from "../db/dbconn";

export interface Dish {
  id?: number;
  restaurant_id: number;
  name: string;
  description?: string;
  price: number;
  is_available?: boolean;
  created_by: number;  // admin or sub-admin
  created_at?: Date;
}

export class DishModel {
  // Create dish
  static async create(data: Dish): Promise<Dish> {
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
      data.is_available ?? true,
      data.created_by
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Get all dishes for a restaurant
  static async getByRestaurant(restaurantId: number): Promise<Dish[]> {
    const result = await pool.query(
      `SELECT * FROM dishes WHERE restaurant_id = $1 ORDER BY created_at DESC;`,
      [restaurantId]
    );
    return result.rows;
  }

  // Get dish by ID
  static async getById(id: number): Promise<Dish | null> {
    const result = await pool.query(`SELECT * FROM dishes WHERE id = $1;`, [id]);
    return result.rows[0] || null;
  }

  // Delete dish (admin can delete any, sub-admin only their own)
  static async delete(id: number, createdBy?: number): Promise<boolean> {
    let query = `DELETE FROM dishes WHERE id = $1`;
    let params: any[] = [id];

    if (createdBy) {
      query += ` AND created_by = $2`;
      params.push(createdBy);
    }

    const result = await pool.query(query, params);
    return result.rowCount as number > 0;
  }
}
