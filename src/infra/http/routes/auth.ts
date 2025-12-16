import { FastifyInstance } from "fastify";
import { container } from "@/infra/container";

const { authController } = container;

export async function authRoutes(app: FastifyInstance) {
    app.post("/register", (request, reply) => authController.register(request, reply));
    app.post("/login", (request, reply) => authController.login(request, reply));
}
