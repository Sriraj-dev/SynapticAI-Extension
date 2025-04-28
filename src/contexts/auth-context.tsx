import { useAuth } from "@clerk/chrome-extension"
import { createContext, useContext, useEffect, useState } from "react"
import { logger } from "~utils/logger"

interface AuthContextType {
  authToken: string | null
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType>({
  authToken: null,
  isLoading: true
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authToken, setAuthToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isSignedIn, getToken } = useAuth()

  useEffect(() => {
    const fetchToken = async () => {
      if (isSignedIn) {
        try {
          logger.info("Fetching new token from clerk")
          const token = await getToken()
          setAuthToken(token)
        } catch (error) {
          logger.warn("Error fetching token:", error)
          setAuthToken(null)
        }
      } else {
        setAuthToken(null)
      }
      setIsLoading(false)
    }

    fetchToken()
  }, [isSignedIn, getToken])

  return (
    <AuthContext.Provider value={{ authToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthToken = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuthToken must be used within an AuthProvider")
  }
  return context
}
