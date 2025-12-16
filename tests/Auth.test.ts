import { describe, test, expect, beforeEach } from "bun:test";
import { AuthService } from "@/application/services/AuthService";
import { MemoryUserRepository } from "@/infra/repositories/memory/MemoryUserRepository";
import { JsonWebTokenProvider } from "@/infra/providers/JsonWebTokenProvider";
import { JwtProvider } from "@/application/ports/JwtProvider";
import { BcryptHashProvider } from "@/infra/providers/BcryptHashProvider";
import { HashProvider } from "@/application/ports/HashProvider";
import { UserRepository } from "@/application/repositories/UserRepository";

describe("AuthService", () => {
    let authService: AuthService;
    let userRepository: UserRepository;
    let hashProvider: HashProvider;
    let jwtProvider: JwtProvider;

    beforeEach(() => {
        userRepository = new MemoryUserRepository();
        hashProvider = new BcryptHashProvider();
        jwtProvider = new JsonWebTokenProvider();
        authService = new AuthService(userRepository, hashProvider, jwtProvider);
    });

    describe("register", () => {
        test("should register a new user successfully", async () => {
            const result = await authService.register("John Doe", "john@example.com", "password123");

            expect(result.accessToken).toBeDefined();
            expect(result.user.name).toBe("John Doe");
            expect(result.user.email).toBe("john@example.com");
            expect(result.user.id).toBeDefined();
        });

        test("should hash the password when registering", async () => {
            const password = "password123";
            await authService.register("John Doe", "john@example.com", password);

            const user = await userRepository.findByEmail("john@example.com");
            expect(user).toBeDefined();
            const isValidHash = await hashProvider.compare(password, user!.getPassword());
            expect(isValidHash).toBe(true);
        });

        test("should throw error if email is already registered", async () => {
            await authService.register("John Doe", "john@example.com", "password123");

            await expect(
                authService.register("Jane Doe", "john@example.com", "password456")
            ).rejects.toThrow("Email already registered");
        });
    });

    describe("login", () => {
        beforeEach(async () => {
            await authService.register("John Doe", "john@example.com", "password123");
        });

        test("should login successfully with correct credentials", async () => {
            const result = await authService.login("john@example.com", "password123");

            expect(result.accessToken).toBeDefined();
            expect(result.user.email).toBe("john@example.com");
            expect(result.user.name).toBe("John Doe");
        });

        test("should throw error with wrong email", async () => {
            await expect(
                authService.login("wrong@example.com", "password123")
            ).rejects.toThrow("Invalid email or password");
        });

        test("should throw error with wrong password", async () => {
            await expect(
                authService.login("john@example.com", "wrongpassword")
            ).rejects.toThrow("Invalid email or password");
        });
    });
});
