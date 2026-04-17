import { randomUUID } from "node:crypto";
import { prisma } from "../../config/prisma";
import { AppError } from "../../lib/AppError";
import { NOT_FOUND } from "../../config/http";
import type { Prisma } from "../../generated/prisma/client";
import type { CreateProjectInput, UpdateProjectInput } from "./project.validation";

const projectSelect = {
  id: true,
  title: true,
  sceneData: true,
  slug: true,
  ownerId: true,
  createdAt: true,
  updatedAt: true,
} as const;

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function slugifyTitle(title: string): string {
  const normalized = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized.length > 0 ? normalized : "untitled-project";
}

async function generateUniqueSlug(title: string): Promise<string> {
  const base = slugifyTitle(title);

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const suffix = randomUUID().replace(/-/g, "").slice(0, 8);
    const candidate = `${base}-${suffix}`;

    const existing = await prisma.project.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  return `${base}-${Date.now()}`;
}

export const listProjects = async (userId: string) => {
  return prisma.project.findMany({
    where: {
      ownerId: userId,
      deletedAt: null,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: projectSelect,
  });
};

export const getProjectById = async (userId: string, projectId: string) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
      deletedAt: null,
    },
    select: projectSelect,
  });

  if (!project) {
    throw new AppError(NOT_FOUND, "Project not found");
  }

  return project;
};

export const createProject = async (userId: string, data: CreateProjectInput) => {
  const slug = await generateUniqueSlug(data.title);

  return prisma.project.create({
    data: {
      ownerId: userId,
      title: data.title,
      sceneData: toInputJsonValue(data.sceneData),
      slug,
    },
    select: projectSelect,
  });
};

export const updateProject = async (
  userId: string,
  projectId: string,
  data: UpdateProjectInput,
) => {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(NOT_FOUND, "Project not found");
  }

  return prisma.project.update({
    where: { id: projectId },
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.sceneData !== undefined
        ? { sceneData: toInputJsonValue(data.sceneData) }
        : {}),
    },
    select: projectSelect,
  });
};

export const deleteProject = async (userId: string, projectId: string) => {
  const existing = await prisma.project.findFirst({
    where: {
      id: projectId,
      ownerId: userId,
      deletedAt: null,
    },
    select: { id: true },
  });

  if (!existing) {
    throw new AppError(NOT_FOUND, "Project not found");
  }

  await prisma.project.update({
    where: { id: projectId },
    data: { deletedAt: new Date() },
  });
};

export const syncProjects = async (userId: string, projects: CreateProjectInput[]) => {
  if (projects.length === 0) {
    return [];
  }

  const createdProjects = await Promise.all(
    projects.map(async (project) => {
      const slug = await generateUniqueSlug(project.title);

      return prisma.project.create({
        data: {
          ownerId: userId,
          title: project.title,
          sceneData: toInputJsonValue(project.sceneData),
          slug,
        },
        select: projectSelect,
      });
    }),
  );

  return createdProjects;
};
