import { serve } from "bun";
import client from "prom-client";

declare global {
	var isShuttingDown: boolean;
}

globalThis.isShuttingDown = false;

client.collectDefaultMetrics({ prefix: "cnf_" });

const httpRequestsTotal = new client.Counter({
	name: "cnf_http_requests_total",
	help: "Total number of HTTP requests",
	labelNames: ["method", "path", "status"]
});

const httpRequestDuration = new client.Histogram({
	name: "cnf_http_request_duration_seconds",
	help: "HTTP request latency",
	labelNames: ["method", "path", "status"],
	buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});

const shuttingDownGauge = new client.Gauge({
	name: "cnf_shutting_down",
	help: "CNF shutting down state (1 = shutting down)"
});

const startTime = Date.now();
const uptimeGauge = new client.Gauge({
	name: "cnf_uptime_seconds",
	help: "CNF uptime in seconds"
});

setInterval(() => {
	uptimeGauge.set((Date.now() - startTime) / 1000);
	shuttingDownGauge.set(globalThis.isShuttingDown ? 1 : 0);
}, 5000);

type CNFResponse = {
	id: string;
	name: string;
	version: string;
	started_at: string;
	environment: string;
};

const now = () => new Date().toISOString();

function generateID(): string {
	return `cnf-${Math.floor(Date.now() / 1000)}`;
}

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}

const cnfResponse: CNFResponse = {
	id: generateID(),
	name: "Simple-CNFSimulator",
	version: "1.0.0",
	started_at: now(),
	environment: process.env.ENVIRONMENT ?? "development"
};

const port = Number(process.env.PORT ?? 3000);

console.log(`Starting CNF Simulator on port ${port}`);
console.log(`CNF Instance ID: ${cnfResponse.id}`);
console.log(`Environment: ${cnfResponse.environment}`);

serve({
	port,
	async fetch(req) {
		const start = process.hrtime.bigint();
		const { pathname } = new URL(req.url);
		let status = 200;

		try {
			switch (pathname) {
				case "/metrics":
					return new Response(await client.register.metrics(), {
						headers: { "Content-Type": client.register.contentType }
					});

				case "/health/live":
					if (globalThis.isShuttingDown) {
						status = 503;
						return json({ status: "shutting_down" }, status);
					}

					return json({
						status: "healthy",
						service: "cnf-simulator",
						timestamp: now()
					});

				case "/health/ready":
				case "/":
					return json({
						...cnfResponse,
						current_time: now()
					});

				case "/info":
					return json({
						service: "Cloud-Native Network Function",
						description: "A simple Bun application simulating a CNF for an O-Cloud environment",
						version: cnfResponse.version,
						endpoints: ["/", "/health/live", "/health/ready", "/info", "/metrics"]
					});

				default:
					status = 404;
					return json({ error: "Not Found" }, status);
			}
		} finally {
			const duration = Number(process.hrtime.bigint() - start) / 1_000_000_000;

			httpRequestsTotal.inc({
				method: req.method,
				path: pathname,
				status
			});

			httpRequestDuration.observe(
				{
					method: req.method,
					path: pathname,
					status
				},
				duration
			);
		}
	}
});

function handleShutdown(signal: string) {
	console.log(`${signal} received, shutting down gracefully...`);
	globalThis.isShuttingDown = true;

	setTimeout(() => {
		process.exit(0);
	}, 5000);
}

process.on("SIGTERM", () => handleShutdown("SIGTERM"));
process.on("SIGINT", () => handleShutdown("SIGINT"));
