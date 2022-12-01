const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

// Order with ID route
router.get("/orders/:id", auth, async (req, res) => {
    try {
        const order_id = req.params.id;

        // Finds order from ID
        const [order_rows] = await db.execute("SELECT * FROM `order` WHERE order_id=?;", [order_id]);
        const order = order_rows[0];

        // Returns an error if the ID is not valid for any existing order
        if (!order)
            return res.status(400).send({ message: "An order with this ID could not be found." });

        const [user_rows] = await db.execute(`SELECT * FROM user WHERE user_id=?;`, [order.user_id]);
        const user = user_rows[0];

        if (!user)
            return res.status(400).send({ message: "The user linked to this order does not exist. " });

        order.username = user.username;

        // Returns the requested order
        return res.send(order);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// List all Products of a Users Order for User route
router.get("/orders/search/:id", auth, async (req, res) => {
    try {

        // Finds user from id
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE user_id=?`, [req.params.id]);
        const user = user_rows[0];

        if (!user)
            return res.status(400).send({ message: "This user could not be found." });

        const [orders_rows] = await db.execute("SELECT * FROM `order` WHERE user_id=?;", [user.user_id]);
        const orders = orders_rows[0];

        // Returns an error if no orders can be found
        if (!orders)
            return res.status(400).send({ message: "There are currently no orders for this user." });

        // All valid orders are added to the end of the array (even if there is only one, for consistency)
        let orders_list = [];
        orders_rows.forEach(order => {
            order.username = user.username;
            orders_list.push(order);
        })

        const [order_items_rows] = await db.execute(`SELECT * FROM order_item WHERE order_id=?;`, [orders.order_id])
        const order_items = order_items_rows[0];

        if (!order_items)
            return res.status(400).send({ message: "This order has no products." });

        // All products from the orders are added to the end of the array (even if there is only one, for consistency)
        let products_list = [];
        for (const product of order_items_rows) {
            const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?`, [product.product_id]);
            products_list.push(product_rows[0]);
        }

        // Returns the list of orders and the products linked to those orders
        return res.send({ orders: orders_list, products: products_list });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// List all Orders route (requires admin)
router.get("/orders", adminAuth, async (req, res) => {
    try {
        // Searches for all orders, as well as pulling usernames from the user table
        const [orders_rows] = await db.execute("SELECT * FROM `order` AS o INNER JOIN user AS u ON o.user_id = u.user_id");
        const orders = orders_rows[0];

        // Returns an effor if no orders can be found
        if (!orders) return res.status(400).send({ message: "There are currently no orders." });

        // All valid orders are added to the end of the array (even if there is only one, for consistency)
        let orders_list = []
        orders_rows.forEach(order => {
            orders_list.push(order);
        })

        // Returns the list of orders - without products
        return res.send({ orders: orders_list });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

router.post("/orders", auth, async(req, res) =>{
    console.log(req.body);
})

// Create a new Order route (requires admin)
router.post("/orders/:id", adminAuth, async (req, res) => {

    try {
        let { user_id, address, postcode, order_total, quantity } = req.body;

        address = address?.trim() || "";
        postcode = postcode?.trim() || "";

        // Checks if the order total is a valid float value
        if (isNaN(parseFloat(order_total)))
            return res.status(400).send({ message: "The inputted order total must be a valid float value." });

        if (!Number.isInteger(parseInt(quantity)))
            return res.status(400).send({ message: "The inputted quantity must be a valid integer value." });

        // Checks if all fields have been filled
        if (!address || !postcode || !order_total)
            return res.status(400).send({ message: "Please fill in the form." });

        // Ensures the total is in correct format
        order_total = (Math.round(order_total * 100) / 100).toFixed(2);

        // Validates postcode
        const postcode_regex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} ?[0-9][A-Z]{2}$/i;
        const postcode_result = postcode_regex.test(postcode);
        if (!postcode_result)
            return res.status(400).send({ message: "You have inputted an invalid postcode." });

        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send({ message: "A product with this ID could not be found." });

        // Gets user from user id
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE user_id=?`, [user_id]);
        const user = user_rows[0];

        // Returns an error if the user is not found
        if (!user)
            return res.status(400).send({ message: "A user with this ID could not be found." });

        // Creates a new order entry, using the user_id and product_id and stores the order_id
        const order = await db.execute("INSERT INTO `order` (user_id, product_id, order_date, address, postcode, order_total) VALUES (?, ?, ?, ?, ?, ?);",
            [user_id, product_id, new Date(), address, postcode, order_total]);
        const order_id = order[0].insertId;

        await db.execute(`INSERT INTO order_item (product_id, order_id, quantity) VALUES (?, ?, ?);`, [product_id, order_id, quantity])

        // Returns the order id, which can be queried using GET orders/:id 
        return res.send(order_id.toString());
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Update an existing Order route
router.post("/orders/:id", auth, async (req, res) => {
    try {

        //  const order_id = req.params.id;

        //  let { product_id, order_date, address, postcode, order_total, quantity } = req.body;

        address = address?.trim() || "";
        postcode = postcode?.trim() || "";

        // Checks if the order total is a valid float value
        if (isNaN(parseFloat(order_total)))
            return res.status(400).send({ message: "The inputted order total must be a valid float value." });

        if (!Number.isInteger(parseInt(quantity)))
            return res.status(400).send({ message: "The inputted quantity must be a valid integer value." });

        // Checks if all fields have been filled
        if (!address || !postcode || !order_total)
            return res.status(400).send({ message: "Please fill in the form." });

        // Ensures the total is in correct format
        order_total = (Math.round(order_total * 100) / 100).toFixed(2);

        // Validates postcode
        const postcode_regex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} ?[0-9][A-Z]{2}$/i;
        const postcode_result = postcode_regex.test(postcode);
        if (!postcode_result)
            return res.status(400).send({ message: "You have inputted an invalid postcode." });

        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send({ message: "A product with this ID could not be found." });

        // Gets username from token
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET);

        // Gets user from username
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE username=?`, [decode.data]);
        const user = user_rows[0];

        // Returns an error if the user is not found
        if (!user)
            return res.status(400).send({ message: "A user with this name could not be found." });

        // Creates a new order entry, using the user_id and product_id and stores the order_id
        const [order] = await db.execute("INSERT INTO `order` (user_id, product_id, order_date, address, postcode, order_total) VALUES (?, ?, ?, ?, ?, ?);",
            [user.user_id, product_id, new Date(), address, postcode, order_total]);
        const order_id = order[0].insertId;

        await db.execute(`INSERT INTO order_item (product_id, order_id, quantity) VALUES (?, ?, ?);`, [product_id, order_id, quantity])

        // Returns the order id, which can be queried using GET orders/:id 
        return res.send(order_id.toString());
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

module.exports = router;