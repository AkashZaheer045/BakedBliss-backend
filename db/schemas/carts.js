module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'carts',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            user_id: {
                type: DataTypes.INTEGER.UNSIGNED,
                allowNull: false,
                references: { model: 'users', key: 'id' }
            },
            items: { type: DataTypes.JSON, allowNull: false },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true }
        },
        {
            tableName: 'carts',
            timestamps: false,
            paranoid: true
        }
    );
};
