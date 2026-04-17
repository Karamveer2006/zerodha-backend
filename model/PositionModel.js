const PositionsSchema=require("../schemas/PositionsSchema");
const mongoose=require('mongoose');

const PositionModel=new mongoose.model("Positions",PositionsSchema);

module.exports={PositionModel};