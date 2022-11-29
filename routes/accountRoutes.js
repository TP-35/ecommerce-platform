const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

router.get("/users/:username", auth, async (req, res) => {
    try {
        const username = req.params.username;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        const user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        // Returns the requested user
        return res.send(user);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

/* Update User route */
router.post("/users/:username", auth, async (req, res) => {
    try {
        var oldUsername = req.body.oldUsername;

        const [rows] = await db.execute("SELECT user_id FROM user WHERE username=?", [oldUsername]);
        const user_id = rows[0].user_id;

        var { newUsername, password, email, role } = req.body;

        // Remove whitespace
        newUsername = newUsername?.trim() || "";
        password = password?.trim() || "";
        email = email?.trim() || "";

        // Validate bases to ensure query can be made
        if (role != 1 && role != 2) return res.status(400).send({ message: "You have inputted an incorrect role id." })
        if (!newUsername) return res.status(400).send({ message: "You can not use a blank name." });

        if (oldUsername == req.token.user.username) return res.status(400).send({ message: "You can not edit an account you are logged into. "})

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
            var [new_user_rows] = await db.execute(`UPDATE user SET username=?, password=?, email=? WHERE user_id=?;`, [newUsername, hashedPassword, email, user_id]);
        } else {
            var [new_user_rows] = await db.execute(`UPDATE user SET username=?, email=? WHERE user_id=?;`, [newUsername, email, user_id]);
        }
        const new_user = new_user_rows[0];
        res.status(200).send( {user : new_user });
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