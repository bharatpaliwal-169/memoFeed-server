//imports 
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import webpush from 'web-push';
//import routes here
import postRoutes from './routes/posts.js';
import notify from './routes/notify.js'
import authRoutes from './routes/auth.js';
//basic setups
const app = express();
app.use(bodyParser.json({limit: "50mb",extended : true}));
app.use(bodyParser.urlencoded({limit: "50mb",extended : true}));
app.use(cors());
dotenv.config()
//DB connection
const PORT = process.env.PORT;
const DB_SERVER_URL = process.env.DB_URL;

mongoose.connect(DB_SERVER_URL)
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

// here /posts is the prefix that we assign to the / route
app.use('/posts',postRoutes);

//authentication
app.use('/auth',authRoutes);

//notification
const publicVapidKey = process.env.PUBLIC_KEY;
const privateVapidKey = process.env.PRIVATE_KEY;

webpush.setVapidDetails(`mailto:${process.env.EMAIL_ID}`,publicVapidKey,privateVapidKey);
app.use("/subscribe",notify);