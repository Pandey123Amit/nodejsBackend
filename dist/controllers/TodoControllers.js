"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTodo = exports.updateTodo = exports.addTodo = exports.getTodo = exports.getTodos = void 0;
const todoModel = __importStar(require("../model/TodoModel"));
const emailSend_1 = require("../utils/emailSend");
const dbconn_1 = __importDefault(require("../db/dbconn"));
const getTodos = async (req, res) => {
    const todos = await todoModel.getAllTodos();
    // send email for whose completed is false 
    res.json(todos);
};
exports.getTodos = getTodos;
const getTodo = async (req, res) => {
    const todo = await todoModel.getTodoById(Number(req.params.id));
    console.log(req.params.id);
    console.log(todo === null || todo === void 0 ? void 0 : todo.completed);
    if (!(todo === null || todo === void 0 ? void 0 : todo.completed)) {
        const isemail = await (0, emailSend_1.sendEmail)({
            from: process.env.SENDER_EMAIL,
            to: todo === null || todo === void 0 ? void 0 : todo.emailid,
            subject: 'Pending Todo',
            html: '<p>This is an Pending todo</p>'
        });
        if (isemail) {
            const query = `UPDATE todo SET isemailsend = $1 WHERE id = $2`;
            // console.log(tomail.id);
            await dbconn_1.default.query(query, [true, todo === null || todo === void 0 ? void 0 : todo.id]);
        }
    }
    console.log(todo);
    // console.log(isemail);
    if (!todo) {
        res.status(404).json({ message: 'Not found' });
        return;
    }
    res.json(todo);
    return;
};
exports.getTodo = getTodo;
const addTodo = async (req, res) => {
    console.log(req.body.title);
    const todo = await todoModel.createTodo(req.body.title, req.body.emailid);
    res.status(201).json(todo);
};
exports.addTodo = addTodo;
const updateTodo = async (req, res) => {
    const todo = await todoModel.updateTodo(Number(req.params.id), req.body.completed);
    if (!todo) {
        res.status(404).json({ message: 'Not found' });
        return;
    }
    else {
        try {
            const queryString = `select subject,body,emailid from emailcontent as t left join todo as emc on t.isupdated = emc.isupdated where emc.completed = true and emc.id = ${req.params.id};`;
            const queryResponse = await dbconn_1.default.query(queryString);
            const queryResponseData = queryResponse.rows[0];
            const checkforemail = await (0, emailSend_1.sendEmail)({
                from: process.env.SENDER_EMAIL,
                to: queryResponseData.emailid,
                subject: queryResponseData.subject,
                html: queryResponseData.body
            });
            if (checkforemail) {
                // console.log("Inside checkforemail:",checkforemail);
                const res = await dbconn_1.default.query('UPDATE todo SET isemailsend = true WHERE id = $1', [req.params.id]);
            }
            console.log(res);
            res.json(todo);
        }
        catch (err) {
            res.status(404).json({
                message: 'Something wrong in emailsending',
                statuscode: err
            });
        }
    }
};
exports.updateTodo = updateTodo;
const deleteTodo = async (req, res) => {
    const data = await todoModel.getTodoById(Number(req.params.id));
    // console.log(data?.emailid);
    const issuccess = await todoModel.deleteTodo(Number(req.params.id));
    if (issuccess) {
        // console.log(data);
        const queryForEmail = `SELECT * from emailcontent where isdeleted = 1`;
        const emailcontentquery = await dbconn_1.default.query(queryForEmail);
        const emailcontent = emailcontentquery.rows[0];
        const isemail = await (0, emailSend_1.sendEmail)({
            from: process.env.SENDER_EMAIL,
            to: data === null || data === void 0 ? void 0 : data.emailid,
            subject: emailcontent.subject,
            html: emailcontent.body
        });
    }
    res.status(204).send();
    return;
};
exports.deleteTodo = deleteTodo;
//# sourceMappingURL=TodoControllers.js.map