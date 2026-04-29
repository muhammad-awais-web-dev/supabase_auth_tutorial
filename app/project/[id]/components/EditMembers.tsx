import React, { use, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit2, Trash2, UserPlus2 } from "lucide-react";

import { useParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { Database } from "@/types/supabase";

import { useProjects } from "@/providers/project-provider";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";

const EditMembers = () => {
  const { projectMembers, refreshProjectMembers } = useProjects();
  const [membersAction, MembersAction] = useState<{
    id: string;
    action: "delete" | "add";
    description: string;
  } | null>(null);

  useEffect(() => {
    if (membersAction) {
      setTimeout(() => {
        MembersAction(null);
      }, 1700);
    }
  }, [membersAction]);

  const [localProjectMembers, setLocalProjectMembers] =
    useState(projectMembers);

  useEffect(() => {
    setLocalProjectMembers(projectMembers);
  }, [projectMembers]);

  const { id } = useParams();
  const projectId = typeof id === "string" ? id : null;

  const [userProfiles, setUserProfiles] = useState<
    Database["public"]["Tables"]["profiles"]["Row"][]
  >([]);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching user profiles:", error);
      } else {
        setUserProfiles(data);
      }
    };

    fetchUserProfiles();
  }, [supabase, projectMembers]);

  const deleteLocalMember = (memberId: string, description: string) => {
    MembersAction({ id: memberId, action: "delete", description });
    setLocalProjectMembers(
      (prevMembers) =>
        prevMembers?.filter(
          (member) =>
            !(member.member_id === memberId && member.project_id === projectId),
        ) || null,
    );
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const deletedMemberCard = document.getElementById(
          `member-card-${memberId}`,
        );
        if (deletedMemberCard) {
          deletedMemberCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    });
  };

  const addLocalMember = (memberId: string, description: string) => {
    if (!projectId) return;
    MembersAction({ id: memberId, action: "add", description });
    setLocalProjectMembers(
      (prevMembers) =>
        prevMembers?.concat({
          member_id: memberId,
          project_id: projectId,
          avatar_url: null,
          display_name: null,
          username: null,
        }) || null,
    );
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const deletedMemberCard = document.getElementById(
          `member-card-${memberId}`,
        );
        if (deletedMemberCard) {
          deletedMemberCard.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      });
    });
  };

  const deleteMember = async (memberId: string) => {
    if (!projectId) return;
    deleteLocalMember(memberId, "Deleting member...");

    const { error } = await supabase
      .from("project_members")
      .delete()
      .eq("id", memberId)
      .eq("project_id", projectId || undefined);
    if (error) {
      console.error("Error deleting member:", error);
      refreshProjectMembers();
      setTimeout(() => {
        addLocalMember(memberId, "Failed to delete member...");
      }, 1700);
    } else {
      refreshProjectMembers();
    }
  };

  const addUser = async (memberId: string) => {
    if (!projectId) return;
    addLocalMember(memberId, "Adding member...");
    const { error } = await supabase.from("project_members").insert({
      id: memberId,
      project_id: projectId,
    });
    if (error) {
      console.error("Error adding member:", error);
      refreshProjectMembers();
      setTimeout(() => {
        deleteLocalMember(memberId, "Failed to add member...");
      }, 1700);
    } else {
      refreshProjectMembers();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant={"outline"}
          size={"icon-lg"}
          className=" hover:bg-primary/10 cursor-pointer "
        >
          <Edit2 />
        </Button>
      </DialogTrigger>
      <DialogContent className=" max-h-[75vh] no-scrollbar overflow-auto">
        <DialogHeader>
          <DialogTitle>Edit Members</DialogTitle>
          <DialogDescription>
            Manage the members of this project.
          </DialogDescription>
          <div>
            <h2 className=" text-2xl py-5 pl-5 ">Assigned Members</h2>
            <div className=" flex flex-col gap-3 ">
              {userProfiles.length > 0
                ? userProfiles
                    .filter((profile) =>
                      localProjectMembers?.some(
                        (member) =>
                          member.member_id === profile.id &&
                          member.project_id === projectId,
                      ),
                    )
                    .map((profile) => (
                      <Card
                        key={profile.id}
                        id={`member-card-${profile.id}`}
                        className={`${membersAction?.id == profile.id ? "bg-primary" : null}`}
                      >
                        <CardHeader>
                          <div className=" flex gap-4 items-center ">
                            <img
                              src={
                                profile.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username || "User")}&background=random&color=fff`
                              }
                              alt={
                                profile.display_name ||
                                profile.username ||
                                "user"
                              }
                              className="w-9 h-9 rounded-full"
                            />
                            <p>
                              <span className=" text-lg font-semibold ">
                                {profile.display_name}
                              </span>
                              <br />({profile.username})<br />
                              {membersAction?.id === profile.id ? (
                                <span className=" text-sm text-foreground ">
                                  {membersAction.description}
                                </span>
                              ) : null}
                            </p>
                          </div>
                          <CardAction>
                            <Button
                              variant={"destructive"}
                              size={"icon"}
                              className="cursor-pointer"
                              onClick={() => deleteMember(profile.id)}
                            >
                              <Trash2 />
                            </Button>
                          </CardAction>
                        </CardHeader>
                      </Card>
                    ))
                : null}
            </div>
            <h2 className=" text-2xl py-5 pl-5 ">Un-assigned Members</h2>
            <div className=" flex flex-col gap-3 ">
              {userProfiles.length > 0
                ? userProfiles
                    .filter(
                      (profile) =>
                        !localProjectMembers?.some(
                          (member) =>
                            member.member_id === profile.id &&
                            member.project_id === projectId,
                        ),
                    )
                    .map((profile) => (
                      <Card
                        key={profile.id}
                        id={`member-card-${profile.id}`}
                        className={`${membersAction?.id == profile.id ? "bg-destructive/30" : null}`}
                      >
                        <CardHeader>
                          <div className=" flex gap-4 items-center ">
                            <img
                              src={
                                profile.avatar_url ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.display_name || profile.username || "User")}&background=random&color=fff`
                              }
                              alt={
                                profile.display_name ||
                                profile.username ||
                                "user"
                              }
                              className="w-9 h-9 rounded-full"
                            />
                            <p>
                              <span className=" text-lg font-semibold ">
                                {profile.display_name}
                              </span>
                              <br />({profile.username})<br />
                              {membersAction?.id === profile.id ? (
                                <span className=" text-sm text-foreground ">
                                  {membersAction.description}
                                </span>
                              ) : null}
                            </p>
                          </div>
                          <CardAction>
                            <Button
                              variant={"default"}
                              size={"icon"}
                              className="cursor-pointer"
                              onClick={() => addUser(profile.id)}
                            >
                              <UserPlus2 />
                            </Button>
                          </CardAction>
                        </CardHeader>
                      </Card>
                    ))
                : null}
            </div>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default EditMembers;
