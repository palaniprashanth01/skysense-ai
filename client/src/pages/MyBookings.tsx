import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getBookings, verifyBookingStatus, type Booking } from "@/lib/api";
import { ArrowLeft, Clock, CheckCircle, XCircle, Plane } from "lucide-react";
import { Link } from "react-router-dom";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};
const item = {
    hidden: { opacity: 0, y: 16, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

export default function MyBookings() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getBookings()
            .then((data) => setBookings(data.bookings))
            .catch((err) => console.error(err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="min-h-[calc(100vh-4rem)] text-ink">
            <div className="max-w-2xl mx-auto space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center gap-4"
                >
                    <Link
                        to="/"
                        aria-label="Back to dashboard"
                        className="p-2 rounded-full border border-edge hover:bg-brand/15 hover:border-edge-strong transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-brand-gradient">
                            My Bookings
                        </h1>
                        <p className="text-sm text-ink-subtle mt-1">
                            Every itinerary, status, and payment in one place.
                        </p>
                    </div>
                </motion.div>

                {loading ? (
                    <div className="grid gap-4">
                        {[0, 1, 2].map((i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.1 }}
                                className="h-24 rounded-2xl border border-edge bg-gradient-to-r from-surface-elev/40 via-surface/60 to-surface-elev/40"
                                style={{
                                    animation: "shimmer 1.6s linear infinite",
                                    backgroundSize: "200% 100%",
                                }}
                            />
                        ))}
                        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
                    </div>
                ) : bookings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-16 rounded-3xl border border-dashed border-edge-strong bg-surface/40"
                    >
                        <motion.div
                            animate={{ y: [-4, 4, -4] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/15 text-brand mb-4"
                        >
                            <Plane className="h-7 w-7" />
                        </motion.div>
                        <p className="text-ink-muted">No bookings found.</p>
                        <Link
                            to="/skysense"
                            className="text-brand hover:text-brand-strong mt-3 inline-block font-medium"
                        >
                            Book your first flight →
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="space-y-4"
                    >
                        <AnimatePresence>
                            {bookings.map((booking) => (
                                <motion.div
                                    layout
                                    key={booking.id}
                                    variants={item}
                                    whileHover={{ y: -3 }}
                                    className="rounded-2xl p-5 flex items-center justify-between bg-gradient-to-br from-surface-elev/40 to-surface/80 border border-edge hover:border-edge-strong transition-all backdrop-blur-md"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-11 w-11 rounded-xl bg-brand/15 border border-edge-strong flex items-center justify-center text-brand">
                                            <Plane className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="font-semibold text-ink">
                                                Flight {booking.flightId}
                                            </div>
                                            <div className="text-xs text-ink-subtle">
                                                {new Date(booking.createdAt).toLocaleString()}
                                            </div>
                                            <div className="text-sm font-medium mt-1 text-brand-gradient">
                                                {booking.currency} {booking.amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {booking.status === "paid" ? (
                                            <span className="inline-flex items-center gap-1 text-success bg-success/15 border border-success/30 px-2.5 py-1 rounded-full text-xs font-medium">
                                                <CheckCircle className="h-3 w-3" /> Paid
                                            </span>
                                        ) : booking.status === "failed" ? (
                                            <span className="inline-flex items-center gap-1 text-danger bg-danger/15 border border-danger/30 px-2.5 py-1 rounded-full text-xs font-medium">
                                                <XCircle className="h-3 w-3" /> Failed
                                            </span>
                                        ) : (
                                            <motion.span
                                                animate={{ opacity: [0.7, 1, 0.7] }}
                                                transition={{ duration: 1.8, repeat: Infinity }}
                                                className="inline-flex items-center gap-1 text-warning bg-warning/15 border border-warning/30 px-2.5 py-1 rounded-full text-xs font-medium"
                                            >
                                                <Clock className="h-3 w-3" /> Pending
                                            </motion.span>
                                        )}
                                        {booking.status === "pending" && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={async () => {
                                                        const res = await verifyBookingStatus(booking.id);
                                                        if (res.status !== "pending") {
                                                            getBookings().then((d) =>
                                                                setBookings(d.bookings)
                                                            );
                                                        }
                                                    }}
                                                    className="text-xs bg-brand/10 text-ink px-3 py-1.5 rounded-full hover:bg-brand/25 border border-edge-strong transition-colors"
                                                >
                                                    Check Status
                                                </button>
                                                <a
                                                    href={`https://razorpay.com/payment-link/${booking.id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs bg-brand text-white px-3 py-1.5 rounded-full hover:bg-brand-hover transition-colors shadow-[0_8px_20px_-10px_color-mix(in_oklab,var(--color-brand)_80%,transparent)]"
                                                >
                                                    Pay Now
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
