import { VoteRepository } from "@/application/repositories/VoteRepository";

interface Vote {
    id: string;
    pollId: string;
    optionId: string;
    userId: string;
    createdAt: Date;
}

interface PollInfo {
    title: string;
}

interface OptionInfo {
    text: string;
}

export class MemoryVoteRepository implements VoteRepository {
    private votes: Vote[] = [];
    private pollInfo: Map<string, PollInfo> = new Map();
    private optionInfo: Map<string, OptionInfo> = new Map();
    private idCounter = 0;

    async create(vote: { pollId: string; optionId: string; userId: string }): Promise<void> {
        this.votes.push({
            id: `vote-${++this.idCounter}`,
            ...vote,
            createdAt: new Date(),
        });
    }

    async findByUserAndPoll(userId: string, pollId: string): Promise<{ id: string; optionId: string } | null> {
        const vote = this.votes.find(v => v.userId === userId && v.pollId === pollId);
        return vote ? { id: vote.id, optionId: vote.optionId } : null;
    }

    async countByPoll(pollId: string): Promise<number> {
        return this.votes.filter(v => v.pollId === pollId).length;
    }

    async getVoteCountsByPoll(pollId: string): Promise<{ optionId: string; count: number }[]> {
        const pollVotes = this.votes.filter(v => v.pollId === pollId);
        const counts = new Map<string, number>();

        for (const vote of pollVotes) {
            counts.set(vote.optionId, (counts.get(vote.optionId) ?? 0) + 1);
        }

        return Array.from(counts.entries()).map(([optionId, count]) => ({ optionId, count }));
    }

    async findByUser(userId: string, page: number, limit: number): Promise<{
        votes: {
            pollId: string;
            pollTitle: string;
            optionId: string;
            optionText: string;
            votedAt: Date;
        }[];
        total: number;
    }> {
        const userVotes = this.votes.filter(v => v.userId === userId);
        const offset = (page - 1) * limit;
        const paginatedVotes = userVotes.slice(offset, offset + limit);

        return {
            votes: paginatedVotes.map(v => ({
                pollId: v.pollId,
                pollTitle: this.pollInfo.get(v.pollId)?.title ?? "Unknown Poll",
                optionId: v.optionId,
                optionText: this.optionInfo.get(v.optionId)?.text ?? "Unknown Option",
                votedAt: v.createdAt,
            })),
            total: userVotes.length,
        };
    }

    clear(): void {
        this.votes = [];
        this.pollInfo.clear();
        this.optionInfo.clear();
        this.idCounter = 0;
    }

    setPollInfo(pollId: string, title: string): void {
        this.pollInfo.set(pollId, { title });
    }

    setOptionInfo(optionId: string, text: string): void {
        this.optionInfo.set(optionId, { text });
    }

    getAll(): Vote[] {
        return [...this.votes];
    }
}
