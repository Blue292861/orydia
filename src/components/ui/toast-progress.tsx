import * as React from "react"
import { cn } from "@/lib/utils"

interface ToastProgressProps {
  duration?: number
  className?: string
}

export const ToastProgress = React.forwardRef<
  HTMLDivElement,
  ToastProgressProps
>(({ duration = 5000, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "absolute bottom-0 left-0 right-0 h-1 bg-primary/20 overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-primary animate-toast-progress"
        style={{
          animationDuration: `${duration}ms`,
        }}
      />
    </div>
  )
})
ToastProgress.displayName = "ToastProgress"
