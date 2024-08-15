const mysql = require("mysql2");
const express = require("express");
const bodyParser = require("body-parser");
const { fileURLToPath } = require("url");
const { dirname } = require("path");

const app = express();
app.use("/assets", express.static("assets"));

const encoder = bodyParser.urlencoded({ extended: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/assets/style.css", function (req, res) {
    res.type("text/css");
    res.sendFile(__dirname + "/assets/style.css");
});

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Asit2004",
    database: "login_signup",
});

// Connect to the database
connection.connect(function (error) {
    if (error) throw error;
    else console.log("Connected to the database successfully");
});

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

app.post("/", encoder, function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
    
    connection.query(
        "SELECT * FROM userdetails WHERE user_name = ? AND user_pass = ?",
        [username, password],
        function (error, results, fields) {
            console.log("Username:", username);
            console.log("Password:", password);
            if (error) {
                console.error(error); // Log any SQL error for debugging
                return res.redirect("/"); // Redirect on error
            }
            if (results.length > 0) {
                res.redirect("/welcome");
            } else {
                res.redirect("/");
            }
            res.end();
        }
    );
});

app.get("/welcome", function (req, res) {
    res.sendFile(__dirname + "/welcome.html");
});

app.get("/getfile", function (req, res) {
    res.sendFile(__dirname + "/getfile.html");
});

app.get("/signup", function (req, res) {
    res.sendFile(__dirname + "/signup.html");
});

app.post("/getfile", encoder, function (req, res) {
    const fileKey = req.body.file_key;
    // Implement logic to retrieve and serve the file based on the fileKey
    // For example, you might fetch the file from the database or a cloud storage service

    // Placeholder response
    res.send("File retrieval feature is under construction.");
});

app.post("/signup", encoder, function (req, res) {
    const { name, email, password, confirm_password } = req.body;

    if (password !== confirm_password) {
        return res.send("Passwords do not match.");
    }

    connection.query(
        "INSERT INTO userdetails (name, email, user_pass) VALUES (?, ?, ?)",
        [name, email, password],
        function (error, results) {
            if (error) {
                console.error(error);
                return res.send("An error occurred while creating your account.");
            }
            res.redirect("/welcome");
        }
    );
});

// Start the server
app.listen(4500, function () {
    console.log("Server is running on port 4500");
});
