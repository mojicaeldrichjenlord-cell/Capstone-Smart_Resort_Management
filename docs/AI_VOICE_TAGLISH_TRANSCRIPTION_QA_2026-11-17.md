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