if(process.env.NODE_ENV!="production"){
    require("dotenv").config();
}

const express=require("express");
const app=express();
const mongoose =require('mongoose');
const{PositionModel}=require('./model/PositionModel');
const {HoldingsModel}=require('./model/HoldingModel');
const {OrderModel}=require('./model/OrderModel');
const {UserModel}=require('./model/UserModel');

const cookieParser=require('cookie-parser');
const userVerification =require('./middlewares/AuthMIddleware');
const jwt = require("jsonwebtoken");


const bodyParser=require('body-parser')
const cors=require('cors');
const {Signup,Login, userId}=require("./controllers/AuthController");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001","https://zerodha-dashboard-pi.vercel.app"];

app.use(cors({
    origin: function (origin, callback) {
        // If the origin is in our list or is undefined (for non-browser requests like Hoppscotch)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(cookieParser());

main()
.then(()=>{
    console.log("connection successfull");
})
.catch((err)=>{console.log(err)})

async function main() {
   await mongoose.connect(process.env.MONGO_URL);
    
}

app.get("/holdingsdata",async(req,res)=>{
    try{
         let allHolding=[];
    allHolding=await HoldingsModel.find({}); 
    res.json(allHolding);

    }catch(err){
        console.log("server error" ,err);

    }
   

});
app.post('/verify',userVerification)

app.get("/positionsdata",async(req,res)=>{
    try{
         let allPositions=[];
    allPositions=await PositionModel.find({}); 
    res.json(allPositions);

    }catch(err){
        console.log("server error" ,err);

    }
   

});



app.post("/orderdata", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
        const token = req.cookies?.token || headerToken;
        let userId = req.body.userId;

        if (!userId && token) {
            try {
                const decoded = jwt.verify(token, process.env.TOKEN_KEY);
                userId = decoded.id;
            } catch (err) {
                return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
            }
        }

        if (!userId) {
            return res.status(401).json({ error: "Unauthorized", message: "Missing userId" });
        }

        const orderDetails = await OrderModel.create({
            name: req.body.name,
            qty: req.body.qty,
            price: req.body.price,
            mode: req.body.mode,
        });

        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { $push: { orders: orderDetails._id } },
            { new: true }
        );

        if (!updatedUser) {
            await OrderModel.findByIdAndDelete(orderDetails._id);
            return res.status(404).json({ error: "User not found" });
        }

        return res.status(201).json({
            message: "Data saved successfully",
            orderId: orderDetails._id,
            ordersCount: updatedUser.orders.length,
        });

    } catch (err) {
        console.error("Save Error:", err.message);
        
        // You MUST send a response if it fails, otherwise it keeps loading
        return res.status(500).json({ 
            error: "Internal Server Error", 
            message: err.message 
        });
    }
});

app.post("/ordersdetails",async(req,res)=>{
    const authHeader = req.headers.authorization;
    const headerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const token = req.cookies?.token || headerToken;
    let userId = req.body.userId;
    
    if (!userId && token) {
        try {
            const decoded = jwt.verify(token, process.env.TOKEN_KEY);
            userId = decoded.id;
        } catch (err) {
            return res.status(401).json({ error: "Unauthorized", message: "Invalid token" });
        }
    }
    
    if (!userId) {
        return res.status(401).json({ error: "Unauthorized", message: "Missing userId" });
    }
    
    try{
         let allOrders=[];
         const user = await UserModel.findById(userId).populate("orders");
         if (!user) {
             return res.status(404).json({ error: "User not found" });
         }
         allOrders = user.orders;
   
    res.json(allOrders);

    }catch(err){
        console.log("server error" ,err);

    }
   

});

app.post("/signup",Signup);
app.post("/login",Login);

app.get('/', (req, res) => {
  res.send('Backend is running on Vercel!');
});



app.listen(8080,()=>{
    console.log("app is listening to 8080");
});
module.exports = app;
