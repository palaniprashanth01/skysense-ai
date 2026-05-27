import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
import express from "express";
import cors from "cors";
// @ts-ignore
import Amadeus from "amadeus";
// @ts-ignore
import Razorpay from "razorpay";
import { parseUserQuery } from "./services/aiParser";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---------- Types ----------
type CabinClass = "ECONOMY" | "PREMIUM_ECONOMY" | "BUSINESS" | "FIRST";

interface FlightSegment {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  durationMinutes: number;
}

interface FlightOffer {
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

interface PricePoint {
  date: string;
  minPrice: number;
  avgPrice: number;
}

interface PriceTrend {
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

// ---------- Amadeus client ----------
let amadeus: any;
if (process.env.AMADEUS_CLIENT_ID && process.env.AMADEUS_CLIENT_SECRET) {
  amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
  });
} else {
  console.warn("⚠️  Amadeus credentials not found. Flight search will fail.");
}

// ---------- Razorpay client ----------
let razorpay: any;
if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
  });
} else {
  console.warn("⚠️  Razorpay credentials not found. Booking will fail.");
}

// ---------- Helpers ----------

function parseIsoDurationToMinutes(iso: string | undefined): number {
  if (!iso || !iso.startsWith("PT")) return 0;
  const match = /PT(?:(\d+)H)?(?:(\d+)M)?/.exec(iso);
  const hours = match?.[1] ? parseInt(match[1], 10) : 0;
  const minutes = match?.[2] ? parseInt(match[2], 10) : 0;
  return hours * 60 + minutes;
}

function mapAmadeusOffer(raw: any, currencyFallback = "INR"): FlightOffer {
  const priceTotal = Number(raw.price?.grandTotal ?? raw.price?.total ?? 0);
  const currency: string = raw.price?.currency ?? currencyFallback;
  const id: string = raw.id ?? `${priceTotal}-${Date.now()}`;

  const firstItin = raw.itineraries?.[0];
  const segments: FlightSegment[] =
    firstItin?.segments?.map((s: any) => ({
      from: s.departure?.iataCode,
      to: s.arrival?.iataCode,
      departureTime: s.departure?.at,
      arrivalTime: s.arrival?.at,
      airline: s.carrierCode,
      flightNumber: s.number,
      durationMinutes: parseIsoDurationToMinutes(s.duration)
    })) ?? [];

  const totalDurationMinutes = segments.reduce(
    (acc, s) => acc + s.durationMinutes,
    0
  );

  const airlineCodes = Array.from(
    new Set(segments.map((s) => s.airline).filter(Boolean))
  ) as string[];

  const numberOfStops = Math.max(segments.length - 1, 0);

  const fareClass: CabinClass =
    (raw.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.cabin as CabinClass) ??
    "ECONOMY";

  return {
    id,
    origin: segments[0]?.from ?? "",
    destination: segments[segments.length - 1]?.to ?? "",
    departureDate: segments[0]?.departureTime?.slice(0, 10) ?? "",
    priceTotal,
    currency,
    segments,
    totalDurationMinutes,
    numberOfStops,
    airlineCodes,
    fareClass
  };
}

function buildPriceTrend(
  offers: FlightOffer[],
  currency: string
): PriceTrend | null {
  if (!offers.length) return null;

  // group by departureDate
  const byDate: Record<string, FlightOffer[]> = {};
  for (const offer of offers) {
    const d = offer.departureDate;
    if (!byDate[d]) byDate[d] = [];
    byDate[d].push(offer);
  }

  const points: PricePoint[] = Object.entries(byDate).map(
    ([date, list]) => {
      const prices = list.map((o) => o.priceTotal);
      const minPrice = Math.min(...prices);
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      return { date, minPrice, avgPrice: Math.round(avg) };
    }
  );

  points.sort((a, b) => a.date.localeCompare(b.date));

  const cheapest = points.reduce((best, p) =>
    p.minPrice < best.minPrice ? p : best
  );

  const first = points[0];
  const last = points[points.length - 1];
  const diff = last.minPrice - first.minPrice;
  const pct = (diff / first.minPrice) * 100;
  const direction =
    Math.abs(pct) < 5
      ? "stable"
      : pct > 0
        ? "increasing"
        : "decreasing";

  const insightSummary =
    direction === "stable"
      ? `Prices are fairly stable; the cheapest date is ${cheapest.date} at ${currency} ${cheapest.minPrice}.`
      : direction === "increasing"
        ? `Prices seem to increase over time; booking earlier around ${cheapest.date} (~${currency} ${cheapest.minPrice}) is likely cheaper.`
        : `Prices tend to decrease later; consider flying closer to ${cheapest.date} (~${currency} ${cheapest.minPrice}).`;

  const anyOffer = offers[0];

  return {
    route: {
      origin: anyOffer.origin,
      destination: anyOffer.destination
    },
    currency,
    points,
    cheapestDate: cheapest.date,
    cheapestPrice: cheapest.minPrice,
    insightSummary
  };
}



