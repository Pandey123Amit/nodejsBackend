"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));
app.use(express_1.default.json({ limit: "20kb" })); // for limit of json as per doc
app.use(express_1.default.urlencoded({ extended: true, limit: "20kb" }));
app.use(express_1.default.static("public"));
//# sourceMappingURL=app.js.map