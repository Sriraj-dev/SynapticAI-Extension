import { UserButton, useUser } from "@clerk/chrome-extension"
import { useState } from "react"

import { ChatWindow } from "../components/chat-window"
import { ThemeProvider } from "../components/theme-provider"
import { ThemeToggle } from "../components/theme-toggle"
import { Toggle } from "../components/ui/toggle"

export const Home = () => {
  const { isSignedIn } = useUser()
  const [isFloatingChatEnabled, setIsFloatingChatEnabled] = useState(false)

  const handleFloatingChatToggle = async (enabled: boolean) => {
    setIsFloatingChatEnabled(enabled)
    // Send message to content script to enable/disable floating chat
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    if (tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: "TOGGLE_FLOATING_CHAT",
        enabled
      })
    }
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="synaptic-ai-theme">
      <div className="h-[500px] flex flex-col min-w-96">
        <div className="flex items-center justify-between px-3 py-5 bg-background">
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Toggle
              pressed={isFloatingChatEnabled}
              onPressedChange={handleFloatingChatToggle}
              className="data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
              <span className="text-xs">Floating Chat</span>
            </Toggle>
          </div>
          <h1 className="text-center text-lg font-semibold">Synaptic AI</h1>
          <UserButton />
        </div>

        <div className="flex-1 overflow-hidden">
          {isSignedIn ? (
            <ChatWindow />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground text-center">
                Sign in to start chatting with Synaptic AI
              </p>
            </div>
          )}
        </div>
      </div>
    </ThemeProvider>
  )
}
