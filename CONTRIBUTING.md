## 1. Estructura actual del proyecto

Raíz:

* `app.js`
* `src/`

  * `server.js`
  * `config/`
  * `loaders/`
  * `errors/`
  * `middlewares/`
  * `routes/`
  * `modules/`

    * `auth/`
  * `models/`
  * `utils/`
  * `db.sql/`

### Rol de cada carpeta

* **`app.js`**

  * Punto de entrada de Node.
  * Carga `.env`, llama a `startServer`.
  * Maneja `uncaughtException` y `unhandledRejection` con `pino` y termina el proceso

* **`src/server.js`**

  * Crea instancia de `express`.
  * Llama a:

    * `loadDatabase()` (Sequelize + modelos).
    * `loadExpress(app)` (middlewares, rutas, swagger).
  * Arranca el servidor (`app.listen`) usando valores de `config`.
  * Implementa **apagado ordenado** en `SIGTERM` y `SIGINT` (cierra server y DB) 

* **`src/config/`**

  * `index.js`: centraliza configuración:

    * Valida variables de entorno requeridas (`DB_NAME`, `DB_USER`, etc.).
    * Expone `config` con:

      * `app` (nombre, versión API, entorno, puerto).
      * `db` (host, user, password, dialect, pool, logging, sync).
      * `cors` (origin, credentials).
      * `rateLimit` (windowMs, max).
  * `database.js`: crea instancia `Sequelize` (`sqz`) usando `config`.
  * `swagger.js`: configuración de **OpenAPI 3.0**, lee rutas y módulos (`routes/*.js`, `modules/**/*.routes.js`).
  * `firebase.js`: vacío por ahora (placeholder).

* **`src/loaders/`**

  * `express.load.js`:

    * Aplica middlewares globales:

      * `helmet()` → headers de seguridad.
      * `cors(...)` → configuración CORS desde `config.cors`.
      * `rateLimit(...)` → rate limiting desde `config.rateLimit`.
      * `express.json()` y `express.urlencoded()` (no utilizado aun pero es el patrón esperado aquí).
    * Genera swagger docs con `swaggerJsdoc(swaggerOptions)` y expone vía `swaggerUi`.
    * Añade `responseHandler` (extiende `res` con `ok`, `created`, `badRequest`, etc.).
    * Registra rutas desde `routes(app)`.
    * Maneja 404 con `res.notFound`.
    * Aplica `errorHandlerMiddleware.errorHandler` al final
  * `sequelize.load.js`:

    * Valida si DB está habilitada (`config.db.enabled`).
    * `sqz.authenticate()` y loguea estado.
    * `initModels(sqz)` inicializa modelos + asociaciones.
    * Opcionalmente llama a `sqz.sync()` según `config.db.sync.enabled` y `mode` (e.g. `force`, `alter`).
    * Loguea y relanza errores (separación clara de infraestructura.)

* **`src/errors/`**

  * `custom.error.js`: clase base `CustomError` con:

    * `statusCode`, `details`, `type` y método `serialize()` → estilo RFC 7807.
  * `http.error.js`: errores HTTP específicos:

    * `NotFoundError`, `UnauthorizedError`, `ForbiddenError`, etc.
  * `integration.error.js`: error para integraciones externas (`IntegrationError`).
  * `request-validation.error.js`: representa errores de validación de request.
  * `service-handler.error.js`: helper `handleServiceError(error)` para envolver errores de servicios externos en `CustomError`.
  * `index.js`: re-exporta los tipos (centralización de errores.)

* **`src/middlewares/`**

  * `auth.middleware.js`:

    * Extrae Bearer token de `Authorization`.
    * Usa `verifyToken` para decodificar.
    * Si no hay token o es inválido → `res.unauthorized('Token is invalid or expired')`.
    * Si es válido, adjunta `req.user = decoded`.
  * `response-handler.middleware.js`:

    * Añade a `res` helpers:

      * `res.ok`, `res.created`, `res.badRequest`, `res.unauthorized`, `res.forbidden`, `res.notFound`, `res.serverError`.
    * Todas responden con shape uniforme:

      ```json
      {
        "code": number,
        "success": boolean,
        "message": string,
        "data": {},
        "error": {}
      }
      ```
    * estandariza respuestas.
  * `error-handler.middleware.js`:

    * Loguea error con `pino` (nombre, mensaje, stack y request info).
    * Si es `CustomError` usa `serialize()` y responde con ese JSON.
    * Si no, responde `500 Internal server error` sin exponer stack en producción.
    * práctica recomendada de seguridad.
  * `validate-request.middleware.js`:

    * Usa `express-validator` → `validationResult(req)`.
    * Formatea errores (incluye `nestedErrors`).
    * Loguea y lanza `new RequestValidationError(formattedErrors)`.
    * Es un middleware genérico, aunque **en Auth se está validando dentro del controller** (explixado mas adelante).
  * `index.js`: exporta `errorHandlerMiddleware`, `validateRequestMiddleware`, `responseHandler`.

