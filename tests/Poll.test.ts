import { describe, test, expect, beforeEach } from "bun:test";
import { Poll } from "@/domain/entities/poll/Poll";
import { PollAlternative } from "@/domain/entities/poll/PollAlternative";
import { CreatePollDTO } from "@/application/dto/poll";
import { PollService } from "@/application/services/PollService";
import { MemoryPollRepository } from "@/infra/repositories/memory/MemoryPollRepository";
import { PollRepository } from "@/application/repositories/PollRepository";

describe("Poll Entity", () => {
    let poll: Poll;

    beforeEach(() => {
        poll = new Poll(
            "poll-1",
            "Test Poll",
            [
                new PollAlternative("opt-1", "Option 1", null),
                new PollAlternative("opt-2", "Option 2", null),
            ],
            new Date("2025-01-01T00:00:00Z"),
            "public",
            "user-123",
            "open",
            "Description",
            new Date("2025-12-31T23:59:59Z"),
            100,
            ["tech"]
        );
    });

    describe("canVote", () => {
        test("should return true when poll is open and within date range", () => {
            const now = new Date("2025-06-15T12:00:00Z");
            expect(poll.canVote(now)).toBe(true);
        });

        test("should return false when poll is closed", () => {
            poll.setStatus("closed");
            const now = new Date("2025-06-15T12:00:00Z");
            expect(poll.canVote(now)).toBe(false);
        });

        test("should return false before start date", () => {
            const now = new Date("2024-12-31T23:59:59Z");
            expect(poll.canVote(now)).toBe(false);
        });

        test("should return false after end date", () => {
            const now = new Date("2026-01-01T00:00:00Z");
            expect(poll.canVote(now)).toBe(false);
        });
    });

    describe("isOpen", () => {
        test("should return true when status is open", () => {
            expect(poll.isOpen()).toBe(true);
        });

        test("should return false when status is closed", () => {
            poll.setStatus("closed");
            expect(poll.isOpen()).toBe(false);
        });
    });

    describe("setters", () => {
        test("should update end date", () => {
            const newEndDate = new Date("2026-06-30T23:59:59Z");
            poll.setEndDate(newEndDate);
            expect(poll.getEndDate()).toEqual(newEndDate);
        });

        test("should update expected votes", () => {
            poll.setExpectedVotes(200);
            expect(poll.getExpectedVotes()).toBe(200);
        });

        test("should update status", () => {
            poll.setStatus("closed");
            expect(poll.getStatus()).toBe("closed");
        });
    });
});

describe("PollAlternative Entity", () => {
    test("should create alternative without image", () => {
        const alt = new PollAlternative("alt-1", "Option Text", null);

        expect(alt.getId()).toBe("alt-1");
        expect(alt.getText()).toBe("Option Text");
        expect(alt.getImageUrl()).toBeNull();
    });

    test("should create alternative with image", () => {
        const alt = new PollAlternative("alt-1", "Cat", "https://example.com/cat.jpg");

        expect(alt.getText()).toBe("Cat");
        expect(alt.getImageUrl()).toBe("https://example.com/cat.jpg");
    });
});

describe("PollService", () => {
    let pollService: PollService;
    let pollRepository: PollRepository;

    beforeEach(() => {
        pollRepository = new MemoryPollRepository();
        pollService = new PollService(pollRepository);
    });

    describe("createPoll", () => {
        test("should create a poll successfully", async () => {
            const createPollDTO: CreatePollDTO = {
                title: "Test Poll Title",
                description: "Test description",
                startAt: new Date(),
                endAt: new Date(Date.now() + 86400000),
                visibility: "public",
                alternatives: [
                    { text: "Option 1" },
                    { text: "Option 2" },
                ],
                categories: ["test"],
            };

            const poll = await pollService.createPoll(createPollDTO, "user-123");

            expect(poll.getId()).toBeDefined();
            expect(poll.getTitle()).toBe("Test Poll Title");
            expect(poll.getDescription()).toBe("Test description");
            expect(poll.getVisibility()).toBe("public");
            expect(poll.getStatus()).toBe("open");
            expect(poll.getCreatedById()).toBe("user-123");
            expect(poll.getAlternatives().length).toBe(2);
        });

        test("should save poll to repository", async () => {
            const createPollDTO: CreatePollDTO = {
                title: "Test Poll Title",
                startAt: new Date(),
                endAt: new Date(Date.now() + 86400000),
                visibility: "public",
                alternatives: [
                    { text: "Option 1" },
                    { text: "Option 2" },
                ],
            };

            const poll = await pollService.createPoll(createPollDTO, "user-123");

            const savedPolls = await pollRepository.findAll({});
            expect(savedPolls.polls.length).toBe(1);
            expect(savedPolls.polls[0].getId()).toBe(poll.getId());
        });

        test("should assign unique IDs to each alternative", async () => {
            const createPollDTO: CreatePollDTO = {
                title: "Test Poll Title",
                startAt: new Date(),
                endAt: new Date(Date.now() + 86400000),
                visibility: "public",
                alternatives: [
                    { text: "Option 1" },
                    { text: "Option 2" },
                    { text: "Option 3" },
                ],
            };

            const poll = await pollService.createPoll(createPollDTO, "user-123");
            const alternatives = poll.getAlternatives();

            const ids = alternatives.map(a => a.getId());
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(3);
        });

        test("should set poll visibility to private", async () => {
            const createPollDTO: CreatePollDTO = {
                title: "Private Poll",
                startAt: new Date(),
                expectedVotes: 100,
                visibility: "private",
                alternatives: [
                    { text: "Yes" },
                    { text: "No" },
                ],
            };

            const poll = await pollService.createPoll(createPollDTO, "user-123");

            expect(poll.getVisibility()).toBe("private");
        });

        test("should support alternatives with images", async () => {
            const createPollDTO: CreatePollDTO = {
                title: "Poll with Images",
                startAt: new Date(),
                endAt: new Date(Date.now() + 86400000),
                visibility: "public",
                alternatives: [
                    { text: "Cat", imageUrl: "https://example.com/cat.jpg" },
                    { text: "Dog", imageUrl: "https://example.com/dog.jpg" },
                ],
            };

            const poll = await pollService.createPoll(createPollDTO, "user-123");
            const alternatives = poll.getAlternatives();

            expect(alternatives[0].getImageUrl()).toBe("https://example.com/cat.jpg");
            expect(alternatives[1].getImageUrl()).toBe("https://example.com/dog.jpg");
        });
    });
});
