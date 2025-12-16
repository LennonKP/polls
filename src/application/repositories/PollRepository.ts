import { Poll } from "@/domain/entities/poll/Poll";

export interface PollFilters {
  category?: string;
  minVotes?: number;
  maxVotes?: number;
  createdFrom?: Date;
  createdTo?: Date;
  status?: "open" | "closed" | "scheduled";
  page?: number;
  limit?: number;
}

export interface PollRepository {
  save(poll: Poll): Promise<void>;
  updateById(id: string, poll: Poll): Promise<void>;
  getById(id: string): Promise<Poll | null>;
  findByCreator(userId: string, page?: number, limit?: number): Promise<{ polls: Poll[]; total: number }>;
  findAll(filters: PollFilters): Promise<{ polls: Poll[]; total: number }>;
}
