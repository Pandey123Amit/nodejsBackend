import { Request, Response } from 'express';
import * as UserModel from '../model/userModel';
import { genratedpassword, userExist, tokenGenerate, insertByColNameAndValueAndTablename } from '../utils/users';
import { sendEmail } from '../utils/emailSend';
import pool from '../db/dbconn';




const generatedAccessToken = async (user: number): Promise<string> => {
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenKey) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    }
    const accessToken: string = tokenGenerate(accessTokenKey);
    const dataset: UserModel.User = await insertByColNameAndValueAndTablename('sessions', ['access_token', 'user_id'], [accessToken, user])
    if (!dataset) {
        throw new Error("Failed to insert session token.");
    }
    return accessToken;
};





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
                await pool.query(`UPDATE usersdata SET isCredentailsSend = $2 where id=$1;`, [dataset.id, true])
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
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Missing credentials. Please provide email and password.",
        });
    }

    try {
        const result = await UserModel.checkCredentails(email, password);
        console.log(result);

        if (result.success && result.user) {
            const accessTokenKey: string = await generatedAccessToken(result.user.id);
            // console.log(accessTokenKey);
            const option = {
                httpOnly: true,
                secure: true
            }
            return res.status(200).cookie("access-token", accessTokenKey, option).json({
                message: "Login successfullllllll",
                user: {
                    loginUser: result.user.id,
                    accessToken: accessTokenKey,
                }
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
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        res.status(400).json({ message: 'No token provided' });
        return;
    }

    try {
        const option = {
            httpOnly: true, // learn from youtube so that no third user can change or modified the cookies
            secure: true
        }
        await pool.query('DELETE FROM sessions WHERE access_token = $1', [token]);
        res.clearCookie('access-token', option);
        res.status(200).json({
            message: 'Logged out successfully'
        });
        return
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error during logout'
        });
        return
    }
};
