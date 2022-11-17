const express = require("express");
const ejs = require("ejs");

const app = express();

app.use(express.json())
app.set('view engine', 'ejs');

app.get("/", (req, res) =>{
    res.render("index.ejs");
})

// Sign up route
app.post("/signup", (req, res) =>{
    console.log(req.body);
    const {email, username, password, confirmPassword} = req.body;
    //todo Validate Email
    //todo Validate Username
    
    //todo Validate Password

    if(password !== confirmPassword){
        res.status(400).send();
    }
    //todo Save user to database
    //todo Create web token 
    
    res.send();
})

app.post("login", (req, res) =>{
    console.log(req.body);

    res.send();
})

app.listen(3000, () => console.log("Server running on port 3000"));