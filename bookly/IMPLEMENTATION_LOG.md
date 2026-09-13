# Bookly - Implementation Log

This file tracks all completed implementation sections. Each section is added chronologically.

---

## SECTION 1: Project Initialization and Monorepo Setup

**Date:** 2026-08-23
**Status:** Completed

### Files Created

#### Root Configuration
| File | Description |
|------|-------------|
| `pnpm-workspace.yaml` | Workspace definition for `apps/*`, `agents/*`, `packages/*` |
| `.env.example` | Environment variable template for all services and infrastructure |
| `IMPLEMENTATION_LOG.md` | This file - tracks all implementation progress |

#### Modified Files
| File | Change |
|------|--------|
| `package.json` | Added monorepo scripts (`dev:catalog`, `dev:users`, `build`, `test`, `lint`) |
| `.gitignore` | Added env files, Docker, logs, coverage, transaction storage, context file rules |

#### Shared Configurations (`packages/config/`)
| File | Description |
|------|-------------|
| `package.json` | Package manifest for `@bookly/config` |
| `eslint/base.js` | Base ESLint config with TypeScript support |
| `typescript/base.json` | Base TypeScript config with strict settings |
| `prettier/.prettierrc` | Shared Prettier formatting rules |

#### Shared Types (`packages/shared/types/`)
| File | Description |
|------|-------------|
| `user.types.ts` | User, CreateUserDto, UpdateUserDto, LoginDto, AuthResponse |
| `book.types.ts` | Book, CreateBookDto, UpdateBookDto, BookAvailability |
| `transaction.types.ts` | Rental, Purchase, CreateRentalDto, CreatePurchaseDto, LibraryEntry |
| `index.ts` | Barrel export for all types |

#### Shared Constants (`packages/shared/constants/`)
| File | Description |
|------|-------------|
| `ports.ts` | PORTS constant with all service port mappings |
| `events.ts` | EVENTS constant with notification event types |
| `index.ts` | Barrel export for all constants |

#### Shared Utilities (`packages/shared/utils/`)
| File | Description |
|------|-------------|
| `correlation-id.ts` | Correlation ID generation and header extraction |
| `logger.ts` | StructuredLogger class for JSON logging with service context |
| `index.ts` | Barrel export for all utilities |

#### Contracts (`packages/contracts/`)
| File | Description |
|------|-------------|
| `auth/index.ts` | Auth API contracts: RegisterRequest, LoginRequest, AuthResponse |
| `books/index.ts` | Books API contracts: Book, CreateBookRequest, SearchBooksQuery |
| `transactions/index.ts` | Transactions API contracts: Rental, Purchase, LibraryEntry |
| `notifications/index.ts` | Notifications API contracts: NotificationType, CreateNotificationRequest |

#### Workspace Package Configs
| File | Description |
|------|-------------|
| `packages/shared/package.json` | Package manifest for `@bookly/shared` |
| `packages/shared/tsconfig.json` | TypeScript config for shared package |
| `packages/contracts/package.json` | Package manifest for `@bookly/contracts` |
| `packages/contracts/tsconfig.json` | TypeScript config for contracts package |
| `packages/config/package.json` | Package manifest for `@bookly/config` |

### Notes
- Existing Angular app preserved at project root with its `package.json` and config
- Monorepo scripts added alongside Angular scripts (e.g. `build` runs `pnpm -r build`)
- TypeScript config enables strict null checks and decorator support
- Structured logger outputs JSON format with timestamp, level, service, event, and correlation_id
- Contracts define the API interfaces between services (will be used for inter-service communication)

---

## SECTION 1B: Placeholder Microservices (NestJS)

**Date:** 2026-08-23
**Status:** Completed

### What was done
Created minimal NestJS placeholder microservices under `apps/` for each backend service.
Each service has a single `GET /` endpoint returning `{ status: "ok", service: "<name>" }`.

### Services Created

| Service | Port | Package Name | Directory |
|---------|------|--------------|-----------|
| library-mcp | 8000 | `@bookly/library-mcp` | `apps/library-mcp/` |
| catalog-svc | 8001 | `@bookly/catalog-svc` | `apps/catalog-svc/` |
| users-svc | 8002 | `@bookly/users-svc` | `apps/users-svc/` |
| transaction-svc | 8003 | `@bookly/transaction-svc` | `apps/transaction-svc/` |
| notif-svc | 8004 | `@bookly/notif-svc` | `apps/notif-svc/` |

### Files per Service
```
apps/<service>/
├── package.json            # NestJS dependencies, "dev" script with nest start --watch
├── tsconfig.json           # Extends shared base TypeScript config
├── tsconfig.build.json     # Build-specific TS config
├── nest-cli.json           # NestJS CLI configuration
└── src/
    ├── main.ts             # Bootstrap NestJS on service port
    ├── app.module.ts       # Root module with HealthController
    └── health/
        └── health.controller.ts  # GET / → { status: "ok", service: "<name>" }
```

### How to Test

