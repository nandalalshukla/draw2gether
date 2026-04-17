export interface ProjectSceneData {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

export interface ProjectPayload {
  title: string;
  sceneData: ProjectSceneData;
}

export interface SyncProjectsPayload {
  projects: ProjectPayload[];
}
