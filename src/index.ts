import { serve } from "bun";

declare global {
	var isShuttingDown: boolean;
}

globalThis.isShuttingDown = false;

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
	fetch(req) {
		const { pathname } = new URL(req.url);

		switch (pathname) {
			case "/health/live":
				if (globalThis.isShuttingDown) {
					return json({ status: "shutting_down" }, 503);
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
					endpoints: ["/", "/health/live", "/health/ready", "/info"]
				});

			default:
				return json({ error: "Not Found" }, 404);
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
