import { Endpoints } from "~lib/constants";
import type { ChatRequest } from "~lib/types/request_types";
import type { NewChatMessage } from "~lib/types/response_types";
import type { SSEMessage } from "~lib/types/sse_types";

const BASE_URL = process.env.PLASMO_PUBLIC_SYNAPTIC_API_URL || "http://localhost:3000"

export const ChatAPI = {

    async getChatHistory(authToken : string){
        try{
            const response = await fetch(
            `${BASE_URL}${Endpoints.chatHistory}`,
                {
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch note");
            }

            const answer = await response.json();
    
            return (answer) as {success: boolean, chatHistory: NewChatMessage[]};
        }catch(err){
            console.warn("Error in fetching the chat history ", err)
            throw err;
        }
    },

    async clearChat(authToken : string){
        try{
            const response = await fetch(
            `${BASE_URL}${Endpoints.clearChat}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch note");
            }
    
            return true;
        }catch(err){
            console.warn("Error in fetching the chat history ", err)
            throw err;
        }
    },

    async askAI({
        authToken,
        userRequest,
        signal,
        onMessage,
        onError
      }: {
        authToken: string;
        userRequest: ChatRequest;
        signal: AbortSignal;
        onMessage: (msg: SSEMessage) => void;
        onError?: (err: any) => void;
      }){
        try{
            const response = await fetch(`${BASE_URL}${Endpoints.askAI}`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${authToken}`,
                },
                body: JSON.stringify(userRequest),
                signal: signal,
            });

            if (!response.body) {
                throw new Error("No response body");
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            while(true){
                const { done, value } = await reader.read();
                if(done) break

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split("\n");
                buffer = lines.pop() || "";

                for(const line of lines){
                    if(line.startsWith("event:")){
                        const eventType = line.slice(6).trim();
                        continue;
                    }else if(line.startsWith("data:")){
                        const raw = line.slice(5).trim();
                        if (!raw) continue;
    
                        try{
                            const sseMessage : SSEMessage = JSON.parse(raw)    
                            onMessage(sseMessage)
                        }catch(err){
                            console.error("JSON parsing failed : ", err)
                            if (onError) onError(err);
                            else throw err;
                        }
                    }
                }
            }
        }catch(err){
            console.error("Failed to fetch response from SynapticAI ", err)
            if (onError) onError(err);
            else throw err;
        }
    }

}