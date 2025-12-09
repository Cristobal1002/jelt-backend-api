import { DataTypes, Model } from 'sequelize';

export class Stockroom extends Model {
  static initModel(sequelize) {
    Stockroom.init(
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
        address: {
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
        modelName: 'Stockroom',
        tableName: 'stockrooms',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    Stockroom.hasMany(models.Article, {
      as: 'articles',
      foreignKey: 'id_stockroom',
    });
  }
}
