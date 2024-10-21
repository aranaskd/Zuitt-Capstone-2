// [SECTION] IMPORT MODELS
const Cart = require('../models/Cart');
const Product = require('../models/Product');

// [SECTION] GET USER CART
module.exports.getCart = async (req, res) => {

    try {

        const userId = req.user.id;

        if (req.user.isAdmin) {
          return res.status(403).json({ error: 'Admin users is forbidden.' });
        }

        let cart = await Cart.findOne({ userId: userId });

        if (!cart) {
            return res.status(404).json({ message: 'No cart found for this user.' });
        }

        return res.status(200).json({ cart: cart });

    } catch (error) {
        return res.status(500).json({ 
            message: 'An error occurred while retrieving the cart.', 
            error: error.message 
        });
    }

};

// [SECTION] ADD TO CART
module.exports.addToCart = async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;

      if (req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin users is forbidden.' });
      }
  
      // Prevent admin users from adding items to the cart
      if (req.user.isAdmin) {
        return res.status(403).json({ error: 'Admin users cannot add items to the cart.' });
      }
  
      // Find the product to ensure it exists and get the price
      let product = await Product.findById(productId);

      console.log({product:product})

      if (req.user.isAdmin) {
          return res.status(403).json({ error: 'Admin users is forbidden.' });
        }
  
      // Find the user's cart or create a new one if it doesn't exist
      let cart = await Cart.findOne({ userId: userId });

      console.log(cart)
      if (!cart) {
        cart = new Cart({
          userId: userId,
          cartItems: [{
            productId: productId,
            quantity: quantity,
            subtotal: product.price * quantity  // Calculate subtotal
          }],
          totalPrice: product.price * quantity  // Set totalPrice for new cart
        });
  
        await cart.save();
        return res.status(201).json({
          message: 'Item added to cart successfully',
          cart: cart
        });
      }
  
      // Check if the product already exists in the cart
      const cartItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);
  
      if (cartItemIndex >= 0) {
        // Product exists in the cart, update quantity and subtotal
        cart.cartItems[cartItemIndex].quantity += quantity;
        cart.cartItems[cartItemIndex].subtotal += product.price * quantity;
      } else {
        // Product doesn't exist in the cart, add a new item
        cart.cartItems.push({
          productId: productId,
          quantity: quantity,
          subtotal: product.price * quantity
        });
      }
  
      // Update the totalPrice by summing the subtotals of all cart items
      cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);
  
      // Save the updated cart
      await cart.save();
  
      return res.status(201).json({
        message: 'Item added to cart successfully',
        cart: cart
      });
  
    } catch (error) {
      return res.status(500).json({
        message: 'An error occurred while adding to the cart.',
        error: error.message
      });
    }
};


// [SECTION] UPDATE CART QUANTITY
module.exports.updateCartQuantity = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from validated JWT in your middleware
    const { productId, newQuantity } = req.body; // Assuming request body contains productId and the new quantity

    if (req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin users is forbidden.' });
    }

    // Step 3: Find the cart for the current user
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      // Step 4: If no cart is found for the current user, send a message to the client
      return res.status(404).json({ message: "Cart not found for this user" });
    }

    // Step 5: Check if the cart's cartItems array contains the product to be updated using `find`
    const productItem = cart.cartItems.find(item => item.productId.toString() === productId);

    if (productItem) {
      // Step 5a: Product exists, update the quantity and subtotal
      const pricePerItem = productItem.subtotal / productItem.quantity;

      // Update the quantity and recalculate the subtotal
      productItem.quantity = newQuantity;
      productItem.subtotal = pricePerItem * newQuantity;

      // Recalculate the total price of the cart
      cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

      // Step 6: Save the updated cart document
      const updatedCart = await cart.save();

      // Step 6a: Send a message to the client along with the updated cart contents
      return res.status(201).json({
        message: "Item quantity updated successfully",
        updatedCart: updatedCart,
      });
    } else {
      // If the product is not found, return an error message
      return res.status(404).json({
        message: "Product not found in cart",
      });
    }
  } catch (error) {
    // Step 7: Catch an error while finding or saving and send a message to the client along with error details
    return res.status(500).json({
      message: "Error updating cart",
      error: error.message,
    });
  }
};


// [SECTION] REMOVE PRODUCT FROM CART  
module.exports.removeItem = async (req, res) => {

    try {
        const userId = req.user.id;
        const { productId } = req.params;

        if (req.user.isAdmin) {
          return res.status(403).json({ error: 'Admin users is forbidden.' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const cartItemIndex = cart.cartItems.findIndex(item => item.productId.toString() === productId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' });
        }

        cart.cartItems.splice(cartItemIndex, 1);

        cart.totalPrice = cart.cartItems.reduce((total, item) => total + item.subtotal, 0);

        await cart.save();

        return res.status(200).json({ message: 'Item removed from cart successfully', updatedCart: cart });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while removing the product', error: error.message });
    }

};

// [SECTION] CLEAR CART ITEMS
module.exports.clearCart = async (req, res) => {

    try {
        const userId = req.user.id;

        if (req.user.isAdmin) {
          return res.status(403).json({ error: 'Admin users is forbidden.' });
        }

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        if (cart.cartItems.length === 0) {
            return res.status(404).json({ message: 'Cart is already empty' });
        }

        cart.cartItems = [];

        cart.totalPrice = 0;

        await cart.save();

        return res.status(200).json({ message: 'Cart cleared successfully', cart });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'An error occurred while clearing the cart', error: error.message });
    }

};