* **`src/routes/`**

  * `index.js`:

    * Registra:

      * `/api/{version}/health` → `health` router.
      * `/api/{version}/auth` → `auth` router (from module).
  * `health.route.js`:

    * Router con endpoints de monitoreo y pruebas de errores.
    * Documentado con Swagger JSDoc.

* **`src/modules/auth/`**

  * `auth.routes.js`:

    * Define rutas `/auth/*` y documentación Swagger.
    * Aplica validadores (`registerValidator`, `loginValidator`, `updateValidator`).
    * Usa `authMiddleware` para rutas protegidas.
  * `auth.controller.js`:

    * Capa HTTP: recibe `req`, `res`, usa `authService`.
    * Hace `validationResult(req)` y devuelve `res.badRequest(errors)` si hay errores.
  * `auth.service.js`:

    * Capa de negocio: reglas de negocio alrededor de usuarios y roles.
  * `auth.repository.js`:

    * Capa de datos: operaciones Sequelize sobre `User` y `Role`.
  * `auth.validator.js`:

    * Validaciones con `express-validator` (`body('field')...`).
  * `__tests__/`:

    * `auth.controller.test.js`, `auth.service.test.js`.

* **`src/models/`**

  * `role.model.js`: modelo `Role` (id, name, description, isActive, timestamps).
  * `user.model.js`: modelo `User` (id, name, email, password, phone, address, isActive, isDelete, roleId, timestamps).
  * `index.js`: `initModels(sequelize)`:

    * `Role.initModel`, `User.initModel`.
    * `User.belongsTo(Role, { as: 'role', foreignKey: 'roleId' })`.

* **`src/utils/`**

  * `crypto.js`:

    * `hashPassword(password)` → `bcrypt.hash` con saltRounds=10.
    * `comparePassword(password, hashed)` → `bcrypt.compare`.
  * `jwt.js`:

    * Requiere `JWT_SECRET` desde `.env` (si no, lanza error).
    * `generateToken(payload)` con expiración `1d`.
    * `verifyToken(token)`.
  * `logger.js`:

    * Configura `pino` con formato pretty en dev y JSON en otros entornos.
    * Incluye `level`, `timestamp ISO`, etc.

* **`src/db.sql/`**

  * `roles.sql`, `users.sql` → DDL para tablas base en Postgres.

---

## 2. Diseño técnico y patrones

### Arquitectura / Capas

Por definicion de logica y nuevas funcionalidades se establece **arquitectura en capas**:

* **Presentación / HTTP**

  * Rutas (`routes/*.js`, `modules/auth/auth.routes.js`).
  * Middlewares.
  * Controllers (`auth.controller.js`).

* **Negocio**

  * Servicios (`auth.service.js`).

* **Acceso a datos**

  * Repositorios (`auth.repository.js`).
  * Modelos Sequelize (`user.model.js`, `role.model.js`).

* **Infraestructura**

  * Configuración (`config/*`).
  * Conexión y carga de Sequelize (`database.js`, `sequelize.load.js`).
  * Logger (`utils/logger.js`).
  * Swagger (`config/swagger.js`).
  * Errores custom (`errors/*`).

Patrón utilizado:

* **Controller → Service → Repository** bien marcado.
* **Loader pattern** para Express y Sequelize (`loadExpress`, `loadDatabase`).
* **Patrón de Error Customizado** siguiendo algo similar a RFC 7807.
* Uso de **middlewares transversales** (response handler, error handler, auth, validate request).

SOLID:

* **S (Single Responsibility)**:
  Cada archivo tiene responsabilidad clara (config, loader, controller, service, repository, middleware).
* **D (Dependency Inversion)**:
  Aunque no hay DI container, la dirección de dependencias es correcta:

  * Controller depende de Service.
  * Service depende de Repository y Utils.
  * Repository depende de Modelos.
    Esto permite testear capa por capa.

---

