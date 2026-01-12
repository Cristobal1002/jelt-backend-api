# Node - Api JeltApp

Backend de consumo para integración App Jelt

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
│   ├── constants/       # Declaración de constantes generales
│   ├── controllers/     # Controladores
│   ├── errors/          # Clases de errores personalizados
│   ├── loaders/         # Cargadores (Express, DB, etc.)
│   ├── middlewares/     # Middlewares personalizados
│   ├── models/          # Modelos de Sequelize
│   ├── routes/          # Definición de rutas
│   ├── modules/         
│   │    └── article/               # Implementacion para manejo de articulos
│   │    └── assistant/             # Implementacion para chatbot, asistente con openAI
│   │    └── auth/                  # Implementacion Autenticación, Login y Registro
│   │    └── category/              # Implementacion gestión de categorias (eje: consumibles)
│   │    └── inventory-history/     # Implementacion Historicos (ventas, movimientos)
│   │    └── replenishment/         # Implementacion entradas de inventario
│   │    └── stockroom/             # Implementacion para manejo de inventario localizado, stock o bodegas
│   │    └── supplier/              # Implementacion de Proveedores
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

#### Ejemplo de archivo de variables de entorno

- `.env`
```bash
# Configruaciones para Base de datos
DB_LOGGING=false
DB_NAME=Jelt-App
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=password_database
DB_PORT=5432
DB_SYNC_MODE=alter

# Configruaciones generales de la aplicacion
NODE_ENV=development
APP_URL=http://localhost:3000
API_VERSION=v1
APP_NAME=Jelt
JWT_SECRET=string_jwt_token_secret

# Configruaciones para OPENAI, se usa para el assistant
AI_ENABLED=true
OPENAI_API_KEY=string_open_ai_key_secret
OPENAI_MODEL=gpt-4.1-nano

# Configruaciones para correo electronico, se usa por ejemplo para recuperar contraseña
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=no-replysmtp@gmail.com
SMTP_PASS=password de aplicacion
SMTP_SERVICE=gmail
MAIL_FROM="Jelt App<no-replysmtp@gmail.com>"
SUPPORT_EMAIL="support@jelt.com"
```

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

## Login y Recovery password

El recurso /auth/recover, realiza la validación y envio de instrucciones al correo del usuario para recuperar su cuenta por medio de un codigo temporal (que es usado como password temporarl), con una duración de una hora.

```
Request:
/auth/recover
JSON
{
    "email": "user@example.com"
}

Response:
JSON
{
    "code": 200,
    "success": true,
    "message": "If the email exists, recovery instructions were sent",
    "data": {
        "sent": true
    },
    "error": {}
}
```

El usuario verifica en su correo electronico. Una vez que sea recibido el codigo temporal debera usar el recurso /auth/login-temp para autenticarse en el sistema y posteriormente actualziar los datos de acceso.

![alt text](image.png)

```
Request
/auth/recover
JSON
{ 
    "email": "user@example.com", 
    "code": "546229" 
}

Response
JSON
{
    "code": 200,
    "success": true,
    "message": "Temporary login successful",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZiY2NiOTdkLWQ3MWEtNDhh._G3oI76gBbZ2Y99OCb0",
        "user": {
            "id": "6bccb97d-d71a-48a5-b823-a685b1595526",
            "id_rol": "1e2ce9b1-5581-4a39-8a2b-f6a0304233ed",
            "name": "Usuario",
            "email": "user@example.com",
            "phone": "+5713058128825",
            "address": "calle 16#00-20",
            "isActive": true,
            "isDelete": false,
            "isLocked": false,
            "lockedAt": "2026-01-12T04:27:48.225Z",
            "tempAccessCode": null,
            "tempAccessCodeCreatedAt": null,
            "createdAt": "2026-01-12T03:14:24.065Z",
            "updatedAt": "2026-01-12T04:34:04.963Z",
            "role": {
                "id": "1e2ce9b1-5581-4a39-8a2b-f6a0304233ed",
                "name": "USER",
                "description": null,
                "isActive": true,
                "createdAt": "2026-01-05T05:51:33.767Z",
                "updatedAt": "2026-01-05T05:51:33.767Z"
            }
        }
    },
    "error": {}
}
```

## Funcionalidad de Assistant o Chat BOT integrado con OPENAI

## Configuración

Variables de entorno que son utilizadas como parte de la configuración de integración con OPENAI. Si `AI_ENABLED` no se configura o esta en `false` la funcionalidad de del chat no estará disponible.

La variable de entorno `OPENAI_API_KEY` se configura a partir del api key desde el panel de control de openai, visite la pagina de "https://platform.openai.com/settings/organization/api-keys"

La variable de entorno `OPENAI_MODEL` se debe indicar el modelo de OPENAI, visite la pagina oficial para indicar el valor que mejor convenga para los casos de uso, por defecto se puede utilizar un modelo como gpt-4.1-nano 

```
AI_ENABLED=true
OPENAI_API_KEY=string_open_ai_key_secret
OPENAI_MODEL=gpt-4.1-nano
```

**la implementación actual del assistant** (consultas, IA + tools, multi-tenant por `id_user`, creación de entidades, inventario, historial, stock, etc.), **estas son preguntas/órdenes reales que es posible enviarle** al endpoint:

