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

export interface RestaurantWithDishes {
  restaurant_id: number;
  restaurant_name: string;
  restaurant_address: string;
  phone_number?: string;
  dish_name?: string;
  description?: string;
  price?: number;
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
    const result = await pool.query(`select id,name,CONCAT_WS(', ', address, city, state, country, postal_code) as address , phone_number,latitude,longitude from restaurants;`);
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
  // dishes by restaurant
  static async getByOwnerId(id: number): Promise<RestaurantWithDishes[] | null> {
    const result = await pool.query(`SELECT
          r.name AS restaurant_name,
          CONCAT(r.address, ', ', r.city, ', ', r.postal_code) AS restaurant_address,
          r.phone_number,
          d.name AS dish_name,
          d.description,
          d.price
      FROM restaurants r  
      LEFT JOIN dishes d
          ON d.restaurant_id = r.id   
      WHERE r.owner_id = $1
        AND (d.is_available = true OR d.is_available = true);`, [id]);
    return result.rows || null;
  }

  // Delete restaurant
  static async delete(id: number, ownerId?: number): Promise<boolean | null> {
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