```bash
# Frontend (Angular)
npm start                    # → http://localhost:4200

# Microservices (each in a separate terminal)
pnpm dev:catalog             # → http://localhost:8001
pnpm dev:users               # → http://localhost:8002
pnpm dev:transaction         # → http://localhost:8003
pnpm dev:notif               # → http://localhost:8004
pnpm dev:mcp                 # → http://localhost:8000
```

Navigate to `http://localhost:<port>` in a browser to verify each service responds.

### Additional Changes
- `INSTRUCTIONS.md`: Renamed all `libri-flow`/`LibriFlow` references to `bookly`/`Bookly`

---

---

## SECTION 2: Infrastructure Setup (Docker + PostgreSQL + Consul + Mailpit)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Set up Docker Compose infrastructure with PostgreSQL, Consul, and Mailpit containers. Created database initialization scripts with proper user permissions and seed data.

### Infrastructure Components

| Service | Image | Port(s) | Purpose |
|---------|-------|---------|---------|
| PostgreSQL | `postgres:16-alpine` | 5432 | Primary database (4 databases for 4 services) |
| Consul | `hashicorp/consul:1.17` | 8500 (UI) | Service discovery and configuration |
| Mailpit | `axllent/mailpit` | 1025 (SMTP), 8025 (UI) | Email testing/dev |

### Files Created

| File | Description |
|------|-------------|
| `docker-compose.yml` | Orchestration for all 3 services with health checks |
| `.env` | Active environment variables for Docker services |
| `infrastructure/postgres/init.sql` | Creates 4 databases + 4 service users with least-privilege access |
| `infrastructure/postgres/seed.sql` | Creates Book table schema + inserts 6 sample books into catalog_db |

### Database Architecture

| Database | User | Service |
|----------|------|---------|
| `catalog_db` | `catalog_user` | catalog-svc |
| `users_db` | `users_user` | users-svc |
| `transaction_db` | `transaction_user` | transaction-svc |
| `notif_db` | `notif_user` | notif-svc |

### Seed Data (catalog_db)
6 books: Dune, Foundation, Clean Code, The Pragmatic Programmer, 1984, The Hobbit

### How to Start Infrastructure

```bash
cd Librio/bookly
docker compose up -d
```

### How to Verify

```bash
# Check all containers healthy
docker ps

# Verify databases exist
docker exec bookly-postgres-1 psql -U postgres -c "\l"

# Verify seed data
docker exec bookly-postgres-1 psql -U catalog_user -d catalog_db -c 'SELECT title, author, price FROM "Book";'
```

### Access URLs
- **PostgreSQL**: `localhost:5432`
- **Consul UI**: http://localhost:8500
- **Mailpit UI**: http://localhost:8025

### Notes
- All containers use health checks for proper startup ordering
- PostgreSQL volume persisted as `postgres_data` for data durability
- `version: '3.8'` in docker-compose.yml triggers a harmless deprecation warning
- Seed SQL creates the Book table to match the Prisma schema (will be superseded by Prisma migrations)

---

## SECTION 3: catalog-svc (Book Catalog Microservice)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Implemented the full book catalog microservice with Prisma ORM, CRUD endpoints, health checks, Consul auto-registration, and structured logging with correlation IDs.

### Files Created/Modified

| File | Description |
|------|-------------|
| `apps/catalog-svc/package.json` | Added Prisma, axios, class-validator, class-transformer dependencies |
| `apps/catalog-svc/prisma/schema.prisma` | Book model matching PostgreSQL schema |
| `apps/catalog-svc/src/database/prisma.service.ts` | PrismaClient lifecycle management |
| `apps/catalog-svc/src/database/prisma.module.ts` | Global Prisma module |
| `apps/catalog-svc/src/books/dto/create-book.dto.ts` | Create book validation DTO |
| `apps/catalog-svc/src/books/dto/update-book.dto.ts` | Update book validation DTO |
| `apps/catalog-svc/src/books/entities/book.entity.ts` | Book entity interface |
| `apps/catalog-svc/src/books/books.service.ts` | Business logic (CRUD + availability) |
| `apps/catalog-svc/src/books/books.controller.ts` | REST endpoints with validation |
| `apps/catalog-svc/src/books/books.module.ts` | Books feature module |
| `apps/catalog-svc/src/consul/consul.service.ts` | Consul registration/discovery |
| `apps/catalog-svc/src/logger/logger.service.ts` | Structured JSON logger |
| `apps/catalog-svc/src/middleware/correlation-id.middleware.ts` | Correlation ID propagation |
| `apps/catalog-svc/src/health/health.controller.ts` | Health + readiness endpoints |
| `apps/catalog-svc/src/app.module.ts` | Root module with all imports |
| `apps/catalog-svc/src/main.ts` | Bootstrap with ValidationPipe |
| `infrastructure/postgres/seed.sql` | Fixed table name to `books` + added ownership grant |

### Endpoints Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /books | Public | List all books (supports ?genre, ?title query params) |
| GET | /books/:id | Public | Get book by ID |
| GET | /books/:id/availability | Public | Check book availability |
| POST | /books | Internal | Create a new book |
| PUT | /books/:id | Internal | Update a book |
| DELETE | /books/:id | Internal | Delete a book |
| GET | / | Public | Legacy health check |
| GET | /healthz | Public | Health check (always returns OK) |
| GET | /readyz | Public | Readiness check (verifies DB connection) |

