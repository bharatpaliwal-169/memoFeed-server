//imports 
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cluster from 'cluster';
import os from 'os';
import compression from 'compression';
import helmet from 'helmet';
//services
import limiter from './middleware/rateLimiter.js';
// import Mock from './services/CronJob/Mock.js';

//import routes here
import postRoutes from './routes/posts.js';
import authRoutes from './routes/auth.js';

//basic setups
const app = express();
app.use(helmet());
app.use(bodyParser.json({limit: "50mb",extended : true}));
app.use(bodyParser.urlencoded({limit: "50mb",extended : true}));
app.use(cors());
app.use(compression());
app.use(limiter);
dotenv.config()

//DB connection
const PORT = process.env.MY_PORT|| process.env.PORT;
const DB_SERVER_URL = process.env.DB_URL;

// Cluster setup
process.env.UV_THREADPOOL_SIZE = os.cpus().length;
const noOfCPUs = os.cpus().length;


if (cluster.isPrimary) {
  // primary cluster handles orther slave thread
  for (let i = 0; i < noOfCPUs; i++) {
    //cluster is making slave thread
    cluster.fork();
  }
  cluster.on('exit', (worker, code, signal) => {
    console.log(`worker ${worker.process.pid} died`);
    cluster.fork(); // if dead then remake a new thread
  });
}else{
  mongoose.connect(DB_SERVER_URL)
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));
  
  // here /posts is the prefix that we assign to the / route
  app.use('/posts',postRoutes);
  
  //authentication
  app.use('/auth',authRoutes);
  
  app.get('/',(req, res) => {
    res.send("APP is UP n RUNNING");
  });
}
