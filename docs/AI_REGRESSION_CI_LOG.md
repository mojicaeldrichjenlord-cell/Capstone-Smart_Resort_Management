# AI Mock Regression — testing branch

Source commit: 854f4f60004108e5db7095c1e98b1e61e88003ae
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.698094
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.491165
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 37.384646
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 3.116167
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.500192
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 2.918238
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.323433
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.170468
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 1.039827
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 0.812844
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 141.385444
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 24.693683
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 6.568008
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 8.489488
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 6.260957
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 8.560064
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 69.586638
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 16.458307
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.65676
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 7.448689
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 25.199369
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    not ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 7.290535
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:438:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /rooms, cottages, o function areas/i. Input:
        
        'Ang pinakamurang kuwarto, cottage, o function area po ba ang hinahanap ninyo?'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: 'Ang pinakamurang kuwarto, cottage, o function area po ba ang hinahanap ninyo?'
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:444:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 6.34347
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.501678
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 17.862489
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 8.277544
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 8.48482
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 8.840893
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 10.222057
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 10.393947
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 7.43855
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 9.691479
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 33 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 7.683267
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 34 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.835423
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 35 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.501271
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 36 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 8.76896
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 37 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 6.292485
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 38 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 15.63347
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 39 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 10.256882
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 40 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.658032
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 41 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 10.909498
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 42 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.89487
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 43 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 9.752472
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 44 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 22.51911
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 45 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 4.226876
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 46 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 6.240248
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 47 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 6.587805
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 48 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 6.749006
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 49 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 3.658598
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 50 - English translation route responds with the English text
      ---
      duration_ms: 3.675027
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 51 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 708.064478
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 52 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.497704
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 53 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.964344
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 54 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.597313
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 55 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 5.158812
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 56 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.98399
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 57 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 3.224739
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 58 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.029926
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 59 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 3.133619
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 60 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 3.135683
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 61 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 5.654957
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 62 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 9.849704
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 63 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 4.039096
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 64 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.938345
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 65 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.711052
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 66 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.308752
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 67 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.425075
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 68 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.939364
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 69 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.686927
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 70 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.782616
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 71 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.351101
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 72 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.924176
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 73 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.791502
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 74 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.968909
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 75 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 2.197295
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 76 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.50571
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 77 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.567644
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 78 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 2.569197
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 79 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.720676
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 80 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.828116
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 81 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.708233
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 82 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.436704
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 83 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.633387
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 84 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.7104
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 85 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 7.469258
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 86 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.418036
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 87 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.955614
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 88 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.211193
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 89 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.325012
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 90 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.760791
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 91 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.846411
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 92 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.042025
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 93 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.396896
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 94 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.289356
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 95 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.05035
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 96 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.914016
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 97 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.876627
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 98 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.012821
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 99 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.731867
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 100 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.972415
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 101 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.866578
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 102 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.305445
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 103 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.095304
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 104 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.108398
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 105 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.000858
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 106 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.794814
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 107 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.213995
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 108 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 2.10909
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 109 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 2.073284
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 110 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 3.049602
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 111 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 2.167478
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 112 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 6.027882
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 113 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.067386
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 114 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.359888
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 115 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.952177
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 116 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.902058
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 117 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 5.381187
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 118 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.786055
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 119 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 12.598245
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 120 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 2.45753
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 121 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 3.665851
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 122 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.557205
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 123 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 4.104418
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 124 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 2.030974
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 125 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.918495
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 126 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.407199
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 127 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.944303
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 128 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.910707
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 129 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.083191
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 130 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.442637
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 131 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.537896
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 132 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.154982
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 133 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 1.089591
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 134 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 17.226358
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 135 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 1.020792
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 136 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 6.27929
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 137 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 3.592394
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 138 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 4.804092
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 139 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 29.663032
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 140 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 1.065615
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 141 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.539125
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 142 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.989174
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 143 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.533443
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 144 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.534215
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 145 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.908386
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 146 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 2.721902
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 147 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 10.962486
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 148 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.660921
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 149 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 5.899703
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 150 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.727526
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 151 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.448856
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 152 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 2.580448
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 153 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.630705
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 154 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.45623
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 155 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.272127
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 156 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.177872
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 157 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.49386
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 158 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.294769
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 159 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 5.693469
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 160 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.94438
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 161 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.590914
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 162 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.366883
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 163 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.809298
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 164 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.559152
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 165 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.591653
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 166 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 5.192766
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 167 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.687177
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 168 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 29.340842
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 169 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.700055
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 170 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 4.197882
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 171 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.368216
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 172 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.350132
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 173 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.285482
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 174 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.581925
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 175 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.993001
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 176 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 1.131899
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 177 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.27398
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 178 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.6331
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 179 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.838252
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 180 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 4.109117
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 181 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 3.795573
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 182 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 2.622376
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 183 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 1.115919
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 184 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 2.467768
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 185 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 1.127621
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 186 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.312412
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 187 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 5.380005
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 188 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.908904
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 189 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.281734
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 190 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.393594
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 191 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.382713
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 192 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.430502
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 193 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.287796
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 194 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.203669
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 195 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.464446
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 196 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.60125
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 197 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.280883
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 198 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 1.059724
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 199 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.735971
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 200 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.49385
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 201 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 3.016521
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 202 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.945361
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 203 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.494632
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 204 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 4.267071
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 205 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 16.689709
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 206 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.404658
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 207 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.388904
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 208 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.361805
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 209 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.893495
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 210 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 1.44914
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 211 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.472343
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 212 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.450599
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 213 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.857498
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 214 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.182941
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 215 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.585772
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 216 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.233305
      type: 'test'
      ...
    # Subtest: AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
    ok 217 - AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
      ---
      duration_ms: 1.173075
      type: 'test'
      ...
    # Subtest: AI-39 special opening circumstances are qualified, not guaranteed
    ok 218 - AI-39 special opening circumstances are qualified, not guaranteed
      ---
      duration_ms: 0.321138
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 219 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 17.253729
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 220 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.438176
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 221 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 4.105349
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 222 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.694153
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 223 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.62282
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 224 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 0.695055
      type: 'test'
      ...
    # Subtest: AI-39 common opening-days phrasing is resort-relevant without previous chat
    ok 225 - AI-39 common opening-days phrasing is resort-relevant without previous chat
      ---
      duration_ms: 1.381635
      type: 'test'
      ...
    # Subtest: AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
    ok 226 - AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
      ---
      duration_ms: 0.234497
      type: 'test'
      ...
    # Subtest: AI-44 multilingual greetings and clear resort requests pass the scope gate
    ok 227 - AI-44 multilingual greetings and clear resort requests pass the scope gate
      ---
      duration_ms: 0.941465
      type: 'test'
      ...
    # Subtest: WAV audio is transcribed with Gemini but never stored
    ok 228 - WAV audio is transcribed with Gemini but never stored
      ---
      duration_ms: 1.42764
      type: 'test'
      ...
    # Subtest: Invalid format and audio are rejected before invoking Gemini
    ok 229 - Invalid format and audio are rejected before invoking Gemini
      ---
      duration_ms: 0.366473
      type: 'test'
      ...
    # Subtest: No speech from Gemini returns empty transcript
    ok 230 - No speech from Gemini returns empty transcript
      ---
      duration_ms: 0.428909
      type: 'test'
      ...
    # Subtest: Recorded multilingual STT auto-detects language with verified resort vocabulary
    ok 231 - Recorded multilingual STT auto-detects language with verified resort vocabulary
      ---
      duration_ms: 0.404003
      type: 'test'
      ...
    # Subtest: Untrusted voice language header cannot inject transcription prompts
    ok 232 - Untrusted voice language header cannot inject transcription prompts
      ---
      duration_ms: 0.483321
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 233 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.210636
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 234 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.274061
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 235 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.254524
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 236 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 26.53296
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 237 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.548332
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 238 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.517955
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 239 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 1.031923
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 240 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.410826
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 241 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 3.898233
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 242 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 3.191006
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 243 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.272979
      type: 'test'
      ...
    # Subtest: Voice toolbar initializes without making backend or speech calls
    ok 244 - Voice toolbar initializes without making backend or speech calls
      ---
      duration_ms: 4.059073
      type: 'test'
      ...
    # Subtest: Dictation records editable text but never automatically submits
    ok 245 - Dictation records editable text but never automatically submits
      ---
      duration_ms: 3.373125
      type: 'test'
      ...
    # Subtest: Live mode sends recognized turn, speaks response, and listens again
    ok 246 - Live mode sends recognized turn, speaks response, and listens again
      ---
      duration_ms: 11.000537
      type: 'test'
      ...
    # Subtest: Mandarin transcript produces Mandarin playback with the device fallback
    ok 247 - Mandarin transcript produces Mandarin playback with the device fallback
      ---
      duration_ms: 1.701681
      type: 'test'
      ...
    # Subtest: Automatic language does not expose a selector or persist a chosen language
    ok 248 - Automatic language does not expose a selector or persist a chosen language
      ---
      duration_ms: 0.848531
      type: 'test'
      ...
    # Subtest: Interrupt stops ongoing TTS and accepts a new voice turn
    ok 249 - Interrupt stops ongoing TTS and accepts a new voice turn
      ---
      duration_ms: 2.578414
      type: 'test'
      ...
    # Subtest: Closing assistant cancels microphone and never sends stale recognized audio
    ok 250 - Closing assistant cancels microphone and never sends stale recognized audio
      ---
      duration_ms: 1.561059
      type: 'test'
      ...
    # Subtest: Permission denial ends live conversation without retry loop
    ok 251 - Permission denial ends live conversation without retry loop
      ---
      duration_ms: 0.937517
      type: 'test'
      ...
    # Subtest: Unsupported speech browser keeps text chat available and disables voice
    ok 252 - Unsupported speech browser keeps text chat available and disables voice
      ---
      duration_ms: 1.058793
      type: 'test'
      ...
    # Subtest: Native recognition and authenticated recording fallback never access payment routes
    ok 253 - Native recognition and authenticated recording fallback never access payment routes
      ---
      duration_ms: 0.537611
      type: 'test'
      ...
    # Subtest: Customer pages load AI chat before interactive voice and include voice styles
    ok 254 - Customer pages load AI chat before interactive voice and include voice styles
      ---
      duration_ms: 0.403051
      type: 'test'
      ...
    # Subtest: Voice origin is marked without pinning a voice language
    ok 255 - Voice origin is marked without pinning a voice language
      ---
      duration_ms: 0.468333
      type: 'test'
      ...
    # Subtest: English prefers an available Natural/Neural voice over basic Google TTS
    ok 256 - English prefers an available Natural/Neural voice over basic Google TTS
      ---
      duration_ms: 1.289854
      type: 'test'
      ...
    # Subtest: English retains Google US English when no enhanced voice exists
    ok 257 - English retains Google US English when no enhanced voice exists
      ---
      duration_ms: 0.800822
      type: 'test'
      ...
    # Subtest: Compact browser voice is identified in visible voice diagnostic
    ok 258 - Compact browser voice is identified in visible voice diagnostic
      ---
      duration_ms: 0.773732
      type: 'test'
      ...
    # Subtest: Taglish prefers locally installed Microsoft Blessica without Azure credentials
    ok 259 - Taglish prefers locally installed Microsoft Blessica without Azure credentials
      ---
      duration_ms: 6.979465
      type: 'test'
      ...
    # Subtest: Spanish and Mandarin keep appropriate browser default-language voices
    ok 260 - Spanish and Mandarin keep appropriate browser default-language voices
      ---
      duration_ms: 1.302337
      type: 'test'
      ...
    # Blessica cloud voice unavailable: Blessica voice returned HTTP 503
    # Subtest: Without Azure credentials, Taglish falls back to an available Filipino browser voice
    ok 261 - Without Azure credentials, Taglish falls back to an available Filipino browser voice
      ---
      duration_ms: 1.589151
      type: 'test'
      ...
    # Subtest: Unavailable Azure returns 503 and falls back to browser without retrying
    ok 262 - Unavailable Azure returns 503 and falls back to browser without retrying
      ---
      duration_ms: 2.084985
      type: 'test'
      ...
    # Subtest: Available Azure Blessica plays MP3 instead of browser TTS
    ok 263 - Available Azure Blessica plays MP3 instead of browser TTS
      ---
      duration_ms: 1.890071
      type: 'test'
      ...
    # Subtest: Voice picker is removed while language and live controls remain
    ok 264 - Voice picker is removed while language and live controls remain
      ---
      duration_ms: 1.058452
      type: 'test'
      ...
    # Subtest: iOS Safari records PCM WAV and reviews transcript without auto-sending
    ok 265 - iOS Safari records PCM WAV and reviews transcript without auto-sending
      ---
      duration_ms: 7.676173
      type: 'test'
      ...
    # Subtest: iOS hands-free turn transcribes after silence and resumes listening
    ok 266 - iOS hands-free turn transcribes after silence and resumes listening
      ---
      duration_ms: 41.537558
      type: 'test'
      ...
    # Subtest: Firefox-like browser without SpeechRecognition can use secure audio capture
    ok 267 - Firefox-like browser without SpeechRecognition can use secure audio capture
      ---
      duration_ms: 3.932247
      type: 'test'
      ...
    # Subtest: iOS Safari chooses enhanced English voice instead of compact/default
    ok 268 - iOS Safari chooses enhanced English voice instead of compact/default
      ---
      duration_ms: 0.995304
      type: 'test'
      ...
    # Subtest: Mobile English fallback uses en-US before speech voices load
    ok 269 - Mobile English fallback uses en-US before speech voices load
      ---
      duration_ms: 0.775355
      type: 'test'
      ...
    # Subtest: Taglish voice recognizes resort Pool Shade even if browser hears full shade
    ok 270 - Taglish voice recognizes resort Pool Shade even if browser hears full shade
      ---
      duration_ms: 2.176115
      type: 'test'
      ...
    # Subtest: Taglish preview / premyo mishearing is corrected only in resort context
    ok 271 - Taglish preview / premyo mishearing is corrected only in resort context
      ---
      duration_ms: 1.62597
      type: 'test'
      ...
    # Subtest: A real prize request stays as premyo without accommodation context
    ok 272 - A real prize request stays as premyo without accommodation context
      ---
      duration_ms: 1.862299
      type: 'test'
      ...
    # Subtest: Raffle premyo is never rewritten into preview even after a room discussion
    ok 273 - Raffle premyo is never rewritten into preview even after a room discussion
      ---
      duration_ms: 1.130747
      type: 'test'
      ...
    # Subtest: Near-confidence browser recognition alternative can recover preview
    ok 274 - Near-confidence browser recognition alternative can recover preview
      ---
      duration_ms: 1.302708
      type: 'test'
      ...
    # Subtest: Dictation remains editable and never autosends corrected Taglish speech
    ok 275 - Dictation remains editable and never autosends corrected Taglish speech
      ---
      duration_ms: 0.835828
      type: 'test'
      ...
    # Subtest: Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
    ok 276 - Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
      ---
      duration_ms: 3.686358
      type: 'test'
      ...
    # Subtest: Mandarin voice speech stays untranslated and unmodified by Taglish terms
    ok 277 - Mandarin voice speech stays untranslated and unmodified by Taglish terms
      ---
      duration_ms: 3.852148
      type: 'test'
      ...
    # Subtest: Full shade amenity question is not silently converted into Pool Shade
    ok 278 - Full shade amenity question is not silently converted into Pool Shade
      ---
      duration_ms: 3.888455
      type: 'test'
      ...
    # Subtest: Taglish on a recording-capable Edge desktop defaults to accurate audio STT
    ok 279 - Taglish on a recording-capable Edge desktop defaults to accurate audio STT
      ---
      duration_ms: 34.002969
      type: 'test'
      ...
    # Subtest: General accurate transcription respects arbitrary words instead of dictionary substitutions
    ok 280 - General accurate transcription respects arbitrary words instead of dictionary substitutions
      ---
      duration_ms: 5.404841
      type: 'test'
      ...
    # Subtest: Automatic language prioritizes multilingual Gemini recording over legacy fast mode
    ok 281 - Automatic language prioritizes multilingual Gemini recording over legacy fast mode
      ---
      duration_ms: 30.074635
      type: 'test'
      ...
    # Subtest: English can explicitly enable accurate audio transcription without forcing Taglish corrections
    ok 282 - English can explicitly enable accurate audio transcription without forcing Taglish corrections
      ---
      duration_ms: 3.45089
      type: 'test'
      ...
    # Subtest: A different spoken language never requires a UI language choice
    ok 283 - A different spoken language never requires a UI language choice
      ---
      duration_ms: 0.682722
      type: 'test'
      ...
    # Subtest: Changing input provider ends current hands-free session safely
    ok 284 - Changing input provider ends current hands-free session safely
      ---
      duration_ms: 0.603876
      type: 'test'
      ...
    # Subtest: Existing alternate languages, transcript review, and cloud voice controls remain
    ok 285 - Existing alternate languages, transcript review, and cloud voice controls remain
      ---
      duration_ms: 0.254384
      type: 'test'
      ...
    # Subtest: Silent microphone does not spend credits or send transcription request
    ok 286 - Silent microphone does not spend credits or send transcription request
      ---
      duration_ms: 2.700222
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 287 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.184918
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 288 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.385308
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 289 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.819227
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 290 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 2.094924
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 291 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 1.433762
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 292 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.401271
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 293 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.762731
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 294 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.502166
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 295 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 1.173326
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 296 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.56311
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 297 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.403572
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 298 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 3.037831
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 299 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 2.473228
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 300 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 1.686513
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 301 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.872145
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 302 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 4.063067
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 303 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 1.507599
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 304 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.189036
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 305 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.497457
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 306 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.35935
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 307 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.612765
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 308 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.083559
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 309 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.467131
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 310 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.330425
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 311 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.230099
      type: 'test'
      ...
    # Subtest: UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
    ok 312 - UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
      ---
      duration_ms: 1.472164
      type: 'test'
      ...
    # Subtest: UI-43 compact accommodation rows are collapsed and keep all original actions
    ok 313 - UI-43 compact accommodation rows are collapsed and keep all original actions
      ---
      duration_ms: 16.978266
      type: 'test'
      ...
    # Subtest: UI-43 tap / keyboard button behavior allows only one expanded room
    ok 314 - UI-43 tap / keyboard button behavior allows only one expanded room
      ---
      duration_ms: 1.094549
      type: 'test'
      ...
    # Subtest: UI-43 responsive change preserves desktop layout and restores compact state
    ok 315 - UI-43 responsive change preserves desktop layout and restores compact state
      ---
      duration_ms: 0.922689
      type: 'test'
      ...
    # Subtest: UI-43 AI deep link automatically expands its requested accommodation
    ok 316 - UI-43 AI deep link automatically expands its requested accommodation
      ---
      duration_ms: 0.978283
      type: 'test'
      ...
    # Subtest: UI-43 desktop renders full cards without visible accordion controls
    ok 317 - UI-43 desktop renders full cards without visible accordion controls
      ---
      duration_ms: 1.034137
      type: 'test'
      ...
    # Subtest: UI-43 category filters and existing gallery enhancer remain in original flow
    ok 318 - UI-43 category filters and existing gallery enhancer remain in original flow
      ---
      duration_ms: 0.266537
      type: 'test'
      ...
    # Subtest: UI-42 full chat script remains valid JavaScript and landing fetches fresh version
    ok 319 - UI-42 full chat script remains valid JavaScript and landing fetches fresh version
      ---
      duration_ms: 2.124298
      type: 'test'
      ...
    # Subtest: UI-42 public landing deletes ONLY previously persisted public keys
    ok 320 - UI-42 public landing deletes ONLY previously persisted public keys
      ---
      duration_ms: 2.880217
      type: 'test'
      ...
    # Subtest: UI-42 public chat persists through turns in one page, not reloads or another tab
    ok 321 - UI-42 public chat persists through turns in one page, not reloads or another tab
      ---
      duration_ms: 1.994616
      type: 'test'
      ...
    # Subtest: UI-42 public New Chat resets selected room and pending response generation
    ok 322 - UI-42 public New Chat resets selected room and pending response generation
      ---
      duration_ms: 0.846498
      type: 'test'
      ...
    # Subtest: UI-42 returning from browser back/forward cache reloads the landing page
    ok 323 - UI-42 returning from browser back/forward cache reloads the landing page
      ---
      duration_ms: 0.76759
      type: 'test'
      ...
    # Subtest: UI-42 public chat size never persists, Customer Home chat remains persistent
    ok 324 - UI-42 public chat size never persists, Customer Home chat remains persistent
      ---
      duration_ms: 2.126362
      type: 'test'
      ...
    # Subtest: UI-37 public landing includes a complete accessible AI chat widget
    ok 325 - UI-37 public landing includes a complete accessible AI chat widget
      ---
      duration_ms: 1.211849
      type: 'test'
      ...
    # Subtest: UI-37 guest greeting and stored chat are isolated from customer Home
    ok 326 - UI-37 guest greeting and stored chat are isolated from customer Home
      ---
      duration_ms: 0.311531
      type: 'test'
      ...
    # Subtest: UI-37 public accommodations can be discussed but booking links require login
    ok 327 - UI-37 public accommodations can be discussed but booking links require login
      ---
      duration_ms: 0.275603
      type: 'test'
      ...
    # Subtest: UI-37 existing public chat keeps server-side scope, payload and credit guards
    ok 328 - UI-37 existing public chat keeps server-side scope, payload and credit guards
      ---
      duration_ms: 0.194772
      type: 'test'
      ...
    1..328
    # tests 328
    # suites 0
    # pass 327
    # fail 1
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 3105.848346
