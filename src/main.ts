import express from 'express';
import dotenv from 'dotenv';
import pool, { testDBConnection } from './db/dbconn';
import todoRoutes from './routes/TodoRoutes';
import UserRoutes from "./routes/UserRoutes"
import cookieParser from 'cookie-parser'; 
import  RestaurantsRoutes  from './routes/RestaurantsRoutes';
import  DishesRoutes  from './routes/DishesRoutes';




dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser()); 
app.use('/api/todos', todoRoutes);
app.use('/api/users',UserRoutes);
app.use('/api/restaurants',RestaurantsRoutes)
app.use('/api/dishes',DishesRoutes)


// Test DB connection, then start the server
testDBConnection()
.then(()=>{
    app.listen(port,()=>{
      console.log(`Server started at http://localhost:${port}`);
    })
})
.catch((err) =>{
        console.log(`Something Worng in main file in db connection ${err}`)

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

