const express = require("express");
const ejs = require("ejs");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

const userRoutes = require("./routes/userRoutes");
const pageRoutes = require("./routes/pageRoutes");
const accountRoutes = require("./routes/accountRoutes");
const orderRoutes = require("./routes/orderRoutes");
const productRoutes = require("./routes/productRoutes");
const basketRoutes = require("./routes/basketRoutes");

// Setup database
require("./db");

// Setup Express
const app = express();
app.use(express.json());
app.use(cookieParser());
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
// Login/Signup Routes
app.use("/", userRoutes);
// Renders pages 
app.use("/", pageRoutes);
// Manages accounts
app.use("/", accountRoutes);
// Order Route
app.use("/", orderRoutes);
// Product Route
app.use("/", productRoutes);
// Basket Route
app.use("/", basketRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));