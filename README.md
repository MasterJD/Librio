# Bookly — Digital Library Platform (Microservices)

**Bookly** is a digital library platform built with a **microservices architecture**: users browse a catalog of digital books, rent them for a period of time, purchase them permanently, and access them through a personal library with in-app reading and PDF download.

It is a learning project demonstrating key microservice patterns: direct service-to-service communication (no API Gateway), Database-per-Service, service discovery with Consul, resilience patterns (circuit breaker, outbox, retry), structured JSON logging with correlation IDs, **AI integration via MCP**, and **agent coordination via A2A**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 21 + Angular Material (standalone components, SSR) |
| Backend | NestJS 10 (TypeScript, strict mode) |
| ORM | Prisma (combined schema, one client per service) |
| Database | PostgreSQL 16 (single instance, four databases) |
| Service Discovery | HashiCorp Consul |
| AI Integration | MCP (Model Context Protocol) — library-mcp server |
| Agents | A2A (Agent-to-Agent, Google protocol) — 4 specialized agents |
| Email (local) | Mailpit (SMTP 1025, UI 8025) |
| Containerization | Docker + Docker Compose (multi-stage builds) |
| Package Manager | pnpm (monorepo workspaces) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Docker Compose                             │
│                                                                     │
│  ┌─────────┐  ┌───────────┐  ┌──────────┐  ┌──────────────────┐   │
│  │ web     │  │ catalog   │  │ users-svc│  │ transaction-svc  │   │
│  │ (Angular)│ │ -svc      │  │ :8002    │  │ :8003            │   │
│  │ :80/4200│  │ :8001     │  └────┬─────┘  └───────┬──────────┘   │
│  └────┬────┘  └────┬──────┘       │               │              │
│       │            └──────────────┼───────────────┤              │
│  ┌────▼──────────────────┐  ┌─────▼─────┐  ┌──────▼──────────┐   │
│  │ library-mcp :8000     │  │ notif-svc │  │ postgres +      │   │
│  │ (MCP server, 8 tools) │  │ :8004     │  │ consul + mailpit│   │
│  └─────────┬─────────────┘  └─────┬─────┘  └─────────────────┘   │
│            │                      │                              │
│  ┌─────────▼──────────────────────▼─────────────────────────┐    │
│  │ Agents (A2A): orchestrator :9000, catalog :9001,         │    │
│  │ transaction :9002, notification :9003                    │    │
│  └──────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────┘
```

### Core patterns

- **Database-per-Service**: `catalog_db`, `users_db`, `transaction_db`, `notif_db` on one PostgreSQL instance
- **Service discovery**: every service registers in Consul on startup with health checks
- **Resilience**: circuit breaker (CLOSED → OPEN → HALF-OPEN) + outbox pattern (cron-drained `NotificationOutbox`) + retry with exponential backoff
- **Observability**: structured JSON logs, correlation IDs (browser → service → service), payload logs, browser console mirroring

---

## Microservices & Agents

| Component | Port | Description |
|-----------|------|-------------|
| library-mcp | 8000 | MCP server exposing Bookly as 8 REST tools for AI agents |
| catalog-svc | 8001 | Book catalog: CRUD, availability, search filters |
| users-svc | 8002 | Registration, login, JWT auth |
| transaction-svc | 8003 | Rentals (max 5 active), purchases, merged library, outbox processor |
| notif-svc | 8004 | Notifications + email via Handlebars templates → Mailpit |
| orchestrator-agent | 9000 | A2A: parses natural-language instructions, discovers agents, delegates |
| catalog-agent | 9001 | A2A skills: `search_books`, `get_book` |
| transaction-agent | 9002 | A2A skills: `create_rental`, `purchase_book`, `return_book`, `get_my_library` |
| notification-agent | 9003 | A2A skills: `send_notification`, `get_notification_history` |
| web | 4200 dev / 80 Docker | Angular frontend |

Infrastructure: PostgreSQL :5432 · Consul :8500 · Mailpit :1025 (SMTP) / :8025 (UI)

---

## How to Run

### Prerequisites

- Docker Desktop (or any Docker Engine with Compose v2)
- (Local dev only) Node.js 20+, pnpm

### Option A — Full stack with Docker (recommended)

```bash
cd Librio/bookly
cp .env.example .env     # first time only
docker compose up -d
```

Wait for the 13 containers to become healthy, then:

| URL | What |
|-----|------|
| http://localhost | Web app |
| http://localhost:8500 | Consul UI (all 5 services registered) |
| http://localhost:8025 | Mailpit UI (captured emails) |
| http://localhost:8000 | library-mcp (MCP tools) |
| http://localhost:9000 | orchestrator-agent (A2A) |

Stop: `docker compose down` · Fresh database (re-seeds): `docker compose down -v && docker compose up -d`

### Option B — Local development

```bash
pnpm install                         # install all workspace deps
docker compose up -d postgres consul mailpit   # infra only

