# Architecture Research

**Domain:** Audio-to-knowledge-graph learning app (single-user, browser-based recording, real-time transcription, concept extraction, interactive graph)
**Researched:** 2026-03-10
**Confidence:** HIGH

---

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              BROWSER (Client)                               │
├────────────────┬────────────────┬─────────────────┬───────────────────────-─┤
│  Galaxy Home   │ Live Recording │ Recording Review│ Node Detail / Review    │
│  /             │ /recording     │ /recordings/[id]│ /nodes/[id]  /review    │
│  ForceGraph2D  │ MediaRecorder  │ Quiz + Hints    │ Mastery + Hints         │
│  React         │ AudioContext   │ React           │ React                   │
└───────┬────────┴────────┬───────┴────────┬────────┴──────────┬──────────────┘
        │                 │                │                   │
        │  Supabase       │  fetch/POST    │  fetch/GET        │  fetch/GET
        │  Realtime       │  audio chunks  │  session data     │  node data
        │  subscription   │                │                   │
        ↓                 ↓                ↓                   ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS APP ROUTER (Server)                          │
├──────────────────┬──────────────────┬──────────────────┬────────────────────┤
│  Route Handlers  │  Route Handlers  │  Route Handlers  │  Route Handlers    │
│  /api/graph      │  /api/recording  │  /api/extract    │  /api/ai           │
│  (graph queries) │  (audio ingest)  │  (concept+edge   │  (hints, quiz,     │
│                  │                  │   extraction)    │   prompts)         │
└──────────┬───────┴────────┬─────────┴────────┬─────────┴──────────┬────────┘
           │                │                  │                    │
           ↓                ↓                  ↓                    ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROVIDER INTERFACES (lib/providers/)                │
├─────────────────────┬───────────────────────┬───────────────────────────────┤
│  TranscriptionProvider │ ExtractionProvider  │  AIProvider                  │
│  (Whisper / mock)      │ (GPT-4o / mock)     │  (hints, quiz, prompts)      │
└──────────┬─────────────────────┬─────────────────────┬────────────────────-─┘
           │                     │                     │
           ↓                     ↓                     ↓
┌─────────────────────────────────────────────────────────────────────────────┐
│                               SUPABASE                                      │
├──────────────────────────┬──────────────────────────────────────────────────┤
│  Postgres (12 tables)    │  Realtime (postgres_changes broadcasts)          │
│  recording_sessions      │  knowledge_nodes → Galaxy Home graph updates     │
│  transcript_chunks       │  knowledge_edges → live edge rendering           │
│  knowledge_nodes         │  live_prompts    → prompt card appearance        │
│  knowledge_edges         │                                                  │
│  node_mentions           │                                                  │
│  live_prompts            │                                                  │
│  session_quizzes         │                                                  │
│  session_quiz_questions  │                                                  │
│  session_quiz_answers    │                                                  │
│  user_marks              │                                                  │
│  review_events           │                                                  │
│  alien_hints             │                                                  │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Galaxy Home (`/`) | Full-screen 2D graph, search, filters, side panels | `ForceGraph2D` from `react-force-graph` + Supabase Realtime subscription |
| Live Recording (`/recording`) | Browser audio capture, chunked upload, live transcript, mini-graph, active-learning prompts | `MediaRecorder` API + `useAudioPipeline` custom hook + SSE or polling for transcript state |
| Recording Review (`/recordings/[id]`) | Transcript, summary, session graph slice, post-recording quiz, Alien Hints | Server Component + Client Component island for quiz interactivity |
| Node Detail (`/nodes/[id]`) | Node meaning, related nodes, source recordings, mastery, quiz history, mini-review | Server Component data fetch + Client Component for hint interaction |
| Review Mode (`/review`) | Weak nodes, by-recording, by-cluster, tour weak spots | Client Component with mastery queries |
| Audio Ingest Route (`/api/recording/chunk`) | Receive raw audio blob chunks, forward to TranscriptionProvider | Next.js Route Handler accepting `multipart/form-data` |
| Graph Update Engine (`/api/extract`) | Process transcript chunk → extract concepts → merge/create nodes → create/reinforce edges | Server-side service called after each chunk transcription completes |
| AI Routes (`/api/ai`) | Generate hints, generate quiz, generate live prompts | Thin routes delegating to AIProvider interface |
| Provider Interfaces (`lib/providers/`) | Swappable adapters for transcription, extraction, AI generation | TypeScript interfaces + concrete adapters (OpenAI, mock) |
| Supabase Data Layer (`lib/db/`) | Typed query functions for all 12 tables | Supabase JS client + TypeScript types generated from schema |

