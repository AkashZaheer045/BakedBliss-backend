module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'contact_messages',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            full_name: { type: DataTypes.STRING(255), allowNull: false },
            email: { type: DataTypes.STRING(255), allowNull: false },
            message: { type: DataTypes.TEXT, allowNull: false },
            date: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true }
        },
        {
            tableName: 'contact_messages',
            timestamps: false,
            paranoid: true
        }
    );
};
