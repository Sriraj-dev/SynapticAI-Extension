import { ThemeProvider } from "~popup/components/theme-provider"
import { ThemeToggle } from "~popup/components/theme-toggle"

const dashboardLink = process.env.PLASMO_PUBLIC_CLERK_SYNC_HOST || "https://development.synapticai.app"

export const SignInPage = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="synaptic-ai-theme">
      <div className="h-[400px] flex flex-col min-w-96 rounded-xl shadow-md bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <ThemeToggle />
          <h1 className="text-lg font-semibold text-center flex-1 -ml-8">
            Synaptic AI
          </h1>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-secondary-foreground text-center text-sm">
            Please sign in from the{" "}
            <a
              href={dashboardLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800">
              dashboard
            </a>{" "}
            to start using Synaptic AI.
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}
