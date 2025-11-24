const { db } = require('../../../config/firebaseConfig');

// Add item to the cart
const addItemToCart = async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token
    const { productId, quantity } = req.body;

    const cartRef = db.collection('Carts').doc(userId);
    const cartSnapshot = await cartRef.get();
    let cart = [];

    if (cartSnapshot.exists) {
      cart = cartSnapshot.data().items;
    }

    // Add or update item in the cart
    const itemIndex = cart.findIndex(item => item.productId === productId);
    if (itemIndex > -1) {
      cart[itemIndex].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    await cartRef.set({ items: cart });
    res.status(200).json({ message: "Item added to cart", cart });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ message: "Failed to add item", error });
  }
};

// View cart items
const viewCart = async (req, res) => {
  try {
    const userId = req.user.uid; // Get user ID from token
    const cartSnapshot = await db.collection('Carts').doc(userId).get();

    if (!cartSnapshot.exists) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json({ message: "Cart retrieved", cart: cartSnapshot.data() });
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Failed to retrieve cart", error });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId, quantity } = req.body;

    const cartRef = db.collection('Carts').doc(userId);
    const cartSnapshot = await cartRef.get();

    if (!cartSnapshot.exists) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    let cart = cartSnapshot.data().items;
    const itemIndex = cart.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      cart[itemIndex].quantity = quantity;
      await cartRef.set({ items: cart });
      return res.status(200).json({ message: "Cart item updated", cart });
    } else {
      return res.status(404).json({ message: "Item not found in cart" });
    }
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Failed to update item", error });
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { productId } = req.body;

    const cartRef = db.collection('Carts').doc(userId);
    const cartSnapshot = await cartRef.get();

    if (!cartSnapshot.exists) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    let cart = cartSnapshot.data().items;
    cart = cart.filter(item => item.productId !== productId);

    await cartRef.set({ items: cart });
    res.status(200).json({ message: "Item removed from cart", cart });
  } catch (error) {
    console.error("Error removing item from cart:", error);
    res.status(500).json({ message: "Failed to remove item", error });
  }
};

module.exports = {
  addItemToCart,
  viewCart,
  updateCartItem,
  removeItemFromCart,
};