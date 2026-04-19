"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/providers/project-provider";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronRightIcon,
  CircleCheckBig,
  Construction,
  Hourglass,
  OctagonX,
  Trash2,
  User,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { createClient } from "@/utils/supabase/client";
import type { Database } from "@/types/supabase";

import AddTaskDialog from "./components/AddTaskDialog";
import EditMembers from "./components/EditMembers";

type ProjectTaskRow = Database["public"]["Tables"]["project_tasks"]["Row"];
const TASK_DELETE_HIGHLIGHT_MS = 500;

const page = () => {
  const { id } = useParams();
  const { profile } = useAuth();

  const {
    projectMembers,
    refreshProjectMembers,
    projects,
    refreshProjects,
    projectTasks,
    refreshProjectTasks,
    isLoading,
  } = useProjects();

  const { signedInUsers } = useAuth();

  const supabase = createClient();

  const taskStatuses: {
    label: string;
    color: string;
    key: string;
    icon: React.ReactNode;
  }[] = [
    {
      label: "Pending",
      color: "yellow-600",
      key: "pending",
      icon: <Hourglass className=" h-5 w-5 " />,
    },
    {
      label: "In Progress",
      color: "blue-700",
      key: "in_progress",
      icon: <Construction className=" h-5 w-5 " />,
    },
    {
      label: "Completed",
      color: "green-600",
      key: "completed",
      icon: <CircleCheckBig className=" h-5 w-5 " />,
    },
    {
      label: "Cancelled",
      color: "red-600",
      key: "cancelled",
      icon: <OctagonX className=" h-5 w-5 " />,
    },
  ];

  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [localProjectTasks, setLocalProjectTasks] = useState<
    ProjectTaskRow[] | null
  >(projectTasks);
  const [localStatusByTaskId, setLocalStatusByTaskId] = useState<
    Record<string, string>
  >({});
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null,
  );
  const [highlightedTaskStatus, setHighlightedTaskStatus] = useState<
    string | null
  >(null);
  const highlightTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const [projectMembersSignedIn, setProjectMembersSignedIn] = useState<
    string[]
  >([]);

  useEffect(() => {
    const projectMemberIds =
      projectMembers
        ?.filter((member) => member.project_id === id)
        .map((member) => member.member_id) || [];
    if (signedInUsers) {
      const onlineProjectMemberIds = signedInUsers.filter((userId) =>
        projectMemberIds.includes(userId),
      );
      setProjectMembersSignedIn(onlineProjectMemberIds);
    }
    else {      setProjectMembersSignedIn([]);
    }
  }, [projectMembers, signedInUsers]);

  useEffect(() => {
    setLocalProjectTasks(projectTasks);
  }, [projectTasks]);

  const scrollToTaskCard = (taskId: string) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const taskCard = document.getElementById(`task-card-${taskId}`);
        taskCard?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
    });
  };

  const highlightTask = (taskId: string, status: string) => {
    setHighlightedTaskId(taskId);
    setHighlightedTaskStatus(status);

    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }

    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedTaskId(null);
      setHighlightedTaskStatus(null);
    }, 1500);
  };

  const handleTaskAdded = (task: ProjectTaskRow) => {
    setLocalProjectTasks((prevTasks) =>
      prevTasks ? prevTasks.concat(task) : [task],
    );
    setLocalStatusByTaskId((prev) => ({ ...prev, [task.id]: task.status }));
    highlightTask(task.id, task.status);
    scrollToTaskCard(task.id);
  };

  const handleTaskDelete = async (taskId: string) => {
    highlightTask(taskId, "cancelled");
    scrollToTaskCard(taskId);

    await new Promise((resolve) => {
      setTimeout(resolve, TASK_DELETE_HIGHLIGHT_MS);
    });

    setLocalProjectTasks(
      (prevTasks) => prevTasks?.filter((task) => task.id !== taskId) || null,
    );

    const { error } = await supabase
      .from("project_tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
    }

    refreshProjectTasks();
  };

  useEffect(() => {
    return () => {
      if (highlightTimeoutRef.current) {
        clearTimeout(highlightTimeoutRef.current);
      }
    };
  }, []);

  const handleTaskUpdate = async (taskId: string, newStatus: string) => {
    const previousStatus =
      localStatusByTaskId[taskId] ||
      localProjectTasks?.find((task) => task.id === taskId)?.status ||
      "pending";

    // Optimistic update so the UI re-sorts immediately.
    setLocalStatusByTaskId((prev) => ({ ...prev, [taskId]: newStatus }));
    setOpenTaskId(null);
    highlightTask(taskId, newStatus);
    scrollToTaskCard(taskId);

    const { error } = await supabase
      .from("project_tasks")
      .update({ status: newStatus })
      .eq("id", taskId);

    if (error) {
      console.error("Error updating task status:", error);
      setLocalStatusByTaskId((prev) => ({ ...prev, [taskId]: previousStatus }));
      setHighlightedTaskId(null);
      setHighlightedTaskStatus(null);
      return;
    }

    refreshProjectTasks();
  };

  if (isLoading) {
    return (
      <div className=" w-full h-full flex justify-center items-center ">
        <Spinner />
      </div>
    );
  }
  return !isLoading &&
    projects?.find((project) => project.project_id === id) === null ? (
    <Card className="p-45 min-h-fit w-9/10 self-center">
      <CardTitle className="text-destructive text-2xl ">
        Project Not Found
      </CardTitle>
      <CardDescription>
        The project you are looking for does not exist.
      </CardDescription>
    </Card>
  ) : (
    <div className=" py-10 flex flex-col gap-5 ">
      <Card className="px-45 min-h-fit py-20 w-9/10 self-center">
        <CardTitle className=" text-2xl ">
          Protect Title:{" "}
          {projects?.find((project) => project.project_id === id)?.project_name}
        </CardTitle>
        <h2 className=" text-lg font-semibold  ">
          Project Manager:{" "}
          {projects?.find((project) => project.project_id === id)
            ?.manager_display_name ||
            projects?.find((project) => project.project_id === id)
              ?.manager_username ||
            "No Manager"}
        </h2>
        <span>
          {projectMembers?.filter((member) => member.project_id === id)
            .length === 0
            ? "You Are Not A Member Of This Project"
            : `${projectMembers?.filter((member) => member.project_id === id).length} members | ${projectMembersSignedIn.length} users online`}
        </span>
        <div className=" flex flex-wrap gap-2">
          {taskStatuses.map((status, idx) => (
            <div key={status.key} className=" flex items-center gap-2 ">
              {idx !== 0 && (
                <span className=" text-forefround h-full flex items-center justify-center font-semibold ">
                  |
                </span>
              )}
              <div
                key={status.key}
                className=" flex items-center gap-2 justify-center "
              >
                <div
                  className={`text-${status.color} w-6 h-6 flex items-center justify-center`}
                >
                  {status.icon}
                </div>
                <span className={`text-sm text-${status.color}`}>
                  {status.label}{" "}
                  {localProjectTasks
                    ?.filter((task) => task.project_id === id)
                    .filter((task) => task.status === status.key).length || 0}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className=" grid grid-cols-6 w-9/10 mt-5 gap-5 self-center">
        <Card className=" px-10 py-5 col-span-4">
          <CardHeader className="p-0">
            {projects?.filter((member) => member.project_id === id)[0]
              .manager_username === profile?.username ? (
              <CardAction>
                <AddTaskDialog onTaskAdded={handleTaskAdded} />
              </CardAction>
            ) : null}
            <CardTitle className=" text-lg font-semibold  ">
              Project Tasks:
            </CardTitle>
          </CardHeader>
          {localProjectTasks?.filter((task) => task.project_id === id)
            ?.length === 0 && <span>No tasks in this project.</span>}
          {localProjectTasks
            ?.filter((task) => task.project_id === id)
            .sort((a, b) => {
              const statusOrder: { [key: string]: number } = {
                in_progress: 1,
                pending: 2,
                completed: 3,
                cancelled: 4,
              };
              const aStatus = localStatusByTaskId[a.id] || a.status;
              const bStatus = localStatusByTaskId[b.id] || b.status;
              const statusDiff =
                (statusOrder[aStatus] || 99) - (statusOrder[bStatus] || 99);

              if (statusDiff !== 0) {
                return statusDiff;
              }

              const aCreatedAt = a.created_at
                ? new Date(a.created_at).getTime()
                : 0;
              const bCreatedAt = b.created_at
                ? new Date(b.created_at).getTime()
                : 0;

              return aCreatedAt - bCreatedAt;
            })
            .map((task) => (
              <Card
                key={task.id}
                id={`task-card-${task.id}`}
                className={` flex flex-col gap-2 p-2 transition-colors duration-500 ${
                  highlightedTaskId === task.id
                    ? highlightedTaskStatus === "pending"
                      ? "bg-yellow-600/20"
                      : highlightedTaskStatus === "in_progress"
                        ? "bg-blue-600/20"
                        : highlightedTaskStatus === "completed"
                          ? "bg-green-600/20"
                          : highlightedTaskStatus === "cancelled"
                            ? "bg-red-600/20"
                            : ""
                    : ""
                }`}
              >
                {(() => {
                  const taskStatus =
                    localStatusByTaskId[task.id] || task.status;

                  return (
                    <>
                      <CardHeader className="p-0 flex-row items-start justify-between ">
                        <CardTitle
                          className={`flex gap-1 justify-start items-center`}
                        >
                          <span
                            className={`  ${taskStatus === "pending" ? "text-yellow-600" : taskStatus === "in_progress" ? "text-blue-700" : taskStatus === "completed" ? "text-green-600" : taskStatus === "cancelled" ? "text-red-600" : ""}`}
                          >
                            {taskStatus === "pending" ? (
                              <Hourglass className=" w-4 h-4 " />
                            ) : taskStatus === "in_progress" ? (
                              <Construction className=" w-4 h-4 " />
                            ) : taskStatus === "completed" ? (
                              <CircleCheckBig className=" w-4 h-4 " />
                            ) : taskStatus === "cancelled" ? (
                              <OctagonX className=" w-4 h-4 " />
                            ) : (
                              ""
                            )}
                          </span>
                          {task.task_title}
                        </CardTitle>
                        {projects?.filter(
                          (member) => member.project_id === id,
                        )[0].manager_username === profile?.username ? (
                          <CardAction>
                            <Button
                              variant={"destructive"}
                              size={"icon-lg"}
                              className="cursor-pointer"
                              onClick={() => handleTaskDelete(task.id)}
                            >
                              <Trash2 />
                            </Button>
                          </CardAction>
                        ) : null}
                      </CardHeader>
                      <CardDescription>{task.task_description}</CardDescription>
                      <Collapsible
                        className="group/collapsible"
                        open={openTaskId === task.id}
                        onOpenChange={(isOpen) =>
                          setOpenTaskId(isOpen ? task.id : null)
                        }
                      >
                        <CollapsibleTrigger
                          asChild
                          className=" text-sm text-primary/80 group-data-[state=open]/collapsible:text-primary"
                        >
                          <Button
                            variant={"outline"}
                            size={"sm"}
                            className="w-full hover:bg-primary/10 "
                          >
                            {taskStatus
                              ?.split("_")
                              .map(
                                (word) =>
                                  word[0]?.toUpperCase() +
                                  word.slice(1).toLowerCase(),
                              )
                              .join(" ")}
                            <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className=" mt-2 flex flex-col gap-2 bg-accent p-2 rounded-md">
                          <Button
                            disabled={taskStatus === "pending"}
                            variant={"outline"}
                            onClick={() => handleTaskUpdate(task.id, "pending")}
                            className=" hover:text-primary "
                          >
                            Pending
                          </Button>
                          <Button
                            disabled={taskStatus === "in_progress"}
                            variant={"outline"}
                            onClick={() =>
                              handleTaskUpdate(task.id, "in_progress")
                            }
                            className=" hover:text-primary "
                          >
                            In Progress
                          </Button>
                          <Button
                            disabled={taskStatus === "completed"}
                            variant={"outline"}
                            onClick={() =>
                              handleTaskUpdate(task.id, "completed")
                            }
                            className=" hover:text-primary "
                          >
                            Completed
                          </Button>
                          <Button
                            disabled={taskStatus === "cancelled"}
                            variant={"outline"}
                            onClick={() =>
                              handleTaskUpdate(task.id, "cancelled")
                            }
                            className=" hover:text-destructive "
                          >
                            Cancelled
                          </Button>
                        </CollapsibleContent>
                      </Collapsible>
                    </>
                  );
                })()}
              </Card>
            ))}
        </Card>
        <Card className=" px-10 py-5 col-span-2">
          <CardHeader className="p-0">
            {projects?.filter((member) => member.project_id === id)[0]
              .manager_username === profile?.username ? (
              <CardAction>
                <EditMembers />
              </CardAction>
            ) : null}
            <CardTitle className=" text-lg font-semibold  ">
              Project Members:
            </CardTitle>
          </CardHeader>
          {projectMembers?.filter((member) => member.project_id === id)
            ?.length === 0 && <span>No members in this project.</span>}
          {projectMembers
            ?.filter((member) => member.project_id === id).sort((a, b) => {
              const aSignedIn =
                a.member_id !== null &&
                projectMembersSignedIn.includes(a.member_id);
              const bSignedIn =
                b.member_id !== null &&
                projectMembersSignedIn.includes(b.member_id);
              if (aSignedIn && !bSignedIn) return -1;
              if (!aSignedIn && bSignedIn) return 1;
              return 0;
            })
            .map((member) => (
              <Card key={member.member_id} className={`flex flex-col gap-2 p-2 ${member.member_id !== null && projectMembersSignedIn.includes(member.member_id) ? "bg-green-600/10" : ""}`}>
                <span className=" font-medium flex items-center gap-2 p-2">
                  <img
                    src={
                      member.avatar_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(member.display_name || member.username || "User")}&background=random&color=fff`
                    }
                    alt="Avatar"
                    className="w-8 h-8 rounded-full"
                  />
                  {member.display_name || member.username || "No Name"}
                </span>
                <div>
                  {member.member_id !== null &&
                  projectMembersSignedIn.includes(member.member_id) ? (
                    <span className=" text-green-600 p-2 text-sm flex items-center gap-1 ">
                      <CheckCircle className="w-4 h-4" />
                      Signed In
                    </span>
                  ) : (
                    <span className=" text-muted-foreground p-2 text-sm flex items-center gap-1 ">
                      <User className="w-4 h-4" />
                      Not Signed In
                    </span>
                  )}

                </div>
              </Card>
            ))}
        </Card>
      </div>
    </div>
  );
};

export default page;
