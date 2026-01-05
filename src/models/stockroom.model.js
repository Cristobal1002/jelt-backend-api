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
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
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

    // Históricos (opcional, para analítica / assistant)
    if (models.SalesHistory) {
      Stockroom.hasMany(models.SalesHistory, {
        as: 'salesHistory',
        foreignKey: 'id_stockroom',
      });
    }

    if (models.StockMovement) {
      Stockroom.hasMany(models.StockMovement, {
        as: 'stockMovements',
        foreignKey: 'id_stockroom',
      });
    }
  }
}
