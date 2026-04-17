import { z } from "zod";

const sceneDataSchema = z.object({
  elements: z.array(z.unknown()).default([]),
  appState: z.record(z.string(), z.unknown()).default({}),
  files: z.record(z.string(), z.unknown()).default({}),
});

const titleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(120, "Title must be at most 120 characters");

export const createProjectSchema = z.object({
  title: titleSchema,
  sceneData: sceneDataSchema,
});

export const updateProjectSchema = z.object({
  title: titleSchema.optional(),
  sceneData: sceneDataSchema.optional(),
});

export const syncProjectsSchema = z.object({
  projects: z.array(createProjectSchema).max(100, "Too many projects to sync at once"),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SyncProjectsInput = z.infer<typeof syncProjectsSchema>;
