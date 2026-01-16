import { serve } from "bun";

type CNFStatus = {
	id: string;
	name: string;
	version: string;
	status: string;
	started_at: string;
	environment: string;
};

function generateID(): string {
	return `cnf-${Math.floor(Date.now() / 1000)}`;
}

const cnfStatus: CNFStatus = {
	id: generateID(),
	name: "Simple-CNFSimulator",
	version: "1.0.0",
	status: "running",
	started_at: new Date().toISOString(),
	environment: process.env.ENVIRONMENT ?? "development"
};

function json(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data, null, 2), {
		status,
		headers: { "Content-Type": "application/json" }
	});
}

const port = Number(process.env.PORT ?? 3000);

console.log(`Starting CNF Simulator on port ${port}`);
console.log(`CNF Instance ID: ${cnfStatus.id}`);
console.log(`Environment: ${cnfStatus.environment}`);

serve({
	port,
	fetch(req) {
		const url = new URL(req.url);
		const path = url.pathname;

		if (path === "/health") {
			return json({
				status: "healthy",
				service: "cnf-simulator",
				timestamp: new Date().toISOString()
			});
		}

		if (path === "/status") {
			cnfStatus.status = "running";
			return json({
				...cnfStatus,
				current_time: new Date().toISOString()
			});
		}

		if (path === "/config") {
			const envVars: Record<string, string> = {};
			for (const [key, value] of Object.entries(process.env)) {
				if (value !== undefined) envVars[key] = value;
			}

			return json({
				config: {
					port: process.env.PORT ?? "8080",
					environment: process.env.ENVIRONMENT ?? ""
				},
				env_vars: envVars
			});
		}

		if (path === "/info") {
			return json({
				service: "Cloud-Native Network Function",
				description: "A simple Bun application simulating a CNF for O-Cloud environment",
				endpoints: ["/health - Health check endpoint", "/status - Detailed status information", "/config - Configuration information", "/info - Service information"],
				version: "1.0.0"
			});
		}

		if (path === "/") {
			return json({
				...cnfStatus,
				current_time: new Date().toISOString()
			});
		}

		return json({ error: "Not Found" }, 404);
	}
});
