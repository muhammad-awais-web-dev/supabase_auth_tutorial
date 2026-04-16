import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Edit2, Trash2, UserPlus2 } from "lucide-react";

import { useParams } from "next/navigation";

import { createClient } from "@/utils/supabase/client";

import { Database } from "@/types/database.types";

import { useProjects } from "@/providers/project-provider";
import { Card, CardAction, CardHeader, CardTitle } from "@/components/ui/card";

const EditMembers = () => {
  const { projectMembers } = useProjects();

  const { id } = useParams();

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

  return (
    <Dialog>
      <DialogTrigger>
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
          <div>
            <h2 className=" text-2xl py-5 pl-5 ">Assigned Members</h2>
            <div className=" flex flex-col gap-3 " >
              {userProfiles.length > 0
                ? userProfiles
                    .filter((profile) =>
                      projectMembers?.some(
                        (member) =>
                          member.member_id === profile.id &&
                          member.project_id === id,
                      ),
                    )
                    .map((profile) => (
                      <Card>
                        <CardHeader>
                          <div className=" flex gap-4 items-center " >
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
                              <br />({profile.username})
                            </p>
                          </div>
                          <CardAction>
                            <Button variant={"destructive"} size={"icon"} className="cursor-pointer" >
                              <Trash2 />
                            </Button>
                          </CardAction>
                        </CardHeader>
                      </Card>
                    ))
                : null}
            </div>
            <h2 className=" text-2xl py-5 pl-5 ">Un-assigned Members</h2>
            <div className=" flex flex-col gap-3 " >
              {userProfiles.length > 0
                ? userProfiles
                    .filter(
                      (profile) =>
                        !projectMembers?.some(
                          (member) =>
                            member.member_id === profile.id &&
                            member.project_id === id,
                        ),
                    )
                    .map((profile) => (
                      <Card>
                        <CardHeader>
                          <div className=" flex gap-4 items-center " >
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
                              <br />({profile.username})
                            </p>
                          </div>
                          <CardAction>
                            <Button variant={"default"} size={"icon"} className="cursor-pointer" >
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
