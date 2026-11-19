# AI Mock Regression — testing branch

Source commit: 4f8c8555023cc5b37c285c164cd0f580e930c037
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 1 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 160.453699
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 2 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 24.895636
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 3 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 13.23837
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 4 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 16.635826
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 5 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 17.142791
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 6 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 20.81586
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 7 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 10.523896
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 8 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 16.777791
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 9 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 10.954337
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 10 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 21.50331
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 11 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 9.461979
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 12 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.462359
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 13 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.684751
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 14 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.112491
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 15 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.734454
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 16 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 7.215976
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 17 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 3.015485
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 18 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 5.252881
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 19 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.844739
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 20 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.409526
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 21 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.730815
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 22 - English translation route responds with the English text
      ---
      duration_ms: 2.430966
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 23 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 702.389037
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 24 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 703.411532
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 25 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.255841
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 26 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.786955
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 27 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.67841
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 28 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.356732
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 29 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.800765
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 30 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.880453
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 31 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.612044
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 32 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.733581
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 33 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.730521
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 34 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.774041
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 35 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.64238
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 36 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.577169
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 37 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.779235
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 38 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.179598
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 39 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.58801
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 40 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.666746
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 41 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 6.085243
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 42 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.722712
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 43 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.182096
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 44 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.86115
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 45 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 3.042266
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 46 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.019735
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 47 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.364906
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 48 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.435037
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 49 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.82405
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 50 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.626644
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 51 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 2.275921
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 52 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.944095
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 53 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.810756
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 54 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 4.913826
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 55 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 4.436298
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 56 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 3.760591
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 57 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.6904
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 58 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.695422
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 59 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.395533
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 60 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.315274
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 61 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.475803
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 62 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.871229
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 63 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 2.298724
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 64 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 6.21241
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 65 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 3.583712
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 66 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 3.091588
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 67 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.240365
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 68 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 2.287823
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 69 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.907687
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 70 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.915902
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 71 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.558487
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 72 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.624661
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 73 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.63523
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 74 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.114111
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 75 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.064598
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 76 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.91997
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 77 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.731659
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 78 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.591579
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 79 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.954433
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 80 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.872061
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 81 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.819753
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 82 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.383291
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 83 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.922945
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 84 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.930129
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 85 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.600535
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 86 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.059038
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 87 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.677088
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 88 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.263578
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 89 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.680702
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 90 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 5.685039
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 91 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.221887
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 92 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.327532
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 93 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.917598
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 94 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.899766
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 95 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.742714
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 96 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.674536
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 97 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 10.138298
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 98 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 2.444342
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 99 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.053766
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 100 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.881584
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 101 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 6.31607
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 102 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 44.288005
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 103 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.795521
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 104 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.471006
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 105 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.840686
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 106 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.40265
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 107 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.577375
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 108 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.841664
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 109 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.814477
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 110 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.279576
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 111 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.065436
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 112 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.554713
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 113 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.417167
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 114 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.248753
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 115 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.159277
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 116 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.494151
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 117 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.266045
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 118 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 4.634921
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 119 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.651493
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 120 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.905186
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 121 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.286343
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 122 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.630144
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 123 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.4833
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 124 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.534115
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 125 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.400075
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 126 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.194765
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 127 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 23.40323
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 128 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.660621
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 129 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.346756
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 130 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.349741
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 131 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.337358
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 132 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.269612
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 133 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.597382
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 134 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.807523
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 135 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.953986
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 136 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.232163
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 137 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.425192
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 138 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.747882
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 139 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.045212
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 140 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.836117
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 141 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.271605
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 142 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.295631
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 143 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.409653
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 144 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.336747
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 145 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.271045
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 146 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.641196
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 147 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.420242
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 148 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.556346
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 149 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.28951
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 150 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.958615
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 151 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.716003
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 152 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.431423
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 153 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.19914
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 154 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.195904
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 155 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.360311
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 156 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.083029
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 157 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 10.382242
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 158 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.251109
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 159 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.294849
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 160 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.314886
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 161 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.707107
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 162 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.250836
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 163 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.978372
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 164 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.390918
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 165 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.777598
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 166 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.954273
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 167 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.591441
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 168 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.192238
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 169 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.232394
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 170 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.264323
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 171 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.256758
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 172 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 18.637283
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 173 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.466298
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 174 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.472399
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 175 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.88106
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 176 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.379817
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 177 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.145246
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 178 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.854884
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 179 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.299608
      type: 'test'
      ...
    1..179
    # tests 179
    # suites 0
    # pass 179
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2828.175692
