import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AuthService } from "@/application/services/AuthService";
import { SigninDTO, SignupDTO } from "@/application/dto/auth";

export class AuthController {
    constructor(private readonly authService: AuthService) { }

    async register(request: FastifyRequest, reply: FastifyReply) {
        try {
            const body = SignupDTO.parse(request.body);
            const result = await this.authService.register(body.name, body.email, body.password);
            return reply.status(201).send(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: "Validation error", details: error.issues });
            }
            if (error instanceof Error) {
                if (error.message === "Email already registered") {
                    return reply.status(409).send({ error: error.message });
                }
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async login(request: FastifyRequest, reply: FastifyReply) {
        try {
            const body = SigninDTO.parse(request.body);
            const result = await this.authService.login(body.email, body.password);
            reply.header("Set-Cookie", `token=${result.accessToken}; Path=/; HttpOnly; Secure; SameSite=Strict`);
            return reply.status(200).send(result);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: "Validation error", details: error.issues });
            }
            if (error instanceof Error) {
                if (error.message === "Invalid email or password") {
                    return reply.status(401).send({ error: error.message });
                }
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }
}
