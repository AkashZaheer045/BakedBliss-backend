const { models } = require('../../../../config/sequelizeConfig');
const { Order } = models;
const crypto = require('crypto');

// Confirm and place an order
const confirmOrder = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { cartItems, deliveryAddress, totalAmount } = req.body;

    // Generate unique order ID
    const timestamp = Date.now().toString();
    const randomPart = Math.random().toString(36).substring(2, 8);
    const orderId = `order_${timestamp}_${randomPart}`;

    const newOrder = await Order.create({
      order_id: orderId,
      user_id: userId,
      cart_items: cartItems,
      delivery_address: deliveryAddress,
      total_amount: totalAmount,
      status: 'Pending'
    });

    res.status(200).json({ 
      message: "Order placed successfully", 
      orderId: newOrder.order_id,
      order: {
        orderId: newOrder.order_id,
        userId: newOrder.user_id,
        cartItems: newOrder.cart_items,
        deliveryAddress: newOrder.delivery_address,
        totalAmount: newOrder.total_amount,
        status: newOrder.status,
        createdAt: newOrder.created_at
      }
    });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ message: "Failed to place order", error: error.message });
  }
};

// View order history
const viewOrderHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    const orders = await Order.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']]
    });

    const ordersData = orders.map(order => ({
      orderId: order.order_id,
      userId: order.user_id,
      cartItems: order.cart_items,
      deliveryAddress: order.delivery_address,
      totalAmount: order.total_amount,
      status: order.status,
      createdAt: order.created_at
    }));

    res.status(200).json({ message: "Order history retrieved", orders: ordersData });
  } catch (error) {
    console.error("Error retrieving order history:", error);
    res.status(500).json({ message: "Failed to retrieve order history", error: error.message });
  }
};

// Track order status
const getOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findOne({
      where: { order_id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ 
      message: "Order status retrieved", 
      status: order.status,
      order: {
        orderId: order.order_id,
        userId: order.user_id,
        cartItems: order.cart_items,
        deliveryAddress: order.delivery_address,
        totalAmount: order.total_amount,
        status: order.status,
        createdAt: order.created_at
      }
    });
  } catch (error) {
    console.error("Error retrieving order status:", error);
    res.status(500).json({ message: "Failed to retrieve order status", error: error.message });
  }
};

module.exports = {
  confirmOrder,
  viewOrderHistory,
  getOrderStatus,
};