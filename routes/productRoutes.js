const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth.js");

// Product with ID route
router.get("/products/:id", async (req, res) => {
    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send("A product with this ID could not be found.");

        // Returns the requested product
        return res.send(product);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

// List all Products route
router.get("/products", async (req, res) => {
    try {
        // Finds all products with a valid stock (quantity > 0)
        const [products_rows] = await db.execute(`SELECT * FROM product tb1
        JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
        WHERE tb2.quantity > 0;`);
        const products = products_rows[0];

        // Returns an error if there are no products currently stored in the table
        if (!products)
            return res.status(400).send("There are currently no products in this table.");

        // All valid products are added to the end of the array (even if there is only one, for consistency)
        let products_list = []
        products_rows.forEach(product => {
            products_list.push(product);
        })
        return res.send(products_list);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

// Create a new Product route
router.post("/products", auth, async (req, res) => {
    try {
        let { name, description, category, cost, shipping_cost, image, quantity } = req.body;

        // Remove whitespace
        name = name?.trim() || "";
        description = description?.trim() || "";
        category = category?.trim() || "";
        image = image?.trim() || "";

        // Checks if the cost and shipping cost are valid float values
        if (isNaN(cost)) return res.status(400).send("The inputted cost must be a valid float value.");
        if (isNaN(shipping_cost)) return res.status(400).send("The inputted shipping cost must be a valid float value.");

        // Checks if the quantity is a valid integer value
        if (isNaN(quantity) || !Number.isInteger(quantity)) return res.status(400).send("The inputted quantity must be a valid integer number.");

        // Accepts a quantity of 0, which will not be listed as a valid product
        // Checks if all fields have been filled
        if (!name || !description || !category || !cost || !shipping_cost || !image || (!quantity && quantity !== 0))
            return res.status(400).send("Please fill in the form.");

        // Ensures correct format used
        cost = (Math.round(cost * 100) / 100).toFixed(2);
        shipping_cost = (Math.round(shipping_cost * 100) / 100).toFixed(2);

        // Checks if the name of the product already exists
        const [nameExists] = await db.execute("SELECT * FROM product WHERE name=?", [name]);
        if (nameExists[0]) return res.status(400).send("This name has already been used for a product. Please change it.");

        // Checks if the image already exists for another product
        const [imageExists] = await db.execute("SELECT * FROM product WHERE image=?", [image]);
        if (imageExists[0]) return res.status(400).send("This image has already been used for a product. Please change it.");

        // Creates a new inventory entry and stores the id
        const inventory = await db.execute(`INSERT INTO inventory (quantity) VALUES (?);`, [quantity]);
        const inventory_id = inventory[0].insertId;

        // Creates a new product entry, using the inventory_id, and stores the id
        const product = await db.execute(`INSERT INTO product (inventory_id, name, description, category, cost, shipping_cost, image) VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [inventory_id, name, description, category, cost, shipping_cost, image]);
        const product_id = product[0].insertId;

        // Returns the product id, which can be queried using GET products/:id 
        return res.send(product_id.toString());
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

// Update an existing Product route
// Only the changed fields should be sent here, not empty fields
router.patch("/products/:id", auth, async (req, res) => {

    // Checks to see if any changed fields are invalid
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'description', 'category', 'cost', 'shipping_cost', 'image', 'quantity'];

    const isValid = updates.every((update) => allowedUpdates.includes(update));
    if (!isValid) return res.status(400).send("You are trying to update an invalid field.");

    // Checks to see if all fields have been left empty
    if (updates.length == 0) return res.status(400).send("No changes have been made.");

    // Checks if the name already exists for another product
    if (updates.includes("name")) {
        const [nameExists] = await db.execute("SELECT * FROM product WHERE name=?", [req.body.name.toString()]);
        if (nameExists[0]) return res.status(400).send("This name has already been used for a product. Please change it.");
    }

    // Checks if the image already exists for another product
    if (updates.includes("image")) {
        const [imageExists] = await db.execute("SELECT * FROM product WHERE image=?", [req.body.image.toString()]);
        if (imageExists[0]) return res.status(400).send("This image has already been used for a product. Please change it.");
    }

    // Ensures the integer/float values are of the correct data type
    if (updates.includes("quantity") && !Number.isInteger(req.body.quantity))
        return res.status(400).send("You have inputted an invalid quantity.");

    if (updates.includes("cost") && req.body.cost % 1 !== 0)
        return res.status(400).send("You have inputted an invalid cost.");

    if (updates.includes("shipping_cost") && req.body.shipping_cost % 1 !== 0)
        return res.status(400).send("You have inputted an invalid shipping cost.");

    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if a product with this ID does not exist
        if (!product)
            return res.status(400).send("A product with this ID could not be found.");

        // Handles the parameter substitution on the client (still safe from SQL injection)
        for (const update of updates) {
            if (update === "quantity")
                await db.query(`UPDATE inventory SET ??=? WHERE inventory_id=?;`, [update, req.body[update].toString(), product.inventory_id])
            else
                await db.query(`UPDATE product SET ??=? WHERE product_id=?;`, [update, req.body[update].toString(), product_id]);
        }

        // Updates the product with the new information
        const [new_product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const new_product = new_product_rows[0];

        // Returns the updated product
        return res.send(new_product);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
});

// Delete an existing Product route
router.delete("/products/:id", auth, async (req, res) => {
    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send("A product with this ID could not be found.");

        // Deletes the product and its respective inventory entry
        await db.execute(`DELETE FROM product WHERE product_id=?;`, [product_id]);
        await db.execute(`DELETE FROM inventory WHERE inventory_id=?;`, [product.inventory_id])

        // Returns the deleted product
        return res.send(product);
    } catch (e) {
        console.log(e);
        return res.status(500).send();
    }
})

module.exports = router;