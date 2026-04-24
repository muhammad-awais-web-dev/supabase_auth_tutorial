"use client";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@/providers/chat-provider";
import { Database } from "@/types/database.types";
import { Card, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

const page = () => {
  const { signedInUsers, profile } = useAuth();
  const supabase = createClient();

  const [users, setusers] = useState<
    Database["public"]["Tables"]["profiles"]["Row"][]
  >([]);
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setusers(data);
      }
    };

    fetchUsers();
  }, []);

  const { isLoading } = useAuth();
  const { conversations, createConversation } = useChat();

  if (isLoading) {
    return <Spinner className=" m-auto " />;
  }

  return (
    <div className=" flex flex-col items-start justify-center p-10 ">
      <h2>Conversations</h2>
      <Card className="w-full p-4 my-10">
        {conversations
          .filter(
            (conv) =>
              conv.user_1 === profile?.id || conv.user_2 === profile?.id,
          )
          .map((conv) => {
            const otherUser =
              conv.user_1 === profile?.id ? conv.user_2 : conv.user_1;
            const user = users.find((u) => u.id === otherUser);
            if (!user) return null;
            return (
              <Card
                key={user.id}
                className=" p-4 flex flex-row items-center gap-4 mb-1 "
              >
                <div className=" h-10 w-10 overflow-hidden rounded-full ">
                  <img
                    src={
                      user.avatar_url ||
                      `https://ui-avatars.com/api/?name=${user.display_name}&background=random&color=fff` ||
                      `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`
                    }
                    alt={user.display_name || user.username || "User"}
                  />
                </div>
                <p>{user.display_name}</p>
              </Card>
            );
          })}
      </Card>
      <h2>Start New Conversation</h2>
      <Card className="w-full p-4 my-10">
        {users
          .filter((user) => user.id !== profile?.id)
          .filter((user) =>
            conversations.every(
              (conv) => conv.user_1 !== user.id && conv.user_2 !== user.id,
            ),
          )
          .map((user) => (
            <Card
              key={user.id}
              className=" p-4 flex flex-row items-center gap-4 mb-1 "
            >
              <div className=" h-10 w-10 overflow-hidden rounded-full ">
                <img
                  src={
                    user.avatar_url ||
                    `https://ui-avatars.com/api/?name=${user.display_name}&background=random&color=fff` ||
                    `https://ui-avatars.com/api/?name=${user.username}&background=random&color=fff`
                  }
                  alt={user.display_name || user.username || "User"}
                />
              </div>
              <p>{user.display_name}</p>
              <Button
                variant="outline"
                className=" ml-auto "
                onClick={() => createConversation(user.id)}
              >
                Start Conversation <PlusSquare />
              </Button>
            </Card>
          ))}
      </Card>
    </div>
  );
};

export default page;
