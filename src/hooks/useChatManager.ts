import { useRef, useState } from "react";
import { ChatAPI } from "~api/chatapi";
import type { ChatRequest } from "~lib/types/request_types";
import type { NewChatMessage, NoteLink } from "~lib/types/response_types";
import type { SSEMessage } from "~lib/types/sse_types";


export function useChatManager(initialMessages : NewChatMessage[] = []) {
  const [messages, setMessages] = useState<NewChatMessage[]>(initialMessages);
  const [streaming, setStreaming] = useState(false);
  const [streamMessage, setStreamMessage] = useState<string>("")
  const [engagingMessage, setEngagingMessage] = useState<string>("")
  const [errorMessage, setErrorMessage] = useState<string>("")
  const abortControllerRef = useRef<AbortController | null>(null);

  function setInitialMessages(messageHistory : NewChatMessage[]){
    setMessages(messageHistory)
  }

  // sendMessage implementation will come here
  async function sendMessage(userMessage: string, url:string, context:string = "", authToken : string){
    if(streaming){
        console.warn("Already Streaming...")
        return
    }
    const newUserMessage : NewChatMessage = {
        id: crypto.randomUUID(),
        role: "HumanMessage",
        content: userMessage,
        noteLinks : [],
        webLinks : [],
        timestamp: Date.now()
    }
    setMessages((prev) => [...prev, newUserMessage]);
    setStreaming(true);
    if(errorMessage.length > 0) setErrorMessage("")

    abortControllerRef.current = new AbortController();
    try{
        const noteLinks : NoteLink[]= [];
        const webLinks : string[] = [];

        await ChatAPI.askAI({
            authToken,
            userRequest : {
                userMessage,
                url,
                context
            } as ChatRequest,
            signal : abortControllerRef.current.signal,
            onMessage : (msg : SSEMessage)=>{
                if(msg.event != "stream") console.log(msg)
                
                switch(msg.event){
                    case "stream":
                        setStreamMessage(prevContent => `${prevContent}${msg.content}`)
                        break;
                    case "message":
                        setEngagingMessage(msg.content)
                        break;
                    case "notes-link":
                        noteLinks.push({
                            url : `${process.env.PLASMO_PUBLIC_SYNAPTIC_WEBSITE_URL}/notes/${msg.links?.url}`,
                            content : msg.links?.content || ""
                        })
                        break;
                    case "web-link":
                        webLinks.push(msg.content)
                        break;
                    case "complete":
                        const newAIMessage : NewChatMessage = {
                            id: crypto.randomUUID(),
                            role: "AIMessage",
                            content: msg.content,
                            noteLinks,
                            webLinks,
                            timestamp: Date.now()
                        }
                        setStreamMessage("")
                        setEngagingMessage("")
                        setMessages((prev) => [...prev, newAIMessage])
                        setStreaming(false)
                        break;
                    case "tool":
                        break;
                    case "error":
                        onError(msg.content)
                        break;
                    default:
                        console.log("Unknown event type : ", msg)
                }
            }
        })

    }catch(err){
        console.error("Error in processing the request : ", err)
        onError("")
    }finally{
        setStreaming(false)
        setStreamMessage("")
    }
  }

  function onError(err : string){
    setErrorMessage("We have encountered an issue while processing your request. Please try again!")
    console.error("Error in processing the request : ", err)

    if(streamMessage.trim().length > 0){
        const newAIMessage : NewChatMessage = {
            id: crypto.randomUUID(),
            role: "AIMessage",
            content: streamMessage,
            noteLinks : [],
            webLinks : [],
            timestamp: Date.now()
        }
        setStreamMessage("")
        setMessages((prev) => [...prev, newAIMessage])
    }
    setEngagingMessage("")
  }

  function stop() {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreaming(false);
      setEngagingMessage("");
      if(streamMessage.trim().length > 0){
        const newAIMessage : NewChatMessage = {
            id: crypto.randomUUID(),
            role: "AIMessage",
            content: streamMessage,
            noteLinks : [],
            webLinks : [],
            timestamp: Date.now()
        }
        setStreamMessage("")
        setMessages((prev) => [...prev, newAIMessage])
      }
      setStreamMessage("")
    }
  }

  return {
    setInitialMessages,
    messages,
    streaming,
    streamMessage,
    engagingMessage,
    errorMessage,
    sendMessage,
    stop,
  };
}