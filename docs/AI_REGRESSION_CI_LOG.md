# AI Mock Regression — testing branch

Source commit: db96d0bce65483af680fde451b2cace7d31440a6
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 137.365808
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 19.933217
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 19.297792
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 54.153525
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 15.244659
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.415372
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 12.311828
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 8 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 5.234525
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 9 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 3.849561
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 10 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 5.722927
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 11 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 15.729212
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 12 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 6.707513
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 13 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 11.986732
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 14 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 7.350282
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 15 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 13.111913
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 16 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 6.98971
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 17 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 6.590814
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 18 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.872355
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 19 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.383732
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 20 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 4.649834
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 21 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 10.155436
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 22 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.308162
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 23 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.251195
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 24 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.962909
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 25 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.547603
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 26 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.399126
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 27 - English translation route responds with the English text
      ---
      duration_ms: 2.152706
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 28 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.759425
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 29 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.500685
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 30 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.808108
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 31 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.621339
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 32 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.920639
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 33 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.524396
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 34 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.898538
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 35 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.098551
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 36 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.576286
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 37 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 3.256906
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 38 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.014665
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 39 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.816782
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 40 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 5.441702
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 41 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 3.817421
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 42 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.738819
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 43 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.329105
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 44 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.237985
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 45 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.472674
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 46 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 3.450477
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 47 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.887998
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 48 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.554635
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 49 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.028986
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 50 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.592887
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 51 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.199573
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 52 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.940085
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 53 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 3.546336
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 54 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 3.718327
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 55 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 4.520584
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 56 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.931995
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 57 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 2.188873
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 58 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 2.01516
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 59 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.62852
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 60 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.73367
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 61 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.790155
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 62 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.243427
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 63 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 5.599426
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 64 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.511676
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 65 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.156779
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 66 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.796176
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 67 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.779239
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 68 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.903972
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 69 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.080331
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 70 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.438198
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 71 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.089949
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 72 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.746488
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 73 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.907658
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 74 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.988349
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 75 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.067207
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 76 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 2.021422
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 77 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.255188
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 78 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 2.584823
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 79 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.185647
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 80 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.028003
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 81 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.057488
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 82 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.843009
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 83 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.743834
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 84 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.039946
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 85 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 2.007325
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 86 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 2.028795
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 87 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.431706
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 88 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 2.022854
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 89 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.09022
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 90 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.8573
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 91 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 5.863769
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 92 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.882362
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 93 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.486269
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 94 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.754069
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 95 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.281502
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 96 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.852577
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 97 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.972029
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 98 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.368934
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 99 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.312668
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 100 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.165714
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 101 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 1.037255
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 102 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 10.7956
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 103 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.908074
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 104 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.796753
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 105 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 2.761742
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 106 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 8.467676
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 107 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 44.988247
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 108 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.886654
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 109 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.507828
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 110 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.929144
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 111 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.426525
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 112 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.609868
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 113 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.441015
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 114 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.951215
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 115 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.509898
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 116 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.286371
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 117 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.350835
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 118 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.588378
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 119 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.400066
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 120 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.277438
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 121 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.179114
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 122 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.444109
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 123 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.323444
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 124 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 4.89398
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 125 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.85208
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 126 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.312028
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 127 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.367866
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 128 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.823376
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 129 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.610569
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 130 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.592746
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 131 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.678613
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 132 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.719443
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 133 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 25.854783
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 134 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.744139
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 135 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.410807
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 136 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.460119
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 137 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.378697
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 138 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 3.028169
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 139 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.732717
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 140 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.933923
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 141 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.193757
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 142 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.288167
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 143 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.639683
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 144 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.805513
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 145 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.92105
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 146 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.949451
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 147 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.296583
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 148 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.399755
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 149 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.409424
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 150 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.47668
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 151 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.298196
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 152 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.237844
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 153 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.423129
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 154 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 2.066215
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 155 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.318694
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 156 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.05096
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 157 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.811233
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 158 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.495313
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 159 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.288127
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 160 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.260987
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 161 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.421065
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 162 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.545278
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 163 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 13.248295
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 164 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.614562
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 165 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.371623
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 166 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.382433
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 167 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.922902
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 168 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.2845
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 169 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.108578
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 170 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.451833
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 171 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.815852
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 172 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 4.824971
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 173 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.598426
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 174 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.2517
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 175 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.930101
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 176 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.352348
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 177 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.417078
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 178 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 26.260482
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 179 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.406709
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 180 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.33767
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 181 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.647638
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 182 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.293167
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 183 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.604469
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 184 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.8761
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 185 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.267568
      type: 'test'
      ...
    1..185
    # tests 185
    # suites 0
    # pass 185
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2867.372994
