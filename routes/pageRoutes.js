const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const jwt = require("jsonwebtoken");

//todo Render each page
router.get("/", async (req, res) => {
    let token;
    
    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch(e) {
            token = null;
        }
    }
    
    res.render("index.ejs", {token});
})

router.get("/aboutus", (req, res) => {
    res.render("aboutus.ejs");
})

router.get("/contactus", (req, res) => {
    res.render("contactus.ejs");
})

router.get("/login", (req, res) => {
    res.render("login.ejs");
})

router.get("/signup", (req, res) => {
    res.render("signup.ejs");
})

router.get("/account", (req, res) => {
    res.render("account.ejs");
})

router.get("/changepassword", (req, res) => {
    res.render("changePass.ejs");
})

module.exports = router;
