# AI Mock Regression — testing branch

Source commit: 02bf1efd3e8b12168c0b3e53f87a07fa6cd83097
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 99.729134
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 14.450521
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 12.088112
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 4 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 17.188785
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 5 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 22.32998
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 6 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 8.850397
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 7 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 23.355581
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 8 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 10.3632
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 9 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 3.37412
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 10 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.211015
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 11 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 0.902005
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 12 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 4.291578
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 13 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 5.389697
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 14 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.003222
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 15 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.08829
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 16 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.822413
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 17 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.196981
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 18 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.202399
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 19 - English translation route responds with the English text
      ---
      duration_ms: 1.895779
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 20 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.556517
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 21 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.337931
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 22 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 4.447893
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 23 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.466481
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 24 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.920801
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 25 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 3.875683
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 26 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.822048
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 27 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 1.860065
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 28 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.486613
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 29 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 1.953124
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 30 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.52727
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 31 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 3.845027
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 32 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 1.795647
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 33 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.035008
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 34 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.673958
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 35 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.661236
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 36 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.738388
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 37 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.618447
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 38 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.052069
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 39 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.278694
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 40 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.711291
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 41 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.427254
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 42 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.133485
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 43 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.569198
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 44 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.640835
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 45 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 4.205168
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 46 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.814138
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 47 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 1.819814
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 48 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.152341
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 49 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.229747
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 50 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.513053
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 51 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.631904
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 52 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 1.853956
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 53 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.248208
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 54 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 2.71491
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 55 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.266496
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 56 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.490302
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 57 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.383974
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 58 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.106906
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 59 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.531241
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 60 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.810219
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 61 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.995689
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 62 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.07648
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 63 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.877821
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 64 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.485642
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 65 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.46421
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 66 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.59076
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 67 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.745592
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 68 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.709489
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 69 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.51724
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 70 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.528336
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 71 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 5.209077
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 72 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.599112
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 73 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.539613
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 74 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.427816
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 75 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.330008
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 76 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.465121
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 77 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.379092
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 78 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.334665
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 79 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.687856
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 80 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.429347
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 81 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.636018
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 82 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.464363
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 83 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.776629
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 84 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.382748
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 85 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.857742
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 86 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.686348
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 87 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.552865
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 88 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.462437
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 89 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.411683
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 90 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.018941
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 91 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.010608
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 92 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.847653
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 93 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.753792
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 94 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 7.838537
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 95 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.63239
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 96 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.737035
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 97 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.966131
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 98 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 4.447453
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 99 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 34.445173
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 100 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.684699
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 101 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.340813
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 102 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.686431
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 103 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.320652
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 104 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.422274
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 105 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.652703
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 106 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.300023
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 107 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.309535
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 108 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.20617
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 109 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.131688
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 110 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.136335
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 111 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.297758
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 112 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.187812
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 113 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 2.583161
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 114 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.449174
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 115 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.671309
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 116 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.197747
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 117 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.456246
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 118 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.324738
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 119 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.292609
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 120 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.705588
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 121 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.272822
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 122 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 17.109396
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 123 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.589526
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 124 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.306601
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 125 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.285358
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 126 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.298118
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 127 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.23293
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 128 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.807583
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 129 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.677117
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 130 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.754774
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 131 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.230426
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 132 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.389165
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 133 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.491108
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 134 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.637815
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 135 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.656246
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 136 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.221343
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 137 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.258628
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 138 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.245078
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 139 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.271739
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 140 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.234742
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 141 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.868595
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 142 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.37253
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 143 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.420322
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 144 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.213
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 145 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.845751
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 146 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.593843
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 147 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.350697
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 148 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.164998
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 149 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.181282
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 150 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.268343
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 151 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.746554
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 152 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 11.459848
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 153 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.133864
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 154 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.29279
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 155 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.262405
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 156 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.636026
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 157 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.199059
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 158 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.743246
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 159 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.31956
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 160 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 1.476508
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 161 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 2.068158
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 162 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.427792
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 163 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.184417
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 164 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.256007
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 165 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.231948
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 166 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.237017
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 167 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 16.606831
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 168 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 1.165612
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 169 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.333571
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 170 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.703677
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 171 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.269485
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 172 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.813916
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 173 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.969689
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 174 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.260141
      type: 'test'
      ...
    1..174
    # tests 174
    # suites 0
    # pass 174
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2643.743175
