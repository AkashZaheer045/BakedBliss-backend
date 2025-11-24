const { db } = require('../../../config/firebaseConfig');

// Confirm and place an order
const confirmOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { cartItems, deliveryAddress } = req.body;

    const newOrder = {
      userId, 
      cartItems,
      deliveryAddress,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('Orders').add(newOrder);
    res.status(200).json({ message: "Order placed successfully", orderId: orderRef.id });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Failed to place order", error });
  }
};

// View order history
const viewOrderHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    const ordersSnapshot = await db.collection('Orders').where('userId', '==', userId).get();
    const orders = ordersSnapshot.docs.map(doc => ({ orderId: doc.id, ...doc.data() }));

    res.status(200).json({ message: "Order history retrieved", orders });
  } catch (error) {
    console.error("Error retrieving order history:", error);
    res.status(500).json({ message: "Failed to retrieve order history", error });
  }
};

// Track order status
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const orderSnapshot = await db.collection('Orders').doc(orderId).get();
    if (!orderSnapshot.exists) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderData = orderSnapshot.data();
    res.status(200).json({ message: "Order status retrieved", status: orderData.status });
  } catch (error) {
    console.error("Error retrieving order status:", error);
    res.status(500).json({ message: "Failed to retrieve order status", error });
  }
};

module.exports = {
  confirmOrder,
  viewOrderHistory,
  getOrderStatus,
};