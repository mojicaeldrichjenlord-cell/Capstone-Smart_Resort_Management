# AI Mock Regression — testing branch

Source commit: e380bb916f32d023fde899db6cc87dc7218cfd56
Exit code: 1

No live Gemini, PayPal or production MySQL credentials.

---
    TAP version 13
    # Subtest: UI-34 reports show exactly two paid-charge cards, not the three removed cards
    ok 1 - UI-34 reports show exactly two paid-charge cards, not the three removed cards
      ---
      duration_ms: 1.278568
      type: 'test'
      ...
    # Subtest: UI-34 reports retain paid charges, accurate caveat and balanced print layout
    ok 2 - UI-34 reports retain paid charges, accurate caveat and balanced print layout
      ---
      duration_ms: 0.380791
      type: 'test'
      ...
    # Subtest: UI-34 walk-in preview shows full accommodation payment and NO 50% card
    ok 3 - UI-34 walk-in preview shows full accommodation payment and NO 50% card
      ---
      duration_ms: 37.000883
      type: 'test'
      ...
    # Subtest: UI-34 Facebook manual reservation still previews a 50% minimum payment
    ok 4 - UI-34 Facebook manual reservation still previews a 50% minimum payment
      ---
      duration_ms: 2.17393
      type: 'test'
      ...
    # Subtest: UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
    ok 5 - UI-34 preview code is presentation-only; secure payment flow still enforces full walk-in
      ---
      duration_ms: 0.558863
      type: 'test'
      ...
    # Subtest: AI-44 customer voice has no manual language selector or persisted language setting
    ok 6 - AI-44 customer voice has no manual language selector or persisted language setting
      ---
      duration_ms: 4.352699
      type: 'test'
      ...
    # Subtest: AI-44 voice and text requests detect each utterance independently
    ok 7 - AI-44 voice and text requests detect each utterance independently
      ---
      duration_ms: 0.436275
      type: 'test'
      ...
    # Subtest: AI-44 signed Gemini audio accepts mixed spoken languages without translating
    ok 8 - AI-44 signed Gemini audio accepts mixed spoken languages without translating
      ---
      duration_ms: 0.247522
      type: 'test'
      ...
    # Subtest: AI-44 safe Romanized Mandarin greeting and multilingual resort guard
    ok 9 - AI-44 safe Romanized Mandarin greeting and multilingual resort guard
      ---
      duration_ms: 1.671572
      type: 'test'
      ...
    # Subtest: AI-44 all authenticated Customer pages load fresh voice implementation
    not ok 10 - AI-44 all authenticated Customer pages load fresh voice implementation
      ---
      duration_ms: 3.221569
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
      duration_ms: 120.449477
      type: 'test'
      ...
    # Subtest: AI-36 second non-resort turn is still blocked even after prior refusal
    ok 12 - AI-36 second non-resort turn is still blocked even after prior refusal
      ---
      duration_ms: 25.281817
      type: 'test'
      ...
    # Subtest: AI-36 mixed history and parking request cannot get a generic AI answer
    ok 13 - AI-36 mixed history and parking request cannot get a generic AI answer
      ---
      duration_ms: 10.699703
      type: 'test'
      ...
    # Subtest: Retired AI create-booking route refuses unauthenticated direct writes
    ok 14 - Retired AI create-booking route refuses unauthenticated direct writes
      ---
      duration_ms: 16.970805
      type: 'test'
      ...
    # Subtest: Retired AI create-booking cannot write with a spoofed user_id
    ok 15 - Retired AI create-booking cannot write with a spoofed user_id
      ---
      duration_ms: 11.609665
      type: 'test'
      ...
    # Subtest: AI chat with missing message is rejected without DB access
    ok 16 - AI chat with missing message is rejected without DB access
      ---
      duration_ms: 7.325802
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
    ok 17 - AI-LIVE-05 count 45 cottages then cheapest follows cottage scope and exact prices
      ---
      duration_ms: 62.425688
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
    ok 18 - AI-LIVE-05 named cheapest replies reread Admin pricing, no cached ₱800
      ---
      duration_ms: 13.827735
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
    ok 19 - AI-LIVE-05 overnight cheapest ignores cheaper Day Tour and zero prices
      ---
      duration_ms: 5.743005
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 same-priced listings never select an arbitrary old room
    ok 20 - AI-LIVE-05 same-priced listings never select an arbitrary old room
      ---
      duration_ms: 5.126134
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
    ok 21 - AI-LIVE-05 selected cheapest room remains focused for a CR follow-up
      ---
      duration_ms: 21.379509
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
    ok 22 - AI-LIVE-05 unknown scope asks rooms or cottages without spending credits
      ---
      duration_ms: 8.230502
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
    ok 23 - AI-LIVE-04 Ilang rooms meron kayo returns a count, not room cards
      ---
      duration_ms: 4.757656
      type: 'test'
      ...
    # Subtest: Inventory counting always re-reads Admin state and never caps at 150
    ok 24 - Inventory counting always re-reads Admin state and never caps at 150
      ---
      duration_ms: 7.212921
      type: 'test'
      ...
    # Subtest: Count questions distinguish room, cottage, function and available listing statuses
    ok 25 - Count questions distinguish room, cottage, function and available listing statuses
      ---
      duration_ms: 15.868256
      type: 'test'
      ...
    # Subtest: AI-37 generic recommendation asks for guests first, no random cards or credits
    ok 26 - AI-37 generic recommendation asks for guests first, no random cards or credits
      ---
      duration_ms: 5.903045
      type: 'test'
      ...
    # Subtest: AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
    ok 27 - AI-37 natural 4 kami follow-up filters fresh rooms by capacity and gives cards
      ---
      duration_ms: 10.556343
      type: 'test'
      ...
    # Subtest: AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
    ok 28 - AI-37 bare 4, apat kami and 4 po follow the guest prompt without extra Gemini
      ---
      duration_ms: 7.665055
      type: 'test'
      ...
    # Subtest: AI-37 previously supplied guests are reused; explicit group size takes precedence
    ok 29 - AI-37 previously supplied guests are reused; explicit group size takes precedence
      ---
      duration_ms: 8.171692
      type: 'test'
      ...
    # Subtest: AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
    ok 30 - AI-38 after 10 guests, 7 pala refreshes matching rooms instead of refusing the topic
      ---
      duration_ms: 8.795166
      type: 'test'
      ...
    # Subtest: AI-38 corrected guest count sees newly updated Admin prices and inventory
    ok 31 - AI-38 corrected guest count sees newly updated Admin prices and inventory
      ---
      duration_ms: 6.84302
      type: 'test'
      ...
    # Subtest: AI-38 original family-room scope persists after revising 10 guests to 7
    ok 32 - AI-38 original family-room scope persists after revising 10 guests to 7
      ---
      duration_ms: 7.957972
      type: 'test'
      ...
    # Subtest: AI-45 natural two-to-seven follow-up retains group search even after language switch
    ok 33 - AI-45 natural two-to-seven follow-up retains group search even after language switch
      ---
      duration_ms: 10.289938
      type: 'test'
      ...
    # Subtest: AI-45 a guest-specific family-room preview keeps category on count correction
    ok 34 - AI-45 a guest-specific family-room preview keeps category on count correction
      ---
      duration_ms: 6.002881
      type: 'test'
      ...
    # Subtest: AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
    ok 35 - AI-38 stale or unrelated numeric messages cannot bypass resort-only restriction
      ---
      duration_ms: 7.237517
      type: 'test'
      ...
    # Subtest: AI-37 selecting a named accommodation or browsing rooms still works without guest question
    ok 36 - AI-37 selecting a named accommodation or browsing rooms still works without guest question
      ---
      duration_ms: 4.575415
      type: 'test'
      ...
    # Subtest: Undated room discovery uses fresh DB preview without claiming slot availability
    ok 37 - Undated room discovery uses fresh DB preview without claiming slot availability
      ---
      duration_ms: 3.476653
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
    ok 38 - AI-LIVE-03 focused single preview carries through CR follow-up using fresh DB
      ---
      duration_ms: 8.910314
      type: 'test'
      ...
    # Subtest: AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
    ok 39 - AI-LIVE-03 multiple possible rooms never inherit old focus or invent CR
      ---
      duration_ms: 6.826639
      type: 'test'
      ...
    # Subtest: Invalid same-day reversed times never query availability
    ok 40 - Invalid same-day reversed times never query availability
      ---
      duration_ms: 14.793647
      type: 'test'
      ...
    # Subtest: Valid same-day day tour checks current reservation_items and offers a suggestion
    ok 41 - Valid same-day day tour checks current reservation_items and offers a suggestion
      ---
      duration_ms: 14.147853
      type: 'test'
      ...
    # Subtest: Occupied window cannot generate an AI booking suggestion
    ok 42 - Occupied window cannot generate an AI booking suggestion
      ---
      duration_ms: 5.971863
      type: 'test'
      ...
    # Subtest: Alternative schedule checks active reservation_items without writing
    ok 43 - Alternative schedule checks active reservation_items without writing
      ---
      duration_ms: 4.485127
      type: 'test'
      ...
    # Subtest: Legacy SQL writer removed; frontend navigates through secure Customer form
    ok 44 - Legacy SQL writer removed; frontend navigates through secure Customer form
      ---
      duration_ms: 1.849865
      type: 'test'
      ...
    # Subtest: Spanish text chat overrides an older English chat-language preference
    ok 45 - Spanish text chat overrides an older English chat-language preference
      ---
      duration_ms: 5.049491
      type: 'test'
      ...
    # Subtest: Mandarin text chat overrides an older Spanish chat-language preference
    ok 46 - Mandarin text chat overrides an older Spanish chat-language preference
      ---
      duration_ms: 21.975001
      type: 'test'
      ...
    # Subtest: Voice response switches to Mandarin when the guest speaks Mandarin
    ok 47 - Voice response switches to Mandarin when the guest speaks Mandarin
      ---
      duration_ms: 5.18269
      type: 'test'
      ...
    # Subtest: Voice response switches back to English when the guest speaks English
    ok 48 - Voice response switches back to English when the guest speaks English
      ---
      duration_ms: 4.806576
      type: 'test'
      ...
    # Subtest: AI-44 Taglish and Spanish voice messages follow the latest guest language
    ok 49 - AI-44 Taglish and Spanish voice messages follow the latest guest language
      ---
      duration_ms: 7.958483
      type: 'test'
      ...
    # Subtest: Live voice Gemini prompt remains concise and obeys booking rules
    ok 50 - Live voice Gemini prompt remains concise and obeys booking rules
      ---
      duration_ms: 3.771453
      type: 'test'
      ...
    # Subtest: Normal text chat is not forced into live spoken-conversation style
    ok 51 - Normal text chat is not forced into live spoken-conversation style
      ---
      duration_ms: 2.789599
      type: 'test'
      ...
    # Subtest: English translation route responds with the English text
    ok 52 - English translation route responds with the English text
      ---
      duration_ms: 2.529785
      type: 'test'
      ...
    # Subtest: Temporary Gemini 503 during extraction recovers after one retry
    ok 53 - Temporary Gemini 503 during extraction recovers after one retry
      ---
      duration_ms: 704.332467
      type: 'test'
      ...
    # Gemini request failed (HTTP 503).
    # Subtest: Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
    ok 54 - Persistent Gemini 503 returns safe HTTP 503 without exposing SDK errors
      ---
      duration_ms: 705.937214
      type: 'test'
      ...
    # Gemini English translation failed (HTTP 429).
    # Subtest: Gemini free-tier 429 is not retried on translation
    ok 55 - Gemini free-tier 429 is not retried on translation
      ---
      duration_ms: 2.179952
      type: 'test'
      ...
    # Subtest: AI reply actions offer English and Tagalog, not Taglish translation
    ok 56 - AI reply actions offer English and Tagalog, not Taglish translation
      ---
      duration_ms: 0.627061
      type: 'test'
      ...
    # Subtest: New Admin accommodation appears immediately in the verified preview catalog
    ok 57 - New Admin accommodation appears immediately in the verified preview catalog
      ---
      duration_ms: 3.711532
      type: 'test'
      ...
    # Subtest: Admin price update is reflected immediately without stale AI cache
    ok 58 - Admin price update is reflected immediately without stale AI cache
      ---
      duration_ms: 4.86227
      type: 'test'
      ...
    # Subtest: Unavailable accommodation is described but not recommended
    ok 59 - Unavailable accommodation is described but not recommended
      ---
      duration_ms: 3.030249
      type: 'test'
      ...
    # Subtest: Budget and capacity filter read current rates and exclude mismatches
    ok 60 - Budget and capacity filter read current rates and exclude mismatches
      ---
      duration_ms: 3.245161
      type: 'test'
      ...
    # Subtest: Unrelated conversation is not forced to read the accommodation catalog
    ok 61 - Unrelated conversation is not forced to read the accommodation catalog
      ---
      duration_ms: 2.197073
      type: 'test'
      ...
    # Subtest: Verified date availability uses reservation schedules, not catalog guesses
    ok 62 - Verified date availability uses reservation schedules, not catalog guesses
      ---
      duration_ms: 6.531597
      type: 'test'
      ...
    # Subtest: HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
    ok 63 - HTTP 429 on accommodation inquiry returns actual live catalog without Gemini
      ---
      duration_ms: 4.607926
      type: 'test'
      ...
    # Subtest: Database backup rereads newly updated Admin prices during HTTP 429
    ok 64 - Database backup rereads newly updated Admin prices during HTTP 429
      ---
      duration_ms: 5.526381
      type: 'test'
      ...
    # Subtest: Maintenance rooms are excluded from 429 offline recommendations
    ok 65 - Maintenance rooms are excluded from 429 offline recommendations
      ---
      duration_ms: 2.521028
      type: 'test'
      ...
    # Subtest: Voice quota fallback uses language of current spoken question
    ok 66 - Voice quota fallback uses language of current spoken question
      ---
      duration_ms: 2.951884
      type: 'test'
      ...
    # Subtest: HTTP 429 with valid stay details checks reservation_items and creates no booking
    ok 67 - HTTP 429 with valid stay details checks reservation_items and creates no booking
      ---
      duration_ms: 2.623069
      type: 'test'
      ...
    # Gemini request failed (HTTP 429).
    # Subtest: Non-resort questions still show accurate Gemini 429 with no database lookup
    ok 68 - Non-resort questions still show accurate Gemini 429 with no database lookup
      ---
      duration_ms: 2.090775
      type: 'test'
      ...
    # Subtest: Persistent Gemini 503 can still answer read-only accommodation questions
    ok 69 - Persistent Gemini 503 can still answer read-only accommodation questions
      ---
      duration_ms: 703.094916
      type: 'test'
      ...
    # Subtest: Quota fallback parses explicit guest count and peso budget without Gemini
    ok 70 - Quota fallback parses explicit guest count and peso budget without Gemini
      ---
      duration_ms: 5.031606
      type: 'test'
      ...
    # Subtest: Quota fallback never guesses check-in dates from free-text
    ok 71 - Quota fallback never guesses check-in dates from free-text
      ---
      duration_ms: 2.889496
      type: 'test'
      ...
    # Subtest: English accommodation question remains English during Gemini quota fallback
    ok 72 - English accommodation question remains English during Gemini quota fallback
      ---
      duration_ms: 2.581271
      type: 'test'
      ...
    # Subtest: Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
    ok 73 - Simple accommodation catalog inquiry uses ONE Gemini call, still fresh from MySQL
      ---
      duration_ms: 2.175824
      type: 'test'
      ...
    # Subtest: Undated cottage catalog uses one fresh DB read and zero Gemini credits
    ok 74 - Undated cottage catalog uses one fresh DB read and zero Gemini credits
      ---
      duration_ms: 1.794482
      type: 'test'
      ...
    # Subtest: Explicit booking windows still take the safe extraction and slot-check flow
    ok 75 - Explicit booking windows still take the safe extraction and slot-check flow
      ---
      duration_ms: 2.405783
      type: 'test'
      ...
    # Subtest: Undated preview retains saved guest count and excludes undersized cottages
    ok 76 - Undated preview retains saved guest count and excludes undersized cottages
      ---
      duration_ms: 2.00249
      type: 'test'
      ...
    # Subtest: Voice catalog reply uses current English and retains speech prompt
    ok 77 - Voice catalog reply uses current English and retains speech prompt
      ---
      duration_ms: 2.09872
      type: 'test'
      ...
    # Subtest: Optimized prompt does not duplicate full booking context and live details
    ok 78 - Optimized prompt does not duplicate full booking context and live details
      ---
      duration_ms: 3.015623
      type: 'test'
      ...
    # Subtest: Quota fallback does not issue a second catalog SQL read after optimized Gemini call
    ok 79 - Quota fallback does not issue a second catalog SQL read after optimized Gemini call
      ---
      duration_ms: 2.996045
      type: 'test'
      ...
    # Subtest: English spoken catalog quota fallback does not inherit old Mandarin
    ok 80 - English spoken catalog quota fallback does not inherit old Mandarin
      ---
      duration_ms: 2.362593
      type: 'test'
      ...
    # Subtest: Oversized AI message is rejected before Gemini and database access
    ok 81 - Oversized AI message is rejected before Gemini and database access
      ---
      duration_ms: 1.494706
      type: 'test'
      ...
    # Subtest: Oversized stored AI context cannot inflate token usage
    ok 82 - Oversized stored AI context cannot inflate token usage
      ---
      duration_ms: 1.467721
      type: 'test'
      ...
    # Subtest: Oversized translation is rejected before paid Gemini calls
    ok 83 - Oversized translation is rejected before paid Gemini calls
      ---
      duration_ms: 1.414532
      type: 'test'
      ...
    # Subtest: Normal short chat and translation remain usable after size limits
    ok 84 - Normal short chat and translation remain usable after size limits
      ---
      duration_ms: 6.32891
      type: 'test'
      ...
    # Subtest: AI prompts use current Philippine date and explicitly reject stale examples
    ok 85 - AI prompts use current Philippine date and explicitly reject stale examples
      ---
      duration_ms: 2.496904
      type: 'test'
      ...
    # Subtest: AI compares rooms and cottages with their current independent catalog rates
    ok 86 - AI compares rooms and cottages with their current independent catalog rates
      ---
      duration_ms: 2.816561
      type: 'test'
      ...
    # Subtest: Tagalog replies and translations request consistently polite customer tone
    ok 87 - Tagalog replies and translations request consistently polite customer tone
      ---
      duration_ms: 3.463498
      type: 'test'
      ...
    # Subtest: Standard Taglish downpayment policy is returned locally even with stale context
    ok 88 - Standard Taglish downpayment policy is returned locally even with stale context
      ---
      duration_ms: 2.110642
      type: 'test'
      ...
    # Subtest: Local policy answers Filipino paunang bayad without listing rooms
    ok 89 - Local policy answers Filipino paunang bayad without listing rooms
      ---
      duration_ms: 1.772751
      type: 'test'
      ...
    # Subtest: Named cottage deposit is verified locally without Gemini even during quota outage
    ok 90 - Named cottage deposit is verified locally without Gemini even during quota outage
      ---
      duration_ms: 2.969977
      type: 'test'
      ...
    # Subtest: Focused payment never mistakes Nipa Hut 20 for Hut 2
    ok 91 - Focused payment never mistakes Nipa Hut 20 for Hut 2
      ---
      duration_ms: 2.225706
      type: 'test'
      ...
    # Subtest: Local policy answers plain English online booking deposit without SQL
    ok 92 - Local policy answers plain English online booking deposit without SQL
      ---
      duration_ms: 1.652376
      type: 'test'
      ...
    # Subtest: Observed English question gets correct fixed 50% policy using zero API calls
    ok 93 - Observed English question gets correct fixed 50% policy using zero API calls
      ---
      duration_ms: 1.994736
      type: 'test'
      ...
    # Subtest: Named cottage deposit quotes a fresh verified price without paid Gemini
    ok 94 - Named cottage deposit quotes a fresh verified price without paid Gemini
      ---
      duration_ms: 2.026905
      type: 'test'
      ...
    # Subtest: Cancellation plus refund question is handled accurately without Gemini
    ok 95 - Cancellation plus refund question is handled accurately without Gemini
      ---
      duration_ms: 2.268767
      type: 'test'
      ...
    # Subtest: Policy accuracy: Refund policy avoids promising any refund
    ok 96 - Policy accuracy: Refund policy avoids promising any refund
      ---
      duration_ms: 1.919355
      type: 'test'
      ...
    # Subtest: Policy accuracy: Cancellation requires one day and pending/approved
    ok 97 - Policy accuracy: Cancellation requires one day and pending/approved
      ---
      duration_ms: 1.962696
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish cancellation stays polite and gives the actual rule
    ok 98 - Policy accuracy: Taglish cancellation stays polite and gives the actual rule
      ---
      duration_ms: 1.780305
      type: 'test'
      ...
    # Subtest: Policy accuracy: Entrance fees are separate and not a fixed price
    ok 99 - Policy accuracy: Entrance fees are separate and not a fixed price
      ---
      duration_ms: 1.65976
      type: 'test'
      ...
    # Subtest: Policy accuracy: Tagalog entrance fee does not invent pesos
    ok 100 - Policy accuracy: Tagalog entrance fee does not invent pesos
      ---
      duration_ms: 1.825779
      type: 'test'
      ...
    # Subtest: Policy accuracy: Walk-in guidance never guarantees accommodation availability
    ok 101 - Policy accuracy: Walk-in guidance never guarantees accommodation availability
      ---
      duration_ms: 1.555746
      type: 'test'
      ...
    # Subtest: Policy accuracy: Taglish walk-in is same-day and onsite
    ok 102 - Policy accuracy: Taglish walk-in is same-day and onsite
      ---
      duration_ms: 1.604216
      type: 'test'
      ...
    # Subtest: Policy accuracy: AI never claims that chat confirms a reservation
    ok 103 - Policy accuracy: AI never claims that chat confirms a reservation
      ---
      duration_ms: 2.05078
      type: 'test'
      ...
    # Subtest: A named accommodation keeps fresh database lookups rather than generic policy
    ok 104 - A named accommodation keeps fresh database lookups rather than generic policy
      ---
      duration_ms: 2.23275
      type: 'test'
      ...
    # Subtest: A customer-specific refund amount is not guessed by generic policy
    ok 105 - A customer-specific refund amount is not guessed by generic policy
      ---
      duration_ms: 1.946275
      type: 'test'
      ...
    # Subtest: General policy facts are embedded in Gemini prompt for non-FAQ conversations
    ok 106 - General policy facts are embedded in Gemini prompt for non-FAQ conversations
      ---
      duration_ms: 1.946736
      type: 'test'
      ...
    # Subtest: Spanish cancellation FAQ overrides stale English preference without Gemini
    ok 107 - Spanish cancellation FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 2.320523
      type: 'test'
      ...
    # Subtest: Mandarin refund FAQ overrides stale English preference without Gemini
    ok 108 - Mandarin refund FAQ overrides stale English preference without Gemini
      ---
      duration_ms: 1.602983
      type: 'test'
      ...
    # Subtest: Past explicit year never rolls forward to create a misleading AI booking preview
    ok 109 - Past explicit year never rolls forward to create a misleading AI booking preview
      ---
      duration_ms: 2.049327
      type: 'test'
      ...
    # Subtest: Impossible February 30 is rejected without querying availability
    ok 110 - Impossible February 30 is rejected without querying availability
      ---
      duration_ms: 4.54592
      type: 'test'
      ...
    # Subtest: Reversed same-day window returns an actionable invalid-window response
    ok 111 - Reversed same-day window returns an actionable invalid-window response
      ---
      duration_ms: 3.019991
      type: 'test'
      ...
    # Subtest: Valid future overnight window continues fresh reservation availability lookup
    ok 112 - Valid future overnight window continues fresh reservation availability lookup
      ---
      duration_ms: 2.252086
      type: 'test'
      ...
    # Subtest: Missing accommodation prices are not misrepresented as free PHP 0.00
    ok 113 - Missing accommodation prices are not misrepresented as free PHP 0.00
      ---
      duration_ms: 1.807345
      type: 'test'
      ...
    # Subtest: Fresh positive accommodation rate stays numerically exact in AI prompt
    ok 114 - Fresh positive accommodation rate stays numerically exact in AI prompt
      ---
      duration_ms: 2.324862
      type: 'test'
      ...
    # Subtest: Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
    ok 115 - Parking fee question bypasses room-payment resolver and makes zero paid or SQL calls
      ---
      duration_ms: 3.361559
      type: 'test'
      ...
    # Subtest: Actual customer van/bus parking question uses verified zero-credit FAQ
    ok 116 - Actual customer van/bus parking question uses verified zero-credit FAQ
      ---
      duration_ms: 2.101195
      type: 'test'
      ...
    # Subtest: Parking + entrance question explains fee distinction without room suggestions
    ok 117 - Parking + entrance question explains fee distinction without room suggestions
      ---
      duration_ms: 1.70789
      type: 'test'
      ...
    # Subtest: Multi-facility resort question stays grounded with read-only catalog SQL
    ok 118 - Multi-facility resort question stays grounded with read-only catalog SQL
      ---
      duration_ms: 2.383251
      type: 'test'
      ...
    # Subtest: Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
    ok 119 - Unverified resort-wide Wi-Fi and pet policies do not spend credits or pretend to be confirmed
      ---
      duration_ms: 4.780178
      type: 'test'
      ...
    # Subtest: Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
    ok 120 - Focused-room Wi-Fi follow-up is not overridden by unknown resort-wide policy
      ---
      duration_ms: 3.300414
      type: 'test'
      ...
    # Subtest: AI-40 Ask About This returns verified facts for every selected accommodation type
    ok 121 - AI-40 Ask About This returns verified facts for every selected accommodation type
      ---
      duration_ms: 10.9553
      type: 'test'
      ...
    # Subtest: AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
    ok 122 - AI-40 empty amenities still return capacity and rates, not only a Front Desk referral
      ---
      duration_ms: 2.053475
      type: 'test'
      ...
    # Subtest: AI-40 stale selected room IDs and renamed listings are not silently described
    ok 123 - AI-40 stale selected room IDs and renamed listings are not silently described
      ---
      duration_ms: 2.948647
      type: 'test'
      ...
    # Subtest: AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
    ok 124 - AI-41 Ask About This follows the visitor's genuine Taglish question, not card English
      ---
      duration_ms: 2.225446
      type: 'test'
      ...
    # Subtest: AI-44 clicked room description uses guest English for both text and voice
    ok 125 - AI-44 clicked room description uses guest English for both text and voice
      ---
      duration_ms: 3.574245
      type: 'test'
      ...
    # Subtest: AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
    ok 126 - AI-44 Mandarin pinyin greeting is answered in Chinese with no model call
      ---
      duration_ms: 1.52575
      type: 'test'
      ...
    # Subtest: UI-38 conversation rows are flex columns with direction-aware alignment
    ok 127 - UI-38 conversation rows are flex columns with direction-aware alignment
      ---
      duration_ms: 1.342247
      type: 'test'
      ...
    # Subtest: UI-38 reply actions and structured booking previews remain usable
    ok 128 - UI-38 reply actions and structured booking previews remain usable
      ---
      duration_ms: 0.315539
      type: 'test'
      ...
    # Subtest: UI-38 fresh CSS is requested across Landing and all Customer chat pages
    ok 129 - UI-38 fresh CSS is requested across Landing and all Customer chat pages
      ---
      duration_ms: 1.620867
      type: 'test'
      ...
    # Subtest: AI keeps only six short allowed recent conversation turns
    ok 130 - AI keeps only six short allowed recent conversation turns
      ---
      duration_ms: 4.175798
      type: 'test'
      ...
    # Subtest: AI suggests cards on new room searches, not on pricing follow-ups
    ok 131 - AI suggests cards on new room searches, not on pricing follow-ups
      ---
      duration_ms: 2.101094
      type: 'test'
      ...
    # Subtest: AI cards are limited, deduplicated and never invent a rate or booking availability
    ok 132 - AI cards are limited, deduplicated and never invent a rate or booking availability
      ---
      duration_ms: 1.390046
      type: 'test'
      ...
    # Subtest: Repeated self-introductions removed, but direct identity answers remain
    ok 133 - Repeated self-introductions removed, but direct identity answers remain
      ---
      duration_ms: 1.46688
      type: 'test'
      ...
    # Subtest: Backend response uses fresh database records instead of model-generated card URLs
    ok 134 - Backend response uses fresh database records instead of model-generated card URLs
      ---
      duration_ms: 1.193769
      type: 'test'
      ...
    # Subtest: Frontend cards provide View Details, booking link and focused follow-up
    ok 135 - Frontend cards provide View Details, booking link and focused follow-up
      ---
      duration_ms: 1.136723
      type: 'test'
      ...
    # Subtest: Focused accommodation amenities use both Admin description and inclusions
    ok 136 - Focused accommodation amenities use both Admin description and inclusions
      ---
      duration_ms: 17.626209
      type: 'test'
      ...
    # Subtest: Simple amenity path does a read-only ID lookup without Gemini or booking writes
    ok 137 - Simple amenity path does a read-only ID lookup without Gemini or booking writes
      ---
      duration_ms: 0.952729
      type: 'test'
      ...
    # Subtest: Catalog Ask AI About This preserves the selected room while new searches clear it
    ok 138 - Catalog Ask AI About This preserves the selected room while new searches clear it
      ---
      duration_ms: 3.193985
      type: 'test'
      ...
    # Subtest: Voice control code remains out of scope for this text-behavior stage
    ok 139 - Voice control code remains out of scope for this text-behavior stage
      ---
      duration_ms: 1.412157
      type: 'test'
      ...
    # Subtest: AI focused-room overview matches selected room but not a different room or payment topic
    ok 140 - AI focused-room overview matches selected room but not a different room or payment topic
      ---
      duration_ms: 4.52965
      type: 'test'
      ...
    # Subtest: AI focused-room details are concise, from DB facts, and never invent a rate
    ok 141 - AI focused-room details are concise, from DB facts, and never invent a rate
      ---
      duration_ms: 20.02562
      type: 'test'
      ...
    # Subtest: AI selected-room overview is a read-only DB path before Gemini extraction
    ok 142 - AI selected-room overview is a read-only DB path before Gemini extraction
      ---
      duration_ms: 0.679419
      type: 'test'
      ...
    # Subtest: Single-feature aircon follow-up stays concise and never lists other amenities
    ok 143 - Single-feature aircon follow-up stays concise and never lists other amenities
      ---
      duration_ms: 0.345214
      type: 'test'
      ...
    # Subtest: Amenity route preserves single-topic DB response even when room ID is missing
    ok 144 - Amenity route preserves single-topic DB response even when room ID is missing
      ---
      duration_ms: 1.55815
      type: 'test'
      ...
    # Subtest: UI-26 Gemini is the default mic transcription without an input-mode dropdown
    ok 145 - UI-26 Gemini is the default mic transcription without an input-mode dropdown
      ---
      duration_ms: 0.476079
      type: 'test'
      ...
    # Subtest: UI-26 airy chatbot theme loads after Customer theme on both pages
    not ok 146 - UI-26 airy chatbot theme loads after Customer theme on both pages
      ---
      duration_ms: 5.777621
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:274:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /ai-voice\.js\?v=20261121-auto44/. Input:
        
        '<!doctype html>\n' +
          '<html lang="en">\n' +
          '  <head>\n' +
          '    <meta charset="UTF-8" />\n' +
          '  <!-- DM-02: Restore Customer theme before first paint; navbar switch initializes after DOM load. -->\n' +
          '  <script src="../sharedJS/customer-theme-toggle.js?v=20261121-dm04"></script>\n' +
          '\n' +
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '\n' +
          '    <title>Arvic Seaside | Home</title>\n' +
          '    <!-- Arvic Seaside: square brand favicon for browser tabs and Google Search. -->\n' +
          '    <link rel="icon" type="image/svg+xml" sizes="any" href="../favicon.svg" />\n' +
          '\n' +
          '    <link rel="stylesheet" href="../sharedCSS/global.css" />\n' +
          '    <link rel="stylesheet" href="../css/style.css" />\n' +
          '    <link rel="stylesheet" href="../customerCSS/index.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-voice.css?v=20261121-auto44" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261121-ui38" />\n' +
          '      <!-- Consistent, centered confirmation for accidental logout clicks. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />\n' +
          '    <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />\n' +
          '    <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />\n' +
          '  <!-- DM-01: Customer-only theme palette. Default is the existing Light Mode. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-theme-tokens.css?v=20261121-dm01" />\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-theme-toggle.css?v=20261121-dm04" />\n' +
          '  <!-- DM-03: Soft Dark styling, screen-only and customer-only. Light Mode unaffected. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-dark-skin-dm03.css?v=20261121-dm03" />\n' +
          '  <!-- DM-04: Soft Dark polish, background icon removal and My Bookings fixes. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-comfort-polish-dm04.css?v=20261121-dm04" />\n' +
          '  <!-- DM-05: Compact signed-in Customer mobile menu, touch-friendly Theme row. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-mobile-nav-dm05.css?v=20261121-dm05" />\n' +
          '  <!-- DM-06: Last dark-only AI concierge palette; keep Light Mode untouched. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-ai-dark-polish-dm06.css?v=20261121-dm06" />\n' +
          '  <!-- DM-07: one compact, unified Customer AI concierge skin (must load last). -->\n' +
          '  <link rel="stylesheet" href="../sharedCSS/ai-concierge-dm07.css?v=20261121-dm08" />\n' +
          '</head>\n' +
          '\n' +
          '  <body class="customer-manager-tone">\n' +
          '    <!-- ======================================================\n' +
          '       CUSTOMER NAVBAR\n' +
          '       Same Resort Map navbar style on all customer pages.\n' +
          '    ======================================================= -->\n' +
          '    <header class="navbar">\n' +
          '      <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->\n' +
          '      <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>\n' +
          '\n' +
          '      <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>\n' +
          '\n' +
          '      <nav id="mobileNav">\n' +
          '        <a href="index.html" class="active-nav">Home</a>\n' +
          '        <a href="rooms.html">Accommodations</a>\n' +
          '        <a href="resort-map.html">Resort Map</a>\n' +
          '        <a href="my-bookings.html">My Bookings</a>\n' +
          '        <a href="profile.html">Profile</a>\n' +
          '        <a href="#" id="logoutBtn">Logout</a>\n' +
          '      </nav>\n' +
          '    </header>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       HERO SECTION\n' +
          '    ======================================================= -->\n' +
          '    <section class="hero-section">\n' +
          '      <div class="hero-inner">\n' +
          '        <div class="hero-badge">\n' +
          '          Seaside comfort • Easy online booking • AI Chatbot Assistant\n' +
          '        </div>\n' +
          '\n' +
          '        <h1>Escape to a more relaxing resort stay.</h1>\n' +
          '\n' +
          '        <p>\n' +
          '          Explore beautiful accommodations, book your preferred schedule, and\n' +
          '          manage your stay with a cleaner, smarter, and more premium guest\n' +
          '          experience.\n' +
          '        </p>\n' +
          '\n' +
          '        <div class="hero-actions">\n' +
          '          <a href="rooms.html" class="btn-primary">Browse Accommodations</a>\n' +
          '          <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>\n' +
          '        </div>\n' +
          '      </div>\n' +
          '    </section>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       MAIN HOME CONTENT\n' +
          '    ======================================================= -->\n' +
          '    <main class="home-wrapper">\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Your resort booking, made smoother</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Arvic Seaside helps you discover accommodations faster, compare stay\n' +
          '          details clearly, and handle your reservations with less stress. From\n' +
          '          accommodation selection to booking confirmation, the whole experience\n' +
          '          feels more like a modern resort website.\n' +
          '        </p>\n' +
          '      </section>\n' +
          '\n' +
          '      <!-- ======================================================\n' +
          '         CLIENT INFORMATION SECTION\n' +
          '         Added for mock defense and customer contact visibility.\n' +
          '      ======================================================= -->\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Arvic Seaside Beach Resort and Hotel</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Visit Arvic Seaside Beach Resort and Hotel at\n' +
          '          <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong\n' +
          '          >. The resort is open <strong>24 hours from Monday to Sunday</strong>.\n' +
          '        </p>\n' +
          '\n' +
          '        <section class="home-grid" style="margin-top: 18px">\n' +
          '          <div class="home-card location-map-card">\n' +
          '            <iframe\n' +
          '              class="location-map-bg"\n' +
          '              src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"\n' +
          '              loading="lazy"\n' +
          '              referrerpolicy="no-referrer-when-downgrade"\n' +
          '            ></iframe>\n' +
          '\n' +
          '            <div class="location-map-overlay"></div>\n' +
          '\n' +
          '            <div class="location-map-content">\n' +
          '              <h2>Location</h2>\n' +
          '\n' +
          '              <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"\n' +
          '                class="btn-primary"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                Open Location\n' +
          '              </a>\n' +
          '            </div>\n' +
          '          </div>\n' +
          '          <!-- ======================================================\n' +
          '         CONTACT DETAILS CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card contact-card">\n' +
          '            <h2>Contact Details</h2>\n' +
          '\n' +
          '            <div class="contact-links-box">\n' +
          '              <a href="tel:09569125625" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0956-912-5625</strong>\n' +
          '                  <small>Tap to call front desk</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a href="tel:09678170662" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0967-817-0662</strong>\n' +
          '                  <small>Alternative contact number</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="mailto:resortarvicseaside@gmail.com"\n' +
          '                class="contact-link-card email-contact-card"\n' +
          '              >\n' +
          '                <span class="contact-icon">✉</span>\n' +
          '                <span>\n' +
          '                  <strong>resortarvicseaside@gmail.com</strong>\n' +
          '                  <small>Email the resort for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="contact-note">\n' +
          '              Always open • Monday to Sunday • 24 hours\n' +
          '            </div>\n' +
          '          </div>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '         SOCIAL MEDIA CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card social-card">\n' +
          '            <h2>Social Media</h2>\n' +
          '\n' +
          '            <p>\n' +
          '              Follow or message the resort through its official social media\n' +
          '              pages for inquiries, updates, and announcements.\n' +
          '            </p>\n' +
          '\n' +
          '            <div class="social-links-box">\n' +
          '              <a\n' +
          '                href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"\n' +
          '                class="social-link-card facebook-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">f</span>\n' +
          '                <span>\n' +
          '                  <strong>Facebook Page</strong>\n' +
          '                  <small>Message us for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"\n' +
          '                class="social-link-card tiktok-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">♪</span>\n' +
          '                <span>\n' +
          '                  <strong>TikTok</strong>\n' +
          '                  <small>View resort clips and updates</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="social-note">\n' +
          '              Official social media links of Arvic Seaside Beach Resort and\n' +
          '              Hotel.\n' +
          '            </div>\n' +
          '          </div>\n' +
          '        </section>\n' +
          '      </section>\n' +
          '\n' +
          '      <section class="home-grid">\n' +
          '        <div class="home-card">\n' +
          '          <h2>Browse Accommodations</h2>\n' +
          '\n' +
          '          <p>\n' +
          '            Explore available rooms, cotta'... 4694 more characters
        
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
        TestContext.<anonymous> (/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:287:12)
        Test.runInAsyncScope (node:async_hooks:214:14)
        Test.run (node:internal/test_runner/test:1047:25)
        Test.processPendingSubtests (node:internal/test_runner/test:744:18)
        Test.postRun (node:internal/test_runner/test:1173:19)
        Test.run (node:internal/test_runner/test:1101:12)
        async Test.processPendingSubtests (node:internal/test_runner/test:744:7)
      ...
    # Subtest: AI-LIVE-04 natural count intent handles Taglish, English and category questions
    ok 147 - AI-LIVE-04 natural count intent handles Taglish, English and category questions
      ---
      duration_ms: 4.126036
      type: 'test'
      ...
    # Subtest: AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
    ok 148 - AI-LIVE-04 inventory summaries distinguish Room category and unverified slots
      ---
      duration_ms: 0.618736
      type: 'test'
      ...
    # Subtest: AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
    ok 149 - AI-LIVE-05 cheapest follow-up uses recent category without stale group filter
      ---
      duration_ms: 3.669714
      type: 'test'
      ...
    # Subtest: UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
    ok 150 - UI-27 customer chatbot docks to lower-right and keeps a responsive branded header
      ---
      duration_ms: 0.46073
      type: 'test'
      ...
    # Subtest: UI-27 starter chips are real message actions and never pollute restored chat history
    ok 151 - UI-27 starter chips are real message actions and never pollute restored chat history
      ---
      duration_ms: 0.550008
      type: 'test'
      ...
    # Subtest: UI-28 open voice settings remain compact while preserving voice controls and important errors
    not ok 152 - UI-28 open voice settings remain compact while preserving voice controls and important errors
      ---
      duration_ms: 1.4077
      type: 'test'
      location: '/home/runner/work/Capstone-Smart_Resort_Management/Capstone-Smart_Resort_Management/backend/tests/ai-natural-recommendations.test.js:432:1'
      failureType: 'testCodeFailure'
      error: |-
        The input did not match the regular expression /ai-voice\.js\?v=20261121-auto44/. Input:
        
        '<!doctype html>\n' +
          '<html lang="en">\n' +
          '  <head>\n' +
          '    <meta charset="UTF-8" />\n' +
          '  <!-- DM-02: Restore Customer theme before first paint; navbar switch initializes after DOM load. -->\n' +
          '  <script src="../sharedJS/customer-theme-toggle.js?v=20261121-dm04"></script>\n' +
          '\n' +
          '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n' +
          '\n' +
          '    <title>Arvic Seaside | Home</title>\n' +
          '    <!-- Arvic Seaside: square brand favicon for browser tabs and Google Search. -->\n' +
          '    <link rel="icon" type="image/svg+xml" sizes="any" href="../favicon.svg" />\n' +
          '\n' +
          '    <link rel="stylesheet" href="../sharedCSS/global.css" />\n' +
          '    <link rel="stylesheet" href="../css/style.css" />\n' +
          '    <link rel="stylesheet" href="../customerCSS/index.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/customer-navbar.css?v=20261120-ui30" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-voice.css?v=20261121-auto44" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-recommendations.css" />\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-layout.css?v=20261121-ui38" />\n' +
          '      <!-- Consistent, centered confirmation for accidental logout clicks. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/logout-confirm.css" />\n' +
          '    <!-- Stage UI-22: visual-only muted Customer theme, loaded last. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-manager-tone.css?v=20261119-ui22" />\n' +
          '    <!-- UI-26: Light, airy shared AI chat skin; load AFTER customer theme. -->\n' +
          '    <link rel="stylesheet" href="../sharedCSS/ai-chat-airy.css?v=20261120-ui30" />\n' +
          '  <!-- DM-01: Customer-only theme palette. Default is the existing Light Mode. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-theme-tokens.css?v=20261121-dm01" />\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-theme-toggle.css?v=20261121-dm04" />\n' +
          '  <!-- DM-03: Soft Dark styling, screen-only and customer-only. Light Mode unaffected. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-dark-skin-dm03.css?v=20261121-dm03" />\n' +
          '  <!-- DM-04: Soft Dark polish, background icon removal and My Bookings fixes. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-comfort-polish-dm04.css?v=20261121-dm04" />\n' +
          '  <!-- DM-05: Compact signed-in Customer mobile menu, touch-friendly Theme row. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-mobile-nav-dm05.css?v=20261121-dm05" />\n' +
          '  <!-- DM-06: Last dark-only AI concierge palette; keep Light Mode untouched. -->\n' +
          '  <link rel="stylesheet" href="../customerCSS/customer-ai-dark-polish-dm06.css?v=20261121-dm06" />\n' +
          '  <!-- DM-07: one compact, unified Customer AI concierge skin (must load last). -->\n' +
          '  <link rel="stylesheet" href="../sharedCSS/ai-concierge-dm07.css?v=20261121-dm08" />\n' +
          '</head>\n' +
          '\n' +
          '  <body class="customer-manager-tone">\n' +
          '    <!-- ======================================================\n' +
          '       CUSTOMER NAVBAR\n' +
          '       Same Resort Map navbar style on all customer pages.\n' +
          '    ======================================================= -->\n' +
          '    <header class="navbar">\n' +
          '      <!-- UI-30: Tappable Customer brand link; booking/payment routes retain exit confirmation. -->\n' +
          '      <a class="logo" href="index.html" aria-label="Arvic Seaside — Customer Home">Arvic Seaside</a>\n' +
          '\n' +
          '      <button id="menuToggle" class="menu-toggle" type="button" aria-controls="mobileNav" aria-expanded="false">☰</button>\n' +
          '\n' +
          '      <nav id="mobileNav">\n' +
          '        <a href="index.html" class="active-nav">Home</a>\n' +
          '        <a href="rooms.html">Accommodations</a>\n' +
          '        <a href="resort-map.html">Resort Map</a>\n' +
          '        <a href="my-bookings.html">My Bookings</a>\n' +
          '        <a href="profile.html">Profile</a>\n' +
          '        <a href="#" id="logoutBtn">Logout</a>\n' +
          '      </nav>\n' +
          '    </header>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       HERO SECTION\n' +
          '    ======================================================= -->\n' +
          '    <section class="hero-section">\n' +
          '      <div class="hero-inner">\n' +
          '        <div class="hero-badge">\n' +
          '          Seaside comfort • Easy online booking • AI Chatbot Assistant\n' +
          '        </div>\n' +
          '\n' +
          '        <h1>Escape to a more relaxing resort stay.</h1>\n' +
          '\n' +
          '        <p>\n' +
          '          Explore beautiful accommodations, book your preferred schedule, and\n' +
          '          manage your stay with a cleaner, smarter, and more premium guest\n' +
          '          experience.\n' +
          '        </p>\n' +
          '\n' +
          '        <div class="hero-actions">\n' +
          '          <a href="rooms.html" class="btn-primary">Browse Accommodations</a>\n' +
          '          <a href="my-bookings.html" class="btn-secondary">View My Bookings</a>\n' +
          '        </div>\n' +
          '      </div>\n' +
          '    </section>\n' +
          '\n' +
          '    <!-- ======================================================\n' +
          '       MAIN HOME CONTENT\n' +
          '    ======================================================= -->\n' +
          '    <main class="home-wrapper">\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Your resort booking, made smoother</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Arvic Seaside helps you discover accommodations faster, compare stay\n' +
          '          details clearly, and handle your reservations with less stress. From\n' +
          '          accommodation selection to booking confirmation, the whole experience\n' +
          '          feels more like a modern resort website.\n' +
          '        </p>\n' +
          '      </section>\n' +
          '\n' +
          '      <!-- ======================================================\n' +
          '         CLIENT INFORMATION SECTION\n' +
          '         Added for mock defense and customer contact visibility.\n' +
          '      ======================================================= -->\n' +
          '      <section class="welcome-box">\n' +
          '        <h2>Arvic Seaside Beach Resort and Hotel</h2>\n' +
          '\n' +
          '        <p>\n' +
          '          Visit Arvic Seaside Beach Resort and Hotel at\n' +
          '          <strong>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</strong\n' +
          '          >. The resort is open <strong>24 hours from Monday to Sunday</strong>.\n' +
          '        </p>\n' +
          '\n' +
          '        <section class="home-grid" style="margin-top: 18px">\n' +
          '          <div class="home-card location-map-card">\n' +
          '            <iframe\n' +
          '              class="location-map-bg"\n' +
          '              src="https://www.google.com/maps?q=17%20Mahogany%20Street%2C%20Brgy.%20Bagong%20Karsada%2C%20Naic%2C%20Cavite&output=embed"\n' +
          '              loading="lazy"\n' +
          '              referrerpolicy="no-referrer-when-downgrade"\n' +
          '            ></iframe>\n' +
          '\n' +
          '            <div class="location-map-overlay"></div>\n' +
          '\n' +
          '            <div class="location-map-content">\n' +
          '              <h2>Location</h2>\n' +
          '\n' +
          '              <p>17 Mahogany Street, Brgy. Bagong Karsada, Naic, Cavite</p>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.google.com/maps/place/Arvic+SeaSide+Beach+Resort/@14.3208998,120.7354653,15z/data=!4m9!3m8!1s0x3396282de7cc3e97:0x92a1cbde8ed5d9f0!5m2!4m1!1i2!8m2!3d14.321746!4d120.7526246!16s%2Fg%2F1tmph13z?entry=ttu&g_ep=EgoyMDI2MDYwMy4xIKXMDSoASAFQAw%3D%3D"\n' +
          '                class="btn-primary"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                Open Location\n' +
          '              </a>\n' +
          '            </div>\n' +
          '          </div>\n' +
          '          <!-- ======================================================\n' +
          '         CONTACT DETAILS CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card contact-card">\n' +
          '            <h2>Contact Details</h2>\n' +
          '\n' +
          '            <div class="contact-links-box">\n' +
          '              <a href="tel:09569125625" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0956-912-5625</strong>\n' +
          '                  <small>Tap to call front desk</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a href="tel:09678170662" class="contact-link-card">\n' +
          '                <span class="contact-icon">☎</span>\n' +
          '                <span>\n' +
          '                  <strong>0967-817-0662</strong>\n' +
          '                  <small>Alternative contact number</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="mailto:resortarvicseaside@gmail.com"\n' +
          '                class="contact-link-card email-contact-card"\n' +
          '              >\n' +
          '                <span class="contact-icon">✉</span>\n' +
          '                <span>\n' +
          '                  <strong>resortarvicseaside@gmail.com</strong>\n' +
          '                  <small>Email the resort for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="contact-note">\n' +
          '              Always open • Monday to Sunday • 24 hours\n' +
          '            </div>\n' +
          '          </div>\n' +
          '\n' +
          '          <!-- ======================================================\n' +
          '         SOCIAL MEDIA CARD\n' +
          '      ======================================================= -->\n' +
          '          <div class="home-card social-card">\n' +
          '            <h2>Social Media</h2>\n' +
          '\n' +
          '            <p>\n' +
          '              Follow or message the resort through its official social media\n' +
          '              pages for inquiries, updates, and announcements.\n' +
          '            </p>\n' +
          '\n' +
          '            <div class="social-links-box">\n' +
          '              <a\n' +
          '                href="https://www.facebook.com/share/1E1kZLtrV4/?mibextid=wwXIfr"\n' +
          '                class="social-link-card facebook-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">f</span>\n' +
          '                <span>\n' +
          '                  <strong>Facebook Page</strong>\n' +
          '                  <small>Message us for inquiries</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '\n' +
          '              <a\n' +
          '                href="https://www.tiktok.com/@arvicseaside?_r=1&_t=ZS-9780VTxjMxB"\n' +
          '                class="social-link-card tiktok-card"\n' +
          '                target="_blank"\n' +
          '                rel="noopener noreferrer"\n' +
          '              >\n' +
          '                <span class="social-icon">♪</span>\n' +
          '                <span>\n' +
          '                  <strong>TikTok</strong>\n' +
          '                  <small>View resort clips and updates</small>\n' +
          '                </span>\n' +
          '              </a>\n' +
          '            </div>\n' +
          '\n' +
          '            <div class="social-note">\n' +
          '              Official social media links of Arvic Seaside Beach Resort and\n' +
          '              Hotel.\n' +
          '            </div>\n' +
          '          </div>\n' +
          '        </section>\n' +
          '      </section>\n' +
          '\n' +
          '      <section class="home-grid">\n' +
          '        <div class="home-card">\n' +
          '          <h2>Browse Accommodations</h2>\n' +
          '\n' +
          '          <p>\n' +
          '            Explore available rooms, cotta'... 4694 more characters
        
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
