# AI Mock Regression — testing branch

Source commit: 5acb6b81967bb317c112a85de22f3795a0d1034e
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 0.660707
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.221885
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 226.163498
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.109174
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.306232
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    not ok 6 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 98.046654
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:207:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:217:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async startSubtestAfterBootstrap (node:internal/test_runner/harness:296:3)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    not ok 7 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 6.989102
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:229:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:239:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    not ok 8 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 3.90141
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:247:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:252:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 9 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 4.950624
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 10 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 2.481967
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 11 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 1.642009
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    not ok 12 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 5.1139
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:288:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_accommodation_count'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_accommodation_count'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:308:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    not ok 13 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 4.315986
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:340:1'
      failureType: 'testCodeFailure'
      error: 'The "string" argument must be of type string. Received type undefined (undefined)'
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:349:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    not ok 14 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.543189
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:363:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_cheapest_accommodation'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:375:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    not ok 15 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 2.455006
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:383:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_cheapest_accommodation'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:394:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    not ok 16 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 1.922993
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:403:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_cheapest_accommodation'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:417:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    not ok 17 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 4.343608
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:438:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_cheapest_accommodation'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_cheapest_accommodation'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:443:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    not ok 18 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 2.270928
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:450:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:462:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    not ok 19 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 1.861891
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:479:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_accommodation_count'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_accommodation_count'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:484:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    not ok 20 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 2.864074
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:496:1'
      failureType: 'testCodeFailure'
      error: |-
        Ilang available na rooms meron kayo?
        + actual - expected
        
        + undefined
        - 'verified_accommodation_count'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_accommodation_count'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:513:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    not ok 21 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 1.52383
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:523:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:528:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    not ok 22 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 1.756142
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:539:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'recommendation_needs_guest_count'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'recommendation_needs_guest_count'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:548:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    not ok 23 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 2.223207
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:572:1'
      failureType: 'testCodeFailure'
      error: |-
        4
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:582:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    not ok 24 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 1.883644
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:589:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:597:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    not ok 25 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 1.86808
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:612:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        + actual - expected
        
        + undefined
        - 'verified_accommodation_preview'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 'verified_accommodation_preview'
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:614:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    not ok 26 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 1.638113
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:619:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:621:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    not ok 27 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 1.872788
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:637:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:653:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    not ok 28 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 1.813448
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:684:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:697:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Invalid same-day reversed times never query availability
    not ok 29 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 2.209155
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:718:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:722:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    not ok 30 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 1.893438
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:726:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:728:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    not ok 31 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 2.044767
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:743:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:747:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Alternative schedule checks active reservation_items without writing
    not ok 32 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 1.920319
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:752:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:757:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 33 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.220492
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Spanish text chat overrides an older English chat-language preference
    not ok 34 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 1.951376
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:783:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:788:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    not ok 35 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 5.580646
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:792:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:797:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    not ok 36 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.026479
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:801:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:807:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    not ok 37 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 2.076535
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:811:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:817:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    not ok 38 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 3.401721
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:823:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:827:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    not ok 39 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 1.905417
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:845:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:850:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    not ok 40 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.153682
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:856:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:860:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: English translation route responds with the English text
    ok 41 - English translation route responds with the English text
      ---
      duration_ms: 2.135404
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    not ok 42 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 1.879197
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:877:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:882:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    not ok 43 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 1.867609
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:888:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 503
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 503
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:891:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 44 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 1.850473
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 45 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.645354
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    not ok 46 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 1.833398
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:920:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:922:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini English translation failed (HTTP 429).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Admin price update is reflected immediately without stale AI cache
    not ok 47 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.900979
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:948:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:951:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    # Gemini request failed (HTTP 500).
    not ok 48 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 1.915903
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:961:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:970:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    not ok 49 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.63618
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:981:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:991:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    not ok 50 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.515728
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:997:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:999:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    not ok 51 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.672364
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1004:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1007:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    not ok 52 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 1.976003
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1015:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1021:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    not ok 53 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 1.833768
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1038:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1043:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    not ok 54 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.174172
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1054:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1059:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    not ok 55 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 1.805937
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1065:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1072:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    not ok 56 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.261274
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1079:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1083:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    not ok 57 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.656321
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1093:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 429
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 429
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1097:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    not ok 58 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 1.722271
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1102:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1108:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    not ok 59 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 2.220171
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1116:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1127:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Quota fallback never guesses check-in dates from free-text
    not ok 60 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 1.989323
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1138:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1144:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    not ok 61 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 1.848872
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1157:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1163:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    not ok 62 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 4.447104
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1172:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1176:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    not ok 63 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 2.6698
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1189:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1193:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    not ok 64 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.379953
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1201:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1203:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    not ok 65 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 3.673666
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1210:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1215:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    not ok 66 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 4.26618
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1225:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1230:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    not ok 67 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.645804
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1237:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1239:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    not ok 68 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 1.98024
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1246:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1252:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    not ok 69 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.031757
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1263:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1270:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 70 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 5.505221
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 71 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 2.736451
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 72 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 2.40461
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Normal short chat and translation remain usable after size limits
    not ok 73 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.586595
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1310:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1312:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    not ok 74 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 23.705098
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1325:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1334:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    not ok 75 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 3.02023
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1342:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1352:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    not ok 76 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.273622
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1366:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1370:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 77 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 4.734909
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 78 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 2.946088
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    not ok 79 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 1.765455
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1422:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1436:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    not ok 80 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.018627
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1454:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1466:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 81 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.840579
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 82 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.958827
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    not ok 83 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 3.165759
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1512:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1518:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    not ok 84 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.468707
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1530:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1534:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    not ok 85 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.906172
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    not ok 86 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.899448
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    not ok 87 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.711203
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    not ok 88 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 3.258981
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    not ok 89 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.377059
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    not ok 90 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 2.455487
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    not ok 91 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.804354
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    not ok 92 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.646065
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1599:3'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1605:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    not ok 93 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 1.661458
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1617:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1621:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    not ok 94 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.676081
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1626:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1630:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    not ok 95 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 6.051145
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1635:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1639:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    not ok 96 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.493534
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1647:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1652:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    not ok 97 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.768159
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1661:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1666:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    not ok 98 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.140662
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1678:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1684:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Impossible February 30 is rejected without querying availability
    not ok 99 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.478402
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1693:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1699:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Gemini request failed (HTTP 500).
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    not ok 100 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.447545
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1705:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1711:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    not ok 101 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 1.43723
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1717:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1723:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    not ok 102 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.516459
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1732:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1740:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    not ok 103 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 1.61579
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1749:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1757:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 104 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.772355
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 105 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 1.96077
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 106 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 2.16244
      type: 'test'
      ...
    # Gemini request failed (HTTP 500).
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    not ok 107 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 1.637713
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1818:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
      operator: 'strictEqual'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1822:10)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 108 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 5.044436
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    not ok 109 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 1.853438
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1847:1'
      failureType: 'testCodeFailure'
      error: |-
        Expected values to be strictly equal:
        
        500 !== 200
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected: 200
      actual: 500
