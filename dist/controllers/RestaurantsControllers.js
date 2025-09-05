"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRestaurant = void 0;
const getLocation_1 = require("../utils/getLocation");
const logger_1 = require("../utils/logger");
const RestaurantsModel_1 = require("../model/RestaurantsModel");
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
//# sourceMappingURL=RestaurantsControllers.js.map