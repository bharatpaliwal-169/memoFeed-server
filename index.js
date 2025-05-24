//imports 
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import compression from 'compression';
import helmet from 'helmet';
import session from "express-session";
import ExpressMongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
//services
import limiter from './src/middleware/rateLimiter.js';
import logger from './src/services/Logger/index.js'
//import routes here
import postRoutes from './src/routes/posts.js';
import authRoutes from './src/routes/auth.js';

//basic setups
const app = express();
app.use(helmet());
app.use(express.json({limit: "50mb",extended : true}));
app.use(express.urlencoded({limit: "50mb",extended : true}));
app.use(cors());
app.use(cookieParser())
//test env
app.options('*',cors());

app.use(compression());
// app.use(xss());
app.use(ExpressMongoSanitize());
app.use(limiter);

dotenv.config()

app.use(session({
  secret: process.env.SECRET,resave:false,saveUninitialized:true
}))

//DB connection
const PORT = process.env.MY_PORT|| process.env.PORT;
const DB_SERVER_URL = process.env.DB_URL;

// Cluster setup
process.env.UV_THREADPOOL_SIZE = os.cpus().length;
const noOfCPUs = os.cpus().length;


if (cluster.isPrimary) {
  for (let i = 0; i < noOfCPUs; i++) {
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.info(`worker ${worker.process.pid} died`);
    cluster.fork();
  });
}else{

  mongoose.set("strictQuery",false);
  mongoose.connect(DB_SERVER_URL)
  .then(() => app.listen(PORT, () => console.info(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => logger.error(`${error} did not connect`));
  
  // here /feed is the prefix that we assign to the / route
  app.use('/feed',postRoutes);
  
  
  //authentication
  app.use('/auth',authRoutes);
  

  //defaults
  app.get('/',(req, res) => {
    res.send("APP is UP n RUNNING");
  });
  app.get('/*',(req,res)=> {
    res.send("Undefined endpoint!")
  });

}
