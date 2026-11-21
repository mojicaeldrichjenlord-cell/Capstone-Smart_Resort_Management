# AI Mock Regression — testing branch

Source commit: 7db1beacb79a08d7cf229356357b5d45232075b7
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.506875
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.500916
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 39.463735
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 3.777359
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.552007
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 126.520909
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 21.739766
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 15.555958
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 12.926356
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 7.2972
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 5.288185
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 68.676484
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 24.320217
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.408246
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 5.367707
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 20.953918
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 7.433121
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.932983
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 6.772911
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 13.502264
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 21 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 7.062376
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 22 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 11.851069
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 23 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 6.84132
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 24 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 21.420243
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 25 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 10.506371
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 26 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.543437
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 27 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.036075
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 28 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.667079
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 29 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 4.604439
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 30 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 14.086923
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 31 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.97769
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 32 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 4.3286
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 33 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 9.330604
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 34 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 6.607249
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 35 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 4.277371
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 36 - English translation route responds with the English text
      ---
      duration_ms: 2.638841
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 37 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 704.574468
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 38 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.488795
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 39 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 3.206998
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 40 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.744886
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 41 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.362432
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 42 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.546923
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 43 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 3.537162
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 44 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.772741
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 45 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 5.883019
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 46 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 4.341988
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 47 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.233349
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 48 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.68461
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 49 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.621478
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 50 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 3.178328
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 51 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 3.382152
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 52 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 3.003424
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 53 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.444841
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 54 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 5.27611
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 55 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.729595
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 56 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 3.586342
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 57 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 3.491025
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 58 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.284845
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 59 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.551438
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 60 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.944122
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 61 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.364339
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 62 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.839054
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 63 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.477234
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 64 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.947806
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 65 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.648106
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 66 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.697918
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 67 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.646749
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 68 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 7.622726
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 69 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 3.109896
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 70 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.707665
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 71 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.585642
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 72 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.190689
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 73 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.741997
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 74 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.095913
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 75 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.237193
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 76 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.581776
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 77 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.954179
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 78 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.92796
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 79 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.20852
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 80 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.088379
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 81 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.189643
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 82 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 2.07143
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 83 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.893253
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 84 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.824138
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 85 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.62735
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 86 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.893949
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 87 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.698337
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 88 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.037493
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 89 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.851595
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 90 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.910813
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 91 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.614619
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 92 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.495599
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 93 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.880545
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 94 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 4.408039
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 95 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 2.682329
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 96 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.277279
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 97 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.86492
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 98 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.943499
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 99 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.580173
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 100 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.2327
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 101 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.705149
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 102 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.442492
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 103 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.700753
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 104 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.38655
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 105 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.973765
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 106 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.594434
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 107 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.226187
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 108 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.105733
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 109 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.157139
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 110 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.953753
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 111 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 10.601106
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 112 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.851616
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 113 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.734741
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 114 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.182794
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 115 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 6.397263
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 116 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 26.447932
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 117 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.968522
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 118 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.497332
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 119 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.955432
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 120 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.461416
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 121 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.620463
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 122 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.932715
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 123 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.812616
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 124 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 4.991854
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 125 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 2.203298
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 126 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.780041
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 127 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.660078
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 128 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.252139
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 129 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.425308
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 130 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.651353
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 131 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.411794
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 132 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.229055
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 133 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.159833
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 134 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.430041
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 135 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.287175
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 136 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 4.988418
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 137 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.866328
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 138 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.35209
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 139 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.370171
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 140 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.820262
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 141 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.577029
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 142 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.573112
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 143 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.779082
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 144 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 4.592587
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 145 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 18.59807
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 146 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.696645
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 147 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.345634
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 148 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.338043
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 149 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.303675
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 150 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.271377
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 151 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.553298
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 152 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.81063
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 153 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.056274
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 154 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.222401
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 155 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.446577
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 156 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.641245
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 157 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.649023
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 158 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.998583
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 159 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.284683
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 160 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.322829
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 161 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.316961
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 162 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.38753
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 163 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.266495
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 164 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.173714
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 165 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.932717
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 166 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.561124
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 167 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.250885
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 168 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.964261
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 169 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.735326
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 170 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.44549
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 171 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.197579
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 172 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.181282
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 173 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.347836
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 174 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.136197
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 175 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 10.728705
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 176 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.147082
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 177 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.369396
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 178 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.272017
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 179 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 2.826851
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 180 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.230399
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 181 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.954559
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 182 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.40823
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 183 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 4.182531
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 184 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 1.987883
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 185 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.420735
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 186 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.140292
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 187 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 19.704718
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 188 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.498547
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 189 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 8.075883
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 190 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.996182
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 191 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.856829
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 192 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 1.062108
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 193 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.134622
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 194 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.214375
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 195 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.236168
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 196 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 14.241928
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 197 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.414918
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 198 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.385107
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 199 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.794683
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 200 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.298035
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 201 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.622027
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 202 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.26083
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 203 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.254904
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 204 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.391328
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 205 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.284057
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 206 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.651606
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 207 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.561581
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 208 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.629382
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 209 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.934103
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 210 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.615381
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 211 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 3.979293
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 212 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.779392
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 213 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.58026
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 214 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 3.67529
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 215 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.770118
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 216 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 4.611779
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 217 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 1.162994
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 218 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 6.108587
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 219 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.900337
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 220 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.4095
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 221 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.639005
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 222 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.489301
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 223 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 2.147941
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 224 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.932355
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 225 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.385755
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 226 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.298827
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 227 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.192073
      type: 'test'
      ...
    1..227
    # tests 227
    # suites 0
    # pass 227
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2949.198017
