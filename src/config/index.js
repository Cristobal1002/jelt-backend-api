import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __configDir = path.dirname(fileURLToPath(import.meta.url));
/** Siempre el .env del paquete backend (no depende del cwd desde donde ejecutes node/nodemon). */
const envPath = path.join(__configDir, '..', '..', '.env');
dotenv.config({ path: envPath });

/** Quita espacios y comillas envolventes típicas al copiar desde un gestor de secretos o IDE */
const envStr = (key) => {
  const raw = process.env[key];
  if (raw == null || raw === '') return raw;
  let v = String(raw).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
};

const requiredEnvVars = [
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_HOST',
];

const validateEnvVars = () => {
  // Solo validar variables de DB si está habilitada
  const dbEnabled = process.env.DB_ENABLED !== 'false';
  
  if (dbEnabled) {
    const missing = requiredEnvVars.filter((key) => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(
        `Environment variables missing: ${missing.join(', ')}`
      );
    }
  }
};

// Validar solo en producción o si se especifica
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
  validateEnvVars();
}

const dbHostRaw = envStr('DB_HOST') || '';
const isRdsHost = dbHostRaw.includes('.rds.amazonaws.com');
const sslExplicitOn = process.env.DB_SSL === 'true' || process.env.DB_SSL === '1';
const sslExplicitOff = process.env.DB_SSL === 'false' || process.env.DB_SSL === '0';
const useDbSsl = sslExplicitOn || (isRdsHost && !sslExplicitOff);

/**
 * Tras ALB/nginx: confía en X-Forwarded-* para que req.ip sea el cliente real (rate limit).
 * TRUST_PROXY=0|false desactiva. En producción por defecto 1 salto si no se define.
 */
const trustProxyHops = (() => {
  const raw = process.env.TRUST_PROXY;
  if (raw === 'false' || raw === '0') return 0;
  if (raw === 'true' || raw === '1') return 1;
  const n = Number(raw);
  if (Number.isFinite(n) && n >= 0) return Math.floor(n);
  return process.env.NODE_ENV === 'production' ? 1 : 0;
})();

export const config = {
  app: {
    name: process.env.APP_NAME || 'Custom API',
    port: Number(process.env.PORT) || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: process.env.API_VERSION || 'v1',
    trustProxyHops,
  },
  db: {
    enabled: process.env.DB_ENABLED !== 'false', // Por defecto habilitado, deshabilitar con DB_ENABLED=false
    name: envStr('DB_NAME'),
    user: envStr('DB_USER'),
    password: envStr('DB_PASSWORD'),
    host: envStr('DB_HOST'),
    port: Number(process.env.DB_PORT) || 5432,
    dialect: 'postgres',
    /**
     * TLS: explícito con DB_SSL=true, o automático si DB_HOST es RDS (*.rds.amazonaws.com).
     * Desactivar en RDS: DB_SSL=false
     */
    ssl: useDbSsl
      ? {
          require: true,
          rejectUnauthorized:
            process.env.DB_SSL_REJECT_UNAUTHORIZED === 'true' ||
            process.env.DB_SSL_REJECT_UNAUTHORIZED === '1',
        }
      : undefined,
    pool: {
      acquire: Number(process.env.PG_POOL_ACQUIRE) || 60000,
      idle: Number(process.env.PG_POOL_IDLE) || 10000,
      max: Number(process.env.PG_POOL_MAX) || 10,
      min: Number(process.env.PG_POOL_MIN) || 0,
    },
    logging: process.env.DB_LOGGING === 'true',
    sync: {
      // Opciones: 'alter', 'force', false
      // 'alter': modifica tablas existentes
      // 'force': elimina y recrea tablas (¡CUIDADO en producción!)
      // false: no sincroniza (usa migraciones)
      mode: process.env.DB_SYNC_MODE || false,
    },
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: process.env.CORS_CREDENTIALS === 'true',
  },
  rateLimit: {
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
    max: Number(process.env.RATE_LIMIT_MAX) || 100, // 100 requests por ventana
  },
};

