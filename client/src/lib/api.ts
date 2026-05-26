// client/src/lib/api.ts
import { buildDemoResponse } from "./demoFlights";

export type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

export interface FlightSegment {
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    airline: string;
    flightNumber: string;
    durationMinutes: number;
}

export interface FlightOffer {
    id: string;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | null;
    priceTotal: number;
    currency: string;
    segments: FlightSegment[];
    totalDurationMinutes: number;
    numberOfStops: number;
    airlineCodes: string[];
    fareClass: CabinClass;
}

export interface PricePoint {
    date: string;
    minPrice: number;
    avgPrice: number;
}

export interface PriceTrend {
    route: {
        origin: string;
        destination: string;
    };
    currency: string;
    points: PricePoint[];
    cheapestDate?: string;
    cheapestPrice?: number;
    insightSummary?: string;
}

export interface ParsedQuery {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string | null;
    adults: number;
    currency: string;
    nonStop: boolean;
}

export interface ChatApiResponse {
    message: string;
    flights: FlightOffer[];
    priceTrend: PriceTrend | null;
    parsedQuery?: ParsedQuery;
}

export async function sendChatMessage(
    message: string,
    nonStopOverride?: boolean,
    history?: { role: "user" | "assistant"; content: string }[]
): Promise<ChatApiResponse> {
    const nonStop = !!nonStopOverride;
    try {
        const res = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, nonStopOverride, history }),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = (await res.json()) as ChatApiResponse;

        // Backend running but returning empty results (no Amadeus keys, or upstream
        // returned nothing) → fall back to demo so the chat stays useful.
        const hasFlights = Array.isArray(data.flights) && data.flights.length > 0;
        const hasTrend = data.priceTrend && (data.priceTrend.points?.length ?? 0) > 0;
        if (!hasFlights && !hasTrend) {
            return buildDemoResponse(message, nonStop);
        }

        return data;
    } catch (err) {
        // Network error / backend down → return mocked flights so the demo stays alive
        console.warn("[sendChatMessage] backend unavailable, using demo data", err);
        return buildDemoResponse(message, nonStop);
    }
}

export interface BookingResponse {
    success: boolean;
    paymentUrl?: string;
    message?: string;
}

export async function createBooking(
    flightId: string,
    amount: number,
    currency: string,
    seatNumber?: string
): Promise<BookingResponse> {
    const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId, amount, currency, seatNumber })
    });

    if (!res.ok) {
        throw new Error("Failed to call /api/bookings");
    }

    return res.json();
}

export interface Booking {
    id: string;
    flightId: string;
    amount: number;
    currency: string;
    status: "pending" | "paid" | "failed";
    seatNumber?: string;
    createdAt: string;
}

export async function getBookings(): Promise<{ bookings: Booking[] }> {
    try {
        const res = await fetch("/api/bookings");
        if (!res.ok) return { bookings: [] };
        return await res.json();
    } catch {
        return { bookings: [] };
    }
}

export interface Seat {
    number: string;
    column: string;
    status: "AVAILABLE" | "OCCUPIED" | "BLOCKED";
    price?: string;
    currency?: string;
}

export interface SeatRow {
    number: number;
    seats: Seat[];
}

export interface SeatDeck {
    deckType: string;
    rows: SeatRow[];
}

export interface SeatMapResponse {
    decks: SeatDeck[];
}

export async function getSeatMap(flightId: string): Promise<SeatMapResponse> {
    const res = await fetch("/api/seatmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId })
    });

    if (!res.ok) {
        // If 404 or other error, return empty decks to trigger fallback
        return { decks: [] };
    }

    return res.json();
}

export async function verifyBookingStatus(bookingId: string): Promise<{ status: string }> {
    const res = await fetch(`/api/bookings/${bookingId}/verify`);
    return res.json();
}
