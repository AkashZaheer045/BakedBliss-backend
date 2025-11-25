const { db } = require('../../../config/firebaseConfig');

// Add product to user's favorites (subcollection and id = productId)
const addFavorite = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { productId } = req.body;

    // Ensure authenticated user matches path user
    if (!req.user || req.user.uid !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    if (!productId) return res.status(400).json({ status: 'error', message: 'productId is required' });

    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) return res.status(404).json({ status: 'error', message: 'Product not found' });

    const favRef = db.collection('User').doc(user_id).collection('favorites').doc(productId);
    await favRef.set({ productId, createdAt: new Date().toISOString() });

    return res.status(201).json({ status: 'success', message: 'Added to favorites', data: { productId } });
  } catch (error) {
    console.error('addFavorite error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Remove product from favorites
const removeFavorite = async (req, res) => {
  try {
    const { user_id, product_id } = req.params;

    if (!req.user || req.user.uid !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const favRef = db.collection('User').doc(user_id).collection('favorites').doc(product_id);
    const favDoc = await favRef.get();
    if (!favDoc.exists) return res.status(404).json({ status: 'error', message: 'Favorite not found' });

    await favRef.delete();
    return res.status(200).json({ status: 'success', message: 'Removed from favorites' });
  } catch (error) {
    console.error('removeFavorite error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// List user's favorites with optional product details
const listFavorites = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!req.user || req.user.uid !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const favSnapshot = await db.collection('User').doc(user_id).collection('favorites').orderBy('createdAt','desc').get();
    const favorites = [];

    for (const doc of favSnapshot.docs) {
      const { productId, createdAt } = doc.data();
      const productDoc = await db.collection('products').doc(productId).get();
      favorites.push({ productId, createdAt, product: productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null });
    }

    return res.status(200).json({ status: 'success', data: favorites });
  } catch (error) {
    console.error('listFavorites error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

module.exports = { addFavorite, removeFavorite, listFavorites };
