import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AutoTextarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";

export function ChatComposer({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-auto flex w-full items-end gap-2 rounded-2xl border border-border/70 bg-background p-2">
      <AutoTextarea
        className="min-h-12 max-h-40 flex-1 resize-none border-none bg-transparent focus-visible:ring-0"
        placeholder="type a message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <Button
        variant="default"
        size="icon-lg"
        className="ml-2 rounded-full cursor-pointer"
        disabled={disabled}
        onClick={onSend}
      >
        {disabled ? <Spinner className="h-4 w-4" /> : <Send />}
      </Button>
    </div>
  );
}