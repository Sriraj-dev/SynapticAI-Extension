import { useState, useCallback, useEffect } from "react"
import type { ChatMessage } from "~types/chat"
import { logger } from "~utils/logger"

const STORAGE_KEY = "synaptic-ai-extension-chat-messages"
const MESSAGE_EXPIRY_TIME = 30 * 60 * 1000 // 30 minutes in milliseconds

interface StoredMessage {
  id: string
  content: string
  role: "user" | "assistant"
  timestamp: string
  isIntermediary?: boolean
}

interface StoredMessages {
  messages: StoredMessage[]
  lastAccessed: number
}

export function usePersistentChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load messages from storage only once when component mounts
  useEffect(() => {
    const initializeMessages = async () => {
      if (!isInitialized) {
        try {
          const result = await chrome.storage.local.get(STORAGE_KEY)
          const storedData: StoredMessages = result[STORAGE_KEY]
          
          if (storedData) {
            const now = Date.now()
            const timeSinceLastAccess = now - storedData.lastAccessed

            if (timeSinceLastAccess > MESSAGE_EXPIRY_TIME) {
              // Messages are expired, clear them from storage
              await chrome.storage.local.remove(STORAGE_KEY)
              setMessages([])
            } else {
              // Messages are still valid, load them
              const parsedMessages = storedData.messages.map(msg => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
              console.log("Initializing Messages")
              setMessages(parsedMessages)
            }
          }
        } catch (error) {
          logger.warn('Error loading messages from storage:', error)
        } finally {
          setIsInitialized(true)
        }
      }
    }
    initializeMessages()
  }, [isInitialized])

  // Add message to memory only
  const addMessage = useCallback((message: ChatMessage, autoSave = false) => {
    setMessages(prev => {
      const updatedMessages = [...prev, message]
      if (autoSave) {
        saveToStorage(updatedMessages) 
      }
      return updatedMessages
    })
  }, [])

  // Save current messages to storage
  const saveToStorage = useCallback(async (messagesOverride?: ChatMessage[]) => {
    try {
    console.log("Saving messages to storage")
    
    const targetMessages = messagesOverride || messages
      const messagesToStore: StoredMessage[] = targetMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp.toISOString()
      }))
      
      const storedData: StoredMessages = {
        messages: messagesToStore,
        lastAccessed: Date.now()
      }
      
      await chrome.storage.local.set({ [STORAGE_KEY]: storedData })
      return true
    } catch (error) {
      logger.warn('Error saving messages to storage:', error)
      return false
    }
  }, [messages])

  // Clear messages from both memory and storage
  const clearMessages = useCallback(async () => {
    setMessages([])
    await chrome.storage.local.remove(STORAGE_KEY)
  }, [])

  return {
    messages,
    addMessage,
    saveToStorage,
    clearMessages,
    isInitialized
  }
} 