## 3. Endpoints actuales

### 3.1. Health

Todos bajo `/api/{version}/health`:

* `GET /`

  * Devuelve `{ status: 'OK', timestamp: ... }`.
  * Usa `res.ok`.
  * Sirve como “ping” básico.

* `GET /ready`

  * Hace `sqz.authenticate()` para comprobar DB.
  * `200` si OK, `503` si falla.
  * Perfecto para readiness probe en Kubernetes.

* `GET /live`

  * Liveness simple (que la app responde).

* `GET /not-found`

  * Lanza `NotFoundError('Property')` para probar manejo de 404.

* `GET /forbidden`

  * Lanza `ForbiddenError('Access denied to resource')` para probar 403.

* `GET /integration`

  * Lanza `IntegrationError('Shopify', { credentials: 'Invalid credentials' })` para probar 502 de integración.

* `GET /boom`

  * Lanza un `Error` genérico para probar 500.

* **Swagger** documenta estos endpoints con responses y schemas (`HealthStatus`, `ErrorResponse`, etc.).

### 3.2. Auth

Bajo `/api/{version}/auth`:

* `POST /register`

  * Validación: `registerValidator`:

    * `email` obligatorio y válido.
    * `password` mínimo 6 caracteres.
    * `name` requerido.
  * Llama a `authController.register`.
  * Service:

    * Verifica si email ya existe.
    * Hashea password.
    * Busca `Role` con nombre `USER` (DEFAULT_ROLE).
    * Crea usuario con ese rol.
  * Respuesta: `res.created(user)`.

* `POST /login`

  * Validación: `loginValidator`:

    * `email` válido.
    * `password` no vacío.
  * `authController.login`:

    * Llama a `authService.login`.
  * `authService.login`:

    * Busca usuario por email (isDelete = false).
    * Verifica password con `comparePassword`.
    * Verifica flags de estado (isActive, isDelete).
    * Genera JWT con `generateToken`.
    * Retorna user+token.

* `PUT /update`

  * Protegido con `authMiddleware` (requiere JWT).
  * `updateValidator`:

    * `name`, `phone`, `address` opcionales.
  * `authController.update`:

    * Llama a `authService.updateOwnUser(userId, data, currentUser)`.
  * `authService.updateOwnUser`:

    * Solo permite que el usuario modifique su propio registro (`currentUser.id === userId`).
    * Si envía `password`, la rehacea; si no, se elimina del payload.
    * Evita que modifique `id`, `roleId`, `isActive`, `isDelete`.
    * Usa `authRepository.updateUser`.

* `DELETE /delete/:id`

  * Protegido con `authMiddleware`.
  * `authController.delete` → `authService.deleteUser`.
  * `authService.deleteUser`:

    * Aplica reglas de quién puede borrar (según rol).
    * Usa `authRepository.softDelete(id)` (marca `isDelete = true`).

* `GET /find`

  * Protegido con `authMiddleware`.
  * `authController.getByEmail`:

    * Usa el email del token o parámetro (según implementación).
    * Llama `authService.findByEmail`.

* `GET /find/:id`

  * Protegido con `authMiddleware`.
  * `authController.getById`:

    * Llama `authService.findById`.
  * `authService.findById`:

    * Incluye lógica de autorización:

      * Si usuario actual tiene rol `USER` y su `id` ≠ `targetId` → no puede consultar otros usuarios.
    * Devuelve usuario si existe; si no, error.

* `GET /validate-token`

  * Protegido con `authMiddleware`.
  * `authController.validateToken`:

    * Responde `res.ok({ user: req.user }, 'Token válido')`.
    * Útil para front para validar sesiones.

---

## 4. Resumen de métodos por capa (Auth)

### AuthController

Métodos:

* `register(req, res)`
* `login(req, res)`
* `update(req, res)`
* `delete(req, res)`
* `getByEmail(req, res)`
* `getById(req, res)`
* `validateToken(req, res)`

Responsabilidades:

* Ejecutan `validationResult(req)` directamente (en vez de usar `validateRequest`).
* En caso de error, responden con `res.badRequest(err.message)` mayormente

### AuthService

Métodos:

* `register(data)`
* `login(data)` (según implementación, recibe cuerpo o email/pass).
* `updateOwnUser(userId, data, currentUser)`
* `updateUser(id, data)` (para lógica interna y/o admin).
* `deleteUser(id, currentUser)`
* `findByEmail(email, currentUser?)`
* `findById(id, currentUser)`

