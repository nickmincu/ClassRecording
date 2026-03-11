# Project Research Summary

**Project:** Galaxy of Knowledge — ClassRecording
**Domain:** Audio-to-knowledge-graph learning app (browser recording, real-time transcription, LLM concept extraction, 2D force graph, active learning)
**Researched:** 2026-03-10
**Confidence:** HIGH

## Executive Summary

Galaxy of Knowledge occupies a genuinely open market niche: no existing consumer tool combines live lecture transcription, automatic knowledge graph construction, and real-time retrieval practice in a single product. The closest prior art (RemNote for graphs + SRS, Otter.ai for transcription, Anki for spaced repetition) all operate in isolation. The research confirms that this combination is technically feasible today using off-the-shelf browser APIs, managed AI providers, and Supabase — and that the MASTER_PLAN's 12-phase structure follows the correct dependency order.

The recommended approach is a pipeline architecture: browser MediaRecorder chunks audio every 5 seconds, a Next.js route handler relays chunks to Deepgram for streaming transcription, a second extraction call to GPT-4o-mini pulls structured concepts and relations, and Supabase Realtime propagates graph updates back to the client without polling or raw WebSockets. All AI providers are accessed through typed interfaces so Deepgram, OpenAI, or any future provider can be swapped by changing one adapter file. The `react-force-graph-2d` canvas library handles 500+ nodes at 60fps — far beyond what SVG alternatives allow — and the galaxy aesthetic is powered by `motion` for UI transitions and React Three Fiber for the WebGL starfield on Galaxy Home only.

The two highest-stakes engineering risks are node deduplication and Vercel serverless constraints. LLM extraction on independent chunks produces duplicate and garbage nodes that permanently pollute the galaxy if not caught at insert time — this requires normalized label matching plus pgvector cosine similarity before every node creation. Vercel's 10-second default timeout will kill audio processing unless `maxDuration = 60` is set and the architecture is designed to never process audio synchronously beyond that window. Both risks have well-documented mitigations and must be addressed in their respective phases before real data flows through the system.

---

## Key Findings

### Recommended Stack

The core framework (Next.js App Router, TypeScript, Tailwind, Supabase, Vercel) is locked by the project owner and requires no evaluation. Research focused on the six variable technology decisions: graph visualization, audio recording, transcription, concept extraction, animation, and WebGL.

Every recommendation favors existing, mature solutions over custom code. `react-force-graph-2d` wraps D3-force in a React-friendly canvas component — it delivers the "living cosmos" physics behavior and custom glow/pulse rendering without reimplementing force simulation. Native `MediaRecorder` replaces third-party wrappers entirely. Deepgram Nova-3 via `@deepgram/sdk` provides sub-300ms streaming transcription latency with an official Next.js example to guide implementation. GPT-4o-mini with structured outputs handles concept extraction, quiz generation, and hint generation from a single provider. `motion` (v11, imported from `motion/react`) handles all UI transitions; React Three Fiber handles WebGL but only on Galaxy Home — no other page loads a WebGL context.

**Core technologies:**
- `react-force-graph-2d` (^1.x): 2D knowledge graph — Canvas-based, handles 500+ nodes, wraps D3-force, built-in zoom/pan/click
- Native `MediaRecorder` API: Browser audio recording — No dependency, standard chunked blob output every 5s
- `@deepgram/sdk` (^3.x): Streaming transcription — Sub-300ms latency, WebSocket-native, server-side only
- `openai` (^4.x) + `gpt-4o-mini`: Concept extraction, quiz, hints — Structured JSON outputs, $0.15/1M tokens, fast inference
- `motion` (^11.x): UI animation — Import from `motion/react` for React 19 App Router compatibility
- `@react-three/fiber` + `@react-three/drei` (^8.x / ^9.x): WebGL starfield — Galaxy Home and landing only, `ssr: false`
- `@supabase/supabase-js` + `@supabase/ssr` (^2.x / ^0.x): Database + Realtime — 12-table schema, postgres_changes subscriptions
- `zod` (^3.x): API route validation — Runtime schema enforcement on all route handlers
- `shadcn/ui` + `lucide-react`: UI primitives and icons — Used where 21st.dev Magic doesn't cover

