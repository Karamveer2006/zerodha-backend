const OrdersSchema = require('../schemas/OrdersSchema');

const mongoose=require('mongoose');

const OrderModel=new mongoose.model("orders",OrdersSchema);

module.exports={OrderModel};