# AI Mock Regression — testing branch

Source commit: 51f5aa591ff406b9a495c78c1b0366c15a137247
Exit code: 0

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 0.902814
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.326587
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 32.503413
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.100137
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.316311
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 1.826631
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.240348
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.076444
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 0.888993
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 0.479544
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 77.788914
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 21.362138
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 4.799759
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 3.84725
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 7.439259
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 2.770526
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 57.958666
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 9.294202
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 3.231803
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 3.689454
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 16.49129
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 8.187433
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 3.155229
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 4.809532
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 12.635037
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 3.37742
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 7.532849
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 7.914663
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 4.976341
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 5.43219
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 5.016501
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 5.347023
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 6.997421
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 3.448987
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 5.283749
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.039798
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 3.549857
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 6.101007
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 8.243417
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 12.598653
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 9.042157
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.537387
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 3.455967
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.051826
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 3.070193
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 10.185479
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 3.881661
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 2.690076
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 5.016
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 3.524078
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.359955
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 2.001671
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 704.419345
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 704.045454
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.897927
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.410541
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 2.807732
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 3.532982
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.736236
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 1.830015
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 1.548977
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 3.830244
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 3.774812
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 3.816514
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 1.735906
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 1.901392
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 1.751609
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 1.384171
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.561654
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.496167
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 1.730727
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 1.950315
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.514886
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.265094
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 1.583649
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.455198
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 1.411813
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 1.919408
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.001911
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 1.545361
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 0.949775
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 0.968643
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 0.955833
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.58517
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.034981
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 1.633032
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.190942
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.46385
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.174409
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 1.949132
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 1.399945
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.219466
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.25561
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.409909
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 1.619792
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.472343
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.260958
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.301748
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.113769
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.201139
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.030545
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.142061
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.049984
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.41063
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.223442
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.289571
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.536959
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.080409
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.32944
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.258394
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 4.763384
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.598721
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.305103
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.330672
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 1.818738
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.421117
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.119978
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.581295
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 119 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 3.147358
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 2.362869
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 7.515352
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 1.422508
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 2.086748
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.052076
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 2.691067
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.073018
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 127 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.099908
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 128 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.261399
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 129 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.617989
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 130 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 1.929954
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 131 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.131305
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 132 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.617049
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 133 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.855213
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 134 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.760222
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 135 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.67822
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 136 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 6.651556
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 137 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.393536
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 138 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 1.751498
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 139 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.712791
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 140 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.189881
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 141 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 15.14173
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 142 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.725431
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 143 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.378614
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 144 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 1.16189
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 145 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.234329
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 146 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.252747
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 147 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 2.10128
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 148 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.585822
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 149 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 3.288247
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 150 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.428618
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 151 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.474226
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 152 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.389891
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 153 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.598801
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 154 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.162741
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 155 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.341999
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 156 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.242291
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 157 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.126838
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 158 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.085317
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 159 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.259386
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 160 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.1813
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 161 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 3.237342
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 162 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.571111
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 163 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 0.847863
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 164 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.216422
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 165 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.490641
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 166 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.358203
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 167 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.379045
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 168 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 3.456267
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 169 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.320567
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 170 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 18.305772
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 171 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.559914
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 172 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 2.320986
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 173 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.288529
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 174 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.209823
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 175 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.190724
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 176 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.383551
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 177 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 3.607593
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 178 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.743447
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 179 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.195852
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 180 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.36269
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 181 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.838128
      type: 'test'
      ...
    # Subtest: AI-37 generic personalized recommendations ask before showing cards
    ok 182 - AI-37 generic personalized recommendations ask before showing cards
      ---
      duration_ms: 5.587491
      type: 'test'
      ...
    # Subtest: AI-37 short natural guest-count answers work but other numbers are not invented
    ok 183 - AI-37 short natural guest-count answers work but other numbers are not invented
      ---
      duration_ms: 9.174935
      type: 'test'
      ...
    # Subtest: AI-37 pending follow-up requires the actual prior assistant guest-count question
    ok 184 - AI-37 pending follow-up requires the actual prior assistant guest-count question
      ---
      duration_ms: 1.750207
      type: 'test'
      ...
    # Subtest: AI-37 follow-up keeps explicit accommodation type through verified catalog selection
    ok 185 - AI-37 follow-up keeps explicit accommodation type through verified catalog selection
      ---
      duration_ms: 0.722816
      type: 'test'
      ...
    # Subtest: AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
    ok 186 - AI-38 natural 10-to-7 revisions are recognized without inventing other numbers
      ---
      duration_ms: 1.67847
      type: 'test'
      ...
    # Subtest: AI-38 a guest-count correction requires an immediately previous resort recommendation
    ok 187 - AI-38 a guest-count correction requires an immediately previous resort recommendation
      ---
      duration_ms: 0.704689
      type: 'test'
      ...
    # Subtest: AI-38 the original requested category overrides the last suggested room
    ok 188 - AI-38 the original requested category overrides the last suggested room
      ---
      duration_ms: 0.18133
      type: 'test'
      ...
    # Subtest: AI-45 descriptive Filipino recommendations preserve written guest count
    ok 189 - AI-45 descriptive Filipino recommendations preserve written guest count
      ---
      duration_ms: 0.433806
      type: 'test'
      ...
    # Subtest: AI-45 2-to-7 corrections need immediately preceding verified preview
    ok 190 - AI-45 2-to-7 corrections need immediately preceding verified preview
      ---
      duration_ms: 0.54388
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 191 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 8.495392
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 192 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.630199
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 193 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.163183
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 194 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.196623
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 195 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.190704
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 196 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.215651
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 197 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.177605
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 198 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.120159
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 199 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.263212
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 200 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.441167
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 201 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.984166
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 202 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.696818
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 203 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.488137
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 204 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.407667
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 205 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.163514
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 206 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.146317
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 207 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.251514
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 208 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 1.46397
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 209 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 9.856108
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 210 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 0.948663
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 211 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.257684
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 212 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.251164
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 213 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.554737
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 214 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 1.308048
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 215 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 0.970074
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 216 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.294349
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 217 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 0.561216
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 218 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 2.264273
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 219 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.627404
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 220 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.226077
      type: 'test'
      ...
    # Subtest: AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
    ok 221 - AI-39 natural operating days/hours questions use a verified answer, no AI/DB guess
      ---
      duration_ms: 0.63837
      type: 'test'
      ...
    # Subtest: AI-39 special opening circumstances are qualified, not guaranteed
    ok 222 - AI-39 special opening circumstances are qualified, not guaranteed
      ---
      duration_ms: 0.210403
      type: 'test'
      ...
    # Subtest: AI-36 unrelated general-knowledge questions are blocked
    ok 223 - AI-36 unrelated general-knowledge questions are blocked
      ---
      duration_ms: 11.176044
      type: 'test'
      ...
    # Subtest: AI-36 saved accommodation and old chat history never unlock unrelated facts
    ok 224 - AI-36 saved accommodation and old chat history never unlock unrelated facts
      ---
      duration_ms: 0.260268
      type: 'test'
      ...
    # Subtest: AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
    ok 225 - AI-36 common Taglish, English, Spanish and Mandarin resort requests are allowed
      ---
      duration_ms: 3.004214
      type: 'test'
      ...
    # Subtest: AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
    ok 226 - AI-36 natural followups work but fresh unknown ellipsis does not grant random knowledge
      ---
      duration_ms: 0.448578
      type: 'test'
      ...
    # Subtest: AI-36 refusal is short, localized and does not include the trivia answer
    ok 227 - AI-36 refusal is short, localized and does not include the trivia answer
      ---
      duration_ms: 0.409029
      type: 'test'
      ...
    # Subtest: AI-36 scope check occurs before all Gemini and catalog calls
    ok 228 - AI-36 scope check occurs before all Gemini and catalog calls
      ---
      duration_ms: 0.505112
      type: 'test'
      ...
    # Subtest: AI-39 common opening-days phrasing is resort-relevant without previous chat
    ok 229 - AI-39 common opening-days phrasing is resort-relevant without previous chat
      ---
      duration_ms: 0.818459
      type: 'test'
      ...
    # Subtest: AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
    ok 230 - AI-39 opening-hours intent does not unlock unrelated or manipulative tasks
      ---
      duration_ms: 0.145597
      type: 'test'
      ...
    # Subtest: AI-44 multilingual greetings and clear resort requests pass the scope gate
    ok 231 - AI-44 multilingual greetings and clear resort requests pass the scope gate
      ---
      duration_ms: 0.581315
      type: 'test'
      ...
    # Subtest: WAV audio is transcribed with Gemini but never stored
    ok 232 - WAV audio is transcribed with Gemini but never stored
      ---
      duration_ms: 0.771248
      type: 'test'
      ...
    # Subtest: Invalid format and audio are rejected before invoking Gemini
    ok 233 - Invalid format and audio are rejected before invoking Gemini
      ---
      duration_ms: 0.20797
      type: 'test'
      ...
    # Subtest: No speech from Gemini returns empty transcript
    ok 234 - No speech from Gemini returns empty transcript
      ---
      duration_ms: 0.219757
      type: 'test'
      ...
    # Subtest: Recorded multilingual STT auto-detects language with verified resort vocabulary
    ok 235 - Recorded multilingual STT auto-detects language with verified resort vocabulary
      ---
      duration_ms: 0.20155
      type: 'test'
      ...
    # Subtest: Untrusted voice language header cannot inject transcription prompts
    ok 236 - Untrusted voice language header cannot inject transcription prompts
      ---
      duration_ms: 0.197274
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 237 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 0.950616
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 238 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.200629
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 239 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.185286
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 240 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 13.769156
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 241 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.335549
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 242 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.311704
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 243 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.588537
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 244 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.279696
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 245 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.467475
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 246 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 2.435156
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 247 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.288419
      type: 'test'
      ...
    # Subtest: Voice toolbar initializes without making backend or speech calls
    ok 248 - Voice toolbar initializes without making backend or speech calls
      ---
      duration_ms: 4.419482
      type: 'test'
      ...
    # Subtest: Dictation records editable text but never automatically submits
    ok 249 - Dictation records editable text but never automatically submits
      ---
      duration_ms: 3.281207
      type: 'test'
      ...
    # Subtest: Live mode sends recognized turn, speaks response, and listens again
    ok 250 - Live mode sends recognized turn, speaks response, and listens again
      ---
      duration_ms: 7.559228
      type: 'test'
      ...
    # Subtest: Mandarin transcript produces Mandarin playback with the device fallback
    ok 251 - Mandarin transcript produces Mandarin playback with the device fallback
      ---
      duration_ms: 0.998897
      type: 'test'
      ...
    # Subtest: Automatic language does not expose a selector or persist a chosen language
    ok 252 - Automatic language does not expose a selector or persist a chosen language
      ---
      duration_ms: 0.559753
      type: 'test'
      ...
    # Subtest: Interrupt stops ongoing TTS and accepts a new voice turn
    ok 253 - Interrupt stops ongoing TTS and accepts a new voice turn
      ---
      duration_ms: 1.392073
      type: 'test'
      ...
    # Subtest: Closing assistant cancels microphone and never sends stale recognized audio
    ok 254 - Closing assistant cancels microphone and never sends stale recognized audio
      ---
      duration_ms: 0.854853
      type: 'test'
      ...
    # Subtest: Permission denial ends live conversation without retry loop
    ok 255 - Permission denial ends live conversation without retry loop
      ---
      duration_ms: 0.593283
      type: 'test'
      ...
    # Subtest: Unsupported speech browser keeps text chat available and disables voice
    ok 256 - Unsupported speech browser keeps text chat available and disables voice
      ---
      duration_ms: 0.674544
      type: 'test'
      ...
    # Subtest: Native recognition and authenticated recording fallback never access payment routes
    ok 257 - Native recognition and authenticated recording fallback never access payment routes
      ---
      duration_ms: 0.320177
      type: 'test'
      ...
    # Subtest: Customer pages load AI chat before interactive voice and include voice styles
    ok 258 - Customer pages load AI chat before interactive voice and include voice styles
      ---
      duration_ms: 0.284083
      type: 'test'
      ...
    # Subtest: Voice origin is marked without pinning a voice language
    ok 259 - Voice origin is marked without pinning a voice language
      ---
      duration_ms: 0.292075
      type: 'test'
      ...
    # Subtest: English prefers an available Natural/Neural voice over basic Google TTS
    ok 260 - English prefers an available Natural/Neural voice over basic Google TTS
      ---
      duration_ms: 0.791559
      type: 'test'
      ...
    # Subtest: English retains Google US English when no enhanced voice exists
    ok 261 - English retains Google US English when no enhanced voice exists
      ---
      duration_ms: 0.485493
      type: 'test'
      ...
    # Subtest: Compact browser voice is identified in visible voice diagnostic
    ok 262 - Compact browser voice is identified in visible voice diagnostic
      ---
      duration_ms: 0.495077
      type: 'test'
      ...
    # Subtest: Taglish prefers locally installed Microsoft Blessica without Azure credentials
    ok 263 - Taglish prefers locally installed Microsoft Blessica without Azure credentials
      ---
      duration_ms: 3.219755
      type: 'test'
      ...
    # Subtest: Spanish and Mandarin keep appropriate browser default-language voices
    ok 264 - Spanish and Mandarin keep appropriate browser default-language voices
      ---
      duration_ms: 0.706131
      type: 'test'
      ...
    # Blessica cloud voice unavailable: Blessica voice returned HTTP 503
    # Subtest: Without Azure credentials, Taglish falls back to an available Filipino browser voice
    ok 265 - Without Azure credentials, Taglish falls back to an available Filipino browser voice
      ---
      duration_ms: 1.14132
      type: 'test'
      ...
    # Subtest: Unavailable Azure returns 503 and falls back to browser without retrying
    ok 266 - Unavailable Azure returns 503 and falls back to browser without retrying
      ---
      duration_ms: 1.137815
      type: 'test'
      ...
    # Subtest: Available Azure Blessica plays MP3 instead of browser TTS
    ok 267 - Available Azure Blessica plays MP3 instead of browser TTS
      ---
      duration_ms: 0.855915
      type: 'test'
      ...
    # Subtest: Voice picker is removed while language and live controls remain
    ok 268 - Voice picker is removed while language and live controls remain
      ---
      duration_ms: 0.621065
      type: 'test'
      ...
    # Subtest: iOS Safari records PCM WAV and reviews transcript without auto-sending
    ok 269 - iOS Safari records PCM WAV and reviews transcript without auto-sending
      ---
      duration_ms: 3.750616
      type: 'test'
      ...
    # Subtest: iOS hands-free turn transcribes after silence and resumes listening
    ok 270 - iOS hands-free turn transcribes after silence and resumes listening
      ---
      duration_ms: 24.474699
      type: 'test'
      ...
    # Subtest: Firefox-like browser without SpeechRecognition can use secure audio capture
    ok 271 - Firefox-like browser without SpeechRecognition can use secure audio capture
      ---
      duration_ms: 2.251894
      type: 'test'
      ...
    # Subtest: iOS Safari chooses enhanced English voice instead of compact/default
    ok 272 - iOS Safari chooses enhanced English voice instead of compact/default
      ---
      duration_ms: 0.576548
      type: 'test'
      ...
    # Subtest: Mobile English fallback uses en-US before speech voices load
    ok 273 - Mobile English fallback uses en-US before speech voices load
      ---
      duration_ms: 0.467156
      type: 'test'
      ...
    # Subtest: Taglish voice recognizes resort Pool Shade even if browser hears full shade
    ok 274 - Taglish voice recognizes resort Pool Shade even if browser hears full shade
      ---
      duration_ms: 1.595356
      type: 'test'
      ...
    # Subtest: Taglish preview / premyo mishearing is corrected only in resort context
    ok 275 - Taglish preview / premyo mishearing is corrected only in resort context
      ---
      duration_ms: 1.007601
      type: 'test'
      ...
    # Subtest: A real prize request stays as premyo without accommodation context
    ok 276 - A real prize request stays as premyo without accommodation context
      ---
      duration_ms: 0.774473
      type: 'test'
      ...
    # Subtest: Raffle premyo is never rewritten into preview even after a room discussion
    ok 277 - Raffle premyo is never rewritten into preview even after a room discussion
      ---
      duration_ms: 0.702035
      type: 'test'
      ...
    # Subtest: Near-confidence browser recognition alternative can recover preview
    ok 278 - Near-confidence browser recognition alternative can recover preview
      ---
      duration_ms: 0.840221
      type: 'test'
      ...
    # Subtest: Dictation remains editable and never autosends corrected Taglish speech
    ok 279 - Dictation remains editable and never autosends corrected Taglish speech
      ---
      duration_ms: 0.519393
      type: 'test'
      ...
    # Subtest: Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
    ok 280 - Recorded Gemini STT faithfully preserves a returned transcript without forced word substitutions
      ---
      duration_ms: 2.002182
      type: 'test'
      ...
    # Subtest: Mandarin voice speech stays untranslated and unmodified by Taglish terms
    ok 281 - Mandarin voice speech stays untranslated and unmodified by Taglish terms
      ---
      duration_ms: 3.079937
      type: 'test'
      ...
    # Subtest: Full shade amenity question is not silently converted into Pool Shade
    ok 282 - Full shade amenity question is not silently converted into Pool Shade
      ---
      duration_ms: 1.260888
      type: 'test'
      ...
    # Subtest: Taglish on a recording-capable Edge desktop defaults to accurate audio STT
    ok 283 - Taglish on a recording-capable Edge desktop defaults to accurate audio STT
      ---
      duration_ms: 17.329858
      type: 'test'
      ...
    # Subtest: General accurate transcription respects arbitrary words instead of dictionary substitutions
    ok 284 - General accurate transcription respects arbitrary words instead of dictionary substitutions
      ---
      duration_ms: 3.460533
      type: 'test'
      ...
    # Subtest: Automatic language prioritizes multilingual Gemini recording over legacy fast mode
    ok 285 - Automatic language prioritizes multilingual Gemini recording over legacy fast mode
      ---
      duration_ms: 20.572512
      type: 'test'
      ...
    # Subtest: English can explicitly enable accurate audio transcription without forcing Taglish corrections
    ok 286 - English can explicitly enable accurate audio transcription without forcing Taglish corrections
      ---
      duration_ms: 2.725078
      type: 'test'
      ...
    # Subtest: A different spoken language never requires a UI language choice
    ok 287 - A different spoken language never requires a UI language choice
      ---
      duration_ms: 0.502688
      type: 'test'
      ...
    # Subtest: Changing input provider ends current hands-free session safely
    ok 288 - Changing input provider ends current hands-free session safely
      ---
      duration_ms: 0.379155
      type: 'test'
      ...
    # Subtest: Existing alternate languages, transcript review, and cloud voice controls remain
    ok 289 - Existing alternate languages, transcript review, and cloud voice controls remain
      ---
      duration_ms: 0.223292
      type: 'test'
      ...
    # Subtest: Silent microphone does not spend credits or send transcription request
    ok 290 - Silent microphone does not spend credits or send transcription request
      ---
      duration_ms: 1.613323
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 291 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 0.64485
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 292 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.125977
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 293 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.384713
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 294 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.019528
      type: 'test'
      ...
    # Subtest: UI-36 homepage hero advertises AI Chatbot Assistant
    ok 295 - UI-36 homepage hero advertises AI Chatbot Assistant
      ---
      duration_ms: 0.729907
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 296 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 0.775445
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 297 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 0.455198
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 298 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.316611
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 299 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 0.851559
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 300 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.345144
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 301 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.230463
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 302 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 1.852038
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 303 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 1.278114
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 304 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 0.946289
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 305 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 0.455859
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 306 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 1.091686
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 307 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 0.571101
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 308 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 0.970365
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 309 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.359826
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 310 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.323222
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 311 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.054871
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 312 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 0.614755
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 313 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.286917
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 314 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.199768
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 315 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.114551
      type: 'test'
      ...
    # Subtest: UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
    ok 316 - UI-43 core JS/CSS is valid and only the Customer rooms page loads accordion CSS
      ---
      duration_ms: 0.923355
      type: 'test'
      ...
    # Subtest: UI-43 compact accommodation rows are collapsed and keep all original actions
    ok 317 - UI-43 compact accommodation rows are collapsed and keep all original actions
      ---
      duration_ms: 11.205097
      type: 'test'
      ...
    # Subtest: UI-43 tap / keyboard button behavior allows only one expanded room
    ok 318 - UI-43 tap / keyboard button behavior allows only one expanded room
      ---
      duration_ms: 0.71172
      type: 'test'
      ...
    # Subtest: UI-43 responsive change preserves desktop layout and restores compact state
    ok 319 - UI-43 responsive change preserves desktop layout and restores compact state
      ---
      duration_ms: 0.588226
      type: 'test'
      ...
    # Subtest: UI-43 AI deep link automatically expands its requested accommodation
    ok 320 - UI-43 AI deep link automatically expands its requested accommodation
      ---
      duration_ms: 0.633043
      type: 'test'
      ...
    # Subtest: UI-43 desktop renders full cards without visible accordion controls
    ok 321 - UI-43 desktop renders full cards without visible accordion controls
      ---
      duration_ms: 0.635226
      type: 'test'
      ...
    # Subtest: UI-43 category filters and existing gallery enhancer remain in original flow
    ok 322 - UI-43 category filters and existing gallery enhancer remain in original flow
      ---
      duration_ms: 0.188641
      type: 'test'
      ...
    # Subtest: HK-46 Manager screen has resort logo, quick navigation, filtering and visible task counts
    ok 323 - HK-46 Manager screen has resort logo, quick navigation, filtering and visible task counts
      ---
      duration_ms: 0.610769
      type: 'test'
      ...
    # Subtest: HK-46 Manager image must be signed and reviewed before a separate Verify Ready
    ok 324 - HK-46 Manager image must be signed and reviewed before a separate Verify Ready
      ---
      duration_ms: 0.190714
      type: 'test'
      ...
    # Subtest: HK-46 Housekeeping can select camera photo and must upload before marking Cleaned
    ok 325 - HK-46 Housekeeping can select camera photo and must upload before marking Cleaned
      ---
      duration_ms: 0.146518
      type: 'test'
      ...
    # Subtest: HK-46 backend proof routes are protected by signed role middleware
    ok 326 - HK-46 backend proof routes are protected by signed role middleware
      ---
      duration_ms: 0.162242
      type: 'test'
      ...
    # Subtest: HK-46 task state updates require proof and Manager review without changing availability
    ok 327 - HK-46 task state updates require proof and Manager review without changing availability
      ---
      duration_ms: 0.160119
      type: 'test'
      ...
    # Subtest: HK-46 JS files parse and all exact versioned frontend resources exist
    ok 328 - HK-46 JS files parse and all exact versioned frontend resources exist
      ---
      duration_ms: 0.511963
      type: 'test'
      ...
    # Subtest: Manager sees verified housekeeping staff without exposing contact details
    ok 329 - Manager sees verified housekeeping staff without exposing contact details
      ---
      duration_ms: 27.51673
      type: 'test'
      ...
    # Subtest: Only completed reservation items without tasks appear in Manager candidate list
    ok 330 - Only completed reservation items without tasks appear in Manager candidate list
      ---
      duration_ms: 4.038744
      type: 'test'
      ...
    # Subtest: Manager creates a task for a completed reservation item
    ok 331 - Manager creates a task for a completed reservation item
      ---
      duration_ms: 10.76312
      type: 'test'
      ...
    # Subtest: Uncompleted reservation cannot create a cleaning task
    ok 332 - Uncompleted reservation cannot create a cleaning task
      ---
      duration_ms: 3.647512
      type: 'test'
      ...
    # Subtest: Duplicate cleaning task for same reservation item is rejected
    ok 333 - Duplicate cleaning task for same reservation item is rejected
      ---
      duration_ms: 5.9894
      type: 'test'
      ...
    # Subtest: Unknown or disabled staff cannot be assigned a new task
    ok 334 - Unknown or disabled staff cannot be assigned a new task
      ---
      duration_ms: 9.024891
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 335 - Invalid task creation request is blocked
      ---
      duration_ms: 2.48405
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 336 - Invalid task creation request is blocked
      ---
      duration_ms: 4.434624
      type: 'test'
      ...
    # Subtest: Invalid task creation request is blocked
    ok 337 - Invalid task creation request is blocked
      ---
      duration_ms: 4.71366
      type: 'test'
      ...
    # Subtest: Housekeeping sees only their own assigned tasks
    ok 338 - Housekeeping sees only their own assigned tasks
      ---
      duration_ms: 7.187825
      type: 'test'
      ...
    # Subtest: Only assigned Housekeeping can start and mark cleaned
    ok 339 - Only assigned Housekeeping can start and mark cleaned
      ---
      duration_ms: 16.360245
      type: 'test'
      ...
    # Subtest: Cannot mark task cleaned without starting
    ok 340 - Cannot mark task cleaned without starting
      ---
      duration_ms: 2.8137
      type: 'test'
      ...
    # Subtest: Stale version blocks simultaneous task update
    ok 341 - Stale version blocks simultaneous task update
      ---
      duration_ms: 7.620379
      type: 'test'
      ...
    # Subtest: Manager may reassign task before cleaning starts only
    ok 342 - Manager may reassign task before cleaning starts only
      ---
      duration_ms: 4.94152
      type: 'test'
      ...
    # Subtest: Manager cannot reassign after cleaning has started
    ok 343 - Manager cannot reassign after cleaning has started
      ---
      duration_ms: 3.398551
      type: 'test'
      ...
    # Subtest: Manager verification is blocked before cleaning
    ok 344 - Manager verification is blocked before cleaning
      ---
      duration_ms: 2.730687
      type: 'test'
      ...
    # Subtest: Manager cannot verify as ready while the accommodation has checked-in guest
    ok 345 - Manager cannot verify as ready while the accommodation has checked-in guest
      ---
      duration_ms: 8.230958
      type: 'test'
      ...
    # Subtest: Manager verifies cleaned task without altering booking availability
    ok 346 - Manager verifies cleaned task without altering booking availability
      ---
      duration_ms: 7.878634
      type: 'test'
      ...
    # Subtest: Housekeeping token cannot perform Manager verification
    ok 347 - Housekeeping token cannot perform Manager verification
      ---
      duration_ms: 5.777895
      type: 'test'
      ...
    # Subtest: Manager token cannot start Housekeeping task
    ok 348 - Manager token cannot start Housekeeping task
      ---
      duration_ms: 2.010795
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 349 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 0.996924
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 350 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 0.919489
      type: 'test'
      ...
    # Subtest: Other signed roles cannot read Manager Housekeeping tasks
    ok 351 - Other signed roles cannot read Manager Housekeeping tasks
      ---
      duration_ms: 3.172725
      type: 'test'
      ...
    # Subtest: Missing and forged tokens reach no database queries
    ok 352 - Missing and forged tokens reach no database queries
      ---
      duration_ms: 2.165125
      type: 'test'
      ...
    # Subtest: Disabled Housekeeping staff loses access to all assigned tasks
    ok 353 - Disabled Housekeeping staff loses access to all assigned tasks
      ---
      duration_ms: 2.001932
      type: 'test'
      ...
    # Subtest: Invalid task date rejected before querying tasks
    ok 354 - Invalid task date rejected before querying tasks
      ---
      duration_ms: 1.444741
      type: 'test'
      ...
    # Subtest: Missing migration responds with clear 503 activation guidance
    ok 355 - Missing migration responds with clear 503 activation guidance
      ---
      duration_ms: 1.413936
      type: 'test'
      ...
    # Subtest: Housekeeping task endpoints never mutate existing booking/payment tables
    ok 356 - Housekeeping task endpoints never mutate existing booking/payment tables
      ---
      duration_ms: 6.336487
      type: 'test'
      ...
    # Subtest: Housekeeping frontend never trusts localStorage roles or injects task text as markup
    ok 357 - Housekeeping frontend never trusts localStorage roles or injects task text as markup
      ---
      duration_ms: 0.312155
      type: 'test'
      ...
    # Subtest: Schema creates isolated task table with unique reservation item and guarded statuses
    ok 358 - Schema creates isolated task table with unique reservation item and guarded statuses
      ---
      duration_ms: 0.186929
      type: 'test'
      ...
    # Subtest: Manager may review tasks without receiving private guest or payment records
    ok 359 - Manager may review tasks without receiving private guest or payment records
      ---
      duration_ms: 2.863775
      type: 'test'
      ...
    # Subtest: Forged Manager token cannot read Housekeeping task roster
    ok 360 - Forged Manager token cannot read Housekeeping task roster
      ---
      duration_ms: 1.034411
      type: 'test'
      ...
    # Subtest: Manager cannot bypass staff transitions using task verify endpoint
    ok 361 - Manager cannot bypass staff transitions using task verify endpoint
      ---
      duration_ms: 2.092756
      type: 'test'
      ...
    # Subtest: Invalid or missing optimistic versions cannot mutate cleaning task state
    ok 362 - Invalid or missing optimistic versions cannot mutate cleaning task state
      ---
      duration_ms: 3.016012
      type: 'test'
      ...
    # Subtest: HK-46 cleaning cannot be marked complete until a valid photo is uploaded
    ok 363 - HK-46 cleaning cannot be marked complete until a valid photo is uploaded
      ---
      duration_ms: 6.374623
      type: 'test'
      ...
    # Subtest: HK-46 non-assignee and Manager cannot upload someone else's cleaning proof
    ok 364 - HK-46 non-assignee and Manager cannot upload someone else's cleaning proof
      ---
      duration_ms: 4.476316
      type: 'test'
      ...
    # Subtest: HK-46 no proof can be reviewed or verified and Manager image remains private
    ok 365 - HK-46 no proof can be reviewed or verified and Manager image remains private
      ---
      duration_ms: 12.251716
      type: 'test'
      ...
    # Subtest: HK-46 malformed and non-image files are rejected before any proof DB write
    ok 366 - HK-46 malformed and non-image files are rejected before any proof DB write
      ---
      duration_ms: 5.369787
      type: 'test'
