"use client";
import Sidebar from "@/components/draw/Sidebar";
import dynamic from "next/dynamic";
import TopRightAuthActions from "@/components/auth/TopRightAuthActions";
import { useEditorWorkspace } from "@/hooks/useEditorWorkspace";

const ExcalidrawCanvas = dynamic(
  () => import("../components/draw/ExcalidrawWrapper"),
  {
    ssr: false,
  },
);

export default function Home() {
  const {
    user,
    isAuthenticated,
    editorProjects,
    activeProject,
    resolvedActiveProjectId,
    isSidebarOpen,
    sidebarWidth,
    minSidebarWidth,
    maxSidebarWidth,
    collapseSidebarWidth,
    setSidebarWidth,
    toggleSidebar,
    collapseSidebar,
    setActiveProjectId,
    isBusy,
    isSaving,
    handleSceneChange,
    handleCreateProject,
    handleRenameProject,
    handleDeleteProject,
  } = useEditorWorkspace();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-[#f7f6f3] text-[#2f2720] dark:bg-[#171717] dark:text-[#ece7de]">
      <div
        className="h-full w-full transition-[padding] duration-300 ease-in-out"
        style={{ paddingLeft: isSidebarOpen ? sidebarWidth : 0 }}
      >
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
        sidebarWidth={sidebarWidth}
        minSidebarWidth={minSidebarWidth}
        maxSidebarWidth={maxSidebarWidth}
        collapseThreshold={collapseSidebarWidth}
        onToggle={toggleSidebar}
        onResize={setSidebarWidth}
        onCollapse={collapseSidebar}
        activeProjectId={resolvedActiveProjectId}
        isAuthenticated={isAuthenticated}
        isBusy={isBusy}
        isSaving={isSaving}
        onCreateProject={handleCreateProject}
        onSelectProject={setActiveProjectId}
        onRenameProject={handleRenameProject}
        onDeleteProject={handleDeleteProject}
      />

      <TopRightAuthActions user={user} />
    </main>
  );
}
