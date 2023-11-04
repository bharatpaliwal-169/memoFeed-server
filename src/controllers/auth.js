import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import auth from "../models/auth.js"
import dotenv from 'dotenv';
import mongoose from 'mongoose';

//services
import sendEmail from '../services/Email/index.js';
import logger from '../services/Logger/index.js';

dotenv.config()
const SECRET = process.env.SECRET;


export const login = async (req, res) => {
  logger.info("[controllers/auth/login] Started: login()");
  const {email,password} = req.body;

  try{
    const existingUser = await auth.findOne({email});
    logger.info("Login Requested by user : " + existingUser.name);

    if(!existingUser) {
      logger.warn("User does not exist with mailID: " + email);
      return res.status(404).json({message: 'User does not exist'});
    }
    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if(!isPasswordCorrect) {
      logger.warn("Wrong Password recieved by user " + existingUser.name);
      return res.status(400).json({message: 'Password is incorrect'});
    }

    const token = jwt.sign({id:existingUser._id}, SECRET, { expiresIn: "1h" });
    
    const loggedInUser = {
      _id : existingUser._id,
      name : existingUser.name,
      email : existingUser.email,
      verified : existingUser.verified
    }
    logger.info("Logged in Successful for User : " + loggedInUser.toString());
    res.status(200).json({result : loggedInUser,token:token });
  }
  catch(err) {
    logger.error("[controllers/auth/login] ERROR" + err);
    res.status(500).json({message: "something went wrong"});
  }

  logger.info("login() ended");
}

