# Pitfalls Research

**Domain:** Audio-to-knowledge-graph learning app (Next.js, browser recording, real-time transcription, LLM extraction, 2D graph visualization, Supabase)
**Researched:** 2026-03-10
**Confidence:** HIGH (browser audio, Vercel limits, Supabase), MEDIUM (graph performance, concept extraction quality), MEDIUM (WebGL/shader mobile)

---

## Critical Pitfalls

### Pitfall 1: MediaRecorder Format Incompatibility Breaks Transcription

**What goes wrong:**
The browser records audio in whichever codec it supports — Chrome produces WebM/Opus, Firefox produces WebM/Opus, Safari produces MP4/AAC. If the backend hardcodes an expected format (e.g. WAV or MP3) and passes it directly to a transcription API, the API rejects the audio with encoding errors. This failure is silent in development if you only test on Chrome.

**Why it happens:**
Developers test on one browser, assume a format, and ship. Safari's MediaRecorder implementation is a late addition (WebKit blog 2020) with a more constrained codec list. iOS adds further limits: backgrounding kills streams, autoplay policies interfere, and container options are narrower than desktop.

**How to avoid:**
- Call `MediaRecorder.isTypeSupported()` at runtime and select from a priority list: `['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/mp4']`
- Accept all formats on the backend — do not hardcode `audio/webm`
- Before sending to transcription, pass audio through `ffmpeg` (server-side) or use a provider that accepts multiple formats
- Never assume MIME type from file extension — read it from the recorded blob's `type` property

**Warning signs:**
- Transcription works in Chrome dev but silently fails from Safari/iOS
- Error messages from transcription API mentioning "unsupported encoding" or "invalid audio"
- Empty transcripts returned with no error

**Phase to address:** Phase 4 (Live Recording Pipeline) — implement format detection before first chunk upload

---

### Pitfall 2: Vercel Serverless Timeout Kills Audio Processing

**What goes wrong:**
The Hobby tier on Vercel has a 10-second function timeout. Audio transcription — especially for 30-second or 1-minute chunks — takes 3–15 seconds depending on provider and chunk size. On the Pro tier the default is 60 seconds, but a 5-minute lecture will produce multiple slow sequential chunks, and a single slow API response kills the whole pipeline.

**Why it happens:**
Next.js route handlers on Vercel are serverless functions. They cannot run longer than `maxDuration`. Long-running audio processing in a synchronous route handler hits this wall immediately.

**How to avoid:**
- Set `export const maxDuration = 60` on all audio processing route handlers (requires Pro tier)
- For chunks that may exceed 60 seconds (long audio or slow providers), use Vercel Fluid Compute with `waitUntil` to continue processing after sending a response
- Consider decoupling transcription from the HTTP request cycle: accept the chunk, persist to Supabase Storage, return immediately, trigger processing asynchronously via Supabase Edge Functions or a queue
- Never process audio synchronously in a serverless function unless chunk size is tightly controlled (under 10 seconds of audio on Hobby, under 45 seconds on Pro to leave headroom)

**Warning signs:**
- 504 Gateway Timeout errors on the recording page
- Transcription appears then freezes at a certain point
- Partial transcript followed by silence

**Phase to address:** Phase 4 (Live Recording Pipeline) — architecture decision about sync vs. async transcription made before first implementation

---

### Pitfall 3: Duplicate and Garbage Nodes Pollute the Galaxy

**What goes wrong:**
LLM concept extraction processes each transcript chunk independently. The same concept appears in different chunks with different surface forms: "Newton's First Law", "first law of motion", "law of inertia", "Newton 1st law". Each generates a new node. After a 1-hour lecture the graph has 300+ nodes, 40% of which are duplicates or noise (filler phrases extracted as concepts, generic words like "example", "basically", "the professor said").

**Why it happens:**
LLMs extract what they see in the local context window without knowledge of the existing graph. Without a merge/dedup step, every extraction call produces raw additions. This is documented as the top production failure mode in knowledge graph construction (Neo4j, KGGen, 2025 research).