---

## Recommended Project Structure

```
src/
├── app/
│   ├── page.tsx                  # Galaxy Home — full-screen graph
│   ├── recording/
│   │   └── page.tsx              # Live Recording page
│   ├── recordings/
│   │   └── [id]/
│   │       └── page.tsx          # Recording Review page
│   ├── nodes/
│   │   └── [id]/
│   │       └── page.tsx          # Node Detail page
│   ├── review/
│   │   └── page.tsx              # Review Mode page
│   └── api/
│       ├── recording/
│       │   ├── route.ts          # POST: create session / GET: list sessions
│       │   └── chunk/
│       │       └── route.ts      # POST: receive audio chunk, trigger transcription
│       ├── extract/
│       │   └── route.ts          # POST: concept+edge extraction from transcript chunk
│       ├── graph/
│       │   └── route.ts          # GET: node/edge data for graph rendering
│       └── ai/
│           ├── hint/
│           │   └── route.ts      # POST: generate Alien Hint
│           ├── quiz/
│           │   └── route.ts      # POST: generate post-recording quiz
│           └── prompt/
│               └── route.ts      # POST: generate live active-learning prompt
├── components/
│   ├── graph/
│   │   ├── GalaxyGraph.tsx       # ForceGraph2D wrapper + node visual rules
│   │   ├── MiniGraph.tsx         # Live recording mini-graph
│   │   ├── NodeTooltip.tsx       # Hover tooltip for graph nodes
│   │   └── GraphFilters.tsx      # Node type / mastery / date filters
│   ├── recording/
│   │   ├── RecordingControls.tsx # Start/pause/stop + timer
│   │   ├── LiveTranscript.tsx    # Scrolling live transcript pane
│   │   ├── ConceptsFeed.tsx      # Rolling extracted concepts
│   │   ├── UserMarkBar.tsx       # Important/confused/bookmark marks
│   │   └── PromptCard.tsx        # Live active-learning prompt card
│   ├── hint/
│   │   ├── AlienHintButton.tsx   # Trigger button with alien transmission theme
│   │   └── AlienHintPanel.tsx    # Hint display panel, 3-level progressive reveal
│   ├── quiz/
│   │   ├── QuizCard.tsx          # Single quiz question card
│   │   └── QuizResults.tsx       # Score + weak concepts + review path
│   ├── panels/
│   │   ├── RecentRecordingsPanel.tsx
│   │   ├── WeakConceptsPanel.tsx
│   │   └── NewNodesPanel.tsx
│   └── ui/
│       └── ...                   # Design system primitives (21st.dev generated)
├── lib/
│   ├── providers/
│   │   ├── transcription/
│   │   │   ├── types.ts          # TranscriptionProvider interface
│   │   │   ├── openai.ts         # OpenAI Whisper adapter
│   │   │   └── mock.ts           # Mock adapter for dev/test
│   │   ├── extraction/
│   │   │   ├── types.ts          # ExtractionProvider interface
│   │   │   ├── openai.ts         # GPT-4o extraction adapter
│   │   │   └── mock.ts           # Mock adapter
│   │   └── ai/
│   │       ├── types.ts          # AIProvider interface (hints, quiz, prompts)
│   │       ├── openai.ts         # OpenAI adapter
│   │       └── mock.ts           # Mock adapter
│   ├── db/
│   │   ├── client.ts             # Supabase browser + server client setup
│   │   ├── types.ts              # Generated TypeScript types from schema
│   │   ├── recordings.ts         # recording_sessions + transcript_chunks queries
│   │   ├── graph.ts              # knowledge_nodes + knowledge_edges queries
│   │   ├── mentions.ts           # node_mentions queries
│   │   ├── prompts.ts            # live_prompts queries
│   │   ├── quizzes.ts            # session_quizzes + questions + answers queries
│   │   ├── marks.ts              # user_marks queries
│   │   ├── mastery.ts            # review_events + mastery scoring logic
│   │   └── hints.ts              # alien_hints queries
│   ├── graph/
│   │   ├── merge.ts              # Node deduplication + merge logic
│   │   ├── edges.ts              # Edge creation + weight reinforcement logic
│   │   └── visual.ts             # Visual weight, glow, pulse calculations
│   ├── audio/
│   │   └── recorder.ts           # MediaRecorder setup, chunking, blob management
│   └── utils/
│       ├── normalize.ts          # Label normalization for node matching
│       └── timestamps.ts         # Offset calculation helpers
├── hooks/
│   ├── useAudioPipeline.ts       # Orchestrates MediaRecorder + chunk upload + transcript state
│   ├── useGraphRealtime.ts       # Supabase Realtime subscription for graph updates
│   ├── useLivePrompt.ts          # Cadence timer + topic-shift detection for prompts
│   └── useAlienHint.ts           # Hint level state machine + API calls
└── types/
    └── index.ts                  # Shared domain types (NodeType, EdgeType, MasteryState etc.)
```

