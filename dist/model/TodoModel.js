"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.createTodo = exports.getTodoById = exports.getAllTodos = void 0;
const dbconn_1 = __importDefault(require("../db/dbconn"));
const getAllTodos = async () => {
    const res = await dbconn_1.default.query('SELECT * FROM todo');
    return res.rows;
};
exports.getAllTodos = getAllTodos;
const getTodoById = async (id) => {
    console.log(id);
    const res = await dbconn_1.default.query('SELECT * FROM todo WHERE id = $1', [id]);
    console.log(res.rows[0]);
    return res.rows[0] || null;
};
exports.getTodoById = getTodoById;
const createTodo = async (title, email) => {
    const res = await dbconn_1.default.query('INSERT INTO todo (title, completed,emailid) VALUES ($1, false,$2) RETURNING *', [title, email]);
    return res.rows[0];
};
exports.createTodo = createTodo;
const updateTodo = async (id, completed) => {
    const query = `UPDATE todo SET completed = $1,
        isupdated = 1 WHERE id = $2 RETURNING *;`;
    const res = await dbconn_1.default.query(query, [completed, id]);
    return res.rows[0] || null;
};
exports.updateTodo = updateTodo;
const deleteTodo = async (id) => {
    const isdelete = await dbconn_1.default.query('DELETE FROM todo WHERE id = $1', [id]);
    // console.log(typeof isdelete.rows.length);
    if (isdelete.rows.length == 0) {
        return true;
    }
};
exports.deleteTodo = deleteTodo;
//# sourceMappingURL=TodoModel.js.map