import { z } from "zod";

export const registerAuthSchema = z.object({
  username: z.string().trim().min(2).max(40),
  email: z.string().trim().email(),
  password: z.string().min(6).max(80)
});

export const loginAuthSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1)
});