### Structure Rationale

- **`app/api/`:** Route Handlers stay thin — they validate input, call a service in `lib/`, and return. Business logic never lives in routes.
- **`lib/providers/`:** All external AI/transcription calls go through typed interfaces here. Swapping from OpenAI Whisper to AssemblyAI means adding a new adapter file and changing one import in `app/api/recording/chunk/route.ts`. Nothing else changes.
- **`lib/db/`:** One file per domain table group. No raw Supabase queries in components — all data access goes through these typed functions.
- **`lib/graph/`:** Node merge logic and edge scoring are pure functions with no framework dependency. Easy to unit test without a database.
- **`hooks/`:** Client-side orchestration stays in hooks, not components. `useAudioPipeline` is the most complex — it owns the recording state machine so the `RecordingControls` component stays declarative.
- **`components/`:** Grouped by feature domain, not by component type. `graph/`, `recording/`, `hint/`, `quiz/` are vertical slices.

---

## Architectural Patterns

### Pattern 1: Provider Interface for AI Swappability

**What:** Every external AI call goes through a TypeScript interface. Route Handlers receive the concrete adapter via a factory function that reads from environment variables. Components never import AI SDKs directly.

**When to use:** Any call to an external AI service — transcription, extraction, hint generation, quiz generation, live prompt generation.

**Trade-offs:** Adds a thin indirection layer. Pays off immediately when mocking in tests and when swapping providers.

**Example:**
```typescript
// lib/providers/transcription/types.ts
export interface TranscriptionProvider {
  transcribe(audioBlob: Blob, options?: TranscribeOptions): Promise<TranscriptionResult>
}

export interface TranscriptionResult {
  text: string
  confidence: number
  segments?: Array<{ start: number; end: number; text: string }>
}

// lib/providers/transcription/openai.ts
export class OpenAITranscriptionProvider implements TranscriptionProvider {
  async transcribe(audioBlob: Blob): Promise<TranscriptionResult> {
    // calls Whisper API
  }
}

// lib/providers/transcription/mock.ts
export class MockTranscriptionProvider implements TranscriptionProvider {
  async transcribe(_blob: Blob): Promise<TranscriptionResult> {
    return { text: "Mock transcript text about photosynthesis...", confidence: 0.95 }
  }
}

// app/api/recording/chunk/route.ts
import { getTranscriptionProvider } from '@/lib/providers/transcription'
const provider = getTranscriptionProvider() // reads TRANSCRIPTION_PROVIDER env var
```

### Pattern 2: Audio Chunking with Periodic Timeslice

**What:** `MediaRecorder.start(intervalMs)` fires `ondataavailable` every N milliseconds with a Blob chunk. Each chunk is immediately POSTed to `/api/recording/chunk`. The server transcribes it, runs extraction, and writes to Supabase. The client subscribes to Supabase Realtime to receive the resulting graph updates.

**When to use:** The core live recording loop — this is the main data pipeline.

**Trade-offs:** 5-second chunks balance latency vs. transcription accuracy (shorter chunks hurt word boundary accuracy). The pipeline is eventually consistent — the graph lags transcript by one processing cycle (~3–8s), which is acceptable for this use case.

