require('dotenv').config();
const express=require('express');
const app=express();
const formidable = require("express-formidable");
app.use(formidable());
const mongodb = require("mongodb");
const mongoClient = mongodb.MongoClient;
const ObjectId = mongodb.ObjectId;
const http=require("http").createServer(app);
const bcrypt=require("bcrypt");
const filesystem=require("fs");
const jwt=require("jsonwebtoken");
const accessTokenSecret=process.env.SECRET;
app.use("/public",express.static(__dirname + "/public"));
app.set("view engine","ejs");
const socketIO=require("socket.io")(http);
var socketID = "";
var users = [];
 var mainURL = "http://localhost:3000";
 socketIO.on("connection", function (socket) {
     console.log("User connected", socket.id);
     socketID=socket.id;
 });
 http.listen(3000,function(){
     console.log("Server Started at port 3000");
    mongoClient.connect("mongodb://localhost:27017",{ useUnifiedTopology: true }, function(error,client){
        var database = client.db("acebook");
        console.log("Database Connected.");
app.get("/signup",function(req,res){
            res.render("signup");
        });

    app.post("/signup",function(req,res){
        
var name=req.fields.name;
var username=req.fields.username; 

var email=req.fields.email; 
var password=req.fields.password;
var gender=req.fields.gender;
database.collection("users").findOne({
    $or: [
        {"email":email},{"username":username}
    ]
},function(error,user){
    if(user===null){
        bcrypt.hash(password,10,function(error,hash){
            database.collection("users").insertOne({
                "name":name,
                "username":username,
                "email":email,
                "password":hash,
                "gender":gender,
                "profileImage":"",
                "coverPhoto":"",
                "dob":"",
                "city":"",
                "country":"",
                "aboutMe":"",
                "friends":[],
                "posts":[],
                "groups":[],"notifications":[]},function(error,data){
                          res.json({
                              "status":"success",
                              "message":"Signed up successfully. You can login now."
                          });
                });
    
        });
     } else{
        
            res.json({
                "status":"error",
                "message":"Email or Username already exist."
            });
        }
    
});

    });
    app.get("/login",function(req,res){
        res.render("login");
    });

app.post("/login",function(req,res){

var email=req.fields.email;
var password=req.fields.password;
database.collection("users").findOne({
    "email":email
},function(error,user){
    if(user==null){
        res.json({
            "status" : "error",
            "message" : "Email does not exist"
        });
    }
    else{
        bcrypt.compare(password,user.password,function(error,isVerify){
if(isVerify)
{ var accessToken = jwt.sign({email:email},accessTokenSecret);
database.collection("users").findOneAndUpdate({
    "email": email
},{
    $set: {
        "accessToken": accessToken
    }
},function(error,data){
    res.json({
        "status" : "success",
        "message" : "Login successfully",
        "accessToken": accessToken,
        "profileImage": user.profileImage
    });
});
}
else{
        res.json({
        "status" : "success",
        "message" : "Password incorrect"
    });
}
        });
    } 

    
})
});
app.get("/updateProfile",function(req,res){
    res.render("updateProfile");
});

    });
   
 });
 