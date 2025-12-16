import { eq } from "drizzle-orm";
import { UserRepository } from "@/application/repositories/UserRepository";
import { User } from "@/domain/entities/users/User";
import { db } from "../database/connection";
import { users } from "../database/schema";

export class DrizzleUserRepository implements UserRepository {
    async findByEmail(userEmail: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

        if (result.length === 0) return null;

        const { id, name, email, password } = result[0];
        return new User(id, name, email, password);
    }

    async findById(userId: string): Promise<User | null> {
        const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);

        if (result.length === 0) return null;

        const { id, name, email, password } = result[0];
        return new User(id, name, email, password);
    }

    async save(user: User): Promise<void> {
        await db.insert(users).values({
            id: user.getId(),
            name: user.getName(),
            email: user.getEmail(),
            password: user.getPassword(),
        });
    }
}
