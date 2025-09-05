import { RequestHandler, Request } from "express";
import pool from "../db/dbconn";
import { getLatLng } from '../utils/getLocation';
import { logger } from "../utils/logger";
import { Restaurant, RestaurantModel } from "../model/RestaurantsModel";
import { AuthenticatedRequest } from "../middlewares/auth.rolecheck";



export const createRestaurant: RequestHandler = async (req, res, next): Promise<any> => {
    const { name, address, city, state, country, postal_code, phone_number } = req.body;
    const owner_id: number | undefined = (req as any).user?.id;
    try {
        if (!name || !owner_id) {
            return res.status(400).json({ message: "Restaurant name and user_id are required" });
        }

        const fullAddress = `${address}, ${city}, ${state}, ${country}, ${postal_code}`;
        const location = await getLatLng(fullAddress);

        if (!location) {
            logger.warn("createRestaurant: location not fetched");
            return res.status(400).json({ message: "Cannot fetch latitude/longitude for the given address" });
        }

        const dataset: Restaurant = await RestaurantModel.createRestaurant({
            name,
            address,
            city,
            state,
            country,
            postal_code,
            phone_number,
            latitude: location.lat,
            longitude: location.lng,
            owner_id
        });

        res.status(201).json({
            message: "Restaurant created successfully",
            restaurant: dataset
        });
    } catch (err) {
        logger.error("createRestaurant error:", err);
        res.status(500).json({ message: "Something went wrong while creating restaurant", error: err });
    }
};
