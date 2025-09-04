"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatLng = getLatLng;
const axios_1 = __importDefault(require("axios"));
async function getLatLng(address) {
    try {
        const apiKey = process.env.LOCATIONIQ_KEY;
        const url = `https://us1.locationiq.com/v1/search.php`;
        const res = await axios_1.default.get(url, {
            params: {
                key: apiKey,
                q: address,
                format: "json"
            }
        });
        if (res.data && res.data.length > 0) {
            return {
                lat: parseFloat(res.data[0].lat),
                lng: parseFloat(res.data[0].lon)
            };
        }
        return null;
    }
    catch (err) {
        console.error("LocationIQ geocoding failed:", err);
        return null;
    }
}
//# sourceMappingURL=getLocation.js.map