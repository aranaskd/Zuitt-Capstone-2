const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order')
const { verify, verifyAdmin } = require('../auth')

//[SECTION] CREATE ORDER 
router.post("/checkout", verify, orderController.createOrder);

//[SECTION] RETRIEVE LOGGED IN USER'S ORDERS
router.get("/my-orders", verify, orderController.retrieveUserOrder);

//[SECTION] RETRIEVE ALL USER'S ORDERS
router.get("/all-orders", verify, verifyAdmin, orderController.retrieveAllUserOrder);

module.exports = router;
