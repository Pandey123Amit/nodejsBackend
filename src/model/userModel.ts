import { log } from 'console';
import pool from '../db/dbconn';


export interface User {
    id: number,
    Fname: string,
    Lname: string,
    username: string,
    phonenumber: number,
    email: string,
    password: string,
    isCredentailsSend: boolean,
    isemailVerified: number,
}


export const register = async (Fname: string, Lname: string, email: string, phonenumber: number, password: string): Promise<User> => {
    const query = `INSERT INTO usersdata(Fname,Lname,username,phonenumber,email,password) 
                    values($1,$2,$3,$4,$5,$6) RETURNING *;`
    try {
        const dataset = await pool.query(query, [Fname, Lname, email.split('@')[0], phonenumber, email, password])
        return dataset.rows[0]

    } catch (err) {
        console.log(`Error in Datainsert: ${err}`);
        throw new Error('Something worng in userModels')
    }
}

export const checkCredentails = async (email: string, password: string): Promise<boolean> => {
    const queryString = `Select id,email,username,password from usersdata where email = $1;`
    try {
        const queryValue = await pool.query(queryString, [email])
        const dataset: User = queryValue.rows[0]
        if (dataset && (dataset.username === email.split('@')[0] || dataset.email === email) && dataset.password === password) {
            return true
        }
        return false
    } catch (error) {
        console.log(`Error in fetching: ${error}`);
        throw new Error('Something worng in userModels')
    }
}




