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

router.get("/account", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.render("/", { token });
        } catch (e) {
            token = null;
        }
    }
    res.render("account.ejs", { token });
})

router.get("/changepassword", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.render("/", { token });
        } catch (e) {
            token = null;
        }
    }
    res.render("changePass.ejs", { token });
})



module.exports = router;


// Lists all available orders (uses input from orders route)
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

    res.render("admin/listorders.ejs", { orders: orders.orders, products: orders.products });
})

// Lists all available products (uses input from products route)
router.get("/listproducts", adminAuth, async (req, res) => {
    const [productResponse] = await Promise.all([
        await fetch("http://localhost:3000/admin/products", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const products = await productResponse.json();


    res.render("admin/listproducts.ejs", { products: products });
})

// Lists all available users (uses input frm users route)
router.get("/listusers", adminAuth, async (req, res) => {
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

// Renders the update user page, which will take a username as an input
router.get("/updateuser/:username", adminAuth, async (req, res) => {
    const [userResponse] = await Promise.all([
        await fetch("http://localhost:3000/users/" + req.params.username, {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ])

    const user = await userResponse.json();
    res.render("admin/updateuser.ejs", { user : user });
})

// Renders the add product page
router.get("/addproduct", adminAuth, async (req, res) => {
    res.render("admin/addproduct.ejs");
})

// Renders the update product page, which will take a product id as an input
router.get("/updateproduct/:id", adminAuth, async (req, res) => {
    const [productResponse] = await Promise.all([
        await fetch("http://localhost:3000/products/" + req.params.id, {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ])

    const product = await productResponse.json();

    res.render("admin/updateproduct.ejs", { product : product });
})

// Renders the order products page, taking the id of the user as input 
router.get("/listorderproducts/:id", adminAuth, async (req, res) => {

    const [orderResponse] = await Promise.all([
        await fetch("http://localhost:3000/orders/search/" + req.params.id, {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ])

    const orders = await orderResponse.json();

    res.render("admin/listorderproducts.ejs", { orders : orders.orders, products: orders.products });
})

// Renders the admin page (uses input from users and products)
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

