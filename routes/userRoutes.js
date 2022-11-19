const express = require("express");
const validator = require("email-validator");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Sign-up Route
router.post("/signup", async (req, res) =>{
    try{
        let {email, username, password, confirmPassword} = req.body;
        
        // Remove whitespace
        email = email.trim();
        username = username.trim();
        password = password.trim();
        confirmPassword = confirmPassword.trim();

        // Make sure form was filled
        if (!email || !username || !password || !confirmPassword) return res.status(400).send("Please fill the form.");

        // Validate Email
        const emailIsValid = validator.validate(email);
        if(!emailIsValid) return res.status(400).send("Email is invalid.");

        // Check if email already exists
        const [emailMatch] = await db.execute(`SELECT * FROM user WHERE email="${email}"`);
        const emailMatchUser = emailMatch[0];
        if(emailMatchUser) return res.status(400).send("There is already an account attached to this email.");
        
        // Check if username already exists
        const [usernameMatch] = await db.execute(`SELECT * FROM user WHERE username="${username}"`);
        const usernameMatchUser = usernameMatch[0];
        if(usernameMatchUser) return res.status(400).send("Username is taken.");
        
        // Check if username and password are the same
        if (password === username) return res.status(400).send("Username and Password cannot match");
        
        // Validate Password (Capital letter, number, special character, 8 characters)
        const regex = /^(?=.*[A-Z])^(?=.*[0-9])(?=.*[\[\]£!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9\[\]£!@#\$%\^\&*\)\(+=._-]{8,}$/;
        const result = regex.test(password);
        if(!result) return res.status(400).send("Password must be at least 8 characters long and contain at least 1 capital letter, 1 number and 1 special character");

        // Check passwords match
        if(password !== confirmPassword) return res.status(400).send("Passwords do not match.");
        
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Save user to database
        await db.execute(`INSERT INTO user (email, username, password) VALUES ("${email}","${username}","${hashedPassword}");`);

        //Create web token 
        const token = await jwt.sign({data: username}, process.env.SECRET, { expiresIn: '24h' });
        
        return res.send(token);
    } 
    catch(e){
        console.log(e);
        return res.status(500).send();
    }
})

// Login Route
router.post("/login", async (req, res) =>{
    try{
        const {username, password} = req.body;
        // Find user
        const [row] = await db.execute(`SELECT * FROM user WHERE username="${username}"`);
        const user = row[0];
        if(!user){
            return res.status(400).send();
        }

        // Compare hashed passwords
        const match = await bcrypt.compare(password, user.password);
        console.log(match);

        if(!match){
            return res.status(400).send("Passwords do not match.");
        }

        // Create web token
        const token = await jwt.sign({data: username}, process.env.SECRET, { expiresIn: '24h' });
        
        res.send(token);
    }catch(e){
        console.log(e);
        return res.status(500).send();
    }
})

module.exports = router;
