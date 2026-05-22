import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/utils/cn";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = "primary", ...props }, ref) => {
  const variantClass = variant === "primary" ? "primary-action" : variant === "secondary" ? "secondary-action" : "rounded-full px-4 py-2 text-text-secondary hover:text-accent-teal";
  return <button ref={ref} className={cn(variantClass, className)} {...props} />;
});

Button.displayName = "Button";
