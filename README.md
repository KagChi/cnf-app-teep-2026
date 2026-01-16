# Cloud-Native Network Function (CNF)

A simple Bun TypeScript application that simulates a Cloud-Native Network Function (CNF) for the O-Cloud environment.

## Features
- Liveness probe endpoint (`/health/live`)
- Readiness probe endpoint (`/health/ready`)
- Service information endpoint (`/info`)
- Graceful shutdown handling
- Environment-aware configuration
- Unique CNF instance identification

## Endpoints
- `/health/live` - Liveness probe; returns 503 during shutdown
- `/health/ready` - Readiness probe; returns CNF instance details
- `/info` - Service metadata and available endpoints
- `/` - Root endpoint; returns current status

## Building and Running

```bash
bun install
bun run src/index.ts
```

Or compile and run:

```bash
bun build src/index.ts --compile --outfile cnf-app
./cnf-app
```

Configure the port and environment:
```bash
PORT=8080 ENVIRONMENT=production bun run src/index.ts
```

## Purpose

This simulator demonstrates CNF behavior in an O-Cloud environment, including:

- Kubernetes probe compatibility (liveness/readiness)
- Graceful shutdown handling
- Application lifecycle management
- Environment awareness
- Instance tracking
