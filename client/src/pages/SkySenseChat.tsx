import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FlightAssistantChat from "@/components/FlightAssistantChat";
import { getBookings, type Booking } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PlaneTakeoff, Clock, RotateCw, Sparkles } from "lucide-react";

export default function SkySenseChat() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(false);

    const loadBookings = async () => {
        try {
            setLoading(true);
            const res = await getBookings();
            setBookings(res.bookings);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBookings();
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] text-ink flex flex-col">
            {/* hero header */}
            <motion.header
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="border-b border-edge bg-canvas/40 backdrop-blur-md sticky top-0 z-20 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12"
            >
                <div className="max-w-6xl mx-auto py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <motion.span
                            animate={{ x: [0, 4, 0], rotate: [-4, 0, -4] }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <PlaneTakeoff className="h-5 w-5 text-brand" />
                        </motion.span>
                        <span className="font-semibold tracking-tight text-brand-gradient">
                            SkySense AI
                        </span>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-sm px-3 py-1.5 rounded-full border border-edge-strong bg-brand/10 text-ink-muted">
                        <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                        Real-time flights
                    </div>
                </div>
            </motion.header>

            {/* main layout */}
            <main className="flex-1 max-w-6xl mx-auto w-full py-8 flex flex-col lg:flex-row gap-6">
                {/* chat area */}
                <section className="flex-1 flex flex-col">
                    <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mb-5"
                    >
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/15 border border-edge-strong text-sm uppercase tracking-[0.18em] text-ink-muted mb-3">
                            <Sparkles className="h-4 w-4 text-brand" />
                            Powered by SkySense AI
                        </span>
                        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
                            Fly smarter with{" "}
                            <span className="text-brand-gradient">SkySense AI</span>
                        </h1>
                        <p className="text-lg text-ink-muted mt-3 max-w-xl">
                            Ask in natural language and SkySense will search real flights, compare prices,
                            suggest cheaper dates, and send you to secure checkout.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.55, delay: 0.2 }}
                    >
                        <FlightAssistantChat onBooked={loadBookings} />
                    </motion.div>
                </section>

                {/* booking history */}
                <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.25 }}
                    className="w-full lg:w-80 flex flex-col gap-3"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-base font-semibold text-ink">
                            <Clock className="h-4 w-4 text-brand" />
                            Booking history
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={loadBookings}
                            disabled={loading}
                            aria-label="Refresh bookings"
                        >
                            <motion.span
                                animate={loading ? { rotate: 360 } : { rotate: 0 }}
                                transition={loading ? { duration: 1, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}
                                className="inline-flex"
                            >
                                <RotateCw className="h-4 w-4" />
                            </motion.span>
                        </Button>
                    </div>

                    <Card className="flex-1 p-0">
                        <ScrollArea className="h-[420px] p-3">
                            {bookings.length === 0 && (
                                <p className="text-sm text-ink-subtle px-2 py-6 text-center leading-relaxed">
                                    No bookings yet. When you book a flight in the chat,
                                    it will appear here.
                                </p>
                            )}

                            <AnimatePresence initial={false}>
                                <div className="space-y-2">
                                    {bookings.map((b, i) => (
                                        <motion.div
                                            key={b.id}
                                            initial={{ opacity: 0, y: 10, scale: 0.97 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: i * 0.04, duration: 0.35 }}
                                            whileHover={{ y: -2 }}
                                            className="p-3 rounded-2xl bg-surface/70 border border-edge hover:border-edge-strong text-sm space-y-1 transition-colors"
                                        >
                                            <div className="flex justify-between items-center">
                                                <span className="font-semibold text-ink text-base">
                                                    {b.currency} {b.amount.toLocaleString()}
                                                </span>
                                                <span
                                                    className={`capitalize text-xs uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                                        b.status === "paid"
                                                            ? "bg-success/15 text-success border border-success/30"
                                                            : b.status === "failed"
                                                            ? "bg-danger/15 text-danger border border-danger/30"
                                                            : "bg-warning/15 text-warning border border-warning/30"
                                                    }`}
                                                >
                                                    {b.status}
                                                </span>
                                            </div>
                                            <div className="text-xs text-ink-subtle">
                                                Flight ID: {b.flightId}
                                            </div>
                                            <div className="text-xs text-ink-subtle">
                                                {new Date(b.createdAt).toLocaleString()}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </AnimatePresence>
                        </ScrollArea>
                    </Card>
                </motion.aside>
            </main>
        </div>
    );
}