export const signup = async (req, res) => {

  logger.info("[controllers/auth/signup] : signup() started");

  const {firstName,lastName,email,password} = req.body;
  
  try {
    const existingUser = await auth.findOne({email});
    if(existingUser){
      return res.status(400).json({message : "user already exists"});
    }

    // enhanced passwords.
    if(!password && password.length < 6 && password.length > 20){
      console.info("unqualified password");
      return res.status(406).json({message:"Password lack strength"});
    }
    const salt =  await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(password,salt,12);

    const result = await auth.create({email, password: hashPassword,name : `${firstName} ${lastName}`});
    console.log(result);
    const token = jwt.sign({email : result.email, id:result._id}, SECRET, { expiresIn: "1h" });
    
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


export const verifyUserReq = async(req,res) => {
  const{email} = req.body;
  console.info("Email verification is request by "+ email);
  try {
    const user = await auth.findOne({email});
    if(!user){
      console.warn("[verifyUser] : Bad request from " + email);
      return res.status(400).json({message : "user does not exists!!"});
    }
    const token = jwt.sign( {email:user.email} ,SECRET ,{ expiresIn: "1h"});
    console.info("Token generated for " + user.name + "  token->  " + token);
    sendEmail(user.email,"Memofeed - Email Verification","EMAILVERIFY",token,user.name);
    res.status(200).json({message:"Email have been sent."});
  } catch (error) {
    console.error("[verifyEmailReq] : "+error.message);
  }
}

export const verifyUser = async(req,res) => {
  const {token} = req.query;
  try {
    const decodedData = jwt.verify(token,SECRET);
    if(!decodedData) {
      console.warn("[verifyUser] : " + decodedData + " invalid ");
      res.status(403).json({message:"verification link expired"});
    }
    const email = decodedData?.email;
    if(!email){
      console.warn("[verifyUSer] Invalid data from " + decodedData);
      res.status(400).json({message:"Something went wrong"});
    }
    const user = await auth.findOne({email});
    if(!user){
      console.error("invalid email entery found! " + email);
      res.status(500).json({message:"Invalid data"});
    }
    const id = user._id;
    const result = await auth.findByIdAndUpdate(id,{user,$set:{verified:true}},{new:true});
    res.status(202).json({mesage:"Email is now verified"});
  } catch (error) {
    console.error("[verifyUser] : ERROR" + error.message);
  }
}


export const forgotPswdReq = async(req,res) => {
  console.info("[forgotPswd method] started.");
  
  const {email} = req.body;
  try {
    const user = await auth.findOne({email});
    if(!user){
      console.warn(`[forgotPswdReq] recieved invalid email : ${email}`);
      return res.status(400).json({message:"invalid email"});
    }
    
    const id = user._id ? user._id : "";
    if (!mongoose.Types.ObjectId.isValid(id)){
      console.error(`invalid id --> ${id}`);
      return res.status(500).json({message:"Something went wrong"});
    }
    
    const token = jwt.sign({email:user.email},SECRET, {expiresIn:"1h"});

    // console.info(`[forgotPaswdReq] sent mail to user with FP request with token -> ${JSON.stringify(token)}`);

    const emailStatus = sendEmail(user.email, "MemoFeed - Forgot Password", "FORGOTPASSWORD", token,user.name);
    if(emailStatus === "OK"){
      res.status(200).json({message:"We have sent you a email"});
    }else{
      res.status(400).json({message:"Something went wrong. Please try again later."});
    }
  
  } catch (error) {
    console.error(`[forgotPswdReq] ${error.message}`);
  }
  console.info("forgot password mail sent");
};


export const changePasswordReq = async(req,res) => {
  console.info("Recieved req for change pswd");
  
  const {email} = req.body;
  try {
    const user = await auth.findOne({email});
    if(!user){
      console.warn(`invalid emaild id recieved : ${email}`);
      return res.status(400).json({message:"We dont have account with that email ID"});
    }
    

    const token = jwt.sign({email:user.email},SECRET, {expiresIn:"1h"} );

    const emailStatus = sendEmail(user.email,"MemoFeed - Change Password","CHANGEPASSWORD",token,user.name);
    // const emailStatus = "ERROR"
    if(emailStatus === "OK"){
      res.status(200).json({message:"sent a email with your request"});
    }else{
      res.status(500).json({message : "Failed to send email,Please try after sometime."});
    }

  } catch (error) {
    console.error(`[changePasswordReq]:  ${JSON.stringify(error.message)}`);
    res.status(500).json({message:"Something went wrong."});
  }
}

export const changePassword = async(req,res) => {
  console.info("Got changePassword request ");

  // const {token} = req.query;
  const {password,confirmPassword,token} = req.body;
  try {
    console.log(token);
    const decodedData = jwt.verify(token,SECRET);
    if(!decodedData) {
      console.warn("[changePassword] : " + decodedData + " invalid ");
      res.status(403).json({message:"forgot Password link expired"});
    }
    const email = decodedData?.email;
    if(!email){
      console.warn("[changePassword] Invalid data from " + decodedData);
      res.status(400).json({message:"Something went wrong",isValid:false});
    }

    const user = await auth.findOne({email});
    
    if(!user){
      console.warn(`[changepassword] request expired ${token}`);
      return res.status(401).json({message:"Request expired!",isValid:false});
    }

    console.info(`[changePassword]: This user have requested CP -> ${JSON.stringify(user.name)}`);


    if(password !== confirmPassword){
      return res.status(400).json({message:"Mismatched password and confirm password"});
    }
    
    if(!password && password.length < 6 && password.length > 20){
      console.info("unqualified password");
      return res.status(406).json({message:"Password lack strength"});
    }

    const id = user._id;
    
    const salt =  await bcrypt.genSalt(10);
    const hashPassword = bcrypt.hashSync(password,salt,12);
    
    const lastChangeTime = `${new Date().toDateString()} ${new Date().toTimeString()}`;
    const result = await auth.findByIdAndUpdate(id,{user,$set:{password:hashPassword}},{new:true});
    console.info(`[changePassword] user updates at ${lastChangeTime}`);
    
    res.status(202).json({message:"password changed successfully"});
  } catch (error) {
    console.error(`[changePassword]: ${error.message}`);
  }
  console.info("changePassword method completed");
}