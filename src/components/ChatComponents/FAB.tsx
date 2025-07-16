import { motion } from "framer-motion"
import { BotMessageSquare, X } from "lucide-react"
import Lottie from "lottie-react"
import animabot from "~/assets/lottie/anima-bot.json"

export const FAB = ({ title, onOpen }: { title: string, onOpen: () => void}) => {
  return (
    <div className="relative">
      {/* Cross (X) Button */}
      <button
        onClick={() => {
          chrome.storage.local.set({
            "synaptic-ai-web-assistant-enabled": false
          })
        }}
        className="relative ml-auto translate-y-base z-20 h-2xl w-2xl items-center justify-center rounded-full bg-primary text-white text-[15px] hover:border hover:border-text-tertiary hover:text-text-primary transition flex hover:bg-red-400 font-sans"
        aria-label="Hide Chat Button">
        <X className="w-xl h-xl"></X>
      </button>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="transition-all duration-200 relative z-10 rounded-full p-[2px] bg-gradient-to-r from-pink-500 via-yellow-400 to-blue-500 animate-border">
        <div className="animate-pulse-glow">
          <button
            onClick={onOpen}
            className="flex items-center justify-center gap-2 w-[180px] h-[40px] rounded-full bg-primary text-text-primary text-sm shadow-xl transition-all">
            {/* <BotMessageSquare className="h-icon w-icon" /> */}
            <Lottie animationData={animabot} className="h-btn w-btn" loop autoplay />
            <span className="font-sans">{title}</span>
          </button>
        </div>
      </motion.div>
    </div>
  )
}
