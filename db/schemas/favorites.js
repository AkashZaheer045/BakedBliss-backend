module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'favorites',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' }
            },
            product_id: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true }
        },
        {
            tableName: 'favorites',
            timestamps: false,
            paranoid: true,
            indexes: [
                {
                    unique: true,
                    fields: ['user_id', 'product_id']
                }
            ]
        }
    );
};
