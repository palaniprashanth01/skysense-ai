import type { ReactNode } from "react";
import clsx from "clsx";

interface CardProps {
    children: ReactNode;
    className?: string;
    noPadding?: boolean;
    /** Visual emphasis state. `error` renders a danger-toned border. */
    state?: "default" | "error";
}

export const Card = ({ children, className, noPadding = false, state = "default" }: CardProps) => {
    return (
        <div
            data-state={state}
            className={clsx(
                "relative bg-gradient-to-b from-surface-elev/55 to-surface/85 backdrop-blur-md rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5",
                state === "error"
                    ? "border border-danger/50 shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--color-danger)_45%,transparent)]"
                    : "border border-edge hover:border-edge-strong hover:shadow-[0_24px_60px_-20px_color-mix(in_oklab,var(--color-brand)_45%,transparent)]",
                !noPadding && "p-6",
                className
            )}
        >
            {children}
        </div>
    );
};

export const CardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={clsx("mb-4", className)}>{children}</div>
);

export const CardTitle = ({ children, className }: { children: ReactNode; className?: string }) => (
    <h3 className={clsx("text-lg font-semibold text-ink tracking-tight", className)}>{children}</h3>
);

export const CardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
    <div className={className}>{children}</div>
);
