const express = require("express");
const bcrypt = require("bcrypt");
const db = require("../db");
const router = express.Router();
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

// Add product to Basket of user
router.post("/basket/:id", auth, async (req, res) => {
    try {

        const username = req.token.user.username;
        const product_id = req.params.id;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        const [product_row] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        let product = product_row[0];

        if (!product)
            return res.status(400).send({ message: "This product could not be found." });

        const basket_rows = await db.execute(`INSERT INTO basket (user_id, product_id) VALUES (?, ?);`, [user.user_id, product.product_id]);
        let basket_id = basket_rows[0].insertId;

        // Returns the product added to basket
        return res.send(basket_id.toString());
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

//Delete product from basket
router.delete("/basket/remove/:id", auth, async (req, res) => {
    try {

        const username = req.token.user.username;
        const basket_id = req.params.id;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        await db.execute(`DELETE FROM basket WHERE basket_id=?`, [basket_id]);

        return res.send(basket_id);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// List current Basket of user
router.get("/basket", auth, async (req, res) => {

    try {
        const username = req.token.user.username;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        const [basket_rows] = await db.execute(`SELECT * FROM basket WHERE user_id=?;`, [user.user_id]);
        let basket = basket_rows[0];

        if (!basket)
            return res.status(400).send({ message: "This user does not have a basket yet." });

        // All valid basket products are added to the end of the array (even if there is only one, for consistency)
        let basket_list = []
        basket_rows.forEach(basket => {
            basket_list.push(basket);
        })

        // All products from the orders are added to the end of the array (even if there is only one, for consistency)
        let products_list = [];
        for (const product of basket_rows) {
            const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?`, [product.product_id]);
            products_list.push(product_rows[0]);
        }

        // Returns the list of products in the basket
        return res.send({ basket: basket_list, products: products_list });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Remove basket
router.get("/remove/basket", auth, async (req, res) => {
    try {
        const username = req.token.user.username;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        // Removes all entries of the users basket
        await db.execute(`DELETE FROM basket WHERE user_id=?;`, [user.user_id]);
        return res.send({ message: "Basket has been cleared. "});
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Checkout basket
router.post("/checkout", auth, async (req, res) => {
    try {
        const username = req.token.user.username;

        // Finds user from username
        const [user_row] = await db.execute(`SELECT * FROM user WHERE username=?;`, [username]);
        let user = user_row[0];

        // Returns an error if the username is not valid for any existing user
        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        const [address_row] = await db.execute(`SELECT * FROM address WHERE user_id=?;`, [user.user_id]);
        let address = address_row[0];
        
        if (!address)
            return res.status(400).send({ message: "There is no address for this user." });

        const [basket_row] = await db.execute(`SELECT * FROM basket WHERE user_id=?;`, [user.user_id]);
        let basket = basket_row[0];

        if (!basket)
            return res.status(400).send({ message: "You do not have a basket to checkout yet." });

        return res.send({ user: user, address: address, basket: basket_row });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Get total cost of Checkout
router.get("/checkout/total", auth, async (req, res) => {
    const order_total = 0;
    const [order_total_row] = await db.execute(`SELECT * FROM product AS pr INNER JOIN basket AS ba WHERE ba.product_id = pr.product_id`);
    order_total_row.forEach(order => {
        order_total += order.cost;
    })
    return order_total;
})

module.exports = router;