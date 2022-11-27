const express = require("express");
const validator = require("email-validator");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Sign-up Route
router.post("/signup", async (req, res) => {
    try {
        let { email, username, password, confirmPassword, city, postcode, address } = req.body;

        // Remove whitespace
        email = email?.trim() || "";
        username = username?.trim() || "";
        password = password?.trim() || "";
        confirmPassword = confirmPassword?.trim() || "";
        city = city?.trim() || "";
        postcode = postcode?.trim() || "";
        address = address?.trim() || "";

        // Make sure form was filled
        if (!email || !username || !password || !confirmPassword || !city || !postcode || !address) {
            return res.status(400).send({ message: "Please fill the form." });
        }

        // Validate Email
        const emailIsValid = validator.validate(email);
        if (!emailIsValid) return res.status(400).send({ message: "Email is invalid." });

        // Check if email already exists
        const [emailMatch] = await db.execute(`SELECT * FROM user WHERE email=?`, [email]);
        const emailMatchUser = emailMatch[0];
        if (emailMatchUser) return res.status(400).send({ message: "There is already an account attached to this email." });

        // Check if username already exists
        const [usernameMatch] = await db.execute(`SELECT * FROM user WHERE username=?`, [username]);
        const usernameMatchUser = usernameMatch[0];
        if (usernameMatchUser) return res.status(400).send({ message: "Username is taken." });

        // Check if username and password are the same
        if (password === username) return res.status(400).send({ message: "Username and Password cannot match" });

        // Validate Password (Capital letter, number, special character, 8 characters)
        const regex = /^(?=.*[A-Z])^(?=.*[0-9])(?=.*[\[\]£!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9\[\]£!@#\$%\^\&*\)\(+=._-]{8,}$/;
        const result = regex.test(password);
        if (!result) return res.status(400).send({ message: "Password must be at least 8 characters long and contain at least 1 capital letter, 1 number and 1 special character." });

        // Check passwords match
        if (password !== confirmPassword) return res.status(400).send({ message: "Passwords do not match." });

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // Save user to database
        const user = await db.execute(`INSERT INTO user (email, username, password) VALUES (?, ?, ?);`, [email, username, hashedPassword]);
        const userid = user[0].insertId;
        // Save address to database
        await db.execute(`INSERT INTO address (user_id, city, postcode, address) VALUES (?, ?, ?, ?)`, [userid, city, postcode, address]);
        //Create web token 
        const token = await jwt.sign({ user: { username: username, email: email, role: 1 } }, process.env.SECRET, { expiresIn: '1d' });
        // redirect to homepage
        res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        return res.send({ token });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).send({ message: "Please fill the form." });

        // Find user
        const [row] = await db.execute(`SELECT * FROM user WHERE username=?`, [username]);
        const user = row[0];
        if (!user) {
            return res.status(400).send({ message: "User does not exist." });
        }

        // Compare hashed passwords
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(400).send({ message: "Passwords do not match." });
        }

        // Create web token
        const token = await jwt.sign({ user: { username: user.username, email: user.email, role: user.role_id } }, process.env.SECRET, { expiresIn: '1d' });

        // redirect to homepage
        res.cookie("token", token, { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
        res.send({ token });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

module.exports = router;
