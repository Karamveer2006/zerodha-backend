const { use } = require("passport");
const mongoose=require('mongoose');
const {UserModel} = require("../model/UserModel");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const userVerification = (req, res) => {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const token = req.cookies?.token || headerToken;
  if (!token) {
    return res.status(401).json({ status: false, message: "No token" });
  }
  jwt.verify(token, process.env.TOKEN_KEY, async (err, data) => {
    if (err) {
     return res.status(401).json({ status: false, message: "Invalid token" });
    } else {
      const user = await UserModel.findById(data.id)
      if (user) return res.json({ status: true, user: user.username })
      else return res.status(404).json({ status: false, message: "User not found" })
    }
  })
}
module.exports =userVerification;