const UsersSchema =require('../schemas/UsersSchema');
const mongoose=require('mongoose');

const UserModel=mongoose.model("User",UsersSchema);

module.exports ={UserModel}