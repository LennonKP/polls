import { User } from "@/domain/entities/users/User";
import { UserRepository } from "@/application/repositories/UserRepository";

export class MemoryUserRepository implements UserRepository {
    private users: User[] = [];

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(u => u.getEmail() === email) ?? null;
    }

    async findById(id: string): Promise<User | null> {
        return this.users.find(u => u.getId() === id) ?? null;
    }

    async save(user: User): Promise<void> {
        this.users.push(user);
    }

    clear(): void {
        this.users = [];
    }

    getAll(): User[] {
        return [...this.users];
    }
}