**Example:**
```typescript
// hooks/useAudioPipeline.ts
const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' })

recorder.ondataavailable = async (event) => {
  if (event.data.size === 0) return
  const formData = new FormData()
  formData.append('chunk', event.data)
  formData.append('sessionId', sessionId)
  formData.append('chunkIndex', String(chunkIndex++))
  formData.append('offsetMs', String(currentOffsetMs))
  await fetch('/api/recording/chunk', { method: 'POST', body: formData })
}

recorder.start(5000) // 5-second chunks
```

### Pattern 3: Supabase Realtime for Graph Updates

**What:** After each chunk is processed server-side (transcribed + extracted + written to `knowledge_nodes` / `knowledge_edges`), the client's Supabase Realtime subscription fires and the graph re-renders with new data. No polling, no WebSocket management.

**When to use:** Galaxy Home (live node/edge updates) and the mini-graph on the Live Recording page.

**Trade-offs:** Supabase Realtime requires a client-side Client Component. Galaxy Home must be a Client Component or use a hybrid pattern (Server Component for initial data, Client Component for Realtime subscription). Supabase recommends `Broadcast via database triggers` over `postgres_changes` for scale, but `postgres_changes` is simpler for a single-user app.

**Example:**
```typescript
// hooks/useGraphRealtime.ts
useEffect(() => {
  const channel = supabase
    .channel('graph-updates')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'knowledge_nodes' },
      (payload) => setNodes(prev => [...prev, payload.new as KnowledgeNode])
    )
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'knowledge_edges' },
      (payload) => setEdges(prev => [...prev, payload.new as KnowledgeEdge])
    )
    .subscribe()
  return () => { supabase.removeChannel(channel) }
}, [])
```

### Pattern 4: Node Merge Before Insert

**What:** Before creating a new `knowledge_node`, the extraction pipeline normalizes the candidate label (lowercase, strip punctuation, stem), checks for existing nodes with matching normalized label, and performs a semantic similarity check (embed the candidate, query nearest neighbors). Only create a new node if no match found above threshold.

**When to use:** Every concept extraction result — this is non-negotiable to prevent junk node proliferation.

**Trade-offs:** Semantic check adds latency (~100–300ms per chunk processing). Can skip semantic check and use label-only matching in early phases, then add semantic matching in Phase 5.

**Example:**
```typescript
// lib/graph/merge.ts
export async function findOrCreateNode(
  candidate: NodeCandidate,
  db: SupabaseClient
): Promise<KnowledgeNode> {
  const normalized = normalizeLabel(candidate.label)
  // 1. Exact match on canonical_label
  const exactMatch = await db.from('knowledge_nodes')
    .select().eq('canonical_label', normalized).maybeSingle()
  if (exactMatch.data) return reinforceNode(exactMatch.data, candidate, db)
  // 2. Semantic similarity (Phase 5+)
  // 3. Create new node
  return createNode({ ...candidate, canonical_label: normalized }, db)
}
```

---

## Data Flow

### Audio Pipeline (Core Loop)

```
[Browser: MediaRecorder]
    | 5s chunk (audio/webm blob)
    ↓
[POST /api/recording/chunk]
    | FormData: chunk, sessionId, chunkIndex, offsetMs
    ↓
[TranscriptionProvider.transcribe(blob)]
    | TranscriptionResult: { text, confidence, segments }
    ↓
[INSERT transcript_chunks row]
    ↓
[POST /api/extract (called server-side after transcription)]
    | Input: transcript text + sessionId + chunkIndex
    ↓
[ExtractionProvider.extract(text)]
    | Output: { concepts[], relations[], topic_label }
    ↓
[lib/graph/merge.ts: findOrCreateNode() for each concept]
    ↓
[INSERT/UPDATE knowledge_nodes + INSERT/UPDATE knowledge_edges]
    ↓
[INSERT node_mentions linking nodes → transcript_chunk]
    ↓
[Supabase Realtime fires → client subscription receives INSERT events]
    ↓
[useGraphRealtime hook updates local node/edge state]
    ↓
[ForceGraph2D / MiniGraph re-renders with new nodes and edges]
```

