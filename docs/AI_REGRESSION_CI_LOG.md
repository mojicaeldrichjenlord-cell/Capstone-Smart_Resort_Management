# AI Mock Regression — testing branch

Source commit: c838530b7c69c78fed7181917d3773f04ec78eb5
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.619008
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.50469
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 358.219358
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.434809
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.397901
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 3.005031
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.320227
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.174396
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 0.896972
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    not ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 1.704368
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:51:1'
      failureType: 'testCodeFailure'
      error: 'index.html'
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: |-
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
          <!-- DM-02: Restore Customer theme before first paint; navbar switch initializes after DOM load. -->
          <script src="../sharedJS/customer-theme-toggle.js?v=20261121-dm04"></script>
        
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
            <title>Arvic Seaside | Home</title>
            <!-- Arvic Seaside: square brand favicon for browser tabs and Google Search. -->
            <link rel="icon" type="image/svg+xml" sizes="any" href="../favicon.svg" />
        
            <link rel="stylesheet" href="../sharedCSS/global.css" />
            <link rel="stylesheet" href="../css/style.css" />
            <link rel="stylesheet" href="../customerCSS/index.css" />
            <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />
            <link rel="stylesheet" href="../sharedCSS/ai-voice.css?v=20261121-auto44" />
            <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />
            <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261121-ui38" />
              <!-- Consistent, centered confirmation for accidental logout clicks. -->
            <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />
            <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->
          <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />
            <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->
            <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />
          <!-- DM-01: Customer-only theme palette. Default is the existing Light Mode. -->
          <link rel="stylesheet" href="../customerCSS/customer-theme-tokens.css?v=20261121-dm01" />
          <link rel="stylesheet" href="../customerCSS/customer-theme-toggle.css?v=20261121-dm04" />
          <!-- DM-03: Soft Dark styling, screen-only and customer-only. Light Mode unaffected. -->
          <link rel="stylesheet" href="../customerCSS/customer-dark-skin-dm03.css?v=20261121-dm03" />
          <!-- DM-04: Soft Dark polish, background icon removal and My Bookings fixes. -->
          <link rel="stylesheet" href="../customerCSS/customer-comfort-polish-dm04.css?v=20261121-dm04" />
          <!-- DM-05: Compact signed-in Customer mobile menu, touch-friendly Theme row. -->
          <link rel="stylesheet" href="../customerCSS/customer-mobile-nav-dm05.css?v=20261121-dm05" />
          <!-- DM-06: Last dark-only AI concierge palette; keep Light Mode untouched. -->
          <link rel="stylesheet" href="../customerCSS/customer-ai-dark-polish-dm06.css?v=20261121-dm06" />
          <!-- DM-07: one compact, unified Customer AI concierge skin (must load last). -->
          <link rel="stylesheet" href="../sharedCSS/ai-concierge-dm07.css?v=20261121-dm08" />
        </head>
        
          <body class="customer-manager-tone">
            <!-- ======================================================
               CUSTOMER NAVBAR
               Same Resort Map navbar style on all customer pages.
            ======================================================= -->
            <header class="navbar">
              <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->
              <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>
        
              <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>
        
              <nav id="mobileNav">
                <a href="index.html" class="active-nav">Home</a>
                <a href="rooms.html">Accommodations</a>
                <a href="resort-map.html">Resort Map</a>
                <a href="my-bookings.html">My Bookings</a>
                <a href="profile.html">Profile</a>
                <a href="#" id="logoutBtn">Logout</a>
              </nav>
            </header>
        
            <!-- ======================================================
               HERO SECTION
            ======================================================= -->
            <section class="hero-section">
              <div class="hero-inner">
                <div class="hero-badge">
                  Seaside comfort • Easy online booking • AI Chatbot Assistant
                </div>
        
                <h1>Escape to a more relaxing resort stay.</h1>
        
                <p>
                  Explore beautiful accommodations, book your preferred schedule, and
                  manage your stay with a cleaner, smarter, and more premium guest
                  experience.
                </p>
        
                <div class="hero-actions">
                  <a href="rooms.html" class="btn-primary">Browse Accommodations</a>
                  <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>
                </div>
              </div>
            </section>
        
            <!-- ======================================================
               MAIN HOME CONTENT
            ======================================================= -->
            <main class="home-wrapper">
              <section class="welcome-box">
                <h2>Your resort booking, made smoother</h2>
        
                <p>
                  Arvic Seaside helps you discover accommodations faster, compare stay
                  details clearly, and handle your reservations with less stress. From
                  accommodation selection to booking confirmation, the whole experience
                  feels more like a modern resort website.
                </p>
              </section>
        
              <!-- ======================================================
                 CLIENT INFORMATION SECTION
                 Added for mock defense and customer contact visibility.
              ======================================================= -->
              <section class="welcome-box">
                <h2>Arvic Seaside Beach Resort and Hotel</h2>
        
                <p>
                  Visit Arvic Seaside Beach Resort and Hotel at
                  <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong
                  >. The resort is open <strong>24 hours from Monday to Sunday</strong>.
                </p>
        
                <section class="home-grid" style="margin-top: 18px">
                  <div class="home-card location-map-card">
                    <iframe
                      class="location-map-bg"
                      src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"
                      loading="lazy"
                      referrerpolicy="no-referrer-when-downgrade"
                    ></iframe>
        
                    <div class="location-map-overlay"></div>
        
                    <div class="location-map-content">
                      <h2>Location</h2>
        
                      <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>
        
                      <a
                        href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"
                        class="btn-primary"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open Location
                      </a>
                    </div>
                  </div>
                  <!-- ======================================================
                 CONTACT DETAILS CARD
              ======================================================= -->
                  <div class="home-card contact-card">
                    <h2>Contact Details</h2>
        
                    <div class="contact-links-box">
                      <a href="tel:09569125625" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0956-912-5625</strong>
                          <small>Tap to call front desk</small>
                        </span>
                      </a>
        
                      <a href="tel:09678170662" class="contact-link-card">
                        <span class="contact-icon">☎</span>
                        <span>
                          <strong>0967-817-0662</strong>
                          <small>Alternative contact number</small>
                        </span>
                      </a>
        
                      <a
                        href="mailto:resortarvicseaside@gmail.com"
                        class="contact-link-card email-contact-card"
                      >
                        <span class="contact-icon">✉</span>
                        <span>
                          <strong>resortarvicseaside@gmail.com</strong>
                          <small>Email the resort for inquiries</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="contact-note">
                      Always open • Monday to Sunday • 24 hours
                    </div>
                  </div>
        
                  <!-- ======================================================
                 SOCIAL MEDIA CARD
              ======================================================= -->
                  <div class="home-card social-card">
                    <h2>Social Media</h2>
        
                    <p>
                      Follow or message the resort through its official social media
                      pages for inquiries, updates, and announcements.
                    </p>
        
                    <div class="social-links-box">
                      <a
                        href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"
                        class="social-link-card facebook-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">f</span>
                        <span>
                          <strong>Facebook Page</strong>
                          <small>Message us for inquiries</small>
                        </span>
                      </a>
        
                      <a
                        href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"
                        class="social-link-card tiktok-card"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span class="social-icon">♪</span>
                        <span>
                          <strong>TikTok</strong>
                          <small>View resort clips and updates</small>
                        </span>
                      </a>
                    </div>
        
                    <div class="social-note">
                      Official social media links of Arvic Seaside Beach Resort and
                      Hotel.
                    </div>
                  </div>
                </section>
              </section>
        
              <section class="home-grid">
                <div class="home-card">
                  <h2>Browse Accommodations</h2>
        
                  <p>
                    Explore available rooms, cottages, and function areas with a cleaner
                    card layout, pricing, capacity display, amenities, and booking-ready
                    actions.
                  </p>
        
                  <a href="rooms.html" class="btn-primary">Explore Accommodations</a>
                </div>
        
                <div class="home-card">
                  <h2>Track Your Reservation</h2>
        
                  <p>
                    Check your current bookings, receipt details, payment method, and
                    reservation status in one organized guest dashboard.
                  </p>
        
                  <a href="my-bookings.html" class="btn-primary">Open My Bookings</a>
                </div>
        
                <div class="home-card">
                  <h2>Manage Your Account</h2>
        
                  <p>
                    Review your saved guest information and update your password
                    securely whenever needed from your personal profile page.
                  </p>
        
                  <a href="profile.html" class="btn-primary">Go to Profile</a>
                </div>
              </section>
        
              <section class="quick-strip">
                <div class="quick-item">
                  <h3>Relaxing visual theme</h3>
        
                  <p>
                    A more premium ocean-and-sand color palette for a proper seaside
                    resort feel.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>Mobile-friendly layout</h3>
        
                  <p>
                    Cleaner spacing and stronger cards so the customer pages still feel
                    good on phones.
                  </p>
                </div>
        
                <div class="quick-item">
                  <h3>AI booking support</h3>
        
                  <p>
                    Ask for accommodation suggestions, dates, payment help, and start a
                    fresh new chat anytime.
                  </p>
                </div>
              </section>
            </main>
        
            <!-- ======================================================
               AI CHAT WIDGET
            ======================================================= -->
            <button id="aiChatToggle" class="ai-chat-toggle" type="button">Ask AI Assistant</button>
        
            <div id="aiChatWindow" class="ai-chat-window">
              <div class="ai-chat-header">
                <!-- UI-27: Branded concierge identity. Keep existing title and controls. -->
                <div class="ai-assistant-brand">
                  <span class="ai-assistant-mark" aria-hidden="true">AI</span>
                  <div class="ai-assistant-heading">
                    <h3>Arvic Seaside Resort AI Assistant</h3>
                    <span class="ai-assistant-caption">Your resort concierge · Here to help</span>
                  </div>
                </div>
        
                <div class="ai-chat-header-actions">
                  <button id="aiNewChatBtn" class="ai-chat-header-btn" title="New Chat" type="button">
                    New
                  </button>
        
                  <button
                    id="aiChatMaximize"
                    class="ai-chat-header-btn"
                    title="Maximize"
                   type="button">
                    ▢
                  </button>
        
                  <button id="aiChatClose" class="ai-chat-header-btn" title="Close" type="button">
                    &times;
                  </button>
                </div>
              </div>
        
              <div id="aiChatMessages" class="ai-chat-messages"></div>
        
              <div class="ai-chat-input-area">
                <input
                  type="text"
                  id="aiChatInput"
                  placeholder="Ask about rooms, cottages, dates, payment, or booking help..."
                />
        
                <button
                  id="aiMicBtn"
                  class="ai-chat-mic-btn"
                  title="Voice input"
                  aria-label="Voice input"
                 type="button">
                  🎤
                </button>
        
                <button id="aiSendBtn" class="ai-chat-send" type="button">Send</button>
              </div>
            </div>
        
            <!-- ======================================================
               PAGE SCRIPTS
            ======================================================= -->
            <script src="../sharedJS/toast.js"></script>
            <script src="../sharedJS/api-config.js"></script>
            <script src="../customerJS/index.js"></script>
            <script src="../js/ai-chat.js?v=20261121-ai45"></script>
            <script src="../js/ai-voice.js?v=20261121-dm08"></script>
            <script src="../js/ai-chat-polish.js?v=20261121-dm08"></script>
            <script>
              const menuToggle = document.getElementById("menuToggle");
              const mobileNav = document.getElementById("mobileNav");
        
              if (menuToggle && mobileNav) {
                menuToggle.addEventListener("click", () => {
                  mobileNav.classList.toggle("show");
                  menuToggle.textContent = mobileNav.classList.contains("show")
                    ? "×"
                    : "☰";
                });
              }
            </script>
              <!-- Shared Customer scroll navigation: stays hidden down, reappears after slight up-scroll. -->
            <script src="../sharedJS/customer-scroll-nav.js?v=20261120-ui30"></script>
            <script src="../sharedJS/logout-confirm.js"></script>
          </body>
        </html>
        
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-auto-multilingual-ui44.test.js:55:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
    ok 11 - AI-36 history trivia is politely refused with zero Gemini credits or SQL reads
      ---
      duration_ms: 99.991987
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 20.853646
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 6.986694
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 4.746689
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 5.431245
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 4.843309
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 114.73502
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 13.734454
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 4.327518
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 5.820821
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 26.029958
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 7.263911
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.401997
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.006512
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 14.88557
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 7.386379
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 6.849088
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 12.157223
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 7.58478
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 7.751421
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 7.252762
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 8.694729
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 6.968791
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 4.574779
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 7.250918
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 2.753864
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 2.975347
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 9.410002
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 11.696075
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 21.716384
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 9.781614
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 4.836596
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 5.119474
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.804835
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 4.999059
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 15.510655
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 4.085076
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 4.568869
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 6.809625
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 4.859169
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 4.383892
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 3.702012
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 705.927064
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.697504
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.127286
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.626527
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 4.014754
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.668654
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 5.663709
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 2.273248
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.274451
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 2.482618
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.409731
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.070863
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.349981
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.874839
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.725912
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.055381
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 701.466899
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 4.590467
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.238403
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.479261
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.06531
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.713014
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.218235
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 1.838959
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 1.939926
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 2.413649
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.339752
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 5.034796
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.415318
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.466494
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.374262
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 2.827972
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.17793
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.332739
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.263574
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.096829
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.897016
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.88573
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.348247
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.693668
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.59818
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 1.779047
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 1.686885
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.895473
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 2.595288
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.682096
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.572972
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 2.357064
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.48625
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    not ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 2.095076
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1820:3'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /Onsite po/i. Input:
        
        'Opo, puwedeng same-day walk-in basta may available na slot. Sa Front Desk po ang accommodation payment.'
        
      code: 'ERR_ASSERTION'
      name: 'AssertionError'
      expected:
      actual: 'Opo, puwedeng same-day walk-in basta may available na slot. Sa Front Desk po ang accommodation payment.'
      operator: 'match'
      stack: |-
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-booking-security.test.js:1830:12)
        process.processTicksAndRejections (node:internal/process/task_queues:103:5)
        async Test.run (node:internal/test_runner/test:1054:7)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 3.467915
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.957063
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 5.517727
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 2.383283
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.568909
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.034553
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.319424
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 2.310417
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 2.705122
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.699733
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 2.017691
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.042659
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 2.840776
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.214909
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.760652
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.85332
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 119 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 5.157254
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.130406
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 11.475502
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 2.137275
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 5.793671
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.499119
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 3.773425
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.704387
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 127 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.252535
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 128 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.332339
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 129 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.475621
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 130 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 2.219688
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 131 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 1.298821
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 132 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 0.921749
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 133 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 0.887885
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    not ok 134 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 3.168778
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
          '  resortInquiryPromptLines, matchUnverifiedResortPolicy,\n' +
          '  getUnverifiedResortPolicyReply,\n' +
          '} = require("./resortInquiryKnowledge");\n' +
          'const { validateAiStayWindow, calendarDayDifference, addCalendarDays } = require("./resortStayWindow");\n' +
          'const { normalizeRecentTurns, wantsAccommodationCards, verifiedAccommodationCards, tidyAssistantReply } =\n' +
          '  require("./aiConversationStyle");\n' +
          'const { requestedAmenity, amenityReply } = require("./aiAccommodationAmenities");\n' +
          'const { generalCategoryAmenitiesReply } = require("./aiAccommodationCategoryPolicy");\n' +
          'const { isNaturalRoomDetailsQuestion, naturalRoomDetailsReply } = require("./aiNaturalRoomDetails");\n' +
          'const { isFreeEntranceQuestion, explicitEntranceRoomName, verifiedFreeEntranceReply } = require("./aiAccommodationEntrance");\n' +
          'const { wantsFocusedRoomOverview, focusedRoomOverview } = require("./aiAccommodationDetails");\n' +
          'const { isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,\n' +
          '  requestedCategory } = require("./aiVerifiedPreview");\n' +
          'const { isRoomPaymentInquiry, resolvePaymentRoom, paymentReply } =\n' +
          '  require("./aiFocusedPaymentReply");\n' +
          'const {\n' +
          '  matchAccommodationCountQuestion, countSummary, countReply,\n' +
          '} = require("./aiAccommodationCounts");\n' +
          'const { matchCheapestInquiry, pickCheapestRows, cheapestReply } =\n' +
          '  require("./aiAffordableFollowup");\n' +
          'const { isResortQuestion, resortOnlyReply } = require("./aiResortScopeGuard");\n' +
          'const { isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,\n' +
          '  guestCountQuestion, guestCountFollowUp: pendingGuestRecommendationAnswer,\n' +
          '  guestCountCorrection, recommendationLookupMessage\n' +
          '} = require("./aiRecommendationIntake");\n' +
          'const {\n' +
          '  unknownRecordReply, matchUnverifiedServiceQuestion, guardUnsupportedPesoClaims,\n' +
          '} = require("./aiGroundedResponseRules");\n' +
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
          '       /\\b(?:moy|inyo|ninyo|kamo|diha|pud|gyud|ba|ang)\\b/iu.test(text))) return "bisaya";\n' +
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
          '  if (/\\b(?:guten\\s+tag|danke|zimmer|buchung|übernachtung|preise?|wie\\s+viel)\\b/iu.test(text)) return "german";\n' +
          '\n' +
          '  // Mandarin characters are a reliable signal even after an English turn.\n' +
          '  if (/[\\u3400-\\u9FFF]/u.test(text)) return "mandarin";\n' +
          '  // Also identify everyday Romanized Mandarin phrases and booking words.\n' +
          '  if (/\\b(?:ni\\s*hao(?:\\s*ma)?|nihao|xie\\s*xie|zaoshang\\s*hao|wo\\s*xiang\\s*(?:yuding|ding)|fangjian|jiudian|dujiacun|yuding|duo\\s*shao\\s*qian)\\b/i.test(text))\n' +
          '    return "mandarin";\n' +
          '\n' +
          '  // Detect common Spanish resort questions without relying on prior\n' +
          '  // conversation settings. Single "para" is ambiguous with Tagalog.\n' +
          '  const spanishTokens = text.match(/\\b(?:hola|habitaciones?|cu[aá]nto|cuesta|precios?|reservar|reservaci[oó]n|disponibles?|personas|noches|gracias|necesito|tenemos|quiero|busco|tienen|buenas|alojamiento)\\b/giu) || [];\n' +
          '  if (spanishTokens.length >= 2 ||\n' +
          '      (/\\b(?:hola|gracias|habitaciones?|cu[aá]nto|reservaci[oó]n)\\b/iu.test(text)\n' +
          '        && spanishTokens.length > 0)) return "spanish";\n' +
          '\n' +
          '  const tagalogWords = [\n' +
          '    "ako", "ikaw", "siya", "kami", "tayo", "kayo", "po", "opo", "naman",\n' +
          '    "gusto", "pwede", "puwede", "kuwarto", "kwarto", "magkano", "kailan",\n' +
          '    "saan", "petsa", "bayad", "bisita", "ilan", "m'... 116338 more characters
        
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
          resortInquiryPromptLines, matchUnverifiedResortPolicy,
          getUnverifiedResortPolicyReply,
        } = require("./resortInquiryKnowledge");
        const { validateAiStayWindow, calendarDayDifference, addCalendarDays } = require("./resortStayWindow");
        const { normalizeRecentTurns, wantsAccommodationCards, verifiedAccommodationCards, tidyAssistantReply } =
          require("./aiConversationStyle");
        const { requestedAmenity, amenityReply } = require("./aiAccommodationAmenities");
        const { generalCategoryAmenitiesReply } = require("./aiAccommodationCategoryPolicy");
        const { isNaturalRoomDetailsQuestion, naturalRoomDetailsReply } = require("./aiNaturalRoomDetails");
        const { isFreeEntranceQuestion, explicitEntranceRoomName, verifiedFreeEntranceReply } = require("./aiAccommodationEntrance");
        const { wantsFocusedRoomOverview, focusedRoomOverview } = require("./aiAccommodationDetails");
        const { isVerifiedPreviewRequest, selectVerifiedPreviews, verifiedPreviewReply,
          requestedCategory } = require("./aiVerifiedPreview");
        const { isRoomPaymentInquiry, resolvePaymentRoom, paymentReply } =
          require("./aiFocusedPaymentReply");
        const {
          matchAccommodationCountQuestion, countSummary, countReply,
        } = require("./aiAccommodationCounts");
        const { matchCheapestInquiry, pickCheapestRows, cheapestReply } =
          require("./aiAffordableFollowup");
        const { isResortQuestion, resortOnlyReply } = require("./aiResortScopeGuard");
        const { isPersonalizedRecommendation, explicitGuestCount, savedGuestCount,
          guestCountQuestion, guestCountFollowUp: pendingGuestRecommendationAnswer,
          guestCountCorrection, recommendationLookupMessage
        } = require("./aiRecommendationIntake");
        const {
          unknownRecordReply, matchUnverifiedServiceQuestion, guardUnsupportedPesoClaims,
        } = require("./aiGroundedResponseRules");
        
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
               /\b(?:moy|inyo|ninyo|kamo|diha|pud|gyud|ba|ang)\b/iu.test(text))) return "bisaya";
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
        
          englishWords.forEach((word) => {
            if (new RegExp("\\b" + word + "\\b", "i").test(text)) englishScore++;
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
              a.extended_price, c.name AS category_name
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
          if (/\bfunction\s*(area|hall|room)\b/.test(text)) return "function";
          if (/\brooms?\b|\bkwarto\b|\bkuwarto\b|\bhabitaci[oó]n\b|房间|客房/.test(text)) return "room";
          return null;
        }
        
        function catalogMatchFilter(rooms, context, message) {
          const selectedType = preferredAccommodationType(message, context);
          const name = normalizeText(context.room_name || "");
          const guestCount = Number(context.guests || 0);
          const budget = Number(context.max_price || 0);
          const isOvernight = /\bovernight\b|\bnight\b|\bgabi\b|\bnoche\b/.test(normalizeText(message));
          const isDayTour = /\bday\s*tour\b|\bdaytime\b|\baraw\b/.test(normalizeText(message));
          return rooms.filter(room => {
            if (name && !normalizeText(room.room_name).includes(name)) return false;
            if (context.room_id && Number(room.id) !== Number(context.room_id)) return false;
            if (selectedType &&
                !normalizeText(room.category_name).includes(selectedType) &&
                !normalizeText(room.room_name).includes(selectedType)) return false;
            if (guestCount > 0 && Number(room.capacity) < guestCount) return false;
            if (budget > 0 && Number.isFinite(budget)) {
              const day = Number(room.day_price || 0);
              const overnight = Number(room.overnight_price || 0);
              if (isOvernight ? (!overnight || overnight > budget)
                : isDayTour ? (!day || day > budget)
                : (!day || day > budget) && (!overnight || overnight > budget)) return false;
            }
            return true;
          });
        }
        
        function buildCatalogSummary(catalog, context, message) {
          const byCategory = {};
          for (const room of catalog) {
            const label = String(room.category_name || "Other");
            byCategory[label] = (byCategory[label] || 0) + 1;
          }
          const matches = catalogMatchFilter(catalog, context, message);
          const newestRequested = /\bnew\b|\blatest\b|recently added|bago|pinakabago|nuevo|nueva|最新|新房/i.test(String(message || ""));
          const recommendable = matches.filter(room =>
            normalizeText(room.status) === "available");
          const unavailable = matches.filter(room =>
            normalizeText(room.status) !== "available");
        
          const sorted = recommendable.slice().sort((a, b) => {
            const priceA = Math.min(...[a.day_price, a.overnight_price]
              .map(Number).filter(x => Number.isFinite(x) && x > 0).concat([Infinity]));
            const priceB = Math.min(...[b.day_price, b.overnight_price]
              .map(Number).filter(x => Number.isFinite(x) && x > 0).concat([Infinity]));
            return priceA - priceB || Number(a.id) - Number(b.id);
          });
        
          const formatRoom = room => [
            "ID " + room.id + ": " + room.room_name + " (" +
              (room.category_name || "Uncategorized") + ")",
            "Admin status: " + (room.status || "unknown"),
            "Maximum guests: " + room.capacity,
            "Day Tour: " + formatVerifiedAccommodationPrice(room.day_price),
            "Overnight: " + formatVerifiedAccommodationPrice(room.overnight_price),
            "Extended: " + formatVerifiedAccommodationPrice(room.extended_price),
            "Amenities: " + (room.amenities || "Not specified"),
            "Description: " + (room.description || "Not provided"),
          ].join(" | ");
        
          const categories = Object.entries(byCategory)
            .map(([name, count]) => name + " (" + count + ")").join(", ");
          // Show at least one candidate per requested category when a guest asks for
          // rooms AND cottages. Otherwise cheap cottages alone can crowd out rooms.
          const queryText = normalizeText(message);
          const asksForRooms = /\brooms?\b|\bkwarto\b|\bkuwarto\b/.test(queryText);
          const asksForCottages = /\bcottages?\b|\bkubo\b|\bkottage\b/.test(queryText);
          const priority = [];
          if (asksForRooms && asksForCottages) {
            for (const category of ["room", "cottage"]) {
              const candidate = sorted.find(room =>
                normalizeText(room.category_name).includes(category));
              if (candidate && !priority.some(room => room.id === candidate.id)) {
                priority.push(candidate);
              }
            }
          }
          const highlights = [
            ...priority,
            ...sorted.filter(room => !priority.some(item => item.id === room.id)),
          ].slice(0, 5);
          return {
            summary: [
              "CURRENT ADMIN-MANAGED ACCOMMODATION CATALOG (fresh database read):",
              "Records retrieved: " + catalog.length + " (maximum 150 per request).",
              "Categories: " + (categories || "None"),
              "Filter matches: " + matches.length +
                "; status-available candidates: " + recommendable.length + ".",
              "NOTE: Admin status available means listed for use, NOT a verified booking slot.",
              "Final dates, time slots, conflicts and price are verified by booking flow.",
              "SUGGESTED CANDIDATES (not availability-confirmed):",
              ...(highlights.length ? highlights.map(formatRoom) :
                ["No currently listed candidate matches the requested type/capacity/budget."]),
              "MATCHING UNAVAILABLE OR MAINTENANCE RECORDS:",
              ...(unavailable.length ? unavailable.slice(0, 3).map(formatRoom) : ["None"]),
              ...(newestRequested ? [
                "NEWEST ADDED ACCOMMODATIONS (by latest record ID; not necessarily available):",
                ...catalog.slice(0, 4).map(formatRoom),
              ] : []),
            ].join("\n"),
            recommendations: highlights.map(room => ({
              id: room.id, name: room.room_name, category: room.category_name,
              image: room.image, description: room.description, amenities: room.amenities,
              capacity: room.capacity, day_price: room.day_price,
              overnight_price: room.overnight_price, extended_price: room.extended_price,
              status: room.status, availability_verified: false,
            })),
          };
        }
        
        function filterRooms(rooms, filters, message = "") {
          // Restrict preliminary slot suggestions to the actual requested type,
          // guest capacity and applicable day/overnight budget. Unstructured bed,
          // view and aircon preferences are not verified by this schema.
          return catalogMatchFilter(rooms, filters, message);
        }
        
        function buildRoomsSummary(rooms) {
          if (!rooms.length) return "No matching accommodations found for the requested window.";
          return rooms.slice(0, 5).map((room, index) => [
            String(index + 1) + ". " + room.room_name,
            "   - Accommodation ID: " + room.id,
            "   - Category: " + (room.category_name || "N/A"),
            "   - Day Tour: " + formatVerifiedAccommodationPrice(room.day_price),
            "   - Overnight: " + formatVerifiedAccommodationPrice(room.overnight_price),
            "   - Extended: " + formatVerifiedAccommodationPrice(room.extended_price),
            "   - Maximum capacity: " + room.capacity,
            "   - Listed amenities: " + (room.amenities || "Not specified"),
            "   - Description: " + (room.description || "Not provided"),
          ].join("\n")).join("\n\n");
        }
        
        function buildTopRecommendationSummary(rooms) {
          if (!rooms.length) return "No matching recommendation is available.";
          return rooms.slice(0, 3).map((room, index) =>
            String(index + 1) + ". " + room.room_name +
            " | Day " + formatVerifiedAccommodationPrice(room.day_price) +
            " | Overnight " + formatVerifiedAccommodationPrice(room.overnight_price) +
            " | Capacity " + room.capacity
          ).join("\n");
        }
        
        async function findRoomByName(roomName) {
          const [rows] = await db.promise().query(
            "SELECT a.id, a.name AS room_name, a.description, a.image, " +
            "a.amenities, a.status, a.max_capacity AS capacity, a.day_price, " +
            "a.overnight_price, a.extended_price, c.name AS category_name " +
            "FROM accommodations a JOIN accommodation_categories c ON c.id = a.category_id " +
            "WHERE LOWER(a.name) LIKE ? ORDER BY a.id DESC LIMIT 1",
            ["%" + normalizeText(roomName) + "%"],
          );
          return rows[0] || null;
        }
        
        async function getAlternativeDatesForRoom(
          accommodationId, checkIn, checkOut, checkInTime, checkOutTime
        ) {
          const suggestions = [];
          const daySpan = getNightDifference(checkIn, checkOut);
          if (!Number.isInteger(daySpan) || daySpan < 0) return suggestions;
          let daysToCheck = 1;
          while (suggestions.length < 4 && daysToCheck <= 21) {
            const candidateCheckIn = addDays(checkIn, daysToCheck);
            const candidateCheckOut = addDays(candidateCheckIn, daySpan);
            const [conflicts] = await db.promise().query(
              "SELECT ri.id FROM reservation_items ri " +
              "JOIN reservations r ON r.id = ri.reservation_id " +
              "WHERE ri.accommodation_id = ? " +
              "AND LOWER(COALESCE(r.reservation_status, 'pending')) " +
              "NOT IN ('cancelled','rejected','completed') " +
              "AND LOWER(COALESCE(r.payment_status, 'pending')) " +
              "NOT IN ('rejected','refunded') " +
              "AND TIMESTAMP(ri.check_in_date, ri.check_in_time) < TIMESTAMP(?, ?) " +
              "AND TIMESTAMP(?, ?) < TIMESTAMP(ri.check_out_date, ri.check_out_time) LIMIT 1",
              [accommodationId, candidateCheckOut, checkOutTime,
                candidateCheckIn, checkInTime],
            );
            if (conflicts.length === 0) {
              suggestions.push({
                check_in: candidateCheckIn,
                check_out: candidateCheckOut,
                check_in_time: checkInTime,
                check_out_time: checkOutTime,
              });
            }
            daysToCheck++;
          }
          return suggestions;
        }
        
        function buildAlternativeSummary(alternatives) {
          if (!alternatives.length) return "No alternative dates found.";
        
          return alternatives
            .map((item, index) => `${index + 1}. Check-in: ${item.check_in} ${item.check_in_time}, Check-out: ${item.check_out} ${item.check_out_time} (preliminary)`)
            .join("\n");
        }
        
        // One-call optimization for simple *general catalog* questions.
        // Advanced booking, time, price constraints and cross-turn details still use
        // Gemini structured extraction + independent reservation verification.
        function canSkipCatalogIntentExtraction(message, context = {}) {
          const text = normalizeText(message);
          if (!text || text.length > 500) return false;
          if (!/\b(?:accommodations?|cottages?|rooms?|pavilions?)\b/i.test(text)) return false;
          if (!/\b(?:what|which|list|show|tell|offer|have|types|kinds|catalog|rates|prices|cost|how\s+much)\b/i.test(text)) {
            return false;
          }
          // A saved booking preference changes the meaning of a follow-up. Avoid
          // bypassing extraction when there is meaningful context to interpret.
          if ([
            "check_in", "check_out", "check_in_time", "check_out_time",
            "guests", "max_price", "room_name", "room_id", "view_type",
            "aircon_type", "bed_type", "bed_count", "wants_booking",
            "payment_method", "intent",
          ].some(key => context[key] !== undefined && context[key] !== null &&
            context[key] !== false && context[key] !== "")) return false;
        
          // No guessing structured booking intent from dates, times or numerical
          // requirements. Let Gemini handle those turns the existing safe way.
          if (/\d|₱|\bphp\b|\b(?:available|availability|book|booking|reserve|reservation|tomorrow|today|tonight|next|week|month|date|time|check.in|check.out|guest|pax|person|budget|under|below|overnight|weekend|saturday|sunday|monday|tuesday|wednesday|thursday|friday)\b/i.test(text)) {
            return false;
          }
          return true;
        }
        
        // Ask Gemini to extract structured booking details instead of trusting free-form chatbot prose.
        // Missing or ambiguous values remain unresolved until enough details are gathered.
        async function extractStructuredIntent(message, existingContext = {}) {
          const todayText = getResortTodayText();
        
          const extractionPrompt = `
        You are extracting booking details from a resort customer message.
        
        Return ONLY valid JSON.
        Do not add markdown.
        Do not explain anything.
        
        Use this exact JSON shape:
        {
          "intent": "",
          "check_in": null,
          "check_in_time": null,
          "check_out": null,
          "check_out_time": null,
          "slot_preference": null,
          "guests": null,
          "bed_count": null,
          "view_type": null,
          "aircon_type": null,
          "bed_type": null,
          "max_price": null,
          "room_name": null,
          "room_id": null,
          "wants_booking": false,
          "language_style": "english",
          "payment_method": null
        }
        
        Important date rules:
        - Today at the resort in the Philippines (Asia/Manila) is ${todayText}.
        - Never use an outdated year in examples, replies, or inferred dates.
        - Dates must be returned in YYYY-MM-DD format.
        - If the user gives month/day without a year, choose the nearest FUTURE valid year.
        - Never return a past date unless the user clearly asked for a past date.
        - If the month/day this year is already past, use next year.
        
        Time rules:
        - Return time in HH:MM:SS only if the guest explicitly gives a clock time.
        - Morning/day tour or evening/night preferences are NOT exact clock times: leave time fields null because each accommodation category has its own fixed hours.
        - Set slot_preference to "day_tour" for a clearly stated Day Tour/morning/umaga preference, "night" for Night/overnight/evening/gabi, otherwise null. If the message changes an earlier preference, use the new choice.
        - Never invent a clock time or treat a custom time as an officially bookable slot.
        - If time is not mentioned, return null.
        - Examples:
          - 2 PM => 14:00:00
          - 11:30 AM => 11:30:00
          - 14:00 => 14:00:00
        
        Payment method rules:
        - If user says cash, cash on arrival, or pay in person, set payment_method to "cash".
        - If user says online payment, paypal, pay online, gcash, or card, set payment_method to "paypal".
        
        language_style rules:
        - Return "tagalog" if the message is mostly Tagalog.
        - Return "taglish" if the message is mixed Tagalog and English.
        - Return "spanish" if the message is mostly Spanish.
        - Return "mandarin" if the message is Mandarin Chinese (including Simplified Chinese characters).
        - Return "english" if the message is mostly English.
        - Return "bisaya" if the message is in Cebuano/Bisaya.
        - For Japanese, Korean, Arabic, French, and German return their language names.
        - Do not infer a different language merely because stored conversation context uses one.
        
        Allowed intent values:
        - ask_recommendation
        - ask_availability
        - ask_alternative_dates
        - ask_price
        - ask_booking_help
        - general_question
        
        Allowed aircon_type examples:
        - aircon
        - non-aircon
        
        Current saved context:
        ${JSON.stringify(existingContext, null, 2)}
        
        Customer message:
        ${message}
