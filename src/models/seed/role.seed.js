import { Role } from '../role.model.js';

/**
 * Especificacion de roles iniciales por defecto en el sistema.
 */
const DEFAULT_ROLES = ['ADMIN', 'USER', 'SUPER_ADMIN'];

/**
 * Inserta los roles base del sistema en la base de datos.
 *
 * Esta función asegura que los roles esenciales (ADMIN, USER y SUPER_ADMIN)
 * existan siempre en la tabla `roles`.
 *
 * - Si el rol no existe, lo crea.
 * - Si el rol ya existe, no hace nada.
 *
 * Es una función idempotente, por lo que puede ejecutarse múltiples
 * veces sin generar duplicados.
 *
 * Debe ejecutarse después de `sequelize.sync()` durante la
 * inicialización de la aplicación, y nunca desde controladores
 * o requests HTTP.
 *
 * Su propósito es garantizar la integridad del dominio de
 * autenticación y autorización desde el arranque del sistema.
 */
export async function seedRoles() {
  for (const roleName of DEFAULT_ROLES) {
    await Role.findOrCreate({
      where: { name: roleName },
      defaults: { name: roleName },
    });
  }
}
