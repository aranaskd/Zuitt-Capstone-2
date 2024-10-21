const Cart = require("../models/Cart");
const Order = require('../models/Order');

// [SECTION] RETRIEVE USER ORDERS
module.exports.retrieveAllUserOrder = async (req, res) => {

    try {

        const orders = await Order.find({});

        if (orders.length === 0) {
            return res.status(404).json({ message: 'No orders found' });
        }

        return res.status(200).json({ orders: orders });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while retrieving orders', error: err.message });
    }

};

// [SECTION] RETRIEVE ALL ORDERS
module.exports.retrieveUserOrder = async (req, res) => {

    try {
        const userId = req.user.id;

        const orders = await Order.find({ userId });

        if (orders.length === 0) {
            return res.status(200).json({ message: 'No orders found' });
        }

        return res.status(200).json({ orders: orders });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'An error occurred while retrieving user orders', error: err.message });
    }

};

// [SECTION] CREATE ORDER
module.exports.createOrder = async (req, res) => {

    try {
        const userId = req.user.id;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (cart.cartItems.length === 0) {
            return res.status(400).json({ error: 'No Items to Checkout' });
        }

        const newOrder = new Order({
            userId: userId,
            productsOrdered: cart.cartItems,
            totalPrice: cart.totalPrice,
        });

        await newOrder.save();

        cart.cartItems = [];
        cart.totalPrice = 0;
        await cart.save();

        return res.status(201).json({
            message: 'Ordered successfully',
            order: newOrder,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while creating the order', error: error.message });
    }

};
