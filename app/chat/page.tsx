"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { useChat } from "@/providers/chat-provider";
import { createClient } from "@/utils/supabase/client";
import { cn } from "@/lib/utils";
import { Database } from "@/types/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AutoTextarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftIcon, MessageSquarePlus, Send, Sparkles } from "lucide-react";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

const supabase = createClient();

const getDisplayName = (user: ProfileRow | undefined | null) => {
  if (!user) return "Unknown User";
  return user.display_name || user.username || "Unknown User";
};

const getAvatarUrl = (user: ProfileRow | undefined | null) => {
  const display = getDisplayName(user);
  return (
    user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=random&color=fff`
  );
};

const MessageBubble = ({
  message,
  mine,
}: {
  message: MessageRow;
  mine: boolean;
}) => {
  return (
    <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[72%]",
          mine
            ? "rounded-br-sm bg-primary text-primary-foreground"
            : "rounded-bl-sm border border-border/70 bg-card/90 text-card-foreground",
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <p
          className={cn(
            "mt-1 text-[11px]",
            mine ? "text-primary-foreground/80" : "text-muted-foreground",
          )}
        >
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </p>
      </div>
    </div>
  );
};

const ChatTwoPage = () => {
  const { isLoading, profile, session, signedInUsers } = useAuth();
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
      .filter((conv) => conv.user_1 === profile?.id || conv.user_2 === profile?.id)
      .sort((a, b) => {
        const aLast = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
        const bLast = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
        return bLast - aLast;
      });
  }, [conversations, profile?.id]);

  const availableUsers = useMemo(() => {
    return users
      .filter((user) => user.id !== profile?.id)
      .filter((user) => {
        return myConversations.every(
          (conv) => conv.user_1 !== user.id && conv.user_2 !== user.id,
        );
      });
  }, [myConversations, profile?.id, users]);

  const selectedConversationRecord = useMemo(() => {
    return myConversations.find((conv) => conv.id === selectedConversation) ?? null;
  }, [myConversations, selectedConversation]);

  const selectedOtherUserId = useMemo(() => {
    if (!selectedConversationRecord || !profile?.id) return null;
    return selectedConversationRecord.user_1 === profile.id
      ? selectedConversationRecord.user_2
      : selectedConversationRecord.user_1;
  }, [profile?.id, selectedConversationRecord]);

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedOtherUserId) ?? null;
  }, [selectedOtherUserId, users]);

  const conversationMessages = useMemo(() => {
    if (!selectedConversation) return [];
    return messages
      .filter((msg) => msg.conversation_id === selectedConversation)
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

  const unreadCount = (conversationId: string) => {
    return messages.filter(
      (msg) =>
        msg.conversation_id === conversationId &&
        msg.sender_id !== profile?.id &&
        !msg.is_read,
    ).length;
  };

  const addConversation = async (userId: string) => {
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
    if (e.key === "Enter" && !e.shiftKey) {
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
        <Card
          className={cn(
            "min-h-0 overflow-hidden rounded-3xl border-border/60 bg-background/70 p-0 backdrop-blur-xl",
            selectedConversation ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex w-full min-h-0 flex-col">
            <div className="border-b border-border/60 px-5 py-4">
              <p className="text-xs text-muted-foreground">A fresh sandbox chat interface.</p>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
              <div>
                <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Active Conversations
                </p>
                <div className="space-y-1">
                  {myConversations.map((conv: ConversationRow) => {
                    const otherUserId =
                      conv.user_1 === profile?.id ? conv.user_2 : conv.user_1;
                    const user = users.find((u) => u.id === otherUserId);
                    const active = selectedConversation === conv.id;
                    const unread = unreadCount(conv.id);
                    const isOnline = !!user && signedInUsers?.includes(user.id);

                    return (
                      <button
                        type="button"
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv.id)}
                        className={cn(
                          "flex w-full items-center gap-3 rounded-2xl border px-2 py-2 text-left transition",
                          active
                            ? "border-primary/50 bg-primary/10"
                            : "border-transparent hover:border-border/80 hover:bg-muted/60",
                        )}
                      >
                        <Avatar size="lg">
                          <AvatarImage src={getAvatarUrl(user)} alt={getDisplayName(user)} />
                          <AvatarFallback>{getDisplayName(user).slice(0, 2)}</AvatarFallback>
                        </Avatar>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{getDisplayName(user)}</p>
                          <p className="text-xs text-muted-foreground">
                            {isOnline ? <span className="text-primary">Online now</span> : "Last seen recently"}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          {unread > 0 ? (
                            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                              {unread}
                            </span>
                          ) : null}
                          {/* {isOnline ? (
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                          ) : null} */}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Start New Chat
                </p>
                <div className="space-y-1">
                  {availableUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-2 rounded-2xl border border-transparent px-2 py-2 hover:border-border/70 hover:bg-muted/60"
                    >
                      <Avatar size="default">
                        <AvatarImage
                          src={getAvatarUrl(user)}
                          alt={getDisplayName(user)}
                        />
                        <AvatarFallback>{getDisplayName(user).slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <p className="min-w-0 flex-1 truncate text-sm">{getDisplayName(user)}</p>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={isCreating.includes(user.id)}
                        onClick={() => void addConversation(user.id)}
                        className="gap-1"
                      >
                        {isCreating.includes(user.id) ? (
                          <Spinner className="size-3.5" />
                        ) : (
                          <MessageSquarePlus className="size-3.5" />
                        )}
                        Start
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card
          className={cn(
            "relative min-h-0 rounded-3xl border-border/60 bg-background/70 p-0 backdrop-blur-xl",
            !selectedConversation ? "hidden lg:flex" : "flex",
          )}
        >
          <div className="flex w-full h-full min-h-0 flex-col">
            {selectedConversation ? (
              <>
                <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="lg:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeftIcon className="size-5" />
                  </Button>

                  <Avatar size="lg">
                    <AvatarImage
                      src={getAvatarUrl(selectedUser)}
                      alt={getDisplayName(selectedUser)}
                    />
                    <AvatarFallback>
                      {getDisplayName(selectedUser).slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-heading text-base">{getDisplayName(selectedUser)}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedUser && signedInUsers?.includes(selectedUser.id)
                        ? "Online"
                        : "Away"}
                    </p>
                  </div>
                </div>

                <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
                  {conversationMessages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      mine={message.sender_id === profile?.id}
                    />
                  ))}
                </div>

                <div className="border-t border-border/60 p-3 sm:p-4">
                  <div className="flex items-end gap-2 rounded-2xl border border-border/70 bg-background/70 p-2">
                    <AutoTextarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleInputKeyDown}
                      className="max-h-40 min-h-12 flex-1 resize-none border-none bg-transparent focus-visible:ring-0"
                      placeholder="Write a message. Press Enter to send, Shift+Enter for newline."
                    />
                    <Button
                      type="button"
                      size="icon-lg"
                      disabled={isSending || !input.trim()}
                      onClick={() => void handleSendMessage()}
                    >
                      {isSending ? <Spinner className="size-4" /> : <Send className="size-4" />}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center px-6 text-center">
                <div className="space-y-3">
                  <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
                    <Sparkles className="size-6" />
                  </div>
                  <p className="font-heading text-xl">Select a conversation</p>
                  <p className="text-sm text-muted-foreground">
                    Pick someone from the left panel or start a new conversation.
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ChatTwoPage;
