import { Request, Response, NextFunction, RequestHandler } from "express";
import * as UserModel from '../model/userModel';
import {  userExist, tokenGenerate, insertByColNameAndValueAndTablename, genratedpassword } from '../utils/users';
import { sendEmail } from '../utils/emailSend';
import pool from '../db/dbconn';
import { getLatLng } from '../utils/getLocation';
import { logger } from "../utils/logger";
import { Role } from "../constant";
import { RestaurantModel } from "../model/restaurantsModel";
import { AuthenticatedRequest } from "../middlewares/auth.middelwarePermission";
import { haversineformula } from "../utils/distanceFormula";
import { AuthenticatedRequest as RoleCheckAuticatedRequest } from "../middlewares/auth.rolecheck";
// import { Kafka } from "kafkajs";
// const kafka = new Kafka({ clientId: "rms-app", brokers: ["localhost:9092"] });
// const producer = kafka.producer();








const generatedAccessToken = async (user: number): Promise<string> => {
    const accessTokenKey = process.env.ACCESS_TOKEN_SECRET;
    if (!accessTokenKey) {
        throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables.");
    }
    const accessToken: string = tokenGenerate(accessTokenKey);
    const dataset: UserModel.User = await insertByColNameAndValueAndTablename('sessions', ['session_token', 'user_id'], [accessToken, user])
    if (!dataset) {
        throw new Error("Failed to insert session token.");
    }
    return accessToken;
};



export const registerUser: RequestHandler = async (req, res, next): Promise<any> => {
    const { Fname, Lname, phonenumber, email, addLine1, addLine2, city, state, country, postalCode, usertype } = req.body;
    if (!(usertype === Role.Admin || usertype === Role.SubAdmin || usertype === Role.User)) {
        res.status(400).json({ message: "Usertype not match" });
        return;
    }

    try {
        if (!email) {
            logger.debug("registerUser: Email is required")
            res.status(400).json({ message: "Email is required" });
            return;
        }

        const isUserExist: boolean = await userExist(email);
        if (isUserExist) {
            logger.debug("registerUser: User with this email already exists")
            res.status(400).json({ message: "User with this email already exists" });
            return;
        }

        const password: string[] = await genratedpassword();
        const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password[0], usertype);
        const check = await insertByColNameAndValueAndTablename(
            'user_roles',
            ['user_id', 'role'],
            [dataset.id, usertype]
        );

        let isEmailSent: boolean = false;
        if (dataset) {
            isEmailSent = await sendEmail({
                from: process.env.SENDER_EMAIL,
                to: dataset.email,
                subject: 'Login Credentials',
                html: `<h3>Welcome, ${Fname} ${Lname}!</h3>
                       <p>Your account has been successfully created.</p>
                       <p><strong>Login Details:</strong></p>
                       <ul>
                         <li><strong>User ID:</strong> ${dataset.id}</li>
                         <li><strong>Email:</strong> ${dataset.email}</li>
                         <li><strong>Password:</strong> ${password[1]}</li>
                       </ul>
                       <p>Use these credentials to log in to the system.</p>`,
            });
        }

        const addressLine = addLine1 + " " + addLine2;
        const prepareData: string = `${addressLine}, ${city}, ${state}, ${country}, ${postalCode}`;
        const location = await getLatLng(prepareData);

        if (!location) {
            logger.warn("registerUser: location not fetched");
            res.status(400).json({ message: "Cannot fetch latitude/longitude for the given address" });
            return;
        }

        const datasetAddress: UserModel.Address = await insertByColNameAndValueAndTablename(
            'addresses',
            ['user_id', 'address_line', 'city', 'state', 'country', 'postal_code', 'latitude', 'longitude'],
            [dataset.id, addressLine, city, state, country, postalCode, location.lat, location.lng]
        );

        if (isEmailSent && datasetAddress) {
            await pool.query(`UPDATE usersdata SET iscredentialssend = $2 WHERE id=$1;`, [dataset.id, true]);
            logger.info(`registerUser: Email sent to ${dataset.email}`);
            res.status(201).json({
                email: dataset.email,
                username: dataset.username,
                message: "Please check Email for login Credentials"
            });
            return;
        }

    } catch (err) {
        logger.error("registerUser:", err);
        res.status(500).json({ message: "Something went wrong during signup", error: err });
    }
};


