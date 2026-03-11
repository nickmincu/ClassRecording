# Stack Research

**Domain:** Knowledge-graph learning app — browser audio capture, streaming transcription, LLM concept extraction, interactive 2D force graph, quiz/hint system
**Researched:** 2026-03-10
**Confidence:** HIGH (core stack decisions) / MEDIUM (versions — verify at install time)

---

## Decided Stack (Non-Negotiable)

These are locked by the project owner. Do not re-evaluate them.

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js App Router | 14.x / 15.x | Framework, routing, API routes, SSR/SSG |
| TypeScript | 5.x | Type safety across all layers |
| Tailwind CSS | 3.x | Utility-first styling, design tokens |
| Supabase | latest | Postgres database, realtime subscriptions, storage |
| Vercel | — | Deployment, edge functions, env management |

---

## Recommended Stack — Research Decisions

### 1. 2D Graph Visualization

**Recommendation: `react-force-graph-2d` (from `react-force-graph`)**

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `react-force-graph-2d` | `^1.x` | Interactive physics force graph | React-native component wrapping `force-graph` + `d3-force`. Canvas-based — handles hundreds of nodes well. Ships 2D, 3D, VR variants in one package; we use 2D only. Has built-in zoom, pan, drag, hover, click handlers. Custom node/link rendering via canvas callbacks. Active maintenance by vasturiano. |

**Rationale vs alternatives:**

| Library | Why Not |
|---------|---------|
| `sigma.js` + `@react-sigma/core` | WebGL is faster at 10k+ nodes, but API is significantly more complex. Lacks built-in physics/force simulation — requires `graphology-layout-forceatlas2` separately. Documentation gaps. Overkill for hundreds of nodes. |
| `cytoscape.js` | Strong layout support, good docs. But DOM-based rendering, heavier than canvas for live physics. Galaxy "living cosmos" feel requires continuous simulation which D3-force handles natively. |
| `D3.js` raw | Full control but requires writing the entire interaction layer from scratch. Canvas + SVG hybrid is complex. `react-force-graph-2d` is built on D3-force; we get the engine without the boilerplate. |
| `3d-force-graph` | 3D only. Project explicitly rules out 3D. |

**Note on performance:** `react-force-graph-2d` uses HTML5 Canvas, not SVG. This is the right call for hundreds of nodes with continuous physics. Canvas redraws at 60fps, SVG would degrade. At 500+ nodes, the `cooldownTicks` prop should be used to stop physics after stabilization and resume only when the graph changes.

**Confidence:** HIGH — verified via GitHub, npm, and community usage. Official repo: https://github.com/vasturiano/react-force-graph

---

### 2. Browser Audio Recording

**Recommendation: Native `MediaRecorder` API — no library needed**

| Technology | Purpose | Why Recommended |
|------------|---------|-----------------|
| `navigator.mediaDevices.getUserMedia()` | Microphone access | Web standard, no dependency required |
| `MediaRecorder` API | Capture + chunk audio | Standard browser API with timeslice-based chunking. Start with `recorder.start(250)` for 250ms chunks. `ondataavailable` fires per chunk as `Blob`. Chrome/Firefox/Edge all support `audio/webm;codecs=opus`. |

**Why no library:** The MediaRecorder API is now well-supported and stable. Third-party wrappers like `RecordRTC` and `MediaStreamRecorder` add bundle weight without meaningful benefit for a modern Chrome/Edge target.

**Chunking pattern for streaming to backend:**
```
MediaRecorder.start(250ms timeslice)
  → ondataavailable(Blob chunk)
  → POST chunk to /api/transcribe/stream
  → server forwards to Deepgram WebSocket
```

**Key constraints:**
- Must run in a `'use client'` component only — no SSR
- Chrome encodes as `audio/webm;codecs=opus` by default — Deepgram accepts this natively
- Microphone permission must be requested in a user gesture handler

**Confidence:** HIGH — MDN specification, well-documented behavior. https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder

---

### 3. Streaming Transcription

**Recommendation: Deepgram Nova-3 via `@deepgram/sdk`**

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `@deepgram/sdk` | `^3.x` | WebSocket streaming transcription | Official JS SDK. Nova-3 delivers sub-300ms latency, WebSocket-native streaming, returns interim + final transcripts. Has official Next.js live-transcription example repo. Charges by second (not 15s increments like competitors). |

**Architecture pattern (security-correct):**
```
Browser → POST /api/transcribe (Next.js API route) → Deepgram WebSocket
Browser ← SSE or Supabase realtime ← Server writes transcript chunks
```

