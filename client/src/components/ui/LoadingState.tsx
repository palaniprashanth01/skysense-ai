import { Loader2 } from "lucide-react";

export const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center p-12">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
        </div>
    );
};

export const Skeleton = ({ className }: { className?: string }) => {
    return (
        <div className={`animate-pulse bg-slate-800/50 rounded-md ${className}`} />
    );
};

export const CardSkeleton = () => {
    return (
        <div className="p-6 border border-white/5 rounded-xl bg-slate-900/50">
            <Skeleton className="h-6 w-1/3 mb-4" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
        </div>
    );
};
