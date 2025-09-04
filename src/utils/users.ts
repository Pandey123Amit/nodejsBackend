import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pool from '../db/dbconn';
import { User } from '../model/userModel';
import {randomBytes} from "node:crypto";

dotenv.config();


export const genratedpassword = ():string =>{
    const value = 'Remote@'
    const rawValue = process.env.RANDOM_VALUE ?? "12"; 
    const digit = Math.floor(Math.random()*parseInt(rawValue)*100)
    const password = value + digit;
    return password
}

export const userExist = async (email:string):Promise<boolean> => {
    if(!email) return false;
        try {
            const query = `select email from usersdata where email = $1`
            const data = await pool.query(query,[email]) 
            const dataset:User = data.rows[0]
            if(dataset && dataset.email){
                return false
            }
            else{
                return true
            }
        } catch (error) {
            console.log("Error in userexit",error);
            return true
        }
    };

export const tokenGenerate = (key:string) => {
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
