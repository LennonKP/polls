import { FastifyInstance } from "fastify";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth";
import { container } from "@/infra/container";

const { pollController } = container;

export async function pollRoutes(app: FastifyInstance) {
    app.post("/", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        pollController.create(request, reply)
    );

    app.get("/", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        pollController.getAll(request, reply)
    );

    app.get("/:pollId", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        pollController.getById(request, reply)
    );

    app.post("/:pollId/close", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        pollController.close(request, reply)
    );

    app.patch("/:pollId/extend", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        pollController.extend(request, reply)
    );
}
