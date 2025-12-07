import { Poll } from "@/domain/entities/poll/Poll";
import { CreatePollDTO } from "../dto/CreatePollDTO";
import { PollRepository } from "../repositories/PollRepository";
import { randomUUIDv7 } from "bun";
import { PollAlternative } from "@/domain/entities/poll/PollAlternative";

export class PollService {
    constructor(
        private pollRepository: PollRepository
    ) { }

    async createPoll(createPollDTO: CreatePollDTO) {
        const { title, description, alternatives, startAt, endAt, expectedVotes, visibility } = createPollDTO
        const id = randomUUIDv7()
        const poll = new Poll(
            id,
            title,
            alternatives.map(alt => new PollAlternative(alt.text, alt.imageUrl)),
            startAt,
            visibility,
            description,
            endAt,
            expectedVotes
        )
        this.pollRepository.save(poll)
    }
}