const express = require("express");
const router = express.Router();

// Sign-up Route
router.post("/signup", (req, res) =>{
    console.log(req.body);
    const {email, username, password, confirmPassword} = req.body;
    //todo Validate Email
    //todo Validate Username
    
    //todo Validate Password

    if(password !== confirmPassword){
        res.status(400).send();
    }
    //todo Save user to database
    //todo Create web token 
    
    res.send();
})

// Login Route
router.post("/login", (req, res) =>{
    console.log(req.body);

    res.send();
})

module.exports = router;