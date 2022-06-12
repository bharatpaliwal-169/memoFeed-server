import mongoose from 'mongoose'
import express from "express"
import PostMessage from '../models/postMessage.js'
const router = express.Router()
// application logic is written here

export const getPosts = async (req,res) => {
  const {page} = req.query;

  try {
    const LIMIT = 6; // max no of post on one page
    const startIndex = (Number(page)-1)*LIMIT; // get starting page of each page 
    const total = await PostMessage.countDocuments({});

    const posts = await PostMessage.find().sort({_id:-1}).limit(LIMIT).skip(startIndex);
    
    console.log(posts);

    res.status(200).json({data : posts,currentPage: Number(page),NumberOfPages: Math.ceil(total/LIMIT)});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
  
};

// query /posts?page=1 -> to get data from DB 
//params /posts/:id (id===12332) -> to get some specific resource

export const getPostsBySearch = async (req, res) => {
  const {searchQuery,tags} = req.query;
  try {
    const title = new RegExp(searchQuery, 'i'); // all will be same -> TEST,Test,TEst,test anything
    // const posts = await PostMessage.find({
    //   $or : [
    //     {title},
    //     {tags : {$in: tags.split(',')}}
    //   ]
    // })
    const posts = await PostMessage.find({ $or: [ { title }, { tags: { $in: tags.split(',') } } ]});
    res.json({data:posts});
  } catch (error) {
    res.status(404).json({message: error.message});
  }
}


//details page for each post
export const getPost = async (req, res) => { 
  const { id } = req.params;
  try {
      const post = await PostMessage.findById(id);
      
      res.status(200).json(post);
  } catch (error) {
      res.status(404).json({ message: error.message });
  }
}


export const createPost = async(req, res) => {
  
  const post = req.body;
  const newPost = new PostMessage({ ...post, creator: req.userId, createdAt: new Date().toISOString()});
  try {
    await newPost.save();
    res.status(200).json(newPost);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
}

export const updatePost = async(req, res) => {
  // const {id: _id } = req.params; //during the destruct we can remane the variable
  // const updatedpost = req.body; // updated version of post is comming from frontend.
  // if( !mongoose.Types.ObjectId.isValid(_id)) {
  //   return res.status(404).send('No post with that Id!');
  // }
  // await PostMessage.findByIdAndUpdate(id , updatedpost, {new : true});
  // res.json(updatedPost)

    const { id } = req.params;
    const { title, message, creator, selectedFile, tags } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

    const updatedPost = { creator, title, message, tags, selectedFile, _id: id };
    
    await PostMessage.findByIdAndUpdate(id, updatedPost, { new: true });
    
    res.json(updatedPost);

}

export const deletePost = async (req, res) =>{
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  await PostMessage.findByIdAndRemove(id);
  res.json({message : 'post is deleted successfully'})
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
    console.log(req.userId);
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


export default router;