**How to avoid:**
- Before creating a node, normalize the label (lowercase, strip stop words, stem/lemmatize)
- Query existing nodes for semantic similarity using pgvector cosine similarity (threshold ~0.92)
- If similarity exceeds threshold, reinforce the existing node instead of creating a new one
- Use a structured extraction prompt that outputs a confidence score and node type — reject nodes below confidence threshold
- Explicitly filter filler concepts: define a blocklist of generic phrases ("example", "basically", "this is", "for instance")
- Add a post-processing step that clusters nodes with >0.85 similarity and presents merged candidates

**Warning signs:**
- Galaxy fills up fast with many single-connection nodes
- Multiple nodes with very similar labels visible on graph
- Nodes like "the concept", "basically this", "professor mentioned" appearing

**Phase to address:** Phase 5 (Knowledge Extraction + Graph Update Engine) — dedup logic must be designed before any real data is processed; Phase 2 should add pgvector extension to schema

---

### Pitfall 4: Force-Directed Graph Layout Thrashes on Every Update

**What goes wrong:**
The graph receives new nodes and edges every 10–30 seconds during recording. Each time the dataset updates, the force-directed simulation restarts, causing all existing nodes to rearrange. The user is watching a "galaxy" that constantly reshuffles — nodes they were inspecting fly off to new positions, clusters dissolve and reform. This is deeply disorienting and breaks usability.

**Why it happens:**
Most React graph libraries (d3-force, react-force-graph) restart or reheat the simulation when new nodes are added to the dataset prop. If the component re-renders with a new data object reference, the entire layout is thrown away.

**How to avoid:**
- Use a canvas-based library (react-force-graph, force-graph by vasturiano) rather than SVG — canvas handles 500+ nodes smoothly
- Store simulation state outside React's render cycle — use `useRef` not `useState` for the simulation instance
- When adding new nodes, add them to the existing simulation object directly (do not pass a new data object prop) — new nodes spawn near their connected neighbors, not at origin
- Configure `alphaDecay` and `velocityDecay` to calm the simulation fast after initial layout
- On live update, freeze existing node positions (`node.fx`, `node.fy`) before inserting new nodes, then release frozen positions gradually
- Pre-warm the layout in `useEffect` before first render to avoid the "big bang" start

**Warning signs:**
- Every new transcript chunk causes visible graph reshuffling
- Nodes jitter or bounce after stabilization
- React DevTools shows the graph component re-mounting on data updates

**Phase to address:** Phase 3 (Galaxy Home) and Phase 4 (Live Recording Pipeline) — architecture for mutable simulation state must be decided in Phase 3 before the live-update path is built in Phase 4

---

### Pitfall 5: WebSocket / Real-Time Not Supported in Vercel Serverless

**What goes wrong:**
Next.js App Router route handlers deployed on Vercel are serverless functions. They cannot maintain persistent WebSocket connections. Attempts to use `socket.io` or native WebSocket upgrade in route handlers fail silently or produce cryptic 502 errors. The entire real-time pipeline (live transcript updates, live graph updates, live prompt delivery) is blocked if this is not addressed.

**Why it happens:**
Serverless functions are stateless, short-lived, and do not support the "Upgrade" HTTP header required for WebSocket handshakes. Vercel explicitly closes upgrade requests that match API routes. Next.js 14+ removed the `res.socket.server` pattern that made socket.io work in Pages Router.

**How to avoid:**
- Use Supabase Realtime (Broadcast + Postgres Changes) as the real-time transport instead of raw WebSockets — it is designed for this architecture and is already part of the stack
- For live transcript delivery: write chunks to Supabase as they are processed, subscribe client-side to `transcript_chunks` table changes
- For live graph updates: write new nodes/edges to Supabase, subscribe client-side to `knowledge_nodes` and `knowledge_edges` tables
- For live prompts: write to `live_prompts` table, subscribe client-side
- This sidesteps WebSocket entirely — all real-time is event-driven through the database
- Never attempt WebSocket upgrade in Next.js route handlers on Vercel

