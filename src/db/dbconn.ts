import dotenv from 'dotenv';
import pkg from 'pg';

dotenv.config();

const { Pool } = pkg;


// Create the pool using environment variables
const pool = new Pool({
  host: process.env.DB_HOST ?? "postgres_db",
  port: parseInt(process.env.DB_PORT ?? "5433"),
  user: process.env.DB_USER ?? "postgres",
  password: process.env.DB_PASSWORD ?? "Amit@123",
  database: process.env.DB_NAME ?? "RMS",
});
console.log(process.env.DB_HOST,process.env.DB_PORT,process.env.DB_USER,process.env.DB_PASSWORD,process.env.DB_NAME );

// function to test DB connection
export const testDBConnection = async () => {
  try {
    const res = await pool.connect();
    // console.log(res)
    console.log('Connected to PostgreSQL');
  } catch (err) {
    
    console.error('Error connecting to PostgreSQL:', err);
  }
};


export default pool; 
