import { motion } from "framer-motion"
import { MoveUp } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface ChatInputProps {
  placeHolder: string
  isLoading: boolean
  isAuthLoaded: boolean
  onSubmit: (query: string) => Promise<void>
}

export function ChatInput({ placeHolder, isLoading, isAuthLoaded, onSubmit }: ChatInputProps) {
  const [input, setInput] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleInput = () => {
    const el = textareaRef.current
    if (el) {
      el.style.height = "auto" // shrink back down
      el.style.height = `${el.scrollHeight}px` // grow to content
    }
  }

  const handleSubmit = (userQuery: string) => {
    if (!userQuery.trim() || isLoading) return
  
    onSubmit(userQuery.trim())
    setInput("")
  
    // Restore focus after submit
    if (textareaRef.current) {
      textareaRef.current.focus()
      textareaRef.current.style.height = "auto"
    }
  }

  return (
    <div className="bg-primary p-2 flex items-center gap-2">
        <motion.textarea
          ref={textareaRef}
          onInput={handleInput}
          whileFocus={{ scale: 1.01 }}
          style={{ maxHeight: "150px", minHeight: "50px" }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeHolder}
          className="flex-1 rounded-xl bg-primary-foreground text-text-primary px-3 py-2 text-sm outline-none placeholder:text-text-tertiary resize-none overflow-y-auto textbox-scrollbar"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              if(isLoading || !isAuthLoaded) return
              handleSubmit(textareaRef.current?.value || "")
              if (textareaRef.current) {
                textareaRef.current.value = ""
              }
            }
          }}
        />
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        type="submit"
        disabled={!input.trim() || isLoading || !isAuthLoaded}
        onClick={() => {
          handleSubmit(textareaRef.current?.value || "")
          if (textareaRef.current) {
            textareaRef.current.value = ""
          }
        }}
        className="rounded-full inline-flex h-btn w-btn items-center justify-center bg-percentage-filler text-white disabled:opacity-70 disabled:cursor-not-allowed"
      >
        <MoveUp className="h-icon w-icon" />
      </motion.button>
    </div>
  )
}