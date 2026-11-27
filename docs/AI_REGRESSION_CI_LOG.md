# AI Mock Regression — testing branch

Source commit: ef081ffcc842da839ca4b5ac258820b465ecfead
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-81 reports retain both paid-charge figures in one card, not the three removed cards
    ok 1 - UI-81 reports retain both paid-charge figures in one card, not the three removed cards
      ---
      duration_ms: 1.04881
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.388275
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 34.64742
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 1.569038
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.529576
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 4.504513
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.582933
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 1.589875
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 0.259275
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 1.033069
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 126.052982
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 13.119249
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 6.553422
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 11.167197
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 18.529661
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 9.812806
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 133.054305
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 19.243615
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.475689
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 5.580712
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 30.47896
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 6.887069
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 6.463667
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 4.704096
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 11.807064
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 5.33195
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 7.008524
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 9.017738
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 9.460055
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 8.113263
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 6.561029
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 7.42205
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 5.799252
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 4.505456
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 6.439335
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.842337
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 3.512081
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 8.142241
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 7.938781
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 13.966424
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 13.987243
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 6.51305
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.994469
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 2.153637
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 9.181733
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 31.142185
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 3.510643
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 6.32993
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 16.434282
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 4.11997
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 3.495631
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 3.705116
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 706.374949
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.307018
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.093023
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.827027
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.306822
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 8.201008
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.493229
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.673049
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.591636
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 3.111378
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.159216
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.682215
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 3.212038
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.812294
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 3.127472
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.486263
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 2.215965
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 5.231828
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.569497
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 3.615497
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.924533
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.124555
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 6.006843
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.496919
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 2.581263
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.9989
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.961027
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 2.761697
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.58297
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.723162
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.661801
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.538661
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 3.026848
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.649594
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.715192
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.599362
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.195997
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 5.266042
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.177631
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.704857
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 2.248881
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.07426
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.047152
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 5.669812
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.284441
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 2.063264
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.986021
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.859443
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 2.110179
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.7995
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 2.154701
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.22696
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.036581
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.507396
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.86155
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.754364
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.901629
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.784501
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.782135
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.74931
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.951751
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.086545
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.136364
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.525821
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 2.129986
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.794081
      type: 'test'
      ...
    # Subtest: Client-verified Wi-Fi, no pets and outside food policies use zero credits
    ok 119 - Client-verified Wi-Fi, no pets and outside food policies use zero credits
      ---
      duration_ms: 12.144904
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.07105
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 13.779355
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 2.489051
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 3.726988
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.625772
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 4.511636
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.849395
      type: 'test'
      ...
    # Subtest: AI-111 explicit cottage amenity question overrides previous room
    ok 127 - AI-111 explicit cottage amenity question overrides previous room
      ---
      duration_ms: 4.566411
      type: 'test'
      ...
    # Subtest: FINAL-B1 bedroom and bed counts plus amenities override old accommodation focus
    ok 128 - FINAL-B1 bedroom and bed counts plus amenities override old accommodation focus
      ---
      duration_ms: 6.31287
      type: 'test'
      ...
    # Subtest: FINAL-B1 structural counts remain distinct from inventory counts
    ok 129 - FINAL-B1 structural counts remain distinct from inventory counts
      ---
      duration_ms: 0.543032
      type: 'test'
      ...
    # Subtest: FINAL-B2 cottage switch answers every requested amenity including bed presence
    ok 130 - FINAL-B2 cottage switch answers every requested amenity including bed presence
      ---
      duration_ms: 2.401019
      type: 'test'
      ...
    # Subtest: FINAL-D1 voice recommendation with rate uses guest count and overnight pricing
    ok 131 - FINAL-D1 voice recommendation with rate uses guest count and overnight pricing
      ---
      duration_ms: 2.919055
      type: 'test'
      ...
    # Subtest: FINAL-D2 mixed private bathroom and free Wi-Fi follow-up keeps verified room context
    ok 132 - FINAL-D2 mixed private bathroom and free Wi-Fi follow-up keeps verified room context
      ---
      duration_ms: 6.959821
      type: 'test'
      ...
    # Subtest: FINAL-D2 mixed policy and amenity questions never invent stale or ambiguous room details
    ok 133 - FINAL-D2 mixed policy and amenity questions never invent stale or ambiguous room details
      ---
      duration_ms: 2.177677
      type: 'test'
      ...
    # Subtest: FINAL-D3 Spanish pets and parking both answered after English room discussion
    ok 134 - FINAL-D3 Spanish pets and parking both answered after English room discussion
      ---
      duration_ms: 2.544327
      type: 'test'
      ...
    # Subtest: QA-123 fresh or reset reservation recall asks for details without generic previews
    ok 135 - QA-123 fresh or reset reservation recall asks for details without generic previews
      ---
      duration_ms: 4.987463
      type: 'test'
      ...
    # Subtest: QA-124 same-session recall keeps booking context without an unchecked replacement card
    ok 136 - QA-124 same-session recall keeps booking context without an unchecked replacement card
      ---
      duration_ms: 2.059846
      type: 'test'
      ...
    # Subtest: QA-123 recall-shaped prompt injection remains blocked
    ok 137 - QA-123 recall-shaped prompt injection remains blocked
      ---
      duration_ms: 1.821092
      type: 'test'
      ...
    # Subtest: QA-129 broad FAQ groups identical numbered variants and keeps changed rates separate
    ok 138 - QA-129 broad FAQ groups identical numbered variants and keeps changed rates separate
      ---
      duration_ms: 2.436375
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 139 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.634089
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 140 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.451594
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    not ok 141 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 0.909592
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-chat-bubble-ui38.test.js:34:1'
      failureType: 'testCodeFailure'
      error: 'landing.html'
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <!-- ======================================================
              PUBLIC LANDING PAGE
              File: frontend/customerHTML/landing.html
              Purpose:
              - First page visitors see before login/register
              - Shows resort introduction, facilities, policies, map, and contact
              - Includes clickable Resort Showcase image gallery
              - Does not affect customer dashboard, booking, payment, or admin features
            ======================================================= -->
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Arvic Seaside Beach Resort and Hotel</title>
            <!-- Arvic Seaside: square brand favicon for browser tabs and Google Search. -->
            <!-- Google Search recognizes PPM as a favicon format. Browser SVG remains available. -->
            <link rel="icon" type="image/x-portable-pixmap" sizes="96x96" href="https://arvicseasideresort.com/favicon.ppm" />
            <link rel="icon" type="image/svg+xml" sizes="any" href="../favicon.svg" />
            <link rel="canonical" href="https://arvicseasideresort.com/" />
            <meta property="og:image" content="https://arvicseasideresort.com/images/arvic-logo.png" />
        
            <!-- ======================================================
              SHARED GLOBAL CSS
              Purpose:
              - Loads shared styles used by the whole frontend
            ======================================================= -->
            <link rel="stylesheet" href="../sharedCSS/global.css" />
        
            <!-- ======================================================
              LANDING PAGE CSS
              Purpose:
              - Loads landing-page-only styles
            ======================================================= -->
            <link rel="stylesheet" href="../customerCSS/landing.css?v=20261127-ui130" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
            <!-- UI-37: Reuse Customer chatbot visuals on the public landing page. -->
            <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261126-ui96" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261127-qa124-release" />
            <link rel="stylesheet" href="../sharedCSS/ai-concierge-guide-ui48.css?v=20261127-qa124-release" />
        </head>
        
          <body class="customer-manager-tone" data-ai-chat-surface="public">
            <!-- ======================================================
              LANDING NAVBAR
              Purpose:
              - Shows resort logo
              - Provides section links
              - Shows Login and Register buttons
              - Burger menu works on mobile through landing.js
            ======================================================= -->
            <header class="landing-navbar">
              <!-- UI-32: Canonical landing file path works on Vercel root rewrite AND local Live Server. -->
              <a href="../customerHTML/landing.html" class="landing-logo" aria-label="Arvic Seaside — Landing Home">
                <img src="../images/arvic-logo.png" alt="Arvic Seaside Logo" />
                <span>Arvic Seaside</span>
              </a>
        
              <button
                id="landingMenuToggle"
                class="landing-menu-toggle"
                type="button"
                aria-label="Open navigation menu"
              >
                ☰
              </button>
        
              <nav id="landingNavLinks" class="landing-nav-links">
                <a href="#about">About</a>
                <a href="#facilities">Facilities</a>
                <a href="#policies">Policies</a>
                <a href="#location">Location</a>
                <a href="../authHTML/login.html" class="nav-login">Login</a>
                <a href="../authHTML/register.html" class="nav-register">Register</a>
              </nav>
            </header>
        
            <!-- ======================================================
              HERO SECTION
              Purpose:
              - Shows drone video background
              - Introduces the resort
              - Provides main call-to-action buttons
            ======================================================= -->
            <section class="landing-hero">
              <!-- Hero background video -->
              <video class="hero-video" autoplay muted loop playsinline>
                <source src="../videos/drone-landing.mp4" type="video/mp4" />
              </video>
        
              <!-- Dark overlay for better text readability -->
              <div class="landing-hero-overlay"></div>
        
              <!-- Hero text content -->
              <div class="landing-hero-content">
                <span class="hero-badge">
                  Always Open • Beach Resort • Naic, Cavite
                </span>
        
                <h1>Experience a relaxing seaside getaway at Arvic Seaside.</h1>
        
                <p>
                  Discover a peaceful resort destination for family outings, overnight
                  stays, cottages, rooms, and special events at Arvic Seaside Beach
                  Resort and Hotel.
                </p>
        
                <div class="hero-buttons">
                  <a href="../authHTML/login.html" class="btn-main">Book Your Stay</a>
                  <a href="#about" class="btn-outline">Explore Resort</a>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
              MAIN LANDING CONTENT
              Purpose:
              - Groups all landing page sections
            ======================================================= -->
            <main>
              <!-- ======================================================
                ABOUT / INTRODUCTION SECTION
                Purpose:
                - Shows short resort description and address
              ======================================================= -->
              <section id="about" class="landing-section about-section">
                <div class="section-title">
                  <span>Welcome to Arvic Seaside</span>
                  <h2>A beachfront destination made for relaxation and gatherings.</h2>
                </div>
        
                <p class="about-text">
                  Arvic Seaside Beach Resort and Hotel is located at
                  <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong
                  >. The resort offers accommodations and facilities for guests who want
                  a comfortable stay, family bonding, swimming, events, and a relaxing
                  seaside experience.
                </p>
              </section>
        
              <!-- ======================================================
                RESORT SHOWCASE / CLICKABLE GALLERY SECTION
                Purpose:
                - Shows resort showcase cards
                - Each card opens its own separate modal
                - Drone card opens MP4 video
                - Image cards use Next/Previous inside the clicked showcase category only
        
                Important:
                - Separate multiple image paths using |
                - Example:
                  data-gallery-images="../images/pool1.jpg|../images/pool2.jpg"
                - Replace example image paths with your actual uploaded resort photos
              ======================================================= -->
              <section class="landing-section showcase-section">
                <div class="section-title">
                  <span>Resort Showcase</span>
                  <h2>See the beauty of the resort before you book.</h2>
                </div>
        
                <div class="showcase-grid">
                  <!-- ======================================================
                    SHOWCASE CARD 1 - DRONE VIEW VIDEO
                    Purpose:
                    - Uses MP4 video instead of image
                    - Opens drone video inside the modal when clicked
                    - Does not use next/previous because this is a single video
                  ======================================================= -->
                  <article
                    class="showcase-card large-card js-gallery-card"
                    role="button"
                    tabindex="0"
                    aria-label="Open Drone View video"
                    data-gallery-type="video"
                    data-gallery-title="Drone View"
                    data-gallery-description="Watch the drone view of the resort area and seaside atmosphere."
                    data-gallery-video="../videos/drone-landing.mp4" type="video/mp4"
                  >
                    <!-- Drone View Video Thumbnail in Landing Page -->
                    <video class="showcase-video" autoplay muted loop playsinline>
                      <source src="../videos/drone-landing.mp4" type="video/mp4" />
                    </video>
        
                    <div class="showcase-card-content">
                      <span class="showcase-view-label">Watch Video</span>
                      <h3>Drone View</h3>
                      <p>
                        Watch a drone view of the resort area and seaside atmosphere.
                      </p>
                    </div>
                  </article>
        
                  <!-- ======================================================
                    SHOWCASE CARD 2 - SWIMMING AREA
                    Purpose:
                    - Opens only pool/swimming photos
                    - Next/Previous will stay inside this pool gallery only
                  ======================================================= -->
                  <article
                    class="showcase-card js-gallery-card"
                    role="button"
                    tabindex="0"
                    aria-label="Open Swimming Area gallery"
                    data-gallery-title="Swimming Area"
                    data-gallery-description="Relax and enjoy the pool with your family and friends."
                    data-gallery-images="../images/landing/pool-landing.jpg|../images/landing/pool-landing-2.jpg"
                  >
                    <!-- Swimming Area Thumbnail Photo in Landing Page-->
                    <img
                      src="../images/landing/pool-landing.jpg"
                      alt="Swimming pool area"
                    />
        
                    <div class="showcase-card-content">
                      <span class="showcase-view-label">View Photos</span>
                      <h3>Swimming Area</h3>
                      <p>Relax and enjoy the pool with your family and friends.</p>
                    </div>
                  </article>
        
                  <!-- ======================================================
                    SHOWCASE CARD 3 - BEACH SHOWCASE
                    Purpose:
                    - Opens only beach/seaside photos
                    - Next/Previous will stay inside this beach gallery only
                    - Uses 4 beach image slots from beach-landing to beach-landing-4
                  ======================================================= -->
                  <article
                    class="showcase-card js-gallery-card"
                    role="button"
                    tabindex="0"
                    aria-label="Open Beach Showcase gallery"
                    data-gallery-title="Beach Showcase"
                    data-gallery-description="Enjoy the relaxing beach and seaside view of Arvic Seaside."
                    data-gallery-images="../images/landing/beach-landing.jpg|../images/landing/beach-landing-2.jpg|../images/landing/beach-landing-3.jpg|../images/landing/beach-landing-4.jpg"
                  >
                    <!-- Beach Showcase Thumbnail Photo in Landing Page -->
                    <img
                      src="../images/landing/beach-landing.jpg"
                      alt="Beach and seaside view"
                    />
        
                    <div class="showcase-card-content">
                      <span class="showcase-view-label">View Photos</span>
                      <h3>Seaside</h3>
                      <p>Enjoy the relaxing beach and seaside view of the resort.</p>
                    </div>
                  </article>
        
                  <!-- ======================================================
                    SHOWCASE CARD 4 - COMFORTABLE ROOMS
                    Purpose:
                    - Opens only room accommodation photos
                    - Does not include pool or function photos
                  ======================================================= -->
                  <article
                    class="showcase-card js-gallery-card"
                    role="button"
                    tabindex="0"
                    aria-label="Open Comfortable Rooms gallery"
                    data-gallery-title="Comfortable Rooms"
                    data-gallery-description="Stay comfortably with available room accommodations."
                    data-gallery-images="../images/landing/room-landing.jpg|../images/landing/room-landing-2.jpg|../images/landing/room-landing-3.jpg|../images/landing/room-landing-4.jpg"
                  >
        
                  <!-- Comfort Rooms Thumbnail Photo in Landing Page-->
                    <img
                      src="../images/landing/room-landing.jpg"
                      alt="Resort room accommodation"
                    />
        
                    <div class="showcase-card-content">
                      <span class="showcase-view-label">View Photos</span>
                      <h3>Comfortable Rooms</h3>
                      <p>Stay comfortably with available room accommodations.</p>
                    </div>
                  </article>
        
                  <!-- ======================================================
                    SHOWCASE CARD 5 - FUNCTION AREAS
                    Purpose:
                    - Opens only function area/event photos
                    - Does not include pool or room photos
                  ======================================================= -->
                  <article
                    class="showcase-card js-gallery-card"
                    role="button"
                    tabindex="0"
                    aria-label="Open Function Areas gallery"
                    data-gallery-title="Function Areas"
                    data-gallery-description="Ideal for gatherings, celebrations, and private events."
                    data-gallery-images="../images/landing/function-landing.jpg|../images/landing/function-landing-2.jpg"
                  >
                  <!-- Function Areas Thumbnail Photo in Landing Page-->
                    <img
                      src="../images/landing/function-landing.jpg"
                      alt="Function area"
                    />
        
                    <div class="showcase-card-content">
                      <span class="showcase-view-label">View Photos</span>
                      <h3>Function Areas</h3>
                      <p>Ideal for gatherings, celebrations, and private events.</p>
                    </div>
                  </article>
                </div>
        
                <p class="image-note">
                  Note: Click any resort photo to view more images from the same
                  category.
                </p>
              </section>
        
              <!-- ======================================================
                FACILITIES SECTION
                Purpose:
                - Shows resort facilities in simple cards
              ======================================================= -->
              <section id="facilities" class="landing-section facilities-section">
                <div class="section-title">
                  <span>Facilities</span>
                  <h2>Everything guests need for a comfortable resort stay.</h2>
                </div>
        
                <div class="facility-grid">
                  <div class="facility-card">
                    <span>🏖</span>
                    <h3>Seaside Experience</h3>
                    <p>Enjoy the relaxing beach resort atmosphere.</p>
                  </div>
        
                  <div class="facility-card">
                    <span>🏊</span>
                    <h3>Swimming Pool</h3>
                    <p>Perfect for family bonding and group activities.</p>
                  </div>
        
                  <div class="facility-card">
                    <span>🏠</span>
                    <h3>Rooms and Cottages</h3>
                    <p>Choose from available accommodations for your stay.</p>
                  </div>
        
                  <div class="facility-card">
                    <span>🎉</span>
                    <h3>Function Areas</h3>
                    <p>Suitable for events, celebrations, and gatherings.</p>
                  </div>
                </div>
              </section>
        
              <!-- ======================================================
                RESORT POLICIES SECTION
                Purpose:
                - Shows important booking and damage charge reminders
                - Supports panel recommendation for policy reminders
              ======================================================= -->
              <section id="policies" class="landing-section policies-section">
                <div class="section-title">
                  <span>Resort Policies</span>
                  <h2>Please review the important reminders before booking.</h2>
                </div>
        
                <div class="policy-box">
                  <ul>
                    <li>
                      Online reservations require a 50% downpayment of the
                      accommodation price through PayPal. Entrance fees are separate.
                    </li>
                    <li>
                      After PayPal confirms a successful captured payment, the system
                      automatically records the downpayment and confirms the booking.
                      No payment proof upload is required.
                    </li>
                    <li>
                      The remaining accommodation balance, entrance fees, and
                      applicable charges are settled at the resort.
                    </li>
                    <li>
                      Extra person fees may apply depending on accommodation policy.
                    </li>
                    <li>
                      Guests are responsible for damaged items, missing items, stained
                      sheets, towels, or other resort property.
                    </li>
                    <li>
                      Additional charges may be added by the admin or staff before final
                      payment or check-out.
                    </li>
                  </ul>
                </div>
              </section>
        
              <!-- ======================================================
                LOCATION AND CONTACT SECTION
                Purpose:
                - Shows embedded Google Map
                - Shows resort contact information
              ======================================================= -->
              <section id="location" class="landing-section contact-section">
                <div class="section-title">
                  <span>Visit Us</span>
                  <h2>Located in Naic, Cavite and open 24 hours.</h2>
                </div>
        
                <div class="contact-grid">
                  <!-- Google Maps embed -->
                  <div class="contact-card map-card">
                    <iframe
                      src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
                  </div>
        
                  <!-- Resort contact details -->
                  <div class="contact-card">
                    <h3>Arvic Seaside Beach Resort and Hotel</h3>
        
                    <p>
                      <strong>Address:</strong><br />
                      17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite
                    </p>
        
                    <p>
                      <strong>Contact Numbers:</strong><br />
                      0956-912-5625 / 0967-817-0662
                    </p>
        
                    <p>
                      <strong>Email:</strong><br />
                      resortarvicseaside@gmail.com
                    </p>
        
                    <p>
                      <strong>Operating Hours:</strong><br />
                      Always open, Monday to Sunday, 24 hours
                    </p>
        
                    <a
                      href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                      class="btn-main small-btn"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open Google Maps
                    </a>
                  </div>
                </div>
              </section>
        
              <!-- ======================================================
                FINAL CTA SECTION
                Purpose:
                - Encourages visitor to login or register
              ======================================================= -->
              <section class="landing-section final-cta">
                <h2>Ready to plan your resort stay?</h2>
                <p>Create an account or log in to start your reservation.</p>
        
                <div class="hero-buttons">
                  <a href="../authHTML/login.html" class="btn-main">Login</a>
                  <a href="../authHTML/register.html" class="btn-outline dark-outline">
                    Register
                  </a>
                </div>
              </section>
            </main>
        
            <!-- ======================================================
              IMAGE GALLERY MODAL
              Purpose:
              - Opens when a showcase card is clicked
              - Displays selected gallery image or drone video
              - Supports Next, Previous, Close, and keyboard controls
            ======================================================= -->
            <section id="galleryModal" class="gallery-modal" aria-hidden="true">
              <!-- Clickable dark background -->
              <div class="gallery-backdrop" data-gallery-close></div>
        
              <!-- Modal content wrapper -->
              <div
                class="gallery-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="galleryTitle"
              >
                <!-- Close button -->
                <button
                  id="galleryCloseBtn"
                  class="gallery-close-btn"
                  type="button"
                  aria-label="Close gallery"
                >
                  ×
                </button>
        
                <!-- Main media area -->
                <div class="gallery-image-wrap">
                  <button
                    id="galleryPrevBtn"
                    class="gallery-nav-btn gallery-prev-btn"
                    type="button"
                    aria-label="Previous image"
                  >
                    ‹
                  </button>
        
                  <!-- Image viewer used by pool, beach, room, and function galleries -->
                  <img id="galleryImage" src="" alt="Resort gallery image" />
        
                  <!-- Video viewer used by drone showcase -->
                  <video id="galleryVideo" class="gallery-video" controls playsinline>
                    <source id="galleryVideoSource" src="" type="video/mp4" />
                  </video>
        
                  <button
                    id="galleryNextBtn"
                    class="gallery-nav-btn gallery-next-btn"
                    type="button"
                    aria-label="Next image"
                  >
                    ›
                  </button>
                </div>
        
                <!-- Modal text information -->
                <div class="gallery-info">
                  <div>
                    <h3 id="galleryTitle">Resort Gallery</h3>
                    <p id="galleryDescription">
                      View more photos of Arvic Seaside Beach Resort and Hotel.
                    </p>
                  </div>
        
                  <span id="galleryCounter" class="gallery-counter">1 / 1</span>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
              FOOTER
              Purpose:
              - Shows system footer
            ======================================================= -->
            <footer class="landing-footer">
              <p>
                © 2026 Arvic Seaside Beach Resort and Hotel. ArvicSeaside Booking System
                System.
              </p>
            </footer>
        
            <!-- UI-37: Guest inquiries are available without customer login.
                 Only the welcome message/history and booking links differ from Home.
                 No mic control: server-side voice services require authentication. -->
            <button id="aiChatToggle" class="ai-chat-toggle" type="button"
              aria-label="Ask Arvic Seaside AI Chatbot Assistant">Ask AI Chatbot</button>
            <div id="aiChatWindow" class="ai-chat-window" aria-label="Arvic Seaside AI Chatbot Assistant">
              <div class="ai-chat-header">
                <div class="ai-assistant-brand">
                  <span class="ai-assistant-mark" aria-hidden="true">✦</span>
                  <div class="ai-assistant-heading">
                    <h3>Arvic Seaside Resort AI Assistant</h3>
                    <span class="ai-assistant-caption">Ask about our resort · No login required</span>
                  </div>
                </div>
                <div class="ai-chat-header-actions">
                  <button id="aiNewChatBtn" class="ai-chat-header-btn" title="New Chat" type="button">New</button>
                  <button id="aiChatMaximize" class="ai-chat-header-btn" title="Maximize" type="button">▢</button>
                  <button id="aiChatClose" class="ai-chat-header-btn" title="Close" type="button">&times;</button>
                </div>
              </div>
              <div id="aiChatMessages" class="ai-chat-messages" aria-live="polite"></div>
              <div class="ai-chat-input-area">
                <input type="text" id="aiChatInput"
                  aria-label="Ask a question about Arvic Seaside Resort"
                  maxlength="2000"
                  placeholder="Ask about rooms, rates, cottages, parking..." />
                <button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>
              </div>
            </div>
        
            <!-- ======================================================
              LANDING PAGE JAVASCRIPT
              Purpose:
              - Controls mobile burger menu
              - Controls image gallery modal
              - Reuses the current verified resort AI chat endpoint and safety guards
            ======================================================= -->
            <script src="../sharedJS/api-config.js?v=20261126-auth106"></script>
            <script src="../customerJS/landing.js?v=20261127-ui130"></script>
            <script src="../js/ai-chat.js?v=20261127-qa129-release"></script>
            <script src="../js/ai-chat-polish.js?v=20261126-ui96"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-chat-bubble-ui38.test.js:38:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 142 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.962781
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 143 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.838681
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 144 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.145127
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 145 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.28919
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    not ok 146 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 3.40741
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:63:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /recommendation_cards: recommendationCards/. Input:
        
        '﻿const { GoogleGenAI } = require("@google/genai");\n' +
          'const db = require("../../config/db");\n' +
          'const { generateGemini, geminiPublicError, geminiErrorStatus } = require("./geminiResilience");\n' +
          '// Verified policy knowledge uses no paid Gemini calls or customer booking writes.\n' +
          'const { matchGeneralPolicyQuestion, inferPolicyLanguage, getPolicyReply, policyPromptLines } = require("./resortPolicyKnowledge");\n' +
          'const {\n' +
          '  matchResortInquiry, guessInquiryLanguage, getResortInquiryReply,\n' +
          '  resortInquiryPromptLines, matchVerifiedPetPolicy, verifiedPetPolicyReply,\n' +
          '  matchVerifiedGuestAmenities, verifiedGuestAmenitiesReply,\n' +
          '  matchVerifiedLeisurePolicies, verifiedLeisurePoliciesReply,\n' +
          '  matchUnverifiedResortPolicy, getUnverifiedResortPolicyReply,\n' +
          '  matchVerifiedResortFacilities, verifiedResortFacilitiesReply,\n' +
          '} = require("./resortInquiryKnowledge");\n' +
          'const { validateAiStayWindow, calendarDayDifference, addCalendarDays } = require("./resortStayWindow");\n' +
          'const { normalizeRecentTurns, wantsAccommodationCards, verifiedAccommodationCards, tidyAssistantReply } =\n' +
          '  require("./aiConversationStyle");\n' +
          'const {\n' +
          '  requestedAmenities, amenityReply, multiAmenityReply, resolveAmenityTarget,\n' +
          '} = require("./aiAccommodationAmenities");\n' +
          'const { generalCategoryAmenitiesReply } = require("./aiAccommodationCategoryPolicy");\n' +
          'const { isNaturalRoomDetailsQuestion, naturalRoomDetailsReply } = require("./aiNaturalRoomDetails");\n' +
          'const { isFreeEntranceQuestion, explicitEntranceRoomName, verifiedFreeEntranceReply } = require("./aiAccommodationEntrance");\n' +
          'const { wantsFocusedRoomOverview, focusedRoomOverview } = require("./aiAccommodationDetails");\n' +
          'const { isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,\n' +
          '  requestedCategory, hasCompoundParty } = require("./aiVerifiedPreview");\n' +
          'const { isRoomPaymentInquiry, resolvePaymentRoom, paymentReply } =\n' +
          '  require("./aiFocusedPaymentReply");\n' +
          'const { compoundTopics, compoundRoom, compoundGuestReply,\n' +
          '  asksForAccommodationRecommendation } = require("./aiCompoundGuestInquiry");\n' +
          'const {\n' +
          '  matchAccommodationCountQuestion, countSummary, countReply,\n' +
          '} = require("./aiAccommodationCounts");\n' +
          'const { matchCheapestInquiry, pickCheapestRows, cheapestReply } =\n' +
          '  require("./aiAffordableFollowup");\n' +
          'const { matchRoomPriceFollowup, shortlistRoomFollowup, roomPriceFollowupReply } =\n' +
          '  require("./aiRoomPriceFollowup");\n' +
          'const { isResortQuestion, resortOnlyReply, isExplicitlyUnrelated } = require("./aiResortScopeGuard");\n' +
          'const { normalizeSemanticIntent, canUseSimpleRecommendation } = require("./aiSemanticIntent");\n' +
          'const { scheduleTurn, liveAvailability, validDate } = require("./aiLiveAvailability");\n' +
          'const { isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,\n' +
          '  guestCountQuestion, guestCountFollowUp: pendingGuestRecommendationAnswer,\n' +
          '  guestCountCorrection, recommendationLookupMessage\n' +
          '} = require("./aiRecommendationIntake");\n' +
          'const {\n' +
          '  unknownRecordReply, clarifyAmbiguousResortQuestion,\n' +
          '  matchUnverifiedServiceQuestion, guardUnsupportedPesoClaims,\n' +
          '} = require("./aiGroundedResponseRules");\n' +
          'const {\n' +
          '  matchConciergeGuide, isMixedEntranceAndCorkage, conciergeGuideReply,\n' +
          '  CONTACT_EMAIL,\n' +
          '} = require("./aiConciergeGuidance");\n' +
          'const {\n' +
          '  isCatalogRateOverviewQuestion, catalogRateOverview, personalizedRateOverview,\n' +
          '} = require("./aiCatalogRateGuide");\n' +
          'const {\n' +
          '  isComparisonQuestion, selectComparisonRooms, comparisonReply,\n' +
          '  isPairRecommendationQuestion, pairForRecommendation, pairRecommendation,\n' +
          '} = require("./aiAccommodationComparison");\n' +
          '\n' +
          'const ai = new GoogleGenAI({\n' +
          '  apiKey: process.env.GEMINI_API_KEY,\n' +
          '});\n' +
          '\n' +
          'function normalizeText(value) {\n' +
          '  if (!value) return "";\n' +
          '  return String(value).trim().toLowerCase();\n' +
          '}\n' +
          '\n' +
          'function formatCurrency(value) {\n' +
          '  return Number(value || 0).toLocaleString(undefined, {\n' +
          '    minimumFractionDigits: 2,\n' +
          '    maximumFractionDigits: 2,\n' +
          '  });\n' +
          '}\n' +
          '\n' +
          '// Only show a numeric rate when it is a verified positive DB value.\n' +
          '// Missing/zero/invalid rates must not be advertised as free accommodation.\n' +
          'function formatVerifiedAccommodationPrice(value) {\n' +
          '  if (value === null || value === undefined || String(value).trim() === "") {\n' +
          '    return "Not listed — confirm on booking page";\n' +
          '  }\n' +
          '  const amount = Number(value);\n' +
          '  return Number.isFinite(amount) && amount > 0\n' +
          '    ? "PHP " + formatCurrency(amount)\n' +
          '    : "Not listed — confirm on booking page";\n' +
          '}\n' +
          '\n' +
          'function safeJsonParse(text) {\n' +
          '  try {\n' +
          '    return JSON.parse(text);\n' +
          '  } catch (error) {\n' +
          '    return null;\n' +
          '  }\n' +
          '}\n' +
          '\n' +
          'function extractJsonObject(text) {\n' +
          '  if (!text) return null;\n' +
          '\n' +
          '  const direct = safeJsonParse(text);\n' +
          '  if (direct) return direct;\n' +
          '\n' +
          '  const fencedMatch = String(text).match(/```json\\s*([\\s\\S]*?)```/i);\n' +
          '  if (fencedMatch) {\n' +
          '    const parsed = safeJsonParse(fencedMatch[1].trim());\n' +
          '    if (parsed) return parsed;\n' +
          '  }\n' +
          '\n' +
          '  const genericMatch = String(text).match(/\\{[\\s\\S]*\\}/);\n' +
          '  if (genericMatch) {\n' +
          '    const parsed = safeJsonParse(genericMatch[0]);\n' +
          '    if (parsed) return parsed;\n' +
          '  }\n' +
          '\n' +
          '  return null;\n' +
          '}\n' +
          '\n' +
          'function getNightDifference(checkIn, checkOut) {\n' +
          '  // Calendar-day arithmetic stays stable on both Manila desktops and UTC Render.\n' +
          '  return calendarDayDifference(checkIn, checkOut);\n' +
          '}\n' +
          '\n' +
          'function formatDateOnly(date) {\n' +
          '  const year = date.getFullYear();\n' +
          '  const month = String(date.getMonth() + 1).padStart(2, "0");\n' +
          '  const day = String(date.getDate()).padStart(2, "0");\n' +
          '  return `${year}-${month}-${day}`;\n' +
          '}\n' +
          '\n' +
          "// Use the resort's Philippine calendar date in AI prompts. Hosting servers may\n" +
          '// run on UTC, which can otherwise make "today" and example years inaccurate.\n' +
          'function getResortTodayText() {\n' +
          '  const parts = new Intl.DateTimeFormat("en-US", {\n' +
          '    timeZone: "Asia/Manila",\n' +
          '    year: "numeric",\n' +
          '    month: "2-digit",\n' +
          '    day: "2-digit",\n' +
          '  }).formatToParts(new Date());\n' +
          '  const value = (type) => parts.find((part) => part.type === type)?.value;\n' +
          '  return `${value("year")}-${value("month")}-${value("day")}`;\n' +
          '}\n' +
          '\n' +
          'function addDays(dateString, days) {\n' +
          '  return addCalendarDays(dateString, days);\n' +
          '}\n' +
          '\n' +
          'function cleanContextValue(value) {\n' +
          '  if (value === undefined || value === null) return null;\n' +
          '  if (typeof value === "string" && !value.trim()) return null;\n' +
          '  return value;\n' +
          '}\n' +
          '\n' +
          'function normalizePaymentMethod(value) {\n' +
          '  const text = normalizeText(value);\n' +
          '\n' +
          '  if (!text) return null;\n' +
          '  if (text.includes("paypal")) return "paypal";\n' +
          '  if (text.includes("online")) return "paypal";\n' +
          '  if (text.includes("pay online")) return "paypal";\n' +
          '  if (text.includes("gcash")) return "paypal";\n' +
          '  if (text.includes("cash")) return "cash";\n' +
          '\n' +
          '  return null;\n' +
          '}\n' +
          '\n' +
          'function normalizeLanguageStyle(value) {\n' +
          '  const text = normalizeText(value);\n' +
          '\n' +
          '  if (!text) return null;\n' +
          '  if (text.includes("taglish") || text.includes("filipino")) return "taglish";\n' +
          '  if (text.includes("tagalog")) return "tagalog";\n' +
          '  if (text.includes("bisaya") || text.includes("cebuano") || text.includes("binisaya")) return "bisaya";\n' +
          '  if (text.includes("spanish") || text.includes("español")) return "spanish";\n' +
          '  if (text.includes("mandarin") || text.includes("chinese") ||\n' +
          '      text.includes("中文") || text.includes("普通话")) return "mandarin";\n' +
          '  if (text.includes("japanese")) return "japanese";\n' +
          '  if (text.includes("korean")) return "korean";\n' +
          '  if (text.includes("french")) return "french";\n' +
          '  if (text.includes("german")) return "german";\n' +
          '  if (text.includes("arabic")) return "arabic";\n' +
          '  if (text.includes("english")) return "english";\n' +
          '\n' +
          '  return null;\n' +
          '}\n' +
          '\n' +
          'function normalizeTimeValue(value) {\n' +
          '  const text = String(value || "").trim();\n' +
          '  if (!text) return null;\n' +
          '\n' +
          '  const timeMatch = text.match(/^(\\d{1,2}):(\\d{2})(?::(\\d{2}))?$/);\n' +
          '  if (!timeMatch) return null;\n' +
          '\n' +
          '  let hours = Number(timeMatch[1]);\n' +
          '  const minutes = Number(timeMatch[2]);\n' +
          '  const seconds = Number(timeMatch[3] || 0);\n' +
          '\n' +
          '  if (\n' +
          '    Number.isNaN(hours) ||\n' +
          '    Number.isNaN(minutes) ||\n' +
          '    Number.isNaN(seconds) ||\n' +
          '    hours < 0 ||\n' +
          '    hours > 23 ||\n' +
          '    minutes < 0 ||\n' +
          '    minutes > 59 ||\n' +
          '    seconds < 0 ||\n' +
          '    seconds > 59\n' +
          '  ) {\n' +
          '    return null;\n' +
          '  }\n' +
          '\n' +
          '  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;\n' +
          '}\n' +
          '\n' +
          '// Conversational day/night preference is NOT a custom booking time.\n' +
          '// Preserve it across turns; the secure booking page owns real slot hours.\n' +
          'function normalizeSlotPreference(value) {\n' +
          '  const text = String(value || "").trim().toLowerCase().replace(/[\\s-]+/g, "_");\n' +
          '  if (["day", "day_tour", "morning", "umaga"].includes(text)) return "day_tour";\n' +
          '  if (["night", "overnight", "evening", "gabi"].includes(text)) return "night";\n' +
          '  return null;\n' +
          '}\n' +
          '\n' +
          'function detectLanguageFromMessage(message) {\n' +
          '  const text = normalizeText(message);\n' +
          '  if (!text) return null;\n' +
          '  // Cebuano/Bisaya must not be mistaken for old Taglish chat context.\n' +
          `  // Require distinctive Bisaya words; generic "po" or "ba" aren't enough.\n` +
          '  const bisaya = text.match(/\\b(?:naa|moy|aduna|pila|tagpila|unsa|asa|kanus-a|palihog|diha|dinha|kamo|namo|gikan|daghan|puy-anan|bai|salamat\\s+kaayo)\\b/giu) || [];\n' +
          '  if (bisaya.length >= 2 ||\n' +
          '      (/\\b(?:tagpila|kanus-a|maayong\\s+(?:buntag|udto|hapon|gabii))\\b/iu.test(text)) ||\n' +
          '      (/\\b(?:naa|pila|unsa|asa)\\b/iu.test(text) &&\n' +
          '       /\\b(?:moy|inyo|inyong|ninyo|kamo|diha|pud|gyud|ba|ang|ka)\\b/iu.test(text))) return "bisaya";\n' +
          '  // Clear English questions (including "May I...") must not inherit\n' +
          "  // the previous guest's Taglish preference.\n" +
          '  if (/^(?:may\\s+i\\b|do\\s+you\\b|does\\s+the\\b|is\\s+there\\b|are\\s+there\\b|how\\s+(?:much|many)\\b|what\\s+(?:is|are)\\b)/i.test(text) &&\n' +
          '      !/\\b(?:po|kayo|ba|bang|pwede|puwede|magkano|saan|yung|meron)\\b/i.test(text)) return "english";\n' +
          '  // A bare Filipino slot answer should use Filipino rather than default English.\n' +
          '  if (/^(?:umaga|gabi|day tour po|night po)$/.test(text)) return "tagalog";\n' +
          '\n' +
          '  // Detect other common guest languages from unique scripts first.\n' +
          '  if (/[\\u3040-\\u30ff]/u.test(text)) return "japanese";\n' +
          '  if (/[\\uac00-\\ud7af]/u.test(text)) return "korean";\n' +
          '  if (/[\\u0600-\\u06ff]/u.test(text)) return "arabic";\n' +
          '  if (/\\b(?:bonjour|merci|chambre|réservation|réserver|combien|hôtel|piscine)\\b/iu.test(text)) return "french";\n' +
          '  '... 162618 more characters
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        ﻿const { GoogleGenAI } = require("@google/genai");
        const db = require("../../config/db");
        const { generateGemini, geminiPublicError, geminiErrorStatus } = require("./geminiResilience");
        // Verified policy knowledge uses no paid Gemini calls or customer booking writes.
        const { matchGeneralPolicyQuestion, inferPolicyLanguage, getPolicyReply, policyPromptLines } = require("./resortPolicyKnowledge");
        const {
          matchResortInquiry, guessInquiryLanguage, getResortInquiryReply,
          resortInquiryPromptLines, matchVerifiedPetPolicy, verifiedPetPolicyReply,
          matchVerifiedGuestAmenities, verifiedGuestAmenitiesReply,
          matchVerifiedLeisurePolicies, verifiedLeisurePoliciesReply,
          matchUnverifiedResortPolicy, getUnverifiedResortPolicyReply,
          matchVerifiedResortFacilities, verifiedResortFacilitiesReply,
        } = require("./resortInquiryKnowledge");
        const { validateAiStayWindow, calendarDayDifference, addCalendarDays } = require("./resortStayWindow");
        const { normalizeRecentTurns, wantsAccommodationCards, verifiedAccommodationCards, tidyAssistantReply } =
          require("./aiConversationStyle");
        const {
          requestedAmenities, amenityReply, multiAmenityReply, resolveAmenityTarget,
        } = require("./aiAccommodationAmenities");
        const { generalCategoryAmenitiesReply } = require("./aiAccommodationCategoryPolicy");
        const { isNaturalRoomDetailsQuestion, naturalRoomDetailsReply } = require("./aiNaturalRoomDetails");
        const { isFreeEntranceQuestion, explicitEntranceRoomName, verifiedFreeEntranceReply } = require("./aiAccommodationEntrance");
        const { wantsFocusedRoomOverview, focusedRoomOverview } = require("./aiAccommodationDetails");
        const { isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,
          requestedCategory, hasCompoundParty } = require("./aiVerifiedPreview");
        const { isRoomPaymentInquiry, resolvePaymentRoom, paymentReply } =
          require("./aiFocusedPaymentReply");
        const { compoundTopics, compoundRoom, compoundGuestReply,
          asksForAccommodationRecommendation } = require("./aiCompoundGuestInquiry");
        const {
          matchAccommodationCountQuestion, countSummary, countReply,
        } = require("./aiAccommodationCounts");
        const { matchCheapestInquiry, pickCheapestRows, cheapestReply } =
          require("./aiAffordableFollowup");
        const { matchRoomPriceFollowup, shortlistRoomFollowup, roomPriceFollowupReply } =
          require("./aiRoomPriceFollowup");
        const { isResortQuestion, resortOnlyReply, isExplicitlyUnrelated } = require("./aiResortScopeGuard");
        const { normalizeSemanticIntent, canUseSimpleRecommendation } = require("./aiSemanticIntent");
        const { scheduleTurn, liveAvailability, validDate } = require("./aiLiveAvailability");
        const { isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
          guestCountQuestion, guestCountFollowUp: pendingGuestRecommendationAnswer,
          guestCountCorrection, recommendationLookupMessage
        } = require("./aiRecommendationIntake");
        const {
          unknownRecordReply, clarifyAmbiguousResortQuestion,
          matchUnverifiedServiceQuestion, guardUnsupportedPesoClaims,
        } = require("./aiGroundedResponseRules");
        const {
          matchConciergeGuide, isMixedEntranceAndCorkage, conciergeGuideReply,
          CONTACT_EMAIL,
        } = require("./aiConciergeGuidance");
        const {
          isCatalogRateOverviewQuestion, catalogRateOverview, personalizedRateOverview,
        } = require("./aiCatalogRateGuide");
        const {
          isComparisonQuestion, selectComparisonRooms, comparisonReply,
          isPairRecommendationQuestion, pairForRecommendation, pairRecommendation,
        } = require("./aiAccommodationComparison");
        
        const ai = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
        
        function normalizeText(value) {
          if (!value) return "";
          return String(value).trim().toLowerCase();
        }
        
        function formatCurrency(value) {
          return Number(value || 0).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        
        // Only show a numeric rate when it is a verified positive DB value.
        // Missing/zero/invalid rates must not be advertised as free accommodation.
        function formatVerifiedAccommodationPrice(value) {
          if (value === null || value === undefined || String(value).trim() === "") {
            return "Not listed — confirm on booking page";
          }
          const amount = Number(value);
          return Number.isFinite(amount) && amount > 0
            ? "PHP " + formatCurrency(amount)
            : "Not listed — confirm on booking page";
        }
        
        function safeJsonParse(text) {
          try {
            return JSON.parse(text);
          } catch (error) {
            return null;
          }
        }
        
        function extractJsonObject(text) {
          if (!text) return null;
        
          const direct = safeJsonParse(text);
          if (direct) return direct;
        
          const fencedMatch = String(text).match(/```json\s*([\s\S]*?)```/i);
          if (fencedMatch) {
            const parsed = safeJsonParse(fencedMatch[1].trim());
            if (parsed) return parsed;
          }
        
          const genericMatch = String(text).match(/\{[\s\S]*\}/);
          if (genericMatch) {
            const parsed = safeJsonParse(genericMatch[0]);
            if (parsed) return parsed;
          }
        
          return null;
        }
        
        function getNightDifference(checkIn, checkOut) {
          // Calendar-day arithmetic stays stable on both Manila desktops and UTC Render.
          return calendarDayDifference(checkIn, checkOut);
        }
        
        function formatDateOnly(date) {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          return `${year}-${month}-${day}`;
        }
        
        // Use the resort's Philippine calendar date in AI prompts. Hosting servers may
        // run on UTC, which can otherwise make "today" and example years inaccurate.
        function getResortTodayText() {
          const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          }).formatToParts(new Date());
          const value = (type) => parts.find((part) => part.type === type)?.value;
          return `${value("year")}-${value("month")}-${value("day")}`;
        }
        
        function addDays(dateString, days) {
          return addCalendarDays(dateString, days);
        }
        
        function cleanContextValue(value) {
          if (value === undefined || value === null) return null;
          if (typeof value === "string" && !value.trim()) return null;
          return value;
        }
        
        function normalizePaymentMethod(value) {
          const text = normalizeText(value);
        
          if (!text) return null;
          if (text.includes("paypal")) return "paypal";
          if (text.includes("online")) return "paypal";
          if (text.includes("pay online")) return "paypal";
          if (text.includes("gcash")) return "paypal";
          if (text.includes("cash")) return "cash";
        
          return null;
        }
        
        function normalizeLanguageStyle(value) {
          const text = normalizeText(value);
        
          if (!text) return null;
          if (text.includes("taglish") || text.includes("filipino")) return "taglish";
          if (text.includes("tagalog")) return "tagalog";
          if (text.includes("bisaya") || text.includes("cebuano") || text.includes("binisaya")) return "bisaya";
          if (text.includes("spanish") || text.includes("español")) return "spanish";
          if (text.includes("mandarin") || text.includes("chinese") ||
              text.includes("中文") || text.includes("普通话")) return "mandarin";
          if (text.includes("japanese")) return "japanese";
          if (text.includes("korean")) return "korean";
          if (text.includes("french")) return "french";
          if (text.includes("german")) return "german";
          if (text.includes("arabic")) return "arabic";
          if (text.includes("english")) return "english";
        
          return null;
        }
        
        function normalizeTimeValue(value) {
          const text = String(value || "").trim();
          if (!text) return null;
        
          const timeMatch = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
          if (!timeMatch) return null;
        
          let hours = Number(timeMatch[1]);
          const minutes = Number(timeMatch[2]);
          const seconds = Number(timeMatch[3] || 0);
        
          if (
            Number.isNaN(hours) ||
            Number.isNaN(minutes) ||
            Number.isNaN(seconds) ||
            hours < 0 ||
            hours > 23 ||
            minutes < 0 ||
            minutes > 59 ||
            seconds < 0 ||
            seconds > 59
          ) {
            return null;
          }
        
          return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
        }
        
        // Conversational day/night preference is NOT a custom booking time.
        // Preserve it across turns; the secure booking page owns real slot hours.
        function normalizeSlotPreference(value) {
          const text = String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");
          if (["day", "day_tour", "morning", "umaga"].includes(text)) return "day_tour";
          if (["night", "overnight", "evening", "gabi"].includes(text)) return "night";
          return null;
        }
        
        function detectLanguageFromMessage(message) {
          const text = normalizeText(message);
          if (!text) return null;
          // Cebuano/Bisaya must not be mistaken for old Taglish chat context.
          // Require distinctive Bisaya words; generic "po" or "ba" aren't enough.
          const bisaya = text.match(/\b(?:naa|moy|aduna|pila|tagpila|unsa|asa|kanus-a|palihog|diha|dinha|kamo|namo|gikan|daghan|puy-anan|bai|salamat\s+kaayo)\b/giu) || [];
          if (bisaya.length >= 2 ||
              (/\b(?:tagpila|kanus-a|maayong\s+(?:buntag|udto|hapon|gabii))\b/iu.test(text)) ||
              (/\b(?:naa|pila|unsa|asa)\b/iu.test(text) &&
               /\b(?:moy|inyo|inyong|ninyo|kamo|diha|pud|gyud|ba|ang|ka)\b/iu.test(text))) return "bisaya";
          // Clear English questions (including "May I...") must not inherit
          // the previous guest's Taglish preference.
          if (/^(?:may\s+i\b|do\s+you\b|does\s+the\b|is\s+there\b|are\s+there\b|how\s+(?:much|many)\b|what\s+(?:is|are)\b)/i.test(text) &&
              !/\b(?:po|kayo|ba|bang|pwede|puwede|magkano|saan|yung|meron)\b/i.test(text)) return "english";
          // A bare Filipino slot answer should use Filipino rather than default English.
          if (/^(?:umaga|gabi|day tour po|night po)$/.test(text)) return "tagalog";
        
          // Detect other common guest languages from unique scripts first.
          if (/[\u3040-\u30ff]/u.test(text)) return "japanese";
          if (/[\uac00-\ud7af]/u.test(text)) return "korean";
          if (/[\u0600-\u06ff]/u.test(text)) return "arabic";
          if (/\b(?:bonjour|merci|chambre|réservation|réserver|combien|hôtel|piscine)\b/iu.test(text)) return "french";
          if (/\b(?:guten\s+tag|danke|zimmer|buchung|übernachtung|preise?|wie\s+viel)\b/iu.test(text)) return "german";
        
          // Mandarin characters are a reliable signal even after an English turn.
          if (/[\u3400-\u9FFF]/u.test(text)) return "mandarin";
          // Also identify everyday Romanized Mandarin phrases and booking words.
          if (/\b(?:ni\s*hao(?:\s*ma)?|nihao|xie\s*xie|zaoshang\s*hao|wo\s*xiang\s*(?:yuding|ding)|fangjian|jiudian|dujiacun|yuding|duo\s*shao\s*qian)\b/i.test(text))
            return "mandarin";
        
          // Detect common Spanish resort questions without relying on prior
          // conversation settings. Single "para" is ambiguous with Tagalog.
          if (/[¿¡]/u.test(text) &&
              /\b(?:tienen|tiene|quiero|busco|cu[aá]nto|cuesta|habitaciones?|reserva|precio|piscina|alojamiento)\b/iu.test(text))
            return "spanish";
          const spanishTokens = text.match(/\b(?:hola|habitaciones?|cu[aá]nto|cuesta|precios?|reservar|reservaci[oó]n|disponibles?|personas|noches|gracias|necesito|tenemos|quiero|busco|tienen|buenas|alojamiento)\b/giu) || [];
          if (spanishTokens.length >= 2 ||
              (/\b(?:hola|gracias|habitaciones?|cu[aá]nto|reservaci[oó]n)\b/iu.test(text)
                && spanishTokens.length > 0)) return "spanish";
        
          const tagalogWords = [
            "ako", "ikaw", "siya", "kami", "tayo", "kayo", "po", "opo", "naman",
            "gusto", "pwede", "puwede", "kuwarto", "kwarto", "magkano", "kailan",
            "saan", "petsa", "bayad", "bisita", "ilan", "meron", "wala", "naka",
            "lang", "muna", "nga", "dito", "iyan", "yan", "ito", "para", "pa",
            "paano", "hanggang", "mula", "oras", "may", "ba", "bang", "anong",
            "ano", "pahingi", "pakita", "pwedeng", "niyo", "nyo", "yung", "ilang"
          ];
        
          const englishWords = [
            "room", "booking", "check-in", "check-out", "guest", "payment", "price",
            "available", "recommend", "book", "cash", "online", "view", "aircon",
            "nights", "date", "dates", "how", "where", "what", "time",
            "accommodation", "accommodations", "offer", "have", "need", "please", "do", "can"
          ];
        
          let tagalogScore = 0;
          let englishScore = 0;
        
          // Whole-word matching prevents false Taglish detection from English
          // words containing short syllables like "pa", "po", "lang" or "sa".
          tagalogWords.forEach((word) => {
            if (new RegExp("\\b" + word + "\\b", "i").test(text)) tagalogScore++;
          });
        
          // The official name "Family Room B" must not count as an English
          // sentence when the guest speaks otherwise pure Tagalog. Keep the
          // original message for intent and DB matching; only clean the score.
          const languageScoreText = text.replace(
            /\b(?:family|single|double)\s+room\s+[a-z0-9]+\b/giu, " ");
          englishWords.forEach((word) => {
            if (new RegExp("\\b" + word + "\\b", "i").test(languageScoreText)) englishScore++;
          });
        
          if (tagalogScore >= 2 && englishScore >= 2) return "taglish";
          if (tagalogScore >= 2 && englishScore === 0) return "tagalog";
          if (englishScore >= 2 && tagalogScore === 0) return "english";
          if (tagalogScore >= 1 && englishScore >= 1) return "taglish";
        
          return null;
        }
        
        // Combine details from the current question with useful context from earlier chat turns.
        // An explicit new detail takes priority; otherwise a prior date, guest count or preference is retained.
        function mergeContext(existing = {}, extracted = {}) {
          const slotPreference = normalizeSlotPreference(extracted.slot_preference) ||
            normalizeSlotPreference(existing.slot_preference);
          return {
            // Add the field only when it is known: keep older context shapes compatible.
            ...(slotPreference ? { slot_preference: slotPreference } : {}),
            check_in: cleanContextValue(extracted.check_in) ?? cleanContextValue(existing.check_in),
            check_out: cleanContextValue(extracted.check_out) ?? cleanContextValue(existing.check_out),
            check_in_time:
              normalizeTimeValue(extracted.check_in_time) ||
              normalizeTimeValue(existing.check_in_time) ||
              null,
            check_out_time:
              normalizeTimeValue(extracted.check_out_time) ||
              normalizeTimeValue(existing.check_out_time) ||
              null,
            guests: cleanContextValue(extracted.guests) ?? cleanContextValue(existing.guests),
            bed_count: cleanContextValue(extracted.bed_count) ?? cleanContextValue(existing.bed_count),
            view_type: cleanContextValue(extracted.view_type) ?? cleanContextValue(existing.view_type),
            aircon_type: cleanContextValue(extracted.aircon_type) ?? cleanContextValue(existing.aircon_type),
            bed_type: cleanContextValue(extracted.bed_type) ?? cleanContextValue(existing.bed_type),
            max_price: cleanContextValue(extracted.max_price) ?? cleanContextValue(existing.max_price),
            room_name: cleanContextValue(extracted.room_name) ?? cleanContextValue(existing.room_name),
            room_id: cleanContextValue(extracted.room_id) ?? cleanContextValue(existing.room_id),
            intent: cleanContextValue(extracted.intent) ?? cleanContextValue(existing.intent),
            wants_booking: cleanContextValue(extracted.wants_booking) ?? cleanContextValue(existing.wants_booking),
            language_style:
              normalizeLanguageStyle(extracted.language_style) ||
              normalizeLanguageStyle(existing.language_style) ||
              null,
            payment_method:
              normalizePaymentMethod(extracted.payment_method) ||
              normalizePaymentMethod(existing.payment_method) ||
              null,
          };
        }
        
        function getMissingCoreDetails(context = {}) {
          const missing = [];
          if (!context.check_in) missing.push("check-in date");
          if (!context.check_out) missing.push("check-out date");
          // Exact hours belong to fixed accommodation slots, not custom time requests.
          if ((!context.check_in_time || !context.check_out_time) && !context.slot_preference)
            missing.push("fixed Day Tour (morning) or Night (evening) slot");
          if (!context.guests) missing.push("number of guests");
          return missing;
        }
        
        function hasEnoughForAvailability(context = {}) {
          return Boolean(
            context.check_in &&
              context.check_in_time &&
              context.check_out &&
              context.check_out_time &&
              context.guests
          );
        }
        
        function hasEnoughForBookingPreview(context = {}, chosenRoom = null, nights = 0) {
          return Boolean(
            chosenRoom &&
              context.check_in &&
              context.check_in_time &&
              context.check_out &&
              context.check_out_time &&
              context.guests &&
              nights > 0
          );
        }
        
        // Preliminary AI availability must reflect the active reservation system,
        // never the retired rooms/bookings tables. Final validation always happens
        // again in the secure Customer reservation workflow.
        function isValidAiStayWindow(context) {
          return validateAiStayWindow(context, getResortTodayText()).valid;
        }
        
        // Find available accommodations by capacity and overlapping reservation date/time ranges.
        // These database results inform suggestions only; actual booking creation rechecks conflicts.
        async function getAvailableRooms(checkIn, checkInTime, checkOut, checkOutTime, guests) {
          const [rooms] = await db.promise().query(
            `
            SELECT
              a.id, a.name AS room_name, a.description, a.image, a.amenities,
              a.status, a.max_capacity AS capacity, a.day_price, a.overnight_price,
              a.extended_price, c.name AS category_name
            FROM accommodations a
            JOIN accommodation_categories c ON c.id = a.category_id
            WHERE LOWER(COALESCE(a.status, '')) = 'available'
              AND a.max_capacity >= ?
              AND NOT EXISTS (
                SELECT 1 FROM reservation_items ri
                JOIN reservations r ON r.id = ri.reservation_id
                WHERE ri.accommodation_id = a.id
                  AND LOWER(COALESCE(r.reservation_status, 'pending'))
                    NOT IN ('cancelled', 'rejected', 'completed', 'no_show')
                  AND LOWER(COALESCE(r.payment_status, 'pending'))
                    NOT IN ('rejected', 'refunded')
                  AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?)
                  AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time)
              )
            ORDER BY a.day_price ASC, a.max_capacity ASC
            `,
            [guests, checkOut, checkOutTime, checkIn, checkInTime],
          );
          return rooms;
        }
        
        // Fresh read-only catalog for general accommodation questions. Admin
        // create/edit/status changes are reflected on the NEXT relevant AI request.
        // Never cache this response as a reservation-availability result.
        async function getAccommodationCatalog() {
          const [rows] = await db.promise().query(
            `
            SELECT
              a.id, a.name AS room_name, a.image, a.description, a.amenities, a.status,
              a.max_capacity AS capacity, a.day_price, a.overnight_price,
              a.extended_price, a.free_entrance_pax, c.name AS category_name
            FROM accommodations a
            JOIN accommodation_categories c ON c.id = a.category_id
            ORDER BY a.id DESC
            LIMIT 150
            `,
          );
          return rows;
        }
        
        function isAccommodationInquiry(message, context) {
          const intent = normalizeText(context.intent);
          if (["ask_recommendation", "ask_availability", "ask_price"].includes(intent)) {
            return true;
          }
          if (context.room_name || context.room_id || context.max_price ||
              context.guests || context.wants_booking === true) return true;
          return /room|cottage|accommodat|pavilion|function area|villa|poolside|pool side|capacity|rates?|prices?|amenit|budget|overnight|day tour|kuwarto|kwarto|kubo|kottage|magkano|matutuluyan|房间|客房|住宿|价格|房价|酒店房|habitaci[oó]n|alojamiento|caba[nñ]a/i
            .test(String(message || ""));
        }
        
        function preferredAccommodationType(message, context) {
          const text = normalizeText(String(message || "") + " " + String(context.room_name || ""));
          // A question about BOTH rooms and cottages is not a request to filter out
          // rooms. Keep both categories so the reply can actually compare them.
          const asksForRooms = /\brooms?\b|\bkwarto\b|\bkuwarto\b/.test(text);
          const asksForCottages = /\bcottages?\b|\bkubo\b|\bkottage\b/.test(text);
          if (asksForRooms && asksForCottages) return null;
          if (/\bcottages?\b|\bkubo\b|\bkottage\b/.test(text)) return "cottage";
          if (/\bpavilions?\b/.test(text)) return "pavilion";
