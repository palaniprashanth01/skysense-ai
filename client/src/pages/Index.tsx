import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plane, Calendar, TrendingUp, ArrowRight, Sparkles, Zap, Github } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SetupClaudeModal from "@/components/SetupClaudeModal";

const stats = [
    { icon: Plane,        label: "Total Trips",  value: "12",     tone: "from-brand to-brand-strong" },
    { icon: Calendar,     label: "Upcoming",     value: "2",      tone: "from-brand-strong to-ink" },
    { icon: TrendingUp,   label: "Miles Saved",  value: "24,500", tone: "from-brand to-ink" },
];

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
    hidden: { opacity: 0, y: 24, scale: 0.97 },
    show: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
};

export default function Index() {
    const navigate = useNavigate();
    const [setupOpen, setSetupOpen] = useState(false);
    const recentSearches = JSON.parse(localStorage.getItem("recent_searches") || "[]");

    return (
        <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-10"
        >
            {/* Hero / Welcome */}
            <motion.section
                variants={item}
                className="relative overflow-hidden rounded-3xl border border-edge-strong bg-gradient-to-br from-surface-elev/40 via-canvas to-surface p-8 md:p-10"
            >
                {/* Decorative animated plane */}
                <motion.div
                    aria-hidden
                    className="absolute -right-10 -top-6 text-brand/30 hidden md:block"
                    animate={{ x: [0, 30, -10, 0], y: [0, -16, 8, 0], rotate: [-12, -4, -16, -12] }}
                    transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Plane className="h-44 w-44" />
                </motion.div>
                <motion.div
                    aria-hidden
                    className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-brand/30 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                />

                <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
                    <div className="space-y-3 max-w-xl">
                        <motion.span
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand/15 border border-edge-strong text-sm uppercase tracking-[0.18em] text-ink-muted"
                        >
                            <Sparkles className="h-4 w-4 text-brand" />
                            Live AI Concierge
                        </motion.span>
                        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
                            <span className="text-ink">Welcome back,</span>{" "}
                            <span className="text-brand-gradient">Traveler</span>
                        </h1>
                        <p className="text-ink-muted text-lg md:text-xl leading-relaxed">
                            Ready to plan your next adventure? SkySense finds the cheapest fares
                            in seconds — and books them for you.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 self-start md:self-end">
                        <Button
                            onClick={() => navigate("/skysense")}
                            size="lg"
                        >
                            <Plane className="mr-2 h-5 w-5" />
                            Start New Search
                        </Button>
                        <motion.button
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setSetupOpen(true)}
                            className="group relative inline-flex items-center justify-center gap-2 h-12 px-5 rounded-full font-medium tracking-tight text-ink bg-canvas/40 border border-edge-strong hover:border-brand hover:bg-brand/15 transition-all"
                        >
                            <span className="absolute inset-0 rounded-full bg-gradient-to-r from-brand/20 via-transparent to-brand-strong/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <Zap className="h-4 w-4 text-brand" />
                            <span className="relative">Connect to Claude</span>
                            <span className="relative inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-ink-subtle border-l border-edge pl-2 ml-1">
                                1-click
                            </span>
                        </motion.button>
                    </div>
                </div>
            </motion.section>

            {/* Stats Grid */}
            <motion.div
                variants={container}
                className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {stats.map((s) => (
                    <motion.div key={s.label} variants={item} whileHover={{ y: -4 }}>
                        <Card className="h-full">
                            <div className="flex items-center gap-4">
                                <div
                                    className={`relative h-14 w-14 rounded-2xl bg-gradient-to-br ${s.tone} flex items-center justify-center text-canvas/80 shadow-[0_12px_30px_-12px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]`}
                                >
                                    <s.icon className="h-7 w-7" />
                                </div>
                                <div>
                                    <p className="text-sm uppercase tracking-[0.15em] text-ink-subtle font-medium">
                                        {s.label}
                                    </p>
                                    <motion.h3
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25 }}
                                        className="text-4xl font-bold text-ink tracking-tight"
                                    >
                                        {s.value}
                                    </motion.h3>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Recent Activity / Quick Actions */}
            <motion.div
                variants={container}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
                <motion.div variants={item}>
                    <Card className="h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Recent Searches</CardTitle>
                            <Button variant="ghost" size="sm">View All</Button>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentSearches.length === 0 ? (
                                <div className="text-center py-10 text-ink-subtle text-base">
                                    <p>No recent searches yet.</p>
                                    <p className="mt-1">Start a chat to plan your trip!</p>
                                </div>
                            ) : (
                                recentSearches.map((search: any, i: number) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -12 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.1 + i * 0.05 }}
                                        whileHover={{ x: 4 }}
                                        onClick={() =>
                                            navigate(
                                                `/skysense?q=${encodeURIComponent(
                                                    search.query ||
                                                        `Flights from ${search.from} to ${search.to} on ${search.date}`
                                                )}`
                                            )
                                        }
                                        className="flex items-center justify-between p-3 rounded-2xl bg-brand/5 hover:bg-brand/15 border border-edge hover:border-edge-strong transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 rounded-full bg-surface border border-edge-strong flex items-center justify-center text-brand group-hover:scale-110 transition-transform">
                                                <Plane className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <p className="text-base font-medium text-ink">
                                                    {search.from}{" "}
                                                    <span className="text-brand">→</span>{" "}
                                                    {search.to}
                                                </p>
                                                <p className="text-sm text-ink-subtle">
                                                    {search.date}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight className="h-4 w-4 text-ink-faint group-hover:text-brand group-hover:translate-x-1 transition-all" />
                                    </motion.div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="h-full relative overflow-hidden">
                        <motion.div
                            aria-hidden
                            className="absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-brand/30 blur-3xl"
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{ duration: 6, repeat: Infinity }}
                        />
                        <CardHeader className="flex flex-row items-center justify-between gap-2">
                            <CardTitle>Use SkySense inside Claude</CardTitle>
                            <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.18em] text-brand bg-brand/10 border border-edge-strong px-2 py-0.5 rounded-full">
                                <Zap className="h-3 w-3" /> MCP
                            </span>
                        </CardHeader>
                        <CardContent className="relative space-y-4">
                            <p className="text-ink-muted text-base leading-relaxed">
                                Install the Flight Deals MCP server and Claude Desktop will search
                                flights, show seat maps, and create payment links right inside
                                your chat.
                            </p>
                            <ol className="space-y-2 text-base text-ink/85">
                                {[
                                    "Clone & build the MCP server",
                                    "Add your Amadeus + SerpAPI keys",
                                    "Paste config into Claude Desktop",
                                    "Restart Claude and start asking",
                                ].map((s, i) => (
                                    <li key={s} className="flex items-start gap-2">
                                        <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-brand/15 border border-edge-strong text-[10px] font-bold text-brand">
                                            {i + 1}
                                        </span>
                                        {s}
                                    </li>
                                ))}
                            </ol>
                            <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                <Button
                                    onClick={() => setSetupOpen(true)}
                                    className="flex-1 py-5"
                                >
                                    <Zap className="mr-2 h-4 w-4" />
                                    1-Click Setup in Claude
                                </Button>
                                <a
                                    href="https://github.com/palaniprashanth01/Flight-deals-finder-using-Claude"
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full border border-edge text-ink-muted hover:text-ink hover:border-edge-strong hover:bg-brand/10 transition-colors text-sm"
                                >
                                    <Github className="h-4 w-4" />
                                    GitHub
                                </a>
                            </div>
                            <button
                                onClick={() => navigate("/skysense")}
                                className="text-xs text-ink-subtle hover:text-ink inline-flex items-center gap-1"
                            >
                                Or just chat here in the browser
                                <ArrowRight className="h-3 w-3" />
                            </button>
                        </CardContent>
                    </Card>
                </motion.div>
            </motion.div>

            <SetupClaudeModal open={setupOpen} onClose={() => setSetupOpen(false)} />
        </motion.div>
    );
}
