import express from 'express';


// all routes and mapping are done here 

// // here it will work on http://localhost:5000/posts
// const router = express.Router();
// router.get('/', (req,res) => { // basic callback function that will get executes when someone hits / route
//   res.send("This is working");
// })

// export default router;


import {getPosts,createPost,getPostsBySearch,
  updatePost,deletePost,likePost,getPost,commentPost,
  getStatsForUser
} from '../controllers/posts.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/search',getPostsBySearch); 
router.get('/:id', getPost);
router.get('/stats/:id',getStatsForUser);

//need authentication
router.post('/',auth,createPost);
router.patch('/:id',auth,updatePost); // dynamic id
router.delete('/:id',auth,deletePost);
router.patch('/:id/likePost',auth,likePost);
router.post('/:id/commentPost',auth,commentPost);

export default router;

// we will use this structure to provide better code read.