**Warning signs:**
- 502 or connection closed errors when testing real-time features on Vercel preview
- Works locally with `next dev` but breaks on Vercel deploy
- Console errors mentioning "connection refused" or "upgrade failed"

**Phase to address:** Phase 4 (Live Recording Pipeline) — real-time architecture decision must be explicit before implementation; document the Supabase Realtime approach as the intended path

---

### Pitfall 6: Supabase Realtime postgres_changes Bottleneck on Rapid Inserts

**What goes wrong:**
During transcription, new `transcript_chunks`, `knowledge_nodes`, and `knowledge_edges` rows are inserted rapidly (every few seconds). If the client subscribes to `postgres_changes` on all these tables simultaneously, Supabase processes each change event through a single-threaded authorization check. Under rapid inserts this creates a queue backlog and changes arrive delayed or out of order.

**Why it happens:**
`postgres_changes` is designed for moderate update rates. Each change event triggers an RLS check for each subscriber. For a single-user app with no RLS there is less overhead, but the single-threaded processor still bottlenecks under sustained rapid inserts. Supabase's own documentation warns that compute upgrades do not improve this bottleneck.

**How to avoid:**
- Disable RLS on tables that only need real-time updates for performance (single-user app has no security downside here — no other users can access the data)
- Use Supabase Broadcast channel for high-frequency transient updates (live transcript text, typing indicators) — Broadcast does not go through the database at all
- Use `postgres_changes` only for durable state updates (new nodes confirmed, recording session status change) — these are infrequent
- Batch inserts: instead of inserting each transcript word as it arrives, buffer for 3–5 seconds and insert a chunk row once
- Set `filter` on subscriptions to limit change events to only the current session ID

**Warning signs:**
- Realtime updates arrive in bursts rather than steadily
- Supabase dashboard shows "Realtime Concurrent Peak Connections" quota warnings
- Client falls behind — transcript display lags several seconds behind actual recording

**Phase to address:** Phase 2 (Database + Data Model) — decide subscription strategy per table; Phase 4 (Live Recording Pipeline) — implement buffered chunk inserts

---

### Pitfall 7: Transcription Provider Lock-In Baked Into Components

**What goes wrong:**
The transcription call gets embedded directly in the API route: `const { text } = await openai.audio.transcriptions.create(...)`. Six weeks later you want to switch to Deepgram for lower latency or AssemblyAI for speaker detection. Every component that touches transcription must be rewritten, breaking tests and requiring re-testing the entire pipeline.

**Why it happens:**
Under time pressure developers wire up the path of least resistance — direct SDK calls. The MASTER_PLAN.md specifies "AI providers behind interfaces" but this is only enforced if the interface is built first.

**How to avoid:**
- Define a `TranscriptionProvider` interface before writing any transcription code:
  ```typescript
  interface TranscriptionProvider {
    transcribe(audioBlob: Blob, mimeType: string): Promise<TranscriptionResult>
  }
  ```
- Create a `MockTranscriptionProvider` that returns realistic fake data — use this during Phase 4 to build the full pipeline without needing a real API key
- Create `OpenAITranscriptionProvider` implementing the same interface
- Instantiate providers via a factory function that reads from environment variables
- Same pattern for `ConceptExtractionProvider` and `HintProvider`

**Warning signs:**
- Transcription provider name (`openai`, `deepgram`, etc.) appears directly in route handler code
- Changing provider requires touching more than one file
- No mock mode exists for offline development

