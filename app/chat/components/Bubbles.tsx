import { Card } from "@/components/ui/card"

const SentBubble = (content: { id:string; message: string; user:"sender" | "receiver"; timestamp: Date }) => {
  return (
    <Card className=" whitespace-pre-line self-end gap-0.5 bg-primary text-sm text-white px-4 py-2 rounded-lg rounded-br-none max-w-3/5 mb-2 " >
      {content.message}<br/>
      <span className=" text-xs text-right  opacity-90 " >

      {content.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* Display time in HH:MM format */}
      </span>
    </Card>
  )
}

const ReceivedBubble = (content: { id:string; message: string; user:"sender" | "receiver"; timestamp: Date }) => {
  return (
    <Card className=" whitespace-pre-line  self-start gap-0.5 bg-background/70 text-sm text-foreground px-4 py-2 rounded-lg rounded-bl-none max-w-3/5 mb-2 " >
      {content.message}<br/>
      <span className=" text-xs  opacity-70  " >

      {content.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} {/* Display time in HH:MM format */}
      </span>
    </Card>
  )
}

export { SentBubble, ReceivedBubble }