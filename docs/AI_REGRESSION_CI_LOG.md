# AI Mock Regression — testing branch

Source commit: 9b5184ebc10bc9a25cb699c46944ae824c51a8ff
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.15251
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.37312
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 394.985559
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.430581
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.362795
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 2.154085
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.254693
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.097666
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 0.816617
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 0.616526
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 146.685366
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 14.03572
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 4.205966
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 3.209841
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 3.479085
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 2.801718
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 141.264781
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 8.844993
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 2.838734
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 2.714036
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 13.844693
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 3.236271
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 2.371953
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 4.354981
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 10.753791
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 3.592585
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 6.208509
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 4.810895
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 5.124536
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 4.420188
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 4.686629
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 4.688562
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 5.742855
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 3.409886
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 4.549767
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 1.919433
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 1.660013
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 4.655442
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 3.741459
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 13.816541
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 8.680036
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.595382
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.099846
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.367113
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 5.207671
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 13.08417
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 2.654887
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 3.019895
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 3.78837
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 2.83643
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.633145
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 1.82413
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.084414
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.158428
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.177971
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.678348
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.843783
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 3.957784
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.901415
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.15043
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.695095
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 4.786489
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.622851
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 4.262521
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.176438
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.220965
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.003018
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.602807
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.624765
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.88176
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.129138
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.006434
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.706664
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.401535
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 1.879523
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.509527
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 1.649688
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.262488
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.337921
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 1.729547
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.068425
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.149516
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.082106
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 4.734561
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 1.765942
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.01702
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 2.580015
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.560684
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.302777
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.212573
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.629717
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.233242
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.437018
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.440574
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 1.688035
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.405
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.519662
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.293903
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.243898
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.375005
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.161153
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.146061
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.157488
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.529217
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.393963
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.462657
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.705531
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.181384
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.446042
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 3.901689
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.417518
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.756619
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.442487
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.445711
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.582008
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.750018
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.273503
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.752723
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 119 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.760858
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.427466
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 8.416991
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 1.61135
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 2.242918
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 1.677389
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 2.735889
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.152882
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 127 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 0.951729
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 128 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.245148
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 129 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.234514
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 130 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.719222
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 131 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.222356
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 132 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.656596
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 133 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.721143
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 134 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.65231
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 135 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.571799
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 136 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 6.122606
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 137 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.485339
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 138 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 1.667524
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 139 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 0.914904
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 140 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.243982
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 141 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 298.303561
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 142 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.79177
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 143 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.384367
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 144 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 1.39197
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 145 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.350726
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 146 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.441383
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 147 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 3.170101
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 148 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.694403
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 149 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 3.990373
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 150 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.528945
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 151 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.550006
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 152 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.340221
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 153 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.195187
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 154 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.820223
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 155 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.407962
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 156 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.281913
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 157 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.15955
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 158 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.111467
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 159 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.363616
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 160 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.189354
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 161 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.813808
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 162 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.616115
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 163 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.113573
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 164 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.241803
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 165 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.620422
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 166 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.420341
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 167 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.448053
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 168 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.739937
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 169 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.177839
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 170 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 16.067521
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 171 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.468594
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 172 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.258829
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 173 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.236786
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 174 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.238869
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 175 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.212409
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 176 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.402024
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 177 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.642805
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 178 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.812841
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 179 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.168353
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 180 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.311398
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 181 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.471428
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 182 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 2.550531
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 183 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 3.191323
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 184 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 1.905672
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 185 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 0.760262
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 186 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 1.313313
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 187 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.727662
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 188 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.237476
      type: 'test'
      ...
    # Subtest: AI-45 descriptive Filipino recommendations preserve written guest count
    ok 189 - AI-45 descriptive Filipino recommendations preserve written guest count
      ---
      duration_ms: 0.478428
      type: 'test'
      ...
    # Subtest: AI-45 2-to-7 corrections need immediately preceding verified preview
    ok 190 - AI-45 2-to-7 corrections need immediately preceding verified preview
      ---
      duration_ms: 0.532449
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 191 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 3.018589
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 192 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.530998
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 193 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.226611
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 194 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.174192
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 195 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.167932
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 196 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.19307
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 197 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.147441
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 198 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.100461
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 199 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.223886
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 200 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.680228
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 201 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.193751
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 202 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.748484
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 203 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.563546
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 204 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.376756
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 205 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.168343
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 206 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.166981
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 207 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.283866
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 208 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.55105
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 209 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 8.007246
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 210 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.715355
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 211 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.184357
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 212 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.176726
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 213 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.477387
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 214 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.161363
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 215 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.711979
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 216 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.249204
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 217 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.415164
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 218 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 1.501315
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 219 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.294071
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 220 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.111177
      type: 'test'
      ...
    # Subtest: AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
    ok 221 - AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
      ---
      duration_ms: 0.47929
      type: 'test'
      ...
    # Subtest: AI-39 special opening circumstances are qualified, not guaranteed
    ok 222 - AI-39 special opening circumstances are qualified, not guaranteed
      ---
      duration_ms: 0.167021
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 223 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 11.584027
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 224 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.277787
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 225 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 3.152926
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 226 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.565379
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 227 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.442093
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 228 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 0.5859
      type: 'test'
      ...
    # Subtest: AI-39 common opening-days phrasing is resort-relevant without previous chat
    ok 229 - AI-39 common opening-days phrasing is resort-relevant without previous chat
      ---
      duration_ms: 0.854604
      type: 'test'
      ...
    # Subtest: AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
    ok 230 - AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
      ---
      duration_ms: 0.173831
      type: 'test'
      ...
    # Subtest: AI-44 multilingual greetings and clear resort requests pass the scope gate
    ok 231 - AI-44 multilingual greetings and clear resort requests pass the scope gate
      ---
      duration_ms: 0.724478
      type: 'test'
      ...
    # Subtest: WAV audio is transcribed with Gemini but never stored
    ok 232 - WAV audio is transcribed with Gemini but never stored
      ---
      duration_ms: 0.935224
      type: 'test'
      ...
    # Subtest: Invalid format and audio are rejected before invoking Gemini
    ok 233 - Invalid format and audio are rejected before invoking Gemini
      ---
      duration_ms: 0.250566
      type: 'test'
      ...
    # Subtest: No speech from Gemini returns empty transcript
    ok 234 - No speech from Gemini returns empty transcript
      ---
      duration_ms: 0.255674
      type: 'test'
      ...
    # Subtest: Recorded multilingual STT auto-detects language with verified resort vocabulary
    ok 235 - Recorded multilingual STT auto-detects language with verified resort vocabulary
      ---
      duration_ms: 0.277086
      type: 'test'
      ...
    # Subtest: Untrusted voice language header cannot inject transcription prompts
    ok 236 - Untrusted voice language header cannot inject transcription prompts
      ---
      duration_ms: 0.331618
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 237 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 0.833422
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 238 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.174763
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 239 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.187502
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 240 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 11.602816
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 241 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.280401
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 242 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.243225
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 243 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.555394
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 244 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.225519
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 245 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.009778
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 246 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.598871
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 247 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.206951
      type: 'test'
      ...
    # Subtest: Voice toolbar initializes without making backend or speech calls
    ok 248 - Voice toolbar initializes without making backend or speech calls
      ---
      duration_ms: 2.94984
      type: 'test'
      ...
    # Subtest: Dictation records editable text but never automatically submits
    ok 249 - Dictation records editable text but never automatically submits
      ---
      duration_ms: 2.99624
      type: 'test'
      ...
    # Subtest: Live mode sends recognized turn, speaks response, and listens again
    ok 250 - Live mode sends recognized turn, speaks response, and listens again
      ---
      duration_ms: 8.570021
      type: 'test'
      ...
    # Subtest: Mandarin transcript produces Mandarin playback with the device fallback
    ok 251 - Mandarin transcript produces Mandarin playback with the device fallback
      ---
      duration_ms: 1.212651
      type: 'test'
      ...
    # Subtest: Automatic language does not expose a selector or persist a chosen language
    ok 252 - Automatic language does not expose a selector or persist a chosen language
      ---
      duration_ms: 0.647753
      type: 'test'
      ...
    # Subtest: Interrupt stops ongoing TTS and accepts a new voice turn
    ok 253 - Interrupt stops ongoing TTS and accepts a new voice turn
      ---
      duration_ms: 1.87133
      type: 'test'
      ...
    # Subtest: Closing assistant cancels microphone and never sends stale recognized audio
    ok 254 - Closing assistant cancels microphone and never sends stale recognized audio
      ---
      duration_ms: 1.173893
      type: 'test'
      ...
    # Subtest: Permission denial ends live conversation without retry loop
    ok 255 - Permission denial ends live conversation without retry loop
      ---
      duration_ms: 0.693452
      type: 'test'
      ...
    # Subtest: Unsupported speech browser keeps text chat available and disables voice
    ok 256 - Unsupported speech browser keeps text chat available and disables voice
      ---
      duration_ms: 0.820161
      type: 'test'
      ...
    # Subtest: Native recognition and authenticated recording fallback never access payment routes
    ok 257 - Native recognition and authenticated recording fallback never access payment routes
      ---
      duration_ms: 0.415794
      type: 'test'
      ...
    # Subtest: Customer pages load AI chat before interactive voice and include voice styles
    ok 258 - Customer pages load AI chat before interactive voice and include voice styles
      ---
      duration_ms: 0.313521
      type: 'test'
      ...
    # Subtest: Voice origin is marked without pinning a voice language
    ok 259 - Voice origin is marked without pinning a voice language
      ---
      duration_ms: 0.385379
      type: 'test'
      ...
    # Subtest: English prefers an available Natural/Neural voice over basic Google TTS
    ok 260 - English prefers an available Natural/Neural voice over basic Google TTS
      ---
      duration_ms: 0.960944
      type: 'test'
      ...
    # Subtest: English retains Google US English when no enhanced voice exists
    ok 261 - English retains Google US English when no enhanced voice exists
      ---
      duration_ms: 0.610136
      type: 'test'
      ...
    # Subtest: Compact browser voice is identified in visible voice diagnostic
    ok 262 - Compact browser voice is identified in visible voice diagnostic
      ---
      duration_ms: 0.633572
      type: 'test'
      ...
    # Subtest: Taglish prefers locally installed Microsoft Blessica without Azure credentials
    ok 263 - Taglish prefers locally installed Microsoft Blessica without Azure credentials
      ---
      duration_ms: 5.132979
      type: 'test'
      ...
    # Subtest: Spanish and Mandarin keep appropriate browser default-language voices
    ok 264 - Spanish and Mandarin keep appropriate browser default-language voices
      ---
      duration_ms: 0.898349
      type: 'test'
      ...
    # Blessica cloud voice unavailable: Blessica voice returned HTTP 503
    # Subtest: Without Azure credentials, Taglish falls back to an available Filipino browser voice
    ok 265 - Without Azure credentials, Taglish falls back to an available Filipino browser voice
      ---
      duration_ms: 1.357659
      type: 'test'
      ...
    # Subtest: Unavailable Azure returns 503 and falls back to browser without retrying
    ok 266 - Unavailable Azure returns 503 and falls back to browser without retrying
      ---
      duration_ms: 1.457118
      type: 'test'
      ...
    # Subtest: Available Azure Blessica plays MP3 instead of browser TTS
    ok 267 - Available Azure Blessica plays MP3 instead of browser TTS
      ---
      duration_ms: 1.072881
      type: 'test'
      ...
    # Subtest: Voice picker is removed while language and live controls remain
    ok 268 - Voice picker is removed while language and live controls remain
      ---
      duration_ms: 0.72582
      type: 'test'
      ...
    # Subtest: iOS Safari records PCM WAV and reviews transcript without auto-sending
    ok 269 - iOS Safari records PCM WAV and reviews transcript without auto-sending
      ---
      duration_ms: 4.921622
      type: 'test'
      ...
    # Subtest: iOS hands-free turn transcribes after silence and resumes listening
    ok 270 - iOS hands-free turn transcribes after silence and resumes listening
      ---
      duration_ms: 33.061113
      type: 'test'
      ...
    # Subtest: Firefox-like browser without SpeechRecognition can use secure audio capture
    ok 271 - Firefox-like browser without SpeechRecognition can use secure audio capture
      ---
      duration_ms: 3.501468
      type: 'test'
      ...
    # Subtest: iOS Safari chooses enhanced English voice instead of compact/default
    ok 272 - iOS Safari chooses enhanced English voice instead of compact/default
      ---
      duration_ms: 0.648173
      type: 'test'
      ...
    # Subtest: Mobile English fallback uses en-US before speech voices load
    ok 273 - Mobile English fallback uses en-US before speech voices load
      ---
      duration_ms: 0.55252
      type: 'test'
      ...
    # Subtest: Taglish voice recognizes resort Pool Shade even if browser hears full shade
    ok 274 - Taglish voice recognizes resort Pool Shade even if browser hears full shade
      ---
      duration_ms: 1.889077
      type: 'test'
      ...
    # Subtest: Taglish preview / premyo mishearing is corrected only in resort context
    ok 275 - Taglish preview / premyo mishearing is corrected only in resort context
      ---
      duration_ms: 1.35209
      type: 'test'
      ...
    # Subtest: A real prize request stays as premyo without accommodation context
    ok 276 - A real prize request stays as premyo without accommodation context
      ---
      duration_ms: 1.218339
      type: 'test'
      ...
    # Subtest: Raffle premyo is never rewritten into preview even after a room discussion
    ok 277 - Raffle premyo is never rewritten into preview even after a room discussion
      ---
      duration_ms: 1.15881
      type: 'test'
      ...
    # Subtest: Near-confidence browser recognition alternative can recover preview
    ok 278 - Near-confidence browser recognition alternative can recover preview
      ---
      duration_ms: 1.840624
      type: 'test'
      ...
    # Subtest: Dictation remains editable and never autosends corrected Taglish speech
    ok 279 - Dictation remains editable and never autosends corrected Taglish speech
      ---
      duration_ms: 0.651789
      type: 'test'
      ...
    # Subtest: Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
    ok 280 - Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
      ---
      duration_ms: 3.085234
      type: 'test'
      ...
    # Subtest: Mandarin voice speech stays untranslated and unmodified by Taglish terms
    ok 281 - Mandarin voice speech stays untranslated and unmodified by Taglish terms
      ---
      duration_ms: 1.221965
      type: 'test'
      ...
    # Subtest: Full shade amenity question is not silently converted into Pool Shade
    ok 282 - Full shade amenity question is not silently converted into Pool Shade
      ---
      duration_ms: 1.216177
      type: 'test'
      ...
    # Subtest: Taglish on a recording-capable Edge desktop defaults to accurate audio STT
    ok 283 - Taglish on a recording-capable Edge desktop defaults to accurate audio STT
      ---
      duration_ms: 34.175677
      type: 'test'
      ...
    # Subtest: General accurate transcription respects arbitrary words instead of dictionary substitutions
    ok 284 - General accurate transcription respects arbitrary words instead of dictionary substitutions
      ---
      duration_ms: 4.922112
      type: 'test'
      ...
    # Subtest: Automatic language prioritizes multilingual Gemini recording over legacy fast mode
    ok 285 - Automatic language prioritizes multilingual Gemini recording over legacy fast mode
      ---
      duration_ms: 26.899088
      type: 'test'
      ...
    # Subtest: English can explicitly enable accurate audio transcription without forcing Taglish corrections
    ok 286 - English can explicitly enable accurate audio transcription without forcing Taglish corrections
      ---
      duration_ms: 2.956921
      type: 'test'
      ...
    # Subtest: A different spoken language never requires a UI language choice
    ok 287 - A different spoken language never requires a UI language choice
      ---
      duration_ms: 0.4992
      type: 'test'
      ...
    # Subtest: Changing input provider ends current hands-free session safely
    ok 288 - Changing input provider ends current hands-free session safely
      ---
      duration_ms: 0.482755
      type: 'test'
      ...
    # Subtest: Existing alternate languages, transcript review, and cloud voice controls remain
    ok 289 - Existing alternate languages, transcript review, and cloud voice controls remain
      ---
      duration_ms: 0.21982
      type: 'test'
      ...
    # Subtest: Silent microphone does not spend credits or send transcription request
    ok 290 - Silent microphone does not spend credits or send transcription request
      ---
      duration_ms: 1.685902
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 291 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 0.751809
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 292 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.168613
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 293 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.400151
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 294 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.123107
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 295 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 0.907162
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 296 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 0.961574
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 297 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.566321
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 298 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.452049
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 299 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 0.986041
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 300 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.419289
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 301 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.343676
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 302 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 2.685032
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 303 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 1.54489
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 304 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.175525
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 305 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.582755
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 306 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 1.360713
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 307 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 1.361084
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 308 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 0.847312
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 309 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.38644
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 310 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.314812
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 311 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.203127
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 312 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.77944
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 313 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.323386
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 314 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.240962
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 315 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.203035
      type: 'test'
      ...
    # Subtest: UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
    ok 316 - UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
      ---
      duration_ms: 1.375265
      type: 'test'
      ...
    # Subtest: UI-43 compact accommodation rows are collapsed and keep all original actions
    ok 317 - UI-43 compact accommodation rows are collapsed and keep all original actions
      ---
      duration_ms: 16.440621
      type: 'test'
      ...
    # Subtest: UI-43 tap / keyboard button behavior allows only one expanded room
    ok 318 - UI-43 tap / keyboard button behavior allows only one expanded room
      ---
      duration_ms: 0.854764
      type: 'test'
      ...
    # Subtest: UI-43 responsive change preserves desktop layout and restores compact state
    ok 319 - UI-43 responsive change preserves desktop layout and restores compact state
      ---
      duration_ms: 0.698129
      type: 'test'
      ...
    # Subtest: UI-43 AI deep link automatically expands its requested accommodation
    ok 320 - UI-43 AI deep link automatically expands its requested accommodation
      ---
      duration_ms: 0.743847
      type: 'test'
      ...
    # Subtest: UI-43 desktop renders full cards without visible accordion controls
    ok 321 - UI-43 desktop renders full cards without visible accordion controls
      ---
      duration_ms: 0.777137
      type: 'test'
      ...
    # Subtest: UI-43 category filters and existing gallery enhancer remain in original flow
    ok 322 - UI-43 category filters and existing gallery enhancer remain in original flow
      ---
      duration_ms: 0.202894
      type: 'test'
      ...
    # Subtest: UI-42 full chat script remains valid JavaScript and landing fetches fresh version
    ok 323 - UI-42 full chat script remains valid JavaScript and landing fetches fresh version
      ---
      duration_ms: 1.622056
      type: 'test'
      ...
    # Subtest: UI-42 public landing deletes ONLY previously persisted public keys
    ok 324 - UI-42 public landing deletes ONLY previously persisted public keys
      ---
      duration_ms: 2.198482
      type: 'test'
      ...
    # Subtest: UI-42 public chat persists through turns in one page, not reloads or another tab
    ok 325 - UI-42 public chat persists through turns in one page, not reloads or another tab
      ---
      duration_ms: 1.618701
      type: 'test'
      ...
    # Subtest: UI-42 public New Chat resets selected room and pending response generation
    ok 326 - UI-42 public New Chat resets selected room and pending response generation
      ---
      duration_ms: 0.668674
      type: 'test'
      ...
    # Subtest: UI-42 returning from browser back/forward cache reloads the landing page
    ok 327 - UI-42 returning from browser back/forward cache reloads the landing page
      ---
      duration_ms: 0.621293
      type: 'test'
      ...
    # Subtest: UI-42 public chat size never persists, Customer Home chat remains persistent
    ok 328 - UI-42 public chat size never persists, Customer Home chat remains persistent
      ---
      duration_ms: 2.158302
      type: 'test'
      ...
    # Subtest: UI-37 public landing includes a complete accessible AI chat widget
    ok 329 - UI-37 public landing includes a complete accessible AI chat widget
      ---
      duration_ms: 0.849776
      type: 'test'
      ...
    # Subtest: UI-37 guest greeting and stored chat are isolated from customer Home
    ok 330 - UI-37 guest greeting and stored chat are isolated from customer Home
      ---
      duration_ms: 0.255814
      type: 'test'
      ...
    # Subtest: UI-37 public accommodations can be discussed but booking links require login
    ok 331 - UI-37 public accommodations can be discussed but booking links require login
      ---
      duration_ms: 0.207491
      type: 'test'
      ...
    # Subtest: UI-37 existing public chat keeps server-side scope, payload and credit guards
    ok 332 - UI-37 existing public chat keeps server-side scope, payload and credit guards
      ---
      duration_ms: 0.137616
      type: 'test'
      ...
    1..332
    # tests 332
    # suites 0
    # pass 332
    # fail 0
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2912.645707
