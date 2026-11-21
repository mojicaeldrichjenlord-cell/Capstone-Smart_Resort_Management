# AI Mock Regression — testing branch

Source commit: 3884741f593cd9b3707f05f36f24e773b0fff13c
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.602692
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.522625
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 46.021671
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 3.058578
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.474485
      type: 'test'
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 128.765632
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 30.091682
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 19.254987
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 8.2298
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 4.703669
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 4.04008
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 88.264408
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 9.973374
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.05622
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 4.448242
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 16.480621
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 5.424755
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 3.47185
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.508553
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 15.053756
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 21 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 4.614613
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 22 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 8.382565
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 23 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 12.128245
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 24 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 7.475082
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 25 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 8.91029
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 26 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 7.203956
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 27 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 7.54398
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 28 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 7.530214
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 29 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.734955
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 30 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.64179
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 31 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 9.010266
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 32 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 8.387243
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 33 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 16.503429
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 34 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 9.857949
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 35 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.214913
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 36 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.382386
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 37 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.396166
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 38 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 6.435091
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 39 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 17.257209
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 40 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 14.066573
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 41 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 5.160031
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 42 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 6.430482
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 43 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 4.698256
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 44 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 3.022822
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 45 - English translation route responds with the English text
      ---
      duration_ms: 2.9363
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 46 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 702.829531
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 47 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 702.454382
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 48 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.831078
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 49 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.521363
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 50 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.418056
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 51 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.738049
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 52 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.348463
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 53 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.466334
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 54 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.107333
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 55 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.711981
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 56 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.542188
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 57 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.237635
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 58 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.403296
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 59 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.48637
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 60 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.473166
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 61 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 5.165019
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 62 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 701.97763
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 63 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 3.851848
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 64 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.176282
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 65 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.308949
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 66 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 1.940452
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 67 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.553259
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 68 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.18056
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 69 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.963535
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 70 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 1.837048
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 71 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.541924
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 72 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.156304
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 73 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.156214
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 74 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.790312
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 75 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.971019
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 76 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.863658
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 77 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.36988
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 78 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.135145
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 79 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.22302
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 80 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.17143
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 81 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 1.987179
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 82 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.647945
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 83 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.856151
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 84 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.040568
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 85 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 4.242077
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 86 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.745908
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 87 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.843972
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 88 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.12158
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 89 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.835556
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 90 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.590188
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 91 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.610365
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 92 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.580299
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 93 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.774402
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 94 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.4789
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 95 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.0303
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 96 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.517612
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 97 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.300043
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 98 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.349115
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 99 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.338685
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 100 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.835866
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 101 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.544062
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 102 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 1.791825
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 103 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.745708
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 104 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.732213
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 105 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.791149
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 106 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.76825
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 107 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.81641
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 108 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.466443
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 109 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.98227
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 110 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.58039
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 111 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.205867
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 112 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 7.188927
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 113 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.001031
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 114 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 10.651379
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 115 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 1.978583
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 116 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 2.902568
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 117 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.096223
      type: 'test'
      ...
    # Subtest: AI-41 English visitors get natural English; live voice's explicit language still wins
    ok 118 - AI-41 English visitors get natural English; live voice's explicit language still wins
      ---
      duration_ms: 3.551989
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 119 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.469853
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 120 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.31604
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 121 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.896139
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 122 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.942462
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 123 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.322869
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 124 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.920949
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 125 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.912533
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 126 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.974368
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    not ok 127 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 2.830453
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:72:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /room-card-\$\{Number\(room\.id\)\}/. Input:
        
        '// ============================================================\n' +
          '// CUSTOMER ROOMS SCRIPT\n' +
          '// File: frontend/customerJS/rooms.js\n' +
          '// Purpose:\n' +
          '// - Check customer access\n' +
          '// - Load accommodations\n' +
          '// - Filter rooms/cottages/function areas\n' +
          '// - Handle image viewer\n' +
          '// - Handle logout\n' +
          '// - Works from frontend/customerHTML/rooms.html\n' +
          '// ============================================================\n' +
          '\n' +
          '\n' +
          'let allRooms = [];\n' +
          'let currentFilter = "all";\n' +
          '// UI-43: Compact accommodation accordion for mobile / iPad, including\n' +
          '// touch devices in landscape. Desktop retains the full card presentation.\n' +
          'const ROOMS_ACCORDION_QUERY = "(max-width: 1199px), (pointer: coarse)";\n' +
          'let expandedRoomId = null;\n' +
          '\n' +
          'function isCompactRoomLayout() {\n' +
          '  return window.matchMedia(ROOMS_ACCORDION_QUERY).matches;\n' +
          '}\n' +
          '\n' +
          'function syncRoomAccordionState() {\n' +
          '  const compact = isCompactRoomLayout();\n' +
          '  document.querySelectorAll("#roomsContainer .room-ai-card").forEach((card) => {\n' +
          '    const button = card.querySelector(".room-accordion-toggle");\n' +
          '    const panel = card.querySelector(".room-accordion-panel");\n' +
          '    if (!button || !panel) return;\n' +
          '    const expanded = !compact || Number(card.dataset.roomId) === expandedRoomId;\n' +
          '    panel.hidden = !expanded;\n' +
          '    button.setAttribute("aria-expanded", String(expanded));\n' +
          '    card.classList.toggle("is-expanded", expanded);\n' +
          '  });\n' +
          '}\n' +
          '\n' +
          'function setupRoomAccordion() {\n' +
          '  const container = document.getElementById("roomsContainer");\n' +
          '  if (!container) return;\n' +
          '  container.addEventListener("click", (event) => {\n' +
          '    const toggle = event.target.closest(".room-accordion-toggle");\n' +
          '    if (!toggle || !container.contains(toggle) || !isCompactRoomLayout()) return;\n' +
          '    const id = Number(toggle.closest(".room-ai-card")?.dataset.roomId);\n' +
          '    if (!Number.isSafeInteger(id) || id < 1) return;\n' +
          '    expandedRoomId = expandedRoomId === id ? null : id;\n' +
          '    syncRoomAccordionState();\n' +
          '  });\n' +
          '  const media = window.matchMedia(ROOMS_ACCORDION_QUERY);\n' +
          '  if (typeof media.addEventListener === "function") {\n' +
          '    media.addEventListener("change", syncRoomAccordionState);\n' +
          '  } else if (typeof media.addListener === "function") {\n' +
          '    media.addListener(syncRoomAccordionState);\n' +
          '  }\n' +
          '}\n' +
          '\n' +
          'let currentViewerImages = [];\n' +
          'let currentViewerIndex = 0;\n' +
          'let currentViewerCaption = "Accommodation Photo";\n' +
          '\n' +
          'const FALLBACK_IMAGE =\n' +
          '  "data:image/svg+xml;charset=UTF-8," +\n' +
          '  encodeURIComponent(`\n' +
          '    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">\n' +
          '      <rect width="1200" height="720" fill="#eef8f7"/>\n' +
          '      <rect x="80" y="80" width="1040" height="560" rx="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="8"/>\n' +
          '      <circle cx="600" cy="310" r="74" fill="#dbeafe"/>\n' +
          '      <path d="M560 345l45-60 35 45 25-30 65 90H500l60-45z" fill="#14b8a6"/>\n' +
          '      <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#334155">\n' +
          '        Image unavailable\n' +
          '      </text>\n' +
          '    </svg>\n' +
          '  `);\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 1: Page startup\n' +
          '// ============================================================\n' +
          '\n' +
          'document.addEventListener("DOMContentLoaded", () => {\n' +
          '  checkCustomerAccess();\n' +
          '  setupLogout();\n' +
          '  setupCategoryFilters();\n' +
          '  setupRoomAccordion();\n' +
          '  setupImageViewerControls();\n' +
          '  loadRooms();\n' +
          '});\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 2: Customer access checker\n' +
          '// Redirects admin to admin dashboard and unauthenticated users to login.\n' +
          '// ============================================================\n' +
          '\n' +
          'function checkCustomerAccess() {\n' +
          '  const user = JSON.parse(localStorage.getItem("user"));\n' +
          '\n' +
          '  if (!user) {\n' +
          '    window.location.href = "../authHTML/login.html";\n' +
          '    return;\n' +
          '  }\n' +
          '\n' +
          '  if (user.role === "admin" || user.role === "staff") {\n' +
          '    window.location.href = "../adminHTML/admin.html";\n' +
          '  }\n' +
          '}\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 3: Logout\n' +
          '// Handles desktop and mobile logout.\n' +
          '// ============================================================\n' +
          '\n' +
          'function setupLogout() {\n' +
          '  const logoutBtns = [\n' +
          '    document.getElementById("logoutBtn"),\n' +
          '    document.getElementById("mobileLogoutBtn"),\n' +
          '  ].filter(Boolean);\n' +
          '\n' +
          '  logoutBtns.forEach((btn) => {\n' +
          '    btn.addEventListener("click", (e) => {\n' +
          '      e.preventDefault();\n' +
          '\n' +
          '      localStorage.removeItem("user");\n' +
          '      sessionStorage.removeItem("customerToken"); // Clear signed session on confirmed logout.\n' +
          '\n' +
          '      if (typeof showToast === "function") {\n' +
          '        showToast("Logged out successfully.", "success");\n' +
          '      } else {\n' +
          '        alert("Logged out successfully.");\n' +
          '      }\n' +
          '\n' +
          '      setTimeout(() => {\n' +
          '        window.location.href = "../authHTML/login.html";\n' +
          '      }, 700);\n' +
          '    });\n' +
          '  });\n' +
          '}\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 4: Category filters\n' +
          '// ============================================================\n' +
          '\n' +
          'function setupCategoryFilters() {\n' +
          '  const filterButtons = document.querySelectorAll(".category-filter-btn");\n' +
          '\n' +
          '  filterButtons.forEach((button) => {\n' +
          '    button.addEventListener("click", () => {\n' +
          '      currentFilter = button.dataset.filter || "all";\n' +
          '\n' +
          '      filterButtons.forEach((btn) => btn.classList.remove("active"));\n' +
          '      button.classList.add("active");\n' +
          '\n' +
          '      renderRooms(getFilteredRooms());\n' +
          '    });\n' +
          '  });\n' +
          '}\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 5: Load accommodations from backend\n' +
          '// ============================================================\n' +
          '\n' +
          'async function loadRooms() {\n' +
          '  const container = document.getElementById("roomsContainer");\n' +
          '  if (!container) return;\n' +
          '\n' +
          '  try {\n' +
          '    container.innerHTML = renderRoomMessage(\n' +
          '      "Loading available accommodations...",\n' +
          '      "#475569",\n' +
          '      "rgba(219,231,239,0.92)"\n' +
          '    );\n' +
          '\n' +
          '    updateCategoryCount("Loading...");\n' +
          '\n' +
          '    const response = await fetch(`${API_BASE}/rooms/available`);\n' +
          '    const data = await response.json();\n' +
          '\n' +
          '    if (!response.ok) {\n' +
          '      throw new Error(data.message || "Failed to load accommodations.");\n' +
          '    }\n' +
          '\n' +
          '    allRooms = Array.isArray(data) ? data : data.rooms || [];\n' +
          '\n' +
          '    renderRooms(getFilteredRooms());\n' +
          '    focusRequestedAiAccommodation();\n' +
          '  } catch (error) {\n' +
          '    console.error("loadRooms error:", error);\n' +
          '\n' +
          '    container.innerHTML = renderRoomMessage(\n' +
          '      "Failed to load accommodations.",\n' +
          '      "#991b1b",\n' +
          '      "#fecaca"\n' +
          '    );\n' +
          '\n' +
          '    updateCategoryCount("0 shown");\n' +
          '  }\n' +
          '}\n' +
          '\n' +
          `// An AI preview's "View Details" link opens the real catalog and focuses\n` +
          '// the matching accommodation. It does NOT claim the slot is booked/available.\n' +
          'function focusRequestedAiAccommodation() {\n' +
          '  const id = Number(new URLSearchParams(window.location.search).get("room_id"));\n' +
          '  if (!Number.isSafeInteger(id) || id < 1) return;\n' +
          '  const card = document.getElementById("room-card-" + id);\n' +
          '  if (!card) return;\n' +
          '  // A deep-linked AI recommendation must show its information immediately\n' +
          '  // even when the tablet/phone defaults to collapsed accommodations.\n' +
          '  if (isCompactRoomLayout()) {\n' +
          '    expandedRoomId = id;\n' +
          '    syncRoomAccordionState();\n' +
          '  }\n' +
          '  card.classList.add("ai-room-focused");\n' +
          '  window.requestAnimationFrame(() => card.scrollIntoView({\n' +
          '    behavior: "smooth", block: "center",\n' +
          '  }));\n' +
          '}\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 6: Filter helpers\n' +
          '// ============================================================\n' +
          '\n' +
          'function getFilteredRooms() {\n' +
          '  if (currentFilter === "all") return allRooms;\n' +
          '\n' +
          '  return allRooms.filter((room) => {\n' +
          '    const group = getAccommodationGroup(room.category_name, room.name);\n' +
          '    return group === currentFilter;\n' +
          '  });\n' +
          '}\n' +
          '\n' +
          'function getAccommodationGroup(categoryName, roomName = "") {\n' +
          '  const category = String(categoryName || "").toLowerCase();\n' +
          '  const name = String(roomName || "").toLowerCase();\n' +
          '  const combined = `${category} ${name}`;\n' +
          '\n' +
          '  if (\n' +
          '    combined.includes("function") ||\n' +
          '    combined.includes("pavilion") ||\n' +
          '    combined.includes("pavillion") ||\n' +
          '    combined.includes("event") ||\n' +
          '    combined.includes("hall")\n' +
          '  ) {\n' +
          '    return "function-areas";\n' +
          '  }\n' +
          '\n' +
          '  if (\n' +
          '    combined.includes("room") ||\n' +
          '    combined.includes("villa") ||\n' +
          '    combined.includes("suite") ||\n' +
          '    combined.includes("hotel")\n' +
          '  ) {\n' +
          '    return "rooms";\n' +
          '  }\n' +
          '\n' +
          '  if (\n' +
          '    combined.includes("cottage") ||\n' +
          '    combined.includes("shade") ||\n' +
          '    combined.includes("kubo") ||\n' +
          '    combined.includes("nipa") ||\n' +
          '    combined.includes("hut") ||\n' +
          '    combined.includes("cabana")\n' +
          '  ) {\n' +
          '    return "cottages";\n' +
          '  }\n' +
          '\n' +
          '  return "cottages";\n' +
          '}\n' +
          '\n' +
          '// ============================================================\n' +
          '// SECTION 7: Render accommodation cards\n' +
          '// ============================================================\n' +
          '\n' +
          'function renderRooms(rooms) {\n' +
          '  const container = document.getElementById("roomsContainer");\n' +
          '  if (!container) return;\n' +
          '\n' +
          '  updateCategoryCount(`${rooms.length} shown`);\n' +
          '\n' +
          '  if (!allRooms.length) {\n' +
          '    container.innerHTML = renderRoomMessage(\n' +
          '      "No available accommodations found right now.",\n' +
          '      "#475569",\n' +
          '      "rgba(219,231,239,0.92)"\n' +
          '    );\n' +
          '    return;\n' +
          '  }\n' +
          '\n' +
          '  if (!rooms.length) {\n' +
          '    container.innerHTML = renderRoomMessage(\n' +
          '      "No accommodations found for this category.",\n' +
          '      "#475569",\n' +
          '      "rgba(219,231,239,0.92)"\n' +
          '    );\n' +
          '    return;\n' +
          '  }\n' +
          '\n' +
          "  // If filters removed the open accommodation, don't expand another by mistake.\n" +
          '  if (!rooms.some(room => Number(room.id) === expandedRoomId)) {\n' +
          '    expandedRoomId = null;\n' +
          '  }\n' +
          '  const compact = isCompactRoomLayout();\n' +
          '  container.innerHTML = rooms\n' +
          '    .map((room) => {\n' +
          '      const rawImage = room.image || "";\n' +
          '      const imageSrc = escapeHtml(resolveImagePath(rawImage));\n' +
          '      const itemName = escapeHtml(room.name || "N/A");\n' +
          '\n' +
          '      const itemDescription = escapeHtml(\n' +
          '        room.description || "No description available."\n' +
          '      );\n' +
          '\n' +
          '      const categoryName = escapeHtml(room.category_name || "Accommodation");\n' +
          '\n' +
          '      const displayGroup = getGroupLabel(\n' +
          '        getAccommodationGroup(room.category_name, room.name)\n' +
          '      );\n' +
          '\n' +
          '      const mapLabel = escapeHtml(room.map_label || "Not set");\n' +
          '      const dayPrice = formatMoney(room.day_price);\n' +
          '      const overnightPrice = format'... 15846 more characters
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        // ============================================================
        // CUSTOMER ROOMS SCRIPT
        // File: frontend/customerJS/rooms.js
        // Purpose:
        // - Check customer access
        // - Load accommodations
        // - Filter rooms/cottages/function areas
        // - Handle image viewer
        // - Handle logout
        // - Works from frontend/customerHTML/rooms.html
        // ============================================================
        
        
        let allRooms = [];
        let currentFilter = "all";
        // UI-43: Compact accommodation accordion for mobile / iPad, including
        // touch devices in landscape. Desktop retains the full card presentation.
        const ROOMS_ACCORDION_QUERY = "(max-width: 1199px), (pointer: coarse)";
        let expandedRoomId = null;
        
        function isCompactRoomLayout() {
          return window.matchMedia(ROOMS_ACCORDION_QUERY).matches;
        }
        
        function syncRoomAccordionState() {
          const compact = isCompactRoomLayout();
          document.querySelectorAll("#roomsContainer .room-ai-card").forEach((card) => {
            const button = card.querySelector(".room-accordion-toggle");
            const panel = card.querySelector(".room-accordion-panel");
            if (!button || !panel) return;
            const expanded = !compact || Number(card.dataset.roomId) === expandedRoomId;
            panel.hidden = !expanded;
            button.setAttribute("aria-expanded", String(expanded));
            card.classList.toggle("is-expanded", expanded);
          });
        }
        
        function setupRoomAccordion() {
          const container = document.getElementById("roomsContainer");
          if (!container) return;
          container.addEventListener("click", (event) => {
            const toggle = event.target.closest(".room-accordion-toggle");
            if (!toggle || !container.contains(toggle) || !isCompactRoomLayout()) return;
            const id = Number(toggle.closest(".room-ai-card")?.dataset.roomId);
            if (!Number.isSafeInteger(id) || id < 1) return;
            expandedRoomId = expandedRoomId === id ? null : id;
            syncRoomAccordionState();
          });
          const media = window.matchMedia(ROOMS_ACCORDION_QUERY);
          if (typeof media.addEventListener === "function") {
            media.addEventListener("change", syncRoomAccordionState);
          } else if (typeof media.addListener === "function") {
            media.addListener(syncRoomAccordionState);
          }
        }
        
        let currentViewerImages = [];
        let currentViewerIndex = 0;
        let currentViewerCaption = "Accommodation Photo";
        
        const FALLBACK_IMAGE =
          "data:image/svg+xml;charset=UTF-8," +
          encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="720" viewBox="0 0 1200 720">
              <rect width="1200" height="720" fill="#eef8f7"/>
              <rect x="80" y="80" width="1040" height="560" rx="42" fill="#ffffff" stroke="#cbd5e1" stroke-width="8"/>
              <circle cx="600" cy="310" r="74" fill="#dbeafe"/>
              <path d="M560 345l45-60 35 45 25-30 65 90H500l60-45z" fill="#14b8a6"/>
              <text x="600" y="480" text-anchor="middle" font-family="Arial, sans-serif" font-size="38" font-weight="700" fill="#334155">
                Image unavailable
              </text>
            </svg>
          `);
        
        // ============================================================
        // SECTION 1: Page startup
        // ============================================================
        
        document.addEventListener("DOMContentLoaded", () => {
          checkCustomerAccess();
          setupLogout();
          setupCategoryFilters();
          setupRoomAccordion();
          setupImageViewerControls();
          loadRooms();
        });
        
        // ============================================================
        // SECTION 2: Customer access checker
        // Redirects admin to admin dashboard and unauthenticated users to login.
        // ============================================================
        
        function checkCustomerAccess() {
          const user = JSON.parse(localStorage.getItem("user"));
        
          if (!user) {
            window.location.href = "../authHTML/login.html";
            return;
          }
        
          if (user.role === "admin" || user.role === "staff") {
            window.location.href = "../adminHTML/admin.html";
          }
        }
        
        // ============================================================
        // SECTION 3: Logout
        // Handles desktop and mobile logout.
        // ============================================================
        
        function setupLogout() {
          const logoutBtns = [
            document.getElementById("logoutBtn"),
            document.getElementById("mobileLogoutBtn"),
          ].filter(Boolean);
        
          logoutBtns.forEach((btn) => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
        
              localStorage.removeItem("user");
              sessionStorage.removeItem("customerToken"); // Clear signed session on confirmed logout.
        
              if (typeof showToast === "function") {
                showToast("Logged out successfully.", "success");
              } else {
                alert("Logged out successfully.");
              }
        
              setTimeout(() => {
                window.location.href = "../authHTML/login.html";
              }, 700);
            });
          });
        }
        
        // ============================================================
        // SECTION 4: Category filters
        // ============================================================
        
        function setupCategoryFilters() {
          const filterButtons = document.querySelectorAll(".category-filter-btn");
        
          filterButtons.forEach((button) => {
            button.addEventListener("click", () => {
              currentFilter = button.dataset.filter || "all";
        
              filterButtons.forEach((btn) => btn.classList.remove("active"));
              button.classList.add("active");
        
              renderRooms(getFilteredRooms());
            });
          });
        }
        
        // ============================================================
        // SECTION 5: Load accommodations from backend
        // ============================================================
        
        async function loadRooms() {
          const container = document.getElementById("roomsContainer");
          if (!container) return;
        
          try {
            container.innerHTML = renderRoomMessage(
              "Loading available accommodations...",
              "#475569",
              "rgba(219,231,239,0.92)"
            );
        
            updateCategoryCount("Loading...");
        
            const response = await fetch(`${API_BASE}/rooms/available`);
            const data = await response.json();
        
            if (!response.ok) {
              throw new Error(data.message || "Failed to load accommodations.");
            }
        
            allRooms = Array.isArray(data) ? data : data.rooms || [];
        
            renderRooms(getFilteredRooms());
            focusRequestedAiAccommodation();
          } catch (error) {
            console.error("loadRooms error:", error);
        
            container.innerHTML = renderRoomMessage(
              "Failed to load accommodations.",
              "#991b1b",
              "#fecaca"
            );
        
            updateCategoryCount("0 shown");
          }
        }
        
        // An AI preview's "View Details" link opens the real catalog and focuses
        // the matching accommodation. It does NOT claim the slot is booked/available.
        function focusRequestedAiAccommodation() {
          const id = Number(new URLSearchParams(window.location.search).get("room_id"));
          if (!Number.isSafeInteger(id) || id < 1) return;
          const card = document.getElementById("room-card-" + id);
          if (!card) return;
          // A deep-linked AI recommendation must show its information immediately
          // even when the tablet/phone defaults to collapsed accommodations.
          if (isCompactRoomLayout()) {
            expandedRoomId = id;
            syncRoomAccordionState();
          }
          card.classList.add("ai-room-focused");
          window.requestAnimationFrame(() => card.scrollIntoView({
            behavior: "smooth", block: "center",
          }));
        }
        
        // ============================================================
        // SECTION 6: Filter helpers
        // ============================================================
        
        function getFilteredRooms() {
          if (currentFilter === "all") return allRooms;
        
          return allRooms.filter((room) => {
            const group = getAccommodationGroup(room.category_name, room.name);
            return group === currentFilter;
          });
        }
        
        function getAccommodationGroup(categoryName, roomName = "") {
          const category = String(categoryName || "").toLowerCase();
          const name = String(roomName || "").toLowerCase();
          const combined = `${category} ${name}`;
        
          if (
            combined.includes("function") ||
            combined.includes("pavilion") ||
            combined.includes("pavillion") ||
            combined.includes("event") ||
            combined.includes("hall")
          ) {
            return "function-areas";
          }
        
          if (
            combined.includes("room") ||
            combined.includes("villa") ||
            combined.includes("suite") ||
            combined.includes("hotel")
          ) {
            return "rooms";
          }
        
          if (
            combined.includes("cottage") ||
            combined.includes("shade") ||
            combined.includes("kubo") ||
            combined.includes("nipa") ||
            combined.includes("hut") ||
            combined.includes("cabana")
          ) {
            return "cottages";
          }
        
          return "cottages";
        }
        
        // ============================================================
        // SECTION 7: Render accommodation cards
        // ============================================================
        
        function renderRooms(rooms) {
          const container = document.getElementById("roomsContainer");
          if (!container) return;
        
          updateCategoryCount(`${rooms.length} shown`);
        
          if (!allRooms.length) {
            container.innerHTML = renderRoomMessage(
              "No available accommodations found right now.",
              "#475569",
              "rgba(219,231,239,0.92)"
            );
            return;
          }
        
          if (!rooms.length) {
            container.innerHTML = renderRoomMessage(
              "No accommodations found for this category.",
              "#475569",
              "rgba(219,231,239,0.92)"
            );
            return;
          }
        
          // If filters removed the open accommodation, don't expand another by mistake.
          if (!rooms.some(room => Number(room.id) === expandedRoomId)) {
            expandedRoomId = null;
          }
          const compact = isCompactRoomLayout();
          container.innerHTML = rooms
            .map((room) => {
              const rawImage = room.image || "";
              const imageSrc = escapeHtml(resolveImagePath(rawImage));
              const itemName = escapeHtml(room.name || "N/A");
        
              const itemDescription = escapeHtml(
                room.description || "No description available."
              );
        
              const categoryName = escapeHtml(room.category_name || "Accommodation");
        
              const displayGroup = getGroupLabel(
                getAccommodationGroup(room.category_name, room.name)
              );
        
              const mapLabel = escapeHtml(room.map_label || "Not set");
              const dayPrice = formatMoney(room.day_price);
              const overnightPrice = formatMoney(room.overnight_price);
              const extendedPrice = formatMoney(room.extended_price);
              const maxCapacity = room.max_capacity || 0;
              const status = capitalize(room.status || "available");
              const extendedSlotLabel = getExtendedLabel(room.category_name, true);
              const roomId = Number(room.id);
              const initiallyExpanded = !compact || expandedRoomId === roomId;
              const compactPrices = [
                Number(room.day_price) > 0 ? "Day ₱" + dayPrice : "",
                Number(room.overnight_price) > 0 ? "Night ₱" + overnightPrice : "",
              ].filter(Boolean).join(" · ") || "Ask for rates";
        
              const galleryImages = Array.isArray(room.gallery_images)
                ? room.gallery_images
                : [];
        
              const galleryStrip = galleryImages.length
                ? `
                  <div class="room-gallery-strip">
                    ${galleryImages
                      .slice(0, 8)
                      .map((img) => {
                        const resolvedImage = resolveImagePath(img);
        
                        return `
                          <img
                            src="${escapeHtml(resolvedImage)}"
                            alt="${itemName} photo"
                            onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(img)}', '${escapeForJs(room.name || "Accommodation")}')"
                            style="cursor:pointer;"
                            onerror="this.onerror=null; this.src=FALLBACK_IMAGE;"
                          />
                        `;
                      })
                      .join("")}
                  </div>
                `
                : "";
        
              return `
                <article class="room-ai-card${initiallyExpanded ? " is-expanded" : ""}"
                  id="room-card-${roomId}" data-room-id="${roomId}">
                  <button type="button" class="room-accordion-toggle"
                    aria-controls="room-panel-${roomId}"
                    aria-expanded="${initiallyExpanded}"
                    aria-label="View details for ${itemName}">
                    <img class="room-accordion-thumb" src="${imageSrc}" alt=""
                      loading="lazy"
                      onerror="this.onerror=null;this.src=FALLBACK_IMAGE;" />
                    <span class="room-accordion-main">
                      <span class="room-accordion-name">${itemName}</span>
                      <span class="room-accordion-subtitle">Up to ${maxCapacity} guests · ${displayGroup}</span>
                      <span class="room-accordion-price">${compactPrices}</span>
                    </span>
                    <span class="room-accordion-chevron" aria-hidden="true"></span>
                  </button>
                  <section class="room-accordion-panel" id="room-panel-${roomId}"
                    aria-label="${itemName} details" role="region"${initiallyExpanded ? "" : " hidden"}>
                  <div class="room-photo-wrap">
                    <img
                      src="${imageSrc}"
                      alt="${itemName}"
                      onclick="openImageViewerFromRoom(${room.id}, '${escapeForJs(rawImage)}', '${escapeForJs(room.name || "Accommodation")}')"
                      style="cursor:pointer;"
                      onerror="this.onerror=null; this.src=FALLBACK_IMAGE;"
                    />
        
                    <div style="
                      position: absolute;
                      top: 14px;
                      left: 14px;
                      background: rgba(15, 23, 42, 0.82);
                      color: white;
                      padding: 8px 12px;
                      border-radius: 999px;
                      font-size: 0.84rem;
                      font-weight: 700;
                      backdrop-filter: blur(8px);
                    ">
                      ${displayGroup}
                    </div>
        
                    <div style="
                      position: absolute;
                      top: 14px;
                      right: 14px;
                      background: rgba(255,255,255,0.92);
                      color: #0f172a;
                      padding: 8px 12px;
                      border-radius: 999px;
                      font-size: 0.82rem;
                      font-weight: 800;
                    ">
                      ${status}
                    </div>
                  </div>
        
                  ${galleryStrip}
        
                  <div class="room-ai-content">
                    <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;">
                      <h3 style="margin:0;">${itemName}</h3>
                    </div>
        
                    <p>${itemDescription}</p>
        
                    <div class="room-customer-inclusions">
                      <strong>Amenities / Inclusions:</strong>
                      ${formatAmenitiesList(room.amenities)}
                    </div>
        
                    <div class="room-price">Best for up to ${maxCapacity} pax</div>
        
                    <div class="room-ai-meta">
                      <div><strong>Category</strong><br>${categoryName}</div>
                      <div><strong>Type</strong><br>${displayGroup}</div>
                      <div><strong>Max Capacity</strong><br>${maxCapacity} guest(s)</div>
                      <div><strong>Morning / Day Tour</strong><br>₱${dayPrice}</div>
                      <div><strong>Evening / Overnight</strong><br>₱${overnightPrice}</div>
                      <div><strong>${extendedSlotLabel}</strong><br>₱${extendedPrice}</div>
                      <div><strong>Map Location</strong><br>${mapLabel}</div>
                      <div><strong>Photos</strong><br>${
                        galleryImages.length
                          ? galleryImages.length + " gallery photo(s)"
                          : "Cover photo only"
                      }</div>
                    </div>
        
                    <div class="room-ai-amenities">
                      <strong>Schedule Preview:</strong><br>
                      Day Tour: ${formatTimeRange(room.day_start_time, room.day_end_time)}<br>
                      Overnight: ${formatTimeRange(room.overnight_start_time, room.overnight_end_time)}<br>
                      ${extendedSlotLabel}: ${formatTimeRange(room.extended_start_time, room.extended_end_time)}
                    </div>
        
                    <div class="room-ai-actions">
                      <a href="booking.html?room_id=${room.id}" class="book-now-btn">
                        Reserve This
                      </a>
        
                      <button
                        type="button"
                        class="ask-ai-btn"
                        onclick="openAiForRoom('${escapeForJs(room.name || "")}', ${room.id})"
                      >
                        Ask AI About This
                      </button>
                    </div>
                  </div>
                  </section>
                </article>
              `;
            })
            .join("");
          syncRoomAccordionState();
        }
        
        // ============================================================
        // SECTION 8: Simple message renderer
        // ============================================================
        
        function renderRoomMessage(message, textColor, borderColor) {
          return `
            <div style="grid-column: 1 / -1;">
              <div style="
                background: rgba(255,255,255,0.95);
                border: 1px solid ${borderColor};
                border-radius: 24px;
                padding: 24px;
                text-align: center;
                color: ${textColor};
                box-shadow: 0 12px 28px rgba(15,23,42,0.08);
                font-weight: 700;
              ">
                ${message}
              </div>
            </div>
          `;
        }
        
        function updateCategoryCount(text) {
          const categoryCount = document.getElementById("categoryCount");
        
          if (categoryCount) {
            categoryCount.textContent = text;
          }
        }
        
        // ============================================================
        // SECTION 9: Labels and AI helper
        // ============================================================
        
        function getGroupLabel(group) {
          if (group === "rooms") return "Rooms";
          if (group === "function-areas") return "Function Areas";
          if (group === "cottages") return "Cottages";
          return "All";
        }
        
        function getExtendedLabel(categoryName, isExtended = true) {
          const value = String(categoryName || "").toLowerCase();
        
          if (!isExtended) return "Day Tour";
        
          if (value.includes("room")) return "22 Hours";
          return "23 Hours";
        }
        
        function openAiForRoom(roomName, roomId) {
          const chatWindow = document.getElementById("aiChatWindow");
          const input = document.getElementById("aiChatInput");
        
          if (chatWindow) {
            chatWindow.classList.add("show");
          }
        
          if (input) {
            // The button opens details for this exact room, not a generic room search.
            input.value = `Tell me more about ${roomName}.`;
            input.focus();
          }
        
          try {
            const savedContext = JSON.parse(
              localStorage.getItem("smartresort_ai_context_v1") || "{}"
            );
        
            savedContext.room_name = roomName;
            savedContext.room_id = roomId;
        
            localStorage.setItem(
              "smartresort_ai_context_v1",
              JSON.stringify(savedContext)
            );
          } catch (error) {
            console.error("openAiForRoom context save error:", error);
          }
        }
        
        // ============================================================
        // SECTION 10: Image viewer
        // ============================================================
        
        function openImageViewerFromRoom(
          roomId,
          selectedImage,
          captionText = "Accommodation Photo"
        ) {
          const room = allRooms.find((item) => Number(item.id) === Number(roomId));
        
          const images = [];
        
          if (room && room.image) {
            images.push(room.image);
          }
        
          if (room && Array.isArray(room.gallery_images)) {
            room.gallery_images.forEach((img) => {
              if (img && !images.includes(img)) {
                images.push(img);
              }
            });
          }
        
          if (!images.length) {
            images.push(selectedImage || "");
          }
        
          const selectedIndex = images.findIndex((img) => img === selectedImage);
        
          currentViewerImages = images;
          currentViewerIndex = selectedIndex >= 0 ? selectedIndex : 0;
          currentViewerCaption = captionText || "Accommodation Photo";
        
          showCurrentViewerImage();
        }
        
        function showCurrentViewerImage() {
          const modal = document.getElementById("imageViewerModal");
          const image = document.getElementById("imageViewerImg");
          const caption = document.getElementById("imageViewerCaption");
          const counter = document.getElementById("imageViewerCounter");
        
          if (!modal || !image || !caption) return;
        
          const currentImage =
            currentViewerImages[currentViewerIndex] || "";
        
          image.src = resolveImagePath(currentImage);
          image.onerror = () => {
            image.onerror = null;
            image.src = FALLBACK_IMAGE;
          };
        
          caption.textContent = currentViewerCaption;
        
          if (counter) {
            counter.textContent = `${currentViewerIndex + 1} of ${
              currentViewerImages.length
            }`;
          }
        
          modal.classList.add("show");
        }
        
        function showPreviousImage() {
          if (!currentViewerImages.length) return;
        
          currentViewerIndex =
            (currentViewerIndex - 1 + currentViewerImages.length) %
            currentViewerImages.length;
        
          showCurrentViewerImage();
        }
        
        function showNextImage() {
          if (!currentViewerImages.length) return;
        
          currentViewerIndex = (currentViewerIndex + 1) % currentViewerImages.length;
        
          showCurrentViewerImage();
        }
        
        function closeImageViewer() {
          const modal = document.getElementById("imageViewerModal");
          const image = document.getElementById("imageViewerImg");
        
          if (!modal || !image) return;
        
          modal.classList.remove("show");
          image.src = "";
          currentViewerImages = [];
          currentViewerIndex = 0;
        }
        
        function setupImageViewerControls() {
          document.addEventListener("click", (e) => {
            const modal = document.getElementById("imageViewerModal");
            const closeBtn = document.getElementById("imageViewerClose");
            const prevBtn = document.getElementById("imageViewerPrev");
            const nextBtn = document.getElementById("imageViewerNext");
        
            if (!modal) return;
        
            if (e.target === closeBtn) {
              closeImageViewer();
            }
        
            if (e.target === prevBtn) {
              showPreviousImage();
            }
        
            if (e.target === nextBtn) {
              showNextImage();
            }
        
            if (e.target === modal) {
              closeImageViewer();
            }
          });
        
          document.addEventListener("keydown", (e) => {
            const modal = document.getElementById("imageViewerModal");
        
            if (!modal || !modal.classList.contains("show")) return;
        
            if (e.key === "Escape") {
              closeImageViewer();
            }
        
            if (e.key === "ArrowLeft") {
              showPreviousImage();
            }
        
            if (e.key === "ArrowRight") {
              showNextImage();
            }
          });
        }
        
        // ============================================================
        // SECTION 11: Image path resolver
        // Fixes image paths because rooms.html is now inside customerHTML.
        // ============================================================
        
        function resolveImagePath(value) {
          const imagePath = String(value || "").trim();
        
          if (!imagePath) {
            return FALLBACK_IMAGE;
          }
        
          if (
            imagePath.startsWith("http://") ||
            imagePath.startsWith("https://") ||
            imagePath.startsWith("data:") ||
            imagePath.startsWith("blob:")
          ) {
            return imagePath;
          }
        
          /*
            Local Live Server setup:
            URL usually looks like:
            http://127.0.0.1:5500/frontend/customerHTML/rooms.html
        
            Because rooms.html is inside frontend/customerHTML,
            local image paths must go back one folder:
            ../images/accommodations/...
          */
          const isLocalLiveServer =
            window.location.hostname === "127.0.0.1" ||
            window.location.hostname === "localhost";
        
          const isInsideFrontendFolder =
            window.location.pathname.includes("/frontend/");
        
          const cleanPath = imagePath
            .replace(/^\.\.\//, "")
            .replace(/^\/+/, "");
        
          if (cleanPath.startsWith("frontend/images/")) {
            const withoutFrontend = cleanPath.replace(/^frontend\//, "");
        
            if (isLocalLiveServer && isInsideFrontendFolder) {
              return `../${withoutFrontend}`;
            }
        
            return `/${withoutFrontend}`;
          }
        
          if (cleanPath.startsWith("images/")) {
            if (isLocalLiveServer && isInsideFrontendFolder) {
              return `../${cleanPath}`;
            }
        
            return `/${cleanPath}`;
          }
        
          // Photo bytes are kept in Aiven. Resolve its /api/rooms/media/:id
          // path through the configured backend, not the Vercel/Live Server origin.
          if (/^api\/rooms\/media\/[1-9]\d*$/.test(cleanPath)) {
            return `${API_BASE.replace(/\/api\/?$/, "")}/${cleanPath}`;
          }
        
          if (cleanPath.startsWith("uploads/")) {
            return `${API_BASE.replace("/api", "")}/${cleanPath}`;
          }
        
          if (isLocalLiveServer && isInsideFrontendFolder) {
            return `../${cleanPath}`;
          }
        
          return `/${cleanPath}`;
        }
        
        
        // ============================================================
        // SECTION 11A: Amenities formatter
        // Converts multiline amenities/inclusions into a clean customer bullet list.
        // ============================================================
        
        function formatAmenitiesList(value) {
          const items = String(value || "")
            .split(/\r?\n|,/)
            .map((item) => item.trim())
            .filter(Boolean);
        
          if (!items.length) {
            return `<p class="empty-customer-inclusions">No amenities or inclusions listed.</p>`;
          }
        
          return `
            <ul class="customer-amenities-list">
              ${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
            </ul>
          `;
        }
        
        // ============================================================
        // SECTION 12: Format and escape helpers
        // ============================================================
        
        function formatMoney(value) {
          const num = Number(value || 0);
        
          return num.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
        }
        
        function formatTimeRange(start, end) {
          return `${formatTimeDisplay(start)} - ${formatTimeDisplay(end)}`;
        }
        
        function formatTimeDisplay(value) {
          if (!value) return "N/A";
        
          const timeText = String(value).trim();
          const parts = timeText.split(":");
        
          if (parts.length < 2) return timeText;
        
          let hours = Number(parts[0]);
          const minutes = parts[1];
        
          if (Number.isNaN(hours)) return timeText;
        
          const suffix = hours >= 12 ? "PM" : "AM";
        
          hours = hours % 12;
        
          if (hours === 0) {
            hours = 12;
          }
        
          return `${hours}:${minutes} ${suffix}`;
        }
        
        function capitalize(text) {
          if (!text) return "";
        
          const value = String(text);
        
          return value
            .split(" ")
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ");
        }
        
        function escapeHtml(value) {
          return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
        }
        
        function escapeForJs(value) {
          return String(value || "")
            .replace(/\\/g, "\\\\")
            .replace(/'/g, "\\'")
            .replace(/"/g, '\\"');
        }
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:83:10)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 128 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 12.124609
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 129 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.950545
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 130 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.309066
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 131 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.038228
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 132 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 4.338388
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 133 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 25.529478
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 134 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.941156
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 135 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.475868
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 136 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.941267
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 137 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.454188
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 138 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.565937
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 139 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 5.284643
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 140 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.886384
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 141 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.333344
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 142 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.697281
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 143 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.764006
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 144 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.676383
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 145 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.530189
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 146 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 1.925544
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 147 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.796707
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 148 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.795095
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 149 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.345805
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 150 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.189784
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 151 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.523648
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 152 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.306983
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 153 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 7.493596
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 154 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 2.873553
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 155 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.491945
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 156 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.56286
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 157 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.871937
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 158 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.655654
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 159 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.566107
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 160 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.605465
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 161 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 2.141005
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 162 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 24.297458
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 163 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.749358
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 164 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.437406
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 165 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.393264
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 166 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.374068
      type: 'test'
      ...
