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

module.exports = router;