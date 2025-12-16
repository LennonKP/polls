import { Poll } from "@/domain/entities/poll/Poll";
import { PollRepository, PollFilters } from "@/application/repositories/PollRepository";

export class MemoryPollRepository implements PollRepository {
    private polls: Poll[] = [];

    async save(poll: Poll): Promise<void> {
        this.polls.push(poll);
    }

    async updateById(id: string, poll: Poll): Promise<void> {
        const index = this.polls.findIndex(p => p.getId() === id);
        if (index !== -1) {
            this.polls[index] = poll;
        }
    }

    async getById(id: string): Promise<Poll | null> {
        return this.polls.find(p => p.getId() === id) ?? null;
    }

    async findByCreator(userId: string, page = 1, limit = 10): Promise<{ polls: Poll[]; total: number }> {
        const filtered = this.polls.filter(p => p.getCreatedById() === userId);
        const offset = (page - 1) * limit;
        return {
            polls: filtered.slice(offset, offset + limit),
            total: filtered.length,
        };
    }

    async findAll(filters: PollFilters): Promise<{ polls: Poll[]; total: number }> {
        let filtered = [...this.polls];
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 10;

        if (filters.status) {
            filtered = filtered.filter(p => p.getStatus() === filters.status);
        }

        if (filters.category) {
            filtered = filtered.filter(p => p.getCategories()?.includes(filters.category!) ?? false);
        }

        if (filters.createdFrom) {
            filtered = filtered.filter(p => p.getStartDate() >= filters.createdFrom!);
        }

        if (filters.createdTo) {
            filtered = filtered.filter(p => p.getStartDate() <= filters.createdTo!);
        }

        const offset = (page - 1) * limit;
        return {
            polls: filtered.slice(offset, offset + limit),
            total: filtered.length,
        };
    }

    clear(): void {
        this.polls = [];
    }

    getAll(): Poll[] {
        return [...this.polls];
    }
}
