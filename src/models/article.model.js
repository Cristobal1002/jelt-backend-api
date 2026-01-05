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
        id_user: {
          type: DataTypes.UUID,
          allowNull: false,
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
          type: DataTypes.INTEGER,
          allowNull: true,
        },
        lead_time: {
          type: DataTypes.INTEGER,
          allowNull: true,
          comment: 'Lead time promedio en días.',
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
      },
      {
        sequelize,
        modelName: 'Article',
        tableName: 'articles',
        timestamps: true,
        /** Se protege propiedad de id_user, en la capa de Repositorio si se necesita el campo usar "await Article.scope('withUser').findAll();" */
        defaultScope: {
          attributes: {
            exclude: ['id_user'],
          },
        },
        scopes: {
          withUser: {
            attributes: { include: ['id_user'] },
          },
        },
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

    // Históricos (opcional, para analítica / assistant)
    if (models.SalesHistory) {
      Article.hasMany(models.SalesHistory, {
        as: 'salesHistory',
        foreignKey: 'id_article',
      });
    }

    if (models.StockMovement) {
      Article.hasMany(models.StockMovement, {
        as: 'stockMovements',
        foreignKey: 'id_article',
      });
    }
  }
}
