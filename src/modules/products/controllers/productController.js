const { models, sequelize } = require('../../../../config/sequelizeConfig');
const { Product } = models;
const { Op } = require('sequelize');

// Search products by query with pagination
const searchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Query parameter is required.' });
    }

    const offset = (page - 1) * Number(limit);

    // Search by title first
    let products = await Product.findAll({
      where: {
        title: {
          [Op.like]: `%${query}%`
        }
      },
      limit: Number(limit),
      offset: offset
    });

    // If no products found by title, search by category
    if (products.length === 0) {
      products = await Product.findAll({
        where: {
          category: {
            [Op.like]: `%${query}%`
          }
        },
        limit: Number(limit),
        offset: offset
      });
    }

    if (products.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No products found.' });
    }

    res.status(200).json({ status: 'success', data: products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ status: 'error', message: 'Server error' });
  }
};

// Controller to get a product by its ID
const getProductById = async (req, res) => {
  const { product_id } = req.params;
  try {
    const product = await Product.findByPk(product_id);

    if (!product) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }

    return res.status(200).json({ status: 'success', data: product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Get products by category with pagination
const getProductsByCategory = async (req, res) => {
  const categoryName = req.params.category_name;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const { count, rows: products } = await Product.findAndCountAll({
      where: { category: categoryName },
      offset: offset,
      limit: limit
    });

    if (products.length === 0) {
      return res.status(404).json({ status: 'error', message: 'No products found in this category' });
    }

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: { total: count, page, limit }
    });
  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({ status: 'error', message: 'Error fetching products', error: error.message });
  }
};

// List products with pagination and filters
const listProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const category = req.query.category;
    const featured = req.query.featured === 'true';
    const offers = req.query.offers === 'true';
    const sort = req.query.sort || 'createdAt';
    const search = req.query.search;

    // Build where clause
    const where = {};
    if (category) where.category = category;
    if (req.query.featured !== undefined) where.isFeatured = featured;
    if (req.query.offers !== undefined) where.onOffer = offers;
    if (search) where.title = { [Op.like]: `%${search}%` };

    // Build order clause
    let order = [];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    else if (sort === 'price_desc') order = [['price', 'DESC']];
    else if (sort === 'rating') order = [['rating', 'DESC']];
    else order = [['created_at', 'DESC']];

    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      order,
      limit,
      offset
    });

    res.status(200).json({
      status: 'success',
      data: products,
      pagination: { total: count, page, limit }
    });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ status: 'error', message: 'Failed to list products', error: error.message });
  }
};

// Get product categories and counts
const getCategories = async (req, res) => {
  try {
    const results = await Product.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['category']
    });

    const categories = results.map(result => ({
      name: result.category || 'uncategorized',
      count: parseInt(result.dataValues.count)
    }));

    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories', error: error.message });
  }
};

module.exports = { searchProducts, getProductById, getProductsByCategory, listProducts, getCategories };