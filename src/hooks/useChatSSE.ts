import { useState } from "react"
import type { AgentRequest, AgentResponse, ChatMessage } from "~types/chat"
import { fetchAgentResponse } from "~api/synaptic_api"
import { usePersistentChat } from "./usePersistentChat"
import { logger } from "~utils/logger"

const useChatSSE = () => {
    const { messages, addMessage, saveToStorage, isInitialized } = usePersistentChat()
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [intermediaryMessage, setIntermediaryMessage] = useState<string | null>(null)
    const [isWaitingForResponse, setIsWaitingForResponse] = useState(false)

    const askSynapticAI = async (userMessage : string, url:string,  authToken : string,context?:string,autoSave = false) => {
        setIsLoading(true)
        setIsWaitingForResponse(true)
        
        // Add user message to memory
        const userModifiedMessage = ((context && context.trim() !== "") ? `Here is the context(paragraph) that I have highlighted on the website for you to reference: ${context}\n\n Here is my query: ${userMessage}` : userMessage)
        addMessage(
        {
            id : Date.now().toString(),
            content : (context && context.trim() !== "") ? "(context attached)\n" + userMessage : userMessage,
            role : "user", timestamp : new Date()
        },
        autoSave)

        setError(null)
        setIntermediaryMessage(null)
        
        logger.debug("context passing to AI = ", context)

        const payload = {
            userMessage : userModifiedMessage,
            url,
            context
        } as AgentRequest

        try{
            await fetchAgentResponse(payload, authToken, (event : AgentResponse) => {
                setIsWaitingForResponse(false)
    
                if(event.event === "message"){
                    setIntermediaryMessage(event.content)
                }
                else if(event.event === "complete"){
                    const assistantMessage : ChatMessage = {
                        id : Date.now().toString(),
                        content : event.content,
                        role : "assistant",
                        timestamp : new Date()
                    }
                    // Add assistant message to memory
                    addMessage(assistantMessage, autoSave)
                    setIntermediaryMessage(null)
                    setIsLoading(false)
                }
    
                if(event.event === "error"){
                    setError(event.content)
                    setIntermediaryMessage(null)
                    setIsLoading(false)
                }
            })
        }catch(err){
            setIsLoading(false)
            setIntermediaryMessage(null)
            setError(err.message)
        }
    }

    return {
        messages,
        error,
        isLoading,
        intermediaryMessage,
        isWaitingForResponse,
        askSynapticAI,
        isInitialized,
        saveToStorage
    }
}

export default useChatSSE