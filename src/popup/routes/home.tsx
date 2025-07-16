import { useAuth, UserButton, useUser } from "@clerk/chrome-extension"
import { SquarePen } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import { ChatAPI } from "~api/chatapi"
import { useChatManager } from "~hooks/useChatManager"
import Tooltip from "~popup/components/ui/ToolTip"

import { ChatWindow } from "../components/chat-window"
import { ThemeProvider } from "../components/theme-provider"
import { ThemeToggle } from "../components/theme-toggle"
import FloatingChatToggle from "../components/ui/AssistantToggle"

const dashboardLink =
  process.env.PLASMO_PUBLIC_SYNAPTIC_WEBSITE_URL || "https://synapticai.app"

export const Home = () => {
  const { getToken } = useAuth()

  const { isSignedIn } = useUser()
  const [isFloatingChatEnabled, setIsFloatingChatEnabled] = useState(false)
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

  const handleFloatingChatToggle = async (enabled: boolean) => {
    setIsFloatingChatEnabled(enabled)
    chrome.storage.local.set({ "synaptic-ai-web-assistant-enabled": enabled })
  }

  useEffect(() => {
    chrome.storage.local
      .get("synaptic-ai-web-assistant-enabled")
      .then((result) => {
        setIsFloatingChatEnabled(
          result["synaptic-ai-web-assistant-enabled"] ?? false
        )
      })
  }, [])

  const onClearChat = async () => {
    console.log("clearing chat")
    const authToken = await getToken()
    if (!authToken) {
      console.error("No Auth Token")
      return
    }
    const response = await ChatAPI.clearChat(authToken)

    if (response) {
      setInitialMessages([])
    } else {
      toast.error("Couldnt clear the chat, please try again!")
    }
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="synaptic-ai-theme">
      <div className="h-[600px] flex flex-col min-w-96">
        <div className="flex items-center justify-between px-3 py-3 bg-primary">
          <div className="flex items-center">
            <ThemeToggle />
          </div>
          <a
            href={dashboardLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 -ml-8">
            <h1 className="text-lg font-semibold text-center hover:underline cursor-pointer hover:scale-110 transition-transform">
              Synaptic AI
            </h1>
          </a>
          <UserButton />
        </div>

        <div className="flex flex-row justify-between px-3 py-1 bg-primary">
          <Tooltip content="Clear Chat">
            <div
              onClick={onClearChat}
              className="rounded-full p-2 hover:bg-secondary-foreground cursor-pointer">
              <SquarePen className="w-4 h-4 text-text-tertiary" />
            </div>
          </Tooltip>
          <FloatingChatToggle
            isEnabled={isFloatingChatEnabled}
            onToggle={handleFloatingChatToggle}
          />
        </div>

        <div className="flex-1 overflow-hidden">
          {isSignedIn ? (
            <ChatWindow
              setInitialMessages={setInitialMessages}
              messages={messages}
              streaming={streaming}
              streamMessage={streamMessage}
              engagingMessage={engagingMessage}
              errorMessage={errorMessage}
              sendMessage={sendMessage}
              stop={stop}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-text-secondary text-center">
                Sign in to start chatting with Synaptic AI
              </p>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
