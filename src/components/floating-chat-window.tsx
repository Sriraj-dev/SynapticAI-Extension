import { motion } from "framer-motion"
import { Paperclip, Send, SquarePen, X } from "lucide-react"
import { useEffect, useState } from "react"
import { ChatAPI } from "~api/chatapi"
import { useChatManager } from "~hooks/useChatManager"

import ChatBox from "~popup/components/home/ChatBox"
import { ChatInput } from "~popup/components/home/ChatInput"
import Tooltip from "~popup/components/ui/ToolTip"
import { logger } from "~utils/logger"

async function getChatHistory(authToken : string) {
  if (!authToken){
    console.error("Not Authorized!")
    return [];
  }

  const response = await ChatAPI.getChatHistory(authToken);

  return response.chatHistory;
}

export const FloatingChatWindow = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [context, setContext] = useState<string | null>(null)
  const [isContextAttached, setIsContextAttached] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);

  const {
      setInitialMessages,
      messages,
      streaming,
      streamMessage,
      engagingMessage,
      errorMessage,
      sendMessage,
      stop,
    } = useChatManager([])

  const getToken = async () => {
    try {
      logger.debug("[Synaptic AI] Getting token from floating chat window")
      chrome.runtime.sendMessage({ type: "get-token" }, (response) => {
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

    useEffect(()=>{
      getChatHistory(authToken)
        .then((history)=>{
          setInitialMessages(history);
        })
        .catch((err) => {
          console.warn("Error in fetching the chat history ", err);
          setInitialMessages([]);
        })
        .finally(() => {
          setLoadingMessages(false)
        });
    }, [isOpen])

  //To get the clerk token from background script
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
    if (!userQuery.trim() || streaming || !authToken) return

    const url = window.location.href
    const currentContext = context || ""

    await getToken()
    sendMessage(userQuery.trim(), url, currentContext, authToken)

    // Clear context after sending
    setContext(null)
    setIsContextAttached(false)
  }

  const removeContext = () => {
    setContext(null)
    setIsContextAttached(false)
  }

  const onClearChat = async ()=>{
    console.log("clearing chat")
    await getToken()
    if(!authToken){
      console.error("No Auth Token")
      return;
    }
    const response = await ChatAPI.clearChat(authToken)

    if(response){
      setInitialMessages([]);
    }else{
      console.error("Couldnt clear the chat, please try again!")
    }
  }

  //TODO: Redesign this button
  if (isLoading) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
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

  //TODO: Redesign this button
  if (!isOpen) {
    logger.debug("[Synaptic AI] Floating chat button showing...")
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-1 rounded-full transition-all duration-200">
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
          className="flex items-center justify-center gap-2 rounded-full shadow-xl transition-all bg-primary text-text-primary">
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
      className="flex flex-col w-[450px] h-[75vh] rounded-xl shadow-lg bg-primary backdrop-blur-lg overflow-hidden">
      {/* Header */}
      <div
        style={{
          height: "56px",
          minHeight: "56px"
        }}
        className="flex items-center justify-between px-6 py-4 border-b-1 border-text-tertiary shadow-lg bg-primary backdrop-blur-lg">
        <h3
          style={{
            lineHeight: "24px"
          }}
          className="text-text-primary text-lg font-semibold">
          Synaptic AI
        </h3>
        <div className="flex gap-2 items-center">
          <div
            onClick={onClearChat}
            className="rounded-full p-2 hover:bg-secondary-foreground cursor-pointer"
          >
            <SquarePen className="w-4 h-4 text-text-secondary" />
          </div>

        <button
          onClick={() => setIsOpen(false)}
          style={{
            width: "32px",
            height: "32px",
            padding: "6px"
          }}
          className="rounded-full hover:bg-secondary-foreground transition-colors">
          <X
            style={{
              width: "20px",
              height: "20px"
            }}
            className="text-text-secondary"
          />
        </button>
        </div>
      </div>

      <ChatBox
        messages={messages}
        streaming={streaming}
        streamMessage={streamMessage}
        engagingMessage={engagingMessage}
        errorMessage={errorMessage}
        user={ null }
      />

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

