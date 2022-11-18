import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from "../models/auth.js"
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// import sendEmail from '../services/Email/index.js'
dotenv.config()
const SECRET = process.env.SECRET;

export const login = async (req, res) => {
  //get required vars from frontend request
  const {email,password} = req.body;

  try{
    const existingUser = await auth.findOne({email});
    
    if(!existingUser) {
      return res.status(404).json({message: 'User does not exist'});
    }
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect) {
      return res.status(400).json({message: 'Password is incorrect'});
    }

    // const token = jwt.sign({email : existingUser.email, id:existingUser.id}, "SECRET", { expiresIn: "1h" });
    // console.log(existingUser);
    const token = jwt.sign({id:existingUser._id}, SECRET, { expiresIn: "1h" });
    
    res.status(200).json({result : existingUser,token:token });
  }
  catch(err) {
    res.status(500).json({message: "something went wrong" + err});
  }
}

export const signup = async (req, res) => {
  const {firstName,lastName,email,password} = req.body;
  try {
    const existingUser = await auth.findOne({email});
    if(existingUser){
      return res.status(400).json({message : "user already exists"});
    }

    const hashPassword = await bcrypt.hash(password,12);

    const result = await auth.create({email, password: hashPassword,name : `${firstName} ${lastName}`});
    console.log(result);
    const token = jwt.sign({email : result.email, id:result._id}, SECRET, { expiresIn: "1h" });
    
    // await sendEmail(email,"Verify Account","EMAIL_VERIFICATION",token);
    res.status(200).json({result,token});
  } catch (error) {
    res.status(500).json({message: "something went wrong " + error.message});
  }
}

export const deleteAccount = async (req, res) => {
  const {id} = req.params;
  try {
    if(!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No user exist with this id`);
    await auth.findByIdAndDelete(id);
    res.status(200).json({message : "Good Bye :( "});
  } catch (error) {
    res.json(error.message);
  }
}

export const forgotPassword = async(req,res) => {
  const {email , newPswd} = req.body;
  try {
    const existingUser = await auth.findOne({email});
    const newHashPassword = await bcrypt.hash(newPswd,12);
    const id = existingUser._id;
    const newUser = {
      id : id,
      email : existingUser.email,
      name : existingUser.name,
      password : newHashPassword
    };
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(404).send(`No User with id: ${id}`);
    const result = await auth.findByIdAndUpdate(id,newUser,{new:true});
    const token = jwt.sign({email : result.email, id:result._id}, SECRET, { expiresIn: "1h" });
    res.status(200).json({result,token,message:"Password is now updated"});
  } catch (error) {
    console.log(error.message);
    res.status(500).json({message : "Something went wrong"});
  }
}

export const verifyUser = async (req,res) => {
  console.log("email verification");
}