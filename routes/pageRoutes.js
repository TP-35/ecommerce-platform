const express = require("express");
const router = express.Router();
const ejs = require("ejs");

//todo Render each page on the page
router.get("/", (req, res) =>{
    res.render("index.ejs");
})

module.exports = router;