const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: [true, 'Cart ID is required']
    },
    cartItems: [
        {
            productId: {
                type: String,
                required: [true, 'productId is Required']
            },
            quantity: {
                type: Number,
                required: [true, 'quantity is Required']
            },
            subtotal: {
                type: Number,
                required: [true, 'subtotal is Required']
            }
        }
    ],
    totalPrice : {
        type: Number,
        required: [true, 'totalPrice is Required']
    },
    orderedOn: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Cart', cartSchema);