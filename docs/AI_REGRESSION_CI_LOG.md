# AI Mock Regression — testing branch

Source commit: e039198a620997feb97744f05cdd3936d7953a61
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 140.179374
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 13.311274
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 13.199299
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 4 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 14.461226
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 5 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 50.964165
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 6 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 18.072355
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 7 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 7.537516
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 8 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 7.319074
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 9 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.896965
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 10 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 27.289575
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 11 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 8.557224
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 12 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 4.141053
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 13 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 8.226605
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 14 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 11.700332
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 15 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 3.481859
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 16 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 6.497358
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 17 - English translation route responds with the English text
      ---
      duration_ms: 3.258969
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 18 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 705.784891
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 19 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.113767
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 20 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.660915
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 21 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.658694
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 22 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 5.054615
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 23 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 8.451799
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 24 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 3.134505
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 25 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.742354
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 26 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.577121
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 27 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.956222
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 28 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.647962
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 29 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 6.11285
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 30 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.92796
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 31 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.938725
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 32 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.945846
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 33 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.634375
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 34 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 704.121991
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 35 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.979874
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 36 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.663839
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 37 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.794253
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 38 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.473527
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 39 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.942562
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 40 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.926047
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 41 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.97493
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 42 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.188155
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 43 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.848502
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 44 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.630289
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 45 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.748164
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 46 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 5.802991
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 47 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 2.323355
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 48 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.864808
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 49 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.409863
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 50 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.479666
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 51 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 3.318968
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 52 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.944944
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 53 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.318518
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 54 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.195126
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 55 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 4.347068
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 56 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 3.50948
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 57 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 2.306701
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 58 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 2.547607
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 59 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 3.096018
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 60 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.566716
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 61 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.28572
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 62 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.223688
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 63 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.684711
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 64 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.885398
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 65 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.354702
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 66 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.816656
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 67 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.837106
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 68 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 2.133545
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 69 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 3.472595
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 70 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.808443
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 71 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 5.002137
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 72 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.991093
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 73 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.665803
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 74 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.058894
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 75 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.843126
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 76 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.8803
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 77 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.585693
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 78 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.997154
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 79 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.429162
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 80 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.228835
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 81 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.448711
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 82 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 2.007929
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 83 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.887349
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 84 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 5.372474
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 85 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.237638
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 86 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.312461
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 87 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.23866
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 88 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.907822
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 89 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.98048
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 90 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.802347
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 91 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.694857
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 92 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 7.482505
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 93 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.607078
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 94 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.299168
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 95 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.094408
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 96 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.766229
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 97 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 266.114714
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 98 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.955613
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 99 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.545277
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 100 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 6.973142
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 101 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.131671
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 102 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.770838
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 103 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.589752
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 104 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.482874
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 105 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.231743
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 106 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.165144
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 107 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.449154
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 108 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.289418
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 109 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 4.80161
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 110 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.859561
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 111 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.322826
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 112 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.326723
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 113 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.768015
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 114 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.584925
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 115 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.555021
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 116 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.126742
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 117 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.854733
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 118 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 178.327291
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 119 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.738712
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 120 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.376326
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 121 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 7.44539
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 122 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.353172
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 123 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.329847
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 124 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.667106
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 125 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.979098
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 126 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 3.179842
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 127 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.318461
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 128 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.595921
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 129 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.666366
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 130 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.283706
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 131 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.727416
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 132 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.258742
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 133 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.348245
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 134 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.342687
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 135 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.300073
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 136 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.231933
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 137 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.974121
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 138 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.303569
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 139 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.401413
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 140 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.215228
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 141 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.739003
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 142 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.510746
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 143 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.39887
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 144 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.162189
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 145 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.186025
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 146 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.373202
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 147 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.676639
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 148 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 10.37339
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 149 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.321785
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 150 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.335847
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 151 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.325772
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 152 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.836467
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 153 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.287485
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 154 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.061921
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 155 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.414032
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 156 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 1.895383
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 157 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 2.728225
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 158 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.540669
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 159 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.20963
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 160 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.151323
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 161 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.221968
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 162 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.268077
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 163 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 14.941325
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 164 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.395705
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 165 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.35175
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 166 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.6492
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 167 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.306333
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 168 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.587366
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 169 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.801544
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 170 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.291902
      type: 'test'
      ...
    1..170
    # tests 170
    # suites 0
    # pass 170
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2850.243062
