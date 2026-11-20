# AI Mock Regression — testing branch

Source commit: d1e4e5a3998a281511730def3ff9cbd04a3c0511
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 73.524972
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 16.374961
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 17.276469
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 43.045098
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 8.893534
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 2.905847
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 19.001927
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 8 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 15.545982
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 9 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 5.385641
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 10 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.417744
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 11 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 9.522762
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 12 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 10.313563
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 13 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 3.747514
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 14 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 5.146952
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 15 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 4.413438
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 16 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 10.798784
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 17 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 4.945848
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 18 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 3.14078
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 19 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 2.629149
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 20 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.183863
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 21 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.115592
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 22 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 4.373086
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 23 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 1.740441
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 24 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 2.337731
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 25 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 2.904985
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 26 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 1.598968
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 27 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 1.790036
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 28 - English translation route responds with the English text
      ---
      duration_ms: 1.594451
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 29 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.257715
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 30 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.067725
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 31 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.695874
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 32 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.44479
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 33 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 2.684743
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 34 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 3.561213
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 35 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.75265
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 36 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.024469
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 37 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.408541
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 38 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 1.743376
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 39 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.878267
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 40 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.602171
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 41 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 1.609605
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 42 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 1.608352
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 43 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 1.627661
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 44 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.384996
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 45 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.524842
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 46 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.410045
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 47 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.054204
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 48 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 1.862986
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 49 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.598677
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 50 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.436303
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 51 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.205362
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 52 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.400675
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 53 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.488257
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 54 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 1.773981
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 55 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 1.885569
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 56 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.099702
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 57 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.558227
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 58 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.338456
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 59 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.130944
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 60 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.283569
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 61 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 1.69269
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 62 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 4.049889
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 63 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 2.651153
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 64 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.956036
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 65 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.243253
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 66 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.248185
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 67 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.583375
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 68 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.13572
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 69 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.26165
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 70 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.392127
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 71 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 1.668783
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 72 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.548813
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 73 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.14853
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 74 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.098234
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 75 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.203492
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 76 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.418216
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 77 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.130633
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 78 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.227068
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 79 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.132856
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 80 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.498677
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 81 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.350334
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 82 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.378486
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 83 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.234359
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 84 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.270143
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 85 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.5667
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 86 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.371886
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 87 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.32761
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 88 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.634281
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 89 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 4.072763
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 90 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.464566
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 91 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 1.924468
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 92 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.486108
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 93 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.24836
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 94 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.67326
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 95 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.438799
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 96 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.305623
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 97 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.41404
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 98 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 0.972705
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 99 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.550529
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 100 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.609457
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 101 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.592503
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 102 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.488085
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 103 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 5.395075
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 104 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.381395
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 105 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 1.505397
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 106 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.774206
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 107 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 2.427236
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 108 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 26.026638
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 109 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.605351
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 110 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.367484
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 111 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.547865
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 112 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.228014
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 113 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.337238
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 114 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 2.490841
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 115 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.545061
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 116 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 3.905041
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    not ok 117 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.805544
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:382:1'
      failureType: 'testCodeFailure'
      error: 'index.html'
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
        
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Arvic Seaside | Home</title>
        
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../customerCSS/index.css" />
            <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />
            <link rel="stylesheet" href="../sharedCSS/ai-voice.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261120-ui30" />
              <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
            <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->
            <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />
        </head>
        
          <body class="customer-manager-tone">
            <!-- ======================================================
               CUSTOMER NAVBAR
               Same Resort Map navbar style on all customer pages.
            ======================================================= -->
            <header class="navbar">
              <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->
              <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>
        
              <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>
        
              <nav id="mobileNav">
                <a href="index.html" class="active-nav">Home</a>
                <a href="rooms.html">Accommodations</a>
                <a href="resort-map.html">Resort Map</a>
                <a href="my-bookings.html">My Bookings</a>
                <a href="profile.html">Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               HERO SECTION
            ======================================================= -->
            <section class="hero-section">
              <div class="hero-inner">
                <div class="hero-badge">
                  Seaside comfort • Easy online booking • Smart assistant
                </div>
        
                <h1>Escape to a more relaxing resort stay.</h1>
        
                <p>
                  Explore beautiful accommodations, book your preferred schedule, and
                  manage your stay with a cleaner, smarter, and more premium guest
                  experience.
                </p>
        
                <div class="hero-actions">
                  <a href="rooms.html" class="btn-primary">Browse Accommodations</a>
                  <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
               MAIN HOME CONTENT
            ======================================================= -->
            <main class="home-wrapper">
              <section class="welcome-box">
                <h2>Your resort booking, made smoother</h2>
        
                <p>
                  Arvic Seaside helps you discover accommodations faster, compare stay
                  details clearly, and handle your reservations with less stress. From
                  accommodation selection to booking confirmation, the whole experience
                  feels more like a modern resort website.
                </p>
              </section>
        
              <!-- ======================================================
                 CLIENT INFORMATION SECTION
                 Added for mock defense and customer contact visibility.
              ======================================================= -->
              <section class="welcome-box">
                <h2>Arvic Seaside Beach Resort and Hotel</h2>
        
                <p>
                  Visit Arvic Seaside Beach Resort and Hotel at
                  <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong
                  >. The resort is open <strong>24 hours from Monday to Sunday</strong>.
                </p>
        
                <section class="home-grid" style="margin-top: 18px">
                  <div class="home-card location-map-card">
                    <iframe
                      class="location-map-bg"
                      src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
        
                    <div class="location-map-overlay"></div>
        
                    <div class="location-map-content">
                      <h2>Location</h2>
        
                      <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>
        
                      <a
                        href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                        class="btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Location
                      </a>
                    </div>
                  </div>
                  <!-- ======================================================
                 CONTACT DETAILS CARD
              ======================================================= -->
                  <div class="home-card contact-card">
                    <h2>Contact Details</h2>
        
                    <div class="contact-links-box">
                      <a href="tel:09569125625" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0956-912-5625</strong>
                          <small>Tap to call front desk</small>
                        </span>
                      </a>
        
                      <a href="tel:09678170662" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0967-817-0662</strong>
                          <small>Alternative contact number</small>
                        </span>
                      </a>
        
                      <a
                        href="mailto:resortarvicseaside@gmail.com"
                        class="contact-link-card email-contact-card"
                      >
                        <span class="contact-icon">✉</span>
                        <span>
                          <strong>resortarvicseaside@gmail.com</strong>
                          <small>Email the resort for inquiries</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="contact-note">
                      Always open • Monday to Sunday • 24 hours
                    </div>
                  </div>
        
                  <!-- ======================================================
                 SOCIAL MEDIA CARD
              ======================================================= -->
                  <div class="home-card social-card">
                    <h2>Social Media</h2>
        
                    <p>
                      Follow or message the resort through its official social media
                      pages for inquiries, updates, and announcements.
                    </p>
        
                    <div class="social-links-box">
                      <a
                        href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"
                        class="social-link-card facebook-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">f</span>
                        <span>
                          <strong>Facebook Page</strong>
                          <small>Message us for inquiries</small>
                        </span>
                      </a>
        
                      <a
                        href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"
                        class="social-link-card tiktok-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">♪</span>
                        <span>
                          <strong>TikTok</strong>
                          <small>View resort clips and updates</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="social-note">
                      Official social media links of Arvic Seaside Beach Resort and
                      Hotel.
                    </div>
                  </div>
                </section>
              </section>
        
              <section class="home-grid">
                <div class="home-card">
                  <h2>Browse Accommodations</h2>
        
                  <p>
                    Explore available rooms, cottages, and function areas with a cleaner
                    card layout, pricing, capacity display, amenities, and booking-ready
                    actions.
                  </p>
        
                  <a href="rooms.html" class="btn-primary">Explore Accommodations</a>
                </div>
        
                <div class="home-card">
                  <h2>Track Your Reservation</h2>
        
                  <p>
                    Check your current bookings, receipt details, payment method, and
                    reservation status in one organized guest dashboard.
                  </p>
        
                  <a href="my-bookings.html" class="btn-primary">Open My Bookings</a>
                </div>
        
                <div class="home-card">
                  <h2>Manage Your Account</h2>
        
                  <p>
                    Review your saved guest information and update your password
                    securely whenever needed from your personal profile page.
                  </p>
        
                  <a href="profile.html" class="btn-primary">Go to Profile</a>
                </div>
              </section>
        
              <section class="quick-strip">
                <div class="quick-item">
                  <h3>Relaxing visual theme</h3>
        
                  <p>
                    A more premium ocean-and-sand color palette for a proper seaside
                    resort feel.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>Mobile-friendly layout</h3>
        
                  <p>
                    Cleaner spacing and stronger cards so the customer pages still feel
                    good on phones.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>AI booking support</h3>
        
                  <p>
                    Ask for accommodation suggestions, dates, payment help, and start a
                    fresh new chat anytime.
                  </p>
                </div>
              </section>
            </main>
        
            <!-- ======================================================
               AI CHAT WIDGET
            ======================================================= -->
            <button id="aiChatToggle" class="ai-chat-toggle" type="button">Ask AI Assistant</button>
        
            <div id="aiChatWindow" class="ai-chat-window">
              <div class="ai-chat-header">
                <!-- UI-27: Branded concierge identity. Keep existing title and controls. -->
                <div class="ai-assistant-brand">
                  <span class="ai-assistant-mark" aria-hidden="true">✦</span>
                  <div class="ai-assistant-heading">
                    <h3>Arvic Seaside Resort AI Assistant</h3>
                    <span class="ai-assistant-caption">Your resort concierge · Here to help</span>
                  </div>
                </div>
        
                <div class="ai-chat-header-actions">
                  <button id="aiNewChatBtn" class="ai-chat-header-btn" title="New Chat" type="button">
                    New
                  </button>
        
                  <button
                    id="aiChatMaximize"
                    class="ai-chat-header-btn"
                    title="Maximize"
                   type="button">
                    ▢
                  </button>
        
                  <button id="aiChatClose" class="ai-chat-header-btn" title="Close" type="button">
                    &times;
                  </button>
                </div>
              </div>
        
              <div id="aiChatMessages" class="ai-chat-messages"></div>
        
              <div class="ai-chat-input-area">
                <input
                  type="text"
                  id="aiChatInput"
                  placeholder="Ask about rooms, cottages, dates, payment, or booking help..."
                />
        
                <button
                  id="aiMicBtn"
                  class="ai-chat-mic-btn"
                  title="Voice input"
                  aria-label="Voice input"
                 type="button">
                  🎤
                </button>
        
                <button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>
              </div>
            </div>
        
            <!-- ======================================================
               PAGE SCRIPTS
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js"></script>
            <script src="../customerJS/index.js"></script>
            <script src="../js/ai-chat.js?v=20261120-ui30"></script>
            <script src="../js/ai-voice.js?v=20261119-gemini-default-compact28"></script>
            <script src="../js/ai-chat-polish.js?v=20261120-ui30"></script>
            <script>
              const menuToggle = document.getElementById("menuToggle");
              const mobileNav = document.getElementById("mobileNav");
        
              if (menuToggle && mobileNav) {
                menuToggle.addEventListener("click", () => {
                  mobileNav.classList.toggle("show");
                  menuToggle.textContent = mobileNav.classList.contains("show")
                    ? "×"
                    : "☰";
                });
              }
            </script>
              <!-- Shared Customer scroll navigation: stays hidden down, reappears after slight up-scroll. -->
            <script src="../sharedJS/customer-scroll-nav.js?v=20261120-ui30"></script>
            <script src="../sharedJS/logout-confirm.js"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:399:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 118 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.436046
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    not ok 119 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 1.258105
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:423:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /ai-chat-airy\.css\?v=20261119-ui28/. Input:
        
        '<!doctype html>\n' +
          '<html lang="en">\n' +
          '  <head>\n' +
          '    <meta charset="UTF-8" />\n' +
          '\n' +
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '\n' +
          '    <title>Arvic Seaside | Home</title>\n' +
          '\n' +
          '    <link rel="stylesheet" href="../sharedCSS/global.css" />\n' +
          '    <link rel="stylesheet" href="../css/style.css" />\n' +
          '    <link rel="stylesheet" href="../customerCSS/index.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-voice.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261120-ui30" />\n' +
          '      <!-- Consistent, centered confirmation for accidental logout clicks. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />\n' +
          '    <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />\n' +
          '    <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />\n' +
          '</head>\n' +
          '\n' +
          '  <body class="customer-manager-tone">\n' +
          '    <!-- ======================================================\n' +
          '       CUSTOMER NAVBAR\n' +
          '       Same Resort Map navbar style on all customer pages.\n' +
          '    ======================================================= -->\n' +
          '    <header class="navbar">\n' +
          '      <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->\n' +
          '      <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>\n' +
          '\n' +
          '      <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>\n' +
          '\n' +
          '      <nav id="mobileNav">\n' +
          '        <a href="index.html" class="active-nav">Home</a>\n' +
          '        <a href="rooms.html">Accommodations</a>\n' +
          '        <a href="resort-map.html">Resort Map</a>\n' +
          '        <a href="my-bookings.html">My Bookings</a>\n' +
          '        <a href="profile.html">Profile</a>\n' +
          '        <a href="#" id="logoutBtn">Logout</a>\n' +
          '      </nav>\n' +
          '    </header>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       HERO SECTION\n' +
          '    ======================================================= -->\n' +
          '    <section class="hero-section">\n' +
          '      <div class="hero-inner">\n' +
          '        <div class="hero-badge">\n' +
          '          Seaside comfort • Easy online booking • Smart assistant\n' +
          '        </div>\n' +
          '\n' +
          '        <h1>Escape to a more relaxing resort stay.</h1>\n' +
          '\n' +
          '        <p>\n' +
          '          Explore beautiful accommodations, book your preferred schedule, and\n' +
          '          manage your stay with a cleaner, smarter, and more premium guest\n' +
          '          experience.\n' +
          '        </p>\n' +
          '\n' +
          '        <div class="hero-actions">\n' +
          '          <a href="rooms.html" class="btn-primary">Browse Accommodations</a>\n' +
          '          <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>\n' +
          '        </div>\n' +
          '      </div>\n' +
          '    </section>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       MAIN HOME CONTENT\n' +
          '    ======================================================= -->\n' +
          '    <main class="home-wrapper">\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Your resort booking, made smoother</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Arvic Seaside helps you discover accommodations faster, compare stay\n' +
          '          details clearly, and handle your reservations with less stress. From\n' +
          '          accommodation selection to booking confirmation, the whole experience\n' +
          '          feels more like a modern resort website.\n' +
          '        </p>\n' +
          '      </section>\n' +
          '\n' +
          '      <!-- ======================================================\n' +
          '         CLIENT INFORMATION SECTION\n' +
          '         Added for mock defense and customer contact visibility.\n' +
          '      ======================================================= -->\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Arvic Seaside Beach Resort and Hotel</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Visit Arvic Seaside Beach Resort and Hotel at\n' +
          '          <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong\n' +
          '          >. The resort is open <strong>24 hours from Monday to Sunday</strong>.\n' +
          '        </p>\n' +
          '\n' +
          '        <section class="home-grid" style="margin-top: 18px">\n' +
          '          <div class="home-card location-map-card">\n' +
          '            <iframe\n' +
          '              class="location-map-bg"\n' +
          '              src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"\n' +
          '              loading="lazy"\n' +
          '              referrerpolicy="no-referrer-when-downgrade"\n' +
          '            ></iframe>\n' +
          '\n' +
          '            <div class="location-map-overlay"></div>\n' +
          '\n' +
          '            <div class="location-map-content">\n' +
          '              <h2>Location</h2>\n' +
          '\n' +
          '              <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"\n' +
          '                class="btn-primary"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                Open Location\n' +
          '              </a>\n' +
          '            </div>\n' +
          '          </div>\n' +
          '          <!-- ======================================================\n' +
          '         CONTACT DETAILS CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card contact-card">\n' +
          '            <h2>Contact Details</h2>\n' +
          '\n' +
          '            <div class="contact-links-box">\n' +
          '              <a href="tel:09569125625" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0956-912-5625</strong>\n' +
          '                  <small>Tap to call front desk</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a href="tel:09678170662" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0967-817-0662</strong>\n' +
          '                  <small>Alternative contact number</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="mailto:resortarvicseaside@gmail.com"\n' +
          '                class="contact-link-card email-contact-card"\n' +
          '              >\n' +
          '                <span class="contact-icon">✉</span>\n' +
          '                <span>\n' +
          '                  <strong>resortarvicseaside@gmail.com</strong>\n' +
          '                  <small>Email the resort for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="contact-note">\n' +
          '              Always open • Monday to Sunday • 24 hours\n' +
          '            </div>\n' +
          '          </div>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '         SOCIAL MEDIA CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card social-card">\n' +
          '            <h2>Social Media</h2>\n' +
          '\n' +
          '            <p>\n' +
          '              Follow or message the resort through its official social media\n' +
          '              pages for inquiries, updates, and announcements.\n' +
          '            </p>\n' +
          '\n' +
          '            <div class="social-links-box">\n' +
          '              <a\n' +
          '                href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"\n' +
          '                class="social-link-card facebook-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">f</span>\n' +
          '                <span>\n' +
          '                  <strong>Facebook Page</strong>\n' +
          '                  <small>Message us for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"\n' +
          '                class="social-link-card tiktok-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">♪</span>\n' +
          '                <span>\n' +
          '                  <strong>TikTok</strong>\n' +
          '                  <small>View resort clips and updates</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="social-note">\n' +
          '              Official social media links of Arvic Seaside Beach Resort and\n' +
          '              Hotel.\n' +
          '            </div>\n' +
          '          </div>\n' +
          '        </section>\n' +
          '      </section>\n' +
          '\n' +
          '      <section class="home-grid">\n' +
          '        <div class="home-card">\n' +
          '          <h2>Browse Accommodations</h2>\n' +
          '\n' +
          '          <p>\n' +
          '            Explore available rooms, cottages, and function areas with a cleaner\n' +
          '            card layout, pricing, capacity display, amenities, and booking-ready\n' +
          '            actions.\n' +
          '          </p>\n' +
          '\n' +
          '          <a href="rooms.html" class="btn-primary">Explore Accommodations</a>\n' +
          '        </div>\n' +
          '\n' +
          '        <div class="home-card">\n' +
          '          <h2>Track Your Reservation</h2>\n' +
          '\n' +
          '          <p>\n' +
          '            Check your current bookings, receipt details, payment method, and\n' +
          '            reservation status in one organized guest dashboard.\n' +
          '          </p>\n' +
          '\n' +
          '          <a href="my-bookings.html" class="btn-primary">Open My Bookings</a>\n' +
          '        </div>\n' +
          '\n' +
          '        <div class="home-card">\n' +
          '          <h2>Manage Your Account</h2>\n' +
          '\n' +
          '          <p>\n' +
          '            Review your saved guest information and update your password\n' +
          '            securely whenever needed from your personal profile page.\n' +
          '          </p>\n' +
          '\n' +
          '          <a href="profile.html" class="btn-primary">Go to Profile</a>\n' +
          '        </div>\n' +
          '      </section>\n' +
          '\n' +
          '      <section class="quick-strip">\n' +
          '        <div class="quick-item">\n' +
          '          <h3>Relaxing visual theme</h3>\n' +
          '\n' +
          '          <p>\n' +
          '            A more premium ocean-and-sand color palette for a proper seaside\n' +
          '            resort feel.\n' +
          '          </p>\n' +
          '        </div>\n' +
          '\n' +
          '        <div class="quick-item">\n' +
          '          <h3>Mobile-friendly layout</h3>\n' +
          '\n' +
          '          <p>\n' +
          '            Cleaner spacing and stronger cards so the customer pages still feel\n' +
          '            good on phones.\n' +
          '          </p>\n' +
          '        </div>\n' +
          '\n' +
          '        <div class="quick-item">\n' +
          '          <h3>AI booking support</h3>\n' +
          '\n' +
          '          <p>\n' +
          '            Ask fo'... 3180 more characters
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
        
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Arvic Seaside | Home</title>
        
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../customerCSS/index.css" />
            <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />
            <link rel="stylesheet" href="../sharedCSS/ai-voice.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261120-ui30" />
              <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
            <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->
            <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />
        </head>
        
          <body class="customer-manager-tone">
            <!-- ======================================================
               CUSTOMER NAVBAR
               Same Resort Map navbar style on all customer pages.
            ======================================================= -->
            <header class="navbar">
              <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->
              <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>
        
              <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>
        
              <nav id="mobileNav">
                <a href="index.html" class="active-nav">Home</a>
                <a href="rooms.html">Accommodations</a>
                <a href="resort-map.html">Resort Map</a>
                <a href="my-bookings.html">My Bookings</a>
                <a href="profile.html">Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               HERO SECTION
            ======================================================= -->
            <section class="hero-section">
              <div class="hero-inner">
                <div class="hero-badge">
                  Seaside comfort • Easy online booking • Smart assistant
                </div>
        
                <h1>Escape to a more relaxing resort stay.</h1>
        
                <p>
                  Explore beautiful accommodations, book your preferred schedule, and
                  manage your stay with a cleaner, smarter, and more premium guest
                  experience.
                </p>
        
                <div class="hero-actions">
                  <a href="rooms.html" class="btn-primary">Browse Accommodations</a>
                  <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
               MAIN HOME CONTENT
            ======================================================= -->
            <main class="home-wrapper">
              <section class="welcome-box">
                <h2>Your resort booking, made smoother</h2>
        
                <p>
                  Arvic Seaside helps you discover accommodations faster, compare stay
                  details clearly, and handle your reservations with less stress. From
                  accommodation selection to booking confirmation, the whole experience
                  feels more like a modern resort website.
                </p>
              </section>
        
              <!-- ======================================================
                 CLIENT INFORMATION SECTION
                 Added for mock defense and customer contact visibility.
              ======================================================= -->
              <section class="welcome-box">
                <h2>Arvic Seaside Beach Resort and Hotel</h2>
        
                <p>
                  Visit Arvic Seaside Beach Resort and Hotel at
                  <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong
                  >. The resort is open <strong>24 hours from Monday to Sunday</strong>.
                </p>
        
                <section class="home-grid" style="margin-top: 18px">
                  <div class="home-card location-map-card">
                    <iframe
                      class="location-map-bg"
                      src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
        
                    <div class="location-map-overlay"></div>
        
                    <div class="location-map-content">
                      <h2>Location</h2>
        
                      <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>
        
                      <a
                        href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                        class="btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Location
                      </a>
                    </div>
                  </div>
                  <!-- ======================================================
                 CONTACT DETAILS CARD
              ======================================================= -->
                  <div class="home-card contact-card">
                    <h2>Contact Details</h2>
        
                    <div class="contact-links-box">
                      <a href="tel:09569125625" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0956-912-5625</strong>
                          <small>Tap to call front desk</small>
                        </span>
                      </a>
        
                      <a href="tel:09678170662" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0967-817-0662</strong>
                          <small>Alternative contact number</small>
                        </span>
                      </a>
        
                      <a
                        href="mailto:resortarvicseaside@gmail.com"
                        class="contact-link-card email-contact-card"
                      >
                        <span class="contact-icon">✉</span>
                        <span>
                          <strong>resortarvicseaside@gmail.com</strong>
                          <small>Email the resort for inquiries</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="contact-note">
                      Always open • Monday to Sunday • 24 hours
                    </div>
                  </div>
        
                  <!-- ======================================================
                 SOCIAL MEDIA CARD
              ======================================================= -->
                  <div class="home-card social-card">
                    <h2>Social Media</h2>
        
                    <p>
                      Follow or message the resort through its official social media
                      pages for inquiries, updates, and announcements.
                    </p>
        
                    <div class="social-links-box">
                      <a
                        href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"
                        class="social-link-card facebook-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">f</span>
                        <span>
                          <strong>Facebook Page</strong>
                          <small>Message us for inquiries</small>
                        </span>
                      </a>
        
                      <a
                        href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"
                        class="social-link-card tiktok-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">♪</span>
                        <span>
                          <strong>TikTok</strong>
                          <small>View resort clips and updates</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="social-note">
                      Official social media links of Arvic Seaside Beach Resort and
                      Hotel.
                    </div>
                  </div>
                </section>
              </section>
        
              <section class="home-grid">
                <div class="home-card">
                  <h2>Browse Accommodations</h2>
        
                  <p>
                    Explore available rooms, cottages, and function areas with a cleaner
                    card layout, pricing, capacity display, amenities, and booking-ready
                    actions.
                  </p>
        
                  <a href="rooms.html" class="btn-primary">Explore Accommodations</a>
                </div>
        
                <div class="home-card">
                  <h2>Track Your Reservation</h2>
        
                  <p>
                    Check your current bookings, receipt details, payment method, and
                    reservation status in one organized guest dashboard.
                  </p>
        
                  <a href="my-bookings.html" class="btn-primary">Open My Bookings</a>
                </div>
        
                <div class="home-card">
                  <h2>Manage Your Account</h2>
        
                  <p>
                    Review your saved guest information and update your password
                    securely whenever needed from your personal profile page.
                  </p>
        
                  <a href="profile.html" class="btn-primary">Go to Profile</a>
                </div>
              </section>
        
              <section class="quick-strip">
                <div class="quick-item">
                  <h3>Relaxing visual theme</h3>
        
                  <p>
                    A more premium ocean-and-sand color palette for a proper seaside
                    resort feel.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>Mobile-friendly layout</h3>
        
                  <p>
                    Cleaner spacing and stronger cards so the customer pages still feel
                    good on phones.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>AI booking support</h3>
        
                  <p>
                    Ask for accommodation suggestions, dates, payment help, and start a
                    fresh new chat anytime.
                  </p>
                </div>
              </section>
            </main>
        
            <!-- ======================================================
               AI CHAT WIDGET
            ======================================================= -->
            <button id="aiChatToggle" class="ai-chat-toggle" type="button">Ask AI Assistant</button>
        
            <div id="aiChatWindow" class="ai-chat-window">
              <div class="ai-chat-header">
                <!-- UI-27: Branded concierge identity. Keep existing title and controls. -->
                <div class="ai-assistant-brand">
                  <span class="ai-assistant-mark" aria-hidden="true">✦</span>
                  <div class="ai-assistant-heading">
                    <h3>Arvic Seaside Resort AI Assistant</h3>
                    <span class="ai-assistant-caption">Your resort concierge · Here to help</span>
                  </div>
                </div>
        
                <div class="ai-chat-header-actions">
                  <button id="aiNewChatBtn" class="ai-chat-header-btn" title="New Chat" type="button">
                    New
                  </button>
        
                  <button
                    id="aiChatMaximize"
                    class="ai-chat-header-btn"
                    title="Maximize"
                   type="button">
                    ▢
                  </button>
        
                  <button id="aiChatClose" class="ai-chat-header-btn" title="Close" type="button">
                    &times;
                  </button>
                </div>
              </div>
        
              <div id="aiChatMessages" class="ai-chat-messages"></div>
        
              <div class="ai-chat-input-area">
                <input
                  type="text"
                  id="aiChatInput"
                  placeholder="Ask about rooms, cottages, dates, payment, or booking help..."
                />
        
                <button
                  id="aiMicBtn"
                  class="ai-chat-mic-btn"
                  title="Voice input"
                  aria-label="Voice input"
                 type="button">
                  🎤
                </button>
        
                <button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>
              </div>
            </div>
        
            <!-- ======================================================
               PAGE SCRIPTS
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js"></script>
            <script src="../customerJS/index.js"></script>
            <script src="../js/ai-chat.js?v=20261120-ui30"></script>
            <script src="../js/ai-voice.js?v=20261119-gemini-default-compact28"></script>
            <script src="../js/ai-chat-polish.js?v=20261120-ui30"></script>
            <script>
              const menuToggle = document.getElementById("menuToggle");
              const mobileNav = document.getElementById("mobileNav");
        
              if (menuToggle && mobileNav) {
                menuToggle.addEventListener("click", () => {
                  mobileNav.classList.toggle("show");
                  menuToggle.textContent = mobileNav.classList.contains("show")
                    ? "×"
                    : "☰";
                });
              }
            </script>
              <!-- Shared Customer scroll navigation: stays hidden down, reappears after slight up-scroll. -->
            <script src="../sharedJS/customer-scroll-nav.js?v=20261120-ui30"></script>
            <script src="../sharedJS/logout-confirm.js"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:443:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 120 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.147895
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 121 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.264644
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 122 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.346772
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 123 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.22581
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 124 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.149535
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 125 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.09314
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 126 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.276186
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 127 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.162274
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 128 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.004204
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 129 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.53154
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 130 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.779173
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 131 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.220492
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 132 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.505542
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 133 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.374384
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 134 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.317278
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 135 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.317292
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 136 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.459879
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 137 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 13.899934
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 138 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.433353
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 139 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.231489
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 140 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.241233
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 141 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.167612
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 142 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.128002
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 143 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.237328
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 144 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.415345
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 145 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.488966
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 146 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.102274
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 147 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.23209
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 148 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.278059
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 149 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 2.192211
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 150 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.399271
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 151 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.103105
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 152 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.122004
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 153 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.118198
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 154 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.15913
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 155 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.107903
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 156 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.622107
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 157 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.21261
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 158 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.215525
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 159 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.097186
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 160 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.501275
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 161 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.315676
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 162 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.213151
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 163 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.096516
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 164 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.081213
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 165 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.16582
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 166 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 0.987317
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 167 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 14.828182
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 168 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.815459
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 169 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.231559
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 170 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.196636
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 171 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.510609
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 172 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.166841
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 173 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.604661
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 174 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.258519
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 175 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.49773
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 176 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.596807
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 177 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.37869
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 178 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.131558
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 179 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.198325
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 180 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.279721
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 181 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.243567
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 182 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 20.08548
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 183 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.489377
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 184 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.343648
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 185 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.629508
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 186 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.316597
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 187 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.697202
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 188 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.83288
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 189 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.238449
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 190 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 2.400746
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 191 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 1.697857
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 192 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.290914
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 193 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.676899
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 194 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 3.271327
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 195 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 2.034123
      type: 'test'
