import express from 'express';


// all routes and mapping are done here 

// // here it will work on http://localhost:5000/posts
// const router = express.Router();
// router.get('/', (req,res) => { // basic callback function that will get executes when someone hits / route
//   res.send("This is working");
// })

// export default router;


import {getPosts,createPost,
  updatePost,deletePost,likePost
} from '../controllers/posts.js';
const router = express.Router();

router.get('/', getPosts);
router.post('/', createPost);
router.patch('/:id', updatePost); // dynamic id
router.delete('/:id', deletePost);
router.patch('/:id/likePost', likePost); 
export default router;

// we will use this structure to provide better code read.