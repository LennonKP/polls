import { FastifyInstance } from "fastify";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth";
import { container } from "@/infra/container";

const { voteController } = container;

export async function voteRoutes(app: FastifyInstance) {
    app.post("/:pollId/votes", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        voteController.vote(request, reply)
    );

    app.get("/:pollId/results", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        voteController.getResults(request, reply)
    );
}