// ---------- Cache ----------
const flightOffersCache = new Map<string, any>();

// ---------- Routes ----------

// @ts-ignore
import { getJson } from "serpapi";

// ... (previous code)

// ---------- SerpAPI Helper ----------
async function searchSerpApi(parsed: any): Promise<FlightOffer[]> {
  if (!process.env.SERPAPI_API_KEY) {
    console.warn("SERPAPI_API_KEY missing, skipping Google Flights search.");
    return [];
  }

  try {
    const params = {
      engine: "google_flights",
      departure_id: parsed.origin,
      arrival_id: parsed.destination,
      outbound_date: parsed.departureDate,
      return_date: parsed.returnDate,
      currency: parsed.currency,
      hl: "en",
      api_key: process.env.SERPAPI_API_KEY,
      stops: parsed.nonStop ? "1" : "0" // 1 = Non-stop only in SerpAPI (sometimes varies, but usually 1 is direct)
      // Actually, SerpAPI google_flights stops param: 0 = Any, 1 = Non-stop, 2 = 1 stop, etc.
      // Let's check documentation or assume 1 is non-stop. 
      // Correction: Google Flights URL param 's' usually maps 0 to nonstop.
      // Let's filter manually after fetching to be safe if API param is ambiguous.
    };

    // SerpAPI google_flights `type` param: 1 = round trip (requires return_date),
    // 2 = one way, 3 = multi-city. Default is 1, so we MUST set type=2 for one-way
    // queries or the API returns "return_date is required if type is 1".
    const isRoundTrip = !!parsed.returnDate;
    const response = await getJson({
      engine: "google_flights",
      type: isRoundTrip ? "1" : "2",
      departure_id: parsed.origin,
      arrival_id: parsed.destination,
      outbound_date: parsed.departureDate,
      ...(isRoundTrip ? { return_date: parsed.returnDate } : {}),
      currency: parsed.currency,
      hl: "en",
      api_key: process.env.SERPAPI_API_KEY,
    });

    const flights: FlightOffer[] = [];
    const bestFlights = response.best_flights || [];
    const otherFlights = response.other_flights || [];
    const all = [...bestFlights, ...otherFlights];

    all.forEach((f: any) => {
      const segments: FlightSegment[] = f.flights_cluster?.map((s: any) => ({
        from: s.departure_airport?.id || parsed.origin,
        to: s.arrival_airport?.id || parsed.destination,
        departureTime: s.departure_time,
        arrivalTime: s.arrival_time,
        airline: s.airline,
        flightNumber: s.flight_number,
        durationMinutes: s.duration // usually in minutes
      })) || [];

      // If no segments found (sometimes structure varies), skip
      if (!segments.length) return;

      const priceTotal = f.price; // usually a number like 1234
      const id = `serp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      flights.push({
        id,
        origin: parsed.origin,
        destination: parsed.destination,
        departureDate: parsed.departureDate,
        priceTotal,
        currency: parsed.currency,
        segments,
        totalDurationMinutes: f.total_duration,
        numberOfStops: f.layovers?.length || (segments.length - 1),
        airlineCodes: [f.airline], // simplified
        fareClass: "ECONOMY" // default
      });
    });

    return flights;
  } catch (err) {
    console.error("SerpAPI error:", err);
    return [];
  }
}

// ---------- Routes ----------

// POST /api/chat – SkySense AI flight assistant (Amadeus + SerpAPI)
app.post("/api/chat", async (req: express.Request, res: express.Response) => {
  const { message, nonStopOverride, history } = req.body as {
    message?: string,
    nonStopOverride?: boolean,
    history?: any[]
  };
  console.log("SkySense AI received:", message);

  try {
    // 🔥 Groq-based parser with history
    const parsed = await parseUserQuery(message || "", history || []);
    console.log("Parsed query:", parsed);

    // Check for missing slots
    const missingFields = [];
    if (!parsed.origin) missingFields.push("origin city");
    if (!parsed.destination) missingFields.push("destination city");
    if (!parsed.departureDate) missingFields.push("travel date");

    if (missingFields.length > 0) {
      // If slots are missing, ask for them
      let replyText = "";
      if (!parsed.origin && !parsed.destination) {
        replyText = "Where would you like to fly from and to?";
      } else if (!parsed.origin) {
        replyText = "Where are you flying from?";
      } else if (!parsed.destination) {
        replyText = "Where do you want to fly to?";
      } else if (!parsed.departureDate) {
        replyText = "When do you want to travel?";
      } else {
        replyText = `I need a bit more info: ${missingFields.join(", ")}.`;
      }

      return res.json({
        message: replyText,
        flights: [],
        priceTrend: null,
        parsedQuery: null // Don't save partial queries
      });
    }

    // Apply override if present (from UI toggle)
    if (typeof nonStopOverride === "boolean") {
      parsed.nonStop = nonStopOverride;
    }

    // 1. Amadeus Search
    const amadeusPromise = (async () => {
      if (!process.env.AMADEUS_CLIENT_ID || !process.env.AMADEUS_CLIENT_SECRET) return [];
      try {
        const response = await amadeus.shopping.flightOffersSearch.get({
          originLocationCode: parsed.origin,
          destinationLocationCode: parsed.destination,
          departureDate: parsed.departureDate,
          adults: parsed.adults,
          currencyCode: parsed.currency,
          max: 10,
          nonStop: parsed.nonStop // Amadeus supports this directly
        });
        const data = (response as any).data ?? [];

        // Cache for seat map
        data.forEach((raw: any) => {
          if (raw.id) flightOffersCache.set(raw.id, raw);
        });

        return data.map((raw: any) => mapAmadeusOffer(raw, parsed.currency));
      } catch (e) {
        console.error("Amadeus search failed:", e);
        return [];
      }
    })();

    // 2. SerpAPI Search (Google Flights)
    const serpApiPromise = searchSerpApi(parsed);

    // Wait for both
    const [amadeusFlights, serpFlights] = await Promise.all([amadeusPromise, serpApiPromise]);

    // Deduplicate: Prefer Amadeus (has seat map) over SerpAPI
    const flightMap = new Map<string, FlightOffer>();

    const generateKey = (f: FlightOffer) => {
      // Create a unique key based on core flight details
      // e.g. "BOM-BER-2025-12-25-AI123"
      const flightNums = f.segments.map(s => s.airline + s.flightNumber).join("-");
      return `${f.origin}-${f.destination}-${f.departureDate}-${flightNums}`;
    };

    // 1. Add SerpAPI flights first
    serpFlights.forEach((f: FlightOffer) => {
      flightMap.set(generateKey(f), f);
    });

    // 2. Add/Overwrite with Amadeus flights (since we prefer them)
    amadeusFlights.forEach((f: FlightOffer) => {
      flightMap.set(generateKey(f), f);
    });

    let allFlights = Array.from(flightMap.values());

    // Filter by nonStop if needed (double check for SerpAPI results)
    if (parsed.nonStop) {
      allFlights = allFlights.filter(f => f.numberOfStops === 0);
    }

    if (!allFlights.length) {
      return res.json({
        message: "I couldn't find any flights for that route/date. Try changing the route or asking for a different month.",
        flights: [],
        priceTrend: null,
        parsedQuery: parsed
      });
    }

    // Sorting: Cheapest first
    allFlights.sort((a, b) => a.priceTotal - b.priceTotal);

    // Identify "Recommended" (Cheapest Direct vs Cheapest Overall)
    // For now, we just return the sorted list. The UI can highlight the first one.

    // Limit results
    const topFlights = allFlights.slice(0, 10);

    const priceTrend = buildPriceTrend(topFlights, parsed.currency) as PriceTrend;

    const cheapest = topFlights[0];
    const replyText = `Found ${allFlights.length} flights. The best deal is ${parsed.currency} ${cheapest.priceTotal} with ${cheapest.airlineCodes.join(",")}.`;

    res.json({
      message: replyText,
      flights: topFlights,
      priceTrend,
      parsedQuery: parsed
    });
  } catch (err: any) {
    console.error("Search error:", err);
    res.status(500).json({
      message: "I had trouble searching for flights. Please try again later.",
      flights: [],
      priceTrend: null,
      parsedQuery: null
    });
  }
});

// Helper: Generate Dummy Seat Map
function generateDummySeatMap(flightId: string) {
  const rows = [];
  const rowCount = 20;
  const currency = "INR";

  for (let i = 1; i <= rowCount; i++) {
    const rowSeats = [];
    const columns = ["A", "B", "C", "D", "E", "F"];

    for (const col of columns) {
      // Pricing Logic
      let price = 500; // Middle (B, E)
      if (col === "A" || col === "F") price = 1500; // Window
      if (col === "C" || col === "D") price = 1000; // Aisle

      // Random Availability (~30% occupied)
      const isOccupied = Math.random() < 0.3;

      rowSeats.push({
        number: `${i}${col}`,
        column: col,
        status: isOccupied ? "OCCUPIED" : "AVAILABLE",
        price: price.toString(),
        currency
      });
    }
    rows.push({ number: i, seats: rowSeats });
  }

  return [{ deckType: "MAIN", rows }];
}

// POST /api/seatmap – Get real-time seat map
app.post("/api/seatmap", async (req: express.Request, res: express.Response) => {
  const { flightId } = req.body;

  if (!flightId) {
    return res.status(400).json({ error: "flightId is required" });
  }

  // 1. Check if it's a SerpAPI flight (always use dummy)
  if (flightId.startsWith("serp-")) {
    console.log(`Generating dummy seat map for SerpAPI flight: ${flightId}`);
    return res.json({ decks: generateDummySeatMap(flightId) });
  }

  const rawOffer = flightOffersCache.get(flightId);
  if (!rawOffer) {
    // If cache expired, also fallback to dummy for better UX
    console.log(`Flight offer not found in cache, using dummy map: ${flightId}`);
    return res.json({ decks: generateDummySeatMap(flightId) });
  }

  try {
    const response = await amadeus.shopping.seatmaps.post({
      data: [rawOffer]
    });

    const seatData = response.data?.[0];
    if (!seatData) {
      console.log("Amadeus returned no seat data, using dummy map.");
      return res.json({ decks: generateDummySeatMap(flightId) });
    }

    // Parse Amadeus seat map into a simplified structure
    const decks = seatData.decks?.map((deck: any) => ({
      deckType: deck.deckConfiguration?.deckType || "MAIN",
      rows: deck.seats?.reduce((acc: any[], seat: any) => {
        const rowNum = seat.coordinates.x;
        const colLetter = seat.coordinates.y;

        let row = acc.find(r => r.number === rowNum);
        if (!row) {
          row = { number: rowNum, seats: [] };
          acc.push(row);
        }

        row.seats.push({
          number: seat.number,
          column: colLetter,
          status: seat.travelerPricing?.[0]?.seatAvailabilityStatus || "AVAILABLE",
          price: seat.travelerPricing?.[0]?.price?.total,
          currency: seat.travelerPricing?.[0]?.price?.currency
        });

        // Sort seats by column (A, B, C...)
        row.seats.sort((a: any, b: any) => a.column.localeCompare(b.column));

        return acc;
      }, []).sort((a: any, b: any) => a.number - b.number)
    })) || [];

    res.json({ decks });
  } catch (err: any) {
    console.error("SeatMap API error:", err?.response?.data || err);
    // Fallback to dummy map on error
    console.log("SeatMap API failed, using dummy map.");
    res.json({ decks: generateDummySeatMap(flightId) });
  }
});

// ---------- Bookings Store ----------
interface Booking {
  id: string;
  flightId: string;
  amount: number;
  currency: string;
  status: "pending" | "paid" | "failed";
  seatNumber?: string;
  createdAt: string;
}

import fs from "fs";
import path from "path";

const BOOKINGS_FILE = path.join(__dirname, "bookings.json");

// Load bookings from file
let bookings: Booking[] = [];
try {
  if (fs.existsSync(BOOKINGS_FILE)) {
    const data = fs.readFileSync(BOOKINGS_FILE, "utf-8");
    bookings = JSON.parse(data);
    console.log(`Loaded ${bookings.length} bookings from file.`);
  }
} catch (err) {
  console.error("Failed to load bookings:", err);
}

function saveBookings() {
  try {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2));
  } catch (err) {
    console.error("Failed to save bookings:", err);
  }
}

// POST /api/bookings – Create Razorpay Payment Link
app.post("/api/bookings", async (req: express.Request, res: express.Response) => {
  const { flightId, amount, currency, seatNumber } = req.body as {
    flightId?: string;
    amount?: number;
    currency?: string;
    seatNumber?: string;
  };
  console.log("Create booking for flight:", flightId, "Amount:", amount, "Currency:", currency, "Seat:", seatNumber);

  if (!flightId || !amount || !currency) {
    return res.status(400).json({
      success: false,
      message: "flightId, amount, and currency are required"
    });
  }

  if (!razorpay) {
    return res.status(500).json({
      success: false,
      message: "Payment gateway not configured."
    });
  }

  try {
    // Razorpay expects amount in the smallest unit (INR → paise)
    const amountInSubunits = Math.round(amount * 100);

    // Create a Payment Link
    const paymentLink = await razorpay.paymentLink.create({
      amount: amountInSubunits,
      currency,
      description: `SkySense AI booking for flight ${flightId} ${seatNumber ? `(Seat ${seatNumber})` : ""}`,
      customer: {
        name: "Palani Prashanth B",
        email: "palaniprashanth2001@gmail.com",
        contact: "7397571872"
      },
      notify: {
        email: true,
        sms: true
      },
      callback_url: "https://example.com/payment-success", // Placeholder
      callback_method: "get"
    });

    const paymentUrl = paymentLink.short_url;

    const bookingId = paymentLink.id || `bk_${Date.now()}`;

    bookings.push({
      id: bookingId,
      flightId: flightId!,
      amount,
      currency,
      status: "pending",
      seatNumber,
      createdAt: new Date().toISOString(),
    });
    saveBookings();

    res.json({
      success: true,
      paymentUrl,
    });
  } catch (error) {
    console.error("Razorpay error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment link."
    });
  }
});

// GET /api/bookings – simple booking history
app.get("/api/bookings", (req: express.Request, res: express.Response) => {
  // newest first
  const sorted = [...bookings].sort(
    (a, b) => b.createdAt.localeCompare(a.createdAt)
  );
  res.json({ bookings: sorted });
});

// GET /api/bookings/:id/verify – Manually verify payment status
app.get("/api/bookings/:id/verify", async (req: express.Request, res: express.Response) => {
  const { id } = req.params;
  const booking = bookings.find(b => b.id === id);

  if (!booking) {
    return res.status(404).json({ error: "Booking not found" });
  }

  if (booking.status === "paid") {
    return res.json({ status: "paid" });
  }

  try {
    // Fetch latest status from Razorpay
    const paymentLink = await razorpay.paymentLink.fetch(id);

    if (paymentLink.status === "paid") {
      booking.status = "paid";
      console.log(`Booking ${id} verified as PAID via API.`);
      saveBookings();
    } else if (paymentLink.status === "expired" || paymentLink.status === "cancelled") {
      booking.status = "failed";
      saveBookings();
    }

    res.json({ status: booking.status });
  } catch (err) {
    console.error("Error verifying booking:", err);
    res.status(500).json({ error: "Failed to verify status" });
  }
});

// POST /api/payments/webhook – Handle Razorpay events
app.post("/api/payments/webhook", express.json({ type: "application/json" }), (req: express.Request, res: express.Response) => {
  const payload = req.body;
  console.log("Razorpay webhook payload:", JSON.stringify(payload, null, 2));

  // In a real app, verify signature here using x-razorpay-signature header

  if (payload.event === "payment.link.paid") {
    const pl = payload.payload.payment_link.entity;
    const booking = bookings.find(b => b.id === pl.id);
    if (booking) {
      booking.status = "paid";
      console.log(`Booking ${booking.id} marked as PAID.`);
      saveBookings();
    }
  } else if (payload.event === "payment.link.failed") {
    const pl = payload.payload.payment_link.entity;
    const booking = bookings.find(b => b.id === pl.id);
    if (booking) {
      booking.status = "failed";
      console.log(`Booking ${booking.id} marked as FAILED.`);
      saveBookings();
    }
  }

  res.status(200).json({ received: true });
});

app.listen(PORT, () => {
  console.log(`SkySense AI server running on http://localhost:${PORT}`);
});
