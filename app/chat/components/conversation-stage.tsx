import { ArrowLeftIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChatBubble } from "./chat-bubble";
import { ChatComposer } from "./chat-composer";
import type { Database } from "@/types/supabase";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

const getDisplayName = (user: ProfileRow | undefined | null) =>
  user?.display_name || user?.username || "Unknown User";

const getAvatarUrl = (user: ProfileRow | undefined | null) => {
  const display = getDisplayName(user);
  return (
    user?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(display)}&background=random&color=fff`
  );
};

export function ConversationStage({
  selectedConversation,
  selectedUser,
  selectedUserOnline,
  messages,
  profileId,
  input,
  onInputChange,
  onSend,
  onInputKeyDown,
  onClearSelection,
  isSending,
}: {
  selectedConversation: string | null;
  selectedUser: ProfileRow | null;
  selectedUserOnline: boolean | undefined;
  messages: MessageRow[];
  profileId?: string;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onInputKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onClearSelection: () => void;
  isSending: boolean;
}) {
  return (
    <Card className="relative flex h-full min-h-0 flex-col overflow-hidden rounded-3xl border-border/60 bg-background/70 p-0 backdrop-blur-xl">
      {selectedConversation ? (
        <>
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3 sm:px-5">
            <Button type="button" size="icon" variant="ghost" className="lg:hidden" onClick={onClearSelection}>
              <ArrowLeftIcon className="size-5" />
            </Button>

            <Avatar size="lg">
              <AvatarImage src={getAvatarUrl(selectedUser)} alt={getDisplayName(selectedUser)} />
              <AvatarFallback>{getDisplayName(selectedUser).slice(0, 2)}</AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <p className="truncate font-heading text-base">{getDisplayName(selectedUser)}</p>
              <p className="text-xs text-muted-foreground">{selectedUserOnline ? "Online" : "Away"}</p>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-3 py-4 sm:px-5">
            {messages.map((message) => (
              <ChatBubble key={message.id} message={message} mine={message.sender_id === profileId} />
            ))}
          </div>

          <div className="border-t border-border/60 p-3 sm:p-4">
            <ChatComposer
              value={input}
              onChange={onInputChange}
              onSend={onSend}
              onKeyDown={onInputKeyDown}
              disabled={isSending}
            />
          </div>
        </>
      ) : (
        <div className="grid h-full place-items-center px-6 text-center">
          <div className="space-y-3">
            <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/15 text-primary">
              <Sparkles className="size-6" />
            </div>
            <p className="font-heading text-xl">Select a conversation</p>
            <p className="text-sm text-muted-foreground">Pick someone from the left panel or start a new conversation.</p>
          </div>
        </div>
      )}
    </Card>
  );
}