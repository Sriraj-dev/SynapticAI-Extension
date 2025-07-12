import { useState } from "react"

interface TooltipProps {
  children: React.ReactNode
  content: string
  className?: string
}

export default function Tooltip({
  children,
  content,
  className = ""
}: TooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}>
        {children}
      </div>
      {showTooltip && (
        <div
        className={`absolute top-full mt-1 transform -translate-x-1 px-3 py-1 rounded bg-secondary-foreground text-text-primary text-sm whitespace-nowrap z-50 ${className}`}
      >
        {content}
      </div>
      )}
    </div>
  )
}
