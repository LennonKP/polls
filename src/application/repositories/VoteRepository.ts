export interface VoteRepository {
    create(vote: { pollId: string; optionId: string; userId: string }): Promise<void>;
    findByUserAndPoll(userId: string, pollId: string): Promise<{ id: string; optionId: string } | null>;
    countByPoll(pollId: string): Promise<number>;
    getVoteCountsByPoll(pollId: string): Promise<{ optionId: string; count: number }[]>;
    findByUser(userId: string, page: number, limit: number): Promise<{
        votes: {
            pollId: string;
            pollTitle: string;
            optionId: string;
            optionText: string;
            votedAt: Date;
        }[];
        total: number;
    }>;
}
