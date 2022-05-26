//imports 
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';


//import routes here
import postRoutes from './routes/posts.js';


//basic setups
const app = express();
app.use(bodyParser.json({limit: "50mb",extended : true}));
app.use(bodyParser.urlencoded({limit: "50mb",extended : true}));
app.use(cors());

//DB connection
const DB_URL = "mongodb+srv://bharatpaliwal:bharat1234@cluster0.qxt0c.mongodb.net/?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose.connect(DB_URL)
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

// here /posts is the prefix that we assign to the / route
app.use('/posts',postRoutes);