import * as React from "react"
import TextareaAutosize, { TextareaAutosizeProps } from "react-textarea-autosize"
import { cn } from "@/lib/utils"

// Use TextareaAutosizeProps instead of React.TextareaHTMLAttributes
export interface AutoTextareaProps extends TextareaAutosizeProps {}

const AutoTextarea = React.forwardRef<HTMLTextAreaElement, AutoTextareaProps>(
  ({ className, maxRows = 5, minRows = 1, ...props }, ref) => {
    return (
      <TextareaAutosize
        className={cn(
          "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        maxRows={maxRows}
        minRows={minRows}
        // Pass the ref correctly to the component
        ref={ref} 
        {...props}
      />
    )
  }
)
AutoTextarea.displayName = "AutoTextarea"

export { AutoTextarea }