// models/productModel.js

const productSchema = {
    id: Number,
    title: String,
    price: Number,
    salePrice: Number,
    thumbnail: String,
    rating: Number,
    category: {
      id: Number,
      name: String,
      image: String,
    },
    ratingCount: Number,
    ingredient: Array, // Each ingredient will be an object
    description: String,
    tagline: String,
    images: Array,
    stock: Number,
  };
  
  module.exports = productSchema;
  