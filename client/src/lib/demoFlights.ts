// client/src/lib/demoFlights.ts
// Mock flight responses used when the backend is unavailable or unconfigured.
// Lets the chat stay functional as a live demo without any API keys.

import type {
    ChatApiResponse,
    FlightOffer,
    PriceTrend,
} from "./api";

type Route = {
    origin: string;
    destination: string;
    currency: string;
    basePrice: number;
    durationMins: number;
    airlines: string[];
    keywords: string[];
};

// A small handful of fictional but realistic-looking routes.
const ROUTES: Route[] = [
    {
        origin: "BLR",
        destination: "DEL",
        currency: "INR",
        basePrice: 4_280,
        durationMins: 165,
        airlines: ["AI", "6E", "UK"],
        keywords: ["bengaluru", "bangalore", "blr", "delhi", "del", "ncr"],
    },
    {
        origin: "BOM",
        destination: "BER",
        currency: "INR",
        basePrice: 41_900,
        durationMins: 620,
        airlines: ["LH", "EK", "QR"],
        keywords: ["mumbai", "bombay", "bom", "berlin", "ber", "germany"],
    },
    {
        origin: "BLR",
        destination: "SIN",
        currency: "INR",
        basePrice: 18_400,
        durationMins: 265,
        airlines: ["SQ", "AI", "6E"],
        keywords: ["bengaluru", "bangalore", "blr", "singapore", "sin"],
    },
    {
        origin: "DEL",
        destination: "BOM",
        currency: "INR",
        basePrice: 3_950,
        durationMins: 130,
        airlines: ["AI", "6E", "UK"],
        keywords: ["delhi", "del", "mumbai", "bombay", "bom"],
    },
    {
        origin: "BLR",
        destination: "CDG",
        currency: "INR",
        basePrice: 49_200,
        durationMins: 715,
        airlines: ["AF", "EK", "LH"],
        keywords: ["bengaluru", "bangalore", "blr", "paris", "cdg", "france"],
    },
    {
        origin: "BLR",
        destination: "DPS",
        currency: "INR",
        basePrice: 24_300,
        durationMins: 540,
        airlines: ["SQ", "AI", "MH"],
        keywords: ["bengaluru", "bangalore", "blr", "bali", "denpasar", "dps", "indonesia"],
    },
];

function pickRoute(message: string): Route {
    const m = message.toLowerCase();
    const scored = ROUTES.map((r) => ({
        r,
        score: r.keywords.reduce((acc, k) => acc + (m.includes(k) ? 1 : 0), 0),
    }));
    scored.sort((a, b) => b.score - a.score);
    return (scored[0].score > 0 ? scored[0].r : ROUTES[Math.floor(Math.random() * ROUTES.length)]);
}

function isoFor(daysFromNow: number, hour: number, minute = 0): string {
    const d = new Date();
    d.setDate(d.getDate() + daysFromNow);
    d.setHours(hour, minute, 0, 0);
    return d.toISOString();
}

function fmt(d: Date) {
    return d.toISOString().slice(0, 10);
}

function generateOffers(route: Route, nonStop: boolean): FlightOffer[] {
    const base = route.basePrice;
    const variants = [
        { price: base, stops: 0, depHour: 6, label: "morning", airlineIdx: 0 },
        { price: Math.round(base * 1.08), stops: 0, depHour: 14, label: "afternoon", airlineIdx: 1 },
        { price: Math.round(base * 0.88), stops: nonStop ? 0 : 1, depHour: 22, label: "redeye", airlineIdx: 2 },
    ];

    return variants
        .filter((v) => !nonStop || v.stops === 0)
        .map((v, i) => {
            const departISO = isoFor(7, v.depHour, 5 + i * 10);
            const arriveDate = new Date(departISO);
            arriveDate.setMinutes(arriveDate.getMinutes() + route.durationMins);
            const airline = route.airlines[v.airlineIdx % route.airlines.length];
            return {
                id: `demo-${route.origin}-${route.destination}-${v.label}`,
                origin: route.origin,
                destination: route.destination,
                departureDate: departISO.slice(0, 10),
                returnDate: null,
                priceTotal: v.price,
                currency: route.currency,
                segments: [
                    {
                        from: route.origin,
                        to: route.destination,
                        departureTime: departISO,
                        arrivalTime: arriveDate.toISOString(),
                        airline,
                        flightNumber: `${airline}${100 + i * 17}`,
                        durationMinutes: route.durationMins,
                    },
                ],
                totalDurationMinutes: route.durationMins,
                numberOfStops: v.stops,
                airlineCodes: [airline],
                fareClass: "ECONOMY" as const,
            };
        });
}

function generatePriceTrend(route: Route): PriceTrend {
    const points = Array.from({ length: 14 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() + i + 1);
        // Sinusoidal-ish variance so the sparkline reads as a real trend
        const wave = Math.sin(i / 2.1) * 0.18;
        const noise = (Math.random() - 0.5) * 0.08;
        const minPrice = Math.round(route.basePrice * (0.85 + wave + noise));
        return {
            date: fmt(d),
            minPrice,
            avgPrice: Math.round(minPrice * 1.12),
        };
    });
    const cheapest = points.reduce((min, p) => (p.minPrice < min.minPrice ? p : min), points[0]);
    return {
        route: { origin: route.origin, destination: route.destination },
        currency: route.currency,
        points,
        cheapestDate: cheapest.date,
        cheapestPrice: cheapest.minPrice,
        insightSummary: `Cheapest day to fly ${route.origin} → ${route.destination} in the next 2 weeks is ${cheapest.date}. Prices vary about ±18% across the window.`,
    };
}

export function buildDemoResponse(
    message: string,
    nonStop: boolean
): ChatApiResponse {
    const route = pickRoute(message);
    const flights = generateOffers(route, nonStop)
        .sort((a, b) => a.priceTotal - b.priceTotal);
    const priceTrend = generatePriceTrend(route);

    const intro = `Here are sample fares for **${route.origin} → ${route.destination}** (sorted by price). \n\n⚠️ Demo data — connect Amadeus + Groq keys in \`server/.env\` to fetch live results.`;

    return {
        message: intro,
        flights,
        priceTrend,
        parsedQuery: {
            origin: route.origin,
            destination: route.destination,
            departureDate: flights[0]?.departureDate,
            returnDate: null,
            adults: 1,
            currency: route.currency,
            nonStop,
        },
    };
}
