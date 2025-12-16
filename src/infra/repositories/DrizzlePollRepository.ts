import { eq, and, gte, lte, sql, inArray } from "drizzle-orm";
import { PollRepository, PollFilters } from "@/application/repositories/PollRepository";
import { Poll } from "@/domain/entities/poll/Poll";
import { PollAlternative } from "@/domain/entities/poll/PollAlternative";
import { db } from "../database/connection";
import { polls, pollOptions, pollCategories, votes } from "../database/schema";

export class DrizzlePollRepository implements PollRepository {
    async save(poll: Poll): Promise<void> {
        await db.transaction(async (tx) => {
            await tx.insert(polls).values({
                id: poll.getId(),
                title: poll.getTitle(),
                description: poll.getDescription(),
                visibility: poll.getVisibility(),
                status: poll.getStatus(),
                startAt: poll.getStartDate(),
                endAt: poll.getEndDate(),
                expectedVotes: poll.getExpectedVotes(),
                createdById: poll.getCreatedById(),
            });

            const options = poll.getAlternatives();
            await tx.insert(pollOptions).values(
                options.map((opt) => ({
                    id: opt.getId(),
                    pollId: poll.getId(),
                    text: opt.getText(),
                    imageUrl: opt.getImageUrl(),
                }))
            );

            const categories = poll.getCategories();
            if (categories && categories.length > 0) {
                await tx.insert(pollCategories).values(
                    categories.map((cat) => ({
                        pollId: poll.getId(),
                        category: cat,
                    }))
                );
            }
        });
    }

    async updateById(id: string, poll: Poll): Promise<void> {
        await db
            .update(polls)
            .set({
                title: poll.getTitle(),
                description: poll.getDescription(),
                visibility: poll.getVisibility(),
                status: poll.getStatus(),
                endAt: poll.getEndDate(),
                expectedVotes: poll.getExpectedVotes(),
            })
            .where(eq(polls.id, id));
    }

    async getById(id: string): Promise<Poll | null> {
        const result = await db
            .select()
            .from(polls)
            .where(eq(polls.id, id))
            .limit(1);

        if (result.length === 0) {
            return null;
        }

        const row = result[0];

        // Get options
        const options = await db
            .select()
            .from(pollOptions)
            .where(eq(pollOptions.pollId, id));

        // Get categories
        const categories = await db
            .select()
            .from(pollCategories)
            .where(eq(pollCategories.pollId, id));

        return new Poll(
            row.id,
            row.title,
            options.map((opt) => new PollAlternative(opt.id, opt.text, opt.imageUrl)),
            row.startAt,
            row.visibility,
            row.createdById,
            row.status,
            row.description,
            row.endAt,
            row.expectedVotes,
            categories.map((cat) => cat.category)
        );
    }

    async findByCreator(userId: string, page = 1, limit = 10): Promise<{ polls: Poll[]; total: number }> {
        const offset = (page - 1) * limit;

        const [pollsResult, countResult] = await Promise.all([
            db
                .select()
                .from(polls)
                .where(eq(polls.createdById, userId))
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(polls)
                .where(eq(polls.createdById, userId)),
        ]);

        const pollsWithDetails = await Promise.all(
            pollsResult.map(async (row) => {
                const options = await db
                    .select()
                    .from(pollOptions)
                    .where(eq(pollOptions.pollId, row.id));

                const categories = await db
                    .select()
                    .from(pollCategories)
                    .where(eq(pollCategories.pollId, row.id));

                return new Poll(
                    row.id,
                    row.title,
                    options.map((opt) => new PollAlternative(opt.id, opt.text, opt.imageUrl)),
                    row.startAt,
                    row.visibility,
                    row.createdById,
                    row.status,
                    row.description,
                    row.endAt,
                    row.expectedVotes,
                    categories.map((cat) => cat.category)
                );
            })
        );

        return {
            polls: pollsWithDetails,
            total: Number(countResult[0]?.count ?? 0),
        };
    }

    async findAll(filters: PollFilters): Promise<{ polls: Poll[]; total: number }> {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;
        const offset = (page - 1) * limit;

        const conditions = [];

        if (filters.status) {
            conditions.push(eq(polls.status, filters.status));
        }

        if (filters.createdFrom) {
            conditions.push(gte(polls.createdAt, filters.createdFrom));
        }

        if (filters.createdTo) {
            conditions.push(lte(polls.createdAt, filters.createdTo));
        }

        // For category filter, we need to join with pollCategories
        let pollIdsWithCategory: string[] | null = null;
        if (filters.category) {
            const categoryPolls = await db
                .select({ pollId: pollCategories.pollId })
                .from(pollCategories)
                .where(eq(pollCategories.category, filters.category));
            pollIdsWithCategory = categoryPolls.map((p) => p.pollId);

            if (pollIdsWithCategory.length === 0) {
                return { polls: [], total: 0 };
            }
            conditions.push(inArray(polls.id, pollIdsWithCategory));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        const [pollsResult, countResult] = await Promise.all([
            db
                .select()
                .from(polls)
                .where(whereClause)
                .limit(limit)
                .offset(offset),
            db
                .select({ count: sql<number>`count(*)` })
                .from(polls)
                .where(whereClause),
        ]);

        // Filter by vote count if needed
        let filteredPolls = pollsResult;
        if (filters.minVotes !== undefined || filters.maxVotes !== undefined) {
            const pollVoteCounts = await db
                .select({
                    pollId: votes.pollId,
                    voteCount: sql<number>`count(*)`,
                })
                .from(votes)
                .groupBy(votes.pollId);

            const voteCountMap = new Map(
                pollVoteCounts.map((p) => [p.pollId, Number(p.voteCount)])
            );

            filteredPolls = pollsResult.filter((poll) => {
                const count = voteCountMap.get(poll.id) ?? 0;
                if (filters.minVotes !== undefined && count < filters.minVotes) return false;
                if (filters.maxVotes !== undefined && count > filters.maxVotes) return false;
                return true;
            });
        }

        const pollsWithDetails = await Promise.all(
            filteredPolls.map(async (row) => {
                const options = await db
                    .select()
                    .from(pollOptions)
                    .where(eq(pollOptions.pollId, row.id));

                const categories = await db
                    .select()
                    .from(pollCategories)
                    .where(eq(pollCategories.pollId, row.id));

                return new Poll(
                    row.id,
                    row.title,
                    options.map((opt) => new PollAlternative(opt.id, opt.text, opt.imageUrl)),
                    row.startAt,
                    row.visibility,
                    row.createdById,
                    row.status,
                    row.description,
                    row.endAt,
                    row.expectedVotes,
                    categories.map((cat) => cat.category)
                );
            })
        );

        return {
            polls: pollsWithDetails,
            total: Number(countResult[0]?.count ?? 0),
        };
    }
}
