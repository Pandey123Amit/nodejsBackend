import { RequestHandler, Request,Response } from "express";
import pool from "../db/dbconn";
import { getLatLng } from '../utils/getLocation';
import { logger } from "../utils/logger";
import { Restaurant, RestaurantModel } from "../model/RestaurantsModel";
import { AuthenticatedRequest } from "../middlewares/auth.rolecheck";
import { DishModel } from "../model/DishModel";
import { AuthenticatedRequest as RoleCheckAuticatedRequest } from "../middlewares/auth.rolecheck";




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

export const addDish: RequestHandler = async (req: AuthenticatedRequest, res) => {
    const restaurantId = parseInt(req.params.restaurantId, 10);

    try {
        const { name, description, price, is_available } = req.body;
        const userId = req.user?.id;

        const restaurantinfo = await RestaurantModel.getById(restaurantId)
        // console.log(restaurantinfo?.owner_id);

        if (!restaurantId || !name || !price) {
            res.status(400).json({ message: "restaurantId, name, and price are required" });
            return;
        }
        if (restaurantinfo?.owner_id != userId) {
            res.status(403).json({ message: "This Resturant Owned By Someone Else" })
            return;
        }

        const dish = await DishModel.createDish({
            restaurant_id: restaurantId,
            name,
            description,
            price,
            is_available,
            created_by: userId!,
        });

        res.status(201).json({ message: "Dish created successfully", dish });
    } catch (err) {
        console.error("addDish error:", err);
        res.status(500).json({ message: "Something went wrong while creating dish", error: err });
    }
};

export const getAllDishesByResutaurants = async (
  req: RoleCheckAuticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id as number;
  const restaurantId = parseInt(req.params.restaurantId, 10);

  try {
    const rows = await RestaurantModel.getByOwnerId(userId);
  console.log(rows,"kwejhc");
  
    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: "No data found" });
      return;
    }
    const restaurant = {
      restaurant_name: rows[0].restaurant_name,
      restaurant_address: rows[0].restaurant_address,
      phone_number: rows[0].phone_number,
      dishes: rows
        .map(r => ({
          dish_name: r.dish_name,
          description: r.description,
          price: r.price
        }))
    };

    res.status(200).json({
      success: true,
      data: restaurant
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching data",
      error: error instanceof Error ? error.message : error
    });
  }
};





