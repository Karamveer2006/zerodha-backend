const {UserModel }= require("../model/UserModel");
const mongoose=require('mongoose');
const createSecretToken  = require("../utils/secretToken");
const bcrypt = require('bcrypt');

const cookieOptions = {
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

module.exports.Signup = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
    }
    const user = await UserModel.create({ email, password, username });
   
    const token = createSecretToken(user._id);
        res.cookie("token", token, cookieOptions);
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user, token });
  } catch (error) {
    console.error(error);
        return res.status(500).json({ message: "Server error" });
  }
};

module.exports.Login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if(!email || !password ){
      return res.json({message:'All fields are required'})
    }
    const user = await UserModel.findOne({ email });
    if(!user){
      return res.json({message:'Incorrect password or email' }) 
    }
    const auth = await bcrypt.compare(password,user.password)
    if (!auth) {
      return res.json({message:'Incorrect password or email' }) 
    }
     const token = createSecretToken(user._id);
     res.cookie("token", token, cookieOptions);
    res.status(201).json({ message: "User logged in successfully", success: true ,user, token});
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
}