**Critical version constraints:**
- Import `motion` from `motion/react`, NOT `framer-motion` — required for React 19 / App Router
- Pin `three` minor version — R3F breaks on unexpected Three.js minor bumps
- `react-force-graph-2d` requires `dynamic(() => ..., { ssr: false })` — Canvas cannot SSR
- `@deepgram/sdk` is server-side only — never import in client components

### Expected Features

The feature research confirms thirteen table-stakes features (without which the product feels broken) and eleven differentiators that define competitive advantage. The dependency chain is strictly hierarchical: audio recording → transcript chunks → concept extraction → knowledge graph → prompts → hints → quiz → mastery → review mode. Nothing downstream can be built before its upstream dependency exists.

**Must have (table stakes):**
- Browser audio recording (start/pause/stop) — MediaRecorder baseline every lecture-capture tool meets
- Live/rolling transcript display — Otter.ai has set the expectation; users reject post-hoc transcripts
- Knowledge graph (zoom, pan, click, 100+ nodes) — Obsidian/Roam train users to expect interactive graphs
- Post-recording quiz — Quizlet/RemNote establish this as baseline review behavior
- Session summary after recording — Any AI note-taker produces this; expected by default
- Mastery states per concept (new/seen/shaky/strong) — RemNote/Anki users expect visual cues
- Recording list, search, timestamp navigation, node detail page — Core navigation primitives

**Should have (differentiators):**
- Live knowledge graph that grows during recording — No competitor does this in real time
- Live active-learning prompts every 3–6 minutes during capture — Research-backed; no competitor offers this
- Alien Hint system (3 escalating levels grounded in transcript) — Branded, science-grounded; unique
- Automatic concept deduplication and edge reinforcement — Prevents graph pollution; productizes CLARE research
- Bidirectional transcript-to-node cross-linking — No consumer tool offers simultaneous audio+text+graph navigation
- Session graph slice (this recording vs. full galaxy) — Motivational; unique to this product
- Review Mode: "Tour my weak spots" via graph traversal — Qualitatively richer than a flashcard queue
- Galaxy visual identity: glow/pulse intensity tied to mastery score — Turns abstract data into emotional experience

**Defer to v1.x:**
- Cluster-based review, node merge suggestion UI, export to Markdown/PDF, course tags

**Defer to v2+:**
- Cross-device sync, Obsidian/Roam/Notion import, video recording, custom SRS scheduling, sharing/social

**Anti-features (explicitly out of scope):**
- 3D graph — Navigation UX collapses above 200 nodes in 3D; stick with 2D
- Auth / multi-user / collaboration — Explicit scope decision; adds OWASP attack surface with no v1 benefit
- Full Anki-style SRS queue — Creates review obligation/guilt; graph-based review is the better model

### Architecture Approach

The architecture is a single-user, local-first system with no auth. The browser layer handles audio capture and graph rendering via Supabase Realtime subscriptions. The Next.js App Router server layer provides thin route handlers that delegate entirely to `lib/` service functions — no business logic in routes. All external AI calls pass through typed provider interfaces, making the concrete implementation (OpenAI, Deepgram, mock) swappable at runtime via environment variables. Supabase serves as both the persistence layer (12-table schema with pgvector for embeddings) and the real-time transport for graph updates — eliminating the need for raw WebSockets which Vercel serverless cannot support.

**Major components:**
1. `useAudioPipeline` hook — Owns the MediaRecorder state machine; posts 5-second chunks to `/api/recording/chunk`; components stay declarative
2. `/api/recording/chunk` route handler — Accepts audio blob, calls `TranscriptionProvider`, writes transcript chunk, triggers extraction
3. `/api/extract` route handler — Calls `ExtractionProvider`, runs `lib/graph/merge.ts` (findOrCreateNode with dedup), writes nodes/edges/mentions
4. `lib/providers/` — Typed interfaces (`TranscriptionProvider`, `ExtractionProvider`, `AIProvider`) with concrete adapters (Deepgram, OpenAI) and mock adapters for dev/test
5. `lib/db/` — One file per domain table group; no raw Supabase queries in components or routes
6. `lib/graph/merge.ts` — Pure functions: normalize label → exact match → semantic similarity → create/reinforce; injectable Supabase client for testability
7. `useGraphRealtime` hook — Supabase Realtime subscription for `knowledge_nodes` and `knowledge_edges` INSERT events; drives ForceGraph2D state
8. `GalaxyGraph.tsx` — `react-force-graph-2d` wrapper; `nodeCanvasObject` callback applies glow/pulse from `lib/graph/visual.ts`; simulation stored in `useRef` to prevent layout thrash
9. Galaxy Home (`/`) — Full-screen graph + search + filters + side panels; hybrid Server (initial data) + Client (Realtime) component
10. Live Recording (`/recording`) — MediaRecorder + live transcript + mini-graph + PromptCard; all in Client Component with reduced visual intensity
11. `AlienHintButton` / `AlienHintPanel` — Reusable across Recording, Quiz, and Review surfaces; receives `sourceType`/`sourceId`/`currentLevel` as props

