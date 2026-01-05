import { DataTypes, Model } from 'sequelize';

export class SalesHistory extends Model {
  static initModel(sequelize) {
    SalesHistory.init(
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
        id_article: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        id_stockroom: {
          type: DataTypes.UUID,
          allowNull: false,
        },

        quantity: {
          type: DataTypes.INTEGER,
          allowNull: false,
          validate: { min: 1 },
          comment: 'Cantidad vendida (unidades).',
        },

        unit_price: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Precio unitario al momento de la venta (opcional).',
        },

        sold_at: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
          comment: 'Fecha/hora de la venta.',
        },

        metadata: {
          type: DataTypes.JSONB,
          allowNull: true,
          comment: 'Campos adicionales (canal, vendedor, referencia externa, etc.).',
        },

        isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
        isDelete: { type: DataTypes.BOOLEAN, defaultValue: false },
      },
      {
        sequelize,
        modelName: 'SalesHistory',
        tableName: 'sales_history',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    SalesHistory.belongsTo(models.Article, {
      as: 'article',
      foreignKey: 'id_article',
    });

    SalesHistory.belongsTo(models.Stockroom, {
      as: 'stockroom',
      foreignKey: 'id_stockroom',
    });
  }
}
