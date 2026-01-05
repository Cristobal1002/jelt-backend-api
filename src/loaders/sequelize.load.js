import { sqz } from '../config/database.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { initModels } from '../models/index.js';
import { seedRoles } from '../models/seed/role.seed.js';

export const loadDatabase = async () => {
  if (!config.db.enabled) {
    logger.warn('Database is disabled via configuration, skipping DB connection');
    return;
  }
  
  try {
    logger.info('Connecting to PostgreSQL...');
    await sqz.authenticate();
    logger.info('Database connected');

    // Inicializa modelos
    initModels(sqz);

    await seedRoles();

    logger.info('Models initialized');

    // Sincronizar modelos con la base de datos
    if (config.db.sync.mode) {
      logger.info('Synchronizing models...');

      const syncOptions = {};

      if (config.db.sync.mode === 'alter') {
        syncOptions.alter = true;
        logger.warn('Using sync with alter=true - this option will modify existing tables');

        // Sincronizar todos los modelos con alter
        await sqz.sync(syncOptions);
        logger.info('All models synchronized with alter mode');
      } else if (config.db.sync.mode === 'force') {
        // syncOptions.force = true;
        logger.error('Using sync with force=true (will delete all tables)');

        if (config.app.nodeEnv === 'production') {
          throw new Error('Don\'t allow sync with force=true in production');
        }

        // Sincronizar todos los modelos con force (elimina y recrea)
        await sqz.sync(syncOptions);
        logger.info('All models synchronized with force mode (tables recreated)');
      } else if (config.db.sync.mode === 'targeted') {
        // Sincronización selectiva solo de modelos nuevos/modificados
        logger.info('Running targeted sync for specific models...');

        // Modelos base
        // await sqz.models.Partner.sync({ alter: true });
        // logger.info('Partner model synchronized');

        // await sqz.models.Company.sync({ alter: true });
        // logger.info('Company model synchronized');

        // await sqz.models.User.sync({ alter: true });
        // logger.info('User model synchronized');

        // await sqz.models.Provider.sync({ alter: true });
        // logger.info('Provider model synchronized');

        // // Modelos de integración (nuevos)
        // await sqz.models.Integration.sync({ alter: true });
        // logger.info('Integration model synchronized');

        // await sqz.models.IntegrationProvider.sync({ alter: true });
        // logger.info('IntegrationProvider model synchronized');

        // await sqz.models.IntegrationLog.sync({ alter: true });
        // logger.info('IntegrationLog model synchronized');

        //await sqz.models.Webhook.sync({ alter: true });

        // ============================
        // await sqz.models.IncomingWebhook.sync({ alter: true });
        // await sqz.models.Order.sync({ alter: true });
        // await sqz.models.ProviderRequest.sync({ alter: true });



        logger.info('Targeted sync completed');
      } else {
        // Sincronización normal
        await sqz.sync(syncOptions);
        logger.info('Models synchronized with the database');
      }
    } else {
      logger.info('Sync disabled (use migrations for changes in the database)');
    }
  } catch (error) {
    logger.error({ error }, 'Error loading the database');
    throw error;
  }
};