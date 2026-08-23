# LibriFlow - Architecture Diagram

## System Overview

```mermaid
flowchart TB
    User["User Browser"]
    AI["AI Agent"]

    Web["web Angular 4200"]
    Mcp["library-mcp 8000"]

    Catalog["catalog-svc 8001"]
    Users["users-svc 8002"]
    Transaction["transaction-svc 8003"]
    Notif["notif-svc 8004"]

    Consul["Consul 8500"]
    Postgres["PostgreSQL 5432"]
    Mailpit["Mailpit 8025"]

    User --> Web
    AI --> Mcp

    Web --> Catalog
    Web --> Users
    Web --> Transaction

    Mcp --> Catalog
    Mcp --> Transaction

    Transaction --> Users
    Transaction --> Catalog
    Transaction --> Notif

    Catalog --> Consul
    Users --> Consul
    Transaction --> Consul
    Notif --> Consul

    Catalog --> Postgres
    Users --> Postgres
    Transaction --> Postgres
    Notif --> Postgres
    Notif --> Mailpit
```

## Services

| Service | Port | Responsibility |
|---------|------|----------------|
| catalog-svc | 8001 | Book catalog management |
| users-svc | 8002 | User registration, auth, JWT |
| transaction-svc | 8003 | Rentals, purchases, library access |
| notif-svc | 8004 | Notifications, email |
| library-mcp | 8000 | MCP Server for AI agents |
| consul | 8500 | Service discovery |
| postgres | 5432 | Database (4 databases) |
| mailpit | 8025 | Email capture (dev) |
| web | 4200 | Frontend |

## Communication

- **Client → Services**: HTTP/REST
- **Service → Service**: HTTP via Consul discovery
- **Service → Consul**: Registration + health checks
- **AI → MCP**: MCP Protocol
- **transaction-svc → notif-svc**: With circuit breaker + outbox pattern
