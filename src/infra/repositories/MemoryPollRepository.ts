import { PollRepository } from "@/application/repositories/PollRepository";
import { Poll } from "@/domain/entities/poll/Poll";

export class MemoryPollRepository implements PollRepository {
  private data: Poll[] = [];

  async save(poll: Poll): Promise<void> {
    this.data.push(poll)
  }

  async updateById(id: string, poll: Poll): Promise<void> {
    const pollToUpdate = this.data.find(p => p.getId() === id);
    if (!pollToUpdate) throw new Error(`Poll with id ${id} not found`);
    Object.assign(pollToUpdate, poll);
  }

  async getById(id: string): Promise<Poll | null> {
    return this.data.find(p => p.getId() === id) ?? null;
  }

}
