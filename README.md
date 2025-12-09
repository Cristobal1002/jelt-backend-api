# Node - Sequelize boilerplate 

Backend de consumo para integración Siigo y comercios electrónicos.

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL

### Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd node-boilerplate
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

4. Iniciar servidor de desarrollo
```bash
npm run dev
```

5. Iniciar servidor de producción
```bash
npm start
```

## 📁 Estructura del Proyecto

```
├── src/
│   ├── config/          # Configuraciones (DB, Firebase, etc.)
│   ├── controllers/      # Controladores
│   ├── errors/          # Clases de errores personalizados
│   ├── loaders/         # Cargadores (Express, DB, etc.)
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de rutas
│   ├── modules/         
│   │    └── auth/        # Implementacion Autenticación, Login y Registro
│   ├── services/        # Lógica de negocio (****)
│   ├── utils/           # Utilidades (logger, helpers)
│   └── server.js        # Configuración del servidor
├── app.js               # Punto de entrada
└── package.json
```

## 🛠️ Scripts Disponibles

- `npm start` - Inicia el servidor en producción
- `npm run dev` - Inicia el servidor en modo desarrollo con nodemon
- `npm test` - Ejecuta los tests con coverage
- `npm run test:watch` - Ejecuta tests en modo watch
- `npm run lint` - Verifica el código con ESLint
- `npm run lint:fix` - Corrige errores de ESLint automáticamente
- `npm run format` - Formatea el código con Prettier

## 🔧 Configuración

### Variables de Entorno

Ver `.env.example` para todas las variables disponibles.

### Base de Datos

El proyecto usa Sequelize como ORM. Configura las variables de entorno de base de datos en `.env`.

## 📝 API

### Health Checks

- `GET /api/v1/health` - Health check básico
- `GET /api/v1/health/ready` - Readiness probe (verifica DB)
- `GET /api/v1/health/live` - Liveness probe

### Documentación

- `/api/v1/docs` - Swagger UI

## 🧪 Testing

```bash
npm test
```

## 📦 Dependencias Principales

- **Express** - Framework web
- **Sequelize** - ORM para PostgreSQL
- **Pino** - Logger estructurado
- **Helmet** - Seguridad HTTP
- **express-rate-limit** - Rate limiting
- **express-validator** - Validación de requests

## 🔒 Seguridad

- Helmet para headers de seguridad
- Rate limiting configurado
- Validación de inputs con express-validator
- Manejo seguro de errores (sin exponer stack traces en producción)

## 📄 Licencia

ISC

## Arquitectura - Resumen

### 🔵 **Capas separadas verticalmente**

* Presentación (rutas, controllers, middlewares)
* Dominio / lógica de negocio (services)
* Acceso a datos (repositorios, modelos)
* Base de datos (PostgreSQL)

### 🟡 **Colores para distinguir responsabilidades**

* Azul → Routing
* Verde → Controladores
* Morado → Middlewares
* Verde claro → Servicios
* Naranja → Repositorios
* Amarillo → Modelos


``` mermaid
flowchart TB

    %% ======= PRESENTATION LAYER =========
    subgraph Presentation["🟦 Capa de Presentación (HTTP)"]
        direction TB

        subgraph Routes["🔵 Routes"]
            AUTH_R[Auth Routes<br/>/auth/*]
            HEALTH_R[Health Routes<br/>/health/*]
        end

        subgraph Controllers["🟢 Controllers"]
            AUTH_C[Auth Controller]
            HEALTH_C[Health Controller]
        end

        subgraph Middlewares["🟣 Middlewares"]
            AUTH_MW[Auth Middleware]
            VALIDATE_MW[Validate Request]
            RESPONSE_MW[Response Handler]
            ERROR_MW[Error Handler]
        end
    end


    %% ======= DOMAIN LAYER =========
    subgraph Domain["🟩 Capa de Negocio(Services)"]
        
        direction TB

        AUTH_S[Auth Service]
        HEALTH_S[Health Service]
    end


    %% ======= DATA LAYER =========
    subgraph Data["🟧 Capa de Datos"]
        direction TB

        AUTH_REPO[Auth Repository]

        subgraph Models["🟨 Sequelize Models"]
            USER_M[User Model]
            ROLE_M[Role Model]
        end

        DB[🗄️ PostgreSQL]
    end


    %% ===== FLOW CONNECTIONS =====

    %% Presentation → Domain
    AUTH_R --> AUTH_C --> AUTH_S
    HEALTH_R --> HEALTH_C --> HEALTH_S

    %% Domain → Data
    AUTH_S --> AUTH_REPO --> USER_M --> DB
    AUTH_REPO --> ROLE_M
    

    %% Middlewares applied globally
    AUTH_R -.-> AUTH_MW
    AUTH_R -.-> VALIDATE_MW
    AUTH_R -.-> RESPONSE_MW
    AUTH_R -.-> ERROR_MW

    HEALTH_R -.-> RESPONSE_MW
    HEALTH_R -.-> ERROR_MW
```
