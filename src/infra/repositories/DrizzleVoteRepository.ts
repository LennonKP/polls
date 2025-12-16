import { eq, sql, and } from "drizzle-orm";
import { VoteRepository } from "@/application/repositories/VoteRepository";
import { db } from "../database/connection";
import { votes, polls, pollOptions } from "../database/schema";
import { randomUUIDv7 } from "bun";

export class DrizzleVoteRepository implements VoteRepository {
    async create(vote: { pollId: string; optionId: string; userId: string }): Promise<void> {
        await db.insert(votes).values({
            id: randomUUIDv7(),
            pollId: vote.pollId,
            optionId: vote.optionId,
            userId: vote.userId,
        });
    }

    async findByUserAndPoll(userId: string, pollId: string): Promise<{ id: string; optionId: string } | null> {
        const result = await db
            .select({ id: votes.id, optionId: votes.optionId })
            .from(votes)
            .where(and(eq(votes.userId, userId), eq(votes.pollId, pollId)))
            .limit(1);

        return result.length > 0 ? result[0] : null;
    }

    async countByPoll(pollId: string): Promise<number> {
        const result = await db
            .select({ count: sql<number>`count(*)` })
            .from(votes)
            .where(eq(votes.pollId, pollId));

        return Number(result[0]?.count ?? 0);
    }

    async getVoteCountsByPoll(pollId: string): Promise<{ optionId: string; count: number }[]> {
        const result = await db
            .select({
                optionId: votes.optionId,
                count: sql<number>`count(*)`,
            })
            .from(votes)
            .where(eq(votes.pollId, pollId))
            .groupBy(votes.optionId);

        return result.map(r => ({
            optionId: r.optionId,
            count: Number(r.count),
        }));
    }

    async findByUser(
        userId: string,
        page: number,
        limit: number
    ): Promise<{
        votes: {
            pollId: string;
            pollTitle: string;
            optionId: string;
            optionText: string;
            votedAt: Date;
        }[];
        total: number;
    }> {
        const offset = (page - 1) * limit;

        const [votesResult, countResult] = await Promise.all([
            db
                .select({
                    pollId: votes.pollId,
                    pollTitle: polls.title,
                    optionId: votes.optionId,
                    optionText: pollOptions.text,
                    votedAt: votes.createdAt,
                })
                .from(votes)
                .innerJoin(polls, eq(votes.pollId, polls.id))
                .innerJoin(pollOptions, eq(votes.optionId, pollOptions.id))
                .where(eq(votes.userId, userId))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(votes)
                .where(eq(votes.userId, userId)),
        ]);

        return {
            votes: votesResult,
            total: Number(countResult[0]?.count ?? 0),
        };
    }
}
