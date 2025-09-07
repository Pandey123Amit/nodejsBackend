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
  static async createDish(dish: Dish): Promise<Dish> {
    const result = await pool.query(
      `INSERT INTO dishes (restaurant_id, name, description, price, is_available, created_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
      [
        dish.restaurant_id,
        dish.name,
        dish.description,
        dish.price,
        dish.is_available ?? true,
        dish.created_by,
      ]
    );
    return result.rows[0];
  }

  static async getDishesByRestaurant(restaurantId: number): Promise<Dish[]> {
    const result = await pool.query(
      `SELECT * FROM dishes WHERE restaurant_id = $1`,
      [restaurantId]
    );
    return result.rows;
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
    console.log(query, params);


    const result = await pool.query(query, params);
    return result.rowCount as number > 0;
  }

  static async update(
    id: number,
    fields: Partial<{ name: string; description: string; price: number; is_available: boolean }>,
    createdBy?: number
  ): Promise<Dish | null> {
    
    const setClause = Object.keys(fields)
      .map((key, index) => `${key} = $${index + 1}`).join(', ');

    const values = Object.values(fields);

    if (values.length === 0) return null;

    let query = `UPDATE dishes SET ${setClause} WHERE id = $${values.length + 1}`;
    const params = [...values, id];

    if (createdBy) {
      query += ` AND created_by = $${values.length + 2}`;
      params.push(createdBy);
    }

    query += ` RETURNING *`;

    console.log(query,params);
    

    const result = await pool.query(query, params);
    return result.rows[0] || null;
  }

}
