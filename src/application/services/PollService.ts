import { Poll } from "@/domain/entities/poll/Poll";
import { CreatePollDTO } from "../dto/poll";
import { PollRepository } from "../repositories/PollRepository";
import { randomUUIDv7 } from "bun";
import { PollAlternative } from "@/domain/entities/poll/PollAlternative";

export class PollService {
    constructor(
        private pollRepository: PollRepository
    ) { }

    async createPoll(createPollDTO: CreatePollDTO, createdById: string): Promise<Poll> {
        const { title, description, alternatives, startAt, endAt, expectedVotes, visibility, categories } = createPollDTO;
        const id = randomUUIDv7();

        const poll = new Poll(
            id,
            title,
            alternatives.map(alt => new PollAlternative(randomUUIDv7(), alt.text, alt.imageUrl)),
            startAt,
            visibility,
            createdById,
            "open",
            description ?? null,
            endAt ?? null,
            expectedVotes ?? null,
            categories ?? null
        );

        await this.pollRepository.save(poll);
        return poll;
    }
}