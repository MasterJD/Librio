# Bookly

Digital library platform built with a microservices architecture. Users browse a catalog of digital books, rent them for a period of time, purchase them, and access them through a personal library — with notifications delivered by email. Designed as a learning project demonstrating key microservice patterns: direct service-to-service communication, Database-per-Service, service discovery with Consul, resilience (circuit breaker, outbox, retry), structured logging with correlation IDs, and AI integration via MCP.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Docker Compose                            │
│                                                                  │
│  ┌─────────┐   ┌───────────┐  ┌──────────┐  ┌───────────────┐   │
│  │ web     │   │ catalog   │  │ users-svc│  │ transaction-  │   │
│  │ (Angular)│  │ -svc      │  │ :8002    │  │ svc :8003     │   │
│  │ :80/4200│   │ :8001     │  └────┬─────┘  └───────┬───────┘   │
│  └────┬────┘   └────┬──────┘       │               │           │
│       │             │              └───────────────┤           │
│  ┌────▼────┐   ┌────▼──────┐  ┌────▼─────┐  ┌──────▼───────┐  │
│  │ notif-  │   │ library-  │  │ consul   │  │ postgres +   │  │
│  │ svc     │   │ mcp       │  │ :8500    │  │ mailpit      │  │
│  │ :8004   │   │ :8000     │  │          │  │              │  │
│  └────┬────┘   └───────────┘  └──────────┘  └──────────────┘  │
│       └─────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

- **Database-per-Service**: one PostgreSQL instance with 4 databases (`catalog_db`, `users_db`, `transaction_db`, `notif_db`)
- **Service discovery**: Consul — all services register on startup with health checks
- **Resilience**: circuit breaker + outbox pattern + retry with exponential backoff
- **Observability**: structured JSON logs, correlation IDs, payload logs, browser console mirroring

## Microservices

| Service | Port | Description |
|---------|------|-------------|
| catalog-svc | 8001 | Book catalog: CRUD, availability, search (`?genre`, `?title`) |
| users-svc | 8002 | Registration, login, JWT auth, profiles |
| transaction-svc | 8003 | Rentals, purchases, merged library, outbox processor |
| notif-svc | 8004 | Notifications + email (Handlebars templates → Mailpit) |
| library-mcp | 8000 | MCP server: 6 tools for AI agents (REST) |
| web | 4200 dev / 80 Docker | Angular + Material frontend |

## Endpoints

### catalog-svc (8001)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /books | Public | List books (`?genre`, `?title`) |
| GET | /books/:id | Public | Book details |
| GET | /books/:id/availability | Public | Availability check |
| POST | /books | Internal | Create book |
| PUT | /books/:id | Internal | Update book |
| DELETE | /books/:id | Internal | Delete book |
| GET | /healthz, /readyz | Public | Health / readiness |

### users-svc (8002)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /auth/register | Public | Register (returns JWT) |
| POST | /auth/login | Public | Login (returns JWT) |
| GET | /auth/profile | JWT | Current user |
| GET | /users/:id | Internal | User by ID |
| PUT | /users/:id | Internal | Update user |
| DELETE | /users/:id | Internal | Delete user |
| GET | /healthz, /readyz | Public | Health / readiness |

### transaction-svc (8003)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /rentals | JWT | Create rental (availability + max 5 active) |
| GET | /rentals/me | JWT | User rentals |
| GET | /rentals/:id | JWT | Rental details |
| POST | /rentals/:id/return | JWT | Return book |
| POST | /purchases | JWT | Purchase book |
| GET | /purchases/me | JWT | Purchase history |
| GET | /library | JWT | Merged library |
| GET | /library/:bookId/access | JWT | Book access URL |
| GET | /healthz, /readyz | Public | Health / readiness |

### notif-svc (8004)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /notifications | Internal | Create + send notification |
| GET | /notifications | Internal | All notifications |
| GET | /notifications/users/:userId | Internal | User history |
| GET | /notifications/:id | Internal | By ID |
| GET | /healthz, /readyz | Public | Health / readiness |

### library-mcp (8000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /mcp/tools | List tools |
| POST | /mcp/tools/:name/execute | Execute tool |
| GET | /mcp/capabilities | Capabilities |
| GET | /healthz, /readyz | Health / readiness |

MCP tools: `search_books`, `get_book`, `create_rental`, `purchase_book`, `return_book`, `get_my_library`

## Environment Variables

Copy `.env.example` to `.env`

