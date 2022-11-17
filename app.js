const express = require("express");
const ejs = require("ejs");
const userRoutes = require("./routes/userRoutes");
const pageRoutes = require("./routes/pageRoutes");
require("dotenv").config();
// Setup database
require("./db.js");

// Setup Express
const app = express();
app.use(express.json())
app.set('view engine', 'ejs');

// Login/Signup Routes
app.use("/", userRoutes);
// Renders pages 
app.use("/", pageRoutes);

app.listen(3000, () => console.log("Server running on port 3000"));