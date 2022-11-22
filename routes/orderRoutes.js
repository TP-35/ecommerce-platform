const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();
const db = require("../db");

// Order with ID route
router.get("/orders/:id", async (req, res) => {
    try {
        const order_id = req.params.id;

        // Finds order from ID
        const [order_rows] = await db.execute(`SELECT * FROM product WHERE order_id=?;`, [order_id]);
        const order = order_rows[0];

        // Returns an error if the ID is not valid for any existing order
        if (!order)
            return res.status(400).send("An order with this ID could not be found.");

        // Returns the requested order
        return res.send(order);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

// List all Orders for User route
router.get("/orders/search/:user", async (req, res) => {
    try {
        // Finds user from username
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE username=?`, [req.params.user]);
        const user = user_rows[0];

        if (!user)
            return res.status(400).send("This user could not be found.");

        const [orders_rows] = await db.execute("SELECT * FROM `order` WHERE user_id=?;", [user.user_id]);
        const orders = orders_rows[0];

        // Returns an error if no orders can be found
        if (!orders)
            return res.status(400).send("There are currently no orders for this user.");

        // All valid orders are added to the end of the array (even if there is only one, for consistency)
        let orders_list = []
        orders_rows.forEach(order => {
            orders_list.push(order);
        })

        // Returns the list of orders
        return res.send(orders_list);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

// Create a new Order route
router.post("/orders/:id", async (req, res) => {
    try {
        let { address, postcode, order_total } = req.body;

        address = address?.trim() || "";
        postcode = postcode?.trim() || "";

        // Checks if all fields have been filled
        if (!address || !postcode || !order_total)
            return res.status(400).send("Please fill in the form.");

        // Checks if the order total is a valid float value
        if (isNaN(order_total))
            return res.status(400).send("The inputted order total must be a valid float value.");

        // Ensures the total is in correct format
        order_total = (Math.round(order_total * 100) / 100).toFixed(2);
            
        // Validates postcode
        const postcode_regex = /^[A-Z]{1,2}[0-9]{1,2}[A-Z]{0,1} ?[0-9][A-Z]{2}$/i;
        const postcode_result = postcode_regex.test(postcode);
        if (!postcode_result)
            return res.status(400).send("You have inputted an invalid postcode.");

        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send("A product with this ID could not be found.");

        // Gets username from token
        const token = req.headers.authorization.split(" ")[1];
        const decode = jwt.verify(token, process.env.SECRET);

        // Gets user from username
        const [user_rows] = await db.execute(`SELECT * FROM user WHERE username=?`, [decode.data]);
        const user = user_rows[0];

        // Returns an error if the user is not found
        if (!user)
            return res.status(400).send("A user with this name could not be found.");

        // Creates a new order entry, using the user_id and product_id and stores the order_id
        const order = await db.execute("INSERT INTO `order` (user_id, product_id, order_date, address, postcode, order_total) VALUES (?, ?, ?, ?, ?, ?);",
            [user.user_id, product_id, new Date(), address, postcode, order_total]);
        const order_id = order[0].insertId;

        // Returns the order id, which can be queried using GET orders/:id 
        return res.send(order_id.toString());
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

module.exports = router;