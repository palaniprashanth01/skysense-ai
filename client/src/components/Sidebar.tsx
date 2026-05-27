import { useState } from "react";
import { Home, Plane, Calendar, PlaneTakeoff, Zap } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";
import SetupClaudeModal from "./SetupClaudeModal";

const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: Plane, label: "Flight Chat", path: "/skysense" },
    { icon: Calendar, label: "My Bookings", path: "/my-bookings" },
];

const Sidebar = () => {
    const location = useLocation();
    const [setupOpen, setSetupOpen] = useState(false);

    return (
        <aside className="h-full w-64 bg-canvas/80 backdrop-blur-xl border-r border-edge flex flex-col relative">
            <div
                aria-hidden
                className="absolute inset-0 -z-10 grain opacity-40 pointer-events-none"
            />

            {/* Logo */}
            <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="p-6 border-b border-edge"
            >
                <Link to="/" className="flex items-center gap-3">
                    <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand text-white shadow-[0_10px_24px_-10px_color-mix(in_oklab,var(--color-brand)_80%,transparent)]">
                        <span className="absolute inset-0 rounded-xl animate-pulse-ring" />
                        <PlaneTakeoff className="h-5 w-5" />
                    </span>
                    <span className="text-xl font-bold tracking-tight text-brand-gradient">
                        SkySense
                    </span>
                </Link>
            </motion.div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item, i) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <motion.div
                            key={item.path}
                            initial={{ opacity: 0, x: -14 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.08 * i + 0.15, duration: 0.35, ease: "easeOut" }}
                        >
                            <Link
                                to={item.path}
                                aria-current={isActive ? "page" : undefined}
                                className={clsx(
                                    "relative flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 group overflow-hidden",
                                    isActive
                                        ? "text-ink bg-brand/15 border border-edge-strong"
                                        : "text-ink-muted hover:text-ink hover:bg-brand/8 border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="active-nav-glow"
                                        className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-brand/25 via-brand/10 to-transparent"
                                        transition={{ type: "spring", stiffness: 320, damping: 28 }}
                                    />
                                )}
                                <item.icon
                                    className={clsx(
                                        "h-5 w-5 transition-transform duration-200 group-hover:-translate-y-[1px]",
                                        isActive ? "text-brand" : "text-ink-subtle group-hover:text-ink"
                                    )}
                                />
                                <span className="font-medium tracking-tight text-base">{item.label}</span>
                                {isActive && (
                                    <motion.span
                                        layoutId="active-dot"
                                        className="ml-auto h-1.5 w-1.5 rounded-full bg-brand shadow-[0_0_12px_color-mix(in_oklab,var(--color-brand)_90%,transparent)]"
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Claude integration CTA */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="px-4 pb-2"
            >
                <button
                    onClick={() => setSetupOpen(true)}
                    className="group relative w-full overflow-hidden rounded-2xl border border-edge-strong bg-gradient-to-br from-brand/20 via-brand/10 to-transparent p-3 text-left hover:border-brand transition-colors"
                >
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -top-6 -right-6 h-20 w-20 rounded-full bg-brand/30 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity"
                    />
                    <div className="relative flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-brand mb-1">
                        <Zap className="h-4 w-4" />
                        1-click setup
                    </div>
                    <div className="relative text-base font-semibold text-ink tracking-tight">
                        Connect to Claude
                    </div>
                    <div className="relative text-sm text-ink-subtle mt-0.5">
                        Run flight search inside Claude Desktop
                    </div>
                </button>
            </motion.div>

            {/* Footer attribution */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="p-4 border-t border-edge"
            >
                <a
                    href="https://github.com/palaniprashanth01/skysense-ai"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-2 px-3 py-2 text-xs text-ink-subtle hover:text-ink transition-colors"
                >
                    <span className="tracking-wider uppercase">v1.0 · OSS</span>
                    <span className="inline-flex items-center gap-1 hover:underline">
                        GitHub →
                    </span>
                </a>
            </motion.div>

            <SetupClaudeModal open={setupOpen} onClose={() => setSetupOpen(false)} />
        </aside>
    );
};

export default Sidebar;
