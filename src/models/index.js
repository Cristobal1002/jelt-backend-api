import { User } from './user.model.js';

/**
 * Inicializa todos los modelos de Sequelize y sus relaciones
 * @param {Sequelize} sequelize - Instancia de Sequelize
 */
export const initModels = (sequelize) => {
  // Inicializar modelos
  User.initModel(sequelize);

  // Aquí podrías añadir otros modelos y relaciones en el futuro
  // ej: Company.initModel(sequelize);
  // Company.hasMany(User, { foreignKey: 'companyId' });
  // User.belongsTo(Company, { foreignKey: 'companyId' });
};
