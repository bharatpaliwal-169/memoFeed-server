import mongoose from 'mongoose'
import express from "express"
import PostMessage from '../models/postMessage.js'
const router = express.Router()
// application logic is written here

// export const getPosts = (req,res) => { 
//   res.send("This is working");
// };

export const getPosts = async (req,res) => {
  try {
    const postMessages = await PostMessage.find();
    console.log(postMessages);

    res.status(200).json(postMessages);
  } catch (error) {
    res.status(404).json({message: error.message});
  }
  
};

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

export default router;