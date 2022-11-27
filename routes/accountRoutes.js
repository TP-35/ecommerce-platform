const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

/* Update user account
    todo verify user is logged in (auth middleware)
    todo take username from token
    ? Change username or email 
*/

router.patch("/:username", auth, async (req, res) => {
    try {
        const { username } = req.params;
        let { password, confirmPassword } = req.body;

        // Remove whitespace
        password = password?.trim() || "";
        confirmPassword = confirmPassword?.trim() || "";

        // Make sure form was filled
        if (!password || !confirmPassword) return res.status(400).send({ message: "Please fill the form." });

        // Validate Password (Capital letter, number, special character, 8 characters)
        const regex = /^(?=.*[A-Z])^(?=.*[0-9])(?=.*[\[\]£!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9\[\]£!@#\$%\^\&*\)\(+=._-]{8,}$/;
        const result = regex.test(password);
        if (!result) return res.status(400).send("Password must be at least 8 characters long and contain at least 1 capital letter, 1 number and 1 special character");

        // Check passwords match
        if (password !== confirmPassword) return res.status(400).send({ message: "Passwords do not match." });

        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Update database
        await db.execute(`UPDATE user SET password = ? WHERE username = ?;`, [hashedPassword, username]);

        return res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

/*  Delete user account
    todo verify user is logged in (auth middleware)
*/
router.delete("/:username", auth, async (req, res) => {
    try {
        const { username } = req.params;
        // remove user from database
        db.execute("DELETE FROM user WHERE username = ?;", [username]);
        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})

// List all Users route (requires admin)
router.get("/users", adminAuth, async (req, res) => {
    try {
        const [users_rows] = await db.execute(`SELECT * FROM user ORDER BY user_id;`);
        const users = users_rows[0];

        // Returns an error if there are no users currently stored in the table
        if (!users)
            return res.status(400).send({ message: "There are currently no users in this table." });

        // All users are added to the end of the array
        let users_list = []
        users_rows.forEach(user => {
            users_list.push(user);
        })

        // Returns the list of users
        return res.send(users_list);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})


module.exports = router;