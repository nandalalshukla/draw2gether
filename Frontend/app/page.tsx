"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ProfileDropdown from "@/components/ProfileDropdown";
import { useAuthStore } from "@/stores/auth.store";
import {
  clearLocalProjects,
  createEmptySceneData,
  readLocalProjects,
  toProjectPayloads,
  writeLocalProjects,
  type LocalProject,
} from "@/lib/localProjects";
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useSyncLocalProjects,
  useUpdateProject,
} from "@/hooks/useProjects";
import type { Project, ProjectSceneData } from "@/types/project.types";
import Sidebar from "@/components/draw/Sidebar";
import dynamic from "next/dynamic";
const ExcalidrawCanvas = dynamic(
  () => import("../components/draw/ExcalidrawWrapper"),
  {
    ssr: false,
  },
);

type EditorProject = {
  id: string;
  title: string;
  sceneData: ProjectSceneData;
  createdAt: string;
  updatedAt: string;
};

function sanitizeAppState(appState: unknown): Record<string, unknown> {
  if (!appState || typeof appState !== "object") {
    return {};
  }

  const source = appState as Record<string, unknown>;
  const { collaborators, ...rest } = source;
  void collaborators;

  return rest;
}

function normalizeSceneData(sceneData: unknown): ProjectSceneData {
  if (!sceneData || typeof sceneData !== "object") {
    return createEmptySceneData();
  }

  const source = sceneData as Record<string, unknown>;
  return {
    elements: Array.isArray(source.elements) ? source.elements : [],
    appState: sanitizeAppState(source.appState),
    files:
      source.files && typeof source.files === "object"
        ? (source.files as Record<string, unknown>)
        : {},
  };
}

function mapRemoteProject(project: Project): EditorProject {
  return {
    id: project.id,
    title: project.title,
    sceneData: normalizeSceneData(project.sceneData),
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
  };
}

function createLocalProject(title?: string): LocalProject {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    title: title ?? "Untitled Project",
    sceneData: createEmptySceneData(),
    createdAt: now,
    updatedAt: now,
  };
}

