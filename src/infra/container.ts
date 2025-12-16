import { DrizzleUserRepository } from "@/infra/repositories/DrizzleUserRepository";
import { DrizzlePollRepository } from "@/infra/repositories/DrizzlePollRepository";
import { DrizzleVoteRepository } from "@/infra/repositories/DrizzleVoteRepository";
import { BcryptHashProvider } from "@/infra/providers/BcryptHashProvider";
import { JsonWebTokenProvider } from "@/infra/providers/JsonWebTokenProvider";
import { AuthService } from "@/application/services/AuthService";
import { PollService } from "@/application/services/PollService";
import { AuthController } from "@/infra/http/controllers/AuthController";
import { PollController } from "@/infra/http/controllers/PollController";
import { VoteController } from "@/infra/http/controllers/VoteController";
import { MeController } from "@/infra/http/controllers/MeController";

const userRepository = new DrizzleUserRepository();
const pollRepository = new DrizzlePollRepository();
const voteRepository = new DrizzleVoteRepository();

const hashProvider = new BcryptHashProvider();
const jwtProvider = new JsonWebTokenProvider();

const authService = new AuthService(userRepository, hashProvider, jwtProvider);
const pollService = new PollService(pollRepository);

const authController = new AuthController(authService);
const pollController = new PollController(pollService, pollRepository, userRepository, voteRepository);
const voteController = new VoteController(pollRepository, voteRepository);
const meController = new MeController(pollRepository, voteRepository);

export const container = {
    authController,
    pollController,
    voteController,
    meController,
};

export type Container = typeof container;
