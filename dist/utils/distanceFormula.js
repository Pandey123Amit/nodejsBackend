"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.haversineformula = void 0;
const haversineformula = (lat1, lon1, lat2, lon2) => {
    const toRad = (d) => (d * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};
exports.haversineformula = haversineformula;
// const distance = haversine(28.599230, 77.010053, 22.687581, 79.370366);
// console.log(distance.toFixed(2), "km");
//# sourceMappingURL=distanceFormula.js.map