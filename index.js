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
const DB_URL = "mongodb+srv://bharat:bharat@cluster0.rn9h4.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const PORT = process.env.PORT || 5000;

mongoose.connect(DB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(PORT, () => console.log(`Server Running on Port: http://localhost:${PORT}`)))
  .catch((error) => console.log(`${error} did not connect`));

  //this line crashes the code : issue
// mongoose.set('useFindAndModify', false);


// here /posts is the prefix that we assign to the / route
app.use('/posts',postRoutes);