### Critical Pitfalls

1. **Duplicate and garbage node proliferation** — LLM extraction on each independent chunk produces near-duplicate nodes ("Newton's First Law", "first law of motion", "law of inertia" → should be one node). Fix: normalize label at insert time + pgvector cosine similarity check (threshold ~0.92) before every node creation; use Postgres `INSERT ... ON CONFLICT (canonical_label) DO UPDATE` to prevent race-condition duplicates. Must be designed in Phase 2 (pgvector extension) and enforced in Phase 5.

2. **Force-directed graph layout thrash on live update** — Each new node/edge addition restarts the physics simulation, causing all existing nodes to rearrange. Disorienting and unusable. Fix: store simulation in `useRef` not `useState`; add nodes directly to the existing simulation object; freeze existing node positions (`node.fx`, `node.fy`) before inserting new ones. Architecture decision must be made in Phase 3 before live updates are wired in Phase 4.

3. **Vercel serverless 10-second timeout on audio processing** — Audio transcription for a 30-second chunk takes 3–15 seconds. On Hobby tier, this kills every request. Fix: set `export const maxDuration = 60` on all audio route handlers (Pro tier); design the pipeline so audio blob is accepted and queued, not processed synchronously in the request cycle. Must be decided in Phase 4 before first implementation.

4. **MediaRecorder format incompatibility across browsers** — Chrome produces WebM/Opus; Safari produces MP4/AAC. Hardcoding the expected format causes silent failures on Safari/iOS. Fix: call `MediaRecorder.isTypeSupported()` at runtime from a priority list; send MIME type with every chunk; accept all formats on the backend. Phase 4 — implement format detection before first chunk upload.

5. **WebSocket not supported on Vercel serverless** — Route handlers cannot maintain persistent WebSocket connections; socket.io fails with cryptic 502 errors. Fix: Supabase Realtime is the only real-time transport for this architecture — write to Supabase tables server-side, subscribe client-side. Never attempt WebSocket upgrade in Next.js route handlers. Phase 4 — document and enforce as architectural constraint.

6. **Supabase Realtime postgres_changes bottleneck under rapid inserts** — Subscribing to all tables simultaneously under rapid-insert conditions (every 5 seconds per chunk) creates authorization queue backlog. Fix: disable RLS on hot tables (single-user, no security downside); use Supabase Broadcast for high-frequency transient updates (live transcript text); reserve `postgres_changes` for durable state inserts (confirmed nodes, session status). Phase 2 decision, Phase 4 implementation.

---

## Implications for Roadmap

The ARCHITECTURE.md build order (Phases 0–11) is confirmed as technically correct. The critical dependency chain — schema → graph rendering → audio pipeline → extraction engine — must be strictly sequential. Phases 6–10 have limited parallelism potential but are safest sequential given the Alien Hint system is shared across three surfaces and must be built once before wiring in.

### Phase 0: Repo Audit and Architecture Finalization
**Rationale:** Verify the existing repo state, install base dependencies, and commit all architectural decisions before any feature code exists.
**Delivers:** Confirmed project structure, `.env` setup, provider interface stubs, Playwright baseline
**Addresses:** Prevents provider lock-in (define `TranscriptionProvider`, `ExtractionProvider`, `AIProvider` interfaces with mock adapters now, before concrete providers are needed)
**Avoids:** Transcription lock-in pitfall — mock provider enables offline development from day one
**Research flag:** Standard patterns — skip phase research

