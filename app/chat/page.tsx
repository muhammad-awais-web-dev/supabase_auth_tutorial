"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useChat } from "@/providers/chat-provider";
import type { Database } from "@/types/database.types";
import { Spinner } from "@/components/ui/spinner";
import { ConversationList } from "./components/conversation-list";
import { ConversationStage } from "./components/conversation-stage";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

const supabase = createClient();

export default function Page() {
  const { profile, session, signedInUsers, isLoading } = useAuth();
  const { conversations, createConversation, markRead, messages, sendMessage } = useChat();

  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isCreating, setIsCreating] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("Error fetching users:", error);
        return;
      }
      setUsers(data ?? []);
    };

    void fetchUsers();
  }, []);

  const myConversations = useMemo(() => {
    return conversations
      .filter((conversation) => conversation.user_1 === profile?.id || conversation.user_2 === profile?.id)
      .sort((a, b) => {
        const aLast = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bLast = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bLast - aLast;
      });
  }, [conversations, profile?.id]);

  const selectedConversationRecord = useMemo(() => {
    return myConversations.find((conversation) => conversation.id === selectedConversation) ?? null;
  }, [myConversations, selectedConversation]);

  const selectedUserId = useMemo(() => {
    if (!selectedConversationRecord || !profile?.id) return null;
    return selectedConversationRecord.user_1 === profile.id
      ? selectedConversationRecord.user_2
      : selectedConversationRecord.user_1;
  }, [profile?.id, selectedConversationRecord]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) ?? null;
  }, [selectedUserId, users]);

  const selectedConversationMessages = useMemo(() => {
    if (!selectedConversation) return [];

    return messages
      .filter((message) => message.conversation_id === selectedConversation)
      .sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0;
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0;
        return aTime - bTime;
      });
  }, [messages, selectedConversation]);

  useEffect(() => {
    if (!selectedConversation) return;
    void markRead(selectedConversation);
  }, [markRead, selectedConversation]);

  const handleStartConversation = async (userId: string) => {
    setIsCreating((prev) => [...prev, userId]);
    try {
      const created = await createConversation(userId);
      if (created?.id) {
        setSelectedConversation(created.id);
      }
    } finally {
      setIsCreating((prev) => prev.filter((id) => id !== userId));
    }
  };

  const handleSendMessage = async () => {
    const text = input.trim();
    if (!text || !selectedConversation || !session || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(selectedConversation, text);
      setInput("");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    if (!e.shiftKey) {
      e.preventDefault();
      void handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="grid h-full place-items-center">
        <Spinner className="size-7" />
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden p-3 sm:p-5">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -right-24 -top-20 h-72 w-72 rounded-full bg-chart-2/20 blur-3xl" />
        <div className="absolute -left-20 bottom-8 h-64 w-64 rounded-full bg-chart-1/20 blur-3xl" />
      </div>

      <div className="relative z-10 grid h-full min-h-0 grid-cols-1 gap-3 lg:grid-cols-[22rem_minmax(0,1fr)]">
        <ConversationList
          profileId={profile?.id}
          signedInUsers={signedInUsers}
          users={users}
          conversations={myConversations}
          messages={messages}
          selectedConversation={selectedConversation}
          onSelectConversation={setSelectedConversation}
          onStartConversation={handleStartConversation}
          isStartingConversation={isCreating}
        />

        <ConversationStage
          selectedConversation={selectedConversation}
          selectedUser={selectedUser}
          selectedUserOnline={!!selectedUser?.id && signedInUsers?.includes(selectedUser.id)}
          messages={selectedConversationMessages}
          profileId={profile?.id}
          input={input}
          onInputChange={setInput}
          onSend={() => void handleSendMessage()}
          onInputKeyDown={handleInputKeyDown}
          onClearSelection={() => setSelectedConversation(null)}
          isSending={isSending}
        />
      </div>
    </div>
  );
}
