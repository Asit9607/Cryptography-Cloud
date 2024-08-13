const mysql=require("mysql2");
const express=require("express");
const app= express();
app.use("/assets",express.static("assets"));
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Asit2004",
    database: "login_signup"
});

//connect to db
connection.connect(function(error){
    if(error)throw error
    else console.log("connnected to the database successfully");
})

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
    });

app.post("/",encoder,function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    connection.query("select * from login_signup.userdetails where user_name= ? and user_pass = ?",[username,password],function(error,results,fields)
{
    if(results.length>0)
    {
        res.redirect("/welcome");
    }else
    {
        res.redirect("/");
    }
    res.end();
})
})

//when login is success
app.get("/welcome",function(req,res){
    res.sendFile(__dirname+"/welcome.html");
})
//app port
app.listen(4501);