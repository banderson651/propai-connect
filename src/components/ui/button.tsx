
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-blue-600 shadow-md focus:bg-primary focus-visible:bg-primary",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md focus:bg-destructive focus-visible:bg-destructive",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground border-gray-200 hover:bg-slate-50 focus:bg-background focus-visible:bg-background",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 focus:bg-secondary focus-visible:bg-secondary",
        ghost: "hover:bg-accent hover:text-accent-foreground hover:bg-slate-50 focus:bg-transparent focus-visible:bg-transparent",
        link: "text-primary underline-offset-4 hover:underline focus:text-primary focus-visible:text-primary",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
        style={{ 
          backgroundColor: variant === 'default' ? 'hsl(var(--primary))' : undefined,
          ...props.style 
        }}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
