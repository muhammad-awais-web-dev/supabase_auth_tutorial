"use client"
import React, { useEffect, useState } from "react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { SentBubble, ReceivedBubble } from "./Bubbles";
import { AutoTextarea } from "@/components/ui/textarea";



const ChatWindow = ({ selectedConversation }: { selectedConversation: string | null }) => {

  const [messages, setMessages] = useState<{ id: string; message: string; user: "sender" | "receiver"; timestamp: Date }[]>([]);

  useEffect(()=>{

    setMessages([
      { id:"1", message: "Hello!", user: "sender", timestamp: new Date() },
      { id:"2", message: "Hi there!", user: "receiver", timestamp: new Date() },
      { id:"3", message: "How are you?", user: "sender", timestamp: new Date() },
      { id:"4", message: "I'm good, thanks! How about you?", user: "receiver", timestamp: new Date() },
      { id:"5", message: "Doing well, just working on a project.", user: "sender", timestamp: new Date() },
      { id:"6", message: "That's great to hear! What kind of project?", user: "receiver", timestamp: new Date() },
      { id:"7", message: "It's a chat application using React and Supabase.", user: "sender", timestamp: new Date() },
      { id:"8", message: "Sounds interesting! Let me know if you need any help.", user: "receiver", timestamp: new Date() },
    ])
  },[])

  const [input, setInput] = useState<string>("");

  const sendMessage = () => {
    if (input.trim() === "") return;
    // Here you would typically send the message to your backend or Supabase
    setMessages((prev) => [...prev, { id: Date.now().toString(), message: input, user: "sender", timestamp: new Date() }]);
    setInput("");
  }

  return (
    <div className=" relative flex flex-col h-screen w-2/3 items-start justify-center p-10 overflow-hidden " >
          <div
            className=" absolute inset-0 bg-cover bg-center opacity-30 pointer-events-none "
            style={{ backgroundImage: "url('/chat-bg.webp')" }}
          />
          {selectedConversation ? (

          <Card className=" relative z-10 w-full flex flex-col h-full bg-transparent backdrop-blur-sm p-5 " >
            <div className=" text-2xl h-full font-bold flex flex-col justify-end text-gray-700 " >
              {/* Messages : {selectedConversation} */}
              {messages.map((msg) => (
                msg.user === "sender" ? <SentBubble key={msg.id} {...msg} /> : <ReceivedBubble key={msg.id} {...msg} />
              ))}
            </div>
            <div className=" mt-auto w-full flex bg-background p-2 rounded-2xl items-end" >
                {/* <input type="text-area" placeholder="Type a message..." className=" w-full px-5 focus:outline-none " /> */}
                <AutoTextarea 
                  className=" resize-none focus-visible:outline-none focus-visible:ring-0 border-none " 
                  placeholder="type a message" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
                <Button variant="default" size={"icon-lg"} className=" ml-2 rounded-full cursor-pointer  " onClick={sendMessage}>
                  <Send />
                </Button>
            </div>
          </Card>
          ) : (null)}
    </div>
  )
}

export default ChatWindow
