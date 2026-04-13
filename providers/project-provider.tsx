"use client";

import { useContext, useState, useEffect, createContext } from "react";

import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { Database } from "@/types/supabase";

const supabase = createClient();

type ProjectsContextValue = {
  projects:
    | Database["public"]["Views"]["project_details_with_managers"]["Row"][]
    | null;
  isLoading: boolean;
  refreshProjects: () => Promise<void>;
  projectMembers:
    | Database["public"]["Views"]["project_member_details"]["Row"][]
    | null;
  refreshProjectMembers: () => Promise<void>;
  projectTasks:
    | Database["public"]["Tables"]["project_tasks"]["Row"][]
    | null;
  refreshProjectTasks: () => Promise<void>;
};

const ProjectsContext = createContext<ProjectsContextValue | undefined>(
  undefined,
);

export function ProjectsProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();
  const [projects, setProjects] =
    useState<ProjectsContextValue["projects"]>(null);
  const [projectMembers, setProjectMembers] =
    useState<ProjectsContextValue["projectMembers"]>(null);
  const [projectTasks, setProjectTasks] =
    useState<ProjectsContextValue["projectTasks"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProjects = async () => {
    if (!session) {
      setProjects(null);
      setIsLoading(false);
      return;
    }
    supabase
      .from("project_details_with_managers")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching projects:", error);
        } else {
          setProjects(data);
        }
        setIsLoading(false);
      });
  };

  const refreshProjectMembers = async () => {
    if (!session) {
      setProjectMembers(null);
      setIsLoading(false);
      return;
    }
    supabase
      .from("project_member_details")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching project members:", error);
        } else {
          const loggedInMemberOfProjects = data.filter(
            (member) => member.member_id === session.user.id,
          );
          const usersInLoggedInMemberOfProjects = data.filter((member) =>
            loggedInMemberOfProjects.some(
              (loggedInMember) =>
                loggedInMember.project_id === member.project_id,
            ),
          );
          setProjectMembers(usersInLoggedInMemberOfProjects);
          console.log(
            "Project members for logged in user:",
            usersInLoggedInMemberOfProjects,
          );
        }
        setIsLoading(false);
      });
  };

  const refreshProjectTasks = async () => {
    if (!session) {
      setProjectTasks(null);
      setIsLoading(false);
      return;
    }
    supabase
      .from("project_tasks")
      .select("*")
      .then(({ data, error }) => {
        if (error) {
          console.error("Error fetching project tasks:", error);
        } else {
          console.log("Project tasks for logged in user:", data);
          setProjectTasks(data);
        }
        setIsLoading(false);
      });
  };

  useEffect(() => {
    refreshProjects();
    refreshProjectMembers();
    refreshProjectTasks();
  }, [session]);

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        isLoading,
        refreshProjects,
        projectMembers,
        refreshProjectMembers,
        projectTasks,
        refreshProjectTasks,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (context === undefined) {
    throw new Error("useProjects must be used within a ProjectsProvider");
  }
  return context;
};