### Test Results

All endpoints verified working:
- `GET /books` → Returns 6 seed books
- `GET /books/1` → Returns Dune book
- `GET /books/1/availability` → Returns `{bookId:1, available:true, availableCopies:10}`
- `GET /books?genre=science-fiction` → Filters to Dune, Foundation
- `POST /books` → Creates new book with validation
- `PUT /books/:id` → Updates book fields
- `DELETE /books/:id` → Returns 204 No Content
- `GET /healthz` → `{"status":"ok"}`
- `GET /readyz` → `{"status":"ok"}` (DB connected)

### How to Test

```bash
# Start infrastructure
cd Librio/bookly
docker compose up -d

# Start catalog-svc
cd apps/catalog-svc
$env:DATABASE_URL="postgresql://catalog_user:catalog_pass@localhost:5432/catalog_db"
$env:CONSUL_HOST="localhost"
$env:CONSUL_PORT="8500"
npx nest start

# Test endpoints
curl http://localhost:8001/books
curl http://localhost:8001/books/1
curl http://localhost:8001/healthz
```

### Consul Registration
- Service registered as `catalog-svc` on port 8001
- Health check: `http://catalog-svc:8001/healthz` every 10s
- Auto-deregisters after 30s if critical

---

## SECTION 4: users-svc (Users + Authentication Microservice)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Implemented the users and authentication microservice with Prisma ORM, JWT authentication, user registration/login, profile management, health checks, Consul auto-registration, and structured logging.

### Files Created/Modified

| File | Description |
|------|-------------|
| `apps/users-svc/package.json` | Added Prisma, Passport, JWT, bcrypt, class-validator deps |
| `apps/users-svc/prisma/schema.prisma` | User model matching PostgreSQL schema |
| `apps/users-svc/src/database/prisma.service.ts` | PrismaClient lifecycle management |
| `apps/users-svc/src/database/prisma.module.ts` | Global Prisma module |
| `apps/users-svc/src/auth/dto/register.dto.ts` | Registration validation DTO |
| `apps/users-svc/src/auth/dto/login.dto.ts` | Login validation DTO |
| `apps/users-svc/src/auth/auth.service.ts` | Register, login, JWT generation, password hashing |
| `apps/users-svc/src/auth/strategies/jwt.strategy.ts` | Passport JWT strategy |
| `apps/users-svc/src/auth/guards/jwt-auth.guard.ts` | JWT authentication guard |
| `apps/users-svc/src/auth/auth.controller.ts` | Auth endpoints |
| `apps/users-svc/src/auth/auth.module.ts` | Auth module with JWT config |
| `apps/users-svc/src/users/dto/update-user.dto.ts` | Update user validation DTO |
| `apps/users-svc/src/users/entities/user.entity.ts` | User entity interface |
| `apps/users-svc/src/users/users.service.ts` | User CRUD operations |
| `apps/users-svc/src/users/users.controller.ts` | User endpoints |
| `apps/users-svc/src/users/users.module.ts` | Users feature module |
| `apps/users-svc/src/consul/consul.service.ts` | Consul registration/discovery |
| `apps/users-svc/src/logger/logger.service.ts` | Structured JSON logger |
| `apps/users-svc/src/middleware/correlation-id.middleware.ts` | Correlation ID propagation |
| `apps/users-svc/src/health/health.controller.ts` | Health + readiness endpoints |
| `apps/users-svc/src/app.module.ts` | Root module with all imports |
| `apps/users-svc/src/main.ts` | Bootstrap with ValidationPipe |

### Endpoints Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | Public | Register new user (returns JWT) |
| POST | /auth/login | Public | Login (returns JWT) |
| GET | /auth/profile | JWT | Get authenticated user profile |
| GET | /users/:id | Internal | Get user by ID (for other services) |
| PUT | /users/:id | Internal | Update user |
| DELETE | /users/:id | Internal | Delete user |
| GET | / | Public | Legacy health check |
| GET | /healthz | Public | Health check |
| GET | /readyz | Public | Readiness check |

### Security Features
- Passwords hashed with bcryptjs (10 rounds)
- JWT tokens with configurable expiration (default 60min)
- JWT strategy validates tokens on protected routes
- Duplicate email prevention (409 Conflict)
- Invalid credentials protection (401 Unauthorized)

### Test Results

All endpoints verified working:
- `POST /auth/register` → Creates user, returns JWT token
- `POST /auth/login` → Returns JWT token for valid credentials
- `GET /auth/profile` → Returns user profile with valid JWT
- `GET /users/1` → Returns user (no password in response)
- `PUT /users/1` → Updates user name
- `POST /auth/register` (duplicate) → 409 Conflict
- `POST /auth/login` (wrong password) → 401 Unauthorized
- `GET /auth/profile` (no token) → 401 Unauthorized
- `GET /healthz` → `{"status":"ok"}`
- `GET /readyz` → `{"status":"ok"}` (DB connected)

