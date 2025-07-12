import { AnimatePresence, motion } from "framer-motion"
import { Copy, Loader2 } from "lucide-react"
import { useEffect, useRef } from "react"
import { toast } from "sonner"

import type { NewChatMessage } from "~lib/types/response_types"

import { MarkdownRenderer } from "../../../components/ui/MarkdownRenderer"
import ReferenceCard from "../ui/ReferenceCard"

interface ChatBoxProps {
  messages: NewChatMessage[] | undefined
  streaming: boolean
  streamMessage: string
  engagingMessage: string
  errorMessage: string
  user: { fullName: string } | null
}

export default function ChatBox({
  messages,
  streaming,
  streamMessage,
  engagingMessage,
  errorMessage,
  user
}: ChatBoxProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streamMessage, engagingMessage])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Copied to clipboard!")
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast.error("Failed to copy text")
    }
  }

  return (
    <div className="flex flex-1 overflow-y-auto w-full">
      {messages && messages.length > 0 ? (
        <AnimatePresence>
          <div className="flex flex-col w-full overflow-y-auto p-2 gap-3 rounded-md textbox-scrollbar">
            {messages.map(
              (msg, idx) =>
                (msg.role.startsWith("AIMessage") ||
                  msg.role.startsWith("HumanMessage")) && (
                  <motion.div
                    {...(msg.role.startsWith("HumanMessage") && {
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      exit: { opacity: 0, y: 20 },
                      transition: { duration: 0.3 }
                    })}
                    key={idx}
                    className={`flex flex-col gap-1 text-sm
                    ${
                      msg.role.startsWith("AIMessage")
                        ? "bg-primary mr-auto max-w-[80%] text-text-primary p-2 rounded-3xl"
                        : "bg-chat-message ml-auto max-w-[80%] text-text-primary p-2 px-4 rounded-3xl shadow"
                    }
                  `}>
                    {/* TODO: Display the links if the Message contains any */}
                    {msg.noteLinks &&
                      msg.webLinks &&
                      (msg.noteLinks.length > 0 || msg.webLinks.length > 0) && (
                        <div className="flex flex-row gap-2 overflow-x-auto custom-scrollbar hover-scrollbar justify-start pb-3">
                          {msg.noteLinks.map((reference, idx) => (
                            <ReferenceCard
                              key={idx}
                              type="note"
                              url={reference.url}
                              content={reference.content}
                            />
                          ))}
                          {msg.webLinks.map((link, idx) => (
                            <ReferenceCard
                              key={idx}
                              type="web"
                              url={link}
                              content={link}
                            />
                          ))}
                        </div>
                      )}
                    <MarkdownRenderer markdown={msg.content} />
                    {/* {msg.content} */}
                    {msg.role.startsWith("AIMessage") &&
                      msg.content.length > 0 && (
                        <div
                          onClick={() => handleCopy(msg.content)}
                          className="
                            flex flex-row gap-2 items-center self-start mt-1 bg-primary-foreground text-text-primary text-xs px-3 py-2 rounded-2xl hover:bg-secondary cursor-pointer
                        ">
                          <Copy className="w-3 h-3" />
                          Copy
                        </div>
                      )}
                  </motion.div>
                )
            )}
            {streaming && streamMessage.length > 0 && (
              <div className="text-sm bg-primary mr-auto max-w-[80%] text-text-primary p-2 rounded-3xl shadow">
                {/* <MarkdownRenderer markdown={streamMessage} /> */}
                {streamMessage}
              </div>
            )}
            {streaming && engagingMessage.length == 0 && (
              <div className="mr-auto">
                <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
              </div>
            )}
            {streaming && engagingMessage.length > 0 && (
              <div className="flex flex-row gap-2 bg-primary-foreground max-w-[80%] items-center self-start rounded-2xl p-2">
                <Loader2 className="w-4 h-4 animate-spin text-text-secondary flex-shrink-0" />
                <div className="text-sm mr-auto text-text-secondary p-2 rounded-3xl shadow">
                  {engagingMessage}
                </div>
              </div>
            )}
            {errorMessage && errorMessage.length > 0 && (
              <div className="text-sm bg-primary max-w-[80%] text-center text-red-400 p-2 rounded-3xl">
                {errorMessage}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col flex-1 justify-center items-center w-full">
          <span className={`text-text-primary text-xl`}>
            Hello 👋, {user?.fullName}
          </span>
          {messages == undefined && (
            <div className="flex flex-row gap-2 items-center">
              <Loader2 className="w-4 h-4 animate-spin text-text-secondary" />
              <span className="text-text-secondary text-sm">
                Loading Chat History...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
