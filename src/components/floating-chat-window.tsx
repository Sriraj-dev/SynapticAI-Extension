import { motion } from "framer-motion"
import { BotMessageSquare, Paperclip, Send, SquarePen, X } from "lucide-react"
import { useEffect, useState } from "react"

import { ChatAPI } from "~api/chatapi"
import { useChatManager } from "~hooks/useChatManager"
import ChatBox from "~popup/components/home/ChatBox"
import { ChatInput } from "~popup/components/home/ChatInput"
import { logger } from "~utils/logger"

import { FAB } from "./ChatComponents/FAB"

async function getChatHistory(authToken: string) {
  if (!authToken) {
    console.error("Not Authorized!")
    return []
  }

  const response = await ChatAPI.getChatHistory(authToken)

  return response.chatHistory
}

export const FloatingChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [context, setContext] = useState<string | null>(null)
  const [isContextAttached, setIsContextAttached] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState<boolean>(false)

  const {
    setInitialMessages,
    messages,
    streaming,
    streamMessage,
    engagingMessage,
    errorMessage,
    sendMessage,
    stop
  } = useChatManager([])


  const getToken = async (): Promise<string | null> => {
    logger.debug("[Synaptic AI] Requesting token from background script")
  
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(
          { type: "synaptic-ai-encrypted-token" },
          (response) => {
            resolve(response?.token || null)
          }
        )
      } catch (error) {
        logger.warn("[Synaptic AI] Error getting auth token:", error)
        resolve(null)
      }
    })
  }

  //To get the users Chat History
  useEffect(() => {
    const fetchData = async () => {
      try {
        const authToken = await getToken()
  
        const history = await getChatHistory(authToken)
        setInitialMessages(history)
      } catch (err) {
        console.warn("Error in fetching the chat history ", err)
        setInitialMessages([])
      } finally {
        setLoadingMessages(false)
      }
    }
  
    if (isOpen) {
      setLoadingMessages(true)
      fetchData()
    }
  }, [isOpen])


  //To get the context from the highlight button click
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

  const handleSubmit = async (userQuery: string) => {
    if (!userQuery.trim() || streaming || loadingMessages) return

    const url = window.location.href
    const currentContext = context || ""

    const authToken = await getToken()
    sendMessage(userQuery.trim(), url, currentContext, authToken)

    // Clear context after sending
    removeContext()
  }

  const removeContext = () => {
    setContext(null)
    setIsContextAttached(false)
  }

  const onClearChat = async () => {
    console.log("clearing chat")
    setLoadingMessages(true)

    const authToken = await getToken()
    if (!authToken) {
      console.error("No Auth Token")
      return
    }

    const response = await ChatAPI.clearChat(authToken)

    if (response) {
      setInitialMessages([])
    } else {
      console.error("Couldnt clear the chat, please try again!")
    }
    setLoadingMessages(false)
  }

  if (loadingMessages && !isOpen) {
    return <FAB title="Loading..." onOpen={() => {}} />
  }

  if (!isOpen) {
    return <FAB title="Ask Synaptic AI" onOpen={() => setIsOpen(true)} />
  }

  return (
    <motion.div
      // initial={{ opacity: 0, y: 100 }}
      // animate={{ opacity: 1, y: 0 }}
      // exit={{ opacity: 0, y: 100 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col w-[450px] h-[75vh] rounded-xl shadow-lg bg-primary backdrop-blur-lg overflow-hidden">
      {/* Header */}
      <div
        style={{
          height: "56px",
          minHeight: "56px"
        }}
        className="flex items-center justify-between px-xl py-base border-b-1 border-text-tertiary shadow-lg bg-primary backdrop-blur-lg">
        <h3
          style={{
            lineHeight: "24px"
          }}
          className="text-text-primary text-lg font-sans">
          Synaptic AI
        </h3>
        <div className="flex gap-2 items-center">
          <div
            onClick={onClearChat}
            className="rounded-full p-2 hover:bg-secondary-foreground cursor-pointer">
            <SquarePen className="w-icon h-icon text-text-secondary" />
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              padding: "6px"
            }}
            className="w-btn h-btn rounded-full hover:bg-secondary-foreground transition-colors items-center justify-center">
            <X className="w-icon h-icon text-text-secondary" />
          </button>
        </div>
      </div>

      {loadingMessages && (
        <div className="flex items-center justify-center h-[75vh]">
          <div className="h-[24px] w-[24px] rounded-full bg-secondary-foreground animate-spin"></div>
        </div>
      )}
      
      { !loadingMessages && <ChatBox
        messages={messages}
        streaming={streaming}
        streamMessage={streamMessage}
        engagingMessage={engagingMessage}
        errorMessage={errorMessage}
        user={null}
      />}


      {/* Context indicator and input form - fixed at bottom */}
      <div className="shrink-0 bg-primary backdrop-blur-md">
        {isContextAttached && context && (
          <div
            style={{ padding: "12px 16px" }}
            className="px-6 py-2 border-t border-text-tertiary">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 flex items-center gap-2">
                <Paperclip
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    minHeight: "14px"
                  }}
                  className="text-text-secondary"
                />
                <p style={{ fontSize: "12px" }} className="text-text-secondary">
                  Context attached
                </p>
              </div>
              <button
                onClick={removeContext}
                className="p-1 hover:bg-secondary-foreground rounded-full transition-colors"
                title="Remove context">
                <X
                  style={{
                    width: "14px",
                    height: "14px",
                    minWidth: "14px",
                    minHeight: "14px"
                  }}
                  className="text-text-secondary"
                />
              </button>
            </div>
          </div>
        )}
        <ChatInput
          placeHolder="Need help with something here? Just ask..."
          isLoading={streaming}
          isAuthLoaded={true}
          onSubmit={handleSubmit}
        />
      </div>
    </motion.div>
  )
}
