const mongoose =require('mongoose');
const bcrypt=require('bcrypt');
const {OrderModel}=require('../model/OrderModel');


const UsersSchema =new mongoose.Schema({
    email:{
        type:String,
        required:[true,"your email address is required"],
        unique:true,

    },
    username:{
        type:String,
        required:[true,"username is required"],

    },
    password:{
        type:String,
        required:true,
    },
    orders:[
            {
            type:mongoose.Schema.Types.ObjectId,
            ref:"orders"
        },
    ],
    
    
})

UsersSchema.pre("save", async function(next) {
    // SAFETY CHECK: If the password wasn't modified, skip hashing!
    if (!this.isModified("password")) {
        return next();
    }
    
    this.password = await bcrypt.hash(this.password, 12);
    
});
module.exports=UsersSchema;