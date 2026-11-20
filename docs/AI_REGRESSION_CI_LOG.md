# AI Mock Regression — testing branch

Source commit: c60beed9f51db8222534a2986f0ea49cfa07b2d7
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 97.225066
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 19.569094
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 14.071205
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 74.622273
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 13.236257
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 6.074963
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 8.161503
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 8 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 22.788763
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 9 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 3.852397
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 10 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.372084
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 11 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.607172
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 12 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 15.039114
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 13 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 8.445958
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 14 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 10.910708
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 15 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 8.454022
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 16 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 16.715484
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 17 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 5.873894
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 18 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 3.867496
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 19 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.803055
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 20 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.404008
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 21 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.162942
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 22 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 6.501214
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 23 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.177531
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 24 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 2.937338
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 25 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.64622
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 26 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.010327
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 27 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.345687
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 28 - English translation route responds with the English text
      ---
      duration_ms: 2.090407
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 29 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.233884
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 30 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 703.095464
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 31 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.019494
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 32 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.559321
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 33 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.755225
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 34 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.65198
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 35 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.483175
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 36 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.731482
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 37 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.082302
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 38 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.613
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 39 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 7.529065
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 40 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.965016
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 41 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.287597
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 42 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.27239
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 43 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.332702
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 44 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.251119
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 45 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.57157
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 46 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.964858
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 47 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.548177
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 48 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.584214
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 49 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.699732
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 50 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.968447
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 51 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 3.451494
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 52 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.530263
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 53 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.194292
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 54 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.465682
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 55 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.61383
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 56 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.401261
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 57 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.864713
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 58 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.854745
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 59 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.66053
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 60 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.241129
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 61 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.404196
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 62 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 5.151728
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 63 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.521947
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 64 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 3.021737
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 65 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.363781
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 66 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.493663
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 67 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.126776
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 68 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.456627
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 69 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.606949
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 70 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.785044
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 71 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.135282
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 72 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.950083
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 73 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.462537
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 74 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.584157
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 75 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.561874
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 76 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.855346
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 77 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.513012
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 78 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.575861
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 79 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.475112
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 80 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.824268
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 81 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.724691
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 82 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.781296
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 83 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.562766
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 84 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.51683
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 85 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.968328
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 86 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.742834
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 87 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.728237
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 88 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.129681
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 89 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 4.575766
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 90 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.984148
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 91 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.155629
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 92 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.982454
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 93 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.626665
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 94 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.142695
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 95 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.454199
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 96 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.993794
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 97 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.208249
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 98 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.343714
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 99 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.880384
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 100 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.93179
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 101 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.742284
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 102 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.62261
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 103 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 8.874162
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 104 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.559411
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 105 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.067745
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 106 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.068448
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 107 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.760194
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 108 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 36.536321
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 109 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.999388
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 110 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.527381
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 111 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.934836
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 112 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.418536
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 113 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.533582
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 114 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.182388
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 115 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.9153
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 116 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.052472
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 117 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 1.580669
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 118 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.877478
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 119 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.714753
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 120 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.386723
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 121 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.35263
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 122 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.548851
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 123 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.439435
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 124 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.256242
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 125 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.165091
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 126 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.474972
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 127 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.273333
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 128 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 5.047042
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 129 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.807658
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 130 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.345107
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 131 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.337043
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 132 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.814902
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 133 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.597602
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 134 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.519907
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 135 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.051953
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 136 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.188712
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 137 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 20.9295
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 138 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.608733
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 139 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.392637
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 140 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.321844
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 141 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.333456
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 142 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.262564
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 143 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.580811
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 144 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.795875
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 145 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.981083
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 146 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.242526
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 147 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.514096
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 148 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.7713
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 149 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.31608
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 150 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.595499
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 151 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.193624
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 152 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.238909
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 153 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.232026
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 154 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.247975
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 155 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.283863
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 156 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.164849
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 157 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.170149
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 158 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.39416
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 159 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.183385
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 160 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.7078
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 161 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.497805
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 162 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.337985
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 163 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.166714
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 164 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.156554
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 165 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.293882
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 166 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.492705
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 167 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 10.465662
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 168 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.201397
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 169 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.337294
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 170 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.284084
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 171 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.745401
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 172 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.247044
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 173 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 6.694987
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 174 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.397887
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 175 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 6.779237
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 176 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 4.139146
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 177 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 1.552067
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 178 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.185398
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 179 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.649149
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 180 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.346451
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 181 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.351049
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 182 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 26.213006
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 183 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.530817
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 184 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.72406
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 185 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.871167
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 186 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.392808
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 187 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.92849
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 188 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.963417
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 189 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.358284
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 190 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 9.12341
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 191 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 5.686794
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 192 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 3.327512
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 193 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.945286
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 194 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 2.958607
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 195 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 1.628139
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 196 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 4.338721
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 197 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.755068
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 198 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.599997
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 199 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 2.551172
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 200 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.726633
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 201 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.679927
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 202 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.535185
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 203 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.316525
      type: 'test'
      ...
    1..203
    # tests 203
    # suites 0
    # pass 203
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2852.607997