Do NOT proxy the Deepgram API key to the browser. The Next.js API route is the WebSocket relay. This is Deepgram's own recommended pattern.

**Pricing:** $0.0077/min ($0.46/hr) for Nova-3 streaming on pay-as-you-go. Billing by the second.

**Alternative if budget is a constraint:**

| Alternative | When to Use |
|-------------|-------------|
| AssemblyAI Universal-2 | Slightly higher accuracy (14.5% WER vs 18% WER) at $0.37/hr. Better for post-recording batch transcription if near-real-time isn't required |
| OpenAI Whisper (self-hosted) | Zero per-minute cost at scale, but requires infrastructure and does NOT support streaming — only batch. Cannot be used for live recording. |
| OpenAI Realtime API | gpt-4o-realtime supports streaming, but optimized for voice-to-voice; costs are higher and less predictable for pure transcription use. |

**Provider interface requirement:** Wrap Deepgram behind a `TranscriptionProvider` interface so it can be swapped later. The MASTER_PLAN.md explicitly requires this.

**Confidence:** HIGH — official SDK, official Next.js example at https://github.com/deepgram-devs/nextjs-live-transcription

---

### 4. Concept / Entity Extraction

**Recommendation: OpenAI `gpt-4o-mini` with Structured Outputs**

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| `openai` (npm) | `^4.x` | Concept extraction, relation extraction, quiz generation, alien hints | `gpt-4o-mini` supports `response_format: { type: "json_schema" }` for guaranteed JSON output. $0.15/1M input tokens, $0.60/1M output tokens — low cost per chunk extraction. 128K context window. Fast inference (~1-2s per call). |

**Extraction call pattern:**
```
Input: transcript chunk (200-400 words)
Output JSON schema: { concepts: [{label, type, description}], relations: [{source, target, edge_type}] }
```

Two-call pipeline per chunk:
1. Extract entities with types (concept, definition, example, formula, comparison, unresolved_question)
2. Extract relations between entities (maps to edge types in MASTER_PLAN schema)

**Deduplication strategy:** After extraction, normalize labels (lowercase, trim) and run a semantic similarity check before creating new nodes. Use `text-embedding-3-small` at $0.02/1M tokens to embed concept labels and cosine-compare against existing node embeddings stored in Supabase `pgvector`.

**For quiz and alien hint generation:** Same `gpt-4o-mini` model — keep consistent provider interface.

**Provider interface:** Wrap in `ExtractionProvider` interface. Future swap target: Anthropic Claude Haiku, or a fine-tuned model.

**Alternatives considered:**

| Alternative | Why Not |
|-------------|---------|
| Claude Haiku 3.5 | Similar cost, comparable quality. Valid alternative. Use gpt-4o-mini first because structured outputs are well-documented and the extraction pattern has more community examples. |
| LangChain / LangGraph | Heavy abstraction layer; MASTER_PLAN does not call for it. Raw OpenAI SDK gives full control with less dependency surface. |
| spaCy / NLP libraries | Python-only, requires a separate service. Unnecessary complexity when LLMs extract better structured output for this domain. |

**Confidence:** MEDIUM — OpenAI structured output behavior is well-documented, but gpt-4o-mini quality for concept extraction on lecture audio should be validated in Phase 0/1. Costs are low enough to validate early.

---

### 5. Animation Library

**Recommendation: Motion (formerly Framer Motion) v11**

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `motion` | `^11.x` | UI transitions, node animations, prompt card reveals, page transitions | Import from `motion/react` for Next.js App Router compatibility. Declarative, component-based, works natively with React. Handles `AnimatePresence` for mount/unmount animations (node appear/disappear). Layout animations for graph panel transitions. Scroll-triggered animations for Galaxy Home. ~23-32KB gzipped. |

**Next.js App Router pattern:**
All `motion.*` components require `'use client'`. Wrap in a client boundary component; server components call the wrapper. Import from `motion/react`, not `framer-motion`, for React 19 compatibility.

**For 21st.dev Magic components:** The 21st.dev component generator outputs Tailwind + Framer Motion by default. Using `motion` as the canonical animation library ensures generated components work without modification.

**GSAP for complex sequences (optional, additive):**

| Use Case | Tool |
|----------|------|
| Standard UI transitions, node enter/exit, panel slides | Motion (framer-motion) |
| Galaxy Home landing cinematic sequence, shader-coordinated reveals | GSAP (add if needed in Phase 3) |

Do not add GSAP unless the Phase 3 Galaxy Home visual requires timeline-based orchestration that Motion cannot handle. GSAP's React integration requires manual cleanup and is heavier to set up.

