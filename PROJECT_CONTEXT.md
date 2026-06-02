# Smart Resort Booking System Context

Project: Smart Resort Booking System  
Client: Arvic Seaside Beach Resort and Hotel  
Stack:
- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MySQL / XAMPP
- AI Assistant: Gemini planned, Claude/ChatGPT used for coding help

Main folders:
- backend/controllers
- backend/routes
- backend/uploads
- database/smart_resort.sql
- frontend/adminHTML
- frontend/adminJS
- frontend/adminCSS
- frontend/customerHTML
- frontend/customerJS
- frontend/customerCSS
- frontend/sharedCSS
- frontend/sharedJS
- frontend/images

Important system rules:
- Customer can reserve online.
- Admin can create manual/walk-in reservation.
- Admin manually approves payment proof.
- Downpayment is 50% of accommodation price only.
- Entrance fee is estimated only and paid onsite.
- Remaining balance is paid onsite.
- Capacity is shown but not hard-limited.
- Guest Inside resets daily but reports must keep history.
- Rooms use 22 hours.
- Pavilion/function areas use 23 hours.
- Morning and evening pricing are separate.
- Discounts like Senior/PWD/Kids are handled at front desk.
- Admin receipt printing is important.
- Customer booking receipt/download is important.
- Reports must show bookings, revenue, occupancy/customer count.
- Admin map editor exists.
- Customer map is view-only.
- Accommodation gallery exists.
- Future: online payment integration and better AI assistant.

Assistant rules:
- Give whole-file replacements when possible.
- Do not remove working features.
- Explain before editing.
- Mention if backend restart is needed.
- Be critical and point out weak logic.
- Prioritize functional system over fancy design.