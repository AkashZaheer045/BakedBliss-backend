const { models } = require('../../../../config/sequelizeConfig');
const { Favorite, Product } = models;

// Add product to user's favorites
const addFavorite = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { productId } = req.body;

    // Ensure authenticated user matches path user
    if (!req.user || req.user.uid !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    if (!productId) {
      return res.status(400).json({ status: 'error', message: 'productId is required' });
    }

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    // Check if already in favorites
    const existingFavorite = await Favorite.findOne({
      where: {
        user_id: user_id,
        product_id: productId
      }
    });

    if (existingFavorite) {
      return res.status(200).json({
        status: 'success',
        message: 'Already in favorites',
        data: { productId }
      });
    }

    // Add to favorites
    await Favorite.create({
      user_id: user_id,
      product_id: productId
    });

    return res.status(201).json({
      status: 'success',
      message: 'Added to favorites',
      data: { productId }
    });
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

    const favorite = await Favorite.findOne({
      where: {
        user_id: user_id,
        product_id: product_id
      }
    });

    if (!favorite) {
      return res.status(404).json({ status: 'error', message: 'Favorite not found' });
    }

    await favorite.destroy();
    return res.status(200).json({ status: 'success', message: 'Removed from favorites' });
  } catch (error) {
    console.error('removeFavorite error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// List user's favorites with product details
const listFavorites = async (req, res) => {
  try {
    const { user_id } = req.params;

    if (!req.user || req.user.uid !== user_id) {
      return res.status(403).json({ status: 'error', message: 'Forbidden' });
    }

    const favorites = await Favorite.findAll({
      where: { user_id: user_id },
      order: [['created_at', 'DESC']],
      include: [{
        model: Product,
        as: 'product',
        required: false
      }]
    });

    const favoritesData = await Promise.all(favorites.map(async (fav) => {
      const product = await Product.findByPk(fav.product_id);
      return {
        productId: fav.product_id,
        createdAt: fav.created_at,
        product: product ? product.toJSON() : null
      };
    }));

    return res.status(200).json({ status: 'success', data: favoritesData });
  } catch (error) {
    console.error('listFavorites error:', error);
    return res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

module.exports = { addFavorite, removeFavorite, listFavorites };
