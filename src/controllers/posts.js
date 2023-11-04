import mongoose from 'mongoose'
import express from "express"

import PostMessage from '../models/postMessage.js';
import client from '../services/Cache/redis.js'

import logger from '../services/Logger/index.js'

const router = express.Router()

// application logic is written here
var flag = false;

export const getPosts = async (req,res) => {

  const cacheKey = (process.env.CACHE_KEY).toString();
  const {page} = req.query;
  try {
    //pagination
    const LIMIT = 6; // max no of post on one page
    const startIndex = (Number(page)-1)*LIMIT; // get starting page of each page 
    const total = await PostMessage.countDocuments({});

    // Caching
    try {

      if(flag == false && page==1){
        
        const cachedData = client.get(cacheKey);
        if(cachedData === null || cachedData === undefined || cachedData === ""){
          logger.info("[controllers/getPosts] nothing in cache!!");
        }else{
          logger.info("[controllers/getPosts] Sending data from cache!");
          return res.status(200).json({data : JSON.parse(cachedData), currentPage: Number(page),NumberOfPages: Math.ceil(total/LIMIT)});
        }
      }
      
      logger.info("[controllers/getPosts] Fetching data from DB");
      //FetchFromDB
      const posts = await PostMessage.find().sort({_id:-1}).limit(LIMIT).skip(startIndex);
      if(page==1){
        client.set(cacheKey, JSON.stringify(posts));
      }
      
      flag = false;
      // logger.info(posts);
      res.status(200).json({data : posts,currentPage: Number(page),NumberOfPages: Math.ceil(total/LIMIT)});
    
    } catch (error) {
      logger.error("[controllers/getPosts] ERROR : " + error.toString());
    }
  } catch (error) {
    logger.error("[controllers/getPosts] ERROR");
    res.status(404).json({message: "Something went wrong"});
  }
};

// query /posts?page=1 -> to get data from DB 
//params /posts/:id (id===12332) -> to get some specific resource

export const getPostsBySearch = async (req, res) => {
  logger.info("[controllers/getPostsBySearch] Started");
  const {searchQuery,tags} = req.query;
  
  try {
    const title = new RegExp(searchQuery, 'i'); // all will be same -> TEST,Test,TEst,test anything
    const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});
    res.status(200).json({data:posts});
    
  } catch (error) {
    res.status(404).json({message: error.message});
  }
  logger.info("[controllers/getPostsBySearch] Ended Successfully.");
}


//details page for each post
export const getPost = async (req, res) => { 
  const { id } = req.params;
  try {
      const post = await PostMessage.findById(id);
      post.viewCount++;
      await PostMessage.findByIdAndUpdate(id,post,{new : true});
      res.status(200).json(post);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}


export const createPost = async(req, res) => {
  
  const post = req.body;
  const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString()});
  try {
    if(post.title.length > 30 || post.message.length > 5000 || post.tags.length > 10){
      console.warn("invalid data in post")
      res.status(400).json({message : "Post data is invalid"})
    }
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
  flag = true;
}

export const updatePost = async(req, res) => {
  // const {id: _id } = req.params; //during the destruct we can remane the variable
  // const updatedpost = req.body; // updated version of post is comming from frontend.
  // if( !mongoose.Types.ObjectId.isValid(_id)) {
  //   return res.status(404).send('No post with that Id!');
  // }
  // await PostMessage.findByIdAndUpdate(id , updatedpost, {new : true});
  // res.json(updatedPost)
  const cacheKey = (process.env.CACHE_KEY).toString();
  const { id } = req.params;
  const { title, message, creator, selectedFile, tags } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });
    
      client.del(cacheKey)
  
      res.status(200).json({message:`Post updated successfully ${updatedPost}`});
    } catch (error) {
      logger.info("ERROR in updatePost fn "+ error.toString());
      res.status(500).json({message : " Something went wrong "});

    }
    flag = true;
}

export const deletePost = async (req, res) =>{
  const cacheKey = (process.env.CACHE_KEY).toString();
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    await PostMessage.findByIdAndRemove(id);
    
    client.del(cacheKey);
    res.json({message : 'post is deleted successfully'})
  } catch (error) {
    res.status(500).json({message:"Something went wrong"});
  }
  flag = true;
}


// export const likePost = async (req, res) => {
//   const { id } = req.params;
//   if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
//   const post = await PostMessage.findById(id);

//   if(!req.userId) return res.json({ message : "Unauthenticated user"});
//   const index = post.likes.findIndex((id)=> id === String(req.userId));
//   if(index === -1) post.likes.push(req.userId);
//   else{
//     post.likes = post.likes.filter((id)=>id!== String(req.userId));
//   }

//   const updatedCurrPost = await PostMessage.findByIdAndUpdate(id , post ,{new:true});  
//   res.json(updatedCurrPost);
// }

export const likePost = async (req, res) => {
    const { id } = req.params;
    // logger.info(req.userId);
    if (!req.userId) {
        return res.json({ message: "Unauthenticated" });
      }

    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);
    
    const post = await PostMessage.findById(id);

    const index = post.likes.findIndex((id) => id ===String(req.userId));

    if (index === -1) {
      post.likes.push(req.userId);
    } else {
      post.likes = post.likes.filter((id) => id !== String(req.userId));
    }
    const updatedPost = await PostMessage.findByIdAndUpdate(id, post, { new: true });
    res.status(200).json(updatedPost);
}


export const commentPost = async (req, res) => {
  const {id} = req.params;
  const {value} = req.body;
  
  try {
    const currPost = await PostMessage.findById(id);
    currPost.comments.push(value);
    const updatedPost = await PostMessage.findByIdAndUpdate(id,currPost,{new: true});
    res.json(updatedPost);
  } catch (error) {
    res.json(error.message);
  }
}

export const getStatsForUser = async (req, res) => {
  const { id } = req.params;
  // logger.info("here id -> ", id);
  try {
    const totalPosts = await PostMessage.find({ creator : id });
    var totalLikes = 0;
    var popularity = 0;
    totalPosts.map(item => {
      totalLikes += item.likes.length;
      popularity += item.viewCount;
    });

    const resData = {
      myPosts : totalPosts,
      totalLikes : totalLikes,
      totalPosts : totalPosts.length,
      popularity : popularity
    }
    // logger.info(resData);
    
    res.status(200).json({data : resData});
  } catch (error) {
    logger.info(error,id);
    res.status(404).json({ message: error.message });
  }
}

export default router;