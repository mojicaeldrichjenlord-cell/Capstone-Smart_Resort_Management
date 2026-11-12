# Cross-browser Microsoft Blessica voice

The existing Taglish/Filipino mode prefers **fil-PH-BlessicaNeural**.
Azure Speech returns MP3 from the Node backend. Chrome and Edge can play
this audio regardless of which voices are installed in the browser.

## Required setup (no credentials in GitHub)

1. Create an Azure **Speech** resource and note its **region** and **key**.
2. Add these to **backend/.env** for local tests, and as secret Environment
   variables in **Render** for deployed use:

   ```text
   AZURE_SPEECH_REGION=your-resource-region
   AZURE_SPEECH_KEY=your-resource-secret-key
   ```

3. Restart the backend. Test `GET /api/ai/voice/status` (enabled: true).
4. Log in as a customer, select **Taglish / Filipino**, then click
   **Read Aloud** or **Start Conversation**.

**Never put Azure keys in frontend code, Vercel variables, screenshots or
GitHub commits.** Azure Speech can incur charges; enable Azure spending
alerts and usage budgets before deployment.

When credentials are absent, unavailable, or a user lacks a signed customer
token, the frontend uses browser speech instead. The system must not claim
this fallback is Microsoft Blessica unless the browser actually provides it.

## File purposes

- `backend/controllers/ai/azureSpeechController.js` — authenticates via
  the route, bounds request size and usage, calls the Microsoft Speech REST
  service and streams back MP3 without retaining it.
- `backend/routes/aiRoutes.js` — registers public availability status and
  the customer-authenticated voice endpoint.
- `frontend/js/ai-voice.js` — requests MP3 for Taglish and manages playback,
  interruption and browser fallback.
- `frontend/js/ai-chat.js` — uses the existing shared API URL for local/Render.

## Limitations

Azure is not configured by source code alone. Browser audio autoplay policies
may require a prior user interaction. The backend uses an in-memory per-user
quota (10 requests/minute; 100 requests/day), which resets upon restart and
is per instance, not a global quota. For publicly scaled production usage,
enforce account-level quotas in persistent storage.
