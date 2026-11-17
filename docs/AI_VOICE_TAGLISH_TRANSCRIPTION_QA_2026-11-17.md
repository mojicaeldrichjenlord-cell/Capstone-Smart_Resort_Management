# Stage AI-VOICE-18 — Taglish speech transcription corrections

## Observed bug (Microsoft Edge / Taglish, Nov 17 2026)
- User spoke about Pool Shade and asked if AI had an accommodation preview.
- Edge browser STT returned phrases like 'Anong mga full shade meron kayo?' and 'May premyo ka ba?'. The assistant treated 'premyo' literally and gave an irrelevant answer.
- Browser speech recognition input is separate from Microsoft Blessica text-to-speech output; changing the output voice does not change speech recognition accuracy.

## Scope and implemented fix (testing branch only)
- `frontend/js/ai-voice.js`: three browser recognition alternatives, with conservative preference for Pool Shade/preview alternatives only when confidence is close and context supports them.
- Context-aware Taglish/English transcription repair: full shade -> Pool Shade for accommodation discovery, premyo -> preview only for a preview-style question in a recent accommodation discussion. Real prize/raffle questions and non-Taglish languages are preserved.
- Applies to native browser speech and existing recorded-audio fallback. Dictation remains editable and does not autosend; live conversation sends corrected text to the existing guarded AI chat API.
- `backend/controllers/ai/geminiSpeechController.js`: allowlisted UI language hint and resort vocabulary for the EXISTING single Gemini transcription request in recorded-audio fallback. Audio stays signed, bounded, rate-limited, and non-persisted. No extra Gemini calls are added.
- Customer Home/Accommodations load `ai-voice.js?v=20261117-sttqa1` so browsers use the new asset after a future approved deployment.
- No DB schema/data changes, real bookings, payments, Azure settings, Gemini model changes, or production domain deployment.

## Automated checks
- 35/35 AI voice unit cases and 5/5 recorded STT unit cases executed in a synthetic V8 harness with mocked browser/Node dependencies; **not a real Node test run nor a microphone test**.
- All changed JS source files passed syntax checks.

## Owner localhost QA
1. From project root: `git status --short`, `git branch --show-current`, `git pull --ff-only origin testing` (when working tree clean).
2. In `backend`: `node --test tests/ai-voice-assistant.test.js tests/ai-speech-transcription.test.js tests/ai-verified-preview.test.js`.
3. Restart backend after pull. Customer Home: Ctrl+Shift+R. Select Voice options > Taglish / Filipino > Start Conversation, allow microphone in Edge.
4. Say naturally **'Anong mga pool shade meron kayo?'**. Inspect the user bubble; it must display `pool shade`, not `full shade`. Cards must be Pool Shade only (if listed as available); Nipa Huts must not appear.
5. In the SAME conversation, say **'May preview ka ba?'**. The user bubble should contain `preview`, not `premyo`, and show Pool Shade cards. It must not introduce itself again.
6. End conversation. Test dictation mic: say 'May preview ka ba ng Family Room B?' and verify transcript is editable and is not sent without clicking Send.
7. Try a genuine prize question with **'raffle premyo'** and verify it is not silently converted to preview.
8. Check English voice, voice interruption, new chat, plus Safari/iPhone recorded-input mode where available. Report unexpected phrases and browser Console. Do not record guest identities.

## Acceptance and remaining limitations
- Word recognition cannot be guaranteed 100%: microphone quality, ambient noise, the STT service and browser decide initial hypotheses. Only certain resort vocabulary confusions are safely corrected.
- Actual microphone/dry-run verification is pending. Do not merge or deploy until owner approves after browser QA.
## Stage AI-VOICE-18B — General-purpose audio-first transcription (same day)

The initial exact-word repair was insufficient: it only corrected "premyo" and "full shade" in some browser Web Speech results, while leaving every other Taglish utterance dependent on the original browser recognizer.

Now **Taglish defaults to Accurate (Gemini)** when `getUserMedia` and Web Audio exist, including supported Microsoft Edge/Chrome desktops. The same existing signed, rate-limited `/api/ai/transcribe` endpoint already used for Safari/recorded speech receives one short WAV for each meaningful spoken turn. Gemini transcribes the whole audio directly; the recorded result is not force-replaced with keyword heuristics. Audio isn't saved by this application. The already-existing AI chat backend receives the transcript as before; Azure Blessica remains strictly TTS. Other languages default to fast browser recognition but can select Accurate explicitly. If the user chooses Fast (browser), the setting is persisted so they can conserve Gemini credits. The selector explains credit usage, and changing it ends a live session safely.

Additional signal handling: `autoGainControl`, `noiseSuppression`, `echoCancellation` requested where supported; voice must be sustained across at least 3 audio frames before billable transcription; silence is never uploaded; 1.6 second post-speech pause reduces premature sentence cuts; 14-second maximum stays below 500 KB raw WAV limit. Speech recognition still depends on microphone/device and the service; **no 100% accuracy guarantee**.

### Regression and QA
- **43/43 simulated voice browser regression cases PASS** in a synthetic V8 harness; this is not an actual Node or microphone execution.
- Existing synthetic recorded-Gemini transcription tests 5/5 previously passed; no new billable calls added to the endpoint.
- Customer Home and Rooms cache version now `ai-voice.js?v=20261117-accurate2`.
- No migration, SQL writes, booking/payment changes, live-domain deployment, or additional external API key.

### Programmer local browser retest
1. Verify branch `testing`, clean tree; `git pull --ff-only origin testing`. From `backend`, `node --test tests/ai-voice-assistant.test.js tests/ai-speech-transcription.test.js tests/ai-verified-preview.test.js`.
2. Restart `node server.js` and hard refresh localhost Customer Home.
3. Select **Taglish / Filipino**. Inspect new **Voice input** field: **Accurate (Gemini)** should be selected where recording is supported.
4. Start Conversation. Speak several **unseen, full-sentence** customer questions in natural Tagalog, English, and Taglish (e.g. room rates, amenities, booking schedules, reservation policies). Confirm the user bubble captures the intended meaning without fixed dictionary substitutions.
5. In same conversation ask `Anong mga Pool Shade meron kayo?`, followed by `May preview ka ba?`. Confirm only Pool Shade previews and correct interpreted transcript; not Big Nipa Hut nor a prize.
6. Test dictation mic: transcript remains editable until Send. Check quiet room vs AC/background sound. Do not send customer private information.
7. Switch **Fast (browser)**: expect browser STT, no `/api/ai/transcribe` request, and faster responses but potentially lower code-switching accuracy. Confirm input mode persists across refresh.
8. Optional: change to English or Spanish and deliberately select Accurate; verify transcript and voice language. Confirm Interrupt/End Conversation and New Chat cancel correctly.
9. If Accurate input is unavailable, note exact status, Console errors, network status of signed `/api/ai/transcribe` without sharing tokens. Real voice engine and credit usage can only be assessed with live recordings and Gemini usage reporting.

Release gate: owner-supervised localhost microphone PASS, then separately approved merge/deployment for domain tester. Tester remains report-only.