npx prisma generate --schema=prisma/schema.prisma

pnpm dev:catalog       # → :8001
pnpm dev:users         # → :8002
pnpm dev:transaction   # → :8003
pnpm dev:notif         # → :8004
pnpm dev:mcp           # → :8000

# Agents (if testing A2A locally)
cd agents/catalog-agent && npx ts-node ... # or: npx tsc -b && node dist/main.js

ng serve               # → :4200
```

---

## How to Test

```powershell
# Catalog (18 seeded books)
Invoke-RestMethod http://localhost:8001/books

# Register + login
Invoke-RestMethod -Method Post http://localhost:8002/auth/register `
  -ContentType "application/json" -Body '{"name":"Test","email":"t@bookly.io","password":"Test1234!"}'
$login = Invoke-RestMethod -Method Post http://localhost:8002/auth/login `
  -ContentType "application/json" -Body '{"email":"t@bookly.io","password":"Test1234!"}'
$token = $login.access_token

# Rent + library
Invoke-RestMethod -Method Post http://localhost:8003/rentals `
  -Headers @{ Authorization = "Bearer $token" } `
  -ContentType "application/json" -Body '{"bookId":1,"durationDays":7}'
Invoke-RestMethod http://localhost:8003/library -Headers @{ Authorization = "Bearer $token" }
```

### MCP

```powershell
Invoke-RestMethod http://localhost:8000/mcp/capabilities
Invoke-RestMethod -Method Post http://localhost:8000/mcp/tools/search_books/execute `
  -ContentType "application/json" -Body '{"params":{"query":"Dune"}}'
```

### A2A (the headline demo)

```powershell
Invoke-RestMethod -Method Post http://localhost:9000/orchestrate `
  -ContentType "application/json" `
  -Body (@{ instruction = "Buy Dune and notify me"; authToken = $token } | ConvertTo-Json)
```

Supports ES/EN: `renta Foundation`, `devolver Foundation`, `buscar libros de fantasia`, `compra The Hobbit y notificame`. See `Deliveries/Delivery-Final/README.md` for full scripts.

---

## Observability

Every component emits structured JSON logs and propagates `x-correlation-id`:

```json
{"timestamp":"...","level":"INFO","service":"catalog-svc","event":"http_request","message":"GET /books -> 200 (8ms)","method":"GET","path":"/books","status":200,"duration_ms":8,"correlation_id":"..."}
{"timestamp":"...","level":"INFO","service":"orchestrator-agent","message":"A2A task delegated","payload":{"to":"http://transaction-agent:9002","skill":"purchase_book","params":{"bookId":1,"authToken":"***"}}}
```

```bash
docker compose logs -f <service-or-agent>     # e.g. notif-svc, orchestrator-agent
```

The Angular app mirrors `{service, payload}` in the browser DevTools console via an HTTP interceptor.

---

## Project Layout

```
Librio/
├── ARCHITECTURE.md                 # Architecture reference
├── Deliveries/                     # Delivery documents + evidence
│   ├── Delivery-1/                 # Monorepo + infrastructure setup
│   ├── Delivery-2/                 # Services, resilience, frontend, Docker
│   └── Delivery-Final/             # MCP + A2A integration, evidence
└── bookly/                         # Monorepo (pnpm workspaces)
    ├── apps/                       # 5 microservices (8000-8004)
    ├── agents/                     # 4 A2A agents (9000-9003)
    ├── packages/                   # shared types, constants, utils, configs
    ├── prisma/schema.prisma        # combined Prisma schema
    ├── infrastructure/postgres/    # init.sql + seed.sql (18 books)
    ├── docker/                     # multi-stage Dockerfiles
    ├── src/                        # Angular frontend
    ├── docker-compose.yml
    └── README.md                   # detailed project README (endpoints, env vars)
```

---

## Deliveries

| Delivery | Documents | Covers |
|----------|-----------|--------|
| 1 | `Deliveries/Delivery-1/` | Monorepo setup, shared packages, Docker infrastructure |
| 2 | `Deliveries/Delivery-2/` | The 5 microservices, resilience, logging, frontend, Docker |
| Final | `Deliveries/Delivery-Final/` | MCP + A2A, evidence screenshots + video |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Cannot find module /app/apps/dist/main.js` (Docker) | Rebuild images: `docker compose build` (contains `ENV SERVICE_NAME` fix) |
| CORS errors from http://localhost:4200 | All services enable CORS; hard-refresh browser (Ctrl+Shift+R) |
| `ERR_PNPM_PNPM_ENGINE_IDENTITY_UNVERIFIABLE` | Use `--no-frozen-lockfile` (lockfile stores a Windows pnpm binary) |
| Docker engine hangs after heavy builds | `docker builder prune -af` (VHDX on C: fills up); build images one at a time |
| 401 on checkout in the web app | Session JWT expired (60 min) — log out and log back in |

---

**Bookly** — learning project for a Master's course in Software Design and Development.