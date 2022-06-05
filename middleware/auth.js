import jwt from "jsonwebtoken";
const SECRET = "SECRET"
const auth = async (req, res, next) => {
  try {
    var token = req.headers.authorization.split(' ')[1];
    let decodedData;
    if (token) {      
      decodedData = jwt.verify(token, SECRET);
      req.userId = decodedData?.id;
    }
    console.log(req.userId);    
    next();
  } catch (error) {
    console.log(error);
  }
};
export default auth;