### How to Test

```bash
# Start infrastructure
cd Librio/bookly
docker compose up -d

# Start users-svc
cd apps/users-svc
$env:DATABASE_URL="postgresql://users_user:users_pass@localhost:5432/users_db"
$env:CONSUL_HOST="localhost"
$env:CONSUL_PORT="8500"
$env:JWT_SECRET="your-secret-key"
npx nest start

# Register
curl -X POST http://localhost:8002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"pass123"}'

# Login
curl -X POST http://localhost:8002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}'

# Profile (with JWT)
curl http://localhost:8002/auth/profile \
  -H "Authorization: Bearer <token>"
```

### Consul Registration
- Service registered as `users-svc` on port 8002
- Health check: `http://users-svc:8002/healthz` every 10s
- Auto-deregisters after 30s if critical

---

---

## SECTION 5: transaction-svc (Rentals + Purchases + Library)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Implemented the transaction microservice with rental management, book purchasing, unified library view, outbox notification pattern, circuit breaker resilience, and Consul registration. Added shared Prisma schema at root to handle multi-database types in pnpm hoisted mode.

### Files Created/Modified

| File | Description |
|------|-------------|
| `prisma/schema.prisma` | Combined Prisma schema with all models (Book, User, Rental, Purchase, NotificationOutbox) |
| `.npmrc` | `node-linker=hoisted` for shared node_modules |
| `apps/transaction-svc/package.json` | Added Prisma, Passport, JWT, @nestjs/schedule, class-validator deps |
| `apps/transaction-svc/prisma/schema.prisma` | Rental, Purchase, NotificationOutbox models |
| `apps/transaction-svc/src/rentals/dto/create-rental.dto.ts` | Create rental DTO with validation |
| `apps/transaction-svc/src/rentals/rentals.service.ts` | Rental CRUD + catalog-svc availability check + max 5 active limit |
| `apps/transaction-svc/src/rentals/rentals.controller.ts` | Rental endpoints with JWT auth |
| `apps/transaction-svc/src/rentals/rentals.module.ts` | Rentals feature module |
| `apps/transaction-svc/src/purchases/dto/create-purchase.dto.ts` | Create purchase DTO |
| `apps/transaction-svc/src/purchases/purchases.service.ts` | Purchase creation with catalog-svc price fetch |
| `apps/transaction-svc/src/purchases/purchases.controller.ts` | Purchase endpoints with JWT auth |
| `apps/transaction-svc/src/purchases/purchases.module.ts` | Purchases feature module |
| `apps/transaction-svc/src/library/library.service.ts` | Merges rentals + purchases + catalog-svc book details |
| `apps/transaction-svc/src/library/library.controller.ts` | Library + book access endpoints |
| `apps/transaction-svc/src/library/library.module.ts` | Library feature module |
| `apps/transaction-svc/src/outbox/outbox.service.ts` | Outbox pattern: create/getPending/markAsSent/markAsFailed |
| `apps/transaction-svc/src/outbox/outbox.processor.ts` | Cron processor (every 5s) with circuit breaker + retry |
| `apps/transaction-svc/src/outbox/outbox.module.ts` | Outbox module with ScheduleModule |
| `apps/transaction-svc/src/resilience/circuit-breaker.ts` | Circuit breaker: CLOSED/OPEN/HALF_OPEN states |
| `apps/transaction-svc/src/resilience/retry.ts` | Exponential backoff with jitter |
| `apps/transaction-svc/src/auth/strategies/jwt.strategy.ts` | JWT strategy (validates token, extracts user) |
| `apps/transaction-svc/src/auth/guards/jwt-auth.guard.ts` | JWT authentication guard |
| `apps/transaction-svc/src/auth/auth.module.ts` | Auth module with JWT config |

### Endpoints Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /rentals | JWT | Create rental (checks catalog availability, max 5 active) |
| GET | /rentals/me | JWT | List user's rentals |
| GET | /rentals/:id | JWT | Get rental by ID |
| POST | /rentals/:id/return | JWT | Return rented book (restores availability) |
| POST | /purchases | JWT | Create purchase (fetches price from catalog-svc) |
| GET | /purchases/me | JWT | List user's purchases |
| GET | /library | JWT | Merged library (rentals + purchases with book details) |
| GET | /library/:bookId/access | JWT | Get book access (temporary signed URL) |
| GET | / | Public | Legacy health check |
| GET | /healthz | Public | Health check |
| GET | /readyz | Public | Readiness check |

### Test Results

All endpoints verified working:
- `POST /rentals` → Creates rental with ACTIVE status (checks catalog availability)
- `GET /rentals/me` → Returns user's active rentals
- `GET /rentals/:id` → Returns specific rental details
- `POST /rentals/:id/return` → Marks rental as RETURNED, restores book availability
- `POST /purchases` → Creates purchase with COMPLETED status (fetches price from catalog)
- `GET /purchases/me` → Returns user's purchase history
- `GET /library` → Returns merged library with book details from catalog-svc
- `GET /library/:bookId/access` → Returns access type and temporary download URL
- `GET /healthz` → `{"status":"ok"}`
- `GET /readyz` → `{"status":"ok"}` (DB connected)

