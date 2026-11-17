# Stage AI-PREVIEW-17 — Natural preview cards and verified images

## Live-domain finding (2026-11-17)
- Family Room B had a recommendation card but showed 'Photo unavailable'.
- A 100-person cottage question and a subsequent 'may preview ba?' had text but no matching Function Area cards.
- 'single room pool side may preview ba?' did not produce focused Poolside cards.

## Implemented on testing only (not yet merged/deployed)
- backend/controllers/ai/aiVerifiedPreview.js: read-only, exact-name/category/capacity matching and contextual follow-up handling. A request for a 100-person cottage never returns a 25-person cottage as a fit; only verified larger Function Areas may be offered instead.
- backend/controllers/ai/geminiChatController.js: direct DB-backed preview response with 0 Gemini calls, before generic intent extraction. Rates and images are never invented. No booking/payment writes.
- frontend/js/ai-chat.js: exact case-safe mapping of 84 real Git-tracked accommodation images for Vercel, with localhost prefix and backend media URLs. Tries the selected room's original cover and GET /api/rooms/:id gallery first, then a verified same-name static photo fallback; otherwise displays an honest placeholder.
- backend/tests/ai-verified-preview.test.js: 9 Node regression cases, including missing-photo and natural-language scenarios.

## Tester workflow
1. From project root, verify clean working tree and testing branch. Run git pull --ff-only origin testing.
2. In backend: node --test tests/ai-verified-preview.test.js tests/ai-natural-recommendations.test.js tests/ai-natural-room-details.test.js tests/ai-free-entrance.test.js
3. Restart backend after pull, hard refresh Customer Home, click New Chat.
4. 'may preview ka ng Family Room B?' — correct Family Room B image/card and actions.
5. 'double room preview' — only available Double Room cards and truthful image fallback.
6. 'single room pool side may preview ba?' — up to three Poolside cards; do not include Single Room Cottage.
7. New chat: 'anong cottage para sa 100 na tao', then 'may preview ba?' — never show undersized cottages as a fit; show DB-qualified Function Areas if any.
8. 'Beach Pavilion picture', 'Pool Pavilion photo', 'Family Room A preview', and specific Big Shade/Nipa Hut requests. Verify real photos and no 404 errors.
9. Retest existing Single Room Cottage images, room context and CR/free entrance replies; check 390px and 440px, buttons and Console Network requests.

Safety: no SQL changes, no real payments, no reservation creation, no main/domain deployment until actual browser QA and owner approval.
Automated checks noted are source syntax and in-memory simulations, NOT actual Node/browser tests.
## QA follow-up — Pool Shade vs Nipa Hut (2026-11-17)

User-reported localhost FAIL: 'anong mga pool shade meron kayo' then 'may preview kaba' showed Big Nipa Hut 10–12 photos/cards. Pool Shade is a distinct inventory family, not synonymous with generic Cottage or Nipa Hut. The separate follow-up 'pool shade hindi nipa hut' must replace old preview choices.

Targeted fix on testing only:
- Pool Shade (including poolside shade spelling), Big/Small Shade and Big/Small Nipa Hut receive distinct exact matching. Preserve generic Cottage searches and Single Room (Pool side) behavior.
- Natural catalog discovery ('anong mga pool shade meron kayo') and explicit corrections ('pool shade hindi nipa hut') return correct read-only verified preview cards before Gemini. A short preview follow-up uses the latest user category.
- The frontend drops stale selected accommodation IDs after a verified category switch. An amenity-only Pool Shade question still does not trigger card spam.
- No MySQL changes, image substitutions, bookings/payments, production deployments or migrations.

Local QA: run `node --test tests/ai-verified-preview.test.js tests/ai-natural-recommendations.test.js`; restart backend and hard refresh Customer Home. In a fresh chat ask (1) 'anong mga pool shade meron kayo', (2) 'may preview kaba', (3) 'pool shade hindi nipa hut'. Every card should be a listed Pool Shade (if available), have correct photo when the matched listing has an actual image, and never show Big Nipa Hut, Pool Pavilion or Single Room (Pool side). Then confirm Nipa Hut, Function Areas and Family/Double Rooms still recommend correctly. Capture browser screenshots before merging to main.
