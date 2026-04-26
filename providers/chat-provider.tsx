"use client";

import { useContext, useState, useEffect, createContext } from "react";

import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import type { Database } from "@/types/supabase";

const supabase = createClient();

type ChatContextValue = {
  conversations: Database["public"]["Tables"]["conversations"]["Row"][];
  conversationsLoading: boolean;
  createConversation: (otherUserId: string) => Promise<Database["public"]["Tables"]["conversations"]["Row"] | undefined>;
  messages: Database["public"]["Tables"]["messages"]["Row"][];
  sendMessage: (conversationId: string, content: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const { session } = useAuth();

  const [conversations, setConversations] = useState<Database["public"]["Tables"]["conversations"]["Row"][]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  const [messages, setMessages] = useState<Database["public"]["Tables"]["messages"]["Row"][]>([]);


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

    const convChannel = supabase
      .channel(`public:conversations:${session?.user.id}:${crypto.randomUUID()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "conversations" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            const newConv = payload.new as Database["public"]["Tables"]["conversations"]["Row"];
            setConversations((prev) =>
              prev.some((conv) => conv.id === newConv.id) ? prev : [...prev, newConv],
            );
          }
          if (payload.eventType === "DELETE") {
            const deletedConv = payload.old as Database["public"]["Tables"]["conversations"]["Row"];
            setConversations((prev) => prev.filter((conv) => conv.id !== deletedConv.id));
          }
          if (payload.eventType === "UPDATE") {
            const updatedConv = payload.new as Database["public"]["Tables"]["conversations"]["Row"];
            setConversations((prev) =>
              prev.map((conv) => (conv.id === updatedConv.id ? updatedConv : conv)),
            );
          }
        }
      )
      .subscribe()

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

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      setMessages(data);
    }
  }

useEffect(() => {
  if (!session) return;
  fetchMessages();

  const chatChannel = supabase
    .channel(`public:messages:${session.user.id}:${crypto.randomUUID()}`)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "messages" },
      (payload) => {
        if (payload.eventType === "INSERT") {
          const newMessage = payload.new as Database["public"]["Tables"]["messages"]["Row"];
          setMessages((prev) =>
            prev.some((msg) => msg.id === newMessage.id) ? prev : [...prev, newMessage],
          );
        }
        if (payload.eventType === "DELETE") {
          const deletedMessage = payload.old as Database["public"]["Tables"]["messages"]["Row"];
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedMessage.id));
        }
        if (payload.eventType === "UPDATE") {
          const updatedMessage = payload.new as Database["public"]["Tables"]["messages"]["Row"];
          setMessages((prev) =>
            prev.map((msg) => (msg.id === updatedMessage.id ? updatedMessage : msg)),
          );
        }
      },
    )
    .subscribe();

  return () => {
    supabase.removeChannel(chatChannel);
  };
}, [session]);


  const sendMessage = async (conversationId: string, content: string) =>{
    if (!session) return;
    const { data, error } = await supabase
      .from("messages")
      .insert({
        conversation_id: conversationId,
        content,
        sender_id: session.user.id,
      })
      .select()
      .maybeSingle();
    if (error) {
      console.error("Error sending message:", error);
    }
  }


  const chatValue: ChatContextValue = {
    conversations,
    conversationsLoading,
    createConversation,
    messages,
    sendMessage
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