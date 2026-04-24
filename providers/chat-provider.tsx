"use client";

import { useContext, useState, useEffect, createContext, use } from "react";

import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { Database } from "@/types/supabase";

const supabase = createClient();

type ChatContextValue = {
  conversations: Database["public"]["Tables"]["conversations"]["Row"][];
  conversationsLoading: boolean;
  createConversation: (otherUserId: string) => Promise<Database["public"]["Tables"]["conversations"]["Row"] | undefined>;
  fetchMessages: (conversationId: string) => Promise<Database["public"]["Tables"]["messages"]["Row"][] | undefined>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  const [conversations, setConversations] = useState<Database["public"]["Tables"]["conversations"]["Row"][]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);


  const refreshConversations = () =>{

    if (session) {
      const fetchConversations = async () => {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .or(`user_1.eq.${session.user.id},user_2.eq.${session.user.id}`);
        if (error) {
          console.error("Error fetching conversations:", error);
        } else {
          console.log("Fetched conversations:", data);
          setConversations(data);
        }
      };
      setConversationsLoading(true);
      fetchConversations();
      setConversationsLoading(false);
    }
  }


  useEffect(() => {
    refreshConversations();
  }, [session]);

  const createConversation = async (otherUserId: string) => {
    if (!session) return;
    const user_1 = session.user.id > otherUserId ? session.user.id : otherUserId;
    const user_2 = session.user.id > otherUserId ? otherUserId : session.user.id;


    const { data, error } = await supabase
      .from("conversations")
      .insert({
        user_1,
        user_2
      })
      .select()
      .maybeSingle();
    if (error) {
      console.error("Error creating conversation:", error);
    }
    else {
      refreshConversations();
    }
    return data;
  }

  const fetchMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      return data;
    }
  }

  const chatValue: ChatContextValue = {
    conversations,
    conversationsLoading,
    createConversation,
    fetchMessages
  };

  return (
    <ChatContext.Provider value={chatValue}>
      {children}
    </ChatContext.Provider>
  );

}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;

}