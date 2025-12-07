import { Poll } from "@/domain/entities/poll/Poll";

export interface PollRepository {
  save(poll: Poll): Promise<void>;
  updateById(id: string, poll: Poll): Promise<void>;
  getById(id: string): Promise<Poll | null>;
}
