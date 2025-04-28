import { SignedIn, SignedOut, useAuth } from "@clerk/chrome-extension"
import { Navigate } from "react-router"


export default function RouterOutlet() {

  return (
    <>
      <SignedIn>
        <Navigate to="/home" />
      </SignedIn>
      <SignedOut>
        <Navigate to="/sign-in" />
      </SignedOut>
    </>
  )
}
