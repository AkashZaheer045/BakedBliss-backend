module.exports = (sequelize, DataTypes) => {
  return sequelize.define('products', {
    id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(512), allowNull: false },
    price: { type: DataTypes.FLOAT, allowNull: false },
    sale_price: { type: DataTypes.FLOAT, allowNull: true },
    thumbnail: { type: DataTypes.STRING(1024), allowNull: true },
    rating: { type: DataTypes.FLOAT, allowNull: true },
    category: { type: DataTypes.STRING(255), allowNull: true },
    rating_count: { type: DataTypes.INTEGER, allowNull: true },
    ingredients: { type: DataTypes.JSON, allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    tagline: { type: DataTypes.STRING(1024), allowNull: true },
    images: { type: DataTypes.JSON, allowNull: true },
    stock: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    updated_at: { type: DataTypes.DATE, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true }
  }, {
    tableName: 'products',
    timestamps: false,
    paranoid: true,
  });
};
