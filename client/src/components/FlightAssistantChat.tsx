// client/src/components/FlightAssistantChat.tsx
import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
    sendChatMessage,
    createBooking,
    type FlightOffer,
    type PriceTrend,
} from "@/lib/api";
import {
    Plane,
    Bot,
    User,
    Sparkles,
    Send,
    TrendingDown,
    PlaneTakeoff,
    PlaneLanding,
    Zap,
} from "lucide-react";
import { Button } from "./ui/button";
import clsx from "clsx";
import SeatSelectionModal from "./SeatSelectionModal";

type Role = "user" | "assistant";

interface UiMessage {
    id: string;
    role: Role;
    content: string;
    flights?: FlightOffer[];
    priceTrend?: PriceTrend | null;
}

interface FlightAssistantChatProps {
    onBooked?: () => void;
}

// Build dates relative to today so the prompts are always in the future
// and the AI parser can extract a concrete departureDate.
const fmt = (daysFromNow: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    return d.toISOString().slice(0, 10);
};

const QUICK_PROMPTS = [
    {
        emoji: "🌍",
        label: "Mumbai → Berlin",
        prompt: `Cheapest flight from Mumbai to Berlin on ${fmt(30)} for 2 adults`,
    },
    {
        emoji: "🏝️",
        label: "Bangalore → Bali",
        prompt: `Cheapest flight from Bangalore to Bali on ${fmt(21)}`,
    },
    {
        emoji: "🗼",
        label: "BLR → Paris, direct",
        prompt: `Direct flight from Bangalore to Paris on ${fmt(45)}`,
    },
    {
        emoji: "🌃",
        label: "Tomorrow DEL → BOM",
        prompt: `Cheapest flight from Delhi to Mumbai on ${fmt(1)}`,
    },
];

