# AI Mock Regression — testing branch

Source commit: 62a184c52575d9f13f2b32b08b3078de4fe0e72f
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 0.789353
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.256693
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 469.311276
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.489896
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.444495
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 62.354476
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 11.582914
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 9.369334
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 6.40615
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 3.90536
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 3.742091
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 298.064082
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 9.0353
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 2.529431
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 2.835893
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 15.63488
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 3.419759
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 2.52077
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 3.723923
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 9.790892
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 21 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 2.852817
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 22 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 4.837151
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 23 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 8.79764
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 24 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 4.984254
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 25 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 5.445695
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 26 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 4.563527
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 27 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 5.23627
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 28 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 4.885423
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 29 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.029808
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 30 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 1.967808
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 31 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 6.196839
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 32 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 5.467584
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 33 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 11.389418
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 34 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 6.419904
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 35 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 3.552659
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 36 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.397034
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 37 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.285979
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 38 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.850062
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 39 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 11.889739
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 40 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 5.592577
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 41 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 3.89133
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 42 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.441133
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 43 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.440867
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 44 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.78168
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 45 - English translation route responds with the English text
      ---
      duration_ms: 2.00364
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 46 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 704.306676
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 47 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.577292
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 48 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.92709
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 49 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.475202
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 50 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.089724
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 51 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.240734
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 52 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.035724
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 53 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.091401
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 54 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.726226
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 55 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.244432
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 56 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.849688
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 57 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.399449
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 58 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.333999
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 59 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.091892
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 60 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.101357
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 61 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 4.892053
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 62 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 701.999754
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 63 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 5.304718
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 64 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.334215
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 65 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.075801
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 66 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.767533
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 67 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.383614
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 68 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 1.909499
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 69 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.602897
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 70 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.649095
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 71 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.021768
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 72 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 1.859409
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 73 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 1.835201
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 74 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.17295
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 75 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.195933
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 76 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.202372
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 77 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.467191
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 78 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 1.881816
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 79 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 1.913437
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 80 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.048236
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 81 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.755765
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 82 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.440137
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 83 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.426085
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 84 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 3.717829
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 85 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.956126
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 86 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.634541
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 87 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.095949
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 88 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.417363
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 89 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.641668
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 90 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.331035
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 91 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.260859
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 92 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.313121
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 93 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.5297
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 94 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.3175
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 95 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.677624
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 96 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.326676
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 97 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.586314
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 98 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.514732
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 99 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.609816
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 100 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.471153
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 101 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.326827
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 102 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.551156
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 103 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.547432
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 104 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.504352
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 105 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.616136
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 106 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.542372
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 107 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.61551
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 108 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.197912
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 109 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.707708
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 110 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.638717
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 111 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.518701
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 112 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 6.690176
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 113 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.726797
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 114 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.161783
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 115 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.520065
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 116 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.935666
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 117 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.050213
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 118 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.798792
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 119 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.708249
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 120 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 8.309169
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 121 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.601902
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 122 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 1.964491
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 123 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.788222
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 124 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 2.806862
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 125 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 436.372388
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 126 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.810656
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 127 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.442021
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 128 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.73015
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 129 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.333212
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 130 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.479669
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 131 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.246324
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 132 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.697636
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 133 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 4.278602
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 134 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.505866
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 135 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.4325
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 136 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.363632
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 137 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.588326
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 138 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.133766
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 139 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.343058
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 140 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.265638
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 141 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.142784
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 142 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.092646
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 143 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.343818
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 144 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.190304
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 145 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 2.726797
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 146 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.459941
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 147 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.662458
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 148 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.190069
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 149 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.462959
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 150 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.273762
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 151 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.259023
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 152 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.880181
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 153 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.703024
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 154 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 14.992405
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 155 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.518157
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 156 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.265773
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 157 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.31665
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 158 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.25768
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 159 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.227371
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 160 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.439556
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 161 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.653475
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 162 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.729873
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 163 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.221965
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 164 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.360595
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 165 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.531977
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 166 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 1.98654
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 167 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 1.733949
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 168 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 1.320913
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 169 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 0.476097
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 170 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 1.155948
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 171 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.533654
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 172 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.133411
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 173 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.490467
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 174 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.656273
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 175 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.238328
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 176 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.219799
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 177 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.222756
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 178 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.265768
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 179 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.196537
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 180 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.129591
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 181 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.337882
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 182 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.376249
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 183 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.153071
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 184 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.801495
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 185 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.570123
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 186 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.371543
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 187 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.162825
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 188 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.166917
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 189 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.318286
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 190 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.628675
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 191 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 7.745406
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 192 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.674937
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 193 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.156109
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 194 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.143303
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 195 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.487881
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 196 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.128369
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 197 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.534999
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 198 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.290806
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 199 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.469217
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 200 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 1.513692
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 201 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.383691
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 202 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.10681
      type: 'test'
      ...
    # Subtest: AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
    ok 203 - AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
      ---
      duration_ms: 0.41007
      type: 'test'
      ...
    # Subtest: AI-39 special opening circumstances are qualified, not guaranteed
    ok 204 - AI-39 special opening circumstances are qualified, not guaranteed
      ---
      duration_ms: 0.167748
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 205 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 11.903731
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 206 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.249995
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 207 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 2.80661
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 208 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.499338
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 209 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.425944
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 210 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 0.468868
      type: 'test'
      ...
    # Subtest: AI-39 common opening-days phrasing is resort-relevant without previous chat
    ok 211 - AI-39 common opening-days phrasing is resort-relevant without previous chat
      ---
      duration_ms: 0.203079
      type: 'test'
      ...
    # Subtest: AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
    ok 212 - AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
      ---
      duration_ms: 0.150906
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 213 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 0.787733
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 214 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.164533
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 215 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.164373
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 216 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 10.05181
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 217 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.290038
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 218 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.314945
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 219 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.535877
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 220 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.227915
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 221 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.027756
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 222 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.334946
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 223 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.211946
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 224 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 0.707528
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 225 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.15752
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 226 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.401447
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 227 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.077407
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 228 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 1.013611
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 229 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 0.840082
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 230 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.536304
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 231 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.354756
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 232 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 0.849226
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 233 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.401245
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 234 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.285894
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 235 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 1.789143
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 236 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 1.417454
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 237 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.067415
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 238 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.563106
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 239 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 1.132242
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 240 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.478307
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 241 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 0.721029
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 242 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.309909
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 243 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.226435
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 244 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.099163
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 245 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.675318
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 246 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.292514
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 247 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.33111
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 248 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.21169
      type: 'test'
      ...
    # Subtest: UI-37 public landing includes a complete accessible AI chat widget
    ok 249 - UI-37 public landing includes a complete accessible AI chat widget
      ---
      duration_ms: 0.781481
      type: 'test'
      ...
    # Subtest: UI-37 guest greeting and stored chat are isolated from customer Home
    ok 250 - UI-37 guest greeting and stored chat are isolated from customer Home
      ---
      duration_ms: 0.20586
      type: 'test'
      ...
    # Subtest: UI-37 public accommodations can be discussed but booking links require login
    ok 251 - UI-37 public accommodations can be discussed but booking links require login
      ---
      duration_ms: 0.175327
      type: 'test'
      ...
    # Subtest: UI-37 existing public chat keeps server-side scope, payload and credit guards
    ok 252 - UI-37 existing public chat keeps server-side scope, payload and credit guards
      ---
      duration_ms: 0.103543
      type: 'test'
      ...
    1..252
    # tests 252
    # suites 0
    # pass 252
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2968.811681
