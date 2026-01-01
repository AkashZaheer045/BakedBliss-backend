const { models } = require('../../../../config/sequelizeConfig');
const { Cart } = models;

// Add item to the cart
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token
    const { productId, quantity } = req.body;

    console.log('Adding to cart - userId:', userId, 'productId:', productId, 'quantity:', quantity);

    // Find existing cart for user
    let cart = await Cart.findOne({
      where: { user_id: userId }
    });

    let cartItems = [];
    if (cart) {
      // Make a copy of items to ensure change detection works
      cartItems = JSON.parse(JSON.stringify(cart.items || []));
    }

    // Add or update item in the cart
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cartItems[itemIndex].quantity += quantity;
    } else {
      cartItems.push({ productId, quantity });
    }

    console.log('Cart items to save:', cartItems);

    // Update or create cart
    if (cart) {
      // Explicitly set items and mark as changed for Sequelize to detect JSON changes
      cart.items = cartItems;
      cart.changed('items', true);
      cart.updated_at = new Date();
      await cart.save();
      console.log('Cart updated successfully');
    } else {
      cart = await Cart.create({
        user_id: userId,
        items: cartItems,
        created_at: new Date()
      });
      console.log('Cart created successfully');
    }

    res.status(200).json({ message: "Item added to cart", cart: { items: cartItems } });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Failed to add item", error: error.message });
  }
};

// View cart items
const viewCart = async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token

    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ message: "Cart retrieved", cart: { items: cart.items } });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Failed to retrieve cart", error: error.message });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Make a copy to ensure change detection
    let cartItems = JSON.parse(JSON.stringify(cart.items || []));
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      cartItems[itemIndex].quantity = quantity;
      cart.items = cartItems;
      cart.changed('items', true);
      cart.updated_at = new Date();
      await cart.save();
      return res.status(200).json({ message: "Cart item updated", cart: { items: cartItems } });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Failed to update item", error: error.message });
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId } = req.body;

    const cart = await Cart.findOne({
      where: { user_id: userId }
    });

    if (!cart) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    // Make a copy and filter
    let cartItems = JSON.parse(JSON.stringify(cart.items || []));
    cartItems = cartItems.filter(item => item.productId !== productId);

    cart.items = cartItems;
    cart.changed('items', true);
    cart.updated_at = new Date();
    await cart.save();

    res.status(200).json({ message: "Item removed from cart", cart: { items: cartItems } });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item", error: error.message });
  }
};

module.exports = {
  addItemToCart,
  viewCart,
  updateCartItem,
  removeItemFromCart,
};