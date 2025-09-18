import { RequestHandler, Request, Response } from "express";
import pool from "../db/dbconn";
import { getLatLng } from '../utils/getLocation';
import { logger } from "../utils/logger";
import { Restaurant, RestaurantModel } from "../model/restaurantsModel";
import { AuthenticatedRequest } from "../middlewares/auth.rolecheck";
import { DishModel } from "../model/dishModel";
import { AuthenticatedRequest as RoleCheckAuticatedRequest } from "../middlewares/auth.rolecheck";
import { Role } from "../constant";




export const createRestaurant: RequestHandler = async (req, res, next): Promise<any> => {
  const { name, address, city, state, country, postalCode, phoneNumber } = req.body;
  const ownerId: number | undefined = (req as any).user?.id;
  try {
    if (!name || !ownerId) {
      return res.status(400).json({ message: "Restaurant name and userId are required" });
    }

  const fullAddress = `${address}, ${city}, ${state}, ${country}, ${postalCode}`;
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
      postalCode,
      phoneNumber,
      latitude: location.lat,
      longitude: location.lng,
      ownerId
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
  const { name, description, price, isAvailable } = req.body;
    const userId = req.user?.id;

  const restaurantInfo = await RestaurantModel.getById(restaurantId)
    // console.log(restaurantInfo?.ownerId);

    if (!restaurantId || !name || !price) {
      res.status(400).json({ message: "restaurantId, name, and price are required" });
      return;
    }
  if (restaurantInfo?.ownerId != userId) {
      res.status(403).json({ message: "This Restaurant Owned By Someone Else" })
      return;
    }

    const dish = await DishModel.createDish({
      restaurantId: restaurantId,
      name,
      description,
      price,
      isAvailable,
      createdBy: userId!,
    });

    res.status(201).json({ message: "Dish created successfully", dish });
  } catch (err) {
    console.error("addDish error:", err);
    res.status(500).json({ message: "Something went wrong while creating dish", error: err });
  }
};

export const getAllDishesByRestaurants = async (
  req: RoleCheckAuticatedRequest,
  res: Response
): Promise<void> => {
  const userId = req.user?.id as number;
  const roleType = req.user?.roles[0] as string;

  try {
    const rows = await RestaurantModel.getByOwnerId(userId, roleType);

    if (!rows || rows.length === 0) {
      res.status(404).json({ success: false, message: "No data found" });
      return;
    }


    // Group by restaurant
    const restaurantMap: Record<string, any> = {};

    rows.forEach(row => {
      const key = `${row.restaurantName}|${row.restaurantAddress}|${row.phoneNumber}`;

      if (!restaurantMap[key]) {
        restaurantMap[key] = {
          restaurantName: row.restaurantName,
          restaurantAddress: row.restaurantAddress,
          phoneNumber: row.phoneNumber,
          dishes: []
        };
      }

      if (row.dishName) {
        restaurantMap[key].dishes.push({
          dishName: row.dishName,
          description: row.description,
          price: row.price
        });
      }
    });

    const restaurantList = Object.values(restaurantMap);

    res.status(200).json({
      success: true,
      data: restaurantList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong while fetching data",
      error: error instanceof Error ? error.message : error
    });
  }
};


export const deleteDish: RequestHandler = async (req, res): Promise<void> => {
  const dishId = parseInt(req.params.dishId, 10);
  const userId = (req as any).user?.role === Role.Admin ? "" : (req as any).user?.id;

  try {
  const success = await DishModel.delete(dishId, userId);

    if (!success) {
      res.status(403).json({ message: "You are not authorized to delete this dish" });
      return;
    }

    res.status(200).json({ message: "Dish deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting dish", error });
  }
  return;
};

export const updateDish: RequestHandler = async (req, res): Promise<void> => {
  const dishId = parseInt(req.params.dishId, 10);
  const { name, description, price, isAvailable } = req.body;
  const userRole = (req as any).user?.role;
  const userId = (req as any).user?.id;

  if (!name && !description && !price && typeof isAvailable === 'undefined') {
    res.status(400).json({ message: "At least one field (name, description, price, isAvailable) must be provided for update" });
    return;
  }

  try {
  const updatedFields: Partial<{ name: string; description: string; price: number; isAvailable: boolean; createdBy: number }> = {};
  if (name) updatedFields.name = name;
  if (description) updatedFields.description = description;
  if (price !== undefined) updatedFields.price = price;
  if (typeof isAvailable === 'boolean') updatedFields.isAvailable = isAvailable;

  const updatedDish = await DishModel.update(dishId, updatedFields, userRole === Role.Admin ? undefined : userId);

    if (!updatedDish) {
      res.status(403).json({ message: "You are not authorized to update this dish" });
      return;
    }

    res.status(200).json({
      message: "Dish updated successfully",
      dish: updatedDish
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating dish",
      error: error instanceof Error ? error.message : error
    });
  }
};