**Confidence:** HIGH — strong community consensus, well-documented Next.js App Router patterns. Official docs: https://motion.dev

---

### 6. WebGL / Shader Background Effects

**Recommendation: `@react-three/fiber` + `@react-three/drei`**

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| `three` | `^0.165.x` | WebGL runtime | Peer dependency of R3F |
| `@react-three/fiber` | `^8.x` | React renderer for Three.js | Declarative Three.js for React. Component-based scene composition. Animates via `useFrame`. Vercel has an official blog post on WebGL in Next.js using R3F. |
| `@react-three/drei` | `^9.x` | Helpers and abstractions | `<Stars>`, `<OrbitControls>`, `<Html>`, `<Sparkles>`, environment helpers — all relevant to galaxy aesthetic. Avoids rebuilding common effects. |

**Usage scope — Galaxy Home and landing only:**
The shader/starfield background lives only on the Galaxy Home fullscreen view and the landing page. All other pages (Recording, Review, Node Detail) use CSS-only effects. Do not render a WebGL canvas on every page.

**Next.js App Router setup:**
```tsx
// Dynamic import with SSR disabled — required
const GalaxyBackground = dynamic(() => import('@/components/GalaxyBackground'), { ssr: false })
```
R3F Canvas must be in a `'use client'` component. Dynamic import with `ssr: false` prevents hydration errors.

**`next.config.js` requirement:**
```js
transpilePackages: ['three']
```

**What to build with it:**
- Animated starfield / particle background (Galaxy Home)
- Subtle glow/bloom post-processing on knowledge nodes (using `@react-three/postprocessing`)
- Alien Hint "transmission" visual effect (shader-based glow panel)

**Alternative — OGL (lightweight WebGL):**

| Library | When to Use Instead |
|---------|---------------------|
| `ogl` | If bundle size is critical and only one or two custom shaders are needed. No React bindings — requires more imperative code. Not worth it given R3F's ecosystem. |

**`@react-three/postprocessing` (additive, Phase 3):**
Adds Bloom, Noise, Vignette effects to the R3F scene. Add in Phase 3 when Galaxy Home is built. Do not install in Phase 1.

**Confidence:** MEDIUM — R3F is the established standard for React + WebGL. Next.js integration is documented on Vercel's official blog. The exact shader effects for the galaxy aesthetic will be designed in Phase 3 with 21st.dev Magic MCP.

---

## Supporting Libraries (Install As Needed)

