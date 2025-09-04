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

export interface Session {
    id: number,
    accessToken: string,
    createdAt: Date
    userid: number
}

export interface Address {             
  user_id: number;         
  address_line: string;   
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  latitude?: number;       
  longitude?: number;
  created_at?: string;     
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

export const checkCredentails = async (
    email: string,
    password: string
): Promise<{ success: boolean; user?: User }> => {
    const queryString = `SELECT id, email, username, password FROM usersdata WHERE email = $1;`;

    try {
        const queryValue = await pool.query(queryString, [email]);
        //console.log(email,password);
        
        const dataset: User = queryValue.rows[0];
        if (dataset && (dataset.username === email.split('@')[0] || dataset.email === email) && dataset.password === password) {
            //console.log("inside if check:",dataset);
            return { success: true, user: dataset };
        }

        return { success: false };
    } catch (error) {
        console.log(`Error in fetching: ${error}`);
        throw new Error('Something went wrong in checkCredentials');
    }
};


export const findById = async (userid: number) => {
    try {
        const query = `select * from user where id = $1;`
        const queryValue = await pool.query(query, [userid])
        const dataset: User = queryValue.rows[0]
        return dataset

    } catch (error) {
        throw new Error("SOmething wrong in FindByid Method")
    }
}



