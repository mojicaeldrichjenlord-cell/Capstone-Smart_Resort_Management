# AI Mock Regression — testing branch

Source commit: 2bc5427607500700e3873324aae29d36990e9c62
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 128.93759
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 22.76375
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 19.452826
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 4 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 48.361809
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 5 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 17.418462
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 6 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.454162
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 7 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 23.998962
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 8 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 24.290984
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 9 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 2.885574
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 10 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.132768
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 11 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 6.496602
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 12 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 13.469399
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 13 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 7.207208
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 14 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 10.73526
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 15 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 8.135383
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 16 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 21.126242
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 17 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 8.4267
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 18 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.535626
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 19 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.120776
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 20 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.708081
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 21 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 4.951067
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 22 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 7.20334
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 23 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.533983
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 24 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.883901
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 25 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.311826
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 26 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.490351
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 27 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.96286
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 28 - English translation route responds with the English text
      ---
      duration_ms: 2.600649
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 29 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.432453
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 30 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.944499
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 31 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.644233
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 32 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.612102
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 33 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.432483
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 34 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.072361
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 35 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.85661
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 36 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.128517
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 37 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.470563
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 38 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.942072
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 39 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 7.661372
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 40 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 7.369766
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 41 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.749034
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 42 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.758513
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 43 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.638371
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 44 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.701248
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 45 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.705489
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 46 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.603332
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 47 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.869604
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 48 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 3.246362
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 49 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 3.308096
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 50 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.262022
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 51 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 3.10168
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 52 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.650562
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 53 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.85215
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 54 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.893589
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 55 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 3.011521
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 56 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.768113
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 57 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.993878
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 58 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 2.052779
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 59 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.969121
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 60 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.694364
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 61 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.836992
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 62 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 6.040063
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 63 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.072124
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 64 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.72253
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 65 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.072355
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 66 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.172523
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 67 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.424637
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 68 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.748357
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 69 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.891936
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 70 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.088345
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 71 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.444966
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 72 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.301716
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 73 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.784875
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 74 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.708772
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 75 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.881356
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 76 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.145793
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 77 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.817416
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 78 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.859255
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 79 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.72892
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 80 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.234851
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 81 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.294954
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 82 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.105347
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 83 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.883861
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 84 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.814761
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 85 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.316845
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 86 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 2.06446
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 87 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 2.002274
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 88 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.48969
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 89 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 5.72966
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 90 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.280226
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 91 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.869984
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 92 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.341
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 93 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.928816
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 94 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.60691
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 95 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.951778
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 96 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.549071
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 97 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.239028
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 98 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.498146
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 99 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.942351
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 100 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.927373
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 101 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.738188
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 102 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.681401
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 103 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 11.870634
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 104 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.839137
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 105 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.0964
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 106 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 2.012272
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 107 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 7.677602
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 108 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 48.620971
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 109 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.890264
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 110 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.531419
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 111 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.924989
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 112 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.427473
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 113 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.653488
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 114 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.906543
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 115 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.885916
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 116 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.919057
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 117 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.683795
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 118 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.658197
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 119 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.631538
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 120 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.311474
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 121 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.938463
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 122 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.396906
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 123 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.277942
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 124 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.186601
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 125 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.114606
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 126 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.304722
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 127 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.252074
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 128 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.398007
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 129 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.610367
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 130 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.852092
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 131 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.23945
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 132 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.583056
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 133 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.392288
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 134 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.374244
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 135 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.038541
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 136 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.353804
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 137 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 26.032204
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 138 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.684597
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 139 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.390915
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 140 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.360768
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 141 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.370686
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 142 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.28197
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 143 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.631457
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 144 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.851982
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 145 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.938014
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 146 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.222708
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 147 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.510419
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 148 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.796608
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 149 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 5.351079
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 150 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.894972
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 151 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.296557
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 152 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.347704
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 153 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.421151
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 154 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.364264
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 155 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.295996
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 156 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.210065
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 157 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 2.029606
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 158 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.590029
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 159 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.255861
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 160 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.033072
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 161 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.839017
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 162 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.849928
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 163 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.250921
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 164 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.246143
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 165 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.434978
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 166 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 5.232165
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 167 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 18.045662
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 168 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 4.31981
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 169 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.350128
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 170 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.338927
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 171 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.889753
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 172 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.310513
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 173 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 4.06962
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 174 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.392397
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 175 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 5.354335
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 176 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 5.546597
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 177 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.571735
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 178 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.222889
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 179 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.685549
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 180 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.338868
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 181 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.357933
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 182 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 23.979797
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 183 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.541448
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 184 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.432713
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 185 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.882719
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 186 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.400793
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 187 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.902365
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 188 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.448262
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 189 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.335951
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 190 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.825742
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 191 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 1.037199
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 192 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.737837
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 193 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 1.347062
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 194 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.818017
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    not ok 195 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 5.621507
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/customer-landing-receipt-ui32.test.js:98:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /successfully captured downpayment/i. Input:
        
        '<!doctype html>\n' +
          '<html lang="en">\n' +
          '  <head>\n' +
          '    <meta charset="UTF-8" />\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       RESPONSIVE VIEWPORT\n' +
          '    ======================================================= -->\n' +
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '\n' +
          '    <title>Reservation Payment | Arvic Seaside</title>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       PAGE CSS FILES\n' +
          '    ======================================================= -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/global.css" />\n' +
          '    <link rel="stylesheet" href="../css/style.css" />\n' +
          '    <link rel="stylesheet" href="../customerCSS/booking-payment.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />\n' +
          '    <!-- Stage Payment-18: presentation-only coastal minimalist overrides. -->\n' +
          '    <link rel="stylesheet" href="../customerCSS/booking-payment-minimal.css?v=20261117-payment18" />\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       QR MODAL CSS\n' +
          '       Kept here so you can copy-paste this HTML without touching CSS first.\n' +
          '    ======================================================= -->\n' +
          '    <style>\n' +
          '      .paypal-payment-section {\n' +
          '        margin-top: 18px;\n' +
          '        padding: 18px;\n' +
          '        border: 1px solid #cbd5e1;\n' +
          '        border-radius: 18px;\n' +
          '        background: #ffffff;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-payment-header {\n' +
          '        display: flex;\n' +
          '        align-items: flex-start;\n' +
          '        justify-content: space-between;\n' +
          '        gap: 16px;\n' +
          '        margin-bottom: 10px;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-payment-header h3 {\n' +
          '        margin: 2px 0 0;\n' +
          '        color: #0f172a;\n' +
          '        font-size: 1.15rem;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-kicker {\n' +
          '        margin: 0;\n' +
          '        color: #0f766e;\n' +
          '        font-size: 0.76rem;\n' +
          '        font-weight: 900;\n' +
          '        letter-spacing: 0.12em;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-sandbox-badge {\n' +
          '        display: inline-flex;\n' +
          '        align-items: center;\n' +
          '        min-height: 30px;\n' +
          '        padding: 5px 10px;\n' +
          '        border-radius: 999px;\n' +
          '        background: #eff6ff;\n' +
          '        color: #1d4ed8;\n' +
          '        font-size: 0.78rem;\n' +
          '        font-weight: 800;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-payment-copy,\n' +
          '      .paypal-payment-help {\n' +
          '        margin: 0;\n' +
          '        color: #475569;\n' +
          '        line-height: 1.55;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-amount-row {\n' +
          '        display: flex;\n' +
          '        justify-content: space-between;\n' +
          '        gap: 16px;\n' +
          '        margin: 16px 0;\n' +
          '        padding: 14px 16px;\n' +
          '        border-radius: 14px;\n' +
          '        background: #f8fafc;\n' +
          '        color: #0f172a;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-amount-row strong {\n' +
          '        color: #0f766e;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-sdk-status {\n' +
          '        margin: 12px 0;\n' +
          '        padding: 11px 13px;\n' +
          '        border-radius: 12px;\n' +
          '        background: #f8fafc;\n' +
          '        color: #475569;\n' +
          '        font-size: 0.9rem;\n' +
          '        line-height: 1.45;\n' +
          '      }\n' +
          '\n' +
          '      .paypal-payment-help {\n' +
          '        margin-top: 12px;\n' +
          '        font-size: 0.88rem;\n' +
          '      }\n' +
          '\n' +
          '      #paypalButton {\n' +
          '        display: block;\n' +
          '        width: 100%;\n' +
          '        min-height: 44px;\n' +
          '      }\n' +
          '\n' +
          '      @media (max-width: 768px) {\n' +
          '        .payment-grid {\n' +
          '          grid-template-columns: 1fr;\n' +
          '        }\n' +
          '\n' +
          '        }\n' +
          '    </style>\n' +
          '      <!-- Consistent, centered confirmation for accidental logout clicks. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />\n' +
          '    <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />\n' +
          '</head>\n' +
          '\n' +
          '  <body class="customer-payment-page customer-manager-tone">\n' +
          '    <!-- ======================================================\n' +
          '       CUSTOMER NAVBAR\n' +
          '    ======================================================= -->\n' +
          '    <header class="navbar">\n' +
          '      <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->\n' +
          '      <a class="logo confirm-transaction-exit" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>\n' +
          '\n' +
          '      <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>\n' +
          '\n' +
          '      <nav id="mobileNav">\n' +
          '        <a href="index.html" class="confirm-transaction-exit">Home</a>\n' +
          '        <a href="rooms.html" class="active-nav confirm-transaction-exit">\n' +
          '          Accommodations\n' +
          '        </a>\n' +
          '        <a href="resort-map.html" class="confirm-transaction-exit">\n' +
          '          Resort Map\n' +
          '        </a>\n' +
          '        <a href="my-bookings.html" class="confirm-transaction-exit">\n' +
          '          My Bookings\n' +
          '        </a>\n' +
          '        <a href="profile.html" class="confirm-transaction-exit">Profile</a>\n' +
          '        <a href="#" id="logoutBtn">Logout</a>\n' +
          '      </nav>\n' +
          '    </header>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       MAIN PAYMENT PAGE\n' +
          '    ======================================================= -->\n' +
          '    <main class="payment-page-wrapper">\n' +
          '      <div class="payment-top-actions">\n' +
          '        <a href="booking.html" class="back-btn confirm-transaction-exit">\n' +
          '          ← Back to Reservation Form\n' +
          '        </a>\n' +
          '      </div>\n' +
          '\n' +
          '      <div class="payment-card">\n' +
          '        <div class="payment-title-block">\n' +
          '          <p class="payment-step-label">SECURE RESERVATION CHECKOUT</p>\n' +
          '          <h1>Review and pay</h1>\n' +
          '\n' +
          '          <p id="paymentPageIntro">\n' +
          '            Review your reservation and complete the required 50% accommodation\n' +
          '            downpayment through PayPal.\n' +
          '          </p>\n' +
          '        </div>\n' +
          '\n' +
          '        <div class="payment-grid">\n' +
          '            <!-- ======================================================\n' +
          '               RESERVATION SUMMARY\n' +
          '            ======================================================= -->\n' +
          '            <section class="section-box payment-reservation">\n' +
          '              <h2>Reservation Summary</h2>\n' +
          '              <div id="reservationSummaryList" class="summary-list"></div>\n' +
          '            </section>\n' +
          '\n' +
          '            <!-- ======================================================\n' +
          '               PAYPAL-ONLY CUSTOMER PAYMENT\n' +
          '            ======================================================= -->\n' +
          '            <section class="section-box payment-checkout">\n' +
          '              <h2>Pay with PayPal</h2>\n' +
          '\n' +
          '              <!--\n' +
          '                Customer online bookings use PayPal only.\n' +
          '                This hidden field keeps the payment script explicit while\n' +
          '                removing the old GCash/Maya customer choices from the UI.\n' +
          '              -->\n' +
          '              <select id="paymentMethod" hidden aria-hidden="true">\n' +
          '                <option value="paypal" selected>PayPal</option>\n' +
          '              </select>\n' +
          '\n' +
          '              <div class="payment-form-wrapper">\n' +
          '                <div class="payment-form-grid">\n' +
          '                  <div class="payment-form-group full-width">\n' +
          '                    <label for="paymentReminderNote">\n' +
          '                      Optional Payment Note\n' +
          '                    </label>\n' +
          '\n' +
          '                    <textarea\n' +
          '                      id="paymentReminderNote"\n' +
          '                      placeholder="Example: Special payment note or reservation concern"\n' +
          '                    ></textarea>\n' +
          '                  </div>\n' +
          '                </div>\n' +
          '              </div>\n' +
          '\n' +
          '              <div\n' +
          '                id="paypalPaymentSection"\n' +
          '                class="paypal-payment-section"\n' +
          '              >\n' +
          '                <div class="paypal-payment-header">\n' +
          '                  <div>\n' +
          '                    <p class="paypal-kicker">SECURE ONLINE PAYMENT</p>\n' +
          '                    <h3>Complete your downpayment</h3>\n' +
          '                  </div>\n' +
          '\n' +
          '                  <span class="paypal-sandbox-badge">PayPal</span>\n' +
          '                </div>\n' +
          '\n' +
          '                <p class="paypal-payment-copy">\n' +
          '                  PayPal will collect only the required 50% accommodation\n' +
          '                  downpayment. Entrance fees, the remaining accommodation\n' +
          '                  balance, and onsite charges are not included in this payment.\n' +
          '                </p>\n' +
          '\n' +
          '                <div class="paypal-amount-row">\n' +
          '                  <span>Amount to pay now</span>\n' +
          '                  <strong id="paypalDownpaymentAmount">₱0.00</strong>\n' +
          '                </div>\n' +
          '\n' +
          '                <div id="paypalSdkStatus" class="paypal-sdk-status">\n' +
          '                  Preparing PayPal...\n' +
          '                </div>\n' +
          '\n' +
          '                <paypal-button\n' +
          '                  id="paypalButton"\n' +
          '                  type="pay"\n' +
          '                  hidden\n' +
          '                ></paypal-button>\n' +
          '\n' +
          '                <p class="paypal-payment-help">\n' +
          '                  After PayPal confirms the payment, the system automatically\n' +
          '                  records the downpayment and confirms the reservation. No GCash\n' +
          '                  or Maya reference number, QR payment, or proof screenshot is\n' +
          '                  required for customer online bookings.\n' +
          '                </p>\n' +
          '              </div>\n' +
          '\n' +
          '              <p id="paymentMessage" class="message"></p>\n' +
          '            </section>\n' +
          '\n' +
          '            <!-- ======================================================\n' +
          '               PAYMENT BREAKDOWN\n' +
          '            ======================================================= -->\n' +
          '            <section class="section-box payment-totals">\n' +
          '              <h2>Payment Breakdown</h2>\n' +
          '\n' +
          '              <div class="payment-breakdown">\n' +
          '                <div class="payment-row">\n' +
          '                  <span>Accommodation Total</span>\n' +
          '                  <strong id="paymentAccommodationTotal">₱0.00</strong>\n' +
          '                </div>\n' +
          '\n' +
          '                <div class="payment-row">\n' +
          '                  <span>Downpayment due now (50%)</span>\n' +
          '                  <strong id="paymentDownpayment">₱0.00</strong>\n' +
          '                </div>\n' +
          '\n' +
          '                <div class="payment-row">\n' +
          '                  <span>Remaining balance at resort</span>\n' +
          '                  <strong id="paymentRemaining">₱0.00</strong>\n' +
          '                </div>\n' +
          '\n' +
          '                <div class="payment-row">\n' +
          '                  <span>Estimated entrance fee (onsite)</span>\n' +
          '                  <strong id="paymentEntranceFee">₱0.00</strong>\n' +
          '                </div>\n' +
          '\n' +
          '                <div class="payment-row">\n' +
          '                  <span>Estimated total due at resort</span>\n' +
          '                  <strong id="paymentFrontDeskReminder">₱0.00</strong>\n' +
          '                </div>\n' +
          '             '... 6811 more characters
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
        
            <!-- ======================================================
               RESPONSIVE VIEWPORT
            ======================================================= -->
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Reservation Payment | Arvic Seaside</title>
        
            <!-- ======================================================
               PAGE CSS FILES
            ======================================================= -->
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../customerCSS/booking-payment.css" />
            <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />
            <!-- Stage Payment-18: presentation-only coastal minimalist overrides. -->
            <link rel="stylesheet" href="../customerCSS/booking-payment-minimal.css?v=20261117-payment18" />
        
            <!-- ======================================================
               QR MODAL CSS
               Kept here so you can copy-paste this HTML without touching CSS first.
            ======================================================= -->
            <style>
              .paypal-payment-section {
                margin-top: 18px;
                padding: 18px;
                border: 1px solid #cbd5e1;
                border-radius: 18px;
                background: #ffffff;
              }
        
              .paypal-payment-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 16px;
                margin-bottom: 10px;
              }
        
              .paypal-payment-header h3 {
                margin: 2px 0 0;
                color: #0f172a;
                font-size: 1.15rem;
              }
        
              .paypal-kicker {
                margin: 0;
                color: #0f766e;
                font-size: 0.76rem;
                font-weight: 900;
                letter-spacing: 0.12em;
              }
        
              .paypal-sandbox-badge {
                display: inline-flex;
                align-items: center;
                min-height: 30px;
                padding: 5px 10px;
                border-radius: 999px;
                background: #eff6ff;
                color: #1d4ed8;
                font-size: 0.78rem;
                font-weight: 800;
              }
        
              .paypal-payment-copy,
              .paypal-payment-help {
                margin: 0;
                color: #475569;
                line-height: 1.55;
              }
        
              .paypal-amount-row {
                display: flex;
                justify-content: space-between;
                gap: 16px;
                margin: 16px 0;
                padding: 14px 16px;
                border-radius: 14px;
                background: #f8fafc;
                color: #0f172a;
              }
        
              .paypal-amount-row strong {
                color: #0f766e;
              }
        
              .paypal-sdk-status {
                margin: 12px 0;
                padding: 11px 13px;
                border-radius: 12px;
                background: #f8fafc;
                color: #475569;
                font-size: 0.9rem;
                line-height: 1.45;
              }
        
              .paypal-payment-help {
                margin-top: 12px;
                font-size: 0.88rem;
              }
        
              #paypalButton {
                display: block;
                width: 100%;
                min-height: 44px;
              }
        
              @media (max-width: 768px) {
                .payment-grid {
                  grid-template-columns: 1fr;
                }
        
                }
            </style>
              <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
        </head>
        
          <body class="customer-payment-page customer-manager-tone">
            <!-- ======================================================
               CUSTOMER NAVBAR
            ======================================================= -->
            <header class="navbar">
              <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->
              <a class="logo confirm-transaction-exit" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>
        
              <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>
        
              <nav id="mobileNav">
                <a href="index.html" class="confirm-transaction-exit">Home</a>
                <a href="rooms.html" class="active-nav confirm-transaction-exit">
                  Accommodations
                </a>
                <a href="resort-map.html" class="confirm-transaction-exit">
                  Resort Map
                </a>
                <a href="my-bookings.html" class="confirm-transaction-exit">
                  My Bookings
                </a>
                <a href="profile.html" class="confirm-transaction-exit">Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               MAIN PAYMENT PAGE
            ======================================================= -->
            <main class="payment-page-wrapper">
              <div class="payment-top-actions">
                <a href="booking.html" class="back-btn confirm-transaction-exit">
                  ← Back to Reservation Form
                </a>
              </div>
        
              <div class="payment-card">
                <div class="payment-title-block">
                  <p class="payment-step-label">SECURE RESERVATION CHECKOUT</p>
                  <h1>Review and pay</h1>
        
                  <p id="paymentPageIntro">
                    Review your reservation and complete the required 50% accommodation
                    downpayment through PayPal.
                  </p>
                </div>
        
                <div class="payment-grid">
                    <!-- ======================================================
                       RESERVATION SUMMARY
                    ======================================================= -->
                    <section class="section-box payment-reservation">
                      <h2>Reservation Summary</h2>
                      <div id="reservationSummaryList" class="summary-list"></div>
                    </section>
        
                    <!-- ======================================================
                       PAYPAL-ONLY CUSTOMER PAYMENT
                    ======================================================= -->
                    <section class="section-box payment-checkout">
                      <h2>Pay with PayPal</h2>
        
                      <!--
                        Customer online bookings use PayPal only.
                        This hidden field keeps the payment script explicit while
                        removing the old GCash/Maya customer choices from the UI.
                      -->
                      <select id="paymentMethod" hidden aria-hidden="true">
                        <option value="paypal" selected>PayPal</option>
                      </select>
        
                      <div class="payment-form-wrapper">
                        <div class="payment-form-grid">
                          <div class="payment-form-group full-width">
                            <label for="paymentReminderNote">
                              Optional Payment Note
                            </label>
        
                            <textarea
                              id="paymentReminderNote"
                              placeholder="Example: Special payment note or reservation concern"
                            ></textarea>
                          </div>
                        </div>
                      </div>
        
                      <div
                        id="paypalPaymentSection"
                        class="paypal-payment-section"
                      >
                        <div class="paypal-payment-header">
                          <div>
                            <p class="paypal-kicker">SECURE ONLINE PAYMENT</p>
                            <h3>Complete your downpayment</h3>
                          </div>
        
                          <span class="paypal-sandbox-badge">PayPal</span>
                        </div>
        
                        <p class="paypal-payment-copy">
                          PayPal will collect only the required 50% accommodation
                          downpayment. Entrance fees, the remaining accommodation
                          balance, and onsite charges are not included in this payment.
                        </p>
        
                        <div class="paypal-amount-row">
                          <span>Amount to pay now</span>
                          <strong id="paypalDownpaymentAmount">₱0.00</strong>
                        </div>
        
                        <div id="paypalSdkStatus" class="paypal-sdk-status">
                          Preparing PayPal...
                        </div>
        
                        <paypal-button
                          id="paypalButton"
                          type="pay"
                          hidden
                        ></paypal-button>
        
                        <p class="paypal-payment-help">
                          After PayPal confirms the payment, the system automatically
                          records the downpayment and confirms the reservation. No GCash
                          or Maya reference number, QR payment, or proof screenshot is
                          required for customer online bookings.
                        </p>
                      </div>
        
                      <p id="paymentMessage" class="message"></p>
                    </section>
        
                    <!-- ======================================================
                       PAYMENT BREAKDOWN
                    ======================================================= -->
                    <section class="section-box payment-totals">
                      <h2>Payment Breakdown</h2>
        
                      <div class="payment-breakdown">
                        <div class="payment-row">
                          <span>Accommodation Total</span>
                          <strong id="paymentAccommodationTotal">₱0.00</strong>
                        </div>
        
                        <div class="payment-row">
                          <span>Downpayment due now (50%)</span>
                          <strong id="paymentDownpayment">₱0.00</strong>
                        </div>
        
                        <div class="payment-row">
                          <span>Remaining balance at resort</span>
                          <strong id="paymentRemaining">₱0.00</strong>
                        </div>
        
                        <div class="payment-row">
                          <span>Estimated entrance fee (onsite)</span>
                          <strong id="paymentEntranceFee">₱0.00</strong>
                        </div>
        
                        <div class="payment-row">
                          <span>Estimated total due at resort</span>
                          <strong id="paymentFrontDeskReminder">₱0.00</strong>
                        </div>
                      </div>
        
                      <div class="payment-note">
                        <strong>Reminder:</strong>
                        Down payment is based on the accommodation total only. Entrance
                        fee and remaining balance are paid onsite.
        
                        <br /><br />
        
                        <strong>Important:</strong>
                        The displayed entrance fee is only an estimate for the first day
                        of your stay. Guests who will continue using the pool or beach
                        facilities on succeeding days may be charged an additional
                        entrance fee of ₱100 per guest per day. This charge will be
                        assessed and collected at the front desk if applicable.
                      </div>
                    </section>
        
                    <!-- ======================================================
                       RESORT POLICY REMINDER
                    ======================================================= -->
                    <section class="section-box resort-policy-reminder payment-policies">
                      <h2>Resort Policy Reminder</h2>
        
                      <div class="policy-list">
                        <div class="policy-item">
                          <span>01</span>
                          <p>
                            Online reservations require a 50% downpayment of the
                            accommodation price through PayPal. Entrance fees are separate.
                          </p>
                        </div>
        
                        <div class="policy-item">
                          <span>02</span>
                          <p id="policyPaymentStatusText">
                            Customer online reservations are confirmed automatically
                            only after PayPal reports a successful captured downpayment.
                          </p>
                        </div>
        
                        <div class="policy-item">
                          <span>03</span>
                          <p>
                            Remaining balance, entrance fee, and other charges must be
                            settled at the resort.
                          </p>
                        </div>
        
                        <div class="policy-item">
                          <span>04</span>
                          <p>
                            Guests are responsible for damaged items, missing items,
                            stained sheets, towels, or resort property.
                          </p>
                        </div>
        
                        <div class="policy-item">
                          <span>05</span>
                          <p>
                            Additional charges may be added by admin/staff before final
                            payment or check-out.
                          </p>
                        </div>
        
                        <div class="policy-item">
                          <span>06</span>
                          <p>
                            Guests who use pool or beach facilities on succeeding days
                            of their stay may incur an additional entrance fee of ₱100
                            per guest per day, subject to resort assessment.
                          </p>
                        </div>
                      </div>
        
                      <div class="policy-acknowledgement">
                        By continuing with PayPal, you agree to these resort policies.
                      </div>
                    </section>
                </div>
              </div>
            </main>
        
            <!-- ======================================================
               CANCEL TRANSACTION CONFIRMATION MODAL
            ====================================================== -->
            <div class="cancel-transaction-modal" id="cancelTransactionModal">
              <div class="cancel-transaction-box">
                <div class="cancel-transaction-icon">!</div>
        
                <h2>Cancel payment process?</h2>
        
                <p>
                  You are currently completing your reservation payment. If you leave
                  this page, your current payment process will be cancelled.
                </p>
        
                <div class="cancel-transaction-actions">
                  <button
                    type="button"
                    class="continue-booking-btn"
                    id="continueBookingBtn"
                  >
                    Continue Payment
                  </button>
        
                  <button
                    type="button"
                    class="cancel-transaction-btn"
                    id="confirmCancelTransactionBtn"
                  >
                    Cancel Transaction
                  </button>
                </div>
              </div>
            </div>
        
            <!-- ======================================================
               PAGE SCRIPTS
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js"></script>
            <script src="../customerJS/booking-payment.js?v=paypal-only-customer-20260924"></script>
        
        
        
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
        
              const cancelTransactionModal = document.getElementById(
                "cancelTransactionModal",
              );
              const continueBookingBtn = document.getElementById("continueBookingBtn");
              const confirmCancelTransactionBtn = document.getElementById(
                "confirmCancelTransactionBtn",
              );
        
              let pendingExitUrl = null;
        
              document.querySelectorAll(".confirm-transaction-exit").forEach((link) => {
                link.addEventListener("click", (event) => {
                  const href = link.getAttribute("href");
        
                  if (!href || href === "#") return;
        
                  event.preventDefault();
                  pendingExitUrl = href;
        
                  if (cancelTransactionModal) {
                    cancelTransactionModal.classList.add("show");
                  }
                });
              });
        
              if (continueBookingBtn) {
                continueBookingBtn.addEventListener("click", () => {
                  pendingExitUrl = null;
        
                  if (cancelTransactionModal) {
                    cancelTransactionModal.classList.remove("show");
                  }
                });
              }
        
              if (confirmCancelTransactionBtn) {
                confirmCancelTransactionBtn.addEventListener("click", () => {
                  sessionStorage.removeItem("smartresort_booking_draft_v2");
        
                  if (pendingExitUrl) {
                    window.location.href = pendingExitUrl;
                  }
                });
              }
        
              if (cancelTransactionModal) {
                cancelTransactionModal.addEventListener("click", (event) => {
                  if (event.target === cancelTransactionModal) {
                    pendingExitUrl = null;
                    cancelTransactionModal.classList.remove("show");
                  }
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
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/customer-landing-receipt-ui32.test.js:104:10)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 196 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 2.545615
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 197 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 1.850799
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 198 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.404811
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 199 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.763195
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 200 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 2.264163
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 201 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.895534
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 202 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.588095
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 203 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.630856
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 204 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.507925
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 205 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 2.071033
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 206 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.015138
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 207 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.42588
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 208 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.316816
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 209 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.224883
      type: 'test'
      ...
    1..209
    # tests 209
    # suites 0
    # pass 208
    # fail 1
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2907.236302
