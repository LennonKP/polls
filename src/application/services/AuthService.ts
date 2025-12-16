import { User } from "@/domain/entities/users/User";
import { HashProvider } from "../ports/HashProvider";
import { JwtProvider } from "../ports/JwtProvider";
import { UserRepository } from "../repositories/UserRepository";
import { randomUUIDv7 } from "bun";

export class AuthService {
    constructor(
        private userRepository: UserRepository,
        private hashProvider: HashProvider,
        private jwtProvider: JwtProvider
    ) { }

    async register(name: string, email: string, password: string) {
        const existingUser = await this.userRepository.findByEmail(email);
        if (existingUser) throw new Error("Email already registered");

        const hashedPassword = await this.hashProvider.hash(password);
        const id = randomUUIDv7();
        const user = new User(id, email, name, hashedPassword);
        await this.userRepository.save(user);

        const accessToken = await this.jwtProvider.sign({ userId: user.getId() });
        return { accessToken, user: { id, name, email } };
    }

    async login(email: string, password: string) {
        const user = await this.userRepository.findByEmail(email);
        if (!user) throw new Error("Invalid email or password");

        const isValid = await this.hashProvider.compare(password, user.getPassword());
        if (!isValid) throw new Error("Invalid email or password");

        const token = await this.jwtProvider.sign({ userId: user.getId() });
        return {
            accessToken: token,
            user: {
                id: user.getId(),
                name: user.getName(),
                email: user.getEmail()
            }
        };
    }
}