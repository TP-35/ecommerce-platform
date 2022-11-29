const jwt = require("jsonwebtoken");

const adminAuth = async (req, res, next) => {
    // Finds the token that the user is given when they successfully login
    const token = req.cookies.token || req.headers.authorization;
    // Sends an error message if a token could not be found
    if (!token) return res.status(400).send({ message: "A token is required for authentication." })

    try {
        // Attempts to decode the token with the SECRET variable
        const decode = await jwt.verify(token, process.env.SECRET);
        // If user is not an admin then they will be denied access
        if (decode.user.role != 2) return res.status(400).send({ message: "You do not have permission to access this." });
        req.token = decode;
        return next();
    } catch (e) {
        return res.status(400).send({ message: "This is an invalid token, please register a new one. " });
    }
}

module.exports = adminAuth;
