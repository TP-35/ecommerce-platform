const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const fetch = require("node-fetch");
const adminAuth = require("../middleware/adminauth.js");

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

router.get("/updateuser", adminAuth, async (req, res) => {
    const [userResponse] = await Promise.all([
        await fetch("http://localhost:3000/users", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const users = await userResponse.json();
    res.render("admin/updateuser.ejs", { users: users });
})

router.get("/listorders", adminAuth, async (req, res) => {
    const [orderResponse] = await Promise.all([
        await fetch("http://localhost:3000/orders", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const orders = await orderResponse.json();
    res.render("admin/listorders.ejs", { orders: orders });
})

router.get("/listproducts", adminAuth, async (req, res) => {
    const [productResponse] = await Promise.all([
        await fetch("http://localhost:3000/products", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const products = await productResponse.json();
    res.render("admin/listproducts.ejs", { products: products });
})

router.get("/listusers", adminAuth, async (req, res) => {
    const decode = await jwt.verify(req.cookies.token, process.env.SECRET);
    req.token = decode;


    const [userResponse] = await Promise.all([
        await fetch("http://localhost:3000/users", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const users = await userResponse.json();
    res.render("admin/listusers.ejs", { users: users });
})

router.get("/admin", adminAuth, async (req, res) => {
    const [userResponse, productResponse] = await Promise.all([
        await fetch("http://localhost:3000/users", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        }),
        await fetch("http://localhost:3000/products", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const users = await userResponse.json();
    const products = await productResponse.json();

    res.render("admin/adminpanel.ejs", { users: users, products: products });
})

module.exports = router;
