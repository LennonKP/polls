import Fastify from "fastify";
import { authRoutes } from "./routes/auth";
import { pollRoutes } from "./routes/poll";
import { voteRoutes } from "./routes/vote";
import { meRoutes } from "./routes/me";

const server = Fastify();

server.register(authRoutes, { prefix: "/auth" });
server.register(pollRoutes, { prefix: "/polls" });
server.register(voteRoutes, { prefix: "/polls" });
server.register(meRoutes, { prefix: "/me" });

const start = async () => {
    try {
        const port = Number(process.env.PORT) || 3000;
        await server.listen({ port, host: "0.0.0.0" });
        console.log(`Server running on http://localhost:${port}`);
    } catch (err) {
        server.log.error(err);
        process.exit(1);
    }
};

start();
