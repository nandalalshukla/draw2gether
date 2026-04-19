"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SidebarProject = {
  id: string;
  title: string;
  updatedAt: string;
};

type SidebarProps = {
  projects: SidebarProject[];
  isOpen: boolean;
  sidebarWidth: number;
  minSidebarWidth: number;
  maxSidebarWidth: number;
  collapseThreshold: number;
  onToggle: () => void;
  onResize: (nextWidth: number) => void;
  onCollapse: () => void;
  activeProjectId: string | null;
  isAuthenticated: boolean;
  isBusy: boolean;
  isSaving: boolean;
  onCreateProject: () => void | Promise<void>;
  onSelectProject: (projectId: string) => void;
  onRenameProject: (
    projectId: string,
    nextTitle: string,
  ) => void | Promise<void>;
  onDeleteProject: (projectId: string) => void | Promise<void>;
};

export default function Sidebar({
  projects,
  isOpen,
  sidebarWidth,
  minSidebarWidth,
  maxSidebarWidth,
  collapseThreshold,
  onToggle,
  onResize,
  onCollapse,
  activeProjectId,
  isAuthenticated,
  isBusy,
  isSaving,
  onCreateProject,
  onSelectProject,
  onRenameProject,
  onDeleteProject,
}: SidebarProps) {
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  const startRename = useCallback((projectId: string, title: string) => {
    setEditingProjectId(projectId);
    setEditingTitle(title);
  }, []);

  const cancelRename = useCallback(() => {
    setEditingProjectId(null);
    setEditingTitle("");
  }, []);

  const saveRename = useCallback(
    async (projectId: string) => {
      const nextTitle = editingTitle.trim();
      if (!nextTitle) {
        cancelRename();
        return;
      }

      await onRenameProject(projectId, nextTitle);
      cancelRename();
    },
    [cancelRename, editingTitle, onRenameProject],
  );

  const handleResizeStart = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isOpen) {
        return;
      }

      event.preventDefault();

      const startX = event.clientX;
      const startWidth = sidebarWidth;
      let didCollapse = false;

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const cleanup = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", cleanup);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        resizeCleanupRef.current = null;
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const rawWidth = startWidth + deltaX;

        if (!didCollapse && rawWidth <= collapseThreshold) {
          didCollapse = true;
          onResize(Math.max(minSidebarWidth, collapseThreshold));
          onCollapse();
          cleanup();
          return;
        }

        const nextWidth = Math.min(
          maxSidebarWidth,
          Math.max(minSidebarWidth, rawWidth),
        );

        onResize(nextWidth);
      };

      resizeCleanupRef.current = cleanup;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", cleanup);
    },
    [
      collapseThreshold,
      isOpen,
      maxSidebarWidth,
      minSidebarWidth,
      onCollapse,
      onResize,
      sidebarWidth,
    ],
  );

  useEffect(() => {
    return () => {
      resizeCleanupRef.current?.();
    };
  }, []);

  return (
    <>
      <aside
        className={`absolute left-0 top-0 z-30 h-full border-r border-[#ddd6cb] bg-[#fcfbf8] dark:border-[#3a342e] dark:bg-[#212121] overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="p-3.5 border-b border-[#ddd6cb] dark:border-[#3a342e]">
          <button
            type="button"
            onClick={() => {
              void onCreateProject();
            }}
            className="w-full rounded-md bg-[#6e5436] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#584329] dark:bg-[#8b6a43] dark:hover:bg-[#a17a4d]"
          >
            + New Project
          </button>
        </div>

        <div className="h-[calc(100vh-8.25rem)] overflow-y-auto px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[#7a6c5d] dark:text-[#b9b0a5]">
              No projects yet. Create one to get started.
            </p>
          ) : (
            projects.map((project) => {
              const isEditing = editingProjectId === project.id;
              const isActive = activeProjectId === project.id;

              return (
                <div
                  key={project.id}
                  className={`mb-2 rounded-md border px-3 py-2.5 transition-colors ${
                    isActive
                      ? "border-[#ddd6cb] bg-[#efe6d8] dark:border-[#3a342e] dark:bg-[#342b22]"
                      : "border-[#ddd6cb] bg-transparent hover:bg-[#f2eee8] dark:border-[#3a342e] dark:hover:bg-[#2a2a2a]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    {isEditing ? (
                      <input
                        value={editingTitle}
                        onChange={(event) =>
                          setEditingTitle(event.target.value)
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            event.preventDefault();
                            void saveRename(project.id);
                          }

                          if (event.key === "Escape") {
                            event.preventDefault();
                            cancelRename();
                          }
                        }}
                        className="min-w-0 flex-1 rounded border border-[#ddd6cb] bg-white px-2 py-1 text-sm text-[#2f2720] outline-none focus:border-[#6e5436] dark:border-[#4a4a4a] dark:bg-[#3a3a3a] dark:text-[#ece7de] dark:focus:border-[#8b6a43]"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectProject(project.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-[13px] font-medium text-[#2f2720] dark:text-[#ece7de]">
                          {project.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#7a6c5d] dark:text-[#b9b0a5]">
                          Updated {new Date(project.updatedAt).toLocaleString()}
                        </p>
                      </button>
                    )}

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (isEditing) {
                            void saveRename(project.id);
                            return;
                          }

                          startRename(project.id, project.title);
                        }}
                        className="rounded p-1 text-[#2f2720] transition-colors hover:bg-[#e9e2d8] dark:text-[#ece7de] dark:hover:bg-[#2a2a2a]"
                        aria-label={
                          isEditing ? "Save project name" : "Rename project"
                        }
                      >
                        {isEditing ? (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M5 13L9 17L19 7"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M12 20H21"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M16.5 3.5C17.3284 2.67157 18.6716 2.67157 19.5 3.5V3.5C20.3284 4.32843 20.3284 5.67157 19.5 6.5L7 19L3 20L4 16L16.5 3.5Z"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </button>

                      {isEditing && (
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="rounded p-1 text-[#7a6c5d] transition-colors hover:bg-[#e9e2d8] dark:text-[#b9b0a5] dark:hover:bg-[#2a2a2a]"
                          aria-label="Cancel rename"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                          >
                            <path
                              d="M18 6L6 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                            <path
                              d="M6 6L18 18"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          cancelRename();
                          void onDeleteProject(project.id);
                        }}
                        className="rounded p-1 text-[#9e3d30] transition-colors hover:bg-[#f0ddd9] dark:text-[#d8a9a1] dark:hover:bg-[#3a2522]"
                        aria-label="Delete project"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-3.5 w-3.5"
                        >
                          <path
                            d="M3 6H21"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                          <path
                            d="M19 6L18.2 19.2C18.1368 20.2442 17.2718 21 16.2257 21H7.7743C6.7282 21 5.8632 20.2442 5.8 19.2L5 6"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="border-t border-[#ddd6cb] px-3 py-2 text-xs text-[#7a6c5d] dark:border-[#3a342e] dark:text-[#b9b0a5]">
          {isBusy
            ? "Syncing changes..."
            : isSaving
              ? "Saving..."
              : isAuthenticated
                ? "Auto-saved to database"
                : "Auto-saved locally"}
        </div>

        <div
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-[#ddd6cb]/35 dark:hover:bg-[#3a342e]/45"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize projects sidebar"
        />
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className="absolute top-1/2 z-40 -translate-y-1/2 rounded-r-md border-r border-y px-2 py-2 text-base leading-none transition-all duration-300 ease-in-out border-[#ddd6cb] bg-[#f2eee8] text-[#2f2720] hover:bg-[#e9e2d8] dark:border-[#3a342e] dark:bg-[#1d1d1d] dark:text-[#ece7de] dark:hover:bg-[#2a2a2a]"
        style={{ left: isOpen ? sidebarWidth : 0 }}
        aria-label={isOpen ? "Close projects sidebar" : "Open projects sidebar"}
      >
        {isOpen ? "<" : ">"}
      </button>
    </>
  );
}
