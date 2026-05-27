import { type ButtonHTMLAttributes, forwardRef } from "react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
        const variants = {
            primary:
                "bg-brand hover:bg-brand-hover text-white border border-brand-strong/60 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-brand)_70%,transparent)]",
            secondary:
                "bg-surface-elev/60 hover:bg-surface-elev text-ink border border-edge-strong/40",
            outline:
                "bg-transparent border border-edge-strong/60 text-ink hover:border-brand hover:text-white hover:bg-brand/10",
            ghost:
                "bg-transparent hover:bg-brand/10 text-ink/80 hover:text-ink",
            danger:
                "bg-danger/10 hover:bg-danger/20 text-danger border border-danger/30",
        };

        const sizes = {
            sm: "h-8 px-3 text-xs",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
        };

        return (
            <button
                ref={ref}
                disabled={disabled || isLoading}
                className={clsx(
                    "relative inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium tracking-tight transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/70 focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] hover:-translate-y-[1px]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        );
    }
);

Button.displayName = "Button";
