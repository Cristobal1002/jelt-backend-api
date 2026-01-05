import { Sequelize } from 'sequelize';
import { config } from './index.js';
import { logger } from '../utils/logger.js';

const isDev = process.env.NODE_ENV !== 'production';

const sqz = new Sequelize(
    config.db.name,
    config.db.user,
    config.db.password,
    {
        host: config.db.host,
        port: config.db.port,
        dialect: config.db.dialect,
        pool: config.db.pool,
        //logging: config.db.logging ? (msg) => logger.debug(msg) : false,
        logging: isDev ? (sql) => logger.debug(sql) : false,
        benchmark: true,
    }
);

export { sqz };
