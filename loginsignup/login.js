import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const app= express();
app.use(express.static("assets"));

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.get("/assets/style.css", function(req, res) {
    res.type("text/css");
    res.sendFile(__dirname + "/assets/style.css");
});

app.use(bodyParser.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Asit2004",
    database: "login_signup",
});
connection.connect();

app.get("/",function(req,res){
    res.sendFile(__dirname+"/index.html");
    });

app.post("/",function(req,res){
    var username=req.body.username;
    var password=req.body.password;
    connection.query(
        "select * from login_signup.userdetails where user_name= ? and user_pass = ?",
        [username, password],
        function (error, results) {
            if (error) {
                console.error(error);
                return res.redirect("/");
            }
            if (results.length > 0) {
                res.redirect("/welcome");
            } else {
                res.redirect("/");
            }
            res.end();
        }
    );
})

app.get("/submit",function(req,res){
    res.sendFile(__dirname+"/index.html");
})

app.get("/welcome",function(req,res){
    res.sendFile(__dirname+"/welcome.html");
})

app.get("/getfile", function(req, res) {
    res.sendFile(__dirname + "/getfile.html");
});

app.get("/signup", function(req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/getfile", function(req, res) {
    const fileKey = req.body.file_key;
    // Implement logic to retrieve and serve the file based on the fileKey
    // For example, you might fetch the file from the database or a cloud storage service

    // Placeholder response
    res.send("File retrieval feature is under construction.");
});
app.post("/signup", function(req, res) {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.send("Passwords do not match.");
    }

    // Placeholder response
    res.send("Sign-up feature is under construction.");
});

//app port
app.listen(3000);
