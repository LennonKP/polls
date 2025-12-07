import { z } from 'zod';

export const CreatePollSchema = z.object({
    title: z.string().min(5),
    description: z.string().nullable().optional(),
    startAt: z.coerce.date().refine((date) => date >= new Date(), {
        message: "Start date must not be in the past",
    }),
    endAt: z.coerce.date().refine((date) => date > new Date(), {
        message: "End date must not be in the past",
    }).optional(),
    expectedVotes: z.number().min(1).optional(),
    alternatives: z.array(z.object({
        text: z.string().min(1),
        imageUrl: z.string().nullable().optional()
    })).min(2, "A poll requires at least 2 alternatives"),
    visibility: z.enum(["public", "private"]).default("public"),
}).refine((data) => !data.endAt || data.endAt > data.startAt, {
    message: "End date must be after start date",
    path: ["endAt"],
}).refine((data) => !!data.expectedVotes || !!data.endAt, {
    message: "You must provide either an End Date or Expected Votes limit",
    path: ["expectedVotes", "endAt"],
});

export type CreatePollDTO = z.infer<typeof CreatePollSchema>;