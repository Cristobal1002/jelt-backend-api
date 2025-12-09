import { DataTypes, Model } from 'sequelize';

export class Role extends Model {
  static initModel(sequelize) {
    Role.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
          field: 'id'
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,          // USER, ADMIN, SUPER_ADMIN
        },
        description: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
      },
      {
        sequelize,
        modelName: 'Role',
        tableName: 'roles',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    Role.hasMany(models.User, {
      as: 'users',
      foreignKey: 'id_rol',
    });
  }
}
