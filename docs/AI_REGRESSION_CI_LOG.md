# AI Mock Regression — testing branch

Source commit: a06c68bd0213315fecaeab18345bf9ec4947782f
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 146.140757
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 17.771796
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 13.360992
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 81.480041
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 11.8067
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 3.432508
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 15.939674
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 8 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 15.043047
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 9 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 3.584123
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 10 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 3.690714
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 11 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 6.284997
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 12 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 11.193398
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 13 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 6.011533
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 14 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 7.637608
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 15 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 5.720827
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 16 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 13.772222
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 17 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 8.252984
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 18 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.241488
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 19 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.216782
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 20 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.290866
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 21 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.43343
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 22 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 7.283373
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 23 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.684382
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 24 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.351445
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 25 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.111003
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 26 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.45384
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 27 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.368138
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 28 - English translation route responds with the English text
      ---
      duration_ms: 2.176269
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 29 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.149109
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 30 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.757245
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 31 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.290223
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 32 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.599517
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 33 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.833681
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 34 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.984944
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 35 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.874841
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 36 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.797926
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 37 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.372016
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 38 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.621365
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 39 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.725817
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 40 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 8.608735
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 41 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.753763
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 42 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.683752
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 43 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.679745
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 44 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.412532
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 45 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.616942
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 46 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.841124
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 47 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.874279
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 48 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.771757
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 49 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.43798
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 50 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.17707
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 51 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 3.046203
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 52 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.868369
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 53 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.953158
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 54 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 3.264263
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 55 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 3.494355
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 56 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 3.224468
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 57 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.792147
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 58 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.922832
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 59 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.707859
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 60 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.39058
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 61 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.489046
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 62 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 4.937876
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 63 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.509702
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 64 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 3.574034
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 65 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.445444
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 66 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.372926
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 67 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.436618
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 68 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.622097
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 69 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.677311
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 70 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.902915
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 71 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.189593
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 72 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.146632
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 73 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.529824
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 74 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.470111
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 75 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.613781
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 76 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.44307
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 77 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 2.243614
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 78 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.016579
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 79 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.590358
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 80 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.008653
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 81 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.79384
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 82 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.881956
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 83 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.644369
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 84 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.572965
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 85 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.07607
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 86 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.81506
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 87 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.845457
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 88 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.230289
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 89 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 4.205581
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 90 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.843252
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 91 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.583794
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 92 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.052215
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 93 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.829697
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 94 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.956363
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 95 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 5.591384
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 96 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.403404
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 97 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.831649
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 98 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.955674
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 99 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.411793
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 100 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.424816
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 101 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.084467
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 102 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.998386
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 103 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 10.806831
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 104 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.777851
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 105 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.234728
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 106 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.941338
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 107 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 6.202682
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 108 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 37.45994
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 109 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.895412
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 110 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.51079
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 111 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.845508
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 112 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.386676
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 113 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.526559
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 114 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.797695
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 115 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.803118
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 116 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 4.997157
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 117 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.682137
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 118 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.913354
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 119 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.579238
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 120 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.40955
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 121 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.294974
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 122 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.184827
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 123 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.455997
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 124 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.291207
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 125 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 6.849898
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 126 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.939245
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 127 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.377978
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 128 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.359596
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 129 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.843274
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 130 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.652426
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 131 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.589968
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 132 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 9.722033
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 133 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.554479
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 134 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 25.753501
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 135 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.636767
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 136 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.396986
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 137 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.379533
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 138 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.360227
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 139 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.289264
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 140 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 1.334377
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 141 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.828626
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 142 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.034704
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 143 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.251332
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 144 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.566935
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 145 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.778212
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 146 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 5.468874
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 147 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.752985
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 148 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.2453
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 149 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.231876
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 150 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.234931
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 151 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.285125
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 152 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.324069
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 153 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.204735
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 154 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.437863
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 155 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 4.342728
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 156 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.29834
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 157 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.036127
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 158 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.705024
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 159 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.432192
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 160 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.215615
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 161 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.203753
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 162 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.387278
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 163 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.19832
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 164 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 11.349171
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 165 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.253244
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 166 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.321454
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 167 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.355508
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 168 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.787109
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 169 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.252164
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 170 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.988087
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 171 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.373241
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 172 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.837704
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 173 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 4.329634
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 174 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.512974
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 175 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.224652
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 176 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.878279
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 177 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.348965
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 178 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.337664
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 179 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 24.063235
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 180 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.625585
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 181 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.501031
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 182 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.906694
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 183 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.445006
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 184 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.977572
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 185 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.77861
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 186 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.57522
      type: 'test'
      ...
    1..186
    # tests 186
    # suites 0
    # pass 186
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2885.710533
