import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { MessageSquarePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];

const getDisplayName = (user: ProfileRow | undefined | null) =>
  user?.display_name || user?.username || "Unknown User";

const getAvatarUrl = (user: ProfileRow | undefined | null) => {
  const display = getDisplayName(user);
  return (
    user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=random&color=fff`
  );
};

export function ConversationList({
  profileId,
  signedInUsers,
  users,
  conversations,
  messages,
  selectedConversation,
  onSelectConversation,
  onStartConversation,
  isStartingConversation,
}: {
  profileId?: string;
  signedInUsers?: string[];
  users: ProfileRow[];
  conversations: ConversationRow[];
  messages: Database["public"]["Tables"]["messages"]["Row"][];
  selectedConversation: string | null;
  onSelectConversation: (conversationId: string) => void;
  onStartConversation: (userId: string) => void;
  isStartingConversation: string[];
}) {
  const myConversations = conversations
    .filter((conversation) => conversation.user_1 === profileId || conversation.user_2 === profileId)
    .sort((a, b) => {
      const aLast = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const bLast = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      return bLast - aLast;
    });

  const availableUsers = users
    .filter((user) => user.id !== profileId)
    .filter((user) =>
      myConversations.every((conversation) => conversation.user_1 !== user.id && conversation.user_2 !== user.id),
    );

  const unreadCount = (conversationId: string) => {
    return messages.filter(
      (message) =>
        message.conversation_id === conversationId &&
        message.sender_id !== profileId &&
        !message.is_read,
    ).length;
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-border/60 bg-background/70 p-0 backdrop-blur-xl">
      <div className="border-b border-border/60 px-5 py-4">
        <p className="font-heading text-lg tracking-tight">ProjectFlow Chat</p>
        <p className="text-xs text-muted-foreground">Your active conversations and new chats.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-3 py-3">
        <div>
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Active Conversations
          </p>
          <div className="space-y-1">
            {myConversations.map((conversation) => {
              const otherUserId = conversation.user_1 === profileId ? conversation.user_2 : conversation.user_1;
              const user = users.find((candidate) => candidate.id === otherUserId);
              const active = selectedConversation === conversation.id;
              const unread = unreadCount(conversation.id);
              const online = !!user && signedInUsers?.includes(user.id);

              return (
                <button
                  type="button"
                  key={conversation.id}
                  onClick={() => onSelectConversation(conversation.id)}
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
                    <p className="text-xs text-muted-foreground">{online ? "Online now" : "Last seen recently"}</p>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {unread > 0 ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
                        {unread}
                      </span>
                    ) : null}
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
                  <AvatarImage src={getAvatarUrl(user)} alt={getDisplayName(user)} />
                  <AvatarFallback>{getDisplayName(user).slice(0, 2)}</AvatarFallback>
                </Avatar>
                <p className="min-w-0 flex-1 truncate text-sm">{getDisplayName(user)}</p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={isStartingConversation.includes(user.id)}
                  onClick={() => onStartConversation(user.id)}
                  className="gap-1"
                >
                  {isStartingConversation.includes(user.id) ? (
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
    </Card>
  );
}