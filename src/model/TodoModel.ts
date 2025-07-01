import pool from '../db/dbconn';

export interface Todo {
  id: number;
  title: string;
  createdat : Date;
  altertime : Date;
  completed: boolean;
  emailid : string;
}

export const getAllTodos = async (): Promise<Todo[]> => {
  const res = await pool.query('SELECT * FROM todo');
  return res.rows;
};

export const getTodoById = async (id: number): Promise<Todo | null> => {
  console.log(id);
  
  const res = await pool.query('SELECT * FROM todo WHERE id = $1', [id]);
  console.log(res.rows[0]);
  
  return res.rows[0] || null;
};

export const createTodo = async (title: string,email:string): Promise<Todo> => {
  const res = await pool.query(
    'INSERT INTO todo (title, completed,emailid) VALUES ($1, false,$2) RETURNING *',
    [title,email]
  );
  return res.rows[0];
};

export const updateTodo = async (id: number, completed: boolean): Promise<Todo | null> => {
   const query = `UPDATE todo SET completed = $1,
        isupdated = 1 WHERE id = $2 RETURNING *;`;

  const res = await pool.query(query,[completed, id]);
  return res.rows[0] || null;
};

export const deleteTodo = async (id: number): Promise<boolean | any> => {
   const isdelete = await pool.query('DELETE FROM todo WHERE id = $1', [id]);
  // console.log(typeof isdelete.rows.length);
   if(isdelete.rows.length == 0){
    return true
   }

};
