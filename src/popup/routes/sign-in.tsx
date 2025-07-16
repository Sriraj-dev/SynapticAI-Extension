import { ThemeProvider } from "~popup/components/theme-provider"
import { ThemeToggle } from "~popup/components/theme-toggle"

const dashboardLink =
  process.env.PLASMO_PUBLIC_SYNAPTIC_WEBSITE_URL || "https://synapticai.app"

export const SignInPage = () => {
  return (
    <ThemeProvider defaultTheme="system" storageKey="synaptic-ai-theme">
      <div className="h-[400px] flex flex-col min-w-96 rounded-xl shadow-md bg-background">
        <div className="flex items-center justify-between px-4 py-4">
          <ThemeToggle />
          <a
            href={dashboardLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 -ml-8">
            <h1 className="text-lg font-semibold text-center hover:underline cursor-pointer hover:scale-110 transition-transform">
              Synaptic AI
            </h1>
          </a>
        </div>

        <div className="flex-1 flex items-center justify-center px-4">
          <p className="text-text-secondary text-center text-sm">
            Just one step left!{"   "}Log in on the{" "}
            <a
              href={dashboardLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-link underline hover:text-blue-600">
              SynapticAI
            </a>{" "}
            website, then come back here to start using the extension 🚀
          </p>
        </div>
      </div>
    </ThemeProvider>
  )
}
