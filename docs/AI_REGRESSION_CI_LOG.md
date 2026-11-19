# AI Mock Regression — testing branch

Source commit: c7f28f4ddeedba00b3a48d39760b31ccf5a93292
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 60.312814
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 8.858069
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 10.343449
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 4 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 11.512111
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 5 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 12.261014
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 6 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 24.323332
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 7 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 17.605002
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 8 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 15.937711
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 9 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 12.990779
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 10 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 24.130511
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 11 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 8.157138
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 12 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.106731
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 13 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.320732
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 14 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 0.983125
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 15 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.271719
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 16 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 6.95194
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 17 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.21913
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 18 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 5.102355
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 19 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.866431
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 20 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 1.972069
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 21 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 1.8333
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 22 - English translation route responds with the English text
      ---
      duration_ms: 1.844166
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 23 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.278147
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 24 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 702.760068
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 25 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.713041
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 26 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.550706
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 27 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 2.886041
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 28 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 3.483297
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 29 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.80623
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 30 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 1.983907
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 31 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.818128
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 32 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.197407
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 33 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.378479
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 34 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.616687
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 35 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.131548
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 36 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.088194
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 37 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.307553
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 38 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.857718
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 39 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.694664
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 40 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.100963
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 41 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 4.653793
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 42 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 3.577438
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 43 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.940832
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 44 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.517317
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 45 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 1.936385
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 46 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.776896
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 47 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.273341
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 48 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 1.949605
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 49 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.287512
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 50 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 1.95963
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 51 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.378529
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 52 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.442905
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 53 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.265529
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 54 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.574424
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 55 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 3.501394
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 56 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.898278
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 57 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.3389
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 58 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.057087
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 59 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.716165
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 60 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.685289
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 61 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.908334
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 62 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.382334
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 63 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.450115
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 64 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.78584
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 65 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 5.282776
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 66 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.41299
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 67 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.790667
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 68 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.714993
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 69 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.441793
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 70 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.521894
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 71 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.254692
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 72 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.248583
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 73 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.227282
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 74 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.889805
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 75 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.890426
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 76 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.671058
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 77 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.445228
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 78 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.447262
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 79 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.731889
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 80 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.701252
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 81 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.609755
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 82 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.932389
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 83 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.631218
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 84 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.660902
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 85 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.233481
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 86 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.807262
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 87 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.477607
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 88 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.980452
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 89 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.81927
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 90 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 5.075956
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 91 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.424507
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 92 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.644097
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 93 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.97323
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 94 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.978809
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 95 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.858818
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 96 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.790386
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 97 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 7.830037
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 98 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.696615
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 99 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.47259
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 100 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.536966
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 101 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 2.993722
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 102 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 80.78625
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 103 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.7402
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 104 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.42718
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 105 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.727181
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 106 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.343054
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 107 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.421473
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 108 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.663736
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 109 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.244858
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 110 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.336305
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 111 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.214081
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 112 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.143895
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 113 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.075754
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 114 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.235313
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 115 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.140581
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 116 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 2.607892
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 117 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.472408
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 118 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.74686
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 119 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.222293
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 120 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.465798
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 121 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.32018
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 122 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.341943
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 123 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.952811
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 124 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.307862
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 125 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 40.016555
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 126 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.505999
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 127 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.278417
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 128 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.289825
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 129 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.243716
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 130 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.198258
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 131 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.458628
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 132 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.663104
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 133 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.750365
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 134 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.202855
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 135 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.37349
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 136 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.572699
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 137 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.797437
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 138 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.66687
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 139 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.18638
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 140 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.226029
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 141 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.237026
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 142 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.261483
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 143 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.223175
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 144 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.178778
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 145 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.328012
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 146 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.865459
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 147 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.191818
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 148 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.782304
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 149 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.573691
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 150 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.352699
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 151 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.175733
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 152 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.177627
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 153 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.352779
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 154 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.804197
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 155 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 7.923127
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 156 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.962183
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 157 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.225578
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 158 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.224738
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 159 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.554342
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 160 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.17328
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 161 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.698458
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 162 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.303816
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 163 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.642184
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 164 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.188253
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 165 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.425599
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 166 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.151677
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 167 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 0.9003
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 168 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.180651
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 169 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.189284
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 170 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 11.93153
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 171 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.377456
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 172 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.279249
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 173 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.712459
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 174 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.274712
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 175 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.108313
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 176 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.664067
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 177 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.315223
      type: 'test'
      ...
    1..177
    # tests 177
    # suites 0
    # pass 177
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2644.297789