```env
# Database (Docker init creates users/databases)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=bookly

# JWT
JWT_SECRET=<random-string>
JWT_EXPIRATION=60m

# Consul
CONSUL_HOST=localhost
CONSUL_PORT=8500

# SMTP (Mailpit)
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_FROM=noreply@bookly.local

# Service URLs (inter-service)
CATALOG_SVC_URL=http://localhost:8001
USERS_SVC_URL=http://localhost:8002
TRANSACTION_SVC_URL=http://localhost:8003
NOTIF_SVC_URL=http://localhost:8004
```

## How to Run

### Option A — Full stack with Docker (recommended)

```bash
git clone <repo-url>
cd bookly
cp .env.example .env
docker compose up -d
```

- Web app: http://localhost
- Consul UI: http://localhost:8500
- Mailpit UI: http://localhost:8025

Stop: `docker compose down` · Fresh DB: `docker compose down -v && docker compose up -d`

### Option B — Local development

```bash
# Prerequisites: pnpm, Node 20+, Docker Desktop running
pnpm install

# Infrastructure (PostgreSQL + Consul + Mailpit)
docker compose up -d

# Generate shared Prisma client
npx prisma generate --schema=prisma/schema.prisma

# Services (each in a terminal)
pnpm dev:catalog
pnpm dev:users
pnpm dev:transaction
pnpm dev:notif
pnpm dev:mcp

# Frontend
ng serve          # http://localhost:4200
```

## How to Test

```bash
# Catalog (18 seeded books)
curl http://localhost:8001/books

# Register
curl -X POST http://localhost:8002/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@bookly.io","password":"Test1234!"}'

# Login
curl -X POST http://localhost:8002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@bookly.io","password":"Test1234!"}'

# Rent a book (use the token from login)
curl -X POST http://localhost:8003/rentals \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"bookId":1,"durationDays":7}'

# Library
curl http://localhost:8003/library -H "Authorization: Bearer <token>"

# MCP
curl http://localhost:8000/mcp/capabilities
curl -X POST http://localhost:8000/mcp/tools/search_books/execute \
  -H "Content-Type: application/json" \
  -d '{"params":{"query":"Dune"}}'
```

## Consul

All services self-register on startup (name, address, port + `/healthz` check every 10s). Browse registered services at http://localhost:8500.

## MCP

`library-mcp` exposes Bookly to AI agents:

```bash
curl -X POST http://localhost:8000/mcp/tools/create_rental/execute \
  -H "Content-Type: application/json" \
  -d '{"params":{"bookId":1,"durationDays":7,"authToken":"<jwt>"}}'
```

## Resilience

- **Circuit breaker**: after 3 consecutive failures calling notif-svc the circuit opens for 30s; while open, notifications are buffered in the outbox
- **Outbox pattern**: rental/purchase creation writes a `NotificationOutbox` row in the same DB transaction; a cron job (every 5s) drains PENDING rows to notif-svc
- **Retry**: up to 3 attempts with exponential backoff + jitter

Demo: stop notif-svc (`docker compose stop notif-svc`), create rentals, watch outbox rows go FAILED, restart notif-svc, and see them flush as SENT.

## Observability

Every service logs JSON lines and accepts/propagates `x-correlation-id`:

```json
{"timestamp":"...","level":"INFO","service":"catalog-svc","event":"http_request","message":"GET /books -> 200 (8ms)","method":"GET","path":"/books","status":200,"duration_ms":8,"correlation_id":"..."}
{"timestamp":"...","level":"INFO","service":"BooksController","message":"Fetching book by id","payload":{"bookId":15,"title":"The Martian"}}
```

- Server: `docker compose logs -f <service>`
- Browser: DevTools console shows the same `{service, payload}` entries via the Angular logging interceptor

## JWT

- Tokens issued by users-svc (`/auth/register`, `/auth/login`), validated with Passport-JWT
- Protected endpoints return 401 without a valid `Authorization: Bearer <token>` header
- Secrets live in `.env` (never in code, `.env` is gitignored)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module /app/apps/dist/main.js` (Docker) | Image was built before the `ENV SERVICE_NAME` fix — rebuild with `docker compose build` |
| CORS errors from http://localhost:4200 | All services enable CORS for dev origins; hard-refresh browser (Ctrl+Shift+R) |
| `ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE` | Use `--no-frozen-lockfile` (lockfile contains Windows pnpm binary) |
| Docker engine hangs after builds | `docker builder prune -af` (VHDX on C: fills up); build images one at a time |
| Health check /readyz failing | PostgreSQL not ready — wait for `docker compose ps` to show postgres healthy |
| Build emits nothing (tsc) | Remove `incremental: true` from base tsconfig if present |

---

**Bookly** is a learning project for a Master's course in Software Design and Development.