### Phase 1: Next.js Bootstrap, Design System, Route Shells
**Rationale:** All downstream phases need a working app shell and design system to build into. 21st.dev Magic MCP outputs Tailwind + Motion components — establishing the design system now ensures generated components work without modification later.
**Delivers:** Running Next.js app with all route shells, Tailwind config, shadcn/ui init, motion installed, galaxy dark theme tokens
**Uses:** `motion` (^11.x), `shadcn/ui`, `lucide-react`, `clsx/tailwind-merge`
**Avoids:** Importing from `framer-motion` instead of `motion/react` — catch this at install time
**Research flag:** Standard patterns — skip phase research

### Phase 2: Supabase Schema, Typed Data Layer, Seed Data
**Rationale:** Graph rendering (Phase 3) needs seed data. Extraction engine (Phase 5) needs the pgvector extension and node deduplication schema. Realtime subscription strategy must be decided before any live feature is built.
**Delivers:** All 12 tables created, pgvector extension enabled, TypeScript types generated, `lib/db/` query functions, realistic seed data for graph development, RLS decisions documented
**Addresses:** Node deduplication foundation (pgvector, UNIQUE constraint on `canonical_label`), Realtime subscription strategy (which tables use postgres_changes vs. Broadcast)
**Avoids:** Realtime bottleneck pitfall — disable RLS on hot tables now; use Broadcast for transcript text
**Research flag:** Standard patterns (Supabase schema is well-documented) — skip phase research

### Phase 3: Galaxy Home — ForceGraph2D, Node Visuals, Filters, Panels
**Rationale:** The graph component is the product's central surface and its correct architecture (canvas renderer, simulation in useRef, frozen positions on update) must be proven before live-update path is wired in Phase 4. Building on seed data first removes AI dependency from the critical path.
**Delivers:** Full-screen interactive graph at `/`, node glow/pulse visual system, search, filters, side panels, WebGL starfield background (R3F, ssr:false), Supabase Realtime subscription stub
**Uses:** `react-force-graph-2d`, `@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing` (Bloom)
**Avoids:** Graph layout thrash pitfall — architecture decision made here, enforced before Phase 4 adds live updates; SVG rendering never used
**Research flag:** `react-force-graph-2d` custom canvas rendering for glow/pulse and simulation mutation patterns may benefit from phase research

### Phase 4: Live Recording Pipeline — Audio Capture, Transcription, Transcript UI
**Rationale:** This is the pipeline foundation that every downstream feature depends on. Mock transcription provider enables full pipeline development without a real API key. All critical architectural constraints (maxDuration, MIME detection, Supabase as real-time transport, no WebSockets) must be locked here.
**Delivers:** Working `/recording` page with start/pause/stop, chunked audio upload, live transcript display via Supabase Realtime, user marks, real Deepgram integration behind the `TranscriptionProvider` interface
**Uses:** Native `MediaRecorder` API, `@deepgram/sdk` (server-side adapter), Supabase Realtime (transcript_chunks subscription)
**Avoids:** MediaRecorder format incompatibility (isTypeSupported at runtime), Vercel timeout (maxDuration = 60), WebSocket attempt (Supabase Realtime only), provider lock-in (Deepgram behind interface)
**Research flag:** Deepgram WebSocket relay pattern in Next.js App Router may benefit from phase research to confirm latest SDK version behavior

### Phase 5: Concept Extraction and Graph Update Engine
**Rationale:** Depends on transcript chunks (Phase 4) and the deduplication schema (Phase 2). The node merge logic must be implemented as pure functions in `lib/graph/merge.ts` before the first real extraction call — retrofitting dedup after a polluted database is expensive.
**Delivers:** GPT-4o-mini extraction pipeline (`ExtractionProvider`), `lib/graph/merge.ts` with normalize → exact match → semantic cosine similarity → upsert, edge weight reinforcement, node_mentions cross-linking, Supabase Realtime pushes new nodes to Galaxy Home live
**Uses:** `openai` (^4.x), `gpt-4o-mini` structured outputs, `text-embedding-3-small` for pgvector dedup
**Avoids:** Duplicate/garbage node pitfall (dedup mandatory before any data flows), XSS from LLM output (plain text rendering only, no dangerouslySetInnerHTML)
**Research flag:** Extraction prompt engineering for concept types and relation types, and the correct pgvector cosine similarity threshold, warrant phase research — sparse consumer-app examples in this domain

