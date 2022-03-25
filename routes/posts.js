import express from 'express';


// all routes and mapping are done here 

// // here it will work on http://localhost:5000/posts
// const router = express.Router();
// router.get('/', (req,res) => { // basic callback function that will get executes when someone hits / route
//   res.send("This is working");
// })

// export default router;


import {getPosts,createPost} from '../controllers/posts.js';
const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);

export default router;

// we will use this structure to provide better code read.