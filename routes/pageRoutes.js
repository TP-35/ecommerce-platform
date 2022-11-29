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
        } catch (e) {
            token = null;
        }
    }

    res.render("index.ejs", { token });
})

router.get("/aboutus", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    res.render("aboutus.ejs", { token });
})

router.get("/contactus", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    res.render("contactus.ejs", { token });
})

router.get("/login", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.render("/", { token });
        } catch (e) {
            token = null;
        }
    }
    res.render("login.ejs", { token });
})

router.get("/signup", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.render("/", { token });
        } catch (e) {
            token = null;
        }
    }

    res.render("signup.ejs", { token });
})

router.get("/logout", (req, res) =>{
    res.clearCookie("token");
    res.redirect("/");
})

module.exports = router;