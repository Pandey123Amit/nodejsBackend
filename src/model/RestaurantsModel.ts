import pool from "../db/dbconn";

export interface Restaurant {
  id?: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  phone_number?: string;
  latitude?: number;
  longitude?: number;
  created_at?: Date;
  owner_id: number; 
}

export class RestaurantModel {
  // Create restaurant
  static async createRestaurant(data: Restaurant): Promise<Restaurant> {
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

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  // Fetch all restaurants (Admin can see all)
  static async getAll(): Promise<Restaurant[]> {
    const result = await pool.query(`SELECT * FROM restaurants ORDER BY created_at DESC;`);
    return result.rows;
  }

  // Fetch restaurants by owner (sub-admin sees only his/her restaurants)
  static async getByOwner(ownerId: number): Promise<Restaurant[]> {
    const result = await pool.query(`SELECT * FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC;`, [ownerId]);
    return result.rows;
  }

  // Get single restaurant by ID
  static async getById(id: number): Promise<Restaurant | null> {
    const result = await pool.query(`SELECT * FROM restaurants WHERE id = $1;`, [id]);
    return result.rows[0] || null;
  }

  // Delete restaurant
  static async delete(id: number, ownerId?: number): Promise<boolean | null>  {
    let query = `DELETE FROM restaurants WHERE id = $1`;
    let params: any[] = [id];

    // if sub-admin, ensure they can only delete their own
    if (ownerId) {
      query += ` AND owner_id = $2`;
      params.push(ownerId);
    }

    const result = await pool.query(query, params);
    return result.rowCount as number > 0 
  }
}
