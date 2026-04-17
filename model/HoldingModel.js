const HoldingsSchema=require("../schemas/HoldingsSchema");
const mongoose=require('mongoose');

const HoldingsModel=new mongoose.model("Holding",HoldingsSchema);

module.exports={HoldingsModel};