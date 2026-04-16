"use client";

import { useEffect } from "react";
import { Excalidraw } from "@excalidraw/excalidraw";

export default function ExcalidrawWrapper() {
  useEffect(() => {
    (
      window as Window & { EXCALIDRAW_ASSET_PATH?: string }
    ).EXCALIDRAW_ASSET_PATH = window.location.origin;
  }, []);

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <Excalidraw
        theme="dark"
        initialData={{
          appState: {
            viewModeEnabled: false,
            zenModeEnabled: false,
          },
        }}
      />
    </div>
  );
}
