module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'orders',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            order_id: { type: DataTypes.STRING(128), allowNull: false, unique: true },
            user_id: { type: DataTypes.STRING(128), allowNull: false },
            cart_items: { type: DataTypes.JSON, allowNull: false },
            delivery_address: { type: DataTypes.JSON, allowNull: true },
            status: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'Pending' },
            total_amount: { type: DataTypes.FLOAT, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true }
        },
        {
            tableName: 'orders',
            timestamps: false,
            paranoid: true
        }
    );
};