### Live Prompt Flow

```
[useLivePrompt hook: interval timer fires (3-6 min) OR topic_label changes]
    ↓
[POST /api/ai/prompt]
    | Input: last 2 transcript_chunks + recent knowledge_nodes
    ↓
[AIProvider.generatePrompt(context)]
    | Output: { prompt_type, prompt_text, options_json, correct_answer_json }
    ↓
[INSERT live_prompts row]
    ↓
[PromptCard renders on recording page]
    ↓
[User answers OR requests Alien Hint]
    ├──→ [POST /api/ai/hint] → [INSERT alien_hints] → [AlienHintPanel reveals level 1]
    └──→ [PATCH live_prompts: user_answer_json, correctness, confidence_rating]
            ↓
        [mastery update deferred to post-recording or review]
```

### Post-Recording Quiz Flow

```
[User stops recording → recording_sessions.status = 'completed']
    ↓
[POST /api/ai/quiz]
    | Input: all transcript_chunks + knowledge_nodes for session
    | Prioritize: user_marks(confused, important) + low mastery nodes
    ↓
[AIProvider.generateQuiz(context)]
    | Output: QuizQuestion[] (5-10 items)
    ↓
[INSERT session_quizzes + session_quiz_questions rows]
    ↓
[Redirect to /recordings/[id] with quiz active]
    ↓
[User answers each question (optionally requests Alien Hint)]
    ↓
[INSERT session_quiz_answers rows]
    ↓
[Compute score, identify weak concepts]
    ↓
[UPDATE knowledge_nodes.mastery_score + mastery_state for each answered node]
    ↓
[INSERT review_events rows]
    ↓
[QuizResults: show score + weak node highlights + review path suggestion]
```

### Alien Hint Flow

```
[User clicks "Alien Hint" button]
    | Context: { source_type, source_id, current_hint_level }
    ↓
[POST /api/ai/hint]
    | Input: question text + related transcript_chunks + related knowledge_nodes (graph neighborhood)
    | Requested level: cryptic | nudge | scaffold
    ↓
[AIProvider.generateHint(context, level)]
    | Constraint: level=cryptic must NOT reveal answer; level=scaffold may provide strong clue
    ↓
[INSERT alien_hints row]
    ↓
[AlienHintPanel animates in with "Signal detected" transmission aesthetic]
    ↓
[User may request next level → repeat with level+1 (max: scaffold)]
```

### Graph Mastery Visual Update

```
[knowledge_nodes.mastery_state changes (new → seen → shaky → strong)]
    ↓
[lib/graph/visual.ts: computeVisualWeight(mastery_score, mention_count)]
    | Returns: { glowIntensity, pulseRate, nodeRadius, color }
    ↓
[GalaxyGraph.tsx nodeCanvasObject callback applies visual properties]
    | new → soft animate-in
    | shaky → subtle pulse
    | strong → bright glow, larger radius
```

---

## Component Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Browser hooks → Route Handlers | `fetch()` POST/GET | Audio chunks via `multipart/form-data`; all other calls via JSON |
| Route Handlers → Provider Interfaces | Direct TypeScript function call (same process) | Providers are not microservices — they are adapters within the Next.js server process |
| Route Handlers → Supabase | Supabase JS server client | Service role key used server-side only; anon key used client-side |
| Client Components → Supabase Realtime | Supabase JS browser client channel subscription | Only for graph updates (nodes/edges); other client data via SWR/fetch |
| `lib/graph/merge.ts` → `lib/db/graph.ts` | Pure function receives Supabase client as parameter | Makes merge logic testable in isolation |
| `useAudioPipeline` → Recording UI | React state + callbacks | Hook owns recording state machine; components are declarative |
| Alien Hint → Quiz/Prompt/Review | Props: `sourceType`, `sourceId`, `currentLevel` | `AlienHintButton` is context-free; parent passes source context |

---

## Suggested Build Order

The following order respects technical dependencies and lets each phase be shippable and testable:

