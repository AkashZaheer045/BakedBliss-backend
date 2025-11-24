const { db } = require('../../../config/firebaseConfig');

// Trending: top rated products
const getTrendingProducts = async (req, res) => {
  try {
    const snapshot = await db.collection('products').orderBy('rating', 'desc').limit(10).get();
    const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    return res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    console.error('Error fetching trending products:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch trending products' });
  }
};

// Recommendations: simple heuristic based on user's past orders
const getRecommendations = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user's orders
    const orderSnapshot = await db.collection('Orders').where('userId', '==', userId).get();

    if (orderSnapshot.empty) {
      // no history -> fallback to trending
      return getTrendingProducts(req, res);
    }

    // Count categories in user's orders
    const categoryCounts = {};
    orderSnapshot.forEach(doc => {
      const order = doc.data();
      const products = order.cartItems || order.products || [];
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
      const snap = await db.collection('products').where('category.name', '==', cat).limit(5).get();
      snap.forEach(d => recommended.push({ id: d.id, ...d.data() }));
    }

    return res.status(200).json({ status: 'success', data: recommended });
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return res.status(500).json({ status: 'error', message: 'Failed to fetch recommendations' });
  }
};

module.exports = { getTrendingProducts, getRecommendations };