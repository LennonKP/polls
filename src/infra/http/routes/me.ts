import { FastifyInstance } from "fastify";
import { authMiddleware, AuthenticatedRequest } from "../middlewares/auth";
import { container } from "@/infra/container";

const { meController } = container;

export async function meRoutes(app: FastifyInstance) {
    app.get("/polls/created", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        meController.getCreatedPolls(request, reply)
    );

    app.get("/polls/voted", { preHandler: authMiddleware }, (request: AuthenticatedRequest, reply) =>
        meController.getVotedPolls(request, reply)
    );
}