export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { email, password } = req.body;
    // await producer.connect();
    if (!email || !password) {
        return res.status(400).json({
            message: "Missing credentials. Please provide email and password.",
        });
    }

    try {
        const result = await UserModel.checkCredentails(email, password);
        console.log(result);
        // await producer.send({
        //     topic: "subadmin_login01",
        //     messages: [{ value: JSON.stringify({ event: "subadmin_login", email: "test@subadmin.com", time: new Date().toISOString() }) }],
        // });


        if (result.success && result.user) {
            const accessTokenKey: string = await generatedAccessToken(result.user.id);
            // console.log(accessTokenKey);
            const option = {
                httpOnly: true,
                secure: true
            }
            return res.status(200).cookie("token", accessTokenKey, option).json({
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
        console.log("err")
        return res.status(500).json({
            message: "Something went wrong",
            error: err,
        });
    }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
    const authHeader = req.headers['authorization'];
    const token: string = authHeader as string

    if (!token) {
        res.status(400).json({ message: 'No token provided' });
        return;
    }

    try {
        const option = {
            httpOnly: true, // learn from youtube so that no third user can change or modified the cookies
            secure: true
        }
        await pool.query('DELETE FROM sessions WHERE session_token = $1', [token]);
        res.clearCookie('token', option);
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


export const registerSubAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { Fname, Lname, email, phonenumber, addLine1, addLine2, city, state, country, postalCode, permission } = req.body;
    let isEmailSent: boolean = false;

    try {
        if (!email) {
            logger.debug("registerSubAdmin: Email is required");
            res.status(400).json({ message: "Email is required" });
            return;
        }

        const isUserExist = await userExist(email);
        if (isUserExist) {
            logger.debug("registerSubAdmin: User with this email already exists");
            res.status(400).json({ message: "User with this email already exists" });
            return;
        }

        const password =await genratedpassword();
        const dataset = await UserModel.register(Fname, Lname, email, phonenumber, password[0], permission.length > 0 ? Role.SubAdmin : Role.User);


        const roleId = await insertByColNameAndValueAndTablename('user_roles', ['user_id', 'role'], [dataset.id, Role.SubAdmin]) as { id: number };

        for (const value of permission) {
            await insertByColNameAndValueAndTablename(
                'role_permissions',
                ['role_id', 'permission_id'],
                [roleId.id, value]
            );
        }

        isEmailSent = await sendEmail({
            from: process.env.SENDER_EMAIL,
            to: dataset.email,
            subject: 'Sub-admin Account Created',
            html: `<h3>Welcome, ${Fname} ${Lname}!</h3>
                   <p>Your sub-admin account has been created.</p>
                   <p>Email: ${dataset.email}</p>
                   <p>Password: ${password[1]}</p>`
        });

        if (isEmailSent) {
            await pool.query(`UPDATE usersdata SET iscredentialssend = $2 WHERE id=$1;`, [dataset.id, true]);
            logger.info(`registerUser: Email sent to ${dataset.email}`);
            res.status(201).json({
                email: dataset.email,
                username: dataset.username,
                message: "Please check Email for login Credentials"
            });
            return;
        }

        if (addLine1 || addLine2) {
            const addressLine = `${addLine1 || ''} ${addLine2 || ''}`.trim();
            const fullAddress = `${addressLine}, ${city}, ${state}, ${country}, ${postalCode}`;
            const location = await getLatLng(fullAddress);

            if (location) {
                await insertByColNameAndValueAndTablename(
                    'addresses',
                    ['userId', 'addressLine', 'city', 'state', 'country', 'postalCode', 'latitude', 'longitude'],
                    [dataset.id, addressLine, city, state, country, postalCode, location.lat, location.lng]
                );
            } else {
                logger.warn(`registerSubAdmin: Could not fetch location for address of user ${dataset.id}`);
            }
        }

        logger.info(`registerSubAdmin: Sub-admin created ${dataset.email}`);
        res.status(201).json({ message: "Sub-admin registered successfully", email: dataset.email });
    } catch (err) {
        logger.error("registerSubAdmin error:", err);
        res.status(500).json({ message: "Something went wrong", error: err });
    }
};

export const getAllRestaurants = async (req: RoleCheckAuticatedRequest, res: Response): Promise<void> => {
    const userId = req.user?.id as number;
    const rolecheck = req?.user?.roles[0] as string;
    try {
        const dataset = await RestaurantModel.getAll()
        const userinfo = await UserModel.findById(userId);

        if (!userinfo) {
            res.status(404).json({ success: false, message: "User not found" });
            return;
        }
        if (rolecheck === Role.User) {
            const userLat = userinfo.latitude as number;
            const userLng = userinfo.longitude as number;
            const restaurantsWithDistance = dataset.map((restaurant: any) => ({
                ...restaurant,
                distance_km: haversineformula(userLat, userLng, Number(restaurant.latitude), Number(restaurant.longitude)).toFixed(2)
            }));
            res.status(200).json({
                success: true,
                message: "All Restaurants with distance from user location",
                data: {
                    user: userinfo,
                    restaurants: restaurantsWithDistance
                }
            });
            return
        } else {
            res.status(200).json({
                success: true,
                message: "All Restaurants",
                data: {
                    user: userinfo,
                    restaurants: dataset
                }
            });
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching data",
            error: error instanceof Error ? error.message : error,
        });
    }
};


export const getAllSubAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const result = await UserModel.getAllSubAdmin()

        res.status(200).json({
            success: true,
            subAdmins: result
        });
    } catch (error) {
        console.error('getAllSubAdmins error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch sub-admins',
            error: error instanceof Error ? error.message : error
        });
    }
};





