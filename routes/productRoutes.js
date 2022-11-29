const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/adminauth.js");

// Product with ID route
router.get("/products/:id", async (req, res) => {
    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Finds inventory id from the product
        const inventory_id = product.inventory_id;

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send({ message: "A product with this ID could not be found." });

        const [quantity_row] = await db.execute(`SELECT quantity FROM inventory WHERE inventory_id=?;`, [inventory_id]);
        product.quantity = quantity_row[0].quantity;

        // Returns the requested product
        return res.send(product);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// List all available Products route (used to list available products)
router.get("/products", auth, async (req, res) => {
    try {
        // Finds all products, with a valid stock (quantity > 0)
        const [products_rows] = await db.execute(`SELECT * FROM product tb1
        JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
        WHERE tb2.quantity > 0 ORDER BY product_id;`);
        const products = products_rows[0];

        // Returns an error if there are no products currently stored in the table
        if (!products)
            return res.status(400).send({ message: "There are currently no products in this table." });

        // All valid products are added to the end of the array (even if there is only one, for consistency)
        let products_list = []
        products_rows.forEach(product => {
            products_list.push(product);
        })

        // Returns the requested products
        return res.send(products_list);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// List all Products route (requires admin) - used to edit stock
router.get("/admin/products", adminAuth, async (req, res) => {
    try {
        // Finds all products, with or without a valid stock (so that they may be edited)
        const [products_rows] = await db.execute(`SELECT * FROM product tb1
        JOIN inventory tb2 ON tb1.inventory_id = tb2.inventory_id
        ORDER BY product_id;`);
        const products = products_rows[0];

        // Returns an error if there are no products currently stored in the table
        if (!products)
            return res.status(400).send({ message: "There are currently no products in this table." });

        // All valid products are added to the end of the array (even if there is only one, for consistency)
        let products_list = []
        products_rows.forEach(product => {
            products_list.push(product);
        })

        return res.send(products_list);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

// Create a new Product route (requires admin)
router.post("/products", adminAuth, async (req, res) => {
    try {
        let { name, description, category, cost, shipping_cost, image, quantity } = req.body;

        // Remove whitespace
        name = name?.trim() || "";
        description = description?.trim() || "";
        category = category?.trim() || "";
        image = image?.trim() || "";

        // Accepts a quantity of 0, which will not be listed as a valid product (only to admins)
        // Checks if all fields have been filled
        if (!name || !description || !category || !cost || !shipping_cost || !image || (!quantity && quantity !== 0))
            return res.status(400).send({ message: "Please fill in the form." });

        // Ensures the integer/float values are of the correct data type
        if (!Number.isInteger(parseInt(quantity)))
            return res.status(400).send({ message: "You have inputted an invalid quantity." });

        if (isNaN(parseFloat(cost)))
            return res.status(400).send({ message: "You have inputted an invalid cost." });
        cost = parseFloat(cost);

        if (isNaN(parseFloat(shipping_cost)))
            return res.status(400).send({ message: "You have inputted an invalid shipping cost." });
        shipping_cost = parseFloat(shipping_cost);

        // Ensures correct format used
        cost = (Math.round(cost * 100) / 100).toFixed(2);
        shipping_cost = (Math.round(shipping_cost * 100) / 100).toFixed(2);

        // Checks if the name of the product already exists
        const [nameExists] = await db.execute("SELECT * FROM product WHERE name=?", [name]);
        if (nameExists[0]) return res.status(400).send({ message: "This name has already been used for a product. Please change it." });

        // Checks if the image already exists for another product
        const [imageExists] = await db.execute("SELECT * FROM product WHERE image=?", [image]);
        if (imageExists[0]) return res.status(400).send({ message: "This image has already been used for a product. Please change it." });

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
        return res.status(500).send(e);
    }
})

// Update an existing Product route (requires admin)
router.post("/products/:id", adminAuth, async (req, res) => {
    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if a product with this ID does not exist
        if (!product)
            return res.status(400).send({ message: "A product with this ID could not be found." });

        // Checks to see if any changed fields are invalid
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'description', 'category', 'cost', 'shipping_cost', 'image', 'quantity'];

        const isValid = updates.every((update) => allowedUpdates.includes(update));
        if (!isValid) return res.status(400).send({ message: "You are trying to update an invalid field." });

        // Checks to see if all fields have been left empty
        if (updates.length == 0) return res.status(400).send({ message: "No changes have been made." });

        var { name, description, category, cost, shipping_cost, image, quantity } = req.body;

        // Remove whitespace
        name = name?.trim() || "";
        description = description?.trim() || "";
        category = category?.trim() || "";
        cost = cost?.trim() || "";
        shipping_cost = shipping_cost?.trim() || "";
        image = image?.trim() || "";
        quantity = quantity?.trim() || "";

        // Checks if the name already exists for another product
        if (name != product.name) {
            const [nameExists] = await db.execute("SELECT * FROM product WHERE name=?", [name]);
            if (nameExists[0]) return res.status(400).send({ message: "This name has already been used for a product. Please change it." });
        }

        // Checks if the image already exists for another product
        if (image != product.image) {
            const [imageExists] = await db.execute("SELECT * FROM product WHERE image=?", [image]);
            if (imageExists[0]) return res.status(400).send({ message: "This image has already been used for a product. Please change it." });
        }

        // Ensures the integer/float values are of the correct data type
        if (!Number.isInteger(parseInt(quantity)))
            return res.status(400).send({ message: "You have inputted an invalid quantity." });

        if (parseFloat(cost) === "NaN")
            return res.status(400).send({ message: "You have inputted an invalid cost." });

        if (parseFloat(shipping_cost) === "NaN")
            return res.status(400).send({ message: "You have inputted an invalid shipping cost." });

        // Ensures correct format used
        cost = (Math.round(cost * 100) / 100).toFixed(2);
        shipping_cost = (Math.round(shipping_cost * 100) / 100).toFixed(2);

        // Updates the product with the new information
        await db.execute(`UPDATE inventory SET quantity=? WHERE inventory_id=?;`, [quantity, product.inventory_id]);
        const [new_product_rows] = await db.execute(`UPDATE product SET name=?, description=?, category=?, cost=?, shipping_cost=?, image=? WHERE product_id=?;`,
            [name, description, category, cost, shipping_cost, image, product.product_id]);
        const new_product = new_product_rows[0];

        // Returns the updated product
        return res.status(200).send({ product: new_product });
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
});

// Delete an existing Product route (requires admin)
router.delete("/products/:id", adminAuth, async (req, res) => {
    try {
        const product_id = req.params.id;

        // Finds product from ID
        const [product_rows] = await db.execute(`SELECT * FROM product WHERE product_id=?;`, [product_id]);
        const product = product_rows[0];

        // Returns an error if the ID is not valid for any existing product
        if (!product)
            return res.status(400).send({ message: "A product with this ID could not be found." });

        // Deletes the product and its respective inventory entry
        await db.execute(`DELETE FROM product WHERE product_id=?;`, [product_id]);
        await db.execute(`DELETE FROM inventory WHERE inventory_id=?;`, [product.inventory_id])

        // Returns the deleted product
        return res.send(product);
    } catch (e) {
        console.log(e);
        return res.status(500).send(e);
    }
})

module.exports = router;