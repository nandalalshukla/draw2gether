import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { projectsApi } from "@/lib/projects.api";
import type { Project, ProjectPayload } from "@/types/project.types";

const PROJECTS_QUERY_KEY = ["projects"] as const;

interface ApiErrorResponse {
  message?: string;
}

function getErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;
    return data?.message ?? error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export function useProjects(enabled: boolean) {
  return useQuery({
    queryKey: PROJECTS_QUERY_KEY,
    queryFn: projectsApi.list,
    enabled,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: ProjectPayload) => projectsApi.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData<Project[]>(
        PROJECTS_QUERY_KEY,
        (existing = []) => [created, ...existing],
      );
      toast.success("Project created");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      payload,
    }: {
      projectId: string;
      payload: Partial<ProjectPayload>;
    }) => projectsApi.update(projectId, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, (existing = []) =>
        existing.map((project) =>
          project.id === updated.id ? updated : project,
        ),
      );
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => projectsApi.remove(projectId),
    onSuccess: (_result, deletedId) => {
      queryClient.setQueryData<Project[]>(PROJECTS_QUERY_KEY, (existing = []) =>
        existing.filter((project) => project.id !== deletedId),
      );
      toast.success("Project deleted");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}

export function useSyncLocalProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projects: ProjectPayload[]) => projectsApi.syncLocal(projects),
    onSuccess: () => {
      queryClient
        .invalidateQueries({ queryKey: PROJECTS_QUERY_KEY })
        .catch(() => {
          // Intentionally ignored: stale list will refresh on next navigation/reload.
        });
      toast.success("Offline projects synced");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });
}
