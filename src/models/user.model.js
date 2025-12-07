import { DataTypes, Model } from 'sequelize';

export class User extends Model {
  static initModel(sequelize) {
    User.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },

        roleId: {
          type: DataTypes.UUID,
          allowNull: true, // luego idealmente NOT NULL con seed de roles
        },

        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
      }
    );
  }
  
  static associate(models) {
    User.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'roleId',
    });
  }
}
