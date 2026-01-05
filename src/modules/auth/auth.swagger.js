/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: >
 *      El módulo **Auth** gestiona todo lo relacionado con la autenticación y autorización de usuarios.
 *      Este módulo garantiza que solo usuarios autenticados y con los permisos adecuados puedan acceder a los recursos protegidos de la API.
 *      <br/>Permite:
 *      <ul><li>Registrar nuevos usuarios en el sistema.</li>
 *      <li>Iniciar sesión (login) con email y contraseña.</li>
 *      <li>Generar y validar tokens JWT para proteger los endpoints.</li>
 *      <li>Asociar cada usuario a un rol (por ejemplo: **USER**, **ADMIN**, **SUPER_ADMIN**).</li>
 *      <li>Exponer datos básicos del usuario autenticado (como me o información de perfil, según el proyecto).</li>
 */


/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registro de usuario
 *     description: Crea un nuevo usuario con email y contraseña.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Juan Pérez
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario creado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthRegisterResponse'
 *       400:
 *         description: Error de validación o email ya registrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login de usuario
 *     description: Autentica un usuario con email y contraseña y devuelve un JWT.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Login exitoso.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthLoginResponse'
 *       400:
 *         description: Credenciales inválidas o error de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /auth/update:
 *   put:
 *     summary: Actualizar datos del usuario autenticado
 *     description: Actualiza información básica del usuario logueado.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 format: 'uuid'
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthUpdateResponse'
 *       400:
 *         description: Error de validación.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token inválido o no enviado.
  *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 */

/**
 * @swagger
 * /auth/delete:
 *   delete:
 *     summary: Eliminar (soft delete) el usuario autenticado
 *     description: Marca el usuario como eliminado sin borrar el registro físicamente.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario que se desea eliminar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3e1b19f8-4e61-4bc1-af37-b78f7cbf5a1d"
 *     responses:
 *       200:
 *         description: Usuario eliminado correctamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthDeleteResponse'
 *       400:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 */


/**
 * @swagger
 * /auth/find:
 *   get:
 *     summary: Buscar usuario por email
 *     description: Obtiene un usuario por su dirección de email.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *           format: email
 *         required: true
 *         description: Email del usuario a buscar.
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthFindResponse'
 *       400:
 *         description: Falta el parámetro email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: No se encontró un usuario con ese email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 */


/**
 * @swagger
 * /auth/find/{id}:
 *   get:
 *     summary: Buscar usuario por Id
 *     description: Obtiene un usuario por su id de registro.
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID del usuario que se desea buscar.
 *         schema:
 *           type: string
 *           format: uuid
 *           example: "3e1b19f8-4e61-4bc1-af37-b78f7cbf5a1d"
 *     responses:
 *       200:
 *         description: Usuario encontrado.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthFindResponse'
 *       400:
 *         description: Falta el parámetro id.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Error de autorización.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorUnauthorizedResponse'
 *       404:
 *         description: No se encontró un usuario con ese email.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorNotFoundResponse'
 */


