"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type WorkspaceSettings = {
  id: number;
  business_name: string;
  business_type: string | null;
  owner_name: string | null;
  currency: string | null;
  timezone: string | null;
  user_id: string;
};

type WorkspaceContextType = {
  workspaceSettings: WorkspaceSettings | null;
  loadingWorkspace: boolean;
  refreshWorkspaceSettings: () => Promise<void>;
};

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(
  undefined
);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaceSettings, setWorkspaceSettings] =
    useState<WorkspaceSettings | null>(null);

  const [loadingWorkspace, setLoadingWorkspace] = useState(true);

  async function refreshWorkspaceSettings() {
    setLoadingWorkspace(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setWorkspaceSettings(null);
      setLoadingWorkspace(false);
      return;
    }

    const { data, error } = await supabase
      .from("workspace_settings")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      console.log("WORKSPACE CONTEXT ERROR:", error);
      setLoadingWorkspace(false);
      return;
    }

    setWorkspaceSettings(data);
    setLoadingWorkspace(false);
  }

  useEffect(() => {
    refreshWorkspaceSettings();
  }, []);

  return (
    <WorkspaceContext.Provider
      value={{
        workspaceSettings,
        loadingWorkspace,
        refreshWorkspaceSettings,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error("useWorkspace must be used inside WorkspaceProvider");
  }

  return context;
}