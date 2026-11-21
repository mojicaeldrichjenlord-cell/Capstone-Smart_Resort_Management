# AI Mock Regression — testing branch

Source commit: c1ad02396e12a216eca49cd8880fdb936b3345cd
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.168407
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.391703
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 41.623966
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.296799
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.503723
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 6 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 116.213189
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 7 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 26.682136
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 8 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 18.310735
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 9 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 70.908837
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 10 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 13.179979
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 11 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.533225
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 12 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 7.72467
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 13 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 20.998106
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 14 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 3.90004
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 15 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.497538
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 16 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 8.391778
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 17 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 16.715131
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 18 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 8.217894
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 19 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 10.484746
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 20 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 7.87443
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 21 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 15.808701
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 22 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 5.914892
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 23 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.667547
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 24 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 6.959457
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 25 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 2.454124
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 26 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 8.753696
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 27 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 9.805795
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 28 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.100143
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 29 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 4.635327
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 30 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 6.075603
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 31 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 3.863522
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 32 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 4.241821
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 33 - English translation route responds with the English text
      ---
      duration_ms: 5.563554
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 34 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 709.558547
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 35 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 703.519084
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 36 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.326906
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 37 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.602508
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 38 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.832885
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 39 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.733591
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 40 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.466127
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 41 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.87915
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 42 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.718789
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 43 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 3.543553
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 44 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 6.664315
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 45 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 9.593578
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 46 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.444686
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 47 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.332175
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 48 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.287803
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 49 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.000335
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 50 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.227854
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 51 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.49354
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 52 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.605012
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 53 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.596677
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 54 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.174174
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 55 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.821794
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 56 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.607897
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 57 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.77521
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 58 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.844851
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 59 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.825555
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 60 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.391261
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 61 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 3.12157
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 62 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.683244
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 63 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.763845
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 64 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.639413
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 65 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.186111
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 66 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.374429
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 67 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 4.826425
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 68 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.286102
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 69 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 3.042882
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 70 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.328313
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 71 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.280658
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 72 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.085048
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 73 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.471788
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 74 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.55854
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 75 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.921211
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 76 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.089566
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 77 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.925148
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 78 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.603925
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 79 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.828977
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 80 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 2.158174
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 81 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.498813
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 82 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.886245
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 83 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.4992
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 84 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.495983
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 85 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.818678
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 86 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.70221
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 87 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.764106
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 88 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.629785
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 89 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.53149
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 90 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.089576
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 91 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.833356
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 92 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.769496
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 93 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.15564
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 94 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 3.904517
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 95 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.653793
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 96 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.471681
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 97 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.643133
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 98 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 2.156241
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 99 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.287818
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 100 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.508048
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 101 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.013928
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 102 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.415373
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 103 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.334007
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 104 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.931503
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 105 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.918008
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 106 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.738432
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 107 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.671046
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 108 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 8.202303
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 109 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.51812
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 110 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.165794
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 111 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.89751
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 112 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 5.117793
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 113 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 20.363088
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 114 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.824634
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 115 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.455713
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 116 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 3.547651
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 117 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.458618
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 118 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.600264
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 119 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.511173
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 120 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.6034
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 121 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 3.700026
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 122 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 1.325652
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 123 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.58245
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 124 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.535342
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 125 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.205488
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 126 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.459612
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 127 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.395371
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 128 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.293118
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 129 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.219261
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 130 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.115686
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 131 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.301073
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 132 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.192059
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 133 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.297362
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 134 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.678971
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 135 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.949217
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 136 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.247373
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 137 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.585787
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 138 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.407583
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 139 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.38465
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 140 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.786841
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 141 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.524515
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 142 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 26.216565
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 143 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.686044
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 144 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.401682
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 145 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.350987
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 146 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.262642
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 147 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.268783
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 148 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.415498
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 149 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.621162
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 150 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.673381
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 151 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.177221
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 152 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.322433
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 153 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.523981
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 154 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 5.173263
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 155 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.948736
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 156 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.322885
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 157 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.346429
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 158 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.344004
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 159 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.342751
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 160 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.263013
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 161 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.183143
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 162 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.431768
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 163 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.912571
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 164 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.276858
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 165 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.983682
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 166 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.787404
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 167 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.477293
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 168 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.244928
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 169 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.234739
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 170 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.383788
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 171 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.129576
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 172 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 22.381666
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 173 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.21816
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 174 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.324648
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 175 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.328404
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 176 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.800849
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 177 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.237014
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 178 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.986176
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 179 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 2.903765
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 180 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 4.478182
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 181 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.666222
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 182 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.700431
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 183 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.230091
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 184 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 2.043926
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 185 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.348623
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 186 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.364221
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 187 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 24.960002
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 188 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.532276
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 189 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.543538
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 190 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.959236
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 191 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.425596
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 192 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 4.473885
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 193 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.725201
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 194 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.331912
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 195 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.05788
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 196 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.225101
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 197 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.529
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 198 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.667992
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 199 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.507893
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 200 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.729496
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 201 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.541634
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 202 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 1.129845
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 203 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.720809
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 204 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.674042
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 205 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 3.715585
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 206 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.58515
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 207 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.947235
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 208 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 1.133181
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 209 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 2.695887
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 210 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.829242
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 211 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.663634
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 212 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.636411
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 213 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.355075
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 214 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.52829
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 215 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.496501
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 216 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.556531
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 217 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.480169
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 218 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.305893
      type: 'test'
      ...
    1..218
    # tests 218
    # suites 0
    # pass 218
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2916.60241
