import PostMessage from '../models/postMessage.js'

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