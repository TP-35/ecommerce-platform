const express = require("express");
const ejs = require("ejs");
const userRoutes = require("./routes/userRoutes");
const pageRoutes = require("./routes/pageRoutes");
const accountRoutes = require("./routes/accountRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Setup database
require("./db");

// Setup Express
const app = express();
app.use(express.json())
app.set('view engine', 'ejs');

// Login/Signup Routes
app.use("/", userRoutes);
// Renders pages 
app.use("/", pageRoutes);
// Manages accounts
app.use("/account", accountRoutes);
// Product Route
app.use("/", productRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));