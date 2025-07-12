import { useAuth } from "@clerk/chrome-extension"
import { useUser } from "@clerk/chrome-extension"
import { ChatInput } from "./home/ChatInput"
import useChatSSE  from "~hooks/useChatSSE"
import { useEffect, useState } from "react"
import { ChatAPI } from "~api/chatapi"
import { useChatManager } from "~hooks/useChatManager"
import ChatBox from "./home/ChatBox"

async function getChatHistory(getToken: any) {
  const authToken = await getToken();
  if (!authToken) throw new Error("Please login to continue");

  const response = await ChatAPI.getChatHistory(authToken);

  return response.chatHistory;
}

export function ChatWindow({
  setInitialMessages,
  messages,
  streaming,
  streamMessage,
  engagingMessage,
  errorMessage,
  sendMessage,
  stop,
}) {
  const [loadingMessages, setLoadingMessages] = useState<boolean>(true);
  const { getToken, isLoaded: isAuthLoaded } = useAuth()
  const {user} = useUser()
  

  useEffect(()=>{
    getChatHistory(getToken)
      .then((history)=>{
        console.log(history)
        setInitialMessages(history);
      })
      .catch((err) => {
        console.warn("Error in fetching the chat history ", err);
        setInitialMessages([]);
      })
      .finally(() => {
        console.log("Chat history fetched - ", history);
        setLoadingMessages(false)
      });
  }, [getToken])

  if(loadingMessages) return <div className="flex h-full flex-col items-center justify-center">Loading...</div>

  const handleSubmit = async (userQuery: string) => {
    if (!userQuery.trim() || streaming) return
    

    // Get current tab URL using chrome.tabs API
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
    const url = tab?.url || ""

    const authToken = await getToken()
    sendMessage(userQuery.trim(),url, "", authToken)
  }

  //TODO: Handle the stop button as well.

  return (
    <div className="flex h-full flex-col">
      <ChatBox
      messages={messages}
      streaming={streaming}
      streamMessage={streamMessage}
      engagingMessage={engagingMessage}
      errorMessage={errorMessage}
      user={user}
      />
      <ChatInput
        isLoading={streaming}
        isAuthLoaded={isAuthLoaded}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