```
Chatbot de IA para consultas de inventario.
Para 'conversationId' el campo que debería contener el ID de la conversación previa para contextos continuos. 
Si es nulo, se inicia una nueva conversación.
Por defecto se usará el identificador del usuario logeado en la aplicación

POST /assistant/chat
{ 
    "message": "Crea una categoría llamada Inyectables",
    "conversationId": "user id interno"
}
```

**casos de uso**, considenrado lo qué cubre hoy el assistant.

---

# CONSULTAS DE INVENTARIO

### Existencia / stock

* **“¿Qué artículos existen en el inventario?”**
* **“¿Qué artículos existen en el inventario de aspirina?”**
* **“Muéstrame el stock actual de la aspirina”**
* **“¿Cuánto stock hay del SKU ASP-500?”**
* **“¿En qué almacenes hay aspirina disponible?”**
* **“Dame la distribución de stock del artículo ibuprofeno por almacén”**

---

### Bajo stock / reorden

* **“¿Qué artículos tienen bajo stock?”**
* **“¿Qué productos están por debajo del punto de reorden?”**
* **“Muéstrame los artículos que están próximos a agotarse”**
* **“Sugiere reorden para el SKU ASP-500”**
* **“¿Cuánto debería reordenar del artículo ibuprofeno?”**

Aquí el assistant usa:

* demanda promedio
* desviación
* lead time
* service level
  (todo lo que esta implementado en repositorios del assistant)

---

### Historial de inventario

* **“Muéstrame el historial de movimientos del artículo aspirina”**
* **“¿Qué movimientos de stock tuvo el artículo 10 en los últimos 7 días?”**
* **“Ventas del artículo ibuprofeno en el último mes”**
* **“¿Cuántas unidades se vendieron de aspirina la semana pasada?”**
* **“Historial de ventas del SKU ASP-500 entre enero y febrero”**

---

# CREACIÓN DE ENTIDADES

## Categorías

### Con datos completos

* **“Crea una categoría llamada Analgésicos”**
* **“Registra la categoría Antibióticos con descripción Medicamentos con prescripción”**

### Con datos incompletos (el assistant pregunta)

* **“Crea una categoría”**
* **“Quiero registrar una nueva categoría”**

➡️ El assistant responde:

> “¿Cuál es el nombre de la categoría?”

---

## Almacenes / Stockrooms

### Con datos completos

* **“Crea un almacén llamado Bodega Principal”**
* **“Registra un stockroom llamado Farmacia Central en Calle 10 #5-20”**

### Incompleto

* **“Crea un almacén”**
* **“Agrega un nuevo stockroom”**

➡️ El assistant pregunta por el **nombre**.

---

## Proveedores (globales)

### Completo

* **“Registra un proveedor llamado ACME Pharma con NIT 900123456”**
* **“Crea el proveedor Bayer con NIT 800999888 y teléfono 3001234567”**
* **“Agrega proveedor Pfizer NIT 900111222 dirección Calle 20”**

### Incompleto

* **“Crea un proveedor”**
* **“Registra un proveedor llamado ACME”**

➡️ El assistant responde:

> “Para crear el proveedor necesito el nombre y el NIT. ¿Me los indicas?”

---

# CONSULTAS COMBINADAS / NATURALES

Estas son frases “humanas” que el assistant **ya puede interpretar correctamente**:

* **“¿Qué artículos de analgésicos tienen bajo stock?”**
* **“¿Hay aspirina disponible en la bodega principal?”**
* **“Muéstrame los productos con mayor rotación”**
* **“¿Qué artículos debería reordenar esta semana?”**
* **“Dame un resumen del estado del inventario”**
* **“¿Qué productos se han vendido más en los últimos 30 días?”**

---

# CONSIDERACIONES

Estas preguntas:

* **solo devuelven datos del usuario autenticado**
* **no exponen `id_user`**
* **no mezclan inventarios entre usuarios**

Ejemplo:

* Dos usuarios preguntan *“¿Qué artículos existen?”*
  ➡️ Cada uno ve **solo su inventario**

---

# Resumen rápido

Con la implementación actual, el assistant **ya funciona como**:

```
✅ Consultor de inventario
✅ Detector de bajo stock
✅ Asistente de reorden
✅ Analista de historial
✅ Creador guiado de categorías
✅ Creador guiado de almacenes
✅ Creador guiado de proveedores
✅ Multi-tenant seguro
```

---

### Ejemplos de mensajes

#### Intereacciones con el agente
```
{ "message": "Crea una categoría" }
{ "message": "Crea una categoría llamada Analgésicos" }
{ "message": "Crea un almacén llamado Bodega Principal en la dirección Calle 1 #1-11" }
{ "message": "Crea un proveedor llamado Proveedor 1 con NIT 900123456" }
{ "message": "Registra un proveedor llamado ACME Pharma con NIT 900123456, teléfono 3001234567" }
{ "message": "¿Qué artículos existen en el inventario de aspirina?" }
```

#### Intereacciones con el agente

Request:
```
{ 
    "message": "Crea una categoría llamada Inyectables" 
}
```

Response:
```
{
    "data": {
        "reply": "He creado la categoría \"Inyectables\". ¿Quieres agregar una descripción o realizar alguna otra acción?",
        "usedTools": [
        "create_category"
        ]
    },
    "conversationId": "4d48ddb7-be9f-4e50-825b-3e3b6aa84ab4"
}
```