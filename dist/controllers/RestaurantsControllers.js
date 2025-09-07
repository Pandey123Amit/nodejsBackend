"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDish = exports.getAllDishesByResutaurants = exports.addDish = exports.createRestaurant = void 0;
const getLocation_1 = require("../utils/getLocation");
const logger_1 = require("../utils/logger");
const RestaurantsModel_1 = require("../model/RestaurantsModel");
const DishModel_1 = require("../model/DishModel");
const createRestaurant = async (req, res, next) => {
    var _a;
    const { name, address, city, state, country, postal_code, phone_number } = req.body;
    const owner_id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        if (!name || !owner_id) {
            return res.status(400).json({ message: "Restaurant name and user_id are required" });
        }
        const fullAddress = `${address}, ${city}, ${state}, ${country}, ${postal_code}`;
        const location = await (0, getLocation_1.getLatLng)(fullAddress);
        if (!location) {
            logger_1.logger.warn("createRestaurant: location not fetched");
            return res.status(400).json({ message: "Cannot fetch latitude/longitude for the given address" });
        }
        const dataset = await RestaurantsModel_1.RestaurantModel.createRestaurant({
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
    }
    catch (err) {
        logger_1.logger.error("createRestaurant error:", err);
        res.status(500).json({ message: "Something went wrong while creating restaurant", error: err });
    }
};
exports.createRestaurant = createRestaurant;
const addDish = async (req, res) => {
    var _a;
    const restaurantId = parseInt(req.params.restaurantId, 10);
    try {
        const { name, description, price, is_available } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        const restaurantinfo = await RestaurantsModel_1.RestaurantModel.getById(restaurantId);
        // console.log(restaurantinfo?.owner_id);
        if (!restaurantId || !name || !price) {
            res.status(400).json({ message: "restaurantId, name, and price are required" });
            return;
        }
        if ((restaurantinfo === null || restaurantinfo === void 0 ? void 0 : restaurantinfo.owner_id) != userId) {
            res.status(403).json({ message: "This Resturant Owned By Someone Else" });
            return;
        }
        const dish = await DishModel_1.DishModel.createDish({
            restaurant_id: restaurantId,
            name,
            description,
            price,
            is_available,
            created_by: userId,
        });
        res.status(201).json({ message: "Dish created successfully", dish });
    }
    catch (err) {
        console.error("addDish error:", err);
        res.status(500).json({ message: "Something went wrong while creating dish", error: err });
    }
};
exports.addDish = addDish;
const getAllDishesByResutaurants = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const restaurantId = parseInt(req.params.restaurantId, 10);
    try {
        const rows = await RestaurantsModel_1.RestaurantModel.getByOwnerId(userId);
        console.log(rows, "kwejhc");
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
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: "Something went wrong while fetching data",
            error: error instanceof Error ? error.message : error
        });
    }
};
exports.getAllDishesByResutaurants = getAllDishesByResutaurants;
const deleteDish = async (req, res) => {
    var _a;
    const dishId = parseInt(req.params.dishId, 10);
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    try {
        const success = await DishModel_1.DishModel.delete(dishId, userId);
        if (!success) {
            res.status(403).json({ message: "You are not authorized to delete this dish" });
            return;
        }
        res.status(200).json({ message: "Dish deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Error deleting dish", error });
    }
    return;
};
exports.deleteDish = deleteDish;
//# sourceMappingURL=RestaurantsControllers.js.map