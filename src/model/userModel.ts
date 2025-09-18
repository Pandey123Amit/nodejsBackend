import { log } from 'console';
import pool from '../db/dbconn';
import { Role } from '../constant';
import { verifyPassword } from '../utils/users';


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
    userId: number;
    addressLine: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    latitude?: number;
    longitude?: number;
    createdAt?: string;
}

export interface SubAdmin {
    id: number;
    name: string;
    phonenumber: string;
    usertype: string;
    roleAssigned: string; 
}


export const register = async (Fname: string, Lname: string, email: string, phonenumber: number, password: string, usertype: string): Promise<User> => {
    const query = `INSERT INTO usersdata(Fname,Lname,username,phonenumber,email,password,usertype) 
                    values($1,$2,$3,$4,$5,$6,$7) RETURNING *;`
    try {
        const dataset = await pool.query(query, [Fname, Lname, email.split('@')[0], phonenumber, email, password, usertype])
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
        const isValidPassword = await verifyPassword(password, dataset.password);

        if (dataset && (dataset.username === email.split('@')[0] || dataset.email === email) && dataset.password === password && isValidPassword) {
            //console.log("inside if check:",dataset);
            return { success: true, user: dataset };
        }

        return { success: false };
    } catch (error) {
        console.log(`Error in fetching: ${error}`);
        throw new Error('Something went wrong in checkCredentials');
    }
};



export const findById = async (userid: number): Promise<User & Address> => {
    try {
        const query = `
      SELECT u.id, u.email, a.id AS address_id,a.latitude,a.longitude
      FROM usersdata u
      LEFT JOIN addresses a ON u.id = a.user_id
      WHERE u.id = $1;
    `;
        const queryValue = await pool.query(query, [userid]);

        if (queryValue.rows.length === 0) {
            throw new Error("User not found");
        }

        const dataset = queryValue.rows[0] as User & Address;
        return dataset;

    } catch (error) {
        throw new Error("Something went wrong in findById method");
    }
};


export const getAllSubAdmin = async (): Promise<SubAdmin[]> => {
    try {
        const result = await pool.query<SubAdmin>(`
            SELECT
                u.id,
                CONCAT(u.fname, ' ', u.lname) AS name,
                u.phonenumber,
                u.usertype,
                STRING_AGG(p.name, ', ') AS role_assigned
            FROM usersdata u
            LEFT JOIN user_roles ur ON u.id = ur.user_id
            LEFT JOIN role_permissions rp ON ur.id = rp.role_id
            LEFT JOIN permissions p ON p.id = rp.permission_id
            WHERE ur.role = $1
            GROUP BY u.id, u.fname, u.lname, u.phonenumber, u.usertype;
        `, [Role.SubAdmin]);

        if (result.rows.length === 0) {
            throw new Error("No sub-admins found");
        }

        return result.rows;
    } catch (error) {
        console.error("getAllSubAdmin error:", error);
        throw new Error("Something went wrong while fetching sub-admins");
    }
};

 






