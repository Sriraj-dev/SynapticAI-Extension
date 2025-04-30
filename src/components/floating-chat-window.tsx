import { log } from "console"
import { AnimatePresence, motion } from "framer-motion"
import { Loader2, Paperclip, Send, X } from "lucide-react"
import { useEffect, useLayoutEffect, useRef, useState } from "react"

import useChatSSE from "~hooks/useChatSSE"
import { logger } from "~utils/logger"

export const FloatingChatWindow = () => {
  const [input, setInput] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [context, setContext] = useState<string | null>(null)
  const [isContextAttached, setIsContextAttached] = useState(false)

  const {
    messages,
    error,
    isLoading: isChatLoading,
    intermediaryMessage,
    isWaitingForResponse,
    askSynapticAI,
    saveToStorage
  } = useChatSSE()
  

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages,isOpen])

  const getToken = async () => {
    try {
      logger.debug("[Synaptic AI] Getting token from floating chat window")
      chrome.runtime.sendMessage({ greeting: "get-token" }, (response) => {
        logger.debug(
          "[Synaptic AI] Token received from floating chat window",
          response
        )
        setAuthToken(response?.token || null)
      })
    } catch (error) {
      logger.warn("[Synaptic AI] Error getting auth token:", error)
      setAuthToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    getToken()

    // // Listen for storage changes
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes["synaptic-ai-authToken"]) {
        getToken()
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleHighlightButtonClick = (e: Event) => {
      const customEvent = e as CustomEvent<{ context: string }>
      logger.debug("Highlight button clicked", customEvent.detail.context)
      removeContext()
      setContext(customEvent.detail.context)
      setIsContextAttached(true)
      setIsOpen(true)
    }

    document.addEventListener(
      "synaptic-ai-highlight-button-clicked",
      handleHighlightButtonClick
    )

    return () => {
      document.removeEventListener(
        "synaptic-ai-highlight-button-clicked",
        handleHighlightButtonClick
      )
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isChatLoading || !authToken) return

    setInput("")
    const url = window.location.href
    const currentContext = context || ""

    await getToken()
    await askSynapticAI(input.trim(), url, authToken, currentContext)

    // Clear context after sending
    setContext(null)
    setIsContextAttached(false)
  }

  const removeContext = () => {
    setContext(null)
    setIsContextAttached(false)
  }

  const handleClose = async () => {
    // Save messages to storage before closing
    setIsOpen(false)
    await saveToStorage()
  }

  if (isLoading) {
    return (
      <motion.div
        whileHover={{ borderWidth: "2px" }}
        className="p-1 rounded-full transition-all duration-200 border-primary/30">
        <button
          style={{
            width: "180px",
            height: "40px",
            fontSize: "14px",
            lineHeight: "20px",
            padding: "8px 16px"
          }}
          className="flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
          <Send className="h-5 w-5" />
          <span>Loading...</span>
        </button>
      </motion.div>
    )
  }

  if (!authToken) {
    logger.debug("[Synaptic AI]: No auth token found!")
    return null
  }

  if (!isOpen) {
    logger.debug("[Synaptic AI] Floating chat button showing...")
    return (
      <motion.div
        whileHover={{ borderWidth: "2px" }}
        className="p-1 rounded-full transition-all duration-200 border-primary/30">
        <button
          onClick={() => {
            setIsOpen(true)
          }}
          style={{
            width: "180px",
            height: "40px",
            fontSize: "14px",
            lineHeight: "20px",
            padding: "8px 16px"
          }}
          className="flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground shadow-xl hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all">
          <Send className="h-5 w-5" />
          <span>Ask Synaptic AI</span>
        </button>
      </motion.div>
    )
  }

  logger.debug("FloatingChatWindow: Showing chat box")
  return (
    <motion.div
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-[400px] h-[75vh] rounded-2xl shadow-lg bg-primary/90 backdrop-blur-lg border border-border/10 overflow-hidden">
      {/* Header */}
      <div
        style={{
          height: "56px",
          minHeight: "56px"
        }}
        className="flex items-center justify-between px-6 py-4 border-b-1 border-border shadow-lg bg-primary backdrop-blur-lg">
        <h3
          style={{
            fontSize: "16px",
            lineHeight: "24px"
          }}
          className="text-primary-foreground font-semibold tracking-tight">
          Synaptic AI
        </h3>
        <button
          onClick={handleClose}
          style={{
            width: "32px",
            height: "32px",
            padding: "6px"
          }}
          className="rounded-full hover:bg-muted/60 transition-colors">
          <X
            style={{
              width: "20px",
              height: "20px"
            }}
            className="text-muted-foreground"
          />
        </button>
      </div>

      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-primary/20 [&::-webkit-scrollbar-thumb]:bg-primary/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/60">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                style={{
                  fontSize: "14px",
                  lineHeight: "20px",
                  padding: "12px 20px",
                  borderRadius: "16px"
                }}
                className={`group relative max-w-[80%] leading-relaxed whitespace-pre-wrap ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}>
                {message.content}
                <span className="absolute -bottom-5 right-2 text-[10px] text-muted-foreground opacity-0 group-hover:opacity-70 transition-opacity">
                  {formatTime(message.timestamp)}
                </span>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center">
            <p className="text-sm text-destructive">{error}</p>
          </motion.div>
        )}

        {/* Intermediary message */}
        {intermediaryMessage && (
          <motion.div
            key={intermediaryMessage}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`flex justify-start`}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              style={{
                fontSize: "14px",
                lineHeight: "20px",
                padding: "12px 20px",
                borderRadius: "16px"
              }}
              className={`group relative max-w-[80%] leading-relaxed whitespace-pre-wrap bg-muted/80 text-foreground/70`}>
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
                {intermediaryMessage}
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Typing loader */}
        {isChatLoading && !intermediaryMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start">
            <motion.div
              className="relative max-w-[80%] px-4 py-2 bg-muted/60 rounded-2xl"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
              <div className="flex items-center gap-1 text-muted-foreground/50">
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0 }}>
                  .
                </motion.span>
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}>
                  .
                </motion.span>
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}>
                  .
                </motion.span>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Context indicator and input form - fixed at bottom */}
      <div className="shrink-0 bg-primary backdrop-blur-md">
        {isContextAttached && context && (
          <div
            style={{ padding: "12px 16px" }}
            className="px-6 py-2 border-t border-border/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Paperclip
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    minHeight: "14px"
                  }}
                  className="text-primary-foreground/80"
                />
                <p
                  style={{ fontSize: "12px" }}
                  className="text-primary-foreground/80">
                  Context attached
                </p>
              </div>
              <button
                onClick={removeContext}
                className="p-1 hover:bg-primary/30 rounded-full transition-colors"
                title="Remove context">
                <X
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    minHeight: "14px"
                  }}
                  className="text-primary-foreground/60"
                />
              </button>
            </div>
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-6 py-4">
          <motion.input
            whileFocus={{ scale: 1 }}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            style={{
              height: "40px",
              fontSize: "14px",
              lineHeight: "20px"
            }}
            onKeyDown={(e)=>e.stopPropagation()}
            onKeyUp={(e)=>e.stopPropagation()}
            onKeyPress={(e)=>e.stopPropagation()}
            className="flex-1 rounded-xl border border-muted-foreground bg-primary px-4 py-2.5 outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-primary-foreground"
            disabled={isChatLoading || !authToken}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={!input.trim() || isChatLoading || !authToken}
            style={{
              width: "40px",
              height: "40px"
            }}
            className="inline-flex items-center justify-center rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="h-4 w-4" />
          </motion.button>
        </form>
      </div>
    </motion.div>
  )
}

const formatTime = (date: Date) => {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
}