Responsabilidades:

* Reglas de negocio:

  * Unicidad de email al registrar.
  * Uso del rol por defecto `USER`.
  * Hash de password.
  * Validación de password en login.
  * Validación de flags `isActive` / `isDelete`.
  * Reglas de autorización simple:

    * Usuario normal no puede modificar/consultar otros usuarios.
* Delegan persistencia al repositorio

### AuthRepository

Métodos:

* `findByEmail(email)`
* `findById(id)`
* `createUser(data)`
* `updateUser(id, data)`
* `softDelete(id)`

Responsabilidades:

* Capa fina sobre Sequelize:

  * Todas las consultas filtran `isDelete = false` excepto en `softDelete`.
  * Incluyen `Role` como asociación (`include: [{ model: Role, as: 'role' }]`).

---

## 5. Patrones y buenas prácticas

* **Separación de capas**

  * Controllers / Services / Repositories / Models diferenciados.
* **Uso de middlewares transversales**

  * `responseHandler` y `errorHandler` aplicados globalmente.
* **Sistema de errores**

  * `CustomError`, errores HTTP concretos, errores de integración, error de validación.
  * `error-handler.middleware.js` centraliza el formato de respuesta de error.
* **Configuración por entorno**

  * `config/index.js` lee `.env` y valida variables requeridas.
  * `config.db.enabled` permite desactivar DB (ej. pruebas).
* **Seguridad**

  * `helmet` para headers.
  * `express-rate-limit` configurado.
  * `bcrypt` para passwords.
  * JWT con secreto externo (`JWT_SECRET`).
  * Middleware `authMiddleware` para proteger rutas.
* **Logging**

  * `pino` con formato distinto para dev vs prod.
  * Logging en:

    * Arranque de DB.
    * Health checks fallidos.
    * Errores de request y validación.
* **Swagger/OpenAPI**

  * Definición de esquemas (`HealthStatus`, `ErrorResponse`, `AuthLoginResponse`, etc.).
  * Documentación por JSDoc en `health.route.js` y `auth.routes.js`.
  * Config de `swaggerOptions` con rutas bien definidas.

---

## 6. Seguridad

* **Autenticación**:

  * JWT con expiración de 1 día.
  * Middleware `authMiddleware` que valida `Authorization: Bearer <token>`.

* **Gestión de contraseñas**:

  * Hash con `bcrypt` (saltRounds=10).
  * Nunca se guarda password plano.

* **Hardening HTTP/API**:

  * `helmet()` global.
  * `express-rate-limit` para limitar requests.
  * CORS configurado vía variables de entorno.

* **Errores seguros**:

  * En producción no expone stack trace en responses.
  * Uso de tipos de error específicos y códigos HTTP correctos (404, 401, 403, 502, 500) a través de `CustomError`.

### Riesgos / puntos de mejora

* `config.cors.origin` por defecto es `'*'`:

  * Mientras este en ambiente dev es correcto, **no recomendado para prod**. Lo ideal es restringir a dominios de front conocidos (esto se conocerá cuando se lance a PROD).

---

## 7. Documentación

### Implementación

* **Swagger / OpenAPI**

  * `GET /health/*` y `GET/POST/PUT/DELETE /auth/*` tienen JSDoc detallado:

    * tags, summary, description.
    * schemas reutilizables (`ErrorResponse`, `HealthStatus`, `AuthLoginResponse`, etc.).
  * `config/swagger.js` centraliza definición:

    * `openapi: '3.0.0'`.
    * Información de la API (`title`, `version`, `description`).
    * Referencia a rutas en `routes/*.js` y `modules/**/*.routes.js`.

* **README.md**

  * Explica:

    * Prerrequisitos (Node, npm, Postgres).
    * Instalación básica.
    * Variables de entorno.
    * Scripts (`start`, `dev`, `test`, `lint`, `format`).
    * Tecnologías usadas:

      * Express, Sequelize, PostgreSQL, JWT, bcrypt, Pino, Helmet, rate-limit, express-validator.
    * Sección de seguridad con bullets claros.
---

## 9. Resumen

* Proyecto **backend** en Node + Express + Sequelize, estructurado y con buenas prácticas modernas:

  * Capas claras (Controller–Service–Repository).
  * Manejo centralizado de errores y respuestas.
  * Seguridad básica integrada (JWT, bcrypt, helmet, rate-limit).
  * Logging con Pino.
  * Swagger bien configurado y documentando health + auth.
