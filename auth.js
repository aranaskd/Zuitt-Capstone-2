const jwt = require("jsonwebtoken");
require('dotenv').config();

// [SECTION] Token Creation
/*
    Analogy: 
        Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {
    const data = {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin
    };
    // Generate a JSON web token using the jwt's sign method
    // Generates the token using the data and the secret key from .env
    // The secret key is used for encrypting data, ensuring it's difficult to decode without the key
    return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
};

// [SECTION] Token Verification
/*
    Analogy: 
        Receive the gift and open the lock to verify if the sender is legitimate and the gift was not tampered with.
    - Verify is used as middleware in ExpressJS.
    - Middleware functions receive the request and response objects, as well as the next() function.
*/
module.exports.verify = (req, res, next) => {
    let token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ auth: "Failed. No Token" });
    } else {
        token = token.slice(7); // Remove 'Bearer ' prefix

        jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                return res.status(403).json({
                    auth: "Failed",
                    message: err.message
                });
            } else {
                req.user = decodedToken; // Attach decoded token to the request
                next(); // Proceed to the next middleware/controller
            }
        });
    }
};

// [SECTION] Verify Admin
module.exports.verifyAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next(); // Proceed if the user is an admin
    } else {
        return res.status(403).json({
            auth: "Failed",
            message: "Action Forbidden"
        });
    }
};

// [SECTION] Error Handler
module.exports.errorHandler = (err, req, res, next) => {
    console.error(err);

    const statusCode = err.status || 500;
    const errorMessage = err.customError || 'Internal Server Error';

    res.status(statusCode).json({
        error: errorMessage,
        details: err.message || err
    });
};

// [SECTION] Check User if Logged-in
module.exports.isLoggedIn = (req, res, next) => {
    if (req.user) {
        next(); // Proceed if the user is logged in
    } else {
        res.sendStatus(401); // Unauthorized if not logged in
    }
};
