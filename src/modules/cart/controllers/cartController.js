const { models } = require('../../../../config/sequelizeConfig');
const { Cart } = models;

// Add item to the cart
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token
    const { productId, quantity } = req.body;

    // Find existing cart for user
    let cart = await Cart.findOne({
      where: { user_id: userId }
    });

    let cartItems = [];
    if (cart) {
      cartItems = cart.items || [];
    }

    // Add or update item in the cart
    const itemIndex = cartItems.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cartItems[itemIndex].quantity += quantity;
    } else {
      cartItems.push({ productId, quantity });
    }

    // Update or create cart
    if (cart) {
      await cart.update({ items: cartItems });
    } else {
      cart = await Cart.create({
        user_id: userId,
        items: cartItems
      });
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

    let cartItems = cart.items || [];
    const itemIndex = cartItems.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      cartItems[itemIndex].quantity = quantity;
      await cart.update({ items: cartItems });
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

    let cartItems = cart.items || [];
    cartItems = cartItems.filter(item => item.productId !== productId);

    await cart.update({ items: cartItems });
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