# AI Mock Regression — testing branch

Source commit: ae763fe14d4dd1bdc633455a920cd3014903f681
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.614903
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.546443
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 46.404376
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.89696
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    not ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 5.329608
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/admin-report-manual-preview-ui34.test.js:102:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /admin-walkin\.css\?v=20261121-ui34/. Input:
        
        '<!doctype html>\n' +
          '<html lang="en">\n' +
          '  <head>\n' +
          '    <meta charset="UTF-8" />\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       RESPONSIVE VIEWPORT\n' +
          '       Makes manual reservation page mobile-friendly.\n' +
          '    ======================================================= -->\n' +
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '\n' +
          '    <title>Manual Reservation | ArvicSeaside</title>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       PAGE CSS FILES\n' +
          '    ======================================================= -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/global.css" />\n' +
          '    <link rel="stylesheet" href="../css/style.css" />\n' +
          '    <link rel="stylesheet" href="../adminCSS/admin-walkin.css?v=20261121-ui35" />\n' +
          '    <!-- Resort favicon and accessible Admin mobile navigation. -->\n' +
          '  <link rel="stylesheet" href="../adminCSS/admin-mobile-nav.css" />\n' +
          '  <link rel="icon" type="image/png" href="../images/arvic-logo.png" />\n' +
          '    <!-- Consistent, centered confirmation for accidental logout clicks. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />\n' +
          '    <!-- UI-23: muted Front Desk theme; screen-only, loaded after page styles. -->\n' +
          '  <link rel="stylesheet" href="../frontdeskCSS/frontdesk-manager-tone.css?v=20261119-ui23" />\n' +
          '</head>\n' +
          '\n' +
          '  <body class="has-fixed-navbar frontdesk-manager-tone">\n' +
          '    <!-- ======================================================\n' +
          '       ROLE-AWARE NAVBAR\n' +
          '       Administrator sees the full admin navigation.\n' +
          '       Front Desk sees only currently allowed operational links.\n' +
          '    ======================================================= -->\n' +
          '    <header class="navbar" id="manualRoleNavbar">\n' +
          '      <div class="logo" id="manualRoleLogo">ArvicSeaside Admin</div>\n' +
          '\n' +
          '      <nav id="manualRoleNav">\n' +
          '        <a href="admin.html" data-admin-only>Bookings</a>\n' +
          '\n' +
          '        <a\n' +
          '          href="admin-walkin.html"\n' +
          '          class="active-nav"\n' +
          '          data-manual-reservation-link\n' +
          '        >\n' +
          '          Manual Reservation\n' +
          '        </a>\n' +
          '\n' +
          '        <a href="admin-guests-inside.html" data-admin-only>Guests Inside</a>\n' +
          '        <a href="admin-rooms.html" data-admin-only>Accommodations</a>\n' +
          '        <a href="admin-map-editor.html" data-admin-only>Map Editor</a>\n' +
          '        <a href="admin-reports.html" data-admin-only>Reports</a>\n' +
          '        <a href="admin-profile.html" data-admin-only>Profile</a>\n' +
          '\n' +
          '        <a href="#" id="logoutBtn">Logout</a>\n' +
          '      </nav>\n' +
          '    </header>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       MAIN WALK-IN WRAPPER\n' +
          '    ======================================================= -->\n' +
          '    <main class="walkin-wrapper">\n' +
          '      <a\n' +
          '        href="admin.html"\n' +
          '        class="back-btn"\n' +
          '        data-dashboard-link\n' +
          '      >\n' +
          '        ← Back to Dashboard\n' +
          '      </a>\n' +
          '\n' +
          '      <section class="walkin-hero">\n' +
          '        <h1>Create Manual Reservation</h1>\n' +
          '\n' +
          '        <p>\n' +
          '          Encode guest details and accommodation selection first, then continue\n' +
          '          to the payment screen.\n' +
          '        </p>\n' +
          '      </section>\n' +
          '\n' +
          '      <section class="walkin-card">\n' +
          '        <form id="walkInForm">\n' +
          '          <!-- ======================================================\n' +
          '             GUEST INFORMATION\n' +
          '          ======================================================= -->\n' +
          '          <section class="section-box">\n' +
          '            <h2>Guest Information</h2>\n' +
          '\n' +
          '            <div class="walkin-grid">\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="firstName">First Name</label>\n' +
          '                <input type="text" id="firstName" required />\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="middleName">Middle Name (Optional)</label>\n' +
          '                <input type="text" id="middleName" />\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="lastName">Last Name</label>\n' +
          '                <input type="text" id="lastName" required />\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="contactNo">Contact Number</label>\n' +
          '                <input type="text" id="contactNo" required />\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="guestCount">Guest Count</label>\n' +
          '                <input type="number" id="guestCount" min="1" required />\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group">\n' +
          '                <label for="entranceType">Entrance Type</label>\n' +
          '\n' +
          '                <select id="entranceType" required>\n' +
          '                  <option value="pool_beach">Pool &amp; Beach Entrance</option>\n' +
          '                  <option value="beach_only">Beach Entrance Only</option>\n' +
          '                </select>\n' +
          '\n' +
          '                <small class="field-help">\n' +
          '                  Entrance fee is estimated only and will be finalized at the\n' +
          '                  front desk.\n' +
          '                </small>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="walkin-group full-width">\n' +
          '                <label for="customerNote">Note / Concern</label>\n' +
          '\n' +
          '                <textarea\n' +
          '                  id="customerNote"\n' +
          '                  placeholder="Kung may gusto kayong ihabilin or concern, ilagay dito. If may kids, senior, or PWD guests, ilagay dito for front-desk verification."\n' +
          '                ></textarea>\n' +
          '              </div>\n' +
          '            </div>\n' +
          '          </section>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '             RESERVATION ITEMS\n' +
          '          ======================================================= -->\n' +
          '          <section class="section-box">\n' +
          '            <div class="booking-item-header">\n' +
          '              <div class="booking-item-title">Reservation Items</div>\n' +
          '\n' +
          '              <button type="button" class="btn-primary" id="addItemBtn">\n' +
          '                Add Another Accommodation\n' +
          '              </button>\n' +
          '            </div>\n' +
          '\n' +
          '            <div id="bookingItemsWrap" class="booking-items-wrap"></div>\n' +
          '          </section>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '             PREVIEW SUMMARY\n' +
          '          ======================================================= -->\n' +
          '          <section class="section-box">\n' +
          '            <h2>Manual Reservation Preview</h2>\n' +
          '\n' +
          '            <div class="summary-grid">\n' +
          '              <div class="summary-box">\n' +
          '                <strong>Total Selected Accommodations</strong>\n' +
          '                <span id="summaryItemCount">0 item(s)</span>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="summary-box">\n' +
          '                <strong>Estimated Entrance Fee</strong>\n' +
          '                <span id="estimatedEntranceFee">₱0.00</span>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="summary-box">\n' +
          '                <strong>Accommodation Total</strong>\n' +
          '                <span id="accommodationTotal">₱0.00</span>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="summary-box">\n' +
          '                <strong id="requiredPaymentLabel">Full Accommodation Payment</strong>\n' +
          '                <span id="requiredDownpayment">₱0.00</span>\n' +
          '              </div>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="highlight-box">\n' +
          '              <div class="highlight-row">\n' +
          '                <span>Accommodation Total</span>\n' +
          '                <strong id="highlightAccommodationTotal">₱0.00</strong>\n' +
          '              </div>\n' +
          '\n' +
          '              <!-- UI-34: 50% guidance is for Facebook/Messenger only; never show\n' +
          '                   this row for walk-ins, which must pay accommodation in full. -->\n' +
          '              <div class="highlight-row" id="highlightDownpaymentRow" hidden>\n' +
          '                <span>Required Down Payment (50%)</span>\n' +
          '                <strong id="highlightDownpayment">₱0.00</strong>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="highlight-row">\n' +
          '                <span id="highlightRemainingLabel">Remaining Accommodation Balance</span>\n' +
          '                <strong id="highlightRemainingBalance">₱0.00</strong>\n' +
          '              </div>\n' +
          '\n' +
          '              <div class="highlight-row">\n' +
          '                <span>Entrance Fee Estimate</span>\n' +
          '                <strong id="highlightEntranceFee">₱0.00</strong>\n' +
          '              </div>\n' +
          '            </div>\n' +
          '          </section>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '             FORM ACTIONS\n' +
          '          ======================================================= -->\n' +
          '          <!-- UI-35: Secondary action left; Next to Payment right for\n' +
          '               both walk-in and Facebook/Messenger manual reservations. -->\n' +
          '          <div class="walkin-actions">\n' +
          '            <a\n' +
          '              href="admin.html"\n' +
          '              class="btn-secondary"\n' +
          '              data-dashboard-link\n' +
          '            >\n' +
          '              Cancel\n' +
          '            </a>\n' +
          '\n' +
          '            <button type="submit" class="btn-primary" id="manualNextPaymentBtn" disabled\n' +
          '              title="Choose and verify available time slots first.">Next to Payment</button>\n' +
          '          </div>\n' +
          '        </form>\n' +
          '\n' +
          '        <p id="walkInMessage" class="message"></p>\n' +
          '      </section>\n' +
          '    </main>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       PAGE SCRIPTS\n' +
          '       Role nav loads before the page script so the correct UI is\n' +
          '       prepared for Administrator or Front Desk.\n' +
          '    ======================================================= -->\n' +
          '    <script src="../sharedJS/toast.js"></script>\n' +
          '    <script src="../sharedJS/api-config.js"></script>\n' +
          '    <script src="../sharedJS/manualReservationRoleNav.js"></script>\n' +
          '    <!-- Block expired fixed slots before payment; backend validates again. -->\n' +
          '    <script src="../sharedJS/manual-schedule-guard.js"></script>\n' +
          '    <script src="../adminJS/admin-walkin.js?v=20261121-ui34"></script>\n' +
          '    <script src="../adminJS/admin-mobile-nav.js"></script>\n' +
          '    <script src="../sharedJS/logout-confirm.js"></script>\n' +
          '  </body>\n' +
          '</html>\n'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
        
            <!-- ======================================================
               RESPONSIVE VIEWPORT
               Makes manual reservation page mobile-friendly.
            ======================================================= -->
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Manual Reservation | ArvicSeaside</title>
        
            <!-- ======================================================
               PAGE CSS FILES
            ======================================================= -->
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../adminCSS/admin-walkin.css?v=20261121-ui35" />
            <!-- Resort favicon and accessible Admin mobile navigation. -->
          <link rel="stylesheet" href="../adminCSS/admin-mobile-nav.css" />
          <link rel="icon" type="image/png" href="../images/arvic-logo.png" />
            <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- UI-23: muted Front Desk theme; screen-only, loaded after page styles. -->
          <link rel="stylesheet" href="../frontdeskCSS/frontdesk-manager-tone.css?v=20261119-ui23" />
        </head>
        
          <body class="has-fixed-navbar frontdesk-manager-tone">
            <!-- ======================================================
               ROLE-AWARE NAVBAR
               Administrator sees the full admin navigation.
               Front Desk sees only currently allowed operational links.
            ======================================================= -->
            <header class="navbar" id="manualRoleNavbar">
              <div class="logo" id="manualRoleLogo">ArvicSeaside Admin</div>
        
              <nav id="manualRoleNav">
                <a href="admin.html" data-admin-only>Bookings</a>
        
                <a
                  href="admin-walkin.html"
                  class="active-nav"
                  data-manual-reservation-link
                >
                  Manual Reservation
                </a>
        
                <a href="admin-guests-inside.html" data-admin-only>Guests Inside</a>
                <a href="admin-rooms.html" data-admin-only>Accommodations</a>
                <a href="admin-map-editor.html" data-admin-only>Map Editor</a>
                <a href="admin-reports.html" data-admin-only>Reports</a>
                <a href="admin-profile.html" data-admin-only>Profile</a>
        
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               MAIN WALK-IN WRAPPER
            ======================================================= -->
            <main class="walkin-wrapper">
              <a
                href="admin.html"
                class="back-btn"
                data-dashboard-link
              >
                ← Back to Dashboard
              </a>
        
              <section class="walkin-hero">
                <h1>Create Manual Reservation</h1>
        
                <p>
                  Encode guest details and accommodation selection first, then continue
                  to the payment screen.
                </p>
              </section>
        
              <section class="walkin-card">
                <form id="walkInForm">
                  <!-- ======================================================
                     GUEST INFORMATION
                  ======================================================= -->
                  <section class="section-box">
                    <h2>Guest Information</h2>
        
                    <div class="walkin-grid">
                      <div class="walkin-group">
                        <label for="firstName">First Name</label>
                        <input type="text" id="firstName" required />
                      </div>
        
                      <div class="walkin-group">
                        <label for="middleName">Middle Name (Optional)</label>
                        <input type="text" id="middleName" />
                      </div>
        
                      <div class="walkin-group">
                        <label for="lastName">Last Name</label>
                        <input type="text" id="lastName" required />
                      </div>
        
                      <div class="walkin-group">
                        <label for="contactNo">Contact Number</label>
                        <input type="text" id="contactNo" required />
                      </div>
        
                      <div class="walkin-group">
                        <label for="guestCount">Guest Count</label>
                        <input type="number" id="guestCount" min="1" required />
                      </div>
        
                      <div class="walkin-group">
                        <label for="entranceType">Entrance Type</label>
        
                        <select id="entranceType" required>
                          <option value="pool_beach">Pool &amp; Beach Entrance</option>
                          <option value="beach_only">Beach Entrance Only</option>
                        </select>
        
                        <small class="field-help">
                          Entrance fee is estimated only and will be finalized at the
                          front desk.
                        </small>
                      </div>
        
                      <div class="walkin-group full-width">
                        <label for="customerNote">Note / Concern</label>
        
                        <textarea
                          id="customerNote"
                          placeholder="Kung may gusto kayong ihabilin or concern, ilagay dito. If may kids, senior, or PWD guests, ilagay dito for front-desk verification."
                        ></textarea>
                      </div>
                    </div>
                  </section>
        
                  <!-- ======================================================
                     RESERVATION ITEMS
                  ======================================================= -->
                  <section class="section-box">
                    <div class="booking-item-header">
                      <div class="booking-item-title">Reservation Items</div>
        
                      <button type="button" class="btn-primary" id="addItemBtn">
                        Add Another Accommodation
                      </button>
                    </div>
        
                    <div id="bookingItemsWrap" class="booking-items-wrap"></div>
                  </section>
        
                  <!-- ======================================================
                     PREVIEW SUMMARY
                  ======================================================= -->
                  <section class="section-box">
                    <h2>Manual Reservation Preview</h2>
        
                    <div class="summary-grid">
                      <div class="summary-box">
                        <strong>Total Selected Accommodations</strong>
                        <span id="summaryItemCount">0 item(s)</span>
                      </div>
        
                      <div class="summary-box">
                        <strong>Estimated Entrance Fee</strong>
                        <span id="estimatedEntranceFee">₱0.00</span>
                      </div>
        
                      <div class="summary-box">
                        <strong>Accommodation Total</strong>
                        <span id="accommodationTotal">₱0.00</span>
                      </div>
        
                      <div class="summary-box">
                        <strong id="requiredPaymentLabel">Full Accommodation Payment</strong>
                        <span id="requiredDownpayment">₱0.00</span>
                      </div>
                    </div>
        
                    <div class="highlight-box">
                      <div class="highlight-row">
                        <span>Accommodation Total</span>
                        <strong id="highlightAccommodationTotal">₱0.00</strong>
                      </div>
        
                      <!-- UI-34: 50% guidance is for Facebook/Messenger only; never show
                           this row for walk-ins, which must pay accommodation in full. -->
                      <div class="highlight-row" id="highlightDownpaymentRow" hidden>
                        <span>Required Down Payment (50%)</span>
                        <strong id="highlightDownpayment">₱0.00</strong>
                      </div>
        
                      <div class="highlight-row">
                        <span id="highlightRemainingLabel">Remaining Accommodation Balance</span>
                        <strong id="highlightRemainingBalance">₱0.00</strong>
                      </div>
        
                      <div class="highlight-row">
                        <span>Entrance Fee Estimate</span>
                        <strong id="highlightEntranceFee">₱0.00</strong>
                      </div>
                    </div>
                  </section>
        
                  <!-- ======================================================
                     FORM ACTIONS
                  ======================================================= -->
                  <!-- UI-35: Secondary action left; Next to Payment right for
                       both walk-in and Facebook/Messenger manual reservations. -->
                  <div class="walkin-actions">
                    <a
                      href="admin.html"
                      class="btn-secondary"
                      data-dashboard-link
                    >
                      Cancel
                    </a>
        
                    <button type="submit" class="btn-primary" id="manualNextPaymentBtn" disabled
                      title="Choose and verify available time slots first.">Next to Payment</button>
                  </div>
                </form>
        
                <p id="walkInMessage" class="message"></p>
              </section>
            </main>
        
            <!-- ======================================================
               PAGE SCRIPTS
               Role nav loads before the page script so the correct UI is
               prepared for Administrator or Front Desk.
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js"></script>
            <script src="../sharedJS/manualReservationRoleNav.js"></script>
            <!-- Block expired fixed slots before payment; backend validates again. -->
            <script src="../sharedJS/manual-schedule-guard.js"></script>
            <script src="../adminJS/admin-walkin.js?v=20261121-ui34"></script>
            <script src="../adminJS/admin-mobile-nav.js"></script>
            <script src="../sharedJS/logout-confirm.js"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/admin-report-manual-preview-ui34.test.js:107:10)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 6 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 113.410059
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 7 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 24.635595
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 8 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 18.572436
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 9 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 82.215317
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 10 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 12.400305
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 11 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 3.702443
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 12 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 24.137823
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 13 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 21.405668
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 14 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 4.344032
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 15 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 5.255061
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 16 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 10.609696
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 17 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 10.403884
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 18 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 5.775185
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 19 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 10.334366
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 20 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 7.621458
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 21 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 15.685254
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 22 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 12.187311
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 23 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 7.038376
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 24 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.687639
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 25 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.751908
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 26 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 5.343866
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 27 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 8.190131
      type: 'test'
      ...
    # Subtest: English voice session replies in English even if guest changes spoken language
    ok 28 - English voice session replies in English even if guest changes spoken language
      ---
      duration_ms: 2.498431
      type: 'test'
      ...
    # Subtest: Mandarin voice session replies in Mandarin even if transcript is English
    ok 29 - Mandarin voice session replies in Mandarin even if transcript is English
      ---
      duration_ms: 4.529245
      type: 'test'
      ...
    # Subtest: Taglish and Spanish voice preferences use the selected fixed reply language
    ok 30 - Taglish and Spanish voice preferences use the selected fixed reply language
      ---
      duration_ms: 4.916603
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt is concise and conversational while retaining booking rules
    ok 31 - Live voice Gemini prompt is concise and conversational while retaining booking rules
      ---
      duration_ms: 2.385922
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 32 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.428691
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 33 - English translation route responds with the English text
      ---
      duration_ms: 2.869038
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 34 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 703.290321
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 35 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 703.973488
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 36 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.579672
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 37 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.579794
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 38 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.495142
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 39 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 5.143995
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 40 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 2.722171
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 41 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.775314
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 42 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.376565
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 43 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.620798
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 44 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 6.571491
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 45 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 10.720361
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 46 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.713991
      type: 'test'
      ...
    # Subtest: Voice session maintains the selected Taglish language during 429 backup
    ok 47 - Voice session maintains the selected Taglish language during 429 backup
      ---
      duration_ms: 2.35752
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 48 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.358352
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 49 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.072652
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 50 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 702.365168
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 51 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.490874
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 52 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.637509
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 53 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.423643
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 54 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.078313
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 55 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.841865
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 56 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.650552
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 57 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.770825
      type: 'test'
      ...
    # Subtest: Voice catalog reply remains fixed-language without intent extraction
    ok 58 - Voice catalog reply remains fixed-language without intent extraction
      ---
      duration_ms: 2.881461
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 59 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.847979
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 60 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.434843
      type: 'test'
      ...
    # Subtest: Mandarin voice with one-call catalog stays fixed-language on quota fallback
    ok 61 - Mandarin voice with one-call catalog stays fixed-language on quota fallback
      ---
      duration_ms: 2.906968
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 62 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.675586
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 63 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.722643
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 64 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.632737
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 65 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 3.514789
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 66 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.678164
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 67 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 4.808703
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 68 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 4.480515
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 69 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.689625
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 70 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.976033
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 71 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 3.036117
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 72 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.324108
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 73 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.674464
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 74 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.827136
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 75 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.006199
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 76 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.343383
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 77 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 2.17375
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 78 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.709939
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 79 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.649428
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 80 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.784928
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 81 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.350466
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 82 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.804154
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 83 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.772937
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 84 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 1.725509
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 85 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.048066
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 86 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 2.005628
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 87 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.004225
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 88 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.804845
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 89 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.770642
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 90 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.147731
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 91 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 1.939215
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 92 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 1.945917
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 93 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.360415
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 94 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 4.12167
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 95 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.798177
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 96 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.710364
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 97 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.170955
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 98 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.766604
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 99 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.34672
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 100 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.698779
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 101 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.188681
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 102 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 3.175637
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 103 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.566805
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 104 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.144762
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 105 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.038465
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 106 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 0.872537
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 107 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 0.803759
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 108 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 11.104032
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 109 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.80364
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 110 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 2.755348
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 111 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.758459
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 112 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 3.73882
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 113 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 20.034437
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 114 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.836751
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 115 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.493254
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 116 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 0.892755
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 117 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.428124
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    ok 118 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 0.650596
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 119 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.269924
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 120 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.921878
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 121 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 5.350468
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 122 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 1.686416
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 123 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.752315
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    ok 124 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 0.748607
      type: 'test'
      ...
    # Subtest: English offline payment answers use PayPal-only online downpayment
    ok 125 - English offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.338869
      type: 'test'
      ...
    # Subtest: Tagalog offline payment answers use PayPal-only online downpayment
    ok 126 - Tagalog offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 3.215159
      type: 'test'
      ...
    # Subtest: Taglish offline payment answers use PayPal-only online downpayment
    ok 127 - Taglish offline payment answers use PayPal-only online downpayment
      ---
      duration_ms: 0.618467
      type: 'test'
      ...
    # Subtest: English offline booking steps direct to secure Customer booking
    ok 128 - English offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.433424
      type: 'test'
      ...
    # Subtest: Tagalog offline booking steps direct to secure Customer booking
    ok 129 - Tagalog offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.279507
      type: 'test'
      ...
    # Subtest: Taglish offline booking steps direct to secure Customer booking
    ok 130 - Taglish offline booking steps direct to secure Customer booking
      ---
      duration_ms: 0.184983
      type: 'test'
      ...
    # Subtest: Offline booking instructions guide to fixed Day Tour or Night slots
    ok 131 - Offline booking instructions guide to fixed Day Tour or Night slots
      ---
      duration_ms: 0.577591
      type: 'test'
      ...
    # Subtest: Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
    ok 132 - Offline check-in FAQ does not invent a generic 2 PM/12 PM schedule
      ---
      duration_ms: 0.295147
      type: 'test'
      ...
    # Subtest: Fixed slot choice survives offline follow-up without inventing check-in hours
    ok 133 - Fixed slot choice survives offline follow-up without inventing check-in hours
      ---
      duration_ms: 5.603907
      type: 'test'
      ...
    # Subtest: AI customer headers show the full resort assistant brand
    ok 134 - AI customer headers show the full resort assistant brand
      ---
      duration_ms: 0.892795
      type: 'test'
      ...
    # Subtest: Gemini prompt names the correct resort and refuses free-form booking times
    ok 135 - Gemini prompt names the correct resort and refuses free-form booking times
      ---
      duration_ms: 1.449747
      type: 'test'
      ...
    # Subtest: Offline slot preference never appears as a confirmed custom-time window
    ok 136 - Offline slot preference never appears as a confirmed custom-time window
      ---
      duration_ms: 0.347183
      type: 'test'
      ...
    # Subtest: Offline assistant answers free parking for any vehicle without inventing entrance fees
    ok 137 - Offline assistant answers free parking for any vehicle without inventing entrance fees
      ---
      duration_ms: 0.805713
      type: 'test'
      ...
    # Subtest: Offline parking unknowns and unrelated room questions stay conservative
    ok 138 - Offline parking unknowns and unrelated room questions stay conservative
      ---
      duration_ms: 0.591977
      type: 'test'
      ...
    # Subtest: Offline location, hours, contacts and pool answers use published resort facts
    ok 139 - Offline location, hours, contacts and pool answers use published resort facts
      ---
      duration_ms: 0.541474
      type: 'test'
      ...
    # Subtest: A spoken overnight amount + payment options query is not a room search
    ok 140 - A spoken overnight amount + payment options query is not a room search
      ---
      duration_ms: 4.34773
      type: 'test'
      ...
    # Subtest: General accommodation rate inquiries do not become room payment follow-ups
    ok 141 - General accommodation rate inquiries do not become room payment follow-ups
      ---
      duration_ms: 1.50006
      type: 'test'
      ...
    # Subtest: Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
    ok 142 - Focused Family Room B quote is DB-backed, payment method is explicit and no Nipa Hut appears
      ---
      duration_ms: 21.48258
      type: 'test'
      ...
    # Subtest: Fresh exact room name overrides a previously selected Family Room B
    ok 143 - Fresh exact room name overrides a previously selected Family Room B
      ---
      duration_ms: 0.678929
      type: 'test'
      ...
    # Subtest: Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
    ok 144 - Recent named user question recovers focused Family Room B after earlier Nipa Hut suggestions
      ---
      duration_ms: 0.277774
      type: 'test'
      ...
    # Subtest: Stale room ID or missing ID must never quote a different accommodation
    ok 145 - Stale room ID or missing ID must never quote a different accommodation
      ---
      duration_ms: 0.267606
      type: 'test'
      ...
    # Subtest: A pair of explicitly named rooms never silently quotes only one
    ok 146 - A pair of explicitly named rooms never silently quotes only one
      ---
      duration_ms: 0.274899
      type: 'test'
      ...
    # Subtest: Unknown, zero and invalid rates do not turn into zero-amount quotations
    ok 147 - Unknown, zero and invalid rates do not turn into zero-amount quotations
      ---
      duration_ms: 0.215079
      type: 'test'
      ...
    # Subtest: Extended/multiple nights are not priced as a single overnight stay
    ok 148 - Extended/multiple nights are not priced as a single overnight stay
      ---
      duration_ms: 0.440456
      type: 'test'
      ...
    # Subtest: Entrance-only or photo-only questions keep their existing specialized handling
    ok 149 - Entrance-only or photo-only questions keep their existing specialized handling
      ---
      duration_ms: 0.610652
      type: 'test'
      ...
    # Subtest: Backend answers payment questions before broad recommendation and with no card payload
    ok 150 - Backend answers payment questions before broad recommendation and with no card payload
      ---
      duration_ms: 0.66407
      type: 'test'
      ...
    # Subtest: Unavailable accommodation cannot be quoted as a payable booking
    ok 151 - Unavailable accommodation cannot be quoted as a payable booking
      ---
      duration_ms: 0.216031
      type: 'test'
      ...
    # Subtest: Estimated payment breakdown includes onsite accommodation balance separately from entrance
    ok 152 - Estimated payment breakdown includes onsite accommodation balance separately from entrance
      ---
      duration_ms: 0.329211
      type: 'test'
      ...
    # Subtest: Everyday Taglish payment wording keeps exact verified amounts without formal language
    ok 153 - Everyday Taglish payment wording keeps exact verified amounts without formal language
      ---
      duration_ms: 0.478017
      type: 'test'
      ...
    # Subtest: Refund and cancellation/refund intents use local verified policy answers
    ok 154 - Refund and cancellation/refund intents use local verified policy answers
      ---
      duration_ms: 4.487668
      type: 'test'
      ...
    # Subtest: refund in english recommends the exact Home-page Facebook contact
    ok 155 - refund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.822916
      type: 'test'
      ...
    # Subtest: refund in tagalog recommends the exact Home-page Facebook contact
    ok 156 - refund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.25333
      type: 'test'
      ...
    # Subtest: refund in taglish recommends the exact Home-page Facebook contact
    ok 157 - refund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.330973
      type: 'test'
      ...
    # Subtest: refund in spanish recommends the exact Home-page Facebook contact
    ok 158 - refund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.304194
      type: 'test'
      ...
    # Subtest: refund in mandarin recommends the exact Home-page Facebook contact
    ok 159 - refund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.343106
      type: 'test'
      ...
    # Subtest: cancellationRefund in english recommends the exact Home-page Facebook contact
    ok 160 - cancellationRefund in english recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.277334
      type: 'test'
      ...
    # Subtest: cancellationRefund in tagalog recommends the exact Home-page Facebook contact
    ok 161 - cancellationRefund in tagalog recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.191725
      type: 'test'
      ...
    # Subtest: cancellationRefund in taglish recommends the exact Home-page Facebook contact
    ok 162 - cancellationRefund in taglish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.453641
      type: 'test'
      ...
    # Subtest: cancellationRefund in spanish recommends the exact Home-page Facebook contact
    ok 163 - cancellationRefund in spanish recommends the exact Home-page Facebook contact
      ---
      duration_ms: 1.906123
      type: 'test'
      ...
    # Subtest: cancellationRefund in mandarin recommends the exact Home-page Facebook contact
    ok 164 - cancellationRefund in mandarin recommends the exact Home-page Facebook contact
      ---
      duration_ms: 0.267776
      type: 'test'
      ...
    # Subtest: English offline refund help includes the same clickable Facebook contact
    ok 165 - English offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.924523
      type: 'test'
      ...
    # Subtest: Tagalog offline refund help includes the same clickable Facebook contact
    ok 166 - Tagalog offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.771881
      type: 'test'
      ...
    # Subtest: Taglish offline refund help includes the same clickable Facebook contact
    ok 167 - Taglish offline refund help includes the same clickable Facebook contact
      ---
      duration_ms: 0.433794
      type: 'test'
      ...
    # Subtest: AI source prompt includes official refund contact and no guarantee
    ok 168 - AI source prompt includes official refund contact and no guarantee
      ---
      duration_ms: 0.227061
      type: 'test'
      ...
    # Subtest: AI renderer escapes untrusted HTML and does not make arbitrary links
    ok 169 - AI renderer escapes untrusted HTML and does not make arbitrary links
      ---
      duration_ms: 0.208316
      type: 'test'
      ...
    # Subtest: Natural Filipino and Taglish schedule FAQ still gives exact category slots
    ok 170 - Natural Filipino and Taglish schedule FAQ still gives exact category slots
      ---
      duration_ms: 0.350409
      type: 'test'
      ...
    # Subtest: Fixed resort schedule FAQ avoids custom check-in hours
    ok 171 - Fixed resort schedule FAQ avoids custom check-in hours
      ---
      duration_ms: 2.10397
      type: 'test'
      ...
    # Subtest: Owner-confirmed free parking covers natural Taglish and English paraphrases
    ok 172 - Owner-confirmed free parking covers natural Taglish and English paraphrases
      ---
      duration_ms: 22.174355
      type: 'test'
      ...
    # Subtest: AI-LIVE-01 exact van and bus inquiry answers verified policy directly
    ok 173 - AI-LIVE-01 exact van and bus inquiry answers verified policy directly
      ---
      duration_ms: 1.346246
      type: 'test'
      ...
    # Subtest: Parking answer in Taglish is short, natural, and limited to confirmed policy
    ok 174 - Parking answer in Taglish is short, natural, and limited to confirmed policy
      ---
      duration_ms: 0.336814
      type: 'test'
      ...
    # Subtest: Unverified parking capacity, reservations and security never become confirmed
    ok 175 - Unverified parking capacity, reservations and security never become confirmed
      ---
      duration_ms: 0.317268
      type: 'test'
      ...
    # Subtest: Parking + entrance admission questions answer both fees separately
    ok 176 - Parking + entrance admission questions answer both fees separately
      ---
      duration_ms: 0.815271
      type: 'test'
      ...
    # Subtest: Mixed or room-specific inquiries do not produce an incomplete generic answer
    ok 177 - Mixed or room-specific inquiries do not produce an incomplete generic answer
      ---
      duration_ms: 0.287473
      type: 'test'
      ...
    # Subtest: Address, 24-hour opening, published contacts and pool fact are grounded
    ok 178 - Address, 24-hour opening, published contacts and pool fact are grounded
      ---
      duration_ms: 1.056388
      type: 'test'
      ...
    # Subtest: Pool admission and usage policy remain unconfirmed, not free by inference
    ok 179 - Pool admission and usage policy remain unconfirmed, not free by inference
      ---
      duration_ms: 0.507521
      type: 'test'
      ...
    # Subtest: Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
    ok 180 - Open-ended Gemini prompt always gets grounded resort facts and unknown-policy boundary
      ---
      duration_ms: 2.354073
      type: 'test'
      ...
    # Subtest: Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
    ok 181 - Unknown general resort policies never become fabricated Wi-Fi, pet or corkage claims
      ---
      duration_ms: 3.087102
      type: 'test'
      ...
    # Subtest: Room-specific Wi-Fi inquiries stay on the data-aware AI path
    ok 182 - Room-specific Wi-Fi inquiries stay on the data-aware AI path
      ---
      duration_ms: 0.573874
      type: 'test'
      ...
    # Subtest: Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
    ok 183 - Non-inquiry statements and unrelated content cannot trigger a canned resort FAQ
      ---
      duration_ms: 0.290308
      type: 'test'
      ...
    # Subtest: Taglish preview speaks like friendly Filipino resort staff
    ok 184 - Taglish preview speaks like friendly Filipino resort staff
      ---
      duration_ms: 1.966135
      type: 'test'
      ...
    # Subtest: Exact preview result data stays untouched across Taglish, Tagalog and English
    ok 185 - Exact preview result data stays untouched across Taglish, Tagalog and English
      ---
      duration_ms: 0.341072
      type: 'test'
      ...
    # Subtest: Taglish group alternatives are natural without false booking availability
    ok 186 - Taglish group alternatives are natural without false booking availability
      ---
      duration_ms: 0.373032
      type: 'test'
      ...
    # Subtest: Taglish payment answers the focused room and keeps verified 50/50 amounts
    ok 187 - Taglish payment answers the focused room and keeps verified 50/50 amounts
      ---
      duration_ms: 26.91537
      type: 'test'
      ...
    # Subtest: Friendly follow-up for unknown room or stay does not invent a quote
    ok 188 - Friendly follow-up for unknown room or stay does not invent a quote
      ---
      duration_ms: 0.389662
      type: 'test'
      ...
    # Subtest: Pure English and pure Tagalog retain distinct wording
    ok 189 - Pure English and pure Tagalog retain distinct wording
      ---
      duration_ms: 0.378842
      type: 'test'
      ...
    # Subtest: AI style prompt and translation keep natural Taglish without rewriting facts
    ok 190 - AI style prompt and translation keep natural Taglish without rewriting facts
      ---
      duration_ms: 0.628986
      type: 'test'
      ...
    # Subtest: Natural Taglish style does not alter payment or booking implementation
    ok 191 - Natural Taglish style does not alter payment or booking implementation
      ---
      duration_ms: 0.327638
      type: 'test'
      ...
    # Subtest: Taglish amenity replies are concise and transparent about unknown features
    ok 192 - Taglish amenity replies are concise and transparent about unknown features
      ---
      duration_ms: 2.616469
      type: 'test'
      ...
    # Subtest: Taglish room overview and details use everyday English terms without inventing amenities
    ok 193 - Taglish room overview and details use everyday English terms without inventing amenities
      ---
      duration_ms: 1.854968
      type: 'test'
      ...
    # Subtest: Missing room amenities remain unknown in a friendly Taglish response
    ok 194 - Missing room amenities remain unknown in a friendly Taglish response
      ---
      duration_ms: 0.300998
      type: 'test'
      ...
    # Subtest: UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
    ok 195 - UI-35 online booking: Back left, Next to Payment right; required submit remains guarded
      ---
      duration_ms: 1.343791
      type: 'test'
      ...
    # Subtest: UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
    ok 196 - UI-35 manual reservation: Cancel left, Next to Payment right; disabled validation preserved
      ---
      duration_ms: 0.239173
      type: 'test'
      ...
    # Subtest: UI-35 right-alignment overrides old full-width mobile styles in both booking pages
    ok 197 - UI-35 right-alignment overrides old full-width mobile styles in both booking pages
      ---
      duration_ms: 0.574255
      type: 'test'
      ...
    # Subtest: UI-35 payment navigation keeps original forms and payment scripts
    ok 198 - UI-35 payment navigation keeps original forms and payment scripts
      ---
      duration_ms: 1.48864
      type: 'test'
      ...
    # Subtest: UI-32 public landing logo targets a real page on root-domain and local Live Server
    ok 199 - UI-32 public landing logo targets a real page on root-domain and local Live Server
      ---
      duration_ms: 1.953842
      type: 'test'
      ...
    # Subtest: UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
    ok 200 - UI-32 Vercel preserves public root and supports historical /landing.html bookmarks
      ---
      duration_ms: 1.081244
      type: 'test'
      ...
    # Subtest: UI-32 mobile receipt title does not use a 340px vertical flex basis
    ok 201 - UI-32 mobile receipt title does not use a 340px vertical flex basis
      ---
      duration_ms: 0.76586
      type: 'test'
      ...
    # Subtest: UI-32 receipt changes remain presentation-only and preserve amount breakdown
    ok 202 - UI-32 receipt changes remain presentation-only and preserve amount breakdown
      ---
      duration_ms: 2.090034
      type: 'test'
      ...
    # Subtest: UI-33 landing policies describe PayPal-only online deposit and no proof upload
    ok 203 - UI-33 landing policies describe PayPal-only online deposit and no proof upload
      ---
      duration_ms: 0.857709
      type: 'test'
      ...
    # Subtest: UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
    ok 204 - UI-33 customer checkout and landing policy agree on PayPal capture and 50% accommodation only
      ---
      duration_ms: 0.675833
      type: 'test'
      ...
    # Subtest: UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
    ok 205 - UI-30 all Customer navbar logos link to Home; booking/payment exit confirmation preserved
      ---
      duration_ms: 4.339143
      type: 'test'
      ...
    # Subtest: UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
    ok 206 - UI-30 same-page hamburger navigation scrolls to top and closes mobile menu
      ---
      duration_ms: 3.12951
      type: 'test'
      ...
    # Subtest: UI-30 different-page, modified click and booking guard keep native browser behavior
    ok 207 - UI-30 different-page, modified click and booking guard keep native browser behavior
      ---
      duration_ms: 2.130069
      type: 'test'
      ...
    # Subtest: UI-30 Home logo on Home scrolls to top without reloading
    ok 208 - UI-30 Home logo on Home scrolls to top without reloading
      ---
      duration_ms: 1.012136
      type: 'test'
      ...
    # Subtest: UI-30 compact and maximized mobile chat use genuinely different dimensions
    ok 209 - UI-30 compact and maximized mobile chat use genuinely different dimensions
      ---
      duration_ms: 4.637435
      type: 'test'
      ...
    # Subtest: UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
    ok 210 - UI-30 size button persists maximize/restore and mobile minimize reduces before hiding
      ---
      duration_ms: 1.32143
      type: 'test'
      ...
    # Subtest: UI-31 has a single compact heading and preserves all read-only profile IDs
    ok 211 - UI-31 has a single compact heading and preserves all read-only profile IDs
      ---
      duration_ms: 1.621025
      type: 'test'
      ...
    # Subtest: UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
    ok 212 - UI-31 keeps one password form, same field IDs, validation and authenticated endpoints
      ---
      duration_ms: 0.65262
      type: 'test'
      ...
    # Subtest: UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
    ok 213 - UI-31 profile-specific CSS loads last, stays calm and remains mobile readable
      ---
      duration_ms: 0.358123
      type: 'test'
      ...
    # Subtest: UI-31 Show/Hide toggles update actual password input and accessible state
    ok 214 - UI-31 Show/Hide toggles update actual password input and accessible state
      ---
      duration_ms: 1.523123
      type: 'test'
      ...
    # Subtest: UI-29 receipt has one back control and one accessible main heading
    ok 215 - UI-29 receipt has one back control and one accessible main heading
      ---
      duration_ms: 1.318574
      type: 'test'
      ...
    # Subtest: UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
    ok 216 - UI-29 keeps actual data, authenticated receipt endpoint and payment calculations
      ---
      duration_ms: 0.413917
      type: 'test'
      ...
    # Subtest: UI-29 uses a quiet invoice palette and highlights only final payable row
    ok 217 - UI-29 uses a quiet invoice palette and highlights only final payable row
      ---
      duration_ms: 0.392056
      type: 'test'
      ...
    # Subtest: UI-29 keeps receipt details visible in print without navigation chrome
    ok 218 - UI-29 keeps receipt details visible in print without navigation chrome
      ---
      duration_ms: 0.239213
      type: 'test'
      ...
    1..218
    # tests 218
    # suites 0
    # pass 217
    # fail 1
    # cancelled 0
    # skipped 0
    # todo 0
    # duration_ms 2892.230857