**Phase to address:** Phase 4 (Live Recording Pipeline) — interface must be defined before any concrete provider is used

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Direct `openai.audio.transcriptions.create()` in route handler | Fast to wire up | Full rewrite when switching providers; no mock mode | Never — always behind an interface |
| SVG rendering for graph (not canvas) | Easier to style with CSS | Breaks at ~100 nodes; 60fps impossible | Only acceptable for static graphs under 50 nodes |
| Insert one row per extracted concept immediately | Simpler code | Rapid-fire Supabase inserts trigger realtime bottleneck | Never during active recording |
| Re-running force simulation from scratch on data update | Correct positions | Galaxy reshuffles on every chunk; destroys UX | Never — always add nodes to existing simulation |
| Storing raw audio blobs in Supabase DB column | Simple to implement | Postgres column size limits; extremely slow queries | Never — use Supabase Storage for binary audio |
| Hardcoding similarity threshold for node dedup (0.9) | Fast to ship | Wrong threshold = garbage nodes or over-merging; needs tuning data | Acceptable in Phase 5 if configurable via env var |
| Skip VAD (Voice Activity Detection) — always transcribe | No extra dependency | Transcribes silence, blank chunks, costs money on silence | Only acceptable if provider is free-tier / mock |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| OpenAI Whisper / GPT-4o Audio | Passing `audio/webm` directly without declaring MIME type | Always pass the `file` param with an explicit filename extension that matches the actual codec |
| Supabase Realtime | Creating new subscription on every React re-render | Create subscription once in `useEffect` with empty dep array; clean up in return function |
| Supabase Realtime | Subscribing to all tables simultaneously | Filter by `session_id` using the `filter` param to scope events to the current recording |
| Supabase Storage | Uploading audio chunks as separate files then forgetting to clean up | Implement a cleanup job or TTL policy — audio blobs from 3 months ago are not needed |
| pgvector cosine similarity | Using `<->` (L2 distance) when you want semantic similarity | Use `<=>` (cosine distance) for text embeddings; L2 distance gives wrong results for normalized embeddings |
| Vercel env vars | Hardcoding API keys in `.env.local` and accidentally committing | Use `.env.local` (gitignored) and Vercel MCP to push to Vercel dashboard; never `.env` (not gitignored) |
| Next.js App Router | Using `useEffect` to fetch data that should be a Server Component | Only make components Client Components when they need browser APIs (audio, realtime) |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| SVG graph with 200+ nodes | Graph renders at 5fps; browser tab hangs | Use canvas-based rendering (react-force-graph with canvas) from the start | At ~80-100 SVG nodes on mid-range hardware |
| Re-rendering graph component on every Supabase realtime event | Galaxy flickers or reshuffles every few seconds | Update simulation data directly, never re-mount graph component | At the first live recording session |
| Generating embeddings for every concept in real time | 200ms+ latency per extraction, pipeline backs up | Batch embed after chunk processing completes; use lightweight model for sync path | With more than 2 concepts per chunk |
| Fetching entire `knowledge_nodes` table on Galaxy Home load | 2-3 second initial load at 500+ nodes | Paginate + use spatial/cluster-based loading; load neighbors on demand | At ~300 nodes |
| Requesting microphone permissions inside a click handler without HTTPS | Permissions silently fail in production | Always serve over HTTPS; request permissions proactively, not lazily | First production test on any non-localhost domain |
| Creating a new Supabase client instance per API route call | Connection pool exhaustion; 500 errors under load | Use a singleton Supabase client initialized once at module level | At moderate usage (10+ API calls per minute) |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Rendering LLM-extracted concept labels directly as HTML | XSS if a concept label contains `<script>` (unlikely but possible) | Always render as text content, not `dangerouslySetInnerHTML`; sanitize all LLM outputs |
| Rendering LLM-generated hint text as HTML | XSS via prompt injection from lecture content | Sanitize with DOMPurify before any HTML rendering; prefer plain text |
| Passing user-controlled `node_id` from URL params directly into SQL | SQL injection / data leakage | Always use Supabase's parameterized query API, never string-concatenate IDs |
| Storing API keys (OpenAI, Deepgram) in client-side code or `NEXT_PUBLIC_` env vars | Key exposed in browser bundle | All AI provider keys in server-only env vars; never prefix with `NEXT_PUBLIC_` |
| No rate limit on transcription endpoint | Runaway cost if endpoint is called rapidly or by a script | Add request deduplication; check that a session is actively recording before accepting chunks |
| Audio file paths in predictable Supabase Storage locations | Anyone who knows the URL can access audio | Use Supabase Storage private buckets; generate signed URLs for playback |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Galaxy reshuffles visually every time a new node arrives | Disorienting; user loses their place | Freeze existing node positions; animate new nodes in from their first-connected neighbor |
| Live active-learning prompt interrupts mid-sentence transcription | User misses content while answering | Show prompt as a non-blocking overlay or side card; do not pause recording |
| Alien Hint reveals too much on first request | Defeats the learning purpose | Level 1 hint must be verifiably cryptic — add a rubric to the prompt: "Do not reveal the answer or any defining characteristic directly" |
| Post-recording quiz generated instantly, user not ready | Quiz feels like ambush | Show "Recording complete — review transcript for 30 seconds, then start quiz" interstitial |
| Too many weak nodes highlighted simultaneously | Galaxy looks like a sea of red/warning indicators | Highlight max 5 weakest nodes at a time; batch "tour my weak spots" |
| Shader effects cause frame drops during recording (liquid glass + shader on recording page) | User misses recording controls; mistrust in app reliability | Per MASTER_PLAN.md: adaptive visual intensity — toned-down visuals on Recording page, full effects only on Galaxy Home |
| Graph search returns phonetic near-matches instead of semantic matches | User searches "photosynthesis" and gets "photoelectric" | Use pgvector semantic search for node lookup, not fuzzy string matching |

