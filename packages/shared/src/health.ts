import { z } from "zod";

export const dependencyStatusSchema = z.enum(["up", "down"]);

export const livenessResponseSchema = z.object({
  service: z.string().min(1),
  status: z.literal("ok"),
  timestamp: z.iso.datetime()
});

export const readinessResponseSchema = z.object({
  dependencies: z.object({
    postgres: dependencyStatusSchema,
    redis: dependencyStatusSchema
  }),
  service: z.string().min(1),
  status: z.enum(["ok", "degraded"]),
  timestamp: z.iso.datetime()
});

export type LivenessResponse = z.infer<typeof livenessResponseSchema>;
export type ReadinessResponse = z.infer<typeof readinessResponseSchema>;
