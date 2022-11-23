const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {

    // Finds the token that the user is given when they successfully login
    const token = req.headers.authorization.split(" ")[1];
    // Sends an error message if a token could not be found
    if (!token) return res.status(403).send("A token is required for authentication.");

    try {
        // Attempts to decode the token with the SECRET variable
        const decode = await jwt.verify(token, process.env.SECRET);
        req.token = decode;
        return next();
    } catch (e) {
        return res.status(401).send("This is an invalid token, please register a new one.");
    }
}

module.exports = auth;