export default function Home() {
  const [localProjects, setLocalProjects] = useState<LocalProject[]>(() => {
    const storedProjects = readLocalProjects();
    if (storedProjects.length > 0) {
      return storedProjects;
    }

    const initialProject = createLocalProject();
    writeLocalProjects([initialProject]);
    return [initialProject];
  });
  const [activeProjectId, setActiveProjectId] = useState<string | null>(() => {
    const storedProjects = readLocalProjects();
    return storedProjects[0]?.id ?? null;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = Boolean(user);

  const syncInFlightRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: remoteProjects = [], isFetching: isLoadingRemoteProjects } =
    useProjects(isAuthenticated);
  const createProjectMutation = useCreateProject();
  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const syncLocalProjectsMutation = useSyncLocalProjects();

  const editorProjects = useMemo<EditorProject[]>(() => {
    if (isAuthenticated) {
      return remoteProjects.map(mapRemoteProject);
    }

    return localProjects.map((project) => ({
      id: project.id,
      title: project.title,
      sceneData: normalizeSceneData(project.sceneData),
      createdAt: project.createdAt,
      updatedAt: project.updatedAt,
    }));
  }, [isAuthenticated, localProjects, remoteProjects]);

  const resolvedActiveProjectId = useMemo(() => {
    if (editorProjects.length === 0) {
      return null;
    }

    const hasSelected = editorProjects.some(
      (project) => project.id === activeProjectId,
    );
    return hasSelected ? activeProjectId : editorProjects[0].id;
  }, [activeProjectId, editorProjects]);

  const activeProject = useMemo(
    () =>
      editorProjects.find(
        (project) => project.id === resolvedActiveProjectId,
      ) ?? null,
    [editorProjects, resolvedActiveProjectId],
  );

  useEffect(() => {
    if (!isAuthenticated) {
      syncInFlightRef.current = false;
      return;
    }

    if (syncInFlightRef.current || localProjects.length === 0) {
      return;
    }

    syncInFlightRef.current = true;
    const payloads = toProjectPayloads(localProjects);

    syncLocalProjectsMutation.mutate(payloads, {
      onSuccess: () => {
        clearLocalProjects();
        setLocalProjects([]);
      },
      onSettled: () => {
        syncInFlightRef.current = false;
      },
    });
  }, [isAuthenticated, localProjects, syncLocalProjectsMutation]);

  const persistGuestProject = useCallback(
    (projectId: string, nextSceneData: ProjectSceneData) => {
      setLocalProjects((currentProjects) => {
        const now = new Date().toISOString();
        const updatedProjects = currentProjects.map((project) =>
          project.id === projectId
            ? { ...project, sceneData: nextSceneData, updatedAt: now }
            : project,
        );

        writeLocalProjects(updatedProjects);
        return updatedProjects;
      });
    },
    [],
  );

  const persistAuthenticatedProject = useCallback(
    (projectId: string, nextSceneData: ProjectSceneData) => {
      updateProjectMutation.mutate({
        projectId,
        payload: { sceneData: nextSceneData },
      });
    },
    [updateProjectMutation],
  );

  const handleSceneChange = useCallback(
    (elements: readonly unknown[], appState: unknown, files: unknown) => {
      if (!resolvedActiveProjectId) {
        return;
      }

      const nextSceneData: ProjectSceneData = {
        elements: [...elements],
        appState: sanitizeAppState(appState),
        files:
          files && typeof files === "object"
            ? (files as Record<string, unknown>)
            : {},
      };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(() => {
        if (isAuthenticated) {
          persistAuthenticatedProject(resolvedActiveProjectId, nextSceneData);
        } else {
          persistGuestProject(resolvedActiveProjectId, nextSceneData);
        }
      }, 800);
    },
    [
      isAuthenticated,
      persistAuthenticatedProject,
      persistGuestProject,
      resolvedActiveProjectId,
    ],
  );

  const handleCreateProject = useCallback(async () => {
    const title = `Project ${editorProjects.length + 1}`;

    if (isAuthenticated) {
      const created = await createProjectMutation.mutateAsync({
        title,
        sceneData: createEmptySceneData(),
      });
      setActiveProjectId(created.id);
      return;
    }

    const project = createLocalProject(title);
    setLocalProjects((currentProjects) => {
      const nextProjects = [project, ...currentProjects];
      writeLocalProjects(nextProjects);
      return nextProjects;
    });
    setActiveProjectId(project.id);
  }, [createProjectMutation, editorProjects.length, isAuthenticated]);

  const handleRenameProject = useCallback(
    async (projectId: string, rawTitle: string) => {
      const project = editorProjects.find((item) => item.id === projectId);
      if (!project) {
        return;
      }

      const nextTitle = rawTitle.trim();

      if (!nextTitle || nextTitle === project.title) {
        return;
      }

      if (isAuthenticated) {
        await updateProjectMutation.mutateAsync({
          projectId,
          payload: { title: nextTitle },
        });
        return;
      }

      setLocalProjects((currentProjects) => {
        const now = new Date().toISOString();
        const nextProjects = currentProjects.map((item) =>
          item.id === projectId
            ? { ...item, title: nextTitle, updatedAt: now }
            : item,
        );

        writeLocalProjects(nextProjects);
        return nextProjects;
      });
    },
    [editorProjects, isAuthenticated, updateProjectMutation],
  );

  const handleDeleteProject = useCallback(
    async (projectId: string) => {
      if (isAuthenticated) {
        await deleteProjectMutation.mutateAsync(projectId);
        return;
      }

      setLocalProjects((currentProjects) => {
        const nextProjects = currentProjects.filter(
          (project) => project.id !== projectId,
        );

        if (nextProjects.length === 0) {
          const fallbackProject = createLocalProject();
          writeLocalProjects([fallbackProject]);
          setActiveProjectId(fallbackProject.id);
          return [fallbackProject];
        }

        writeLocalProjects(nextProjects);

        if (projectId === resolvedActiveProjectId) {
          setActiveProjectId(nextProjects[0].id);
        }

        return nextProjects;
      });
    },
    [deleteProjectMutation, isAuthenticated, resolvedActiveProjectId],
  );

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  const isBusy =
    isLoadingRemoteProjects ||
    syncLocalProjectsMutation.isPending ||
    createProjectMutation.isPending ||
    deleteProjectMutation.isPending;

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#f7f6f3] text-[#2f2720] dark:bg-[#171717] dark:text-[#ece7de]">
      <div className="h-full w-full">
        <ExcalidrawCanvas
          sceneData={activeProject?.sceneData ?? null}
          onSceneChange={handleSceneChange}
        />
      </div>

      <Sidebar
        projects={editorProjects.map((project) => ({
          id: project.id,
          title: project.title,
          updatedAt: project.updatedAt,
        }))}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen((current) => !current)}
        activeProjectId={resolvedActiveProjectId}
        isAuthenticated={isAuthenticated}
        isBusy={isBusy}
        isSaving={updateProjectMutation.isPending}
        onCreateProject={handleCreateProject}
        onSelectProject={setActiveProjectId}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />

      <div className="fixed top-5 right-40 z-100 flex items-center gap-2">
        {user ? (
          <ProfileDropdown />
        ) : (
          <div className="flex items-center gap-5">
            <Link href="/login" className="excalidraw-ink-link">
              Login
            </Link>
            <Link href="/register" className="excalidraw-ink-link">
              Register
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
