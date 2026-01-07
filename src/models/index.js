import { User } from './user.model.js';
import { Role } from './role.model.js';
import { Article } from './article.model.js';
import { Category } from './category.model.js';
import { Supplier } from './supplier.model.js';
import { Stockroom } from './stockroom.model.js';
import { SalesHistory } from './sales-history.model.js';
import { StockMovement } from './stock-movement.model.js';
import { AssistantConversation } from './assistant-conversation.model.js';
import { AssistantMessage } from './assistant-message.model.js';

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
  SalesHistory.initModel(sequelize);
  StockMovement.initModel(sequelize);
  AssistantConversation.initModel(sequelize);
  AssistantMessage.initModel(sequelize);

  // Asociaciones existentes
  User.associate({ Role });

  // Nuevas asociaciones
  Category.associate({ Article });
  Supplier.associate({ Article });
  Stockroom.associate({ Article, SalesHistory, StockMovement });
  Article.associate({ Category, Supplier, Stockroom, SalesHistory, StockMovement });
  SalesHistory.associate({ Article, Stockroom });
  StockMovement.associate({ Article, Stockroom });

  // Identificar registros por usuario
  User.hasMany(Article, { foreignKey: 'id_user' });
  Article.belongsTo(User, { foreignKey: 'id_user' });

  User.hasMany(Category, { foreignKey: 'id_user' });
  Category.belongsTo(User, { foreignKey: 'id_user' });

  User.hasMany(Stockroom, { foreignKey: 'id_user' });
  Stockroom.belongsTo(User, { foreignKey: 'id_user' });

  User.hasMany(SalesHistory, { foreignKey: 'id_user' });
  SalesHistory.belongsTo(User, { foreignKey: 'id_user' });

  User.hasMany(StockMovement, { foreignKey: 'id_user' });
  StockMovement.belongsTo(User, { foreignKey: 'id_user' });

  // Assistant conversations (multi-tenant)
  User.hasMany(AssistantConversation, { foreignKey: 'id_user' });
  AssistantConversation.belongsTo(User, { foreignKey: 'id_user' });

  AssistantConversation.hasMany(AssistantMessage, { foreignKey: 'conversation_id' });
  AssistantMessage.belongsTo(AssistantConversation, { foreignKey: 'conversation_id' });
};

