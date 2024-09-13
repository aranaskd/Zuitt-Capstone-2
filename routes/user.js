const express = require('express');
const router = express.Router();
const userController = require('../controllers/user');
const { verify, verifyAdmin } = require('../auth');


// [SECTION] User Registration, All Access, Post Method
router.post("/register", userController.registerUser);

// [SECTION] User Authentication, All Access,
router.post("/login", userController.loginUser);

// [SECTION] Get User Details
router.get("/details", verify, userController.getProfile);

// [SECTION] Update User as Admin, Admin-Only Access, PATCh Method
router.patch("/:id/set-as-admin", verify, verifyAdmin, userController.setUserAdmin);

// [SECTION] Update Password, Authenticated User Access, PATCH Method
router.patch("/update-password", verify, userController.resetPassword);

module.exports = router;
