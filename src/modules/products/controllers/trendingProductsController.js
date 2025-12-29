const { models } = require('../../../../config/sequelizeConfig');
const { Product } = models;

// Trending: top rated products
const getTrendingProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      order: [['rating', 'DESC']],
      limit: 10
    });

    return res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch trending products' });
  }
};

// Recommendations: simple heuristic based on user's past orders
const getRecommendations = async (req, res) => {
  try {
    const { Order } = models;
    const userId = req.params.userId;

    // Fetch user's orders
    const orders = await Order.findAll({
      where: { user_id: userId }
    });

    if (orders.length === 0) {
      // no history -> fallback to trending
      return getTrendingProducts(req, res);
    }

    // Count categories in user's orders
    const categoryCounts = {};
    orders.forEach(order => {
      const products = order.cart_items || [];
      products.forEach(p => {
        const cat = (p.category && p.category.name) || p.category || 'unknown';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });

    const topCategories = Object.entries(categoryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([cat]) => cat);

    // Fetch top products from top categories
    const recommended = [];
    for (const cat of topCategories) {
      const products = await Product.findAll({
        where: { category: cat },
        limit: 5
      });
      recommended.push(...products);
    }

    return res.status(200).json({ status: 'success', data: recommended });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch recommendations' });
  }
};

module.exports = { getTrendingProducts, getRecommendations };