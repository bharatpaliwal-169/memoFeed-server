import axios from 'axios';
import cron from 'node-cron';

const baseURL = "http://localhost:5000/";
// const baseURL = process.env.PROD_URL;

var token = "";
var id = "";

const createUser = async() => {
  const user = {
    firstName : "Mocking",
    lastName : "Bird",
    email : "bird@memofeed.com",
    password : "bird1234"
  };
  try {
    const response = await axios.post(`${baseURL}/auth/signup/`,user);
    console.log( "Response from createUser : "+response.status+response.message);
    token = response.token;
    id = response.data._id;
  } catch (error) {
    console.log("[createUser]: Error in the func "+ error.toString());
  }
}

const loginUser = async() => {
  const user = {
    email : "bird@memofeed.com",
    password : "bird1234"
  }
  try {
    const response = await axios.post(`${baseURL}/auth/login/`,user);
    console.log( "Response from loginUser : "+response.status+response.message);
    token = response.token;
    id = response.data._id;
  } catch (error) {
    console.log("[loginUser]: Error in the func "+ error.toString());
  }
}

const deleteUser = async() => {
  try {
    const response = await axios.delete(`${baseURL}/auth/deleteAccount/${id}`);
    console.log( "Response from deleteUser : "+response.status+response.message);
    id = "";token="";
  } catch (error) {
    console.log("[deleteUser]: Error in the func "+ error.toString());
  }
}

const initMain = async() => {
  console.log("[Mock.js]: Starting the Mock Flow.");
  // create a user
  const res1 = await createUser();
  console.log("[createUser]: done" + res1);
  // login that user
  console.log("current id and token : " + id + " ~~~ " + token);

  const res2 = await loginUser();
  console.log("current id and token : " + id + " ~~~ " + token);
  // create a post
  // IP : like comment on that or any other post.
  // update the post
  //get that post / any
  // get stats of that post / any
  // delete the newly created post
  // delete the account
  const res3 = await deleteUser();
  console.log("current id and token : " + id + " ~~~ " + token);
}

const Mock = () => {
  cron.schedule('*/5 * * * *', async () => {
    console.log("[Mock.js]: cronJob is starting.");
    initMain();
    console.log("[Mock.js]: cronJob ended..");
  })
}
export default Mock;