# AI Resort Inquiry Accuracy Upgrade — 2026-11-19

## Goal and boundaries

Customers may ask many differently worded questions about the resort. The chatbot must answer **confirmed resort facts naturally** without forcing exact scripted questions, use fresh database data for accommodation details, and explicitly qualify missing policies. The app **does not self-train** on customer messages, cannot guarantee answers to unverified facts, and must not create bookings or modify the database from the chat.

Updated on **`testing` only**. No `main` merge, hosting change, MySQL migration, PayPal change or reservation-write change.

## Confirmed resort-wide knowledge

| Topic | Verified answer | Basis |
|---|---|---|
| Parking | Free on-site parking for **any type of vehicle**, including motorcycles, cars, vans and buses; no parking charge | Owner confirmation on November 19 |
| Resort location | 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite | Published Customer Home and public Landing pages |
| Operating hours | 24 hours, Monday to Sunday | Published Customer Home and public Landing pages |
| Contact | 0956-912-5625, 0967-817-0662 | Published Customer Home / Landing pages |
| Swimming pool | A swimming pool exists | Published public Landing page and gallery |

**Do not infer** that free parking also means free guest entrance, free pool admission, reserved parking, CCTV/guarded or covered parking, parking capacity, or private parking per room. Resort 24-hour operating hours do not override scheduled check-in/out times.

Keep accommodation prices, categories, capacities, available/maintenance status, amenities, descriptions and free-entrance counts **read from the current database**, never hardcode them in this FAQ module.

Existing policies in `resortPolicyKnowledge.js` (booking slots, entrance estimates, cancellation, manual refund, walk-in) remain authoritative. Current Customer online booking uses 50% accommodation downpayment via PayPal, excluding entrance. General inquiries about exact reservation/payment status still require the authenticated booking system.

## Missing knowledge — needs written resort approval

Before adding these as confirmed facts, ask management to verify: Wi-Fi availability (whole property vs individual rooms), pet policy, outside food policy and corkage, swimming-pool admission/use rules and rates, swimming-pool depth and lifeguards, parking space/capacity/security/overnight access, grill/kitchen rental and rules, event/function-area equipment pricing, child/Senior/PWD detailed entrance fee schedules, reservation changes, damage or lost-key fees, safety restrictions, accessibility and shuttle/transport service.

When information is missing: **"Hindi pa po confirmed yung policy na iyon. Pwede niyo pong i-check sa Front Desk: 0956-912-5625."** Never treat repeated customer claims as management verification. New approved facts should be added by a controlled code or authenticated admin editorial workflow, then tested/deployed; customer chat history is not an official knowledge source.

## Local QA — user phrasing, not exact scripted magic words

Test in **Customer Home → AI Assistant**, once by typing and once in **Taglish / Accurate (Gemini)** voice mode if credits permit.

| Ask | Expected |
|---|---|
| May parking ba kayo? | Yes, free parking for any vehicle |
| Libre parking ng motor? | Yes, no parking fee |
| Puwede po mag-park ng bus or van? | Yes, parking supports any vehicle type |
| Magkano parking fee? | Zero/free parking; **not** a room-price breakdown |
| Free parking and entrance fee? | Parking free, entrance separately charged/confirmed onsite |
| May CCTV ba sa parking? | Security not verified; refer Front Desk |
| May guaranteed slot ba for 100 vehicles? | Do not guarantee parking capacity |
| May own parking ba ang Family Room B? | Resort parking exists, but don't claim dedicated room parking |
| Where are you located? | 17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite |
| Open kayo 24/7? | Yes, resort open 24h; booking slots fixed |
| What's your contact number? | Both official phone numbers |
| Do you have a swimming pool? | Yes; don't invent pool rates or rules |
| Libre ba pool use? | Unverified fee; refer Front Desk |
| May free Wi-Fi? | Do not invent; refer Front Desk if not listed in applicable room details |
| Pet-friendly ba kayo? | Do not invent |
| Pwede outside food? May corkage? | Do not invent |
| Ano price ng Family Room B? | Price from CURRENT DB & exact stay slot; no new made-up amount |
| May own CR ba ang Family Room B? | DB-backed room amenities, not parking facts |
| Anong room ang good for 20 pax? | Current MySQL listing + actual preview cards |
| Available ba on Saturday? | Ask/check exact date and slot; no invented availability |

After a room preview, ask **"May free parking ba?"** — it must answer resort-wide parking without changing the selected room or producing unrelated cottage previews. Then ask the room's rate and verify the correct saved focus still applies.

## Run tests

From project root on clean `testing` branch:

```powershell
git status --short
git branch --show-current
git pull --ff-only origin testing
cd backend
node --test tests/ai-resort-inquiries.test.js tests/ai-offline-policy.test.js tests/ai-booking-security.test.js tests/ai-payment-followup.test.js tests/ai-refund-facebook-contact.test.js tests/ai-natural-recommendations.test.js tests/ai-taglish-tone.test.js
```

If already in `backend`, omit `cd backend`. These are **mock/test fixtures**, not live requests/payments. Confirm 0 fails and send screenshot or console trace. Then test localhost AI answers: free parking, unknown policies, correct room focus, clickable previews, and network offline fallback. For errors report request/response status without exposing API keys, session tokens or customer PII.

**Only after tests and Owner visual QA pass** should the current `testing` / `main` Git divergence be reconciled and a production release considered.
