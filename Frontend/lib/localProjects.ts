import type { ProjectPayload, ProjectSceneData } from "@/types/project.types";

export interface LocalProject {
  id: string;
  title: string;
  sceneData: ProjectSceneData;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "draw2gether-local-projects-v1";

function canUseStorage(): boolean {
  return typeof window !== "undefined";
}

export function readLocalProjects(): LocalProject[] {
  if (!canUseStorage()) {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as LocalProject[];
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}

export function writeLocalProjects(projects: LocalProject[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function clearLocalProjects(): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}

export function toProjectPayloads(projects: LocalProject[]): ProjectPayload[] {
  return projects.map((project) => ({
    title: project.title,
    sceneData: project.sceneData,
  }));
}

export function createEmptySceneData(): ProjectSceneData {
  return {
    elements: [],
    appState: {},
    files: {},
  };
}
