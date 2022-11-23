const express = require("express");
const router = express.Router();
const ejs = require("ejs");

//todo Render each page on the page
router.get("/", (req, res) =>{
    res.render("index.ejs");
})

router.get("/aboutus", (req, res) =>{
    res.render("aboutus.ejs");
})

router.get("/contactus", (req, res) =>{
    res.render("contactus.ejs");
})

router.get("/login", (req, res) =>{
    res.render("login.ejs");
})

router.get("/signup", (req, res) =>{
    res.render("signup.ejs");
})

module.exports = router;