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
  
  const {title,message,creator,tags,selectedFile,likeCount,createdAt} = req.body;
  const newPost = new PostMessage({title,message,creator,tags,selectedFile,likeCount,createdAt});
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
export default router;

export const likePost = async (req, res) =>{
  const { id } = req.params;
  //if post is valid and exits in DB
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No post with id: ${id}`);

  const currPost = await PostMessage.findById(id);
  const updatedCurrPost = await PostMessage.findByIdAndUpdate(id , 
                          {likeCount: currPost.likeCount + 1},{new:true});
  
  res.json(updatedCurrPost);
}