"use client";
import React, { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { Database } from "@/types/supabase";
import { useChat } from "@/providers/chat-provider";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { SentBubble, ReceivedBubble } from "./Bubbles";
import { AutoTextarea } from "@/components/ui/textarea";


const ChatWindow = ({
  selectedConversation,
}: {
  selectedConversation: string | null;
}) => {
  const supabase = createClient();
  const { session } = useAuth();
  const { messages, sendMessage : sendMessageFromContext } = useChat();
  // const [messages, setMessages] = useState<Database["public"]["Tables"]["messages"]["Row"][]>([]);


  const [input, setInput] = useState<string>("");

  const sendMessage = () => {
    if (!selectedConversation || !session) return;
    sendMessageFromContext(selectedConversation, input).then(() => {
      setInput("");
    });
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter") return;

    // Send on Enter. Allow Ctrl+Enter to keep the default newline behavior.
    if (!e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className=" relative flex flex-col h-screen w-2/3 items-start justify-center p-10 overflow-hidden ">
      <div
        className=" absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none "
        style={{ backgroundImage: "url('/chat-bg.webp')" }}
      />
      {selectedConversation ? (
        <Card className=" relative z-10 w-full flex flex-col h-full bg-transparent backdrop-blur-sm p-5 ">
          <div className=" text-2xl h-full font-bold flex flex-col justify-end text-gray-700 ">
            {/* Messages : {selectedConversation} */}
            {messages.filter((msg) => msg.conversation_id === selectedConversation).map((msg) =>
              msg.sender_id === session?.user.id ? (
                <SentBubble key={msg.id} {...msg} />
              ) : (
                <ReceivedBubble key={msg.id} {...msg} />
              ),
            )}
          </div>
          <div className=" mt-auto w-full flex bg-background p-2 rounded-2xl items-end">
            {/* <input type="text-area" placeholder="Type a message..." className=" w-full px-5 focus:outline-none " /> */}
            <AutoTextarea
              className=" resize-none focus-visible:outline-none focus-visible:ring-0 border-none "
              placeholder="type a message"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
            />
            <Button
              variant="default"
              size={"icon-lg"}
              className=" ml-2 rounded-full cursor-pointer  "
              onClick={sendMessage}
            >
              <Send />
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default ChatWindow;