### Phase 6: Live Active-Learning Prompts
**Rationale:** Requires extracted concepts and graph neighborhood data to generate grounded prompts (Phase 5). The PromptCard UI reuses the Alien Hint button component to be built in Phase 7 — but prompt generation logic is independent and should be established first.
**Delivers:** `useLivePrompt` hook (cadence timer + topic-shift detection), `PromptCard` component (non-blocking overlay), `/api/ai/prompt` route handler, `live_prompts` table writes, 5 prompt types, confidence rating
**Uses:** `openai` via `AIProvider` interface, Supabase Realtime (live_prompts subscription)
**Avoids:** Blocking recording during prompt (non-blocking overlay, not modal); prompt grounded in graph neighborhood not raw text
**Research flag:** Topic-shift detection heuristic (comparing topic_label across consecutive chunks) is domain-specific — may need phase research to calibrate timing

### Phase 7: Alien Hint System
**Rationale:** The hint system is shared across three surfaces: live prompts (Phase 6), post-recording quiz (Phase 8), and review mode (Phase 10). Building it once as a reusable component/hook here — before quiz is built — prevents redundant implementation.
**Delivers:** `AlienHintButton` + `AlienHintPanel` components, `useAlienHint` state machine (3 levels with cooldown), `/api/ai/hint` route handler, `alien_hints` table, "Signal detected" transmission aesthetic
**Uses:** `openai` via `AIProvider` interface, `motion` for panel reveal animation
**Avoids:** Hint level 1 revealing the answer (prompt rubric: "Do not reveal the answer or any defining characteristic directly"); verify with test prompt in acceptance criteria
**Research flag:** Standard patterns — skip phase research

### Phase 8: Post-Recording Quiz
**Rationale:** Requires the hint system (Phase 7) and a complete knowledge graph for the session (Phase 5). Quiz generation prioritizes user marks and low-mastery nodes — both must exist before this phase.
**Delivers:** `/api/ai/quiz` route handler, `session_quizzes` + `session_quiz_questions` + `session_quiz_answers` tables populated, `QuizCard` component with Alien Hint integration, `QuizResults` with weak concept highlights, mastery_score updates
**Uses:** `openai` via `AIProvider`, existing `AlienHintButton` from Phase 7
**Avoids:** Quiz feeling like an ambush (30-second "review transcript" interstitial before quiz begins); full Anki-style SRS queue (graph-based review model instead)
**Research flag:** Standard patterns — skip phase research

### Phase 9: Node Detail and Transcript Cross-Linking
**Rationale:** Requires a complete data model from all prior phases: node_mentions (Phase 5), transcript_chunks with timestamps (Phase 4), quiz history (Phase 8), mastery state (Phase 8). This phase surfaces all cross-references bidirectionally.
**Delivers:** `/nodes/[id]` page with meaning/related nodes/source recordings with timestamps/mastery/quiz history, clickable transcript chunks that highlight graph nodes, clickable graph nodes that highlight transcript chunks
**Uses:** Supabase Server Component data fetch + Client Component island for interactive hint + Realtime subscriptions
**Avoids:** One-directional navigation only (both directions must work and be tested independently)
**Research flag:** Standard patterns — skip phase research

### Phase 10: Review Mode and Mastery System
**Rationale:** Requires mastery data from quiz events and review_events (Phase 8), graph edge schema for traversal (Phase 5). "Tour my weak spots" requires edge-aware graph traversal — this cannot be implemented as a list.
**Delivers:** `/review` page, weak node identification (mastery_state filter), by-recording and by-cluster groupings, "tour my weak spots" graph traversal path, mastery state promotion/demotion logic, review_events table writes
**Uses:** `lib/db/mastery.ts`, `lib/graph/` traversal logic
**Avoids:** Highlighting too many weak nodes simultaneously (max 5 weakest at a time); full SRS due-queue (graph traversal model only)
**Research flag:** Graph traversal algorithm for dependency-ordered weak node path may warrant phase research — need to select appropriate traversal (BFS with mastery weighting vs. topological sort)

