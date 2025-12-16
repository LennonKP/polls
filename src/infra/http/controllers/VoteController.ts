import { FastifyReply } from "fastify";
import { z } from "zod";
import { PollRepository } from "@/application/repositories/PollRepository";
import { VoteRepository } from "@/application/repositories/VoteRepository";
import { AuthenticatedRequest } from "../middlewares/auth";

const voteSchema = z.object({
    optionId: z.uuid({
        version: "v7"
    }),
});

export class VoteController {
    constructor(
        private readonly pollRepository: PollRepository,
        private readonly voteRepository: VoteRepository
    ) { }

    async vote(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const { pollId } = request.params as { pollId: string };
            const body = voteSchema.parse(request.body);
            const userId = request.userId!;

            const poll = await this.pollRepository.getById(pollId);
            if (!poll) {
                return reply.status(404).send({ error: "Poll not found" });
            }

            if (!poll.canVote()) {
                return reply.status(400).send({ error: "This poll is not accepting votes" });
            }

            const existingVote = await this.voteRepository.findByUserAndPoll(userId, pollId);
            if (existingVote) {
                return reply.status(409).send({ error: "You have already voted in this poll" });
            }

            const options = poll.getAlternatives();
            const option = options.find(opt => opt.getId() === body.optionId);
            if (!option) {
                return reply.status(400).send({ error: "Invalid option for this poll" });
            }

            if (poll.getExpectedVotes()) {
                const voteCount = await this.voteRepository.countByPoll(pollId);
                if (voteCount >= poll.getExpectedVotes()!) {
                    return reply.status(400).send({ error: "This poll has reached its vote limit" });
                }
            }

            await this.voteRepository.create({
                pollId,
                optionId: body.optionId,
                userId,
            });

            return reply.status(201).send({ message: "Vote registered successfully" });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return reply.status(400).send({ error: "Validation error", details: error.issues });
            }
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async getResults(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const { pollId } = request.params as { pollId: string };
            const userId = request.userId!;

            const poll = await this.pollRepository.getById(pollId);
            if (!poll) {
                return reply.status(404).send({ error: "Poll not found" });
            }

            if (poll.getVisibility() === "private" && poll.getCreatedById() !== userId) {
                return reply.status(403).send({ error: "You cannot view results of this private poll" });
            }

            const voteCounts = await this.voteRepository.getVoteCountsByPoll(pollId);
            const totalVotes = voteCounts.reduce((sum, vc) => sum + vc.count, 0);

            const options = poll.getAlternatives().map(opt => {
                const voteData = voteCounts.find(vc => vc.optionId === opt.getId());
                const votes = voteData?.count ?? 0;
                const percentage = totalVotes > 0 ? Number(((votes / totalVotes) * 100).toFixed(2)) : 0;

                return {
                    id: opt.getId(),
                    text: opt.getText(),
                    votes,
                    percentage,
                };
            });

            return reply.send({
                pollId: poll.getId(),
                title: poll.getTitle(),
                totalVotes,
                options,
                status: poll.getStatus(),
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }
}
