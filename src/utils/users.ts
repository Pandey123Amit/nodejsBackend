import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pool from '../db/dbconn';
import { User } from '../model/userModel';
import { randomBytes } from "node:crypto";
import bcrypt from "bcrypt";


dotenv.config();


export const genratedpassword = async (): Promise<string[]> => {
  const value = 'Remote@';
  const rawValue = process.env.RANDOM_VALUE ?? "12";
  const digit = Math.floor(Math.random() * parseInt(rawValue) * 100);
  const password = "Remote@123";

  const hashedPassword = await bcrypt.hash(password, 10);
  return [hashedPassword, password] ;
};

export const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};





export const userExist = async (email: string): Promise<boolean> => {
  if (!email) return false;
  try {
    const query = `SELECT email FROM usersdata WHERE email = $1`;
    const result = await pool.query(query, [email]);

    return result.rows.length > 0;
  } catch (error) {
    console.error("Error checking if user exists:", error);
    return false;
  }
};


export const tokenGenerate = (key: string) => {
  return Buffer.from(randomBytes(key.length)).toString('hex'); //stackoverflow
}

export const insertByColNameAndValueAndTablename = async <T>(
  tableName: string,
  columnNames: string[],
  values: any[]
): Promise<T> => {
  if (columnNames.length !== values.length) {
    throw new Error("Column names and values count must match.");
  }

  const columns = columnNames.map(col => `"${col}"`).join(", ");
  const placeholders = values.map((_, i) => `$${i + 1}`).join(", ");
  const query = `INSERT INTO "${tableName}" (${columns}) VALUES (${placeholders}) RETURNING *`;

  try {
    const result = await pool.query(query, values);
    return result.rows[0] as T;
  } catch (error) {
    console.error("Insert failed:", error);
    throw error;
  }
};
