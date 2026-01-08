module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'activity_logs',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            user_id: { type: DataTypes.STRING(128), allowNull: true },
            action: { type: DataTypes.STRING, allowNull: false },
            details: { type: DataTypes.JSON, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW }
        },
        {
            tableName: 'activity_logs',
            timestamps: false
        }
    );
};
