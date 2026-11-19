# AI Mock Regression — testing branch

Source commit: 4c53f9abd9b4574bf48b22271ae608ee798fa7b0
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 71.595199
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 22.830663
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 14.708014
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    not ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 13.098338
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:237:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /45 cottages/i. Input:
        
        'May 46 cottages po kami sa current listing (45 marked available). Listing count lang po ito; hindi pa confirmed ang availability sa specific date at time.'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: 'May 46 cottages po kami sa current listing (45 marked available). Listing count lang po ito; hindi pa confirmed ang availability sa specific date at time.'
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:258:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 31.680888
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 3.520265
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    not ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 7.034545
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:332:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + 'verified_accommodation_preview'
        - 'verified_cheapest_accommodation'
                    ^
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      actual: 'verified_accommodation_preview'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:343:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 8 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 9.522126
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 9 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.934208
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 10 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 4.287437
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 11 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 9.904662
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 12 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.499887
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 13 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 8.316144
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 14 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 5.187895
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 15 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 9.926453
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 16 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 5.073841
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 17 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 2.906477
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 18 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.853096
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 19 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 0.940324
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 20 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 2.762629
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 21 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 5.272257
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 22 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.075738
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 23 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 2.375793
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 24 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.301141
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 25 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.375433
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 26 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.06045
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 27 - English translation route responds with the English text
      ---
      duration_ms: 1.619092
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 28 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.518605
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 29 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.757054
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 30 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.513883
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 31 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.616183
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 32 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.992405
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 33 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.529358
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 34 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.474654
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 35 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.950119
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 36 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.141294
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 37 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.476919
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 38 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.730316
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 39 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.941768
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 40 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.346165
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 41 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 5.801808
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 42 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.372744
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 43 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.02773
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 44 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 704.354896
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 45 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.463257
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 46 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.930781
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 47 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.301739
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 48 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.283017
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 49 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.642974
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 50 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.611368
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 51 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.736738
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 52 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.879549
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 53 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.77377
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 54 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.903034
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 55 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.83535
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 56 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.517817
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 57 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.525672
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 58 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.678046
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 59 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.274947
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 60 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.491897
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 61 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.320048
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 62 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.278813
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 63 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.054094
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 64 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 5.240404
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 65 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.023023
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 66 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.040833
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 67 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.443695
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 68 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.444544
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 69 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.753866
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 70 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.36382
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 71 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.765331
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 72 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.46267
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 73 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.273403
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 74 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.652171
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 75 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.683627
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 76 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.347587
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 77 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.79319
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 78 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.869974
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 79 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.035084
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 80 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.650475
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 81 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.80663
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 82 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.800885
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 83 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.497132
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 84 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.715743
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 85 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.69353
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 86 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.696173
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 87 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.989357
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 88 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.643603
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 89 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.77628
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 90 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.442313
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 91 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 4.721223
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 92 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 2.292874
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 93 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.159986
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 94 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.150238
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 95 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.11701
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 96 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.292281
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 97 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.425385
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 98 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.815461
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 99 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.9728
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 100 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.728075
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 101 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.654883
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 102 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 7.017296
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 103 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.574713
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 104 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.190668
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 105 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.335562
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 106 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.462221
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 107 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 36.627771
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 108 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.615159
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 109 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.401119
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 110 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.662614
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 111 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.33902
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 112 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.393917
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 113 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.456012
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 114 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.730801
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 115 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.208262
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 116 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.411441
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 117 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.395995
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 118 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.259042
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 119 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.157688
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 120 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.100569
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 121 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.287191
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 122 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.155092
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 123 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.241606
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 124 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.539312
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 125 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.873338
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 126 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.268207
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 127 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.559649
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 128 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.402922
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 129 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.37615
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 130 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 2.603295
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 131 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.143932
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 132 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 11.492617
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 133 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.472578
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 134 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.251174
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 135 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.189904
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 136 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.152559
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 137 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.146333
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 138 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.410476
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 139 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.502246
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 140 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.585645
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 141 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.150611
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 142 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.226145
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 143 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.378173
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 144 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.464868
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 145 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.643909
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 146 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.205146
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 147 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.216414
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 148 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.197974
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 149 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.260096
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 150 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.220821
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 151 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.115232
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 152 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.304298
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 153 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.791854
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 154 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.226125
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 155 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.837187
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 156 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.555563
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 157 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.409308
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 158 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.193948
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 159 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.132447
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 160 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.251405
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 161 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.771657
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 162 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 7.530233
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 163 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.856641
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 164 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.204521
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 165 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.170037
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 166 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.533204
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 167 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.152466
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 168 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.669687
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 169 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.256082
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 170 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.598268
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 171 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 2.935693
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 172 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.385033
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 173 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.120506
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 174 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.120614
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 175 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.267344
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 176 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.235253
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 177 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 14.835993
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 178 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.353126
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 179 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.351465
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 180 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.605901
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 181 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.311716
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 182 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.664107
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 183 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.645644
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 184 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.187116
      type: 'test'
      ...
    1..184
    # tests 184
    # suites 0
    # pass 182
    # fail 2
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2642.892593
