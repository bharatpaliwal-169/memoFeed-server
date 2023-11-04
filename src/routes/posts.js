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
import logMid from '../middleware/logMiddleware.js';

const router = express.Router();

router.get('/',logMid, getPosts);
router.get('/search',logMid,getPostsBySearch); 
router.get('/:id',logMid, getPost);
router.get('/stats/:id',logMid,getStatsForUser);

//need authentication
router.post('/',auth,logMid,createPost);
router.patch('/:id',auth,logMid,updatePost); // dynamic id
router.delete('/:id',auth,logMid,deletePost);
router.patch('/:id/likePost',logMid,auth,likePost);
router.post('/:id/commentPost',auth,logMid,commentPost);

export default router;

// we will use this structure to provide better code read.