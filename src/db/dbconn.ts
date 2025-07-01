import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;


// Create the pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT ?? "5432"),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

// function to test DB connection
export const testDBConnection = async () => {
  try {
    const res = await pool.connect();
    console.log('Connected to PostgreSQL');
  } catch (err) {
    console.error('Error connecting to PostgreSQL:', err);
  }
};


export default pool; 
