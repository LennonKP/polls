import { User } from "@/domain/entities/users/User";

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<void>;
}
