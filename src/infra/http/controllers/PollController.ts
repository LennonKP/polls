import { FastifyReply } from "fastify";
import { z } from "zod";
import { PollService } from "@/application/services/PollService";
import { PollRepository } from "@/application/repositories/PollRepository";
import { UserRepository } from "@/application/repositories/UserRepository";
import { VoteRepository } from "@/application/repositories/VoteRepository";
import { CreatePollSchema, ExtendPollSchema } from "@/application/dto/poll";
import { AuthenticatedRequest } from "../middlewares/auth";

export class PollController {
    constructor(
        private readonly pollService: PollService,
        private readonly pollRepository: PollRepository,
        private readonly userRepository: UserRepository,
        private readonly voteRepository: VoteRepository
    ) { }

    async create(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const body = CreatePollSchema.parse(request.body);
            const poll = await this.pollService.createPoll(body, request.userId!);
            const user = await this.userRepository.findById(request.userId!);

            return reply.status(201).send({
                id: poll.getId(),
                title: poll.getTitle(),
                description: poll.getDescription(),
                visibility: poll.getVisibility(),
                status: poll.getStatus(),
                startAt: poll.getStartDate(),
                endAt: poll.getEndDate(),
                expectedVotes: poll.getExpectedVotes(),
                categories: poll.getCategories(),
                options: poll.getAlternatives().map(opt => ({
                    id: opt.getId(),
                    text: opt.getText(),
                    imageUrl: opt.getImageUrl(),
                })),
                createdBy: {
                    id: request.userId,
                    name: user?.getName() ?? null,
                },
            });
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

    async getAll(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const query = request.query as {
                category?: string;
                minVotes?: string;
                maxVotes?: string;
                createdFrom?: string;
                createdTo?: string;
                status?: string;
                page?: string;
                limit?: string;
            };

            const filters = {
                category: query.category,
                minVotes: query.minVotes ? Number(query.minVotes) : undefined,
                maxVotes: query.maxVotes ? Number(query.maxVotes) : undefined,
                createdFrom: query.createdFrom ? new Date(query.createdFrom) : undefined,
                createdTo: query.createdTo ? new Date(query.createdTo) : undefined,
                status: query.status as "open" | "closed" | "scheduled" | undefined,
                page: query.page ? Number(query.page) : 1,
                limit: query.limit ? Number(query.limit) : 10,
            };

            const result = await this.pollRepository.findAll(filters);

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
                page: filters.page,
                limit: filters.limit,
                total: result.total,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async getById(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const { pollId } = request.params as { pollId: string };
            const poll = await this.pollRepository.getById(pollId);

            if (!poll) {
                return reply.status(404).send({ error: "Poll not found" });
            }

            const creator = await this.userRepository.findById(poll.getCreatedById());
            const existingVote = await this.voteRepository.findByUserAndPoll(request.userId!, pollId);

            return reply.send({
                id: poll.getId(),
                title: poll.getTitle(),
                description: poll.getDescription(),
                visibility: poll.getVisibility(),
                status: poll.getStatus(),
                startAt: poll.getStartDate(),
                endAt: poll.getEndDate(),
                expectedVotes: poll.getExpectedVotes(),
                categories: poll.getCategories(),
                options: poll.getAlternatives().map(opt => ({
                    id: opt.getId(),
                    text: opt.getText(),
                    imageUrl: opt.getImageUrl(),
                })),
                createdBy: {
                    id: poll.getCreatedById(),
                    name: creator?.getName() ?? null,
                },
                hasVoted: !!existingVote,
            });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async close(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const { pollId } = request.params as { pollId: string };
            const poll = await this.pollRepository.getById(pollId);

            if (!poll) {
                return reply.status(404).send({ error: "Poll not found" });
            }

            if (poll.getCreatedById() !== request.userId) {
                return reply.status(403).send({ error: "Only the poll creator can close it" });
            }

            if (poll.getStatus() === "closed") {
                return reply.status(400).send({ error: "Poll is already closed" });
            }

            poll.setStatus("closed");
            await this.pollRepository.updateById(pollId, poll);

            return reply.send({ message: "Poll closed successfully", status: poll.getStatus() });
        } catch (error) {
            if (error instanceof Error) {
                return reply.status(500).send({ error: error.message });
            }
            return reply.status(500).send({ error: "Internal server error" });
        }
    }

    async extend(request: AuthenticatedRequest, reply: FastifyReply) {
        try {
            const { pollId } = request.params as { pollId: string };
            const body = ExtendPollSchema.parse(request.body);

            const poll = await this.pollRepository.getById(pollId);

            if (!poll) {
                return reply.status(404).send({ error: "Poll not found" });
            }

            if (poll.getCreatedById() !== request.userId) {
                return reply.status(403).send({ error: "Only the poll creator can extend it" });
            }

            if (body.endAt) {
                if (body.endAt <= new Date()) {
                    return reply.status(400).send({ error: "End date must be in the future" });
                }
                poll.setEndDate(body.endAt);
            }

            if (body.expectedVotes) {
                poll.setExpectedVotes(body.expectedVotes);
            }

            await this.pollRepository.updateById(pollId, poll);

            return reply.send({
                message: "Poll extended successfully",
                endAt: poll.getEndDate(),
                expectedVotes: poll.getExpectedVotes(),
            });
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
}
