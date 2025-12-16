import { FastifyReply } from "fastify";
import { PollRepository } from "@/application/repositories/PollRepository";
import { VoteRepository } from "@/application/repositories/VoteRepository";
import { AuthenticatedRequest } from "../middlewares/auth";

export class MeController {
    constructor(
        private readonly pollRepository: PollRepository,
        private readonly voteRepository: VoteRepository
    ) { }

    async getCreatedPolls(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const userId = request.userId!;
            const query = request.query as { page?: string; limit?: string };
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 10;

            const result = await this.pollRepository.findByCreator(userId, page, limit);

            return reply.send({
                polls: result.polls.map(poll => ({
                    id: poll.getId(),
                    title: poll.getTitle(),
                    description: poll.getDescription(),
                    visibility: poll.getVisibility(),
                    status: poll.getStatus(),
                    startAt: poll.getStartDate(),
                    endAt: poll.getEndDate(),
                    expectedVotes: poll.getExpectedVotes(),
                    categories: poll.getCategories(),
                })),
                page,
                limit,
                total: result.total,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async getVotedPolls(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const userId = request.userId!;
            const query = request.query as { page?: string; limit?: string };
            const page = query.page ? Number(query.page) : 1;
            const limit = query.limit ? Number(query.limit) : 10;

            const result = await this.voteRepository.findByUser(userId, page, limit);

            return reply.send({
                votes: result.votes.map(vote => ({
                    pollId: vote.pollId,
                    title: vote.pollTitle,
                    votedAt: vote.votedAt,
                    optionChosen: {
                        id: vote.optionId,
                        text: vote.optionText,
                    },
                })),
                page,
                limit,
                total: result.total,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }
}