### Architecture Notes
- Outbox pattern: Notifications queued in DB, processed by cron job every 5s
- Circuit breaker: CLOSED → OPEN (on failure) → HALF_OPEN (after timeout) → CLOSED (on success)
- Retry with exponential backoff: 1s, 2s, 4s with random jitter
- Inter-service: transaction-svc calls catalog-svc for availability/price, notif-svc for notifications
- Shared Prisma schema: Combined all models in root `prisma/schema.prisma` to solve pnpm hoisted module resolution

### How to Test

```bash
# Start infrastructure
cd Librio/bookly
docker compose up -d

# Generate shared Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Build and start transaction-svc
npx nest build apps/transaction-svc
$env:DATABASE_URL="postgresql://transaction_user:transaction_pass@localhost:5432/transaction_db"
$env:CONSUL_HOST="localhost"
$env:CONSUL_PORT="8500"
$env:JWT_SECRET="your-secret"
$env:CATALOG_SVC_URL="http://localhost:8001"
$env:NOTIF_SVC_URL="http://localhost:8004"
cd apps/transaction-svc
npx nest start

# Create rental
curl -X POST http://localhost:8003/rentals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bookId":1,"durationDays":14}'

# Get library
curl http://localhost:8003/library \
  -H "Authorization: Bearer <token>"
```

---

*Next section to implement: SECTION 6 - notif-svc (Notifications Microservice)*

---

## SECTION 6: notif-svc (Notifications Microservice)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Implemented the notifications microservice with in-memory storage (since notif_db is managed via outbox pattern), email service integration with Mailpit via SMTP, Handlebars HTML email templates, and Consul auto-registration.

### Files Created/Modified

| File | Description |
|------|-------------|
| `apps/notif-svc/package.json` | Added nodemailer, handlebars, class-validator dependencies |
| `apps/notif-svc/src/notifications/dto/create-notification.dto.ts` | Create notification DTO with type enum validation |
| `apps/notif-svc/src/notifications/entities/notification.entity.ts` | Notification entity interface |
| `apps/notif-svc/src/notifications/notifications.service.ts` | Notification CRUD + email sending |
| `apps/notif-svc/src/notifications/notifications.controller.ts` | REST endpoints (POST, GET, GET by user) |
| `apps/notif-svc/src/notifications/notifications.module.ts` | Notifications feature module |
| `apps/notif-svc/src/email/email.service.ts` | Email service with Handlebars templates + SMTP via Mailpit |
| `apps/notif-svc/src/email/email.module.ts` | Email module |
| `apps/notif-svc/src/logger/logger.service.ts` | Structured JSON logger |
| `apps/notif-svc/src/health/health.controller.ts` | Health + readiness endpoints |
| `apps/notif-svc/src/app.module.ts` | Root module with Notifications + Email imports |

### Email Templates (Handlebars)

| Template | Trigger Event |
|----------|---------------|
| `RENTAL_CREATED` | When a rental is created |
| `RENTAL_RETURNED` | When a rental is returned |
| `RENTAL_EXPIRING` | When a rental is about to expire |
| `PURCHASE_CONFIRMATION` | When a purchase is completed |
| `WELCOME` | When a user registers |

### Endpoints Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /notifications | Internal | Create and send notification (sends email via SMTP) |
| GET | /notifications | Internal | Get all notifications |
| GET | /notifications/users/:userId | Internal | Get notification history for a user |
| GET | /notifications/:id | Internal | Get notification by ID |
| GET | / | Public | Legacy health check |
| GET | /healthz | Public | Health check |
| GET | /readyz | Public | Readiness check |

### Test Results

All endpoints verified working:
- `POST /notifications` → Creates notification, sends email via Mailpit SMTP
- `GET /notifications` → Returns all notifications
- `GET /notifications/users/1` → Returns user 1's notifications
- `GET /notifications/:id` → Returns specific notification
- `GET /healthz` → `{"status":"ok"}`
- `GET /readyz` → `{"status":"ok"}`

### Mailpit Integration
- All emails sent via notif-svc are captured by Mailpit at `http://localhost:8025`
- SMTP connection: `localhost:1025` (no auth required)
- Emails include styled HTML with Bookly branding

