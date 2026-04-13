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
import { ChevronRightIcon, Plus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

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

  if (isLoading) {
    return (
      <div className=" w-full h-full flex justify-center items-center ">
        <Spinner />
      </div>
    );
  }
  return !isLoading &&
    projects?.find((project) => project.project_id === id) === undefined ? (
    <Card className="p-45 w-9/10 self-center">
      <CardTitle className="text-destructive text-2xl ">
        Project Not Found
      </CardTitle>
      <CardDescription>
        The project you are looking for does not exist.
      </CardDescription>
    </Card>
  ) : (
    <>
      <Card className="px-45 py-20 w-9/10 self-center">
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
      <div className=" grid grid-cols-5 w-9/10 mt-5 gap-5 self-center">
        <Card className=" px-10 py-5 col-span-3">
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
              Project Tasks:
            </CardTitle>
          </CardHeader>
          {projectTasks?.filter((task) => task.project_id === id)?.length ===
            0 && <span>No tasks in this project.</span>}
          {projectTasks
            ?.filter((task) => task.project_id === id)
            .map((task) => (
              <Card key={task.id} className=" flex flex-col gap-2 p-2">
                  <CardTitle>{task.task_title}</CardTitle>
                <CardDescription>{task.task_description}</CardDescription>
                  <Collapsible className="group/collapsible">
                    <CollapsibleTrigger
                      asChild
                      className=" text-sm text-primary/80 group-data-[state=open]/collapsible:text-primary"
                    >
                      <Button variant={"outline"} size={"sm"} className="w-full hover:bg-primary/10 ">
                        {task.status?.[0]?.toUpperCase() +
                          task.status?.slice(1)}
                        <ChevronRightIcon className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className=" mt-2 flex flex-col gap-2 bg-accent p-2 rounded-md">
                        <Button variant={'outline'} className=" hover:text-primary " >Pending</Button>
                        <Button variant={'outline'} className=" hover:text-primary " >In Progress</Button>
                        <Button variant={'outline'} className=" hover:text-primary " >Completed</Button>
                        <Button variant={'outline'} className=" hover:text-destructive " >Cancelled</Button>
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
    </>
  );
};

export default page;
