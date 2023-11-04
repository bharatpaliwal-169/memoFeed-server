import mongoose from 'mongoose';
const authSchema = mongoose.Schema({
  name : {type: 'string',required: true},
  email : {type: 'string',required: true},
  password : {type: 'string',required: true},
  verified : {type : 'Boolean',default : false},
  id : {type: 'string'}
})
var authMessage = mongoose.model('authMessage',authSchema);
export default authMessage;