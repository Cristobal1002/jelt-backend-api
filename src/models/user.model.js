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
        id_rol: {
          type: DataTypes.UUID,
          allowNull: true,
        },
        name: { type: DataTypes.STRING, allowNull: false },
        email: { type: DataTypes.STRING, allowNull: false, unique: true },
        password: { type: DataTypes.STRING, allowNull: false },
        phone: { type: DataTypes.STRING, allowNull: true },
        address: { type: DataTypes.STRING, allowNull: true },

        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },

        isLocked: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
        lockedAt: { type: DataTypes.DATE, allowNull: true },
        tempAccessCode: { type: DataTypes.STRING, allowNull: true },
        tempAccessCodeCreatedAt: { type: DataTypes.DATE, allowNull: true },
      },
      {
        sequelize,
        modelName: 'User',
        tableName: 'users',
        timestamps: true,
        hooks: {
          beforeSave: (user) => {
            // Fecha automática cuando se inserta/cambia el código temporal
            if (user.changed('tempAccessCode')) {
              user.tempAccessCodeCreatedAt = user.tempAccessCode ? new Date() : null;
            }
          },
        },
      }
    );
  }
  
  static associate(models) {
    User.belongsTo(models.Role, {
      as: 'role',
      foreignKey: 'id_rol',
    });
  }
}
