# AI Mock Regression — testing branch

Source commit: 2fffe76f6824bf11b0738eca3ab0e6637c106c3f
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.109704
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.357539
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 26.188501
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 1.311062
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.353684
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 143.568875
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 11.712038
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 5.224008
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 18.136554
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 8.223781
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 10.830312
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 78.58659
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 10.112629
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 3.215984
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 3.263394
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 13.262605
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 6.958457
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 2.852996
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 5.707734
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 14.530623
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 21 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 3.84126
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 22 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 6.749878
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 23 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 10.951256
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 24 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 6.98741
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 25 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 3.042437
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 26 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.616305
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 27 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 9.585549
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 28 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 6.518165
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 29 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 13.848583
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 30 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 7.401874
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 31 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 3.733531
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 32 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.805206
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 33 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.306185
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 34 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 7.113637
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 35 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 12.792008
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 36 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.995858
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 37 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.716635
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 38 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.987267
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 39 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.861729
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 40 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.502888
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 41 - English translation route responds with the English text
      ---
      duration_ms: 2.286718
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 42 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 702.652204
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 43 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.176361
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 44 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.510108
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 45 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.756441
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 46 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.884405
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 47 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.640343
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 48 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.806016
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 49 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.976629
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 50 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.336612
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 51 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.754019
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 52 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.629407
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 53 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.335262
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 54 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.813928
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 55 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 6.072024
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 56 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.34217
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 57 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.860446
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 58 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.268574
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 59 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.347149
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 60 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.273998
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 61 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.379755
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 62 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.003047
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 63 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.636414
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 64 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.209322
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 65 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.929618
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 66 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.887265
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 67 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 3.504762
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 68 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.980165
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 69 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.320117
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 70 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.378842
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 71 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.45127
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 72 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.381997
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 73 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.78171
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 74 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.215151
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 75 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.26878
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 76 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.273939
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 77 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.025721
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 78 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 4.856994
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 79 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.864893
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 80 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.156645
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 81 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.54616
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 82 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.969928
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 83 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.812285
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 84 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.2478
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 85 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.817652
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 86 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.446814
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 87 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.495305
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 88 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.805685
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 89 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.777012
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 90 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.462807
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 91 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.474825
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 92 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.441365
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 93 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.915287
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 94 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.793657
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 95 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.797382
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 96 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.546161
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 97 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.528534
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 98 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.840086
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 99 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.882488
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 100 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.739487
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 101 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.132348
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 102 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.760708
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 103 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.447465
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 104 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.366987
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 105 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.179608
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 106 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 5.447028
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 107 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.276953
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 108 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.542629
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 109 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.047975
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 110 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.567425
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 111 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.972121
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 112 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.387184
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 113 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.387105
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 114 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.099078
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 115 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.990617
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 116 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 11.636827
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 117 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.859253
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 118 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.906606
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 119 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.307266
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 120 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.80725
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 121 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 24.571882
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 122 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.888236
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 123 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.430328
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 124 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.908315
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 125 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.407073
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 126 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.625046
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 127 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.841761
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 128 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.820276
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 129 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.805439
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 130 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.681229
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 131 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.718234
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 132 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.717653
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 133 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.325907
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 134 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.909208
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 135 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.570295
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 136 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.420824
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 137 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.247096
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 138 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.191504
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 139 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.515453
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 140 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.306584
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 141 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 7.298305
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 142 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.860564
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 143 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.300376
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 144 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 1.82935
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 145 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.747057
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 146 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.624185
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 147 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.508954
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 148 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.05018
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 149 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.281519
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 150 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 23.023974
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 151 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.663793
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 152 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.355767
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 153 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.737242
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 154 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.354264
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 155 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.296159
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 156 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.698745
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 157 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.86394
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 158 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.098417
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 159 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.252233
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 160 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.499831
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 161 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.746546
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 162 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 3.90903
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 163 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 3.322741
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 164 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 2.220379
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 165 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 1.286126
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 166 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 2.972863
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 167 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.984618
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 168 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.245253
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 169 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.625682
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 170 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.889908
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 171 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.310149
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 172 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.400283
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 173 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.349438
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 174 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.403578
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 175 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.354555
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 176 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.267487
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 177 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.502444
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 178 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.58054
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 179 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.345812
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 180 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.015013
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 181 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.809279
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 182 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.495555
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 183 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.237061
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 184 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.271562
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 185 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.3984
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 186 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.355248
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 187 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 10.623947
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 188 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.242581
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 189 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.322378
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 190 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.381055
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 191 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.735109
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 192 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.275888
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 193 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.031849
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 194 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.39863
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 195 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.775369
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 196 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 4.411555
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 197 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.602642
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 198 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.227968
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 199 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 16.435755
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 200 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.516054
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 201 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 3.893648
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 202 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.672496
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 203 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.575983
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 204 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 0.764082
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 205 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.840256
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 206 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.381955
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 207 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.395215
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 208 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 24.850018
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 209 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.516325
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 210 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.44533
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 211 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.997728
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 212 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.435605
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 213 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.549507
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 214 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.817542
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 215 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.295658
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 216 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.55962
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 217 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.302588
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 218 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.704333
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 219 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.99841
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 220 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.59312
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 221 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.929036
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 222 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.672626
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 223 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 1.794789
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 224 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.691214
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 225 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.567871
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 226 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 2.832585
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 227 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.149915
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 228 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.803992
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 229 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.849408
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 230 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 1.640901
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 231 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.636043
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 232 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.049315
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 233 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.441834
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 234 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.388255
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 235 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.490087
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 236 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.969105
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 237 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.450217
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 238 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.341556
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 239 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.255308
      type: 'test'
      ...
    1..239
    # tests 239
    # suites 0
    # pass 239
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2922.53967
