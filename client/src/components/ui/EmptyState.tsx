import type { LucideIcon } from "lucide-react";
import { Button } from "./button";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction }: EmptyStateProps) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-xl bg-slate-900/30">
            <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
            <p className="text-slate-400 max-w-sm mb-6">{description}</p>
            {actionLabel && onAction && (
                <Button onClick={onAction} variant="secondary">
                    {actionLabel}
                </Button>
            )}
        </div>
    );
};
