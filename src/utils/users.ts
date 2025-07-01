import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import pool from '../db/dbconn';
import { User } from '../model/userModel';
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

