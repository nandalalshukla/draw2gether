"use client";

import { useEffect, useState } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";
import type { ProjectSceneData } from "@/types/project.types";

type MinimalExcalidrawApi = {
  updateScene: (scene: {
    elements: readonly unknown[];
    appState?: Record<string, unknown>;
    files?: Record<string, unknown>;
  }) => void;
};

function hasUpdateSceneApi(value: unknown): value is MinimalExcalidrawApi {
  return Boolean(
    value &&
    typeof value === "object" &&
    "updateScene" in value &&
    typeof (value as { updateScene?: unknown }).updateScene === "function",
  );
}

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
    return {
      elements: [],
      appState: {},
      files: {},
    };
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

type ExcalidrawWrapperProps = {
  sceneData: ProjectSceneData | null;
  onSceneChange: (
    elements: readonly unknown[],
    appState: unknown,
    files: unknown,
  ) => void;
};

export default function ExcalidrawWrapper({
  sceneData,
  onSceneChange,
}: ExcalidrawWrapperProps) {
  const [excalidrawApi, setExcalidrawApi] = useState<unknown>(null);

  useEffect(() => {
    (
      window as Window & { EXCALIDRAW_ASSET_PATH?: string }
    ).EXCALIDRAW_ASSET_PATH = window.location.origin;
  }, []);

  useEffect(() => {
    if (!hasUpdateSceneApi(excalidrawApi) || !sceneData) {
      return;
    }

    const normalized = normalizeSceneData(sceneData);

    excalidrawApi.updateScene({
      elements: normalized.elements as never[],
      appState: normalized.appState,
      files: normalized.files,
    });
  }, [sceneData, excalidrawApi]);

  return (
    <div className="h-full w-full">
      <Excalidraw
        excalidrawAPI={(api) => setExcalidrawApi(api)}
        onChange={onSceneChange}
        UIOptions={{
          canvasActions: {
            saveToActiveFile: false,
            loadScene: false,
          },
        }}
      />
    </div>
  );
}
