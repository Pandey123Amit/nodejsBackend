"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const dbconn_1 = require("./db/dbconn");
const TodoRoutes_1 = __importDefault(require("./routes/TodoRoutes"));
const UserRoutes_1 = __importDefault(require("./routes/UserRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_1.default.json());
app.use('/api/todos', TodoRoutes_1.default);
app.use('/api/users', UserRoutes_1.default);
// Test DB connection, then start the server
(0, dbconn_1.testDBConnection)()
    .then(() => {
    app.listen(port, () => {
        console.log(`Server started at http://localhost:${port}`);
    });
})
    .catch((err) => {
    console.log(`Something Worng in main file in db connection ${err}`);
});
// const startServer = async () => {
//   try {
//     await testDBConnection();
//     app.listen(port, () => {
//       console.log(`Server started at http://localhost:${port}`);
//     });
//   } catch (err) {
//     console.error('Failed to connect to DB:', err);
//   }
// };
// startServer();
// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello from Expresssss + PostgreSQLLLLLL!');
});
// startServer();
// import express from 'express';
// import dotenv from 'dotenv';
// import cors from 'cors';
// import todoRoutes from './routes/TodoRoutes';
// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 3000;
// app.use(cors());
// app.use(express.json());
// app.use('/api/todos', todoRoutes);
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });
//# sourceMappingURL=main.js.map