import express from "express";
import mysql from "mysql2";
import bodyParser from "body-parser";
import path from "path";
import dotenv from "dotenv";
import speakeasy from "speakeasy";
import nodemailer from "nodemailer";
import session from "express-session";

dotenv.config(); // Load environment variables from .env file

const app = express();
const __dirname = path.resolve(); // Fix for __dirname in ES modules

// Serve static files from 'assets' directory
app.use("/assets", express.static(path.join(__dirname, "assets")));

app.use(bodyParser.urlencoded({ extended: true }));

// Initialize session management
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
}));

// Create nodemailer transport using environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Database connection with error handling
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

connection.connect((error) => {
    if (error) {
        console.error('Database connection failed:', error.stack);
        return;
    }
    console.log('Connected to the database.');
});

// Serve index.html for the root route
app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Handle login
app.post("/", function(req, res) {
    const { username, password } = req.body;

    connection.query(
        "SELECT * FROM userdetails WHERE user_name = ? AND user_pass = ?",
        [username, password],
        function (error, results) {
            if (error) {
                console.error(error);
                return res.redirect("/");
            }
            if (results.length > 0) {
                const email = results[0].user_name;

                if (email) {
                    // Generate a 2FA secret and token
                    const secret = speakeasy.generateSecret();
                    const token = speakeasy.totp({
                        secret: secret.base32,
                        encoding: 'base32'
                    });

                    // Send token via email
                    const mailOptions = {
                        from: process.env.EMAIL_USER,
                        to: email,
                        subject: 'Your 2FA Code',
                        text: `Your 2FA code is: ${token}`
                    };

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.error(error);
                            return res.redirect("/");
                        } else {
                            req.session.secret = secret.base32;
                            req.session.username = username;
                            req.session.tokenSent = true;
                            res.redirect("/verify-2fa"); // Redirect to 2FA verification page
                        }
                    });
                } else {
                    res.send("Email not found for this user.");
                }
            } else {
                res.send("Invalid username or password.");
            }
        }
    );
});

// Serve the 2FA verification page
app.get("/verify-2fa", function(req, res) {
    res.sendFile(path.join(__dirname, "verify-2fa.html")); // Ensure this file exists
});

// Handle 2FA verification
app.post("/verify-2fa", function(req, res) {
    const { token } = req.body;

    if (!req.session.tokenSent) {
        return res.redirect("/");
    }

    const verified = speakeasy.totp.verify({
        secret: req.session.secret,
        encoding: 'base32',
        token: token
    });

    if (verified) {
        res.redirect("/welcome");
    } else {
        res.send("You have entered the wrong code. Please try again.");
    }
});

// Serve the welcome page
app.get("/welcome", function(req, res) {
    res.sendFile(path.join(__dirname, "welcome.html"));
});

// Start the server
app.listen(3000, function() {
    console.log("Server is running on port 3000");
});
