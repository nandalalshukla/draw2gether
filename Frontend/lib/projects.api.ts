import api from "./axios";
import type {
  ApiResponse,
  Project,
  ProjectPayload,
} from "@/types/project.types";

export const projectsApi = {
  list: async () => {
    const res = await api.get<ApiResponse<Project[]>>("/projects");
    return res.data.data;
  },

  getById: async (projectId: string) => {
    const res = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return res.data.data;
  },

  create: async (payload: ProjectPayload) => {
    const res = await api.post<ApiResponse<Project>>("/projects", payload);
    return res.data.data;
  },

  update: async (projectId: string, payload: Partial<ProjectPayload>) => {
    const res = await api.put<ApiResponse<Project>>(
      `/projects/${projectId}`,
      payload,
    );
    return res.data.data;
  },

  remove: async (projectId: string) => {
    const res = await api.delete<ApiResponse<null>>(`/projects/${projectId}`);
    return res.data;
  },

  syncLocal: async (projects: ProjectPayload[]) => {
    const res = await api.post<ApiResponse<Project[]>>("/projects/sync-local", {
      projects,
    });
    return res.data.data;
  },
} as const;
