module.exports = (sequelize, DataTypes) => {
    return sequelize.define(
        'users',
        {
            id: { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
            user_id: { type: DataTypes.STRING(128), allowNull: false, unique: true },
            full_name: { type: DataTypes.STRING(255), allowNull: false },
            email: { type: DataTypes.STRING(255), allowNull: true, unique: true },
            profile_picture: { type: DataTypes.STRING(1024), allowNull: true },
            phone_number: { type: DataTypes.STRING(64), allowNull: true },
            addresses: { type: DataTypes.JSON, allowNull: true },
            selected_address_id: { type: DataTypes.STRING(128), allowNull: true },
            role: { type: DataTypes.STRING(64), allowNull: false, defaultValue: 'user' },
            push_token: { type: DataTypes.STRING(512), allowNull: true },
            password: { type: DataTypes.STRING(1024), allowNull: true }, // Hashed password
            salt: { type: DataTypes.STRING(512), allowNull: true }, // Salt for hashing
            date_joined: { type: DataTypes.DATE, allowNull: true },
            created_at: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
            updated_at: { type: DataTypes.DATE, allowNull: true },
            deleted_at: { type: DataTypes.DATE, allowNull: true }
        },
        {
            tableName: 'users',
            timestamps: false,
            paranoid: true
        }
    );
};
