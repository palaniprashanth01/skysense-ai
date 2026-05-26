# Deploy SkySense AI

Frontend on **Vercel**, backend on **Render**. Total time: ~5 minutes if you have both accounts already.

## Architecture

```
                    [ Browser ]
                         │
                         ▼
    ┌─────────────────────────────────────────┐
    │  Vercel (static client/dist)            │
    │  https://<your-project>.vercel.app      │
    └─────────────┬───────────────────────────┘
                  │  /api/* rewritten →
                  ▼
    ┌─────────────────────────────────────────┐
    │  Render (Express ts-node)               │
    │  https://skysense-ai-vc53.onrender.com  │
    └─────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┬─────────┐
        ▼         ▼         ▼         ▼
     Amadeus    Groq     SerpAPI   Razorpay
```

The frontend has **no secrets** — it only proxies `/api/*` to Render. All keys live on Render.

---

## Part 1 — Backend on Render (one-time setup)

Your existing service is at `https://skysense-ai-vc53.onrender.com`. It already has Amadeus keys but is **missing GROQ_API_KEY** (the chat will return wrong routes without it).

### Step 1 — Update env vars on Render

1. Open [render.com/dashboard](https://dashboard.render.com/)
2. Click your `skysense-ai-vc53` service
3. Left sidebar → **Environment**
4. Add / update these keys (copy values from your local `.env`):

   | Key | Required for |
   |---|---|
   | `GROQ_API_KEY` | NL query parsing (so "Mumbai to Berlin" → BOM/BER) |
   | `AMADEUS_CLIENT_ID` | Real flight search |
   | `AMADEUS_CLIENT_SECRET` | Real flight search |
   | `SERPAPI_API_KEY` | Optional — Google Flights secondary source |
   | `RAZORPAY_KEY_ID` | Booking → payment link |
   | `RAZORPAY_KEY_SECRET` | Booking → payment link |
   | `PORT` | Already set by Render — don't override |

5. Click **Save Changes** — Render will automatically redeploy (takes ~2 min)

### Step 2 — Verify

```bash
# Cold start may take 30–60s on free tier
curl -m 90 https://skysense-ai-vc53.onrender.com/api/chat \
  -X POST -H 'content-type: application/json' \
  -d '{"message":"BLR to DEL next week"}' | head -c 400
```

You should see flights with `"origin":"BLR","destination":"DEL"` (not `BOM → BER`). If you still see `BOM → BER`, the Groq key isn't set correctly — recheck Step 1.

### Notes on Render free tier
- **Service sleeps after 15 min idle.** First request after wake-up takes 30–60s.
- The frontend's demo-mode fallback kicks in if the request times out, so the chat still works during cold starts.
- Upgrade to Starter ($7/mo) to keep it warm.

---

## Part 2 — Frontend on Vercel

### Option A — Vercel CLI (fastest)

```bash
cd client
npx vercel --prod
```

When prompted:
- **Set up and deploy?** Y
- **Which scope?** your personal account (or team)
- **Link to existing project?** N (first time) / Y (subsequent)
- **Project name?** skysense-ai (or anything)
- **Code directory?** ./
- **Override settings?** N — auto-detection works

Vercel auto-detects Vite, builds `npm run build`, serves `dist/`. The `client/vercel.json` is already set up to:
- Proxy `/api/*` → `https://skysense-ai-vc53.onrender.com/api/*`
- Fall back to `index.html` for SPA routes

### Option B — Vercel dashboard

1. [vercel.com/new](https://vercel.com/new) → Import Git repository (after `git init` + push)
2. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client` ← **important** — your repo is a monorepo
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
3. **Environment variables**: leave empty — the frontend doesn't need any
4. Click **Deploy**

### Verify

Open your `https://<project>.vercel.app/skysense`, click a quick prompt chip. You should see:
- ✅ Real flight cards (live Amadeus data)
- ❌ NOT "Demo data" notice (that would mean the backend is unreachable)

---

## Part 3 — Custom domain (optional)

1. Vercel dashboard → your project → **Settings → Domains**
2. Add your domain → follow DNS instructions
3. Vercel auto-issues SSL via Let's Encrypt

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Chat shows "⚠️ Demo data" notice | Backend unreachable or returned empty | Wait 60s (cold start), then retry; check Render dashboard for crashes |
| Flight cards show wrong route (BOM → BER for everything) | `GROQ_API_KEY` not set on Render | Add it in Render env vars, save |
| "Failed to fetch bookings" in console only | Bookings file empty — harmless | Ignore (chat still works) |
| 502 / 503 from Vercel | Render is down or restarting | Check Render dashboard logs |
| Vercel build fails with "tsc: not found" | Vercel didn't install client deps | Make sure **Root Directory** is `client`, not the repo root |

---

## Quick redeploy

After future code changes:

```bash
# Frontend (from client/)
cd client && npx vercel --prod

# Backend (from server/) — Render auto-redeploys on git push if you connect a repo
# Or click "Manual Deploy → Deploy latest commit" in the Render dashboard
```

---

## Security checklist

- [x] `.env` is in `.gitignore` (incl. `*.env`, `.env.*`)
- [x] Frontend bundle contains **no API keys** (verified — only `/api/*` proxy URLs)
- [ ] **Rotate the keys** you pasted in our chat session (Amadeus, Groq, SerpAPI, Razorpay) before going live with real users
- [ ] Razorpay is currently in **TEST mode** (`rzp_test_…`) — switch to live keys + complete KYC before accepting real payments
