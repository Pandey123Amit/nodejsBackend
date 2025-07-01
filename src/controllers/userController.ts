import { Request, Response } from 'express';
import * as UserModel from '../model/userModel';
import { genratedpassword, userExist } from '../utils/users';
import { sendEmail } from '../utils/emailSend';
import pool from '../db/dbconn';
import { STATUS_CODES } from 'http';






export const registerUser = async (req: Request, res: Response) => {
    const { Fname, Lname, phonenumber, email } = req.body
    const isuserExist: boolean = await userExist(email)
    // console.log(isuserexit);
    try {
        if (email && isuserExist) {
            let isemail: boolean = false
            const password: string = genratedpassword()
            const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password)
            if (dataset) {
                isemail = await sendEmail({
                    from: process.env.SENDER_EMAIL,
                    to: dataset.email,
                    subject: 'Login Credentials',
                    html: `<h3>Welcome, ${Fname} ${Lname}!</h3>
                    <p>Your account has been successfully created.</p>
                    <p><strong>Login Details:</strong></p>
                <ul>
                    <li><strong>User ID:</strong> ${dataset.id}</li>
                    <li><strong>Email:</strong> ${dataset.email}</li>
                    <li><strong>Password:</strong> ${dataset.password}</li>
                </ul>
                <p>Use these credentials to log in to the system.</p>`,
                });
            }
            if (isemail) {
                console.log(dataset.id);
                await pool.query(`UPDATE usersdata SET isCredentailsSend = $2 where id=$1;`, [dataset.id,true])
                res.json({
                    email: dataset.email,
                    username: dataset.username,
                    message: "Please check Email for login Credentials"
                });
                return
            }

        }
    } catch (err) {
        res.json({
            meassage: "Something Went Wrong in signup",
            erros: err
        })
        return
    }

}
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body
    if (!email || !password) {
        return res.status(400).json({
            message: "Missing credentials. Please provide email and password.",
        });
    }
    try {
        const isValidCredentails: boolean = await UserModel.checkCredentails(email, password)
        if (isValidCredentails) {
            return res.status(200).json({
                message: "Login successful",
            });
        }
        return res.status(401).json({
            message: "Invalid email or password. Please try again.",
        });

    } catch (err) {
        return res.status(500).json({
            message: "Something went wrong during login",
            error: err,
        });
    }


}