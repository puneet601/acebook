require('dotenv').config();
var express = require("express");
var app = express();

var formidable = require("express-formidable");
app.use(formidable());

var mongodb = require("mongodb");
var mongoClient = mongodb.MongoClient;
var ObjectId = mongodb.ObjectId;

var http = require("http").createServer(app);
var bcrypt = require("bcrypt");
var fileSystem = require("fs");

var jwt = require("jsonwebtoken");
var accessTokenSecret = process.env.SECRET;

app.use("/public", express.static(__dirname + "/public"));
app.set("view engine", "ejs");

var socketIO = require("socket.io")(http);
var socketID = "";
var users = [];

var mainURL = "http://localhost:3000";

socketIO.on("connection", function (socket) {
	console.log("User connected", socket.id);
	socketID = socket.id;
});

http.listen(3000, function () {
	console.log("Server started at " + mainURL);
     
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
app.get("/",function(req,res){
res.send("hey");
});
app.post("/getUser", function (request, result) {
    var accessToken = request.fields.accessToken;
    database.collection("users").findOne({
        "accessToken": accessToken
    }, function (error, user) {
        if (user == null) {
            result.json({
                "status": "error",
                "message": "User has been logged out. Please login again."
            });
        } else {
            result.json({
                "status": "success",
                "message": "Record has been fetched.",
                "data": user
            });
        }
    });
});

app.get("/logout", function (request, result) {
    result.redirect("/login");
});

app.post("/uploadCoverPhoto", function (request, result) {
    var accessToken = request.fields.accessToken;
    var coverPhoto = "";

    database.collection("users").findOne({
        "accessToken": accessToken
    }, function (error, user) {
        if (user == null) {
            result.json({
                "status": "error",
                "message": "User has been logged out. Please login again."
            });
        } else {

            if (request.files.coverPhoto.size > 0 && request.files.coverPhoto.type.includes("image")) {

                if (user.coverPhoto != "") {
                    fileSystem.unlink(user.coverPhoto, function (error) {
                        //
                    });
                }

                coverPhoto = "public/images/" + new Date().getTime() + "-" + request.files.coverPhoto.name;
                fileSystem.rename(request.files.coverPhoto.path, coverPhoto, function (error) {
                    //
                });

                database.collection("users").updateOne({
                    "accessToken": accessToken
                }, {
                    $set: {
                        "coverPhoto": coverPhoto
                    }
                }, function (error, data) {
                    result.json({
                        "status": "status",
                        "message": "Cover photo has been updated.",
                        data: mainURL + "/" + coverPhoto
                    });
                });
            } else {
                result.json({
                    "status": "error",
                    "message": "Please select valid image."
                });
            }
        }
    });
});
    });
   
 });
 