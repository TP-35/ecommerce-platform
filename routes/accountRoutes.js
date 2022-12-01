const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

// Get user from name 
router.get("/admin/users/:username", adminAuth, async (req, res) => {
    try {
        const username = req.params.username;

        // Finds user from username
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        const user = user_rows[0];

        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        // Returns the requested user
        return res.send(user);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Get signed in users details 
router.get("/users", auth, async (req, res) => {
    try {
        const username = req.token.user.username;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        // Gets users address
        const [address_row] = await db.execute("SELECT * FROM address WHERE user_id=?;", [user.user_id]);
        const address = address_row[0];

        if (!address)
            return res.status(400).send({ message: "User info could not be found." });

        delete user.password;
        user = { ...user, ...address };
        // Returns the requested user
        return res.send(user);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

//  Delete signed in user account
router.delete("/user", auth, async (req, res) => {
    try {
        const { userid } = req.token.user;
        // remove user from database
        await db.execute("DELETE FROM address WHERE user_id = ?;", [userid]);
        await db.execute("DELETE FROM user WHERE user_id = ?;", [userid]);
        return res.send();
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Update signed in users password
router.patch("/user", auth, async (req, res) => {
    try {
        const { userid, username } = req.token.user;
        let { password, confirmPassword } = req.body;

        // Remove whitespace
        password = password?.trim() || "";
        confirmPassword = confirmPassword?.trim() || "";

        // Check form was filled
        if (!password, !confirmPassword) {
            return res.status(400).send({ message: "Please fill the form." });
        }

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

        await db.execute("UPDATE user SET password = ? WHERE user_id = ?;", [hashedPassword, userid]);

        return res.send();
    } catch (e) {
        console.log(e);
        return res.status(500).send({ message: "Internal server error." });
    }
})

// Update User route (requires admin) 
router.post("/users/:username", adminAuth, async (req, res) => {
    try {
        var oldUsername = req.body.oldUsername;

        const [rows] = await db.execute("SELECT user_id FROM user WHERE username=?", [oldUsername]);
        const user_id = rows[0].user_id;

        var { newUsername, password, fullName, email, role } = req.body;

        // Remove whitespace
        newUsername = newUsername?.trim() || "";
        password = password?.trim() || "";
        fullName = fullName?.trim() || "";
        email = email?.trim() || "";

        // Validate bases to ensure query can be made
        if (role != 1 && role != 2) return res.status(400).send({ message: "You have inputted an incorrect role id." })
        if (!newUsername) return res.status(400).send({ message: "You can not use a blank name." });
        if (!fullName) return res.status(400).send({ message: "You can not have a blank full name." });

        if (oldUsername == req.token.user.username) return res.status(400).send({ message: "You can not edit an account you are logged into. " })

        // Make sure form was filled
        if (!newUsername && !password && !email) return res.status(400).send({ message: "Please fill in the form." });

        if (password) {
            // Validate Password (Capital letter, number, special character, 8 characters)
            const regex = /^(?=.*[A-Z])^(?=.*[0-9])(?=.*[\[\]£!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9\[\]£!@#\$%\^\&*\)\(+=._-]{8,}$/;
            const result = regex.test(password);
            if (!result) return res.status(400).send({ message: "Password must be at least 8 characters long and contain at least 1 capital letter, 1 number and 1 special character" });

            // Hash password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            // Update database
            var [new_user_rows] = await db.execute(`UPDATE user SET username=?, password=?, fullname=?, email=? WHERE user_id=?;`, [newUsername, hashedPassword, fullName, email, user_id]);
        } else {
            var [new_user_rows] = await db.execute(`UPDATE user SET username=?, fullname=?, email=? WHERE user_id=?;`, [newUsername, fullName, email, user_id]);
        }
        const new_user = new_user_rows[0];
        res.status(200).send({ user: new_user });
    } catch (e) {
        console.log(e);
        res.status(500).send(e);
    }
})


// List all Users route (requires admin)
router.get("/admin/users", adminAuth, async (req, res) => {
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