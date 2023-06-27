import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

import verifyEmail from './templates/verifyEmail.js'
import forgotPasswordBody from './templates/forgotPswd.js';
import changePswd from './templates/changePswd.js'

dotenv.config()
const sendEmail = (reciptent,subject,type,TOKEN,name) =>{
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    secure: process.env.EMAIL_SECURE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });
  var body = "";
  switch (type) {
    case "FORGOTPASSWORD":
      body = forgotPasswordBody(TOKEN,name);
      break;
    
    case "EMAILVERIFY":
      body = verifyEmail(TOKEN,name);
      break;
    case "CHANGEPASSWORD":
      body = changePswd(TOKEN,name);
      break;
    default:
      break;
  }
  const mailOptions = {
    from: process.env.EMAIL_ID, // sender address
    to: reciptent,
    subject: subject, // Subject line
    html: body, // plain text body
  };
  try {
    transporter.sendMail(mailOptions,function(err,info){
      if(err){
        console.log(`[email.js] ERROR: ${err.message}`);
        return "ERROR"
      }else{
        console.log(`[email.js] ${JSON.stringify(info)}`);
      }
    });
    return "OK";
  } catch (error) {
    console.log(error.message);
    return "ERROR"
  }
};

export default sendEmail;