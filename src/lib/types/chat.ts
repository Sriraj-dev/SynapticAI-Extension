export interface ChatMessage {
    id: string
    content: string
    role: "user" | "assistant"
    timestamp: Date
    isIntermediary?: boolean
}

export interface AgentRequest{
    userMessage : string
    url: string
    context? : string
}

export type SSEEventType = "error" | "message" | "complete" | "tool"

export interface AgentResponse{
    event : SSEEventType
    content : string
}
