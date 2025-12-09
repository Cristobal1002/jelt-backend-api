import { DataTypes, Model } from 'sequelize';

export class Supplier extends Model {
  static initModel(sequelize) {
    Supplier.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        nit: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        address: {
          type: DataTypes.STRING,
          allowNull: true,
        },
        phone: {
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
        modelName: 'Supplier',
        tableName: 'suppliers',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    Supplier.hasMany(models.Article, {
      as: 'articles',
      foreignKey: 'id_supplier',
    });
  }
}
