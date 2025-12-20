import { DataTypes, Model } from 'sequelize';

export class Article extends Model {
  static initModel(sequelize) {
    Article.init(
      {
        id: {
          type: DataTypes.UUID,
          primaryKey: true,
          defaultValue: DataTypes.UUIDV4,
        },
        sku: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        id_category: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        id_supplier: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        id_stockroom: {
          type: DataTypes.UUID,
          allowNull: false,
        },
        reorder_point: {
          type: DataTypes.INTEGER,  //Sirve para la aletrta de control, de stock
          allowNull: true,
        },
        lead_time: {
          type: DataTypes.INTEGER, //Revisar que es esto
          allowNull: true,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        unit_price: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        unit_cost: {
          type: DataTypes.DECIMAL(10, 2),
          allowNull: false,
        },
        stock: {
          type: DataTypes.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        isDelete: {
          type: DataTypes.BOOLEAN,
          defaultValue: false,
        },
        // NUEVOS CAMPOS -------------------------
        demand_daily_avg: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          defaultValue: 0,
          comment: 'Demanda promedio diaria.',
        },

        demand_daily_std: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          defaultValue: 0,
          comment: 'Desviación estándar de la demanda diaria.',
        },

        lead_time_days: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 1,
          comment: 'Lead time promedio en días.',
        },

        service_level: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          defaultValue: 0.95,
          comment: 'Nivel de servicio deseado para el cálculo del stock de seguridad.',
        },

        safety_stock: {
          type: DataTypes.DECIMAL,
          allowNull: true,
          comment: 'Stock de seguridad calculado. Opcional si quieres almacenarlo.',
        },
        //----------------------------------------
      },
      {
        sequelize,
        modelName: 'Article',
        tableName: 'articles',
        timestamps: true,
      }
    );
  }

  static associate(models) {
    Article.belongsTo(models.Category, {
      as: 'category',
      foreignKey: 'id_category',
    });

    Article.belongsTo(models.Supplier, {
      as: 'supplier',
      foreignKey: 'id_supplier',
    });

    Article.belongsTo(models.Stockroom, {
      as: 'stockroom',
      foreignKey: 'id_stockroom',
    });
  }
}
