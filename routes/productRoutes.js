const express = require("express");
const router = express.Router();
const db = require("../db");

module.exports = router;

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
router.post("/products", async (req, res) => {
    try {
        let { name, description, category, cost, shipping_cost, image, quantity } = req.body;

        // Removes whitespace (optional chaining operation => avoid having to check if each reference is valid before trim)
        name = name?.trim() || "";
        description = description?.trim() || "";
        category = category?.trim() || "";
        image = image?.trim() || "";

        // Quantity/stock inputted must be a valid integer
        if (!Number.isInteger(quantity)) quantity = 0;

        // Accepts a quantity of 0, which will not be listed as a valid product
        if (!name || !description || !category || !cost || !shipping_cost || !image || (!quantity && quantity !== 0))
            return res.status(400).send("Please fill in the form.");
        
        // Checks if the name of the product already exists
        const [nameExists] = await db.execute("SELECT * FROM product WHERE name=?", [name]);
        if (nameExists[0]) return res.status(400).send("This name has already been used for a product. Please change it.");

        // Checks if the cost and shipping cost are valid float values
        if (cost % 1 !== 0) return res.status(400).send("The inputted cost must be a valid float value.");
        if (shipping_cost % 1 !== 0) return res.status(400).send("The inputted shipping cost must be a valid float value.");

        // Checks if the image already exists for another product
        const [imageExists] = await db.execute("SELECT * FROM product WHERE image=?", [image]);
        if (imageExists[0]) return res.status(400).send("This image has already been used for a product. Please change it.");

        // Checks if the quantity is a valid integer value
        if (!Number.isInteger(quantity)) return res.status(400).send("The inputted quantity must be a valid integer number.");

        // Creates a new inventory entry and stores the id
        const inventory = await db.query(`INSERT INTO inventory (quantity) VALUES (?);`, [quantity]);
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