### Phase 11: Quality, Security, SEO, Deploy
**Rationale:** Final hardening pass before launch. Playwright E2E tests cover the full recording → extraction → graph → quiz → review flow. Security review uses Trail of Bits skills. Web quality audit uses Lighthouse skills.
**Delivers:** Playwright E2E suite, security audit (supply-chain-risk-auditor, insecure-defaults, static-analysis), Core Web Vitals pass (LCP ≤2.5s, INP ≤200ms, CLS ≤0.1), Vercel production deploy, WebGL fallback verified, full "looks done but isn't" checklist signed off
**Avoids:** Shader/WebGL causing frame drops on recording page (adaptive visual intensity confirmed), audio storage accumulating indefinitely, API keys in NEXT_PUBLIC_ vars
**Research flag:** Standard patterns — skip phase research

### Phase Ordering Rationale

- Phases 0–5 are strictly sequential: each phase creates the data or infrastructure that the next phase depends on. Skipping or reordering any of these five phases causes the next phase to build on missing foundations.
- Phases 6–10 have weak parallelism potential (prompts and quiz share the hint system; node detail and review share mastery data) but are safest sequential given the shared Alien Hint component must be built exactly once in Phase 7 before quiz (Phase 8) and review (Phase 10) reference it.
- Phase 11 is always last — it assumes the entire system is feature-complete.
- The graph layout thrash pitfall requires an architectural decision in Phase 3 and enforcement in Phase 4 — these two phases must remain adjacent.
- The deduplication system requires pgvector schema in Phase 2 and pure-function implementation in Phase 5 — a two-phase setup that cannot be collapsed.

### Research Flags

Phases likely needing `/gsd:research-phase` during planning:
- **Phase 3:** Custom `nodeCanvasObject` rendering in react-force-graph-2d for glow/pulse effects and mutable simulation patterns are specialized topics with limited documented examples outside the library's own demos
- **Phase 4:** Deepgram WebSocket relay via Next.js App Router route handler — the official example exists but verifying it against the current SDK v3 and App Router behavior is worth confirming
- **Phase 5:** LLM extraction prompt engineering for structured concept/relation types; correct pgvector cosine similarity threshold for academic concept deduplication — domain-specific, sparse consumer examples
- **Phase 10:** Graph traversal algorithm selection for dependency-ordered weak-node review path — requires evaluating BFS with mastery weighting vs. topological sort vs. shortest path variants

Phases with well-documented patterns (skip research):
- **Phase 0:** Provider interface pattern is standard TypeScript; mock adapter pattern is documented
- **Phase 1:** Next.js App Router bootstrap + shadcn/ui init are fully documented
- **Phase 2:** Supabase schema creation + pgvector extension + TypeScript type generation are well-documented
- **Phase 6:** AIProvider interface reuse; PromptCard as non-blocking overlay is standard React pattern
- **Phase 7:** Alien Hint is a custom LLM prompt with three-level state machine — well within standard patterns
- **Phase 8:** Quiz generation + quiz UI + mastery update are standard patterns with clear data shapes
- **Phase 9:** Node detail page is a standard Server Component data fetch with Client island pattern
- **Phase 11:** Playwright E2E, Lighthouse, Trail of Bits skills are fully available in-project

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Core decisions locked by project owner; all variable decisions (graph lib, transcription, extraction, animation, WebGL) verified against GitHub, npm, official docs, and community usage. Version constraints documented. |
| Features | HIGH | Cross-referenced against Otter.ai, RemNote, Obsidian, Roam, Anki, SuperMemo, HyNote, Tana. Dependency chain is well-reasoned. MVP scope is appropriately constrained. Anti-features are explicitly justified. |
| Architecture | HIGH | Build order matches MASTER_PLAN phases; provider interface pattern, Supabase Realtime as WebSocket substitute, and node dedup strategy are all documented approaches with production precedent. |
| Pitfalls | HIGH (browser/Vercel/Supabase) / MEDIUM (extraction quality, graph performance at scale) | Browser audio, Vercel limits, and Supabase Realtime bottlenecks are documented with specific failure modes and confirmed mitigations. Extraction quality and graph performance at 1000+ nodes depend on empirical tuning during Phase 5. |

**Overall confidence:** HIGH

### Gaps to Address

