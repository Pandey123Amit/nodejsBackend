import { Request, Response } from 'express';
import * as todoModel from '../model/todoModel';
import { sendEmail } from '../utils/emailSend';
import pool from '../db/dbconn';

interface content {
  template_name: string,
  subject: string,
  body: string,
  isupdated: number
  isedited: number
  isupdate: number
}



export const getTodos = async (req: Request, res: Response) => {
  const todos = await todoModel.getAllTodos();
  // send email for whose completed is false 

  res.json(todos);

};

export const getTodo = async (req: Request, res: Response) => {
  const todo = await todoModel.getTodoById(Number(req.params.id));
  console.log(req.params.id);

  console.log(todo?.completed);
  if (!todo?.completed) {
    const isemail: boolean = await sendEmail({
      from: process.env.SENDER_EMAIL,
      to: todo?.emailId,
      subject: 'Pending Todo',
      html: '<p>This is an Pending todo</p>'
    });
    if (isemail) {
      const query: string = `UPDATE todo SET isemailsend = $1 WHERE id = $2`
      await pool.query(query, [true, todo?.id])
    }
  }
  console.log(todo);

  if (!todo) {
    res.status(404).json({ message: 'Not found' });
    return
  }
  res.json(todo);
  return 


};

export const addTodo = async (req: Request, res: Response) => {
  console.log(req.body.title);
  const todo = await todoModel.createTodo(req.body.title, req.body.emailId);
  res.status(201).json(todo);
};

export const updateTodo = async (req: Request, res: Response) => {

  const todo = await todoModel.updateTodo(Number(req.params.id), req.body.completed);
  if (!todo) {
     res.status(404).json({ message: 'Not found' })
     return
  } else {
    try {
      const queryString: string = `select subject,body,emailid from emailcontent as t left join todo as emc on t.isupdated = emc.isupdated where emc.completed = true and emc.id = ${req.params.id};`
      const queryResponse = await pool.query(queryString)
      const queryResponseData: todoModel.Todo & content = queryResponse.rows[0]
      const checkforemail: boolean = await sendEmail({
        from: process.env.SENDER_EMAIL,
        to: queryResponseData.emailId,
        subject: queryResponseData.subject,
        html: queryResponseData.body
      });
      if (checkforemail) {
        // console.log("Inside checkforemail:",checkforemail);

        const res = await pool.query(
          'UPDATE todo SET isemailsend = true WHERE id = $1', [req.params.id]);
      }
      console.log(res);

      res.json(todo);
    } catch (err) {
      res.status(404).json({
        message: 'Something wrong in emailsending',
        statuscode: err
      })
    }
  }
};

export const deleteTodo = async (req: Request, res: Response) => {
  const data = await todoModel.getTodoById(Number(req.params.id));
  const issuccess: boolean = await todoModel.deleteTodo(Number(req.params.id));
  if (issuccess) {
    const queryForEmail: string = `SELECT * from emailcontent where isdeleted = 1`
    const emailcontentquery = await pool.query(queryForEmail)
    const emailcontent: content = emailcontentquery.rows[0]
    const isemail: boolean = await sendEmail({
      from: process.env.SENDER_EMAIL,
      to: data?.emailId,
      subject: emailcontent.subject,
      html: emailcontent.body
    });
  }


  res.status(204).send();
  return
};
