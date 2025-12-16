import { FastifyRequest, FastifyReply } from "fastify";
import { JsonWebTokenProvider } from "@/infra/providers/JsonWebTokenProvider";

const jwtProvider = new JsonWebTokenProvider();

export interface AuthenticatedRequest extends FastifyRequest {
    userId?: string;
}

export async function authMiddleware(
    request: AuthenticatedRequest,
    reply: FastifyReply
) {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
        return reply.status(401).send({ error: "Token not provided" });
    }

    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
        return reply.status(401).send({ error: "Token malformatted" });
    }

    try {
        const payload = await jwtProvider.verify(token);

        if (!payload || typeof payload !== "object" || !("userId" in payload)) {
            return reply.status(401).send({ error: "Invalid token" });
        }

        request.userId = (payload as { userId: string }).userId;
    } catch (error) {
        return reply.status(401).send({ error: "Invalid token" });
    }
}