- **GPT-4o-mini extraction quality for lecture audio:** The extraction pipeline's concept quality (avoiding garbage nodes, correct relation types) depends on prompt engineering that must be validated empirically in Phase 5. No consumer-app precedent exists for this exact use case. Treat Phase 5 as a validation phase — build the extraction with a configurable confidence threshold and a blocklist, and plan to iterate.
- **Deepgram Nova-3 pricing verification:** The $0.0077/min figure is from a third-party blog post. Verify at signup. The architecture works with any streaming transcription provider behind the interface, so provider swap is low-cost if pricing is unacceptable.
- **pgvector cosine similarity threshold for dedup:** The 0.92 threshold suggested in PITFALLS.md is a starting estimate. The correct threshold for academic concept deduplication requires testing with real lecture transcripts. Make it configurable via environment variable in Phase 5.
- **WebGL performance on low-end mobile:** Galaxy Home with R3F + postprocessing has not been benchmarked. Per MASTER_PLAN.md, WebGL is limited to Galaxy Home — but the shader fallback path (graceful degradation to CSS-only effects) must be explicitly tested in Phase 11.
- **Supabase Realtime Broadcast vs. postgres_changes cutover point:** The recommendation to use Broadcast for high-frequency transient updates and postgres_changes for durable state inserts is directionally correct but requires empirical testing during a simulated 60-minute recording session in Phase 4.

---

## Sources

### Primary (HIGH confidence)
- [vasturiano/react-force-graph GitHub](https://github.com/vasturiano/react-force-graph) — canvas rendering, node mutation, custom nodeCanvasObject
- [Deepgram Next.js live transcription example](https://github.com/deepgram-devs/nextjs-live-transcription) — WebSocket relay pattern
- [MDN MediaRecorder API](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — chunking, MIME types, browser support
- [OpenAI structured outputs docs](https://platform.openai.com/docs/guides/structured-outputs) — json_schema format, gpt-4o-mini support
- [Supabase Realtime with Next.js](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — dual client pattern, postgres_changes
- [Vercel WebGL + Next.js blog](https://vercel.com/blog/building-an-interactive-webgl-experience-in-next-js) — R3F + ssr:false setup
- [React Three Fiber docs](https://r3f.docs.pmnd.rs/getting-started/installation) — App Router setup
- [Motion docs](https://motion.dev) — motion/react import, AnimatePresence, App Router patterns
- [Vercel Serverless Timeout KB](https://vercel.com/kb/guide/what-can-i-do-about-vercel-serverless-functions-timing-out) — maxDuration, Fluid Compute
- [Supabase Realtime Limits](https://supabase.com/docs/guides/realtime/limits) — postgres_changes bottleneck documentation
- [Supabase pgvector](https://supabase.com/docs/guides/database/extensions/pgvector) — cosine distance operator

### Secondary (MEDIUM confidence)
- [From LLMs to Knowledge Graphs (Medium)](https://medium.com/@claudiubranzan/from-llms-to-knowledge-graphs-building-production-ready-graph-systems-in-2025-2b4aff1ec99a) — deduplication and edge reinforcement patterns
- [KGGen arXiv 2502.09956](https://arxiv.org/html/2502.09956v1) — LLM knowledge graph extraction failure modes
- [CLARE academic paper (MDPI)](https://www.mdpi.com/2078-2489/16/10/866) — transcript-to-knowledge-graph construction
- [Supabase postgres_changes bottleneck discussion](https://github.com/orgs/supabase/discussions/7193) — single-threaded authorization bottleneck confirmed
- [Next.js WebSocket limitations discussion](https://github.com/vercel/next.js/discussions/58698) — serverless WebSocket failure modes
- [MediaRecorder Safari support (WebKit Blog)](https://webkit.org/blog/11353/mediarecorder-api/) — Safari codec constraints
- [AssemblyAI vs Deepgram comparison](https://deepgram.com/learn/assemblyai-vs-deepgram) — accuracy/latency tradeoffs (vendor source — take with caution)

### Tertiary (LOW confidence — verify at implementation)
- [Deepgram pricing blog post](https://brasstranscripts.com/blog/deepgram-pricing-per-minute-2025-real-time-vs-batch) — $0.0077/min figure; verify at signup
- [Sigma.js comparison blog](https://memgraph.com/blog/you-want-a-fast-easy-to-use-and-popular-graph-visualization-tool-pick-two) — WebGL speed vs. API complexity tradeoff; MEDIUM source quality

---

*Research completed: 2026-03-10*
*Ready for roadmap: yes*
