
import dotenv from "dotenv";
dotenv.config({ path: "../.env" });
// @ts-ignore
import Amadeus from "amadeus";

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

async function run() {
    console.log("--- Step 1: Search 'Chennai to Russia' (MAA -> MOW) ---");
    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: "MAA",
            destinationLocationCode: "MOW",
            departureDate: "2026-01-05", // Future date
            adults: 1,
            max: 1
        });

        const flight = response.data[0];
        if (!flight) {
            console.log("No flights found.");
            return;
        }

        console.log("Found Flight ID:", flight.id);
        console.log("Airline:", flight.validatingAirlineCodes[0]);

        console.log("\n--- Step 2: Fetch Seat Map ---");
        const seatMapResp = await amadeus.shopping.seatmaps.post({
            data: [flight]
        });

        const seatData = seatMapResp.data?.[0];
        if (seatData) {
            console.log("Seat Map Found!");
            console.log("Decks:", seatData.decks?.length);
        } else {
            console.log("No seat map data returned.");
        }

    } catch (error: any) {
        console.error("Error:", error.response?.data || error.message);
    }
}

run();
