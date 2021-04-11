
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors"); // to run node api on a cross platform
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const expressValidator = require("express-validator");
var cookieParser = require('cookie-parser');
const fs = require("fs");


//post routes
const  postRoutes= require("./routes/post");
//user auth routes
const authRoutes = require("./routes/auth");
//all users route
const userRoutes = require("./routes/user");






mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false }).then(()=>console.log("connection succesfull")).catch(err=>console.log(err))



app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(expressValidator()); // to parse error as a middleware
app.use(cookieParser());
app.use(cors());


//middleware
app.use(morgan("dev"))

app.use("/", postRoutes);
app.use("/",authRoutes);
app.use("/", userRoutes);

app.use(function (err, req, res, next) {  // to handel unauthorised user
    if (err.name === 'UnauthorizedError') {
      res.status(401).json({Error:"Unauthorised user!"});
    }
  });

app.get("/",(req,res)=>{
  fs.readFile("APIdocs/apiGuide.json",(err,file)=>{
    if(err){
      res.status(400).json({Error:err});
    }else{
      const JSONfile = JSON.parse(file);
      res.json(JSONfile)
    }
  })
})

app.listen(process.env.PORT||8080,()=>{
    console.log(`Node API server is running on port ${process.env.PORT}`);
})