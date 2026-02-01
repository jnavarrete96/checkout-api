# 🛒 E-Commerce Checkout API

API REST para sistema de e-commerce con integración de pagos mediante Wompi. Implementa arquitectura hexagonal con patrón Ports & Adapters y Railway Oriented Programming.

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#️-tecnologías)
- [Arquitectura](#-arquitectura)
- [Modelo de Datos](#-modelo-de-datos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Ejecución](#-ejecución)
- [API Endpoints](#-api-endpoints)
- [Testing](#-testing)
- [Documentación Swagger](#-documentación-swagger)

---

## ✨ Características

- ✅ **Arquitectura Hexagonal** (Ports & Adapters)
- ✅ **Railway Oriented Programming** (Result pattern)
- ✅ **Integración con Wompi** (pasarela de pagos)
- ✅ **Checkout como invitado** (sin registro previo)
- ✅ **Recuperación de transacciones** (resiliencia ante cierres inesperados)
- ✅ **Actualización automática de stock**
- ✅ **Validaciones robustas** con class-validator
- ✅ **Tests unitarios** (83.33% coverage)
- ✅ **Documentación Swagger/OpenAPI**

---

## 🛠️ Tecnologías

### Backend
- **NestJS** - Framework principal
- **TypeScript** - Lenguaje
- **PostgreSQL** - Base de datos
- **TypeORM** - ORM
- **Class Validator** - Validaciones
- **Axios** - Cliente HTTP para Wompi

### Testing
- **Jest** - Framework de testing
- **Supertest** - Tests E2E (opcional)

### Documentación
- **Swagger/OpenAPI** - Documentación interactiva de API

---

## 🏗️ Arquitectura

### Hexagonal Architecture (Ports & Adapters)

```
src/
├── domain/                          # Capa de Dominio (Lógica de negocio)
│   ├── entities/                    # Entidades de dominio
│   │   ├── Customer.entity.ts
│   │   ├── Product.entity.ts
│   │   ├── Transaction.entity.ts
│   │   └── Delivery.entity.ts
│   ├── repositories/                # Puertos (interfaces)
│   │   ├── Customer.repository.ts
│   │   ├── Product.repository.ts
│   │   ├── Transaction.repository.ts
│   │   └── Delivery.repository.ts
│   └── services/
│       └── PaymentGateway.interface.ts
│
├── application/                     # Capa de Aplicación (Casos de uso)
│   └── use-cases/
│       ├── create-transaction/
│       ├── process-payment/
│       ├── get-transaction/
│       ├── recover-transaction/
│       ├── list-products/
│       └── get-product/
│
├── infrastructure/                  # Capa de Infraestructura (Adaptadores)
│   ├── persistence/
│   │   └── typeorm/
│   │       ├── entities/           # Mapeo TypeORM
│   │       ├── repositories/       # Implementación de puertos
│   │       └── seeds/
│   ├── external/
│   │   └── wompi/                  # Integración con Wompi
│   ├── http/
│   │   └── controllers/            # Endpoints REST
│   └── modules/                    # Módulos NestJS
│
└── shared/                          # Utilidades compartidas
    ├── result/                      # Railway Oriented Programming
    └── types/
```

### Principios Aplicados

1. **Separation of Concerns** - Cada capa tiene responsabilidades claras
2. **Dependency Inversion** - Domain no depende de Infrastructure
3. **Railway Oriented Programming** - Manejo de errores con Result pattern
4. **Single Responsibility** - Cada use case tiene una sola responsabilidad

---

## 💾 Modelo de Datos

### Diagrama Entidad-Relación

```
┌─────────────┐           ┌──────────────┐           ┌─────────────┐
│  customers  │           │ transactions │           │  products   │
├─────────────┤           ├──────────────┤           ├─────────────┤
│ id (PK)     │──────<    │ id (PK)      │    >──────│ id (PK)     │
│ email       │    1:N    │ customer_id  │    N:1    │ name        │
│ full_name   │           │ product_id   │           │ description │
│ phone       │           │ status       │           │ price       │
│ created_at  │           │ amount       │           │ stock_qty   │
│ updated_at  │           │ total_amount │           │ is_active   │
└─────────────┘           │ wompi_tx_id  │           │ created_at  │
                          │ card_brand   │           │ updated_at  │
                          │ created_at   │           └─────────────┘
                          │ updated_at   │
                          └──────────────┘
                                 │ 1:1
                                 │
                          ┌──────────────┐
                          │  deliveries  │
                          ├──────────────┤
                          │ id (PK)      │
                          │ tx_id (FK)   │
                          │ full_name    │
                          │ phone        │
                          │ address      │
                          │ city         │
                          │ state        │
                          │ postal_code  │
                          │ created_at   │
                          │ updated_at   │
                          └──────────────┘
```

### Relaciones

- **Customer → Transaction**: 1:N (Un cliente puede tener múltiples transacciones)
- **Product → Transaction**: 1:N (Un producto puede estar en múltiples transacciones)
- **Transaction → Delivery**: 1:1 (Cada transacción tiene una entrega)

### Estados de Transacción

```typescript
enum TransactionStatus {
  PENDING   = 'PENDING',   // Creada, esperando pago
  APPROVED  = 'APPROVED',  // Pago aprobado
  DECLINED  = 'DECLINED',  // Pago rechazado
  ERROR     = 'ERROR'      // Error en procesamiento
}
```

---

## 📥 Instalación

### Prerrequisitos

- Node.js >= 18.x
- PostgreSQL >= 14.x
- npm o yarn

### Pasos

1. **Clonar el repositorio**

```bash
git clone <tu-repositorio>
cd checkout-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Crear base de datos**

```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE checkout_app_db;
\c checkout_app_db

# Ejecutar el script de creación de tablas
# (Ver archivo database-schema.sql en la raíz del proyecto)
```

**Script SQL:**

```sql
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM
CREATE TYPE transaction_status AS ENUM (
  'PENDING',
  'APPROVED',
  'DECLINED',
  'ERROR'
);

-- Create tables (products, customers, transactions, deliveries)
-- Ver archivo completo en: database-schema.sql
```

4. **Configurar variables de entorno**

```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=tu_password
DB_DATABASE=checkout_app_db

# Wompi API (Sandbox)
WOMPI_BASE_URL=https://api-sandbox.co.uat.wompi.dev/v1
WOMPI_PUBLIC_KEY=pub_stagtest_g2u0HQd3ZMh05hsSgTS2lUV8t3s4mOt7
WOMPI_PRIVATE_KEY=prv_stagtest_5i0ZGIGiFcDQifYsXxvsny7Y37tKqFWg
WOMPI_INTEGRITY_KEY=stagtest_integrity_nAIBuqayW70XpUqJS4qf4STYiISd89Fp

# Base fees
BASE_FEE=5000
DELIVERY_FEE=10000
```

---

## ⚙️ Configuración

### Variables de Entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DB_HOST` | Host de PostgreSQL | `localhost` |
| `DB_PORT` | Puerto de PostgreSQL | `5432` |
| `DB_USERNAME` | Usuario de BD | `postgres` |
| `DB_PASSWORD` | Contraseña de BD | `your_password` |
| `DB_DATABASE` | Nombre de la BD | `checkout_app_db` |
| `WOMPI_BASE_URL` | URL base de Wompi | `https://api-sandbox.co.uat.wompi.dev/v1` |
| `WOMPI_PUBLIC_KEY` | Public key de Wompi | `pub_stagtest_...` |
| `WOMPI_PRIVATE_KEY` | Private key de Wompi | `prv_stagtest_...` |
| `WOMPI_INTEGRITY_KEY` | Integrity key de Wompi | `stagtest_integrity_...` |
| `BASE_FEE` | Tarifa base (COP) | `5000` |
| `DELIVERY_FEE` | Tarifa de envío (COP) | `10000` |

---

## 🚀 Ejecución

### Desarrollo

```bash
# Iniciar en modo desarrollo (con hot-reload)
npm run start:dev
```

La aplicación estará disponible en: `http://localhost:3000`

**Logs esperados:**

```
[Nest] LOG [NestApplication] Nest application successfully started
🟢 Products seeded successfully (3 products)
🚀 Application is running on: http://localhost:3000
📚 Swagger docs available at: http://localhost:3000/api/docs
```

### Producción

```bash
# Compilar
npm run build

# Ejecutar
npm run start:prod
```

### Seed de Productos

Los productos se seedean **automáticamente** al iniciar la aplicación (solo si la tabla está vacía).

**Productos de ejemplo:**
- Wireless Headphones ($25,000 COP)
- Gaming Mouse ($15,000 COP)
- Mechanical Keyboard ($45,000 COP)

---

## 📡 API Endpoints

### Products

#### `GET /api/products`
Lista todos los productos activos con stock disponible.

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Wireless Headphones",
    "description": "Noise cancelling headphones",
    "price": 25000,
    "stockQuantity": 10,
    "imageUrl": "https://...",
    "isActive": true
  }
]
```

#### `GET /api/products/:id`
Obtiene el detalle de un producto específico.

**Response:**
```json
{
  "id": "uuid",
  "name": "Wireless Headphones",
  "price": 25000,
  "stockQuantity": 10
}
```

---

### Transactions

#### `POST /api/transactions`
Crea una nueva transacción (checkout como invitado).

**Request:**
```json
{
  "customerEmail": "juan@gmail.com",
  "customerFullName": "Juan Pérez",
  "customerPhone": "3001234567",
  "productId": "uuid-del-producto",
  "quantity": 1,
  "deliveryFullName": "Juan Pérez",
  "deliveryPhone": "3001234567",
  "deliveryAddress": "Calle 123 #45-67",
  "deliveryCity": "Medellín",
  "deliveryState": "Antioquia",
  "deliveryPostalCode": "050001"
}
```

**Response:**
```json
{
  "transactionId": "uuid-generado",
  "transactionNo": "TXN-20260131-123456789",
  "status": "PENDING",
  "totalAmount": 40000,
  "customerEmail": "juan@gmail.com"
}
```

**Cálculo de montos:**
- `amount` = precio del producto × cantidad
- `baseFee` = 5,000 COP (fijo)
- `deliveryFee` = 10,000 COP (fijo)
- `totalAmount` = amount + baseFee + deliveryFee

---

#### `GET /api/transactions/:id`
Obtiene el detalle completo de una transacción.

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "transactionNo": "TXN-20260131-123456789",
    "status": "APPROVED",
    "totalAmount": 40000,
    "createdAt": "2026-01-31T10:30:00Z"
  },
  "customer": {
    "email": "juan@gmail.com",
    "fullName": "Juan Pérez",
    "phone": "3001234567"
  },
  "product": {
    "name": "Wireless Headphones",
    "price": 25000
  },
  "delivery": {
    "address": "Calle 123 #45-67",
    "city": "Medellín",
    "state": "Antioquia"
  },
  "payment": {
    "cardBrand": "VISA",
    "cardLastFour": "4242",
    "wompiTransactionId": "15113-1769843542-75731"
  }
}
```

---

#### `GET /api/transactions/recover?email=xxx`
Recupera una transacción PENDING por email (para resiliencia).

**Query Params:**
- `email`: Email del cliente

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "transactionNo": "TXN-20260131-123456789",
    "status": "PENDING",
    "totalAmount": 40000
  },
  "product": {
    "name": "Wireless Headphones",
    "price": 25000
  },
  "delivery": {
    "city": "Medellín",
    "address": "Calle 123 #45-67"
  }
}
```

**Casos de uso:**
- Usuario cierra el navegador antes de pagar
- Se va la luz durante el checkout
- Usuario cambia de dispositivo
- Permite continuar donde se quedó

---

#### `PATCH /api/transactions/:id/process-payment`
Procesa el pago de una transacción usando Wompi.

**Request:**
```json
{
  "cardNumber": "4242424242424242",
  "cardExpMonth": "12",
  "cardExpYear": "28",
  "cardCvc": "123",
  "cardHolder": "Juan Perez"
}
```

**Response (APPROVED):**
```json
{
  "transactionId": "uuid",
  "transactionNo": "TXN-20260131-123456789",
  "status": "APPROVED",
  "totalAmount": 40000,
  "wompiTransactionId": "15113-1769843542-75731",
  "wompiReference": "TXN-20260131-123456789",
  "cardBrand": "VISA",
  "cardLastFour": "4242",
  "message": "Payment processed successfully"
}
```

**Response (DECLINED):**
```json
{
  "statusCode": 400,
  "message": "Payment declined by payment gateway",
  "error": "Bad Request"
}
```

**Flujo interno:**
1. Tokeniza la tarjeta con Wompi
2. Crea transacción en Wompi
3. Hace polling hasta obtener estado final
4. Si APPROVED: actualiza stock del producto
5. Actualiza estado de la transacción en BD

---

### Tarjetas de Prueba (Wompi Sandbox)

| Número | Resultado |
|--------|-----------|
| `4242 4242 4242 4242` | ✅ APPROVED |
| `4111 1111 1111 1111` | ❌ DECLINED |
| Cualquier otra | ⚠️ ERROR |

**Datos comunes:**
- Exp Month: `01-12` (cualquier mes futuro)
- Exp Year: `28` (cualquier año futuro)
- CVC: `123` (cualquier 3 dígitos)
- Holder: Cualquier nombre

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm run test

# Tests en modo watch
npm run test:watch

# Coverage
npm run test:cov
```

### Coverage Report

**Total Coverage: 83.33%** ✅ (Requisito: >80%)

```
-------------------------------------------|---------|----------|---------|---------|
File                                       | % Stmts | % Branch | % Funcs | % Lines |
-------------------------------------------|---------|----------|---------|---------|
All files                                  |   83.33 |       73 |   78.78 |   83.21 |
 application/use-cases/create-transaction  |     100 |     87.5 |     100 |     100 |
 application/use-cases/get-product         |     100 |      100 |     100 |     100 |
 application/use-cases/get-transaction     |     100 |    95.65 |     100 |     100 |
 application/use-cases/list-products       |     100 |      100 |     100 |     100 |
 application/use-cases/process-payment     |   97.56 |       75 |     100 |   97.56 |
 application/use-cases/recover-transaction |     100 |      100 |     100 |     100 |
 domain/entities                           |   74.17 |    68.88 |   72.05 |   74.17 |
 infrastructure/external/wompi             |   82.17 |    62.16 |      90 |   81.63 |
 shared/result                             |   63.63 |    57.14 |   83.33 |   63.63 |
-------------------------------------------|---------|----------|---------|---------|
```

### Cobertura por Capa

- **Use Cases (Application Layer)**: 97-100% ✅
  - Lógica de negocio completamente testeada
  - 6 use cases con tests unitarios exhaustivos

- **Domain Entities**: 74% ✅
  - Validaciones y métodos de negocio
  - Transaction, Customer, Product, Delivery

- **WompiService (External Integration)**: 82% ✅
  - Tests de integración con Wompi sandbox
  - Flujo completo: tokenize → create → poll

- **Railway Oriented Programming (Result)**: 64% ✅
  - Manejo de éxito/error con Result pattern

### Tests Ejecutados

- **Test Suites**: 7 passed
- **Tests**: 47 passed
- **Snapshots**: 0

**Estrategia de Testing:**
- ✅ Tests unitarios de use cases (lógica de negocio)

---

## 📚 Documentación Swagger

La documentación interactiva de la API está disponible en:

**URL Local:** `http://localhost:3000/api/docs`

**URL Producción:** `https://tu-dominio.com/api/docs`

### Características de Swagger

- 📖 Documentación completa de todos los endpoints
- 🧪 Interfaz "Try it out" para probar endpoints
- 📋 Schemas de request/response
- 🏷️ Endpoints agrupados por tags (Products, Transactions)
- 📝 Ejemplos de uso con datos reales

### Capturas de Swagger

La documentación incluye:
- Descripción detallada de cada endpoint
- Parámetros requeridos y opcionales
- Códigos de respuesta (200, 400, 404)
- Ejemplos de payloads
- Modelos de datos

---

## 🔐 Seguridad

### Manejo de Datos Sensibles

- ✅ **Nunca** se almacenan números completos de tarjeta
- ✅ Solo se guardan: marca (`cardBrand`) y últimos 4 dígitos (`cardLastFour`)
- ✅ CVC nunca se almacena (solo se envía a Wompi)
- ✅ Tokenización con Wompi antes de procesar pagos

### Validaciones

- ✅ DTOs con `class-validator`
- ✅ Validación de formato de tarjeta (Luhn check en Wompi)
- ✅ Validación de fechas de expiración
- ✅ Validación de stock disponible
- ✅ Validación de producto activo

---

## 🌐 Deploy

### Preparación para Deploy

1. **Configurar variables de entorno de producción**
2. **Configurar base de datos PostgreSQL** (RDS, Heroku, etc.)
3. **Compilar aplicación:**

```bash
npm run build
```
---

## 📦 Scripts Disponibles

```bash
npm run start          # Iniciar en modo normal
npm run start:dev      # Iniciar en modo desarrollo (watch)
npm run start:prod     # Iniciar en modo producción
npm run build          # Compilar TypeScript
npm run test           # Ejecutar tests
npm run test:watch     # Tests en modo watch
npm run test:cov       # Tests con coverage
npm run lint           # Lint con ESLint
npm run format         # Formatear código con Prettier
```

---

## 🤝 Contribución

Este proyecto fue desarrollado como prueba técnica para demostrar:
- ✅ Arquitectura hexagonal
- ✅ Railway Oriented Programming
- ✅ Integración con pasarelas de pago
- ✅ Testing exhaustivo
- ✅ Documentación completa

---

## 📄 Licencia

UNLICENSED - Proyecto de prueba técnica

---

## 👤 Autor

**Juan Pablo Navarrete Morales**
- GitHub: [@jnavarrete96](https://github.com/jnavarrete96)
- LinkedIn: [Juan-Navarrete](https://www.linkedin.com/in/juan-pablo-navarrete-morales)

---

## 🙏 Agradecimientos

- NestJS por el excelente framework
- Wompi por la API sandbox
- TypeORM por el ORM robusto