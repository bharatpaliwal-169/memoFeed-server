import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config()

export const sendEmail = (reciptents,subject,type,TOKEN) =>{
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    secure: process.env.EMAIL_SECURE,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_ID,
      pass: process.env.EMAIL_PASS,
    },
  });
  const body = "";
  switch (type) {
    case "FORGOTPASSWORD":
      body = `<h1>Forgot password !!</h1>
      <p> click <a href="${TOKEN}">here</a>

      <p> <b> You are welcome to Memofeed </b> </p>
      <h6>Developed by Bharat Paliwal</h6>
      `;
      break;
    
    case "EMAIL_VERIFICATION":
      body = `
        <h1>Verify your Email</h1>
        <p> Please click on this link to activate your account.</p>
        <h6>
          <a href="http://localhost:3000/auth/email/veriication/${TOKEN}">Verify</a>
        </h6>
      `;
      break;
  
    default:
      break;
  }
  const mailOptions = {
    from: process.env.EMAIL_ID, // sender address
    to: reciptents,
    subject: subject, // Subject line
    html: body, // plain text body
  };
  try {
    transporter.sendMail(mailOptions,function(err,info){
      if(err){
        console.log(err);
      }else{
        console.log(info);
      }
    });
    return "OK";
  } catch (error) {
    console.log(error.message);
    return "ERROR"
  }
}