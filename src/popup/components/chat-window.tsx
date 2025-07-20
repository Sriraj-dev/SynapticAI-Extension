import { useAuth } from "@clerk/chrome-extension"
import { useUser } from "@clerk/chrome-extension"
import { ChatInput } from "./home/ChatInput"
import { useEffect, useState } from "react"
import { ChatAPI } from "~api/chatapi"
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
  const {user, isSignedIn} = useUser()
  

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
  }, [getToken, isSignedIn])

  if (loadingMessages) {
    return (
      <div className="flex items-center justify-center h-[75vh]">
          <div className="h-[24px] w-[24px] rounded-full bg-secondary-foreground animate-spin"></div>
        </div>
    )
  }

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
        placeHolder="Got a question? Ask here..."
        isLoading={streaming}
        isAuthLoaded={isSignedIn && isAuthLoaded}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
