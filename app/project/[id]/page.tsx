"use client";

import { useParams } from "next/navigation";
import { useProjects } from "@/providers/project-provider";
import { useEffect } from "react";
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
  Plus,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { createClient } from "@/utils/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const page = () => {
  const { id } = useParams();
  const { profile } = useAuth();
  const addTask = () => {
    console.log("Add task clicked");
  };
  const {
    projectMembers,
    refreshProjectMembers,
    projects,
    refreshProjects,
    projectTasks,
    refreshProjectTasks,
    isLoading,
  } = useProjects();

  const supabase = createClient();

  const handleTaskUpdate = (taskId: string, newStatus: string) => {
    // Implement the logic to update the task status in your database
    console.log(`Updating task ${taskId} to status: ${newStatus}`);
    supabase
      .from("project_tasks")
      .update({ status: newStatus })
      .eq("id", taskId)
      .then(
        ({ data, error }) => {
          if (error) {
            console.error("Error updating task status:", error);
          } else {
            refreshProjectTasks();
          }
        },
        // After updating the task status, refresh the project tasks to reflect the changes
      );
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
            : `${projectMembers?.filter((member) => member.project_id === id).length} members`}
        </span>
      </Card>
      <div className=" grid grid-cols-6 w-9/10 mt-5 gap-5 self-center">
        <Card className=" px-10 py-5 col-span-4">
          <CardHeader className="p-0">
            {projects?.filter((member) => member.project_id === id)[0]
              .manager_username === profile?.username ? (
              <CardAction>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      onClick={addTask}
                      variant={"outline"}
                      size={"icon-lg"}
                      className=" hover:bg-primary/10 cursor-pointer "
                    >
                      <Plus />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Task</DialogTitle>
                      <DialogDescription>
                        Enter the details for the new task.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={addTask}>
                      <FieldGroup>
                        <Field>
                          <FieldLabel>Task Title</FieldLabel>
                          <Input type="text" />
                        </Field>
                        <Field>
                          <FieldLabel>Task Description</FieldLabel>
                          <Input type="text" />
                        </Field>
                        <Field>
                          <FieldLabel>Task Status</FieldLabel>
                          <select className="h-7 w-full rounded-md border border-input">
                            <option className=" bg-background/70  text-xs " value="pending">Pending</option>
                            <option className=" bg-background/70  text-xs " value="in_progress">In Progress</option>
                            <option className=" bg-background/70  text-xs " value="completed">Completed</option>
                            <option className=" bg-background/70  text-xs " value="cancelled">Cancelled</option>
                          </select>
                        </Field>
                        <Button type="submit">Add Task</Button>
                      </FieldGroup>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardAction>
            ) : null}
            <CardTitle className=" text-lg font-semibold  ">
              Project Tasks:
            </CardTitle>
          </CardHeader>
          {projectTasks?.filter((task) => task.project_id === id)?.length ===
            0 && <span>No tasks in this project.</span>}
          {projectTasks
            ?.filter((task) => task.project_id === id)
            .sort((a, b) => {
              const statusOrder: { [key: string]: number } = {
                in_progress: 1,
                pending: 2,
                completed: 3,
                cancelled: 4,
              };
              return (
                (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
              );
            })
            .sort((a, b) => {
              return (
                new Date(a.created_at).getTime() -
                new Date(b.created_at).getTime()
              );
            })
            .map((task) => (
              <Card key={task.id} className=" flex flex-col gap-2 p-2">
                <CardTitle className={`flex gap-1 justify-start items-center`}>
                  <span
                    className={`  ${task.status === "pending" ? "text-yellow-600" : task.status === "in_progress" ? "text-blue-600" : task.status === "completed" ? "text-green-600" : task.status === "cancelled" ? "text-red-600" : ""}`}
                  >
                    {task.status === "pending" ? (
                      <Hourglass className=" w-4 h-4 " />
                    ) : task.status === "in_progress" ? (
                      <Construction className=" w-4 h-4 " />
                    ) : task.status === "completed" ? (
                      <CircleCheckBig className=" w-4 h-4 " />
                    ) : task.status === "cancelled" ? (
                      <OctagonX className=" w-4 h-4 " />
                    ) : (
                      ""
                    )}
                  </span>
                  {task.task_title}
                </CardTitle>
                <CardDescription>{task.task_description}</CardDescription>
                <Collapsible className="group/collapsible">
                  <CollapsibleTrigger
                    asChild
                    className=" text-sm text-primary/80 group-data-[state=open]/collapsible:text-primary"
                  >
                    <Button
                      variant={"outline"}
                      size={"sm"}
                      className="w-full hover:bg-primary/10 "
                    >
                      {task.status?.[0]?.toUpperCase() + task.status?.slice(1)}
                      <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className=" mt-2 flex flex-col gap-2 bg-accent p-2 rounded-md">
                    <Button
                      disabled={task.status === "pending"}
                      variant={"outline"}
                      onClick={() => handleTaskUpdate(task.id, "pending")}
                      className=" hover:text-primary "
                    >
                      Pending
                    </Button>
                    <Button
                      disabled={task.status === "in_progress"}
                      variant={"outline"}
                      onClick={() => handleTaskUpdate(task.id, "in_progress")}
                      className=" hover:text-primary "
                    >
                      In Progress
                    </Button>
                    <Button
                      disabled={task.status === "completed"}
                      variant={"outline"}
                      onClick={() => handleTaskUpdate(task.id, "completed")}
                      className=" hover:text-primary "
                    >
                      Completed
                    </Button>
                    <Button
                      disabled={task.status === "cancelled"}
                      variant={"outline"}
                      onClick={() => handleTaskUpdate(task.id, "cancelled")}
                      className=" hover:text-destructive "
                    >
                      Cancelled
                    </Button>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            ))}
        </Card>
        <Card className=" px-10 py-5 col-span-2">
          <CardHeader className="p-0">
            {projects?.filter((member) => member.project_id === id)[0]
              .manager_username === profile?.username ? (
              <CardAction>
                <Button
                  variant={"outline"}
                  size={"icon-lg"}
                  className=" hover:bg-primary/10 cursor-pointer "
                >
                  <Plus />
                </Button>
              </CardAction>
            ) : null}
            <CardTitle className=" text-lg font-semibold  ">
              Project Members:
            </CardTitle>
          </CardHeader>
          {projectMembers?.filter((member) => member.project_id === id)
            ?.length === 0 && <span>No members in this project.</span>}
          {projectMembers
            ?.filter((member) => member.project_id === id)
            .map((member) => (
              <Card key={member.member_id} className=" flex flex-col gap-2 ">
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
              </Card>
            ))}
        </Card>
      </div>
    </div>
  );
};

export default page;
