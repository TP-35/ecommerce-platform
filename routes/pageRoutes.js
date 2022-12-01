const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const jwt = require("jsonwebtoken");
const adminAuth = require("../middleware/adminauth");
const db = require("../db.js");
const auth = require("../middleware/auth")
const fetch = require("node-fetch");

// Home page
router.get("/", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    // fetch products
    const [products_rows] = await db.execute(`SELECT * FROM product tb1
    JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
    WHERE tb2.quantity > 0 ORDER BY product_id;`);
    const products = products_rows.slice(0, 3);

    res.render("index.ejs", { token, products });
})

// Page for individual products
router.get("/product/:id", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    // query product info
    let product = await db.execute(`SELECT * FROM product WHERE product_id = ?;`, [req.params.id]);
    product = product[0][0];
    //todo if no product render 404
    // query more products
    const [products_rows] = await db.execute(`SELECT * FROM product tb1
    JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
    WHERE tb2.quantity > 0 ORDER BY product_id;`);
    const moreProducts = products_rows.slice(0, 3);


    return res.render("ProductUpClose.ejs", { token, product, moreProducts });
})

router.get("/checkout", async (req, res) => {
    const [checkoutResponse] = await Promise.all([
        await fetch("http://localhost:3000/checkout", {
            method: 'POST',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const checkout = await checkoutResponse.json();

    return res.render("checkout.ejs", { token: req.token, checkout: checkout })
})

// Page for mens clothing
router.get("/mens", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    // fetch products
    const [products_rows] = await db.execute(`SELECT * FROM product tb1
    JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
    WHERE tb2.quantity > 0 AND tb1.gender = "male" ORDER BY product_id;`);
    const products = products_rows;

    res.render("mens.ejs", { token, products });
})

// Page for womens clothing
router.get("/womens", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    const [products_rows] = await db.execute(`SELECT * FROM product tb1
    JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
    WHERE tb2.quantity > 0 AND tb1.gender = "female" ORDER BY product_id;`);
    const products = products_rows;

    res.render("womens.ejs", { token, products });
})

// About us page
router.get("/aboutus", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    res.render("aboutus.ejs", { token: token });
})

// Contact us page
router.get("/contactus", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
        } catch (e) {
            token = null;
        }
    }

    res.render("contactus.ejs", { token: token });
})

// Login page
router.get("/login", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.redirect("/");
        } catch (e) {
            token = null;
        }
    }
    res.render("login.ejs", { token: token });
})

// Sign up page
router.get("/signup", async (req, res) => {
    let token;

    if (req.cookies.token) {
        try {
            token = await jwt.verify(req.cookies.token, process.env.SECRET);
            return res.redirect("/");
        } catch (e) {
            token = null;
        }
    }

    res.render("signup.ejs", { token: token });
})

// Log user out and return to homepage
router.get("/logout", async (req, res) => {
    const [basketResponse] = await Promise.all([
        await fetch("http://localhost:3000/remove/basket", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);
    
    res.clearCookie("token");
    res.redirect("/");
})

// Account info
router.get("/myaccount", auth, async (req, res) => {
    let token = req.token;
    res.render("account.ejs", { token });
})

// Change password
router.get("/changepassword", auth, async (req, res) => {
    let token = req.token;
    return res.render("changePass.ejs", { token });
})

// Get basket
router.get("/showbasket", auth, async (req, res) => {
    const [basketResponse] = await Promise.all([
        await fetch("http://localhost:3000/basket", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const basket = await basketResponse.json();

    res.render("basket.ejs", { token: req.token, basket: basket, products: basket.products });

})

// Update basket
router.get("/basket/:id", auth, async (req, res) => {
    const [basketResponse] = await Promise.all([
        await fetch("http://localhost:3000/basket/" + req.params.id, {
            method: 'POST',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const basket = await basketResponse.json();

    res.redirect("/showbasket");
})

// Remove product from  basket
router.get("/basket/remove/:id", auth, async (req, res) => {
    const [basketResponse] = await Promise.all([
        await fetch("http://localhost:3000/basket/remove/" + req.params.id, {
            method: 'DELETE',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const basket = await basketResponse.json();

    res.redirect("/showbasket");
})

// Orders page (unfinished)
//todo Query orders and display on page
router.get("/myorders", auth, async (req, res) => {
    const [orderResponse] = await Promise.all([
        await fetch("http://localhost:3000/orders", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const orders = await orderResponse.json();

    return res.render("myOrders.ejs", { token: req.token, order: orders, orders: orders.orders, products: orders.products });
})

// Lists all available orders (uses input from orders route)
router.get("/listorders", adminAuth, async (req, res) => {
    const [orderResponse] = await Promise.all([
        await fetch("http://localhost:3000/admin/orders", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const orders = await orderResponse.json();

    res.render("admin/listorders.ejs", { token: req.token, orders: orders });
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

    res.render("admin/listproducts.ejs", { token: req.token, products: products });
})

// Lists all available users (uses input frm users route)
router.get("/listusers", adminAuth, async (req, res) => {
    const [userResponse] = await Promise.all([
        await fetch("http://localhost:3000/admin/users", {
            method: 'GET',
            headers: {
                'Authorization': req.cookies.token,
            }
        })
    ]);

    const users = await userResponse.json();
    res.render("admin/listusers.ejs", { token: req.token, users: users });
})

// Renders the update user page, which will take a username as an input
router.get("/updateuser/:username", adminAuth, async (req, res) => {
    const [userResponse] = await Promise.all([
        await fetch("http://localhost:3000/admin/users/" + req.params.username, {
            method: 'GET',
            headers: {
                'Authorization': req.token,
            }
        })
    ])

    const user = await userResponse.json();

    res.render("admin/updateuser.ejs", { token: req.token, user: user });
})

// Renders the add product page
router.get("/addproduct", adminAuth, async (req, res) => {
    res.render("admin/addproduct.ejs", { token: req.token });
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

    res.render("admin/updateproduct.ejs", { token: req.token, product: product });
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

    res.render("admin/listorderproducts.ejs", { token: req.token, orders: orders, products: orders.products });
})

// Renders the admin page (uses input from users and products)
router.get("/admin", adminAuth, async (req, res) => {
    const [userResponse, productResponse] = await Promise.all([
        await fetch("http://localhost:3000/admin/users", {
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

    res.render("admin/adminpanel.ejs", { token: req.token, users: users, products: products });
})

module.exports = router;