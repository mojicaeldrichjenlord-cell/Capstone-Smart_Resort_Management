# AI Mock Regression — testing branch

Source commit: 5da8234e03f34eefa671be5bb1dc89ca90367134
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.203461
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.376947
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 21.045463
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 1.723243
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.41191
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 2.84398
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.31247
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.131688
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 1.036109
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 0.827886
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 130.751259
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 24.404979
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 10.147892
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 9.392566
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 10.375765
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 8.3122
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 76.719451
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 10.661365
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.273817
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 6.985604
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 20.334683
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 6.808717
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.721386
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.632647
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 15.46196
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 3.930856
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 9.597544
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 7.57459
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 8.002775
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 6.81752
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 5.964887
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 6.245149
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 8.165809
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 4.945773
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 6.503958
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 3.216351
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 3.539427
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 26.603017
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 7.431764
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 10.904571
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 13.168128
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.595982
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.668902
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.522391
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 6.202976
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 16.089425
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 5.523413
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 4.540513
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 7.524935
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 5.573388
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 3.633959
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 2.686943
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 705.07776
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 706.060341
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.979029
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.524019
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.198093
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.049675
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.018278
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.119981
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.787761
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 5.444345
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.838237
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.291279
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.047261
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.878643
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.360102
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.510393
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.689182
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.825618
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 1.985659
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 1.837125
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.586598
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.277714
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 1.770435
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.671536
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 1.981592
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.275635
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.333182
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 2.243938
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.403402
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.249731
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.104092
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 5.903455
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.030085
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.211589
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 2.865283
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.70103
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.395471
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.375105
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.703844
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.259926
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.531495
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.477133
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 1.815883
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.572256
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.499216
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.385786
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.30243
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.439206
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.200236
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.207127
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.195189
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.718016
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.553238
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.531775
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.876204
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.636063
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.660179
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 5.01579
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.549642
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.824196
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.477063
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.504845
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.042765
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.596243
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.265575
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.770235
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 119 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.835603
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.446553
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 8.482748
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 1.582241
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 2.280262
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.103116
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 2.731402
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.17578
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 127 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.369151
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 128 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.326081
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 129 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 2.157136
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 130 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.007787
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 131 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.516743
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 132 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.013495
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 133 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.048187
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 134 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.965513
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 135 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.834977
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 136 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 9.171483
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 137 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.733244
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 138 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.456868
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 139 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.091683
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 140 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 4.321654
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 141 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 17.671426
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 142 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.858141
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 143 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.468896
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 144 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 2.0066
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 145 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.364488
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 146 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.454253
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 147 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.178323
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 148 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.655326
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 149 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 4.104877
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 150 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.529578
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 151 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.616958
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 152 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.613223
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 153 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.323867
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 154 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.632872
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 155 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.421304
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 156 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.269366
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 157 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.151378
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 158 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 1.157252
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 159 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.310677
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 160 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.178268
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 161 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 6.287262
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 162 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.602287
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 163 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 4.175925
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 164 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.283176
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 165 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.567484
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 166 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.395305
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 167 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.421274
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 168 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 11.071933
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 169 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.644345
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 170 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 20.936278
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 171 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.616307
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 172 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.302696
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 173 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.304068
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 174 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.250698
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 175 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.221573
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 176 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.442456
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 177 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.686202
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 178 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.88422
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 179 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.196395
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 180 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.336757
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 181 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.539362
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 182 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 3.34231
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 183 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 4.105509
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 184 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 1.769714
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 185 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 0.789458
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 186 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 1.649233
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 187 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.728686
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 188 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.195695
      type: 'test'
      ...
    # Subtest: AI-45 descriptive Filipino recommendations preserve written guest count
    ok 189 - AI-45 descriptive Filipino recommendations preserve written guest count
      ---
      duration_ms: 0.41822
      type: 'test'
      ...
    # Subtest: AI-45 2-to-7 corrections need immediately preceding verified preview
    ok 190 - AI-45 2-to-7 corrections need immediately preceding verified preview
      ---
      duration_ms: 0.534194
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 191 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.680028
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 192 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.69107
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 193 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.203827
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 194 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.202365
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 195 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.241293
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 196 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.26561
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 197 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.200021
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 198 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 2.358219
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 199 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.33169
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 200 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.447363
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 201 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.19944
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 202 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.754015
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 203 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.574224
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 204 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.468575
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 205 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.215144
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 206 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.194543
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 207 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.343206
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 208 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.768432
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 209 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 11.411624
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 210 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.985794
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 211 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.270387
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 212 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.230757
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 213 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.561796
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 214 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 1.102099
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 215 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.047426
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 216 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.29207
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 217 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.542096
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 218 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 1.959949
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 219 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.386752
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 220 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.145298
      type: 'test'
      ...
    # Subtest: AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
    ok 221 - AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
      ---
      duration_ms: 0.622277
      type: 'test'
      ...
    # Subtest: AI-39 special opening circumstances are qualified, not guaranteed
    ok 222 - AI-39 special opening circumstances are qualified, not guaranteed
      ---
      duration_ms: 0.221393
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 223 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 18.683519
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 224 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.481044
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 225 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 7.179245
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 226 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.818832
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 227 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.685932
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 228 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 1.738316
      type: 'test'
      ...
    # Subtest: AI-39 common opening-days phrasing is resort-relevant without previous chat
    ok 229 - AI-39 common opening-days phrasing is resort-relevant without previous chat
      ---
      duration_ms: 1.235469
      type: 'test'
      ...
    # Subtest: AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
    ok 230 - AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
      ---
      duration_ms: 0.284438
      type: 'test'
      ...
    # Subtest: AI-44 multilingual greetings and clear resort requests pass the scope gate
    ok 231 - AI-44 multilingual greetings and clear resort requests pass the scope gate
      ---
      duration_ms: 1.176641
      type: 'test'
      ...
    # Subtest: WAV audio is transcribed with Gemini but never stored
    ok 232 - WAV audio is transcribed with Gemini but never stored
      ---
      duration_ms: 1.213777
      type: 'test'
      ...
    # Subtest: Invalid format and audio are rejected before invoking Gemini
    ok 233 - Invalid format and audio are rejected before invoking Gemini
      ---
      duration_ms: 0.3649
      type: 'test'
      ...
    # Subtest: No speech from Gemini returns empty transcript
    ok 234 - No speech from Gemini returns empty transcript
      ---
      duration_ms: 0.329346
      type: 'test'
      ...
    # Subtest: Recorded multilingual STT auto-detects language with verified resort vocabulary
    ok 235 - Recorded multilingual STT auto-detects language with verified resort vocabulary
      ---
      duration_ms: 0.373702
      type: 'test'
      ...
    # Subtest: Untrusted voice language header cannot inject transcription prompts
    ok 236 - Untrusted voice language header cannot inject transcription prompts
      ---
      duration_ms: 0.377187
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 237 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.287427
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 238 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.274523
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 239 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.282786
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 240 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 16.881396
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 241 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.466302
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 242 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.371469
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 243 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.796639
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 244 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.317418
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 245 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.925192
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 246 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.408906
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 247 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 1.827781
      type: 'test'
      ...
    # Subtest: Voice toolbar initializes without making backend or speech calls
    ok 248 - Voice toolbar initializes without making backend or speech calls
      ---
      duration_ms: 5.599016
      type: 'test'
      ...
    # Subtest: Dictation records editable text but never automatically submits
    ok 249 - Dictation records editable text but never automatically submits
      ---
      duration_ms: 2.656037
      type: 'test'
      ...
    # Subtest: Live mode sends recognized turn, speaks response, and listens again
    ok 250 - Live mode sends recognized turn, speaks response, and listens again
      ---
      duration_ms: 12.835427
      type: 'test'
      ...
    # Subtest: Mandarin transcript produces Mandarin playback with the device fallback
    ok 251 - Mandarin transcript produces Mandarin playback with the device fallback
      ---
      duration_ms: 1.908772
      type: 'test'
      ...
    # Subtest: Automatic language does not expose a selector or persist a chosen language
    ok 252 - Automatic language does not expose a selector or persist a chosen language
      ---
      duration_ms: 2.565221
      type: 'test'
      ...
    # Subtest: Interrupt stops ongoing TTS and accepts a new voice turn
    ok 253 - Interrupt stops ongoing TTS and accepts a new voice turn
      ---
      duration_ms: 3.644194
      type: 'test'
      ...
    # Subtest: Closing assistant cancels microphone and never sends stale recognized audio
    ok 254 - Closing assistant cancels microphone and never sends stale recognized audio
      ---
      duration_ms: 1.716503
      type: 'test'
      ...
    # Subtest: Permission denial ends live conversation without retry loop
    ok 255 - Permission denial ends live conversation without retry loop
      ---
      duration_ms: 1.10345
      type: 'test'
      ...
    # Subtest: Unsupported speech browser keeps text chat available and disables voice
    ok 256 - Unsupported speech browser keeps text chat available and disables voice
      ---
      duration_ms: 1.192174
      type: 'test'
      ...
    # Subtest: Native recognition and authenticated recording fallback never access payment routes
    ok 257 - Native recognition and authenticated recording fallback never access payment routes
      ---
      duration_ms: 0.563489
      type: 'test'
      ...
    # Subtest: Customer pages load AI chat before interactive voice and include voice styles
    ok 258 - Customer pages load AI chat before interactive voice and include voice styles
      ---
      duration_ms: 0.448224
      type: 'test'
      ...
    # Subtest: Voice origin is marked without pinning a voice language
    ok 259 - Voice origin is marked without pinning a voice language
      ---
      duration_ms: 0.562547
      type: 'test'
      ...
    # Subtest: English prefers an available Natural/Neural voice over basic Google TTS
    ok 260 - English prefers an available Natural/Neural voice over basic Google TTS
      ---
      duration_ms: 1.374769
      type: 'test'
      ...
    # Subtest: English retains Google US English when no enhanced voice exists
    ok 261 - English retains Google US English when no enhanced voice exists
      ---
      duration_ms: 0.88397
      type: 'test'
      ...
    # Subtest: Compact browser voice is identified in visible voice diagnostic
    ok 262 - Compact browser voice is identified in visible voice diagnostic
      ---
      duration_ms: 0.885413
      type: 'test'
      ...
    # Subtest: Taglish prefers locally installed Microsoft Blessica without Azure credentials
    ok 263 - Taglish prefers locally installed Microsoft Blessica without Azure credentials
      ---
      duration_ms: 11.827109
      type: 'test'
      ...
    # Subtest: Spanish and Mandarin keep appropriate browser default-language voices
    ok 264 - Spanish and Mandarin keep appropriate browser default-language voices
      ---
      duration_ms: 1.019374
      type: 'test'
      ...
    # Blessica cloud voice unavailable: Blessica voice returned HTTP 503
    # Subtest: Without Azure credentials, Taglish falls back to an available Filipino browser voice
    ok 265 - Without Azure credentials, Taglish falls back to an available Filipino browser voice
      ---
      duration_ms: 2.120662
      type: 'test'
      ...
    # Subtest: Unavailable Azure returns 503 and falls back to browser without retrying
    ok 266 - Unavailable Azure returns 503 and falls back to browser without retrying
      ---
      duration_ms: 2.449626
      type: 'test'
      ...
    # Subtest: Available Azure Blessica plays MP3 instead of browser TTS
    ok 267 - Available Azure Blessica plays MP3 instead of browser TTS
      ---
      duration_ms: 1.62783
      type: 'test'
      ...
    # Subtest: Voice picker is removed while language and live controls remain
    ok 268 - Voice picker is removed while language and live controls remain
      ---
      duration_ms: 1.044352
      type: 'test'
      ...
    # Subtest: iOS Safari records PCM WAV and reviews transcript without auto-sending
    ok 269 - iOS Safari records PCM WAV and reviews transcript without auto-sending
      ---
      duration_ms: 6.788787
      type: 'test'
      ...
    # Subtest: iOS hands-free turn transcribes after silence and resumes listening
    ok 270 - iOS hands-free turn transcribes after silence and resumes listening
      ---
      duration_ms: 44.836874
      type: 'test'
      ...
    # Subtest: Firefox-like browser without SpeechRecognition can use secure audio capture
    ok 271 - Firefox-like browser without SpeechRecognition can use secure audio capture
      ---
      duration_ms: 4.424839
      type: 'test'
      ...
    # Subtest: iOS Safari chooses enhanced English voice instead of compact/default
    ok 272 - iOS Safari chooses enhanced English voice instead of compact/default
      ---
      duration_ms: 0.949649
      type: 'test'
      ...
    # Subtest: Mobile English fallback uses en-US before speech voices load
    ok 273 - Mobile English fallback uses en-US before speech voices load
      ---
      duration_ms: 0.848016
      type: 'test'
      ...
    # Subtest: Taglish voice recognizes resort Pool Shade even if browser hears full shade
    ok 274 - Taglish voice recognizes resort Pool Shade even if browser hears full shade
      ---
      duration_ms: 1.927511
      type: 'test'
      ...
    # Subtest: Taglish preview / premyo mishearing is corrected only in resort context
    ok 275 - Taglish preview / premyo mishearing is corrected only in resort context
      ---
      duration_ms: 1.853189
      type: 'test'
      ...
    # Subtest: A real prize request stays as premyo without accommodation context
    ok 276 - A real prize request stays as premyo without accommodation context
      ---
      duration_ms: 1.369862
      type: 'test'
      ...
    # Subtest: Raffle premyo is never rewritten into preview even after a room discussion
    ok 277 - Raffle premyo is never rewritten into preview even after a room discussion
      ---
      duration_ms: 1.162029
      type: 'test'
      ...
    # Subtest: Near-confidence browser recognition alternative can recover preview
    ok 278 - Near-confidence browser recognition alternative can recover preview
      ---
      duration_ms: 2.215174
      type: 'test'
      ...
    # Subtest: Dictation remains editable and never autosends corrected Taglish speech
    ok 279 - Dictation remains editable and never autosends corrected Taglish speech
      ---
      duration_ms: 0.868588
      type: 'test'
      ...
    # Subtest: Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
    ok 280 - Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
      ---
      duration_ms: 4.370738
      type: 'test'
      ...
    # Subtest: Mandarin voice speech stays untranslated and unmodified by Taglish terms
    ok 281 - Mandarin voice speech stays untranslated and unmodified by Taglish terms
      ---
      duration_ms: 3.592837
      type: 'test'
      ...
    # Subtest: Full shade amenity question is not silently converted into Pool Shade
    ok 282 - Full shade amenity question is not silently converted into Pool Shade
      ---
      duration_ms: 3.251043
      type: 'test'
      ...
    # Subtest: Taglish on a recording-capable Edge desktop defaults to accurate audio STT
    ok 283 - Taglish on a recording-capable Edge desktop defaults to accurate audio STT
      ---
      duration_ms: 39.304778
      type: 'test'
      ...
    # Subtest: General accurate transcription respects arbitrary words instead of dictionary substitutions
    ok 284 - General accurate transcription respects arbitrary words instead of dictionary substitutions
      ---
      duration_ms: 7.568411
      type: 'test'
      ...
    # Subtest: Automatic language prioritizes multilingual Gemini recording over legacy fast mode
    ok 285 - Automatic language prioritizes multilingual Gemini recording over legacy fast mode
      ---
      duration_ms: 35.193446
      type: 'test'
      ...
    # Subtest: English can explicitly enable accurate audio transcription without forcing Taglish corrections
    ok 286 - English can explicitly enable accurate audio transcription without forcing Taglish corrections
      ---
      duration_ms: 3.921011
      type: 'test'
      ...
    # Subtest: A different spoken language never requires a UI language choice
    ok 287 - A different spoken language never requires a UI language choice
      ---
      duration_ms: 0.625431
      type: 'test'
      ...
    # Subtest: Changing input provider ends current hands-free session safely
    ok 288 - Changing input provider ends current hands-free session safely
      ---
      duration_ms: 0.572411
      type: 'test'
      ...
    # Subtest: Existing alternate languages, transcript review, and cloud voice controls remain
    ok 289 - Existing alternate languages, transcript review, and cloud voice controls remain
      ---
      duration_ms: 0.227592
      type: 'test'
      ...
    # Subtest: Silent microphone does not spend credits or send transcription request
    ok 290 - Silent microphone does not spend credits or send transcription request
      ---
      duration_ms: 3.447168
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 291 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.324644
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 292 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.281845
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 293 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.655266
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 294 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 2.142004
      type: 'test'
      ...
    # Subtest: DM-01 shared semantic tokens describe soft navy/slate dark and original light palette
    ok 295 - DM-01 shared semantic tokens describe soft navy/slate dark and original light palette
      ---
      duration_ms: 1.348549
      type: 'test'
      ...
    # Subtest: DM-01 tokens loaded once after current theme on all eight signed-in Customer pages
    ok 296 - DM-01 tokens loaded once after current theme on all eight signed-in Customer pages
      ---
      duration_ms: 2.005308
      type: 'test'
      ...
    # Subtest: DM-01 leaves public landing and other account pages outside Customer theme foundation
    ok 297 - DM-01 leaves public landing and other account pages outside Customer theme foundation
      ---
      duration_ms: 0.53793
      type: 'test'
      ...
    # Subtest: DM-01 current Customer background, cards, navbar, buttons use semantic variables with safe light fallbacks
    ok 298 - DM-01 current Customer background, cards, navbar, buttons use semantic variables with safe light fallbacks
      ---
      duration_ms: 0.296576
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 299 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 1.113156
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 300 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.015709
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 301 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.581084
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 302 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.393663
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 303 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 0.997832
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 304 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.457499
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 305 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.328334
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 306 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 2.642868
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 307 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.012939
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 308 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.688341
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 309 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.822618
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 310 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 4.519597
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 311 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.679052
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 312 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.052845
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 313 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.471239
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 314 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.35244
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 315 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.578565
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 316 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.798932
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 317 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.340533
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 318 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.256957
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 319 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.168564
      type: 'test'
      ...
    # Subtest: UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
    ok 320 - UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
      ---
      duration_ms: 1.128198
      type: 'test'
      ...
    # Subtest: UI-43 compact accommodation rows are collapsed and keep all original actions
    ok 321 - UI-43 compact accommodation rows are collapsed and keep all original actions
      ---
      duration_ms: 13.176
      type: 'test'
      ...
    # Subtest: UI-43 tap / keyboard button behavior allows only one expanded room
    ok 322 - UI-43 tap / keyboard button behavior allows only one expanded room
      ---
      duration_ms: 0.905673
      type: 'test'
      ...
    # Subtest: UI-43 responsive change preserves desktop layout and restores compact state
    ok 323 - UI-43 responsive change preserves desktop layout and restores compact state
      ---
      duration_ms: 0.846424
      type: 'test'
      ...
    # Subtest: UI-43 AI deep link automatically expands its requested accommodation
    ok 324 - UI-43 AI deep link automatically expands its requested accommodation
      ---
      duration_ms: 0.794716
      type: 'test'
      ...
    # Subtest: UI-43 desktop renders full cards without visible accordion controls
    ok 325 - UI-43 desktop renders full cards without visible accordion controls
      ---
      duration_ms: 0.800164
      type: 'test'
      ...
    # Subtest: UI-43 category filters and existing gallery enhancer remain in original flow
    ok 326 - UI-43 category filters and existing gallery enhancer remain in original flow
      ---
      duration_ms: 0.231768
      type: 'test'
      ...
    # Subtest: DM-03 last stylesheet on all signed-in Customer pages only
    ok 327 - DM-03 last stylesheet on all signed-in Customer pages only
      ---
      duration_ms: 2.774005
      type: 'test'
      ...
    # Subtest: DM-03 exclusively screen-only, dark-theme, Customer-scoped, balanced CSS
    ok 328 - DM-03 exclusively screen-only, dark-theme, Customer-scoped, balanced CSS
      ---
      duration_ms: 4.932072
      type: 'test'
      ...
    # Subtest: DM-03 includes all Customer screens and status-safe dialogs
    ok 329 - DM-03 includes all Customer screens and status-safe dialogs
      ---
      duration_ms: 0.472241
      type: 'test'
      ...
    # Subtest: DM-03 dark primary buttons and readable text meet WCAG AA contrast
    ok 330 - DM-03 dark primary buttons and readable text meet WCAG AA contrast
      ---
      duration_ms: 0.582707
      type: 'test'
      ...
    # Subtest: DM-03 no receipt print overrides; original print rules remain white
    ok 331 - DM-03 no receipt print overrides; original print rules remain white
      ---
      duration_ms: 0.39189
      type: 'test'
      ...
    # Subtest: DM-02 all signed-in Customer pages restore theme before CSS and use one shared toggle style
    ok 332 - DM-02 all signed-in Customer pages restore theme before CSS and use one shared toggle style
      ---
      duration_ms: 2.426993
      type: 'test'
      ...
    # Subtest: DM-02 responsive toggle remains after Profile before Logout and is keyboard-focusable
    ok 333 - DM-02 responsive toggle remains after Profile before Logout and is keyboard-focusable
      ---
      duration_ms: 0.400132
      type: 'test'
      ...
    # Subtest: DM-02 defaults to Light, adds exactly one button, persists Dark and restores Light
    ok 334 - DM-02 defaults to Light, adds exactly one button, persists Dark and restores Light
      ---
      duration_ms: 1.147868
      type: 'test'
      ...
    # Subtest: DM-02 saved Dark state restores before nav exists and syncs across tabs
    ok 335 - DM-02 saved Dark state restores before nav exists and syncs across tabs
      ---
      duration_ms: 0.55803
      type: 'test'
      ...
    # Subtest: DM-02 unavailable localStorage does not break theme switch or booking routes
    ok 336 - DM-02 unavailable localStorage does not break theme switch or booking routes
      ---
      duration_ms: 0.664851
      type: 'test'
      ...
    # Subtest: HK-46 Manager screen has resort logo, quick navigation, filtering and visible task counts
    ok 337 - HK-46 Manager screen has resort logo, quick navigation, filtering and visible task counts
      ---
      duration_ms: 0.937421
      type: 'test'
      ...
    # Subtest: HK-46 Manager image must be signed and reviewed before a separate Verify Ready
    ok 338 - HK-46 Manager image must be signed and reviewed before a separate Verify Ready
      ---
      duration_ms: 1.547239
      type: 'test'
      ...
    # Subtest: HK-46 Housekeeping can select camera photo and must upload before marking Cleaned
    ok 339 - HK-46 Housekeeping can select camera photo and must upload before marking Cleaned
      ---
      duration_ms: 0.202715
      type: 'test'
      ...
    # Subtest: HK-46 backend proof routes are protected by signed role middleware
    ok 340 - HK-46 backend proof routes are protected by signed role middleware
      ---
      duration_ms: 0.263747
      type: 'test'
      ...
    # Subtest: HK-46 task state updates require proof and Manager review without changing availability
    ok 341 - HK-46 task state updates require proof and Manager review without changing availability
      ---
      duration_ms: 0.301895
      type: 'test'
      ...
    # Subtest: HK-46 JS files parse and all exact versioned frontend resources exist
    ok 342 - HK-46 JS files parse and all exact versioned frontend resources exist
      ---
      duration_ms: 0.798863
      type: 'test'
      ...
    # Subtest: Manager sees verified housekeeping staff without exposing contact details
    ok 343 - Manager sees verified housekeeping staff without exposing contact details
      ---
      duration_ms: 43.184432
      type: 'test'
      ...
    # Subtest: Only completed reservation items without tasks appear in Manager candidate list
    ok 344 - Only completed reservation items without tasks appear in Manager candidate list
      ---
      duration_ms: 5.789604
      type: 'test'
      ...
    # Subtest: Manager creates a task for a completed reservation item
    ok 345 - Manager creates a task for a completed reservation item
      ---
      duration_ms: 13.589262
      type: 'test'
      ...
    # Subtest: Uncompleted reservation cannot create a cleaning task
    ok 346 - Uncompleted reservation cannot create a cleaning task
      ---
      duration_ms: 4.351759
      type: 'test'
      ...
    # Subtest: Duplicate cleaning task for same reservation item is rejected
    ok 347 - Duplicate cleaning task for same reservation item is rejected
      ---
      duration_ms: 15.559177
      type: 'test'
      ...
    # Subtest: Unknown or disabled staff cannot be assigned a new task
    ok 348 - Unknown or disabled staff cannot be assigned a new task
      ---
      duration_ms: 3.459447
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 349 - Invalid task creation request is blocked
      ---
      duration_ms: 2.806414
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 350 - Invalid task creation request is blocked
      ---
      duration_ms: 7.141459
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 351 - Invalid task creation request is blocked
      ---
      duration_ms: 5.819048
      type: 'test'
      ...
    # Subtest: Housekeeping sees only their own assigned tasks
    ok 352 - Housekeeping sees only their own assigned tasks
      ---
      duration_ms: 8.532863
      type: 'test'
      ...
    # Subtest: Only assigned Housekeeping can start and mark cleaned
    ok 353 - Only assigned Housekeeping can start and mark cleaned
      ---
      duration_ms: 24.756933
      type: 'test'
      ...
    # Subtest: Cannot mark task cleaned without starting
    ok 354 - Cannot mark task cleaned without starting
      ---
      duration_ms: 7.97647
      type: 'test'
      ...
    # Subtest: Stale version blocks simultaneous task update
    ok 355 - Stale version blocks simultaneous task update
      ---
      duration_ms: 6.010326
      type: 'test'
      ...
    # Subtest: Manager may reassign task before cleaning starts only
    ok 356 - Manager may reassign task before cleaning starts only
      ---
      duration_ms: 5.753099
      type: 'test'
      ...
    # Subtest: Manager cannot reassign after cleaning has started
    ok 357 - Manager cannot reassign after cleaning has started
      ---
      duration_ms: 4.191539
      type: 'test'
      ...
    # Subtest: Manager verification is blocked before cleaning
    ok 358 - Manager verification is blocked before cleaning
      ---
      duration_ms: 3.113716
      type: 'test'
      ...
    # Subtest: Manager cannot verify as ready while the accommodation has checked-in guest
    ok 359 - Manager cannot verify as ready while the accommodation has checked-in guest
      ---
      duration_ms: 9.599259
      type: 'test'
      ...
    # Subtest: Manager verifies cleaned task without altering booking availability
    ok 360 - Manager verifies cleaned task without altering booking availability
      ---
      duration_ms: 9.306508
      type: 'test'
      ...
    # Subtest: Housekeeping token cannot perform Manager verification
    ok 361 - Housekeeping token cannot perform Manager verification
      ---
      duration_ms: 6.777912
      type: 'test'
      ...
    # Subtest: Manager token cannot start Housekeeping task
    ok 362 - Manager token cannot start Housekeeping task
      ---
      duration_ms: 2.682918
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 363 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 5.245906
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 364 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 1.136
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 365 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 1.100346
      type: 'test'
      ...
    # Subtest: Missing and forged tokens reach no database queries
    ok 366 - Missing and forged tokens reach no database queries
      ---
      duration_ms: 2.276136
      type: 'test'