### Build Note
- Notif-svc uses `tsc` directly for compilation (nest CLI from app directory doesn't work with hoisted linker)
- Compiled from root: `npx tsc -p apps/notif-svc/tsconfig.build.json`

---

*Next section to implement: SECTION 7 - library-mcp (MCP Agent)*

---

## SECTION 7: library-mcp (MCP Server)

**Date:** 2026-09-05
**Status:** Completed

### What was done
Implemented the MCP (Model Context Protocol) server that exposes Bookly's capabilities to AI agents. The server provides a REST API with tools that discover and call other services (catalog-svc, transaction-svc) for book operations, rentals, purchases, and library management.

### Files Created/Modified

| File | Description |
|------|-------------|
| `apps/library-mcp/package.json` | Added axios, class-validator dependencies |
| `apps/library-mcp/src/tools/index.ts` | Tool definitions with input schemas and handlers |
| `apps/library-mcp/src/tools/tools.service.ts` | Tool registration and execution service |
| `apps/library-mcp/src/tools/tools.controller.ts` | REST endpoints for MCP tools |
| `apps/library-mcp/src/tools/tools.module.ts` | Tools feature module |
| `apps/library-mcp/src/logger/logger.service.ts` | Structured JSON logger |
| `apps/library-mcp/src/health/health.controller.ts` | Health + readiness endpoints |
| `apps/library-mcp/src/app.module.ts` | Root module with Tools import |

### MCP Tools Implemented

| Tool | Description | Calls |
|------|-------------|-------|
| `search_books` | Search books by title/genre | catalog-svc |
| `get_book` | Get book details by ID | catalog-svc |
| `create_rental` | Create a book rental (JWT auth) | transaction-svc |
| `purchase_book` | Purchase a book (JWT auth) | transaction-svc |
| `return_book` | Return a rented book (JWT auth) | transaction-svc |
| `get_my_library` | Get user's library (JWT auth) | transaction-svc |

### Endpoints Implemented

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /mcp/tools | Public | List all available MCP tools |
| POST | /mcp/tools/:name/execute | Public | Execute an MCP tool |
| GET | /mcp/capabilities | Public | Get server capabilities |
| GET | / | Public | Legacy health check |
| GET | /healthz | Public | Health check |
| GET | /readyz | Public | Readiness check |

### Test Results

All tools verified working:
- `search_books` with `query: "Dune"` → Returns Dune book from catalog-svc
- `get_book` with `bookId: 1` → Returns Dune book details
- `create_rental` with `bookId: 3, durationDays: 7, authToken: <JWT>` → Creates rental for Clean Code
- `get_my_library` with `authToken: <JWT>` → Returns user's merged library (rentals + purchases)
- `GET /mcp/capabilities` → Returns server info and tool list
- `GET /healthz` → `{"status":"ok"}`
- `GET /readyz` → `{"status":"ok"}`

### Architecture
- Tools discover and call other services via HTTP (catalog-svc at :8001, transaction-svc at :8003)
- Authenticated tools require JWT token passed as parameter
- MCP protocol provides standardized tool interface for AI agents
- Tools return structured JSON responses with book data and operation results

### How to Test

```bash
# Start all services
cd Librio/bookly
docker compose up -d
# (start all NestJS services)

# List tools
curl http://localhost:8000/mcp/tools

# Search books
curl -X POST http://localhost:8000/mcp/tools/search_books/execute \
  -H "Content-Type: application/json" \
  -d '{"params":{"query":"Dune"}}'

# Get book
curl -X POST http://localhost:8000/mcp/tools/get_book/execute \
  -H "Content-Type: application/json" \
  -d '{"params":{"bookId":1}}'

# Get capabilities
curl http://localhost:8000/mcp/capabilities
```

### Build Note
- library-mcp uses `tsc` directly for compilation (same as notif-svc)
- Compiled from root: `npx tsc -p apps/library-mcp/tsconfig.build.json`

---

*All 5 microservices now implemented: catalog-svc, users-svc, transaction-svc, notif-svc, library-mcp*

---

## SECTION 8: Structured Logging + Correlation ID

**Date:** 2026-09-06
**Status:** Completed

### What was done
Implemented structured JSON logging across all services with correlation ID propagation, request-level HTTP logging middleware, business-payload logs in every controller, and browser-side logging via an Angular HTTP interceptor.

### Files Created/Modified

| File | Description |
|------|-------------|
| `apps/<svc>/src/middleware/request-logging.middleware.ts` | Logs every HTTP call: method, path, status, duration, correlation ID (all 5 services) |
| `apps/notif-svc/src/middleware/correlation-id.middleware.ts` | Added missing correlation middleware (notif-svc) |
| `apps/library-mcp/src/middleware/correlation-id.middleware.ts` | Added missing correlation middleware (library-mcp) |
| `apps/<svc>/src/app.module.ts` | Registered `CorrelationIdMiddleware` + `RequestLoggingMiddleware` for all routes (all 5 services) |
| All 9 controllers | Every handler now logs a `payload` object with real response data (counts, ids, titles, statuses) |
| `src/app/core/interceptors/logging.interceptor.ts` | Angular interceptor mirroring `{service, payload}` logs in the browser console |
| `src/app/app.config.ts` | Registered `loggingInterceptor` in the HTTP interceptor chain |

### Log Layers

1. **HTTP request middleware** — one JSON line per call (`event: http_request`)
2. **Controller business logs** — domain events with `payload` (e.g. `{"bookId":15,"title":"The Martian"}`)
3. **Browser console** — Angular interceptor emits the same shape client-side (log for success, error for failures)

### Example

```json
{"timestamp":"2026-09-06T18:47:35.056Z","level":"INFO","service":"catalog-svc","event":"http_request","message":"GET /books/15 -> 200 (3ms)","method":"GET","path":"/books/15","status":200,"duration_ms":3,"correlation_id":"9ff2c390-1c12-4d9f-932e-cf62a6ff88bd"}
{"timestamp":"2026-09-06T18:53:44.733Z","level":"INFO","service":"BooksController","message":"Fetching book by id","payload":{"bookId":15,"title":"The Martian"}}
// Browser DevTools Console
{service: "catalog-svc", message: "GET /books/15 -> 200 (4ms)", payload: {...}, correlation_id: "..."}
```

### Notes
- Payloads never include passwords or tokens
- Correlation ID flows browser → service → downstream services via the `x-correlation-id` header

---

## SECTION 9: Frontend (Angular + Material)

**Date:** 2026-09-06
**Status:** Completed

### What was done
Built the Angular frontend with Material Design using standalone components: catalog browsing, book details, cart with checkout, library view, auth forms, and user profile.

### Files Created/Modified

| Area | Description |
|------|-------------|
| `src/app/core/services/` | AuthService, CatalogService, TransactionService, CartService (signals) |
| `src/app/core/interceptors/` | auth (JWT), correlation-id, logging (browser console) |
| `src/app/core/guards/auth.guard.ts` | Route guard for authenticated routes |
| `src/app/core/core.module.ts` | Core module |
| `src/app/shared/components/` | BookCardComponent, LoadingSpinnerComponent |
| `src/app/layout/` | HeaderComponent (toolbar: nav, cart badge, user menu), LayoutComponent |
| `src/app/features/` | catalog (catalog-list, book-detail), auth (login, register), library (library-list), cart (cart-view), profile (profile-view) — all lazy-loaded |
| `src/app/app.routes.ts` | Root routes with layout wrapper |
| `src/app/app.config.ts` | HTTP client + interceptors, router, animations |
| `src/app/app.routes.server.ts` | SSR render modes (server rendering for dynamic routes, prerender for static) |
| `src/material-theme.scss` | Material 3 theme (azure palette) |

### Pages

| Page | Route | Description |
|------|-------|-------------|
| Catalog | /catalog | Book grid with search + genre filter |
| Book Detail | /catalog/:id | Full info, Rent/Buy |
| Cart | /cart | Checkout (mixed rent/buy) |
| Library | /library | Return + access |
| Login / Register | /auth/* | Material forms |
| Profile | /profile | User info |

### Build Fixes
- Corrected relative import paths in catalog-list/book-card components
- Added `DatePipe`/`SlicePipe` imports where templates use them
- Changed `app.routes.server.ts` to `RenderMode.Server` for dynamic routes (prerendering of `/catalog/:id` failed without `getPrerenderParams`)
- Raised initial bundle budget warning to 600kB

### Notes
- Angular 21, standalone components, SSR via Angular SSG (`prerendered 2 static routes`)
- Build verified: `npx ng build`

---

## SECTION 10: Docker Configuration

**Date:** 2026-09-06
**Status:** Completed

### What was done
Created multi-stage Dockerfiles for all services and updated `docker-compose.yml` to run the complete stack (9 containers).

### Files Created/Modified

| File | Description |
|------|-------------|
| `docker/Dockerfile.nestjs` | Multi-stage build: deps → shared → service → slim production (parameterized by `SERVICE_NAME`) |
| `docker/Dockerfile.web` | Angular multi-stage build → nginx static hosting |
| `docker/nginx.conf` | SPA fallback, `/api/` proxy example |
| `docker-compose.yml` | Full stack: postgres, consul, mailpit, 5 services, web |
| `.dockerignore` | Excludes node_modules, dist, env, docs |

### Key Fix — ARG vs ENV

`ARG SERVICE_NAME` is not available at runtime, causing `Cannot find module '/app/apps/dist/main.js'`. Fixed by adding `ENV SERVICE_NAME=${SERVICE_NAME}` in the production stage.

### Images

| Image | Base | Description |
|-------|------|-------------|
| bookly-catalog-svc | node:20-alpine | catalog-svc |
| bookly-users-svc | node:20-alpine | users-svc |
| bookly-transaction-svc | node:20-alpine | transaction-svc |
| bookly-notif-svc | node:20-alpine | notif-svc |
| bookly-library-mcp | node:20-alpine | library-mcp |
| bookly-web | nginx:alpine | Angular SPA |

### Operational Notes (Windows)
- `docker builder prune -af` frees many GB after heavy build sessions (Docker's VHDX on C: can fill the disk and hang the engine — verified and fixed)
- `pnpm-lock.yaml` generated on Windows contains `@pnpm/exe.win-x64`; use `--no-frozen-lockfile` inside Linux images
- Build images one at a time; parallel builds can exhaust WSL2 memory

---

## POST-DELIVERY UPDATES

**Date:** 2026-09-06

### What was done
Follow-up enhancements after the core sections:

1. **CORS enabled in all 5 services** (`app.enableCors` with `origin: true`, `credentials`, `Authorization`/`Content-Type`/`x-correlation-id` headers) — fixed browser console error `No 'Access-Control-Allow-Origin' header` when Angular dev server (4200) calls services directly
2. **Seed data expanded to 18 books** — added 12 books (Brave New World, Neuromancer, The Name of the Wind, Designing Data-Intensive Applications, The Girl with the Dragon Tattoo, The Da Vinci Code, Sapiens, The Martian, The Fellowship of the Ring, Animal Farm, A Game of Thrones, The Selfish Gene); applied to running DB via psql (`ON CONFLICT (isbn) DO NOTHING`)
3. **Payload logging** — every controller logs `payload` with real data; verified in container logs
4. **Browser console logs** — `loggingInterceptor` mirrors `{service, payload}` client-side; verified in served bundle

### Verification Results
- `GET /books` → 18 books
- CORS preflight `OPTIONS /books` → `204` with `Allow-Origin: http://localhost:4200`
- `docker compose ps` → 9 containers up (postgres, consul, mailpit, 5 services, web)
- End-to-end flow: register → login → rent (Dune) → library shows RENTED → MCP capabilities (6 tools)

---

## SECTION 11: A2A Agents (Agent-to-Agent)

**Date:** 2026-09-13
**Status:** Completed

### What was done
Implemented the A2A (Agent-to-Agent, Google protocol) layer: 4 specialized NestJS agents that discover each other via Agent Cards (`/.well-known/agent.json`) and delegate tasks using JSON-RPC A2A tasks (`POST /a2a/tasks/send`). Agents call services exclusively through library-mcp tools.

### Agents Created

| Agent | Port | Skills | Delegates to |
|-------|------|--------|--------------|
| catalog-agent | 9001 | search_books, get_book | library-mcp → catalog-svc |
| transaction-agent | 9002 | create_rental, purchase_book, return_book, get_my_library | library-mcp → transaction-svc |
| notification-agent | 9003 | send_notification, get_notification_history | library-mcp → notif-svc |
| orchestrator-agent | 9000 | process_instruction (natural-language orchestration) | catalog/transaction/notification agents |

### Files Created

| File | Description |
|------|-------------|
| `agents/<agent>/agent.json` | Published Agent Card (name, description, url, skills) |
| `agents/<agent>/src/agent-card/agent-card.controller.ts` | Serves card at `GET /.well-known/agent.json` |
| `agents/<agent>/src/a2a/a2a.controller.ts` | A2A JSON-RPC endpoint: `POST /a2a/tasks/send` |
| `agents/<agent>/src/a2a/a2a.service.ts` | Skill registry + dispatch (specialist agents) |
| `agents/<agent>/src/library/library-client.service.ts` | Calls library-mcp REST tools |
| `agents/orchestrator-agent/src/orchestrate/orchestrate.service.ts` | Intent parsing (ES/EN keywords), book/genre lookup, multi-agent delegation |
| `agents/orchestrator-agent/src/discovery/agent-discovery.service.ts` | Agent registry: fetches all Agent Cards |
| `agents/orchestrator-agent/src/a2a/a2a-client.service.ts` | A2A client (tasks/send to specialist agents) |
| `docker/Dockerfile.agent` | Multi-stage build for agents |
| `docker-compose.yml` | 4 agent services (9000-9003), `NOTIF_SVC_URL` for library-mcp |

### library-mcp Additions

2 new tools (6 → 8): `send_notification`, `get_notification_history` — keeps the invariant that agents only talk to the MCP layer.

### A2A Protocol (subset)

```
POST /a2a/tasks/send
{ "jsonrpc": "2.0", "id": "task-1", "method": "tasks/send",
  "params": { "taskId": "task-1",
              "message": { "role": "user",
                           "parts": [{ "text": "purchase_book|{\"bookId\":1}" }] } } }

→ { "jsonrpc": "2.0", "id": "task-1",
    "result": { "taskId": "task-1", "status": "completed",
                "artifacts": [{ "parts": [{ "text": "{...result...}" }] }] } }
```

### Orchestrator Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /orchestrate | `{instruction, authToken?}` → parses intent, delegates, aggregates results |
| GET | /agents | Lists all discovered Agent Cards (registry view) |
| GET | /.well-known/agent.json | Orchestrator card |

### Test Results (all verified running)

| Instruction | Intents | Result |
|-------------|---------|--------|
| `Buy Dune and notify me` | PURCHASE, NOTIFY | Dune found (id=1) → purchase COMPLETED ($12.99) → PURCHASE_CONFIRMATION notification sent |
| `renta Foundation` | RENT | Rental created (ACTIVE, 14 days) |
| `devolver Foundation` | RETURN | Rental matched by fuzzy title → RETURNED |
| `buscar libros de fantasia` | SEARCH | 4 fantasy books returned (genre detected) |
| `compra The Hobbit y notificame` | PURCHASE, NOTIFY | Purchase COMPLETED + notification |

### Security
- JWT tokens are **redacted** in all agent/Orchestrator/MCP logs (`authToken: "***"`)

### Deviations from Section 11 spec
- `get_my_library` added to transaction-agent (needed for return-by-title flow)
- Real Google A2A spec uses full Task/Message/Artifact types over streamable HTTP; this is a documented JSON-RPC subset sufficient for the teacher's demo analogy (discovery via Agent Cards, delegation via A2A)
