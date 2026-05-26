# SkySense AI ✈️🤖

SkySense AI is an intelligent flight assistant that simplifies travel planning. It uses Large Language Models (LLMs) to understand natural language queries, fetches real-time flight data from multiple providers (Amadeus & Google Flights), and helps you book the best deals instantly.

## 🌟 Features

-   **🧠 Smart Parsing**: Understands complex queries like *"Find cheapest flights from Mumbai to Berlin next month for 2 adults"* or *"Indigo flights to Goa"*.
-   **🔌 Multi-Provider Search**: Automatically searches **Amadeus** and **Google Flights (SerpAPI)** simultaneously to find the lowest prices.
-   **✈️ Airline Preferences**: Supports filtering by airline name (e.g., "Indigo", "Air India", "Emirates").
-   **🔄 Smart Filtering**: Automatically handles requests for "nonstop" or "connecting" flights.
-   **💳 Seamless Payments**: Generates secure **Razorpay** payment links for instant booking.
-   **💺 Seat Selection**: Real-time seat maps for Amadeus flights and realistic dummy maps for others.
-   **📊 Interactive UI**: Built with **React** and **Tailwind CSS**, featuring a modern dark SaaS aesthetic.

## 🛠️ Tech Stack

-   **Frontend**: React, Tailwind CSS, Lucide Icons
-   **Backend**: Node.js, Express
-   **AI/LLM**: Groq (Llama 3) for query parsing
-   **Flight APIs**: Amadeus, SerpAPI (Google Flights)
-   **Payments**: Razorpay
-   **Persistence**: JSON file-based storage for bookings

## 🚀 Installation & Setup

### Prerequisites

-   Node.js 18+ installed
-   API Keys for:
    -   [Amadeus](https://developers.amadeus.com/) (Flight Data)
    -   [SerpAPI](https://serpapi.com/) (Google Flights)
    -   [Groq](https://console.groq.com/) (LLM Parsing)
    -   [Razorpay](https://razorpay.com/) (Payments)

### Steps

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/palaniprashanth01/skysense-ai.git
    cd skysense-ai
    ```

2.  **Setup Backend**:
    ```bash
    cd server
    npm install
    ```
    Create a `.env` file in `server/` with your keys (see `.env.example`).

3.  **Setup Frontend**:
    ```bash
    cd ../client
    npm install
    ```

## 🏃‍♂️ How to Run

1.  **Start Backend**:
    ```bash
    cd server
    npm run dev
    ```
    Runs on `http://localhost:4000`.

2.  **Start Frontend**:
    ```bash
    cd client
    npm run dev
    ```
    Runs on `http://localhost:5173`.

3.  Open `http://localhost:5173` in your browser.

## 💡 How to Search (Usage Guide)

SkySense AI is designed to understand natural language. You don't need to use specific keywords, but here are some tips to get the best results:

### 1. Basic Search
Just tell me where you want to go.
> "Flights from Delhi to London"
> "Chennai to Singapore"

### 2. Add Dates
You can specify exact dates or relative ones.
> "Mumbai to Dubai on 25th December"
> "Bangalore to Paris next week"
> "Delhi to Tokyo next month"

### 3. Filter by Airline
Prefer a specific carrier? Just ask.
> "Indigo flights from Chennai to Goa"
> "Emirates flights to New York"

### 4. Direct vs. Connecting
Save time or save money by specifying stops.
> "Nonstop flights from Mumbai to Dubai"
> "Cheapest connecting flights to London"

### 5. Complex Queries
Combine everything into one sentence!
> "Find me the cheapest nonstop Indigo flight from Bangalore to Phuket in March for 2 adults"

## ⚠️ Best Practices & What to Avoid

To ensure a smooth experience, please keep the following in mind:

### ❌ What to Avoid
1.  **Don't ignore the `.env` file**: The app **will not work** without API keys. Make sure you create the `.env` file in the `server/` directory.
2.  **Don't commit secrets**: Never push your `.env` file to GitHub. We have added it to `.gitignore` for your safety, but be careful not to force-add it.
3.  **Don't use vague queries**: While the AI is smart, queries like "flights to somewhere" might not work well. Always try to specify at least an **Origin** and **Destination**.

### ✅ Troubleshooting
-   **"Seat map unavailable"**: This is normal for some providers (like Google Flights). We provide a dummy map for simulation, but real-time data depends on the airline.
-   **"Booking Pending"**: If running locally, payment webhooks won't reach your machine. Use the **"Check Status"** button in "My Bookings" to manually verify your payment.

---
Made with ❤️ by SkySense Team
