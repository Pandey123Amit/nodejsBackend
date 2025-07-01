"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDBConnection = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const pg_1 = __importDefault(require("pg"));
dotenv_1.default.config();
const { Pool } = pg_1.default;
// Create the pool using environment variables
const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt((_a = process.env.DB_PORT) !== null && _a !== void 0 ? _a : "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});
// function to test DB connection
const testDBConnection = async () => {
    try {
        const res = await pool.connect();
        console.log('Connected to PostgreSQL');
    }
    catch (err) {
        console.error('Error connecting to PostgreSQL:', err);
    }
};
exports.testDBConnection = testDBConnection;
exports.default = pool;
//# sourceMappingURL=dbconn.js.map