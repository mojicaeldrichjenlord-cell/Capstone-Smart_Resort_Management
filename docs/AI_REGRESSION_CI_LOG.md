# AI Mock Regression — testing branch

Source commit: ad5f026f4129e5206a201cb5b130a534075889af
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 68.127364
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 22.951857
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 17.347994
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 4 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 16.737813
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 5 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 33.521365
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 6 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 13.464127
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 7 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 7.306922
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 8 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.861861
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 9 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.250127
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 10 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 11.395534
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 11 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 8.546473
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 12 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 4.312014
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 13 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 5.566442
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 14 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 6.354417
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 15 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.455847
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 16 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 3.77764
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 17 - English translation route responds with the English text
      ---
      duration_ms: 1.967031
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 18 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.044637
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 19 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 703.578909
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 20 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.181399
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 21 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.426403
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 22 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 5.10364
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 23 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 12.599512
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 24 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.460735
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 25 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.789183
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 26 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.625715
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 27 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.180479
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 28 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.399439
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 29 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 3.691683
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 30 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 1.71054
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 31 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 1.766764
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 32 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 1.785572
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 33 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.568981
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 34 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.270849
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 35 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.128341
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 36 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.341718
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 37 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.144525
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 38 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.826623
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 39 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.493558
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 40 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.20888
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 41 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.571945
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 42 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.773154
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 43 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.199466
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 44 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 1.94578
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 45 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 1.958358
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 46 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 3.64266
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 47 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 2.098447
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 48 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.286281
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 49 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.665649
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 50 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 1.933792
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 51 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.214128
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 52 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 2.925985
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 53 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.833633
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 54 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.568009
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 55 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.540473
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 56 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.925149
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 57 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.834624
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 58 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.797479
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 59 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.286516
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 60 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.096613
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 61 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.54878
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 62 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.4275
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 63 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.156087
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 64 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.295114
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 65 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.488491
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 66 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.204609
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 67 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.40731
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 68 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.268053
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 69 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.32259
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 70 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.020391
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 71 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 4.313046
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 72 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.019379
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 73 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.238319
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 74 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.512997
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 75 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.322334
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 76 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.386889
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 77 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.654848
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 78 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.371137
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 79 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.743018
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 80 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.278464
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 81 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.573157
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 82 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 3.052263
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 83 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.63573
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 84 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.487725
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 85 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.09761
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 86 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.137344
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 87 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.743825
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 88 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.875651
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 89 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.663726
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 90 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.594333
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 91 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 6.487495
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 92 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.477429
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 93 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.911769
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 94 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.898434
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 95 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 2.847689
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 96 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 28.062527
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 97 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.454074
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 98 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.290281
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 99 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.425652
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 100 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.850949
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 101 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.309735
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 102 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.337632
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 103 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.232715
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 104 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.12144
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 105 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.080329
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 106 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.240017
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 107 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.132787
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 108 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.019725
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 109 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.52468
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 110 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.729333
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 111 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.198285
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 112 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.478601
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 113 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.342399
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 114 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.325343
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 115 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.667227
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 116 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.564634
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 117 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 14.613954
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 118 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.508064
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 119 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.297541
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 120 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.242781
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 121 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.207608
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 122 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.174329
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 123 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.425001
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 124 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.600051
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 125 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.793558
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 126 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.1479
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 127 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.254528
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 128 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.386845
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 129 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.114305
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 130 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.649134
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 131 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.203082
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 132 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.241138
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 133 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.200358
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 134 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.223622
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 135 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.176261
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 136 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.137745
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 137 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.270942
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 138 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.094335
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 139 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.180368
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 140 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.651367
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 141 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.426534
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 142 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.27624
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 143 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.122462
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 144 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.101992
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 145 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.186898
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 146 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.411546
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 147 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 6.757586
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 148 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.32318
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 149 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.209341
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 150 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.440814
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 151 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.211464
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 152 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.53238
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 153 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.271504
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 154 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.256381
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 155 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 2.753409
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 156 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.613702
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 157 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.184955
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 158 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.119522
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 159 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.221649
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 160 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.2221
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 161 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 14.450311
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 162 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.458541
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 163 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.33001
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 164 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.610317
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 165 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.271463
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 166 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.520483
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 167 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.771892
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 168 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.246947
      type: 'test'
      ...
    1..168
    # tests 168
    # suites 0
    # pass 168
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2605.19077
