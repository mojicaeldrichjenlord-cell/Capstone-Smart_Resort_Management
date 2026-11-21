# AI Mock Regression — testing branch

Source commit: 7857f62b05eeffd7197293d3fa6f90ca93347655
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.699127
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.552603
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 47.885084
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.23535
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.499905
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 129.503446
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 25.005165
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 21.854024
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 11.290682
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 14.353268
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 8.120213
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 78.283116
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 17.666203
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.931344
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 7.142135
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 23.174292
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 8.072684
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 6.118832
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.843756
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 16.41899
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 21 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 6.058818
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 22 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 8.251829
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 23 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 17.313293
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 24 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 14.134319
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 25 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 8.906324
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 26 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 7.7979
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 27 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 7.696017
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 28 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 6.274873
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 29 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.382625
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 30 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.270826
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 31 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 9.651106
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 32 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 6.767094
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 33 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 17.561848
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 34 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 10.341387
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 35 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 6.319737
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 36 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.880686
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 37 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.812849
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 38 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 6.233164
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 39 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 12.850578
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 40 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 4.347128
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 41 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 11.830491
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 42 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 6.149558
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 43 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.766483
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 44 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 4.624581
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 45 - English translation route responds with the English text
      ---
      duration_ms: 2.476921
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 46 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 704.903418
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 47 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.827377
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 48 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.222905
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 49 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.58228
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 50 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.115841
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 51 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 7.171566
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 52 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.808291
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 53 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.693286
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 54 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.291694
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 55 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.828189
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 56 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 6.091693
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 57 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 6.646683
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 58 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.913879
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 59 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.872462
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 60 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.928186
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 61 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.413041
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 62 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 706.280536
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 63 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 5.676515
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 64 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.475979
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 65 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.402281
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 66 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.066551
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 67 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.77203
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 68 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.263421
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 69 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.942319
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 70 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.013222
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 71 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.226171
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 72 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.385039
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 73 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.154707
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 74 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.456168
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 75 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.472128
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 76 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.721415
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 77 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.145524
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 78 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 3.042851
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 79 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 3.524624
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 80 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.442893
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 81 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.287637
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 82 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.811744
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 83 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.044043
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 84 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.114472
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 85 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.524917
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 86 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 5.514632
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 87 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.549947
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 88 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.468675
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 89 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.123187
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 90 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.992874
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 91 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.695126
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 92 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.817556
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 93 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.992453
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 94 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.765597
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 95 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.165667
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 96 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 2.157933
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 97 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.128056
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 98 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.908455
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 99 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.945195
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 100 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.961716
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 101 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.717046
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 102 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.052937
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 103 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.985811
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 104 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.908986
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 105 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 3.090059
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 106 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.983646
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 107 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.990199
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 108 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.604651
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 109 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.166179
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 110 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.694605
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 111 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.294229
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 112 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 8.089005
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 113 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.315823
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 114 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.515603
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 115 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.403555
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 116 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.962259
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 117 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.990613
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 118 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.860098
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 119 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.688056
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 120 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 8.301252
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 121 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.611974
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 122 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.164126
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 123 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.994039
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 124 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.919558
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 125 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 20.619588
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 126 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.95772
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 127 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.530512
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 128 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.982987
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 129 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.477793
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 130 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.633855
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 131 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.326169
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 132 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.961267
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 133 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 6.842425
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 134 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.733802
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 135 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.546762
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 136 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.476972
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 137 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.698987
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 138 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.488283
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 139 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.645968
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 140 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.446905
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 141 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.317173
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 142 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.167914
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 143 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.451364
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 144 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.293659
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 145 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 5.466882
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 146 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 1.486199
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 147 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.931682
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 148 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.31012
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 149 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.554457
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 150 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.486549
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 151 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.474036
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 152 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 7.922143
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 153 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.690621
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 154 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 27.039639
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 155 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.721599
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 156 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.421568
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 157 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.372847
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 158 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.413282
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 159 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.296955
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 160 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.67379
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 161 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.915211
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 162 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.031058
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 163 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.241201
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 164 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.565668
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 165 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.836795
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 166 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 4.200704
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 167 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 2.939366
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 168 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 2.857473
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 169 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 0.969714
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 170 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 2.145422
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 171 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.999269
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 172 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.342089
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 173 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.751345
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 174 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.894082
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 175 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.275906
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 176 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.29418
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 177 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.36396
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 178 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.32667
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 179 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.271097
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 180 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.757536
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 181 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.480369
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 182 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.564255
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 183 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.252522
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 184 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.048491
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 185 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.729143
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 186 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.473706
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 187 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.316421
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 188 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.231023
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 189 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.399497
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 190 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.289581
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 191 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 9.4605
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 192 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.953052
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 193 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.285764
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 194 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.322994
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 195 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.792642
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 196 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.238005
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 197 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.219279
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 198 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.423903
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 199 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.852574
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 200 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 4.142465
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 201 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.589994
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 202 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.259655
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 203 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 17.827083
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 204 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.552854
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 205 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 5.110566
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 206 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 4.181037
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 207 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 1.017072
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 208 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 1.992094
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 209 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 2.138599
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 210 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.411379
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 211 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 1.100748
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 212 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 26.086978
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 213 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.586316
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 214 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 1.279102
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 215 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 1.004749
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 216 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 1.566429
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 217 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 4.78688
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 218 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 5.180286
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 219 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.399216
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 220 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.781201
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 221 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.378368
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 222 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.810576
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 223 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 2.51887
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 224 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 2.054261
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 225 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.32654
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 226 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.723343
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 227 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.535922
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 228 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 1.190837
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 229 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.562933
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 230 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.408935
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 231 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 3.73294
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 232 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.883612
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 233 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 2.159167
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 234 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 1.136706
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 235 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 2.989089
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 236 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.89311
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 237 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 2.401701
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 238 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.658792
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 239 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.53472
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 240 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 3.362664
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 241 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.065222
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 242 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.448458
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 243 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.332492
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 244 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.236462
      type: 'test'
      ...
    # Subtest: UI-37 public landing includes a complete accessible AI chat widget
    ok 245 - UI-37 public landing includes a complete accessible AI chat widget
      ---
      duration_ms: 1.628054
      type: 'test'
      ...
    # Subtest: UI-37 guest greeting and stored chat are isolated from customer Home
    ok 246 - UI-37 guest greeting and stored chat are isolated from customer Home
      ---
      duration_ms: 0.314338
      type: 'test'
      ...
    # Subtest: UI-37 public accommodations can be discussed but booking links require login
    ok 247 - UI-37 public accommodations can be discussed but booking links require login
      ---
      duration_ms: 0.262551
      type: 'test'
      ...
    # Subtest: UI-37 existing public chat keeps server-side scope, payload and credit guards
    ok 248 - UI-37 existing public chat keeps server-side scope, payload and credit guards
      ---
      duration_ms: 0.19228
      type: 'test'
      ...
    1..248
    # tests 248
    # suites 0
    # pass 248
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 3059.698614
