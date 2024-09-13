const { errorHandler } = require("../auth");
const Cart = require("../models/Cart");
const Order = require('../models/Order');

//[SECTION] RETRIEVE USER ORDER
module.exports.retrieveUserOrder = (req, res) => {

	const userId = req.user.id;

	return Order.find({ userId: userId })
	.then(orders => {
		if (!orders || orders.length === 0){
			return res.status(404).json({ message: 'Failed on Find'});
		} else {
            return res.status(200).json({ orders: orders});
        }
	})
	.catch(err => errorHandler(err, req, res));
};

module.exports.retrieveAllUserOrder = (req, res) => {

    return Order.find({})
    .then(orders => {
        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: 'No Orders Found' });
        } else {
            return res.status(200).send({ orders: orders });
        }
    })
    .catch(err => errorHandler(err, req, res));

};
  

// [SECTION] CREATE ORDER
module.exports.createOrder = (req, res) => {
	
    const userId = req.user.id;

    return Cart.findOne({ userId: userId })
    .then(cart => {

        if (!cart) {
            return res.status(404).send({ error: 'Failed to Find'})
        } 
        
        if (cart.cartItems.length < 1){
            return res.status(404).send({ error: 'No Items to Checkout' });
        } else {

            const newOrder = new Order ({
                userId: userId,
                productsOrdered: cart.cartItems,
                totalPrice: cart.totalPrice
            });

            Cart.findByIdAndDelete(cart._id)
            .then(() => {
                return newOrder.save();
            })
            .then(() => {
                return res.status(200).send({ message: 'Ordered Successfully' });
            
            })
            .catch(err => errorHandler(err, req, res));
        }
        
    })
    .catch(err => errorHandler(err, req, res));

};
