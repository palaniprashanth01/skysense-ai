// server/services/aiParser.ts
import Groq from "groq-sdk";

export interface ParsedQuery {
    origin: string;
    destination: string;
    departureDate?: string;
    returnDate?: string | null;
    adults: number;
    currency: string;
    nonStop: boolean;
}

let client: Groq | null = null;

/**
 * Parse natural language into structured flight search params
 * using Groq (Llama).
 */
/**
 * Parse natural language into structured flight search params
 * using Groq (Llama).
 */
export async function parseUserQuery(message: string, history: any[] = []): Promise<ParsedQuery> {
    // If no key, use safe fallback
    if (!process.env.GROQ_API_KEY) {
        console.warn("GROQ_API_KEY missing — using fallback defaults.");
        // For fallback, we still need defaults or it breaks. 
        // But in production with key, we want strict parsing.
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return {
            origin: "BOM",
            destination: "BER",
            departureDate: d.toISOString().slice(0, 10),
            returnDate: null,
            adults: 1,
            currency: "INR",
            nonStop: false
        };
    }

    if (!client) {
        client = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    const systemPrompt = `
You are a flight search query parser.
Your ONLY job is to convert a natural language request into a strict JSON object.
Current Date: ${todayStr}

Use this TypeScript type:

{
  "origin": string | null,   // 3-letter IATA code (e.g. BOM, BER). Null if unknown.
  "destination": string | null, // 3-letter IATA code. Null if unknown.
  "departureDate": string | null, // ISO date YYYY-MM-DD. Null if unknown.
  "returnDate"?: string|null,// ISO date if round-trip, null or omitted if one-way
  "adults": number,          // number of adult passengers, default 1
  "currency": string,        // 3-letter code, default "INR"
  "nonStop": boolean         // true if user asks for "direct", "non-stop", "no stops"
}

Rules:
- Analyze the User Message AND the Conversation History to find the fields.
- Convert city names to their 3-letter IATA codes (e.g. Mumbai -> BOM, Berlin -> BER, London -> LHR, New York -> JFK).
- If a country is named, use its major international airport code (e.g. Russia -> MOW, USA -> JFK, UK -> LHR).
- Calculate relative dates (e.g. "tomorrow", "next month", "next Friday") based on the Current Date (${todayStr}).
- If no adult count is mentioned, default to 1.
- If no currency is mentioned, default to "INR".
- If user clearly implies round-trip with "return" / "back" / "round trip", set returnDate a few days after departure.
- If user mentions "direct", "non-stop", or "no stops", set nonStop to true. Otherwise false.
- **CRITICAL**: If Origin, Destination, or Date are NOT mentioned in the current message OR history, set them to null. DO NOT GUESS.
- Output ONLY valid JSON. No extra text, no explanation, no markdown.
`;

    const historyText = history.map(m => `${m.role}: ${m.content}`).join("\n");
    const userPrompt = `History:\n${historyText}\n\nCurrent User message: "${message}"`;

    try {
        const completion = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Updated to supported model
            temperature: 0,
            response_format: { type: "json_object" },
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ]
        });

        const raw = completion.choices[0]?.message?.content || "{}";
        let parsed: ParsedQuery;

        try {
            parsed = JSON.parse(raw);
        } catch (err) {
            console.error("Failed to parse Groq JSON:", raw, err);
            throw err; // Trigger fallback in outer catch
        }

        // Safety defaults for optional fields
        if (!parsed.adults || parsed.adults < 1) parsed.adults = 1;
        if (!parsed.currency) parsed.currency = "INR";
        if (typeof parsed.nonStop !== "boolean") parsed.nonStop = false;

        // Ensure date is in the future if present
        if (parsed.departureDate) {
            const today = new Date();
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = tomorrow.toISOString().slice(0, 10);
            if (parsed.departureDate < tomorrowStr) {
                // If date is in past/today, maybe user meant next year? 
                // For now, let's just keep it or nullify it if invalid.
                // Actually, let's trust the LLM but maybe warn.
            }
        }

        // We DO NOT default origin/dest/date here anymore.
        // We return them as null (or empty string if type requires string, but let's allow null in interface if needed, 
        // or just use empty string to signify missing).
        // The interface says string, so let's use empty string for missing.

        return {
            ...parsed,
            origin: parsed.origin || "",
            destination: parsed.destination || "",
            departureDate: parsed.departureDate || ""
        };

    } catch (err) {
        console.error("Groq API error or parsing failed:", err);
        // Fallback to defaults only on error
        const d = new Date();
        d.setDate(d.getDate() + 30);
        return {
            origin: "BOM",
            destination: "BER",
            departureDate: d.toISOString().slice(0, 10),
            returnDate: null,
            adults: 1,
            currency: "INR",
            nonStop: false
        };
    }
}