---

## "Looks Done But Isn't" Checklist

- [ ] **Browser audio recording:** MIME type detection via `isTypeSupported()` — verify it works from Safari and Firefox, not just Chrome
- [ ] **Transcription pipeline:** Mock provider works without any API key configured — verify the app is usable in offline/mock mode for development
- [ ] **Node deduplication:** "Newton's First Law" and "first law of motion" produce one node — add this as an explicit test case in Phase 5
- [ ] **Graph live update:** Adding a new node during a "live recording" session does not restart the layout simulation — verify by watching node positions during a 2-minute mock session
- [ ] **Vercel deployment:** Route handlers processing audio have `export const maxDuration` set — verify this is present before any Vercel deploy
- [ ] **Alien Hint Level 1:** Does NOT reveal the answer — verify with a test prompt where the answer is obvious, confirm the hint is cryptic
- [ ] **Supabase Realtime cleanup:** Subscription is removed when the recording component unmounts — verify with React DevTools or by navigating away mid-recording
- [ ] **Audio storage cleanup:** Audio blobs are not accumulating indefinitely in Supabase Storage — verify a cleanup path exists after processing
- [ ] **Shader/WebGL fallback:** App is fully functional if WebGL is unavailable or GPU is blacklisted — verify in Chrome with `--disable-webgl` flag
- [ ] **Transcript cross-linking:** Clicking a node highlights transcript chunks AND clicking a chunk highlights nodes — both directions work independently

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| MediaRecorder format incompatibility (discovered post-launch) | MEDIUM | Add server-side ffmpeg conversion layer; update MIME type detection client-side; re-test on Safari |
| Duplicate node pollution (discovered after 10+ sessions) | HIGH | Write a migration script to cluster and merge similar nodes; add embedding-based dedup retroactively; requires manual review of ambiguous merges |
| Force simulation thrashing (discovered in Phase 3) | LOW | Switch to canvas renderer; add `useRef` for simulation; add `fx`/`fy` pinning — isolated change |
| Vercel timeout failures (discovered on first deploy) | MEDIUM | Enable Fluid Compute; or restructure to async: accept-and-queue pattern; adds infrastructure complexity |
| Provider lock-in (discovered when wanting to switch) | HIGH | Requires extracting all provider calls behind interface, writing adapter layer, re-testing full pipeline |
| Realtime bottleneck (discovered during 60-minute recording test) | MEDIUM | Disable RLS on hot tables; switch high-frequency updates to Broadcast; implement chunk batching |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| MediaRecorder format incompatibility | Phase 4 | Test recording from Safari and Firefox; transcription succeeds |
| Vercel serverless timeout | Phase 4 | Set `maxDuration`; deploy to Vercel preview and process a 60-second audio chunk |
| Duplicate/garbage nodes | Phase 5 | Test: "Newton's First Law" + "first law of motion" → 1 node; "basically" → no node |
| Graph layout thrashing on live update | Phase 3 + Phase 4 | Add 5 nodes one at a time during mock recording; existing node positions do not move |
| WebSocket not supported on Vercel | Phase 4 | Document Supabase Realtime as the only transport; no WebSocket code in route handlers |
| Supabase Realtime bottleneck | Phase 2 + Phase 4 | Disable RLS on realtime tables; batch inserts; measure delay during rapid-insert test |
| Provider lock-in | Phase 4 | `TranscriptionProvider` interface exists and a `MockTranscriptionProvider` works without API keys |
| XSS via LLM output | Phase 5, Phase 7 | Render all LLM text as plain text; no `dangerouslySetInnerHTML` in hint or concept components |
| API key exposure | Phase 1 | No `NEXT_PUBLIC_AI_*` env vars; all provider calls in server-only route handlers |
| Shader performance on low-end devices | Phase 3 + Phase 11 | Test with CPU throttle in Chrome DevTools; Galaxy Home remains usable at 4x slowdown |

