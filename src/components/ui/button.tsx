import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 will-change-transform",
  {
    variants: {
      variant: {
        default: "bg-gradient-gold text-primary-foreground shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed active:translate-y-[1px] border border-primary/30",
        destructive: "bg-destructive text-destructive-foreground shadow-skeu-raised hover:shadow-skeu-raised-lg hover:bg-destructive/90 active:shadow-skeu-pressed active:translate-y-[1px]",
        outline: "border-2 border-input bg-gradient-surface shadow-skeu-raised-sm hover:shadow-skeu-raised hover:border-primary/50 active:shadow-skeu-inset active:translate-y-[1px]",
        secondary: "bg-gradient-surface text-secondary-foreground shadow-skeu-raised hover:shadow-skeu-raised-lg active:shadow-skeu-pressed active:translate-y-[1px] border border-border/50",
        ghost: "hover:bg-gradient-surface hover:shadow-skeu-raised-sm hover:text-accent-foreground active:shadow-skeu-inset",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2 min-h-[44px]",
        sm: "h-9 rounded-md px-3 min-h-[36px]",
        lg: "h-11 rounded-md px-8 min-h-[48px]",
        icon: "h-10 w-10 min-h-[44px] min-w-[44px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
