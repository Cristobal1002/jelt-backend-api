import { DataTypes, Model } from 'sequelize';
import { STOCK_MOVEMENT_TYPES_VALUES } from '../constants/stock-movement-types.js';

export class StockMovement extends Model {
  static initModel(sequelize) {
    StockMovement.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },

        id_article: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        id_stockroom: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        type: {
          type: DataTypes.STRING(20),
          allowNull: false,
          validate: { isIn: [STOCK_MOVEMENT_TYPES_VALUES] },
          comment: 'Tipo de movimiento: entrada, salida, ajuste.',
        },

        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 1 },
          comment: 'Cantidad del movimiento (unidades).',
        },

        reference: {
          type: DataTypes.STRING,
          allowNull: true,
          comment: 'Referencia externa (orden, ticket, documento, etc.).',
        },

        moved_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Fecha/hora del movimiento.',
        },

        metadata: {
          type: DataTypes.JSONB,
          allowNull: true,
          comment: 'Campos adicionales para auditoría / contexto.',
        },

        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: 'StockMovement',
        tableName: 'stock_movements',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    StockMovement.belongsTo(models.Article, {
      as: 'article',
      foreignKey: 'id_article',
    });

    StockMovement.belongsTo(models.Stockroom, {
      as: 'stockroom',
      foreignKey: 'id_stockroom',
    });
  }
}
