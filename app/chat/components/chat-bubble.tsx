import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/supabase";

type MessageRow = Database["public"]["Tables"]["messages"]["Row"];

export function ChatBubble({
  message,
  mine,
}: {
  message: MessageRow;
  mine: boolean;
}) {
  return (
    <div className={cn("flex w-full", mine ? "justify-end" : "justify-start")}>
      <Card
        className={cn(
          "mb-2 flex max-w-[85%] flex-col gap-0.5 px-4 py-2 text-sm sm:max-w-[75%] lg:max-w-[60%]",
          mine
            ? "rounded-br-none bg-primary text-white"
            : "rounded-bl-none bg-background/70 text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap wrap-break-word">{message.content}</p>
        <span className={cn("text-xs", mine ? "text-white/80" : "text-foreground/70")}>
          {message.created_at
            ? new Date(message.created_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </span>
      </Card>
    </div>
  );
}