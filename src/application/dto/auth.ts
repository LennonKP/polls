import z from "zod";

export const SignupDTO = z.object({
    name: z.string().min(2),
    email: z.email(),
    password: z.string().min(6),
});

export const SigninDTO = z.object({
    email: z.email(),
    password: z.string().min(1),
});