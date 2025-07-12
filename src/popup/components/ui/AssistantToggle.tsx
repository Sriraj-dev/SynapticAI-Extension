// import * as TogglePrimitive from "@radix-ui/react-toggle"
// import { cva, type VariantProps } from "class-variance-authority"
// import * as React from "react"

// import { cn } from "~lib/utils"

// const toggleVariants = cva(
//   "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
//   {
//     variants: {
//       variant: {
//         default: "bg-transparent",
//         outline:
//           "border border-input bg-transparent hover:bg-accent hover:text-accent-foreground"
//       },
//       size: {
//         default: "h-10 px-3",
//         sm: "h-9 px-2.5",
//         lg: "h-11 px-5"
//       }
//     },
//     defaultVariants: {
//       variant: "default",
//       size: "default"
//     }
//   }
// )

// const Toggle = React.forwardRef<
//   React.ElementRef<typeof TogglePrimitive.Root>,
//   React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> &
//     VariantProps<typeof toggleVariants>
// >(({ className, variant, size, ...props }, ref) => (
//   <TogglePrimitive.Root
//     ref={ref}
//     className={cn(toggleVariants({ variant, size, className }))}
//     {...props}
//   />
// ))

// Toggle.displayName = TogglePrimitive.Root.displayName

// export { Toggle, toggleVariants }

import { Toggle } from "@radix-ui/react-toggle"
import { cn } from "~/lib/utils" // or just classnames()

interface FloatingChatToggleProps {
  isEnabled: boolean
  onToggle: (state: boolean) => void
}

export default function FloatingChatToggle({
  isEnabled,
  onToggle
}: FloatingChatToggleProps) {
  return (
    <div className="flex items-center gap-2 justify-between px-1 py-2 rounded-md text-text-primary">
      <span className="text-xs font-inter">Site Assistant</span>
      <Toggle
        pressed={isEnabled}
        onPressedChange={onToggle}
        className={cn(
          "relative inline-flex h-3 w-6 items-center rounded-full transition-colors duration-300",
          isEnabled ? "bg-alternate-primary" : "bg-text-tertiary"
        )}
      >
        <span
          className={cn(
            "inline-block h-3 w-3 transform rounded-full bg-text-primary transition-transform duration-300",
            isEnabled ? "translate-x-3" : "translate-x-0"
          )}
        />
      </Toggle>
    </div>
  )
}
