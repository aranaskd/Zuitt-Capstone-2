const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: [true, 'Order ID is required']
    },
    productsOrdered: [
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
    },
    status: {
        type: String,
        default: "Pending"
    }

});

module.exports = mongoose.model('Order', orderSchema);