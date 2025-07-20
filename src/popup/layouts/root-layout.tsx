import { ClerkLoading, ClerkProvider, SignedIn, SignedOut } from "@clerk/chrome-extension"
import { useEffect } from "react"
import { Outlet, useNavigate } from "react-router"

import { AuthProvider, useAuthToken } from "~contexts/auth-context"
import { Home } from "~popup/routes/home"
import { SignInPage } from "~popup/routes/sign-in"
import { logger } from "~utils/logger"

const PUBLISHABLE_KEY = process.env.PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY
const SYNC_HOST = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST

if (!PUBLISHABLE_KEY) {
  logger.warn("Missing PLASMO_PUBLIC_CLERK_PUBLISHABLE_KEY")
}

if (!SYNC_HOST) {
  logger.warn("Missing PLASMO_PUBLIC_CLERK_SYNC_HOST")
}

export const RootLayout = () => {
  const navigate = useNavigate()

  if (!PUBLISHABLE_KEY || !SYNC_HOST) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <p className="text-center text-red-500">
          Missing required environment variables. Please check your
          .env.development file.
        </p>
      </div>
    )
  }

  logger.debug("SYNC_HOST", SYNC_HOST)

  return (
    <ClerkProvider
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      publishableKey={PUBLISHABLE_KEY}
      syncHost={SYNC_HOST}>
      <AuthProvider>
        <div>
          <ClerkLoading>
            <Home></Home>
          </ClerkLoading>
          <SignedIn>
            <Home></Home>
          </SignedIn>
          <SignedOut>
            <SignInPage></SignInPage>
          </SignedOut>
        </div>
      </AuthProvider>
    </ClerkProvider>
  )
}
