export interface ProjectSceneData {
  elements: unknown[];
  appState: Record<string, unknown>;
  files: Record<string, unknown>;
}

export interface Project {
  id: string;
  title: string;
  sceneData: ProjectSceneData;
  slug: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectPayload {
  title: string;
  sceneData: ProjectSceneData;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
