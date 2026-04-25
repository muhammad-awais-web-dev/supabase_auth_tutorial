"use client";
import React, { useEffect, useState } from "react";

import { useAuth } from "@/providers/auth-provider";
import { createClient } from "@/utils/supabase/client";
import { useChat } from "@/providers/chat-provider";
import { Database } from "@/types/database.types";
import { Card, CardAction } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusSquare, Send } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import ChatWindow from "./components/ChatWindow";

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
  const [isCreating, setIsCreating] = useState<string[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const addConversation = (id: string) => {
    setIsCreating((prev) => [...prev, id]);
    createConversation(id).finally(() => {
      setTimeout(() => {
        setIsCreating((prev) => prev.filter((convId) => convId !== id));
        setSelectedConversation(id);
      }, 300);
    });
  };

  if (isLoading) {
    return <Spinner className=" m-auto " />;
  }

  return (<div className="flex flex-row">
    <div className=" flex flex-col h-screen overflow-auto w-1/3 items-start justify-start p-10 ">
    <div className=" min-h-fit w-full" >
      

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
                className=" p-4 flex flex-row items-center gap-4 mb-1 hover:bg-foreground/20 transition-colors duration-300 cursor-pointer "
                onClick={() => setSelectedConversation(conv.id)}
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
                <p>{user.display_name}
                  <br/>
                  {signedInUsers?.includes(user.id) ? 
                    <span className=" text-green-500 flex items-center" > <span className="h-2 w-2 bg-green-500 rounded-full mr-1"></span>  Online</span>
                    :
                    <span className=" text-red-500 flex items-center" > <span className="h-2 w-2 bg-red-500 rounded-full mr-1"></span>  Offline</span>
                  }
                  </p>
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
                disabled={isCreating.includes(user.id)}
                variant="secondary"
                className=" ml-auto hover:bg-primary/30 cursor-pointer "
                onClick={() => addConversation(user.id)}
              >
                Start Conversation 
                {isCreating.includes(user.id)?<Spinner className=" h-4 w-4 " />: <PlusSquare />}
              </Button>
            </Card>
          ))}
      </Card>
    </div>
    </div>
    <ChatWindow selectedConversation={selectedConversation} />
  </div>
  );
};

export default page;
