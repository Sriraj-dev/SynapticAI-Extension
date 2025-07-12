import { useAuth, UserButton, useUser } from "@clerk/chrome-extension";
import { SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChatAPI } from "~api/chatapi";
import { useChatManager } from "~hooks/useChatManager";
import Tooltip from "~popup/components/ui/ToolTip";
import { ChatWindow } from "../components/chat-window";
import { ThemeProvider } from "../components/theme-provider";
import { ThemeToggle } from "../components/theme-toggle";
import FloatingChatToggle from "../components/ui/AssistantToggle";


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
    stop,
  } = useChatManager([])

  const handleFloatingChatToggle = async (enabled: boolean) => {
    setIsFloatingChatEnabled(enabled)
    // Send message to content script to enable/disable floating chat
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_SYNAPTICAI_FLOATING_CHAT",
        enabled
      })
    }
    chrome.storage.local.set({ "synaptic-ai-floating-chat-enabled": enabled })
  }

  useEffect(() => {
    chrome.storage.local
      .get("synaptic-ai-floating-chat-enabled")
      .then((result) => {
        setIsFloatingChatEnabled(
          result["synaptic-ai-floating-chat-enabled"] ?? false
        )
      })
  }, [])

  const onClearChat = async ()=>{
    console.log("clearing chat")
    const authToken = await getToken()
    if(!authToken){
      console.error("No Auth Token")
      return;
    }
    const response = await ChatAPI.clearChat(authToken)

    if(response){
      setInitialMessages([]);
    }else{
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
          <h1 className="text-center text-lg font-semibold">Synaptic AI</h1>
          <UserButton />
        </div>

        <div className="flex flex-row justify-between px-3 py-1 bg-primary">
        <Tooltip content="Clear Chat">
          <div
            onClick={onClearChat}
            className="rounded-full p-2 hover:bg-secondary-foreground cursor-pointer"
          >
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
            <ChatWindow setInitialMessages={setInitialMessages} messages={messages} streaming={streaming} streamMessage={streamMessage} engagingMessage={engagingMessage} errorMessage={errorMessage} sendMessage={sendMessage} stop={stop} />
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