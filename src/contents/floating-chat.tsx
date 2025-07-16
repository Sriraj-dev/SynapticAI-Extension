import tailwindCSS from "data-text:~styles/content_script.css"
import type { PlasmoCSConfig } from "plasmo"
import { useEffect, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import { FloatingChatWindow } from "~components/floating-chat-window"
import { logger } from "~utils/logger"

export const config: PlasmoCSConfig = {
  matches: ["<all_urls>"]
}

// Default export for Plasmo
// Just to suppress the error on chrome dev console
// Seems like plasmo is expecting a default export for content scripts
export default function FloatingChat() {
  const enabledRef = useRef(false)

  useEffect(() => {
    chrome.storage.local
      .get("synaptic-ai-web-assistant-enabled")
      .then((result) => {
        if (result["synaptic-ai-web-assistant-enabled"]) {
          container.style.display = "block"
          enabledRef.current = true
        } else {
          container.style.display = "none"
        }
      })

    // ✅ Listen for storage changes
    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange }
    ) => {
      console.log("Storage change recieved")
      if (changes["synaptic-ai-web-assistant-enabled"]) {
        const newValue = changes["synaptic-ai-web-assistant-enabled"].newValue
        enabledRef.current = newValue
        container.style.display = newValue ? "block" : "none"
      }
    }

    chrome.storage.onChanged.addListener(handleStorageChange)

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    const handleMouseUp = (_) => {
      if (!enabledRef.current) return
      logger.debug("[Synaptic AI] Mouseup event detected")
      const selection = window.getSelection()?.toString()?.trim()
      if (selection) {
        selectedText = selection
        positionSelectionButton()
        showSelectionButton()
      } else {
        hideSelectionButton()
      }
    }
    // Listen to mouseup for selection
    document.addEventListener("mouseup", handleMouseUp)
    return () => {
      document.removeEventListener("mouseup", handleMouseUp)
    }
  })

  return null
}

//Create a element for showing a button when user highlights text
const selectionButton = document.createElement("div")
selectionButton.id = "synaptic-ai-highlight-button"
selectionButton.innerText = "Ask SynapticAI"

selectionButton.style.cssText = `
  position: absolute;
  z-index: 9999999;
  padding: 6px 12px;
  font-size: 12px;
  background: #4f46e5;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: none; /* Hide initially */ 
`
document.body.appendChild(selectionButton)

// Create a container for our floating chat
const container = document.createElement("div")
container.id = "synaptic-ai-content-script"
container.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000000;
  padding: 8px;
  overflow: visible;
  display: none; /* Will be triggered by enabling it from popup */
`

// Create a shadow root
const shadowRoot = container.attachShadow({ mode: "open" })

const style = document.createElement("style")

style.textContent = `
  :host {
    display: block;
    contain: content;
  }

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    @apply bg-background text-text-primary font-sans;
  }
    
  #synaptic-ai-app-chatbox {
    position: relative;
    width: 100%;
    height: 100%;
  }
`

const tailwindStyle = document.createElement("style")
tailwindStyle.textContent = `
${tailwindCSS}

body {
    @apply bg-background text-text-primary font-sans;
}
`

const appContainer = document.createElement("div")
appContainer.id = "synaptic-ai-app-chatbox"

shadowRoot.appendChild(tailwindStyle)
shadowRoot.appendChild(style)
shadowRoot.appendChild(appContainer)

// Append the container to the document body
document.body.appendChild(container)

// Render the floating chat in the shadow DOM
const root = createRoot(appContainer)
root.render(<FloatingChatWindow/>)

let selectedText = ""

selectionButton.addEventListener("click", () => {
  logger.debug("Selection button clicked")
  selectionButton.style.display = "none"

  document.dispatchEvent(
    new CustomEvent("synaptic-ai-highlight-button-clicked", {
      detail: {
        context: selectedText
      },
      bubbles: true,
      composed: true
    })
  )
})

function positionSelectionButton() {
  const selection = window.getSelection()
  if (selection && selection.toString().trim()) {
    const range = selection.getRangeAt(0)
    const endRange = range.cloneRange()
    endRange.collapse(false)

    const rects = endRange.getClientRects()
    if (rects.length > 0) {
      const rect = rects[0]
      const scrollLeft =
        window.pageXOffset || document.documentElement.scrollLeft
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop

      selectionButton.style.left = `${rect.right + scrollLeft + 5}px`
      selectionButton.style.top = `${rect.top + scrollTop + 20}px`
    }
  }
}

function showSelectionButton() {
  selectionButton.style.display = "block"
  selectionButton.style.opacity = "0"
  selectionButton.style.transform = "scale(0.8)"
  selectionButton.style.transition = "opacity 0.2s ease, transform 0.2s ease"

  requestAnimationFrame(() => {
    selectionButton.style.opacity = "1"
    selectionButton.style.transform = "scale(1)"
  })
}

function hideSelectionButton() {
  selectionButton.style.transition = "opacity 0.2s ease, transform 0.2s ease"
  selectionButton.style.opacity = "0"
  selectionButton.style.transform = "scale(0.8)"

  setTimeout(() => {
    selectionButton.style.display = "none"
  }, 200) // Wait for transition to complete
}
