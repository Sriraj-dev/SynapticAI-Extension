
import { logger } from "~utils/logger"
import type { AgentRequest, AgentResponse } from "../lib/types/chat"

const BASE_URL = process.env.PLASMO_PUBLIC_SYNAPTIC_API_URL || "http://localhost:3000"


export async function fetchAgentResponse
(
    request : AgentRequest,
    authToken : string,
    onMessage : (event : AgentResponse) => void,
)
{
    logger.info({
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${authToken}`
        },
        body : JSON.stringify(request)
    })  
    const response = await fetch(`${BASE_URL}/askAI`,{
        method : "POST",
        headers : {
            "Content-Type" : "application/json",
            "Authorization" : `Bearer ${authToken}`
        },
        body : JSON.stringify(request)
    })

    if(!response.ok){
        logger.warn("Error", response)
        if(response.status === 401){
            throw new Error("Seems like you are not logged in, please login from dashboard to continue")
        }
        else{
            throw new Error("We are facing some issues, please try again later")
        }
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    let buffer = ""
    while(true){
        const {done, value} = await reader?.read()
        if(done) break

        buffer += decoder.decode(value || new Int8Array(), {stream : true})
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for(const line of lines){
            
            if(line.startsWith("data: ")){
                try {
                    const event: AgentResponse = JSON.parse(line.slice(6));
                    onMessage(event);
                } catch (err) {
                    logger.warn('Failed to parse SSE event', err);
                    return {
                        event : "error",
                        content : "We are facing some issues, please try again later"
                    }
                }
            }
        }
        
    }
}