export default function FlightAssistantChat({ onBooked }: FlightAssistantChatProps) {
    const [searchParams] = useSearchParams();
    const [messages, setMessages] = useState<UiMessage[]>([
        {
            id: "welcome",
            role: "assistant",
            content:
                "Hi! I'm SkySense AI ✈️ Ask me things like \"Find cheapest flights from Mumbai to Berlin in the next 2 months for 2 adults\".",
        },
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const hasAutoSearched = useRef(false);

    // Seat Selection State
    const [selectedFlight, setSelectedFlight] = useState<FlightOffer | null>(null);
    const [isSeatModalOpen, setIsSeatModalOpen] = useState(false);
    const [isDirectOnly, setIsDirectOnly] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    // Auto-search from query param
    useEffect(() => {
        const query = searchParams.get("q");
        if (query && !hasAutoSearched.current) {
            hasAutoSearched.current = true;
            handleSend(query);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const handleSend = async (textOverride?: string) => {
        const text = textOverride || input.trim();
        if (!text || loading) return;

        const userMsg: UiMessage = {
            id: `user-${Date.now()}`,
            role: "user",
            content: text,
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const history = messages.slice(-5).map(m => ({
                role: m.role,
                content: m.content,
            }));

            const res = await sendChatMessage(text, isDirectOnly, history);

            if (res.parsedQuery) {
                const search = {
                    from: res.parsedQuery.origin,
                    to: res.parsedQuery.destination,
                    date: res.parsedQuery.departureDate,
                    query: text,
                };

                const existing = JSON.parse(localStorage.getItem("recent_searches") || "[]");
                const filtered = existing.filter((s: any) =>
                    !(s.from === search.from && s.to === search.to && s.date === search.date)
                );
                const updated = [search, ...filtered].slice(0, 5);
                localStorage.setItem("recent_searches", JSON.stringify(updated));
            }

            const assistantMsg: UiMessage = {
                id: `assistant-${Date.now()}`,
                role: "assistant",
                content: res.message,
                flights: res.flights,
                priceTrend: res.priceTrend,
            };

            setMessages((prev) => [...prev, assistantMsg]);
        } catch (err) {
            console.error(err);
            const assistantMsg: UiMessage = {
                id: `error-${Date.now()}`,
                role: "assistant",
                content:
                    "Something went wrong while searching flights. Please try again in a moment.",
            };
            setMessages((prev) => [...prev, assistantMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleBookClick = (flight: FlightOffer) => {
        setSelectedFlight(flight);
        setIsSeatModalOpen(true);
    };

    const handleSeatConfirmed = async (seatNumber: string) => {
        if (!selectedFlight) return;
        setIsSeatModalOpen(false);

        try {
            const { success, paymentUrl, message } = await createBooking(
                selectedFlight.id,
                selectedFlight.priceTotal,
                selectedFlight.currency,
                seatNumber
            );

            if (!success || !paymentUrl) {
                alert(message || "Failed to create payment link.");
                return;
            }

            window.open(paymentUrl, "_blank", "noopener,noreferrer");
            if (onBooked) onBooked();
        } catch (err) {
            console.error(err);
            alert("Failed to create booking session.");
        } finally {
            setSelectedFlight(null);
        }
    };

    const showQuickPrompts = messages.length <= 1 && !loading;

    return (
        <>
            <div className="relative border border-edge-strong bg-gradient-to-b from-surface-elev/40 to-surface/90 backdrop-blur-md flex flex-col h-[640px] rounded-3xl shadow-[0_30px_80px_-30px_color-mix(in_oklab,var(--color-brand)_45%,transparent)] overflow-hidden">
                {/* Decorative glow */}
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-brand/30 blur-3xl"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    aria-hidden
                    className="pointer-events-none absolute -bottom-20 -left-16 h-44 w-44 rounded-full bg-brand-strong/20 blur-3xl"
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Header */}
                <div className="relative px-5 py-4 border-b border-edge bg-canvas/50 backdrop-blur-md flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <motion.div
                            initial={{ rotate: -8 }}
                            animate={{ rotate: [-8, 4, -8] }}
                            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                            className="relative h-10 w-10 rounded-2xl bg-gradient-to-br from-brand to-brand-strong flex items-center justify-center shadow-[0_10px_24px_-10px_color-mix(in_oklab,var(--color-brand)_70%,transparent)]"
                        >
                            <span className="absolute inset-0 rounded-2xl animate-pulse-ring" />
                            <Bot className="h-5 w-5 text-white" />
                        </motion.div>
                        <div>
                            <h3 className="text-base font-semibold text-ink tracking-tight flex items-center gap-2">
                                SkySense AI
                                <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-success bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
                                    Online
                                </span>
                            </h3>
                            <p className="text-sm text-ink-subtle">
                                Real-time fares · Amadeus + Google Flights
                            </p>
                        </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-ink-subtle">
                        <Sparkles className="h-3 w-3 text-brand" />
                        Powered by Claude
                    </div>
                </div>

                {/* Messages */}
                <div className="relative flex-1 px-4 py-5 space-y-4 overflow-y-auto">
                    <AnimatePresence initial={false}>
                        {messages.map((msg) => (
                            <motion.div
                                key={msg.id}
                                layout
                                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className={clsx(
                                    "flex gap-3 max-w-[88%]",
                                    msg.role === "user" ? "ml-auto flex-row-reverse" : ""
                                )}
                            >
                                {/* Avatar */}
                                <div
                                    className={clsx(
                                        "h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 border",
                                        msg.role === "user"
                                            ? "bg-gradient-to-br from-brand to-brand-strong text-white border-brand-strong shadow-[0_6px_18px_-6px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]"
                                            : "bg-surface text-brand border-edge-strong"
                                    )}
                                >
                                    {msg.role === "user" ? (
                                        <User className="h-4 w-4" />
                                    ) : (
                                        <Bot className="h-4 w-4" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex flex-col gap-2 min-w-0">
                                    <div
                                        className={clsx(
                                            "px-4 py-3 text-base leading-relaxed whitespace-pre-wrap break-words",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-brand to-brand-hover text-white rounded-2xl rounded-tr-md shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-brand)_60%,transparent)]"
                                                : "bg-surface-elev/40 text-ink rounded-2xl rounded-tl-md border border-edge backdrop-blur-sm"
                                        )}
                                    >
                                        {msg.content}
                                    </div>

                                    {/* Flights */}
                                    {msg.role === "assistant" && msg.flights && msg.flights.length > 0 && (
                                        <motion.div
                                            initial="hidden"
                                            animate="show"
                                            variants={{
                                                hidden: {},
                                                show: { transition: { staggerChildren: 0.07 } },
                                            }}
                                            className="space-y-3 mt-2"
                                        >
                                            {msg.flights.map((flight) => (
                                                <FlightCard
                                                    key={flight.id}
                                                    flight={flight}
                                                    onBook={() => handleBookClick(flight)}
                                                />
                                            ))}
                                        </motion.div>
                                    )}

                                    {/* Price Trend */}
                                    {msg.role === "assistant" && msg.priceTrend && (
                                        <PriceTrendPanel trend={msg.priceTrend} />
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Quick prompts */}
                    <AnimatePresence>
                        {showQuickPrompts && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                                className="pl-12 flex flex-wrap gap-2 max-w-[88%]"
                            >
                                <span className="w-full text-xs uppercase tracking-[0.16em] text-ink-subtle mb-1">
                                    Try one
                                </span>
                                {QUICK_PROMPTS.map((p, i) => (
                                    <motion.button
                                        key={p.label}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + i * 0.07 }}
                                        whileHover={{ y: -2 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => handleSend(p.prompt)}
                                        className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-full border border-edge bg-canvas/50 text-ink hover:border-brand hover:bg-brand/15 transition-colors"
                                    >
                                        <span>{p.emoji}</span>
                                        {p.label}
                                    </motion.button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    <AnimatePresence>
                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="flex gap-3"
                            >
                                <div className="h-9 w-9 rounded-full bg-surface text-brand border border-edge-strong flex items-center justify-center">
                                    <Bot className="h-4 w-4" />
                                </div>
                                <div className="bg-surface-elev/40 px-4 py-3 rounded-2xl rounded-tl-md border border-edge backdrop-blur-sm flex items-center gap-2">
                                    <span className="flex items-center gap-1">
                                        {[0, 1, 2].map((i) => (
                                            <motion.span
                                                key={i}
                                                className="h-1.5 w-1.5 rounded-full bg-brand"
                                                animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                                                transition={{
                                                    duration: 1,
                                                    repeat: Infinity,
                                                    delay: i * 0.15,
                                                    ease: "easeInOut",
                                                }}
                                            />
                                        ))}
                                    </span>
                                    <span className="text-sm text-ink-muted">
                                        Searching flights…
                                    </span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="relative p-4 bg-canvas/50 border-t border-edge space-y-3 backdrop-blur-md">
                    {/* Direct flights toggle */}
                    <div className="flex items-center justify-between">
                        <button
                            type="button"
                            role="switch"
                            aria-checked={isDirectOnly}
                            onClick={() => setIsDirectOnly((v) => !v)}
                            className="inline-flex items-center gap-2 text-sm text-ink-muted hover:text-ink transition-colors"
                        >
                            <span
                                className={clsx(
                                    "relative h-5 w-9 rounded-full border transition-all duration-200",
                                    isDirectOnly
                                        ? "bg-brand border-brand-strong"
                                        : "bg-surface border-edge"
                                )}
                            >
                                <motion.span
                                    layout
                                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    className={clsx(
                                        "absolute top-0.5 h-4 w-4 rounded-full bg-white shadow",
                                        isDirectOnly ? "right-0.5" : "left-0.5"
                                    )}
                                />
                            </span>
                            <span className="select-none">Direct flights only</span>
                        </button>
                        <span className="text-xs uppercase tracking-[0.16em] text-ink-faint hidden sm:inline">
                            Press ⏎ to send
                        </span>
                    </div>

                    <div className="relative">
                        <motion.div
                            aria-hidden
                            className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 focus-within:opacity-100 transition-opacity"
                            style={{
                                background:
                                    "linear-gradient(120deg, var(--color-brand), var(--color-brand-strong))",
                                filter: "blur(12px)",
                            }}
                        />
                        <div className="relative flex items-center bg-canvas border border-edge-strong rounded-2xl focus-within:border-brand transition-colors">
                            <input
                                className="flex-1 bg-transparent px-4 py-4 text-base text-ink placeholder:text-ink-faint focus:outline-none"
                                placeholder='Ask anything — e.g. "Flights to Paris next week"'
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={loading}
                            />
                            <motion.button
                                whileTap={{ scale: 0.94 }}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => handleSend()}
                                disabled={loading || !input.trim()}
                                aria-label="Send message"
                                className="mr-1.5 my-1.5 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover text-white border border-brand-strong/60 shadow-[0_10px_30px_-12px_color-mix(in_oklab,var(--color-brand)_70%,transparent)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="h-4 w-4" />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>

            <SeatSelectionModal
                isOpen={isSeatModalOpen}
                onClose={() => setIsSeatModalOpen(false)}
                onConfirm={handleSeatConfirmed}
                price={
                    selectedFlight
                        ? `${selectedFlight.currency} ${selectedFlight.priceTotal.toLocaleString()}`
                        : ""
                }
                flightId={selectedFlight?.id}
            />
        </>
    );
}

interface FlightCardProps {
    flight: FlightOffer;
    onBook: () => void;
}

function FlightCard({ flight, onBook }: FlightCardProps) {
    const first = flight.segments[0];
    const last = flight.segments[flight.segments.length - 1];

    const departTime = first?.departureTime?.slice(11, 16) ?? "";
    const arriveTime = last?.arrivalTime?.slice(11, 16) ?? "";

    const hours = Math.floor(flight.totalDurationMinutes / 60);
    const mins = flight.totalDurationMinutes % 60;

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 12, scale: 0.97 },
                show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.4 } },
            }}
            whileHover={{ y: -3 }}
            className="relative bg-gradient-to-br from-surface-elev/35 to-surface/85 border border-edge rounded-2xl p-4 hover:border-edge-strong hover:shadow-[0_18px_40px_-20px_color-mix(in_oklab,var(--color-brand)_45%,transparent)] transition-all group overflow-hidden"
        >
            <span
                aria-hidden
                className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-brand/15 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"
            />
            <div className="relative flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-brand/15 border border-edge-strong flex items-center justify-center text-brand group-hover:scale-105 transition-transform">
                        <Plane className="h-5 w-5" />
                    </div>
                    <div>
                        <div className="font-semibold text-ink text-base tracking-tight">
                            {flight.origin}{" "}
                            <span className="text-brand">→</span>{" "}
                            {flight.destination}
                        </div>
                        <div className="text-sm text-ink-subtle">
                            {flight.airlineCodes.join(", ")} · {flight.fareClass}
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xl font-bold text-brand-gradient">
                        {flight.currency} {flight.priceTotal.toLocaleString()}
                    </div>
                    <div className="text-xs uppercase tracking-wider text-ink-subtle">
                        per person
                    </div>
                </div>
            </div>

            <div className="relative flex items-center justify-between text-base text-ink mb-4 bg-canvas/60 p-3 rounded-2xl border border-edge">
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-ink">
                        <PlaneTakeoff className="h-4 w-4 text-brand" />
                        {departTime}
                    </div>
                    <div className="text-xs text-ink-subtle mt-0.5">{flight.origin}</div>
                </div>
                <div className="flex flex-col items-center px-4 flex-1">
                    <div className="text-xs text-ink-subtle mb-1">
                        {hours}h {mins}m
                    </div>
                    <div className="w-full h-px bg-edge-strong relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-canvas px-2 text-xs text-ink-muted border border-edge rounded-full">
                            {flight.numberOfStops === 0 ? "Direct" : `${flight.numberOfStops} stop`}
                        </div>
                    </div>
                </div>
                <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-ink">
                        <PlaneLanding className="h-4 w-4 text-brand" />
                        {arriveTime}
                    </div>
                    <div className="text-xs text-ink-subtle mt-0.5">{flight.destination}</div>
                </div>
            </div>

            <Button onClick={onBook} className="w-full">
                <Zap className="mr-2 h-4 w-4" />
                Book this flight
            </Button>
        </motion.div>
    );
}

function PriceTrendPanel({ trend }: { trend: PriceTrend }) {
    if (!trend.points.length) return null;

    const max = Math.max(...trend.points.map((p) => p.minPrice));
    const min = Math.min(...trend.points.map((p) => p.minPrice));
    const range = Math.max(1, max - min);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-br from-surface-elev/35 to-surface/85 border border-dashed border-edge-strong rounded-2xl p-4 space-y-3"
        >
            <div className="flex justify-between items-center">
                <span className="inline-flex items-center gap-2 text-[10px] font-semibold text-brand uppercase tracking-[0.18em]">
                    <TrendingDown className="h-3 w-3" />
                    Price trend
                </span>
                {trend.cheapestDate && (
                    <span className="text-xs text-success font-medium bg-success/10 border border-success/30 px-2 py-0.5 rounded-full">
                        Best: {trend.currency} {trend.cheapestPrice?.toLocaleString()}
                    </span>
                )}
            </div>

            {/* Mini sparkline */}
            <div className="flex items-end gap-1 h-12">
                {trend.points.map((p, i) => {
                    const heightPct = 20 + ((max - p.minPrice) / range) * 70;
                    const isMin = p.minPrice === min;
                    return (
                        <motion.div
                            key={p.date}
                            initial={{ height: 0 }}
                            animate={{ height: `${heightPct}%` }}
                            transition={{ delay: 0.1 + i * 0.04, duration: 0.5, ease: "easeOut" }}
                            title={`${p.date} · ${trend.currency} ${p.minPrice.toLocaleString()}`}
                            className={clsx(
                                "flex-1 rounded-sm",
                                isMin
                                    ? "bg-gradient-to-t from-success to-success/40"
                                    : "bg-gradient-to-t from-brand to-brand-strong/30"
                            )}
                        />
                    );
                })}
            </div>

            <div className="space-y-1 max-h-32 overflow-y-auto pr-2">
                {trend.points.map((p) => (
                    <div
                        key={p.date}
                        className="flex justify-between text-xs py-1.5 border-b border-edge last:border-0"
                    >
                        <span className="text-ink-muted">{p.date}</span>
                        <span className="text-ink font-medium">
                            {trend.currency} {p.minPrice.toLocaleString()}
                        </span>
                    </div>
                ))}
            </div>

            {trend.insightSummary && (
                <p className="text-xs text-ink-muted italic border-t border-edge pt-2 mt-2">
                    "{trend.insightSummary}"
                </p>
            )}
        </motion.div>
    );
}
