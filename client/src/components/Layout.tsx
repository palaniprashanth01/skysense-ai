import type { ReactNode } from "react";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, X, PlaneTakeoff } from "lucide-react";
import clsx from "clsx";

interface LayoutProps {
    children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen text-ink font-sans selection:bg-brand/30 relative overflow-x-hidden">
            {/* Ambient brand aurora */}
            <div
                aria-hidden
                className="pointer-events-none fixed inset-0 -z-10 grain opacity-40"
            />
            <motion.div
                aria-hidden
                className="pointer-events-none fixed -top-40 -left-20 h-[420px] w-[420px] rounded-full bg-brand/30 blur-[120px] -z-10"
                animate={{ x: [0, 40, -10, 0], y: [0, -20, 10, 0] }}
                transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                aria-hidden
                className="pointer-events-none fixed -bottom-40 -right-20 h-[460px] w-[460px] rounded-full bg-brand-strong/20 blur-[140px] -z-10"
                animate={{ x: [0, -30, 20, 0], y: [0, 20, -10, 0] }}
                transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-canvas/60 z-40 md:hidden backdrop-blur-sm"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar (Responsive) */}
            <div
                className={clsx(
                    "fixed inset-y-0 left-0 z-50 transition-transform duration-300 md:translate-x-0",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <Sidebar />
            </div>

            {/* Mobile Header */}
            <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-canvas/70 backdrop-blur-md border-b border-edge flex items-center justify-between px-4 z-40">
                <div className="flex items-center gap-2 font-bold text-lg">
                    <motion.span
                        animate={{ rotate: [-6, 6, -6] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                        className="text-brand"
                    >
                        <PlaneTakeoff className="h-5 w-5" />
                    </motion.span>
                    <span className="text-brand-gradient">SkySense</span>
                </div>
                <button
                    aria-label="Toggle navigation"
                    className="p-2 text-ink/70 hover:text-ink"
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </header>

            {/* Main Content with animated page transitions */}
            <main className="md:pl-64 min-h-screen pt-16 md:pt-0">
                <div className="max-w-7xl mx-auto p-4 md:p-8 lg:p-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default Layout;