---

## Sources

- [MediaRecorder API iPhone Safari support — Build With Matija](https://www.buildwithmatija.com/blog/iphone-safari-mediarecorder-audio-recording-transcription)
- [MediaRecorder API — WebKit Blog](https://webkit.org/blog/11353/mediarecorder-api/)
- [Dealing With Huge MediaRecorder Chunks — AddPipe](https://blog.addpipe.com/dealing-with-huge-mediarecorder-slices/)
- [Why Enterprises Moving to Streaming and Why Whisper Can't Keep Up — Deepgram](https://deepgram.com/learn/why-enterprises-are-moving-to-streaming-and-why-whisper-can-t-keep-up)
- [Whisper Streaming GitHub (ufal)](https://github.com/ufal/whisper_streaming)
- [From LLMs to Knowledge Graphs: Building Production-Ready Graph Systems in 2025 — Medium](https://medium.com/@claudiubranzan/from-llms-to-knowledge-graphs-building-production-ready-graph-systems-in-2025-2b4aff1ec99a)
- [KGGen: Extracting Knowledge Graphs from Plain Text with LLMs — arXiv 2502.09956](https://arxiv.org/html/2502.09956v1)
- [Neo4j LLM Knowledge Graph Builder](https://neo4j.com/labs/genai-ecosystem/llm-graph-builder/)
- [react-force-graph — vasturiano](https://github.com/vasturiano/react-force-graph)
- [force-graph canvas — vasturiano](https://github.com/vasturiano/force-graph)
- [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits)
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs)
- [Supabase Realtime postgres_changes bottleneck — GitHub Discussion](https://github.com/orgs/supabase/discussions/7193)
- [Next.js WebSocket limitations on Vercel — GitHub Discussion #58698](https://github.com/vercel/next.js/discussions/58698)
- [Vercel Serverless Timeout — Vercel KB](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out)
- [Solving Vercel's 10-Second Limit with QStash — Medium](https://medium.com/@kolbysisk/case-study-solving-vercels-10-second-limit-with-qstash-2bceeb35d29b)
- [WebGL Best Practices — MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
- [WebGL in Mobile Development: Challenges and Solutions — PixelFree Studio](https://blog.pixelfreestudio.com/webgl-in-mobile-development-challenges-and-solutions/)
- [Supabase pgvector embeddings](https://supabase.com/docs/guides/database/extensions/pgvector)
- [Real-time Audio Transcription with Next.js — Medium](https://medium.com/@shanur.cse.nitap/you-cant-handle-real-time-voice-transcription-with-next-js-can-you-80221aa5595e)
- [React + D3.js Balancing Performance — Medium](https://medium.com/@tibotiber/react-d3-js-balancing-performance-developer-experience-4da35f912484)

---
*Pitfalls research for: audio-to-knowledge-graph learning app (Galaxy of Knowledge)*
*Researched: 2026-03-10*
