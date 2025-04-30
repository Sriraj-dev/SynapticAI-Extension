import { createClerkClient } from '@clerk/chrome-extension/background'
import { logger } from '~utils/logger'

const publishableKey = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const syncHost = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST
if (!publishableKey) {
  logger.warn("[Synaptic AI] Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

// Use `createClerkClient()` to create a new Clerk instance
// and use `getToken()` to get a fresh token for the user
async function getToken() {
  const clerk = await createClerkClient({
    publishableKey,
    syncHost
  })

  if (!clerk.session) {
    return null
  }
  
  logger.debug("[Synaptic AI] Getting token from background script")
  return await clerk.session?.getToken()
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if(request.type === "get-token"){
    getToken()
      .then((token) => sendResponse({ token }))
      .catch((error) => {
        logger.warn('[Synaptic AI Background service worker] Error:', JSON.stringify(error))
        sendResponse({ token: null })
      })
    return true 
  }
})