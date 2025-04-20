import mongoose from 'mongoose';
const authSchema = mongoose.Schema({
  name : {type: 'string',required: true},
  email : {type: 'string',required: true},
  password : {type: 'string',default: ''},
  verified : {type : 'Boolean',default : false},
  id : {type: 'string'},
  google_id : {type: 'string',unique: true},
  user_id : {type: 'string',unique:true,default: ''}
})
var authMessage = mongoose.model('authMessage',authSchema);
export default authMessage;