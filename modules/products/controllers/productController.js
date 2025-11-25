const { db } = require('../../../config/firebaseConfig'); // Import the Firestore config

// Search products by query with pagination
const searchProducts = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query; // Default page and limit

    if (!query) {
      return res.status(400).json({ status: 'error', message: 'Query parameter is required.' });
    }

    const productsRef = db.collection('products');
    const snapshot = await productsRef
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
      .limit(Number(limit))
      .get();

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (products.length === 0) {
      const categorySnapshot = await productsRef
        .where('category', '>=', query)
        .where('category', '<=', query + '\uf8ff')
        .limit(Number(limit))
        .get();
      const categoryProducts = categorySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      products.push(...categoryProducts);
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
    const productDoc = await db.collection('products').doc(product_id).get();
    if (!productDoc.exists) {
      return res.status(404).json({ status: 'error', message: 'Product not found' });
    }
    const productData = productDoc.data();
    return res.status(200).json({ status: 'success', data: productData });
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
    const productsRef = db.collection('products')
      .where('category', '==', categoryName)
      .offset(offset)
      .limit(limit);
    const snapshot = await productsRef.get();
    if (snapshot.empty) {
      return res.status(404).json({ status: 'error', message: 'No products found in this category' });
    }
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalProducts = (await db.collection('products').where('category', '==', categoryName).get()).size;
    res.status(200).json({ status: 'success', data: products, pagination: { total: totalProducts, page, limit } });
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

    let productsRef = db.collection('products');
    if (category) productsRef = productsRef.where('category', '==', category);
    if (req.query.featured !== undefined) productsRef = productsRef.where('isFeatured', '==', featured);
    if (req.query.offers !== undefined) productsRef = productsRef.where('onOffer', '==', offers);
    if (search) productsRef = productsRef.where('title', '>=', search).where('title', '<=', search + '\uf8ff');

    if (sort === 'price_asc') productsRef = productsRef.orderBy('price', 'asc');
    else if (sort === 'price_desc') productsRef = productsRef.orderBy('price', 'desc');
    else if (sort === 'rating') productsRef = productsRef.orderBy('rating', 'desc');
    else productsRef = productsRef.orderBy('createdAt', 'desc');

    const offset = (page - 1) * limit;
    const snapshot = await productsRef.offset(offset).limit(limit).get();
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalSnapshot = await productsRef.get();
    const total = totalSnapshot.size;
    res.status(200).json({ status: 'success', data: products, pagination: { total, page, limit } });
  } catch (error) {
    console.error('Error listing products:', error);
    res.status(500).json({ status: 'error', message: 'Failed to list products', error: error.message });
  }
};

// Get product categories and counts
const getCategories = async (req, res) => {
  try {
    const snapshot = await db.collection('products').get();
    const counts = {};
    snapshot.forEach(doc => {
      const data = doc.data();
      const cat = data.category || 'uncategorized';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    const categories = Object.keys(counts).map(name => ({ name, count: counts[name] }));
    res.status(200).json({ status: 'success', data: categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ status: 'error', message: 'Failed to fetch categories', error: error.message });
  }
};

module.exports = { searchProducts, getProductById, getProductsByCategory, listProducts, getCategories };