```
Phase 0: Repo audit + architecture finalization
    ↓
Phase 1: Next.js bootstrap + design system + route shells
    ↓
Phase 2: Supabase schema (all 12 tables) + typed data layer + seed data
    ↓         (graph rendering needs seed data to develop against)
Phase 3: Galaxy Home — ForceGraph2D + node visuals + filters + panels
    ↓         (graph component needed before live graph updates make sense)
Phase 4: Live Recording Pipeline — MediaRecorder + chunk upload + transcript UI (mock transcription OK)
    ↓         (pipeline structure needed before extraction can wire in)
Phase 5: Concept Extraction + Graph Update Engine — extraction provider + merge logic + Realtime updates
    ↓         (extraction depends on transcript chunks existing)
Phase 6: Live Active-Learning Prompts — prompt generation cadence + PromptCard UI
    ↓         (prompts need concepts to exist for grounding)
Phase 7: Alien Hint System — hint generation + 3-level UI + hint tracking
    ↓         (hints needed by quiz and review; build once, wire in to 3 surfaces)
Phase 8: Post-Recording Quiz — quiz generation + QuizCard + mastery update
    ↓         (quiz needs hint system already built)
Phase 9: Node Detail + Transcript Cross-Linking — node→chunk→timestamp navigation
    ↓         (needs complete data model from all prior phases)
Phase 10: Review Mode + Mastery System — weak nodes, by-cluster, tour weak spots
    ↓         (needs mastery data from quiz/review events)
Phase 11: Quality, Security, SEO, Deploy
```

**Critical dependency chain:** Database schema (Phase 2) → Graph rendering (Phase 3) → Audio pipeline (Phase 4) → Extraction engine (Phase 5). Phases 1–5 are strictly sequential. Phases 6–10 have some parallelism potential but are safest sequential given the Alien Hint system being shared across surfaces.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| OpenAI Whisper (transcription) | Server-side adapter in `lib/providers/transcription/openai.ts` | Audio blob sent as `multipart/form-data`; never exposed client-side |
| OpenAI GPT-4o (extraction, hints, quiz, prompts) | Server-side adapter in `lib/providers/ai/openai.ts` | Single provider handles all generation; system prompt varies per use case |
| Supabase Postgres | `lib/db/` query functions using Supabase JS server client | Service role key for server; anon key for client Realtime subscriptions only |
| Supabase Realtime | Browser client in Client Components; `useGraphRealtime` hook | Subscribes to `knowledge_nodes` and `knowledge_edges` INSERT events |
| Vercel (deployment) | Environment variables for all provider keys; no code changes needed | `TRANSCRIPTION_PROVIDER`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

### Internal Module Boundaries

| Boundary | Communication | Constraint |
|----------|---------------|------------|
| Route Handlers ↔ Provider Interfaces | Direct call | Route Handler must never call Supabase directly — always via `lib/db/` |
| `lib/graph/merge.ts` ↔ `lib/db/graph.ts` | Function call with injected client | merge.ts is pure logic; db.ts handles persistence |
| `useAudioPipeline` ↔ `/api/recording/chunk` | `fetch` POST | Hook does NOT parse transcript — server handles all AI pipeline |
| Components ↔ `lib/db/` | Never directly — always via Server Components or Route Handlers | Client Components use SWR/React Query to call Route Handlers |

---

## Anti-Patterns

### Anti-Pattern 1: Calling AI providers from Client Components

**What people do:** Import OpenAI SDK in a React component and call the API directly.
**Why it's wrong:** Exposes API keys in the browser bundle. No provider swappability. No request validation. OWASP A02 violation.
**Do this instead:** All AI calls go through Route Handlers in `app/api/`. Client Components call your own API, never external AI services directly.

### Anti-Pattern 2: Putting Business Logic in Route Handlers

**What people do:** Write node merge logic, mastery scoring, or edge reinforcement directly inside a Route Handler file.
**Why it's wrong:** Untestable. Grows to 500+ line route files. Cannot reuse logic across routes.
**Do this instead:** Route Handlers are thin — validate input, call `lib/` service functions, return response. All logic lives in `lib/graph/`, `lib/db/`, `lib/providers/`.

### Anti-Pattern 3: Allowing Duplicate Nodes via Race Conditions

