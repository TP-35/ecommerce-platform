const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();

/* Update user account
    todo verify user is logged in (auth middleware)
    ? Change username or email 
*/

router.patch("/:username", async (req, res) =>{
    try{
        const {username} = req.params;
        let {password, confirmPassword} = req.body;
        
        // Remove whitespace
        password = password?.trim() || "";
        confirmPassword = confirmPassword?.trim() || "";
    
        // Make sure form was filled
        if (!password || !confirmPassword) return res.status(400).send("Please fill the form.");
    
        // Validate Password (Capital letter, number, special character, 8 characters)
        const regex = /^(?=.*[A-Z])^(?=.*[0-9])(?=.*[\[\]£!@#\$%\^\&*\)\(+=._-])[a-zA-Z0-9\[\]£!@#\$%\^\&*\)\(+=._-]{8,}$/;
        const result = regex.test(password);
        if (!result) return res.status(400).send("Password must be at least 8 characters long and contain at least 1 capital letter, 1 number and 1 special character");
    
        // Check passwords match
        if (password !== confirmPassword) return res.status(400).send("Passwords do not match.");
    
        // Hash password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        
        // Update database
        await db.execute(`UPDATE user SET password = ? WHERE username = ?;`, [hashedPassword, username]);
    
        return res.send();
    }catch(e){
        console.log(e);
        res.status(500).send();
    }
})

/*  Delete user account
    todo verify user is logged in (auth middleware)
*/
router.delete("/:username",async (req, res) =>{
    try{
        const {username} = req.params;
        // remove user from database
        db.execute("DELETE FROM user WHERE username = ?;", [username]);
        res.send();
    }catch(e){
        console.log(e);
        res.send(500);
    }
})

module.exports = router;