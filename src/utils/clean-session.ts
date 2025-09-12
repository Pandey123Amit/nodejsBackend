const { Pool } = require('pg');
require('dotenv').config();  // Load DATABASE_URL from .env

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function cleanupSessions() {
    try {
        const result = await pool.query(
            `DELETE FROM sessions WHERE created_at < NOW() - INTERVAL '30 minutes';`
        );
        console.log(`[${new Date().toISOString()}] Deleted ${result.rowCount} expired sessions.`);
    } catch (error) {
        console.error('Error during session cleanup:', error);
    } finally {
        await pool.end();
    }
}

cleanupSessions();
