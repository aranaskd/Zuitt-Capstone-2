const { errorHandler } = require('../auth');

// [SECTION] IMPORT MODELS
const Product = require('../models/Product');
const Cart = require('../models/Cart');

// [SECTION] GET USER CART
module.exports.getCart = (req, res) => {

    const userId = req.user.id;

    if(req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin is Forbidden' });
    }

    return Cart.findOne({ userId: userId })
    .then(cart => {

        if(!cart) {
            return res.status(404).json({ message: 'User Cart Not Found' })
        }
        
        return res.status(200).json({ cart: cart })
        
    })
    .catch(error => {
        console.log(error);
        return res.status(500).json({ error: 'Internal Server Error', error});
    })

};

// [SECTION] ADD TO CART

module.exports.addToCart = (req, res) => {
    
    const userId  = req.user.id;
    const { productId, quantity, subtotal } = req.body;

    return Cart.findOne({ userId: userId })
    .then(cart => {
        console.log({ cart: cart });
        if(!cart) {
            const newCart = new Cart({
                userId: userId,
                cartItems: [{
                    productId: productId,
                    quantity: quantity,
                    subtotal: subtotal
                }],
                totalPrice: subtotal
            })

            return newCart.save()
            .then(savedCart => {
                if(!savedCart){
                    return res.status(404).send({error: "Failed to save cart"});
                } else {
                    return res.status(201).send({ 
                        message: "Item added to cart successfully",
                        cart: savedCart
                    });
                }
            })
            .catch(error => res.status(500).json({ error: 'Internal server Error', error }))
        } else {
            const cartItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

            if(cartItemIndex >= 0) {
                cart.cartItems[cartItemIndex].quantity += quantity;
                cart.cartItems[cartItemIndex].subtotal += subtotal; 
            } else {
                const newCartItem = {
                    productId: productId,
                    quantity: quantity,
                    subtotal: subtotal
                };
                cart.cartItems.push(newCartItem);
            }

            cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            return cart.save()
            .then(addCart => {
                return res.status(201).json({ 
                    message: 'Item added to cart successfully',
                    cart: addCart
                })
            })
            .catch(error => res.status(500).json({ error: 'Internal server Error', error }))
        }
    }) 
    .catch(error => res.status(500).json({ error: 'Failed to find cart', error }))

}

// [SECTION] Update Cart Quantity
module.exports.updateCartQuantity = async (req, res) => {

    try {
        const userId = req.user.id; // Assuming you have already validated the JWT and set req.user
        const { _id, newQuantity, subtotal } = req.body;
        const productId = _id;
        
        // Step 3: Find the cart of the user using the user's id
        let cart = await Cart.findOne({ userId });

        // Step 4: Check if cart exists for this user
        if (!cart) {
            return res.status(404).json({ message: "No cart found for this user" });
        }

        // Step 5: Check if the cartItems array contains the productId to update
        const itemIndex = cart.cartItems.findIndex(item => item.productId === productId);

        if (itemIndex !== -1) {
            // Step 5a: If product exists in cart, update its quantity and subtotal
            const price = cart.cartItems[itemIndex].subtotal / cart.cartItems[itemIndex].quantity;

            cart.cartItems[itemIndex].quantity = newQuantity;
            cart.cartItems[itemIndex].subtotal = price * newQuantity;
        } else {
            // Step 5b: If product does not exist, add it to cartItems
            cart.cartItems.push({ 
                productId, 
                quantity: newQuantity, 
                subtotal });
        }

        // Step 5: Recalculate the totalPrice
        cart.totalPrice = cart.cartItems.reduce((acc, item) => acc + item.subtotal, 0);

        // Step 6: Save the updated cart
        await cart.save();

        // Step 6a: Respond with the updated cart
        return res.status(201).json({ 
            message: "Item quantity updated successfully", 
            updatedCart: cart
        });

    } catch (error) {
        // Step 7: Catch errors and send a message with error details
        return res.status(500).json({ 
            message: "Error updating cart", 
            error: error.message 
        });
    }

//     const userId = req.user.id; // Extracted from validated JWT in your middleware
//   const { _id, newQuantity, productId, subtotal } = req.body;

//   // Find the cart for the current user
//   return Cart.findOne({ userId })
//     .then(cart => {
//       if (!cart) {
//         return res.status(404).json({ message: "Cart not found for this user" });
//       }

//       // Check if product exists in cart
//       const productIndex = cart.cartItems.findIndex(item => item._id.toString() === _id);
//       console.log(productIndex);
//       if (productIndex !== -1) {
//         // Product exists, update the quantity and subtotal

//         const price = cart.cartItems[productIndex].subtotal / cart.cartItems[productIndex].quantity;

//         cart.cartItems[productIndex].quantity = newQuantity;
//         cart.cartItems[productIndex].subtotal = price * newQuantity;
//       } else {
//         // Product does not exist, add new product to cart
//         cart.cartItems.push({ 
//             productId, 
//             quantity: newQuantity, 
//             subtotal });
//       }

//       // Recalculate the total price of the cart
//       cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

//       // Save the updated cart
//       return cart.save();
//     })
//     .then(updatedCart => {
//       // Send the updated cart back to the client
//       res.status(201).json({
//         message: "Item quantity updated successfully",
//         updatedCart: updatedCart,
//       });
//     })
//     .catch(error => {
//       // Handle any errors
//       res.status(500).json({
//         message: "An error occurred while updating the cart",
//         error: error.message,
//       });
//     });

}

// [SECTION] REMOVE PRODUCT FROM CART  
module.exports.removeItem = (req, res) => {

    const userId = req.user.id;
    const { productId } = req.params;

    return Cart.findOne({ userId: userId })
        .then(cart => {
            if (!cart) {
                return res.status(404).send({ message: 'Cart Not Found' });
            }

            // Find the item to be removed
            const itemToRemove = cart.cartItems.find(item => item.productId === productId);
            if (!itemToRemove) {
                return res.status(404).send({ message: 'Item not found in cart' });
            }

            // Remove the item from cartItems array
            cart.cartItems = cart.cartItems.filter(item => item.productId !== productId);

            // Recalculate totalPrice
            const newTotalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

            // Update totalPrice
            cart.totalPrice = newTotalPrice;

            // Save the updated cart
            return cart.save()
                .then(() => {
                    return res.status(200).send({ message: 'Item removed from cart', cart });
                })
                .catch(err => errorHandler(err, req, res));
        })
        .catch(err => errorHandler(err, req, res));

};

// [SECTION] CLEAR CART ITEMS
module.exports.clearCart = (req, res) => {

    const userId = req.user.id;
    const cartList = {
        userId: userId,
        cartItems: [],
        totalPrice: 0
    }

    return Cart.findOneAndUpdate({ userId: userId}, cartList)
    .then(cart => {
        if(cart.cartItems.length === 0 || !cart){
            return res.status(404).send({ message: 'Item not found in cart' });
        } else {
            return Cart.findOne({ userId: userId })
                .then(cart => {
                    return res.status(200).send({ 
                        message: 'Item removed from cart successfully',
                        updatedCart: cart
                    })
                })
                .catch(err => errorHandler(err, req, res));
        }
    })
    .catch(err => errorHandler(err, req, res));

};
