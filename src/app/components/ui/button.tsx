import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const baseStyles =
  "inline-flex items-center justify-center text-sm font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<string, string> = {
  default: "bg-main text-white hover:bg-white rounded-md",
  destructive: "bg-red-600 text-white hover:bg-red-700 rounded-md",
  outline:
    "border border-gray-300 bg-white text-black hover:bg-gray-100 rounded-md",
  secondary: "bg-gray-100 text-black hover:bg-gray-200 rounded-md",
  ghost: "bg-transparent hover:bg-gray-100 text-black rounded-md",
  link: "text-main underline hover:opacity-80",
};

const sizes: Record<string, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 px-3",
  lg: "h-11 px-6",
  icon: "h-10 w-10",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
