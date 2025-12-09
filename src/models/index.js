import { User } from './user.model.js';
import { Role } from './role.model.js';
import { Article } from './article.model.js';
import { Category } from './category.model.js';
import { Supplier } from './supplier.model.js';
import { Stockroom } from './stockroom.model.js';

/**
 * Inicializa todos los modelos de Sequelize y sus relaciones
 * @param {Sequelize} sequelize - Instancia de Sequelize
 */
export const initModels = (sequelize) => {
  // Inicializar modelos base
  Role.initModel(sequelize);
  User.initModel(sequelize);

  // Nuevos modelos
  Category.initModel(sequelize);
  Supplier.initModel(sequelize);
  Stockroom.initModel(sequelize);
  Article.initModel(sequelize);

  // Asociaciones existentes
  User.associate({ Role });

  // Nuevas asociaciones
  Category.associate({ Article });
  Supplier.associate({ Article });
  Stockroom.associate({ Article });
  Article.associate({ Category, Supplier, Stockroom });

};
