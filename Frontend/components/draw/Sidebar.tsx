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
      let latestRawWidth = startWidth;

      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";

      const cleanup = () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
        document.body.style.userSelect = "";
        document.body.style.cursor = "";
        resizeCleanupRef.current = null;
      };

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const deltaX = moveEvent.clientX - startX;
        const rawWidth = startWidth + deltaX;
        latestRawWidth = rawWidth;

        const nextWidth = Math.min(
          maxSidebarWidth,
          Math.max(minSidebarWidth, rawWidth),
        );

        onResize(nextWidth);
      };

      const handleMouseUp = () => {
        if (latestRawWidth <= collapseThreshold) {
          onResize(Math.max(minSidebarWidth, collapseThreshold));
          onCollapse();
        } else {
          onResize(
            Math.min(
              maxSidebarWidth,
              Math.max(minSidebarWidth, latestRawWidth),
            ),
          );
        }

        cleanup();
      };

      resizeCleanupRef.current = cleanup;
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
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
        className={`absolute left-0 top-0 z-30 h-full border-r border-[rgba(186,200,221,0.75)] bg-[rgba(245,248,255,0.72)] dark:border-[rgba(73,88,114,0.75)] dark:bg-[rgba(14,22,36,0.72)] backdrop-blur-xl overflow-hidden transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: sidebarWidth }}
      >
        <div className="p-3.5 border-b border-[rgba(186,200,221,0.75)] dark:border-[rgba(73,88,114,0.75)]">
          <button
            type="button"
            onClick={() => {
              void onCreateProject();
            }}
            className="w-full rounded-xl bg-linear-to-r from-[#4f7cff] to-[#6aa4ff] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(79,124,255,0.25)] transition-all hover:from-[#426ef2] hover:to-[#5a94f2] dark:from-[#5b86ff] dark:to-[#6e9dff] dark:hover:from-[#6b95ff] dark:hover:to-[#7ba8ff]"
          >
            + New Project
          </button>
        </div>

        <div className="h-[calc(100vh-8.25rem)] overflow-y-auto px-2.5 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.length === 0 ? (
            <p className="px-2 py-3 text-sm text-[#58708f] dark:text-[#9db0c7]">
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
                      ? "border-[rgba(128,159,222,0.65)] bg-[rgba(198,221,255,0.45)] dark:border-[rgba(93,127,193,0.65)] dark:bg-[rgba(39,58,90,0.5)]"
                      : "border-[rgba(186,200,221,0.55)] bg-[rgba(255,255,255,0.28)] hover:bg-[rgba(227,239,255,0.45)] dark:border-[rgba(73,88,114,0.65)] dark:bg-[rgba(20,30,48,0.3)] dark:hover:bg-[rgba(37,51,78,0.55)]"
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
                        className="min-w-0 flex-1 rounded border border-[rgba(176,196,223,0.9)] bg-[rgba(255,255,255,0.85)] px-2 py-1 text-sm text-[#1d3552] outline-none focus:border-[#5b8bd8] dark:border-[rgba(81,101,133,0.9)] dark:bg-[rgba(30,44,68,0.85)] dark:text-[#e4edf9] dark:focus:border-[#7ca7ef]"
                        autoFocus
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSelectProject(project.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <p className="truncate text-[13px] font-medium text-[#223a56] dark:text-[#e4edf9]">
                          {project.title}
                        </p>
                        <p className="mt-0.5 text-[11px] text-[#58708f] dark:text-[#9db0c7]">
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
                        className="rounded p-1 text-[#36557b] transition-colors hover:bg-[rgba(172,204,247,0.35)] dark:text-[#b9d4ff] dark:hover:bg-[rgba(70,96,140,0.45)]"
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
                          className="rounded p-1 text-[#6c7f95] transition-colors hover:bg-[rgba(172,204,247,0.35)] dark:text-[#97abc2] dark:hover:bg-[rgba(70,96,140,0.45)]"
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
                        className="rounded p-1 text-[#b14f52] transition-colors hover:bg-[rgba(241,169,176,0.25)] dark:text-[#f0a8ae] dark:hover:bg-[rgba(148,67,79,0.4)]"
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

        <div className="border-t border-[rgba(186,200,221,0.75)] px-3 py-2 text-xs text-[#58708f] dark:border-[rgba(73,88,114,0.75)] dark:text-[#9db0c7]">
          {isBusy
            ? "Syncing changes..."
            : isSaving
              ? "Saving..."
              : isAuthenticated
                ? "Auto-saved to database"
                : "Auto-saved locally"}
        </div>

        <div
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent hover:bg-[rgba(130,164,214,0.38)] dark:hover:bg-[rgba(87,116,170,0.45)]"
          onMouseDown={handleResizeStart}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize projects sidebar"
        />
      </aside>

      <button
        type="button"
        onClick={onToggle}
        className="absolute top-1/2 z-40 -translate-y-1/2 rounded-r-md border-r border-y px-2 py-2 text-base leading-none transition-all duration-300 ease-in-out border-[rgba(186,200,221,0.8)] bg-[rgba(239,246,255,0.86)] text-[#36557b] hover:bg-[rgba(215,231,253,0.95)] dark:border-[rgba(73,88,114,0.85)] dark:bg-[rgba(26,39,59,0.9)] dark:text-[#b9d4ff] dark:hover:bg-[rgba(39,56,84,0.95)]"
        style={{ left: isOpen ? sidebarWidth : 0 }}
        aria-label={isOpen ? "Close projects sidebar" : "Open projects sidebar"}
      >
        {isOpen ? "<" : ">"}
      </button>
    </>
  );
}