| Library | Version | Purpose | Install Phase |
|---------|---------|---------|---------------|
| `@supabase/supabase-js` | `^2.x` | Supabase client, realtime subscriptions | Phase 2 |
| `@supabase/ssr` | `^0.x` | Server-side Supabase client for App Router | Phase 2 |
| `openai` | `^4.x` | OpenAI API client | Phase 5 |
| `@deepgram/sdk` | `^3.x` | Deepgram transcription | Phase 4 |
| `react-force-graph-2d` | `^1.x` | 2D knowledge graph | Phase 3 |
| `motion` | `^11.x` | Animation | Phase 1 |
| `three` | `^0.165.x` | WebGL runtime | Phase 3 |
| `@react-three/fiber` | `^8.x` | React + Three.js | Phase 3 |
| `@react-three/drei` | `^9.x` | Three.js helpers | Phase 3 |
| `@react-three/postprocessing` | `^2.x` | Visual post effects | Phase 3 |
| `zod` | `^3.x` | Runtime schema validation for API routes | Phase 2 |
| `shadcn/ui` (via CLI) | latest | Base UI primitives where 21st.dev doesn't cover | Phase 1 |
| `lucide-react` | `^0.x` | Icon system (Shadcn's default) | Phase 1 |
| `clsx` / `tailwind-merge` | `^2.x` | Conditional class utilities | Phase 1 |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| `react-graph-vis` / `vis.js` | Unmaintained, legacy API, poor TypeScript support | `react-force-graph-2d` |
| `d3.js` raw (for graph) | Requires building all interaction from scratch; `react-force-graph-2d` already wraps d3-force | `react-force-graph-2d` |
| `RecordRTC` / `MediaStreamRecorder` | Wrappers around MediaRecorder — unnecessary dependency for modern targets | Native `MediaRecorder` API |
| `LangChain` | Heavy abstraction, large bundle, adds complexity without value for this single-provider architecture | Direct `openai` SDK with provider interface |
| `framer-motion` (old import) | The `framer-motion` package name still works but import from `motion/react` for React 19 + App Router compatibility | `motion` package, import from `motion/react` |
| `Next.js Pages Router` | Project is App Router. Do not mix routing paradigms. | App Router only |
| `socket.io` | Heavyweight WebSocket abstraction. For Deepgram relay, a native WebSocket in the API route is sufficient. | Native `WebSocket` or Deepgram SDK's built-in WS client |
| OpenAI Whisper (self-hosted) | Requires separate Python infrastructure, no streaming support, ops overhead | Deepgram Nova-3 streaming |
| Three.js 3D graph (3d-force-graph) | Explicitly out of scope. 3D adds complexity and kills performance on weaker machines. | `react-force-graph-2d` |

---

## Provider Interface Pattern (Mandatory)

Per MASTER_PLAN.md, AI providers must be behind interfaces. Implement these abstractions:

```typescript
// lib/providers/transcription.ts
interface TranscriptionProvider {
  startStream(onChunk: (text: string, isFinal: boolean) => void): void
  stopStream(): void
}

// lib/providers/extraction.ts
interface ExtractionProvider {
  extractConcepts(text: string): Promise<ConceptExtractionResult>
  generateHint(context: HintContext, level: 'cryptic' | 'nudge' | 'scaffold'): Promise<string>
  generateQuiz(sessionId: string, concepts: string[]): Promise<QuizQuestion[]>
}
```

Current implementations: `DeepgramTranscriptionProvider`, `OpenAIExtractionProvider`.
Swap targets: AssemblyAI, Anthropic Claude, local Whisper.

---

## Installation Order

```bash
# Phase 1 — Bootstrap
npm install motion clsx tailwind-merge lucide-react
npx shadcn@latest init

# Phase 2 — Database
npm install @supabase/supabase-js @supabase/ssr zod

# Phase 3 — Graph + WebGL
npm install react-force-graph-2d
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing

# Phase 4 — Audio + Transcription
npm install @deepgram/sdk

# Phase 5 — AI Extraction
npm install openai
```

Audit every package before installing:
```bash
npm audit
# Also run supply-chain-risk-auditor skill before Phase 3+ installs
```

---

## Version Compatibility Notes

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| `motion@11` | React 18+, Next.js 14+ | Import from `motion/react`, not `framer-motion`. Requires `'use client'` on all animated components. |
| `@react-three/fiber@8` | Three.js `^0.165`, React 18+ | Pin three.js version — minor version bumps can break. Add `three` to `transpilePackages` in `next.config.js`. |
| `react-force-graph-2d@1` | React 17+ | Canvas-based, no SSR. Wrap in `dynamic(() => ..., { ssr: false })`. |
| `@deepgram/sdk@3` | Node.js 18+ | Server-side only for WebSocket relay. Never import in client components. |
| `@supabase/ssr@0` | Next.js 13+ App Router | Required alongside `@supabase/supabase-js` for App Router cookie handling. |

---

## Sources

- [vasturiano/react-force-graph GitHub](https://github.com/vasturiano/react-force-graph) — force-graph canvas rendering, performance notes — HIGH confidence
- [Deepgram Nova-3 Next.js example](https://github.com/deepgram-devs/nextjs-live-transcription) — streaming WebSocket pattern — HIGH confidence
- [Deepgram pricing 2025](https://brasstranscripts.com/blog/deepgram-pricing-per-minute-2025-real-time-vs-batch) — $0.0077/min streaming — MEDIUM confidence (verify at signup)
- [MDN MediaRecorder](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder) — chunking, format support — HIGH confidence
- [Motion vs GSAP comparison](https://motion.dev/docs/gsap-vs-motion) — bundle size, tree shaking — HIGH confidence
- [Vercel WebGL + Next.js blog](https://vercel.com/blog/building-an-interactive-webgl-experience-in-next-js) — R3F setup pattern — HIGH confidence
- [React Three Fiber docs](https://r3f.docs.pmnd.rs/getting-started/installation) — App Router setup — HIGH confidence
- [OpenAI structured outputs](https://platform.openai.com/docs/guides/structured-outputs) — json_schema format, model support — HIGH confidence
- [OpenAI pricing](https://platform.openai.com/docs/pricing) — gpt-4o-mini $0.15/$0.60 per 1M tokens — HIGH confidence (verify at build time)
- [Sigma.js comparison](https://memgraph.com/blog/you-want-a-fast-easy-to-use-and-popular-graph-visualization-tool-pick-two) — WebGL speed vs API complexity tradeoff — MEDIUM confidence
- [AssemblyAI vs Deepgram 2025](https://deepgram.com/learn/assemblyai-vs-deepgram) — accuracy, latency comparison — MEDIUM confidence (vendor source)

---

*Stack research for: Galaxy of Knowledge — ClassRecording*
*Researched: 2026-03-10*
