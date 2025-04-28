import { useAuth } from "@clerk/chrome-extension"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Send } from "lucide-react"
import { useEffect, useRef, useState } from "react"

import { useAuthToken } from "~contexts/auth-context"
import useChatSSE  from "~hooks/useChatSSE"

export function ChatWindow() {
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const {
    messages,
    error,
    isLoading,
    intermediaryMessage,
    isWaitingForResponse,
    askSynapticAI,
    saveToStorage
  } = useChatSSE()
  const { getToken, isLoaded: isAuthLoaded } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    // Add user message
    setInput("")

    // Get current tab URL using chrome.tabs API
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tab?.url || ""
    const context = "This is the context of the page"

    const authToken = await getToken()
    await askSynapticAI(input.trim(), url, authToken, context, true)

  }

  return (
    <div className="flex h-full flex-col">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-muted hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50">
        {messages.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">
              Start a conversation with Synaptic AI
            </p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}>
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className={`group relative max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}>
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <span className="absolute -bottom-5 right-0 text-[10px] opacity-0 group-hover:opacity-70 transition-opacity">
                    {formatTime(message.timestamp)}
                  </span>
                </motion.div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {isLoading && !intermediaryMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start">
            <motion.div
              className="relative max-w-[80%] rounded-lg px-4 py-2 bg-muted/50 border border-muted-foreground/20"
              animate={{
                borderColor: [
                  "rgba(0,0,0,0.1)",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.1)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1">
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                    className="text-muted-foreground/50">
                    .
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                    className="text-muted-foreground/50">
                    .
                  </motion.span>
                  <motion.span
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                    className="text-muted-foreground/50">
                    .
                  </motion.span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Intermediary message popup */}
      <AnimatePresence>
        {intermediaryMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-2">
            <motion.div
              animate={{
                borderColor: [
                  "rgba(0,0,0,0.1)",
                  "rgba(0,0,0,0.2)",
                  "rgba(0,0,0,0.1)"
                ]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative max-w-[80%] rounded-lg px-4 py-2 bg-muted/50 border border-muted-foreground/20">
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    ease: "linear"
                  }}>
                  <Loader2 className="h-4 w-4 text-muted-foreground/50" />
                </motion.div>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-muted-foreground/50">
                  {intermediaryMessage}
                </motion.p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input area */}
      <div className="border-t bg-background p-4">
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            disabled={isLoading || !isAuthLoaded}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isLoading || !isAuthLoaded}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </div>
  )
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