**What people do:** INSERT a node if no exact match found, without handling concurrent inserts from rapid chunk processing.
**Why it's wrong:** Two chunks processed in parallel can both decide the node does not exist and both INSERT, producing duplicates.
**Do this instead:** Use Postgres `INSERT ... ON CONFLICT (canonical_label) DO UPDATE SET mention_count = mention_count + 1` on `knowledge_nodes`. The `canonical_label` column gets a UNIQUE constraint.

### Anti-Pattern 4: Real-Time Updates via Polling

**What people do:** `setInterval(() => fetchGraphData(), 2000)` in the Galaxy Home component.
**Why it's wrong:** Hammers the database on every poll interval. Creates unnecessary load. Causes janky re-renders when nothing changed.
**Do this instead:** Supabase Realtime subscription — updates fire only when data actually changes. Zero overhead when idle.

### Anti-Pattern 5: Single AI Context for All Use Cases

**What people do:** Create one generic AIProvider with a single `generate(prompt: string): Promise<string>` signature.
**Why it's wrong:** No type safety on outputs. Hints, quiz questions, and extraction results have completely different shapes. Impossible to validate responses.
**Do this instead:** Separate typed interfaces: `ExtractionProvider` returns structured `{ concepts[], relations[] }`, `AIProvider` has distinct methods `generateHint()`, `generateQuiz()`, `generatePrompt()` each with typed return values.

---

## Scaling Considerations

This is a single-user app. Scaling is not a primary concern. The relevant concern is graph rendering performance as the knowledge graph grows over a semester.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 nodes | Default ForceGraph2D renders all nodes — no optimization needed |
| 500–2000 nodes | Enable ForceGraph2D's `warmupTicks` + `cooldownTicks`; filter to show strongest edges only (edge weight threshold); lazy-load node details on hover |
| 2000+ nodes | Cluster-level rendering: render cluster centroids by default, expand cluster on click; consider paginated graph queries filtered by date range or course tag |

### Scaling Priorities

1. **First bottleneck:** Graph rendering with 1000+ nodes. Fix: edge weight threshold filter in query (only return edges with `weight > N`), already supported by graph rules in MASTER_PLAN.md.
2. **Second bottleneck:** Transcript chunk processing latency if AI provider is slow. Fix: queue chunk processing (simple in-memory queue or Supabase Edge Function); user-facing transcript display is decoupled from extraction completion.

---

## Sources

- [react-force-graph GitHub (vasturiano)](https://github.com/vasturiano/react-force-graph) — canvas/WebGL 2D graph, performant with hundreds of nodes, supports custom node rendering for glow/pulse effects
- [Supabase Realtime with Next.js official docs](https://supabase.com/docs/guides/realtime/realtime-with-nextjs) — dual client pattern (server vs. browser), postgres_changes subscription
- [Building Real-time Magic: Supabase Subscriptions in Next.js 15](https://dev.to/lra8dev/building-real-time-magic-supabase-subscriptions-in-nextjs-15-2kmp) — confirmed pattern for App Router
- [Real-Time Voice Transcription with Next.js](https://medium.com/@shanur.cse.nitap/you-cant-handle-real-time-voice-transcription-with-next-js-can-you-80221aa5595e) — MediaRecorder chunking + Next.js Route Handler pattern
- [Build AI Speech to Text with OpenAI Whisper + Next.js App Router](https://medium.com/@muhammadarifineffendi/build-an-ai-speech-to-text-app-with-openai-whisper-next-js-app-router-part-2-992f49700472) — Whisper integration patterns
- [SSE in Next.js App Router (2025 patterns)](https://dev.to/richardlau/implementing-real-time-status-updates-with-server-sent-events-in-nextjs-4da1) — alternative to Realtime for server-push if needed
- [From LLMs to Knowledge Graphs: Production-Ready Systems](https://medium.com/@claudiubranzan/from-llms-to-knowledge-graphs-building-production-ready-graph-systems-in-2025-2b4aff1ec99a) — node deduplication and edge reinforcement patterns
- [InstaGraph: Text to Knowledge Graph Pipeline](https://www.blog.brightcoding.dev/2026/03/09/instagraph-transform-text-into-stunning-knowledge-graphs) — three-stage pipeline: preprocess → LLM extraction → graph rendering

---

*Architecture research for: Galaxy of Knowledge (audio-to-knowledge-graph learning app)*
*Researched: 2026-03-10*
