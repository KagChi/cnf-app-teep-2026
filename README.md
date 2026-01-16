# Cloud-Native Network Function (CNF)

This is a simple Bun TypeScript application that simulates a Cloud-Native Network Function (CNF) for the O-Cloud environment. It provides various endpoints to monitor and manage the simulated CNF.

## Features
- Health check endpoint (`/health`)
- Status information endpoint (`/status`)
- Configuration information endpoint (`/config`)
- Service information endpoint (`/info`)
- Environment variable monitoring
- Kubernetes node identification

## Endpoints
- `/health` - Returns health status of the CNF
- `/status` - Provides detailed status information
- `/config` - Shows environment configuration
- `/info` - Displays service information
- `/` - Root endpoint that returns status information

## Building and Running

To build and run the application:

```bash
bun install
bun run src/index.ts
```

Or build and run:

```bash
bun build src/index.ts --outfile cnf-app
./cnf-app
```
```

### Running in Container

To containerize this application, create a Dockerfile.

## Purpose

This simulator is designed to demonstrate how a Cloud-Native Network Function would behave in an O-Cloud environment, providing insights into:

- Application lifecycle management
- Health monitoring
- Configuration handling
- Kubernetes integration
- Environment awareness