# Stage AI-NATURAL-FACTS-01 — Conversational room facts without hallucinations

## Problem evidenced in customer localhost screenshot
- Customer selected **Family Room A**, then asked **"does it have a cr?"**
- AI replied CR was not listed, although the confirmed production `defaultdb.accommodations` Family Room A (ID 99) has **Private CR**.
- Locally, backend `SELECT DATABASE()` previously confirmed `arvic_restore_test_20261020`. Previously only free entrance 99/100 (3/8 pax) was synced there. The room amenity field might still be blank; **verify it via SELECT before asserting that is the root cause**.
- Earlier generic **"anong meron sa family room b"** incorrectly invented information about Family Room A: direct exact-room DB facts are necessary.

## Implemented on `testing` only; NOT merged/deployed
- `backend/controllers/ai/aiNaturalRoomDetails.js`: DB-grounded response generation for colloquial room-contents questions; category-aware; converts actual separate-bedrooms/per-bedroom AC/cabinet facts into short natural sentence. Includes positive `free_entrance_pax` only when verified from the same row. Missing amenities = not listed (not falsely "no amenities"). Prevents script/style HTML content appearing in replies.
- `backend/controllers/ai/geminiChatController.js`: handles natural room-details BEFORE Gemini extraction. Uses fresh accommodation catalog and a second parameterized ID/name SELECT to identify the single, exact room. A newly mentioned named room overrides prior selected room. Requests mentioning two rooms bypass the single-room fast path. Individual amenity path also resolves explicit named room before older focused room.
- `backend/controllers/ai/aiAccommodationAmenities.js`: precise English singular CR grammar; if the actual record explicitly lists `Private CR`, the answer to `Does it have a CR?` says **private bathroom**. Never assume privacy from `CR` alone; existing conflict/negative checks retained.
- `backend/tests/ai-natural-room-details.test.js`: 13 isolated unit / mocked-controller regression checks PASS, including question paraphrases, facts limited to actual Family Room A/B row, no fabricated ref/TV, named-room override, pronoun follow-up, unknown Family Room C, 2-room comparison bypass, and HTML sanitation. **Actual Node test and browser QA still required.**

## Read-only Aiven database comparison (run FIRST)
```sql
SELECT t.id, t.name,
  CASE WHEN TRIM(COALESCE(t.amenities, '')) = ''
       THEN 'MISSING' ELSE 'FILLED' END AS localhost_amenities,
  CASE WHEN TRIM(COALESCE(p.amenities, '')) = ''
       THEN 'MISSING' ELSE 'FILLED' END AS production_amenities,
  t.free_entrance_pax AS localhost_free,
  p.free_entrance_pax AS production_free
FROM arvic_restore_test_20261020.accommodations AS t
JOIN defaultdb.accommodations AS p ON p.id = t.id AND p.name = t.name
WHERE t.id IN (99,100)
ORDER BY t.id;
```

## Guarded test data sync (ONLY after verifying local amenities MISSING and backup)
This changes ONLY the TEST schema, only NULL/blank amenities for exact matched Family Room IDs, and only copies already verified production facts. No customer bookings/payments or live domain DB changed.
```sql
UPDATE arvic_restore_test_20261020.accommodations AS t
JOIN defaultdb.accommodations AS p
  ON p.id = t.id AND p.name = t.name
JOIN defaultdb.accommodation_categories AS c ON c.id = p.category_id
SET t.amenities = p.amenities
WHERE t.id IN (99,100)
  AND t.name IN ('Family Room A','Family Room B')
  AND c.name = 'Room'
  AND TRIM(COALESCE(t.amenities,'')) = ''
  AND TRIM(COALESCE(p.amenities,'')) <> '';

SELECT id,name,free_entrance_pax,amenities
FROM arvic_restore_test_20261020.accommodations
WHERE id IN (99,100) ORDER BY id;
```

## Tester workflow
1. In backend terminal, `git switch testing`, `git pull --ff-only origin testing`, then run
   `node --test tests/ai-natural-room-details.test.js tests/ai-natural-recommendations.test.js tests/ai-free-entrance.test.js tests/ai-accommodation-category-amenities.test.js`.
2. Restart backend process (`node server.js`) because controller JavaScript changed. Hard refresh localhost Customer page.
3. Ensure backend `SELECT DATABASE()` points to the intended **test schema**, never change live `defaultdb` while QA.
4. Customer Chat > New > **"Anong meron sa Family Room B?"** — should mention only verified 7 inclusions + 8 free pax, without fridge or TV.
5. **"Does Family Room A have a CR?"** — should say YES, private bathroom based on newly synced test DB. Named A should override old B context.
6. Select Family Room A card, then **"does it have a cr?"** — should say YES, private bathroom and stay on A.
7. **"May ref din ba?"** — must NOT claim the room has a fridge; missing is unverified.
8. **"Anong amenities ng mga cottages?"** — should say ordinary cottage category does not include amenities, but don't confuse Single Room Cottage.
9. **"What amenities are in Function Areas?"** — tables, monoblock chairs and karaoke; remember Function Area Aiven records 39 and 101 have been populated on production, test DB may still need verified sync.
10. Screenshot actual browser responses. Only then consider merging testing to main.

**No self-training or unsupervised DB writes**: natural language is handled by verified DB retrieval plus Gemini for other dialogue; customer messages must never become unverified facts.
