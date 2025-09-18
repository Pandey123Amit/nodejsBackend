import pool from '../db/dbconn';

export interface Todo {
  id: number;
  title: string;
  createdAt: Date;
  alterTime: Date;
  completed: boolean;
  emailId: string;
}

export const getAllTodos = async (): Promise<Todo[]> => {
  const res = await pool.query('SELECT * FROM todo');
  return res.rows.map(row => ({
    ...row,
    createdAt: row.createdat,
    alterTime: row.altertime,
    emailId: row.emailid
  }));
};

export const getTodoById = async (id: number): Promise<Todo | null> => {
  console.log(id);
  const res = await pool.query('SELECT * FROM todo WHERE id = $1', [id]);
  const row = res.rows[0];
  if (!row) return null;
  return {
    ...row,
    createdAt: row.createdat,
    alterTime: row.altertime,
    emailId: row.emailid
  };
};

export const createTodo = async (title: string, email: string): Promise<Todo> => {
  const res = await pool.query(
    'INSERT INTO todo (title, completed, emailid) VALUES ($1, false, $2) RETURNING *',
    [title, email]
  );
  const row = res.rows[0];
  return {
    ...row,
    createdAt: row.createdat,
    alterTime: row.altertime,
    emailId: row.emailid
  };
};

export const updateTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
  const query = `UPDATE todo SET completed = $1, isupdated = 1 WHERE id = $2 RETURNING *;`;
  const res = await pool.query(query, [completed, id]);
  const row = res.rows[0];
  if (!row) return null;
  return {
    ...row,
    createdAt: row.createdat,
    alterTime: row.altertime,
    emailId: row.emailid
  };
};

export const deleteTodo = async (id: number): Promise<boolean | any> => {
   const isdelete = await pool.query('DELETE FROM todo WHERE id = $1', [id]);
  // console.log(typeof isdelete.rows.length);
   if(isdelete.rows.length == 0){
    return true
   }

};
