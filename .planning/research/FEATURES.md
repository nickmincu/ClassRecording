# Feature Research

**Domain:** Knowledge-graph learning app with lecture capture, live transcription, concept extraction, spaced repetition, and active learning
**Researched:** 2026-03-10
**Confidence:** HIGH (cross-referenced against Otter.ai, Obsidian, Roam Research, RemNote, Anki, FSRS literature, and CLARE academic research)

---

## Market Context

The combination of live transcription + knowledge graph + spaced repetition in a single product does not yet exist as a polished, unified consumer tool. The market is fragmented:

- **Otter.ai / Fireflies** — transcription, summaries, speaker detection. No graph, no SRS.
- **Obsidian / Roam Research** — manual bi-directional linking, graph view, no transcription, no SRS built-in.
- **RemNote** — knowledge graph + SRS hybrid (the closest prior art), but no live transcription.
- **HyNote** — audio recording + transcription + quizzes, but minimal graph / organization (user complaints about zero organization capability).
- **Anki / SuperMemo** — best-in-class SRS, but fully manual card creation. No capture.
- **Tana** — voice capture + knowledge graph, but no SRS and no live active-learning prompts.

**Key gap confirmed:** No product automatically grows a knowledge graph from lecture audio while running live retrieval-practice prompts and mastery tracking with a spaced-repetition backbone. This is the Galaxy of Knowledge's differentiating territory.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume will exist. Missing these = product feels broken or incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Browser audio recording (start/pause/stop) | Every lecture-capture tool offers this; Otter.ai sets user expectation | LOW | Use MediaRecorder API — well-documented, chunks every 250ms. WebM/Opus codec is standard. |
| Live/rolling transcript display | Otter.ai established this as baseline; users refuse to wait until recording ends | MEDIUM | Stream chunks to backend, display partial results. Latency under 5s is acceptable. |
| Session-level summary after recording | Any AI note-taker (Otter, Notion AI) produces this; users expect "what was this about" | MEDIUM | Generate from full transcript post-recording. Short structured summary + key points. |
| Recording list / history | Users need to navigate past sessions; without this, data feels lost | LOW | Simple list view ordered by date. Title, duration, timestamp. |
| Search across transcripts and nodes | Obsidian and Roam users rely on fast search heavily; Otter.ai has full-text search | MEDIUM | Full-text across nodes and transcripts. Filter by type and date. |
| Timestamp-linked transcript | Otter.ai's core feature — clicking text jumps to that moment. Users expect this. | MEDIUM | Store chunk offsets in ms. Link UI events to offset markers. |
| Node/concept click to detail | Graph tools (Obsidian, Roam) train users to click nodes for information | LOW | Node Detail page with meaning, sources, timestamp links. |
| Mastery state per concept (4 levels) | RemNote and Anki users expect visual cues: new/seen/shaky/strong | MEDIUM | Track via quiz outcomes and review events. Simple state machine. |
| Post-recording quiz | Quizlet and RemNote users expect auto-generated review material from content | HIGH | Generate 5–10 questions grounded only in session content. Session-specific. |
| Graph visualization (zoom, pan, click) | Obsidian / Roam set user expectation for interactive graph. Static = unacceptable. | HIGH | Force-directed 2D graph. D3-force or react-force-graph. Must handle 100+ nodes. |
| User marks during recording (important, confused, review-later) | Otter.ai has "action items" and speaker marks; users annotate during capture | LOW | Four mark types stored with timestamp and optional note. |
| Weak concepts surfaced after quiz | Quizlet and RemNote show which material is underperforming; users rely on this | MEDIUM | Filter nodes by mastery state. Post-quiz highlights weak nodes in graph. |
| Keyboard accessibility | WCAG 2.1 compliance expected on any modern web app | MEDIUM | Focus traps, skip links, proper ARIA roles. Critical for recording flow. |

### Differentiators (Competitive Advantage)

Features that set Galaxy of Knowledge apart. Not universally expected, but high value once experienced.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Live knowledge graph that grows during recording | No competitor builds the graph in real time as lecture progresses. RemNote builds it post-hoc from manual notes. This makes learning tangibly visible as it happens. | HIGH | Concept extraction pipeline must run per chunk. Nodes animate in softly. Requires deduplication logic. |
| Live active-learning prompts during recording (every 3–6 min or at topic shift) | Research-backed: retrieval practice during learning (not just after) measurably outperforms passive note-taking. No lecture-capture tool does this. Otter just transcribes. | HIGH | Prompt generation on topic-shift detection or timer cadence. 5 prompt types. Low-friction answer interaction. |
| Alien Hint system (3 escalating levels grounded in transcript) | The "hint" metaphor in a sci-fi framing makes it memorable and reduces anxiety. More importantly, progressive scaffolding (cryptic → nudge → scaffold) is grounded in learning science — prevents answer-reveal while still assisting. No competitor has this. | MEDIUM | Hint generation using current question + related graph context + source chunk. Cooldown between levels. |
| Concept extraction with deduplication and edge reinforcement | CLARE (academic system) and Graphusion show this is feasible but not productized for consumers. Automatically merging near-duplicate concepts and reinforcing existing edges is what prevents graph garbage-accumulation. Competitors don't do this. | HIGH | Normalize labels. Semantic similarity check before node creation. Edge weight grows with repeated co-occurrence. |
| Transcript-to-node and node-to-transcript cross-linking | Clicking a node shows every moment it was mentioned, with playable timestamps. Clicking a transcript chunk highlights its nodes. No consumer tool offers this bidirectional linking across audio, text, and graph simultaneously. | MEDIUM | node_mentions table cross-references chunk IDs and node IDs. UI supports both directions of navigation. |
| Session graph slice (just this recording vs. full galaxy) | Lets users understand what they learned today vs. their total knowledge. RemNote and Obsidian only show the full graph. Seeing a new recording "light up" new areas is motivating and novel. | MEDIUM | Filter graph by session ID. Highlight new vs. reinforced nodes with different visual treatment. |
| Review Mode: "Tour my weak spots" | Guided review path through weak nodes in dependency order. Anki shows a queue of flashcards; this navigates the knowledge graph as a path. Qualitatively different and more contextual. | HIGH | Requires graph-aware traversal. Identify low-mastery nodes, compute a traversal path using edges, walk the user through it. |
| Galaxy visual identity — glowing/pulsing nodes by mastery strength | Turns abstract mastery data into a visually compelling, emotionally resonant experience. Stronger concepts glow brighter. Weak concepts pulse. The galaxy literally dims where you're vulnerable. No competitor has this aesthetic. | MEDIUM | CSS/WebGL node rendering tied to mastery_score. Animation intensity scales with visual_weight field. |
| Confidence rating on live prompts | Users can flag "I got it right but I'm not sure why" — a metacognitive signal absent from most SRS tools. Only SuperMemo v18+ tracks confidence separately. | LOW | confidence_rating field on live_prompts. Use 1–3 scale. Feed into mastery alongside correctness. |
| User marks visible in both transcript and graph | "Confused" marks become pending review triggers. "Important" marks boost node visual weight. Marks bridge the capture context with the review context. No tool does this cross-linking of annotation and knowledge structure. | MEDIUM | user_marks linked to transcript chunks and surfaced on node detail and review mode. |

### Anti-Features (Deliberately Out of Scope)

Features that seem appealing but would harm the product.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| 3D knowledge graph | Looks impressive, "cooler" than 2D | Terrible navigation UX at scale. Performance collapses above ~200 nodes in WebGL 3D. Users get lost without spatial anchors. Three.js 3D graphs feel like a toy, not a tool. | Stick with 2D force-directed. Use glow intensity, node size, and cluster color to convey the same dimensional richness visually. |
| Sharing / collaboration / export to others | Multi-user apps feel more complete | Adds auth complexity, multi-tenant data isolation, permissions, and real-time sync. This is a personal learning tool — collaboration is scope creep at v1. Roam Research's early collaboration features caused years of engineering debt. | Single-user, local-first. If sharing is ever needed, export to PDF/Markdown in a future version. |
| Authentication / login / multi-user | "What if I want to log in from another device?" | Auth adds OWASP attack surface, OAuth flows, session handling, and user table complexity. Single-user with no auth is the explicit scope decision in PROJECT.md. | Data stays in a single Supabase project. If cross-device is needed, Supabase local connection or a simple secret key can be added later without full auth infrastructure. |
| Video recording / screen capture | Video lectures exist; users want to capture them | Browser screen capture adds complexity (permissions, larger storage, video processing pipeline). Audio alone captures 95% of semantic content from a lecture. | Audio-only for v1. Transcription quality is equivalent. Video adds storage and pipeline cost with minimal learning benefit. |
| Automatic flashcard scheduling (full SRS like Anki) | RemNote does this; it seems like the "right" SRS approach | A fully scheduled SRS queue creates obligation — users feel guilt when they miss review days (Anki deck guilt is well-documented). This app's mastery model should drive graph-based review suggestions, not a due-queue. | Use mastery states (new/seen/shaky/strong) to surface weak nodes in Review Mode. The "tour my weak spots" flow serves the same retention goal without creating a review debt counter. |
| Real-time collaborative transcription | "What if classmates share the same recording?" | Makes the architecture multi-tenant. Introduces WebSocket fan-out, conflict resolution on graph merges, and data ownership questions. Outside stated scope. | Single-user, but the architecture does not prevent adding this in v2 if the provider interface supports it. |
| Social features (share notes, public profiles) | Network effects seem valuable | Violates the personal learning privacy model. Lecture content is often sensitive (student information, draft thinking). Social features also delay shipping the core product by months. | Defer entirely. The product has zero social features at v1. |
| Automatic dark/light mode toggle | Users often expect theming options | The galaxy aesthetic is intrinsically dark. A light mode would require a full alternative design pass and is low-value for the target use case (studying in a dark environment). | Dark-only for v1 with system preference respected for reduced-motion only. |
| Import from other tools (Obsidian, Notion, Roam) | Power users want to migrate existing notes | Import pipelines require handling every edge case of each tool's markdown/format. This is a support burden and not core to the recording-first value proposition. | Build the recording pipeline well. Users will adopt it for new material first. Migration can be a future feature. |

---

## Feature Dependencies

```
[Browser Audio Recording]
    └──required by──> [Live Transcript Display]
                          └──required by──> [Concept Extraction Pipeline]
                                                └──required by──> [Knowledge Graph Update]
                                                                      └──required by──> [Live Active-Learning Prompts]
                                                                                            └──required by──> [Alien Hint System]

[Knowledge Graph Update]
    └──required by──> [Post-Recording Quiz]
                          └──required by──> [Mastery Scoring]
                                                └──required by──> [Review Mode: Tour Weak Spots]

[Mastery Scoring]
    └──enhances──> [Galaxy Visual Identity] (glow/pulse intensity tied to mastery_score)

[Transcript Chunks with Timestamps]
    └──required by──> [Timestamp-Linked Transcript Navigation]
    └──required by──> [Alien Hint System] (hints grounded in source chunks)
    └──required by──> [Transcript-to-Node Cross-Linking]

[Node Mentions Table]
    └──required by──> [Transcript-to-Node Cross-Linking]
    └──required by──> [Node Detail Page] (source recordings + timestamps)

[User Marks During Recording]
    └──enhances──> [Node Detail Page] (marks visible on node)
    └──enhances──> [Review Mode] (confused marks trigger review priority)

[Session Graph Slice]
    └──enhances──> [Recording Review Page] (this session's graph vs. full galaxy)

[Post-Recording Quiz]
    └──conflicts-with──> [Full Anki-style SRS Queue] (different mastery model — graph-based vs. queue-based)
```

### Dependency Notes

- **Audio Recording requires Live Transcript:** The transcript pipeline is the foundation of every downstream feature. Nothing else works without it.
- **Concept Extraction requires Transcript Chunks:** Extraction runs per-chunk on cleaned text. The chunk schema (with offset timestamps) must exist before extraction can be built.
- **Knowledge Graph Update requires Concept Extraction:** The graph cannot grow without extracted entities and relations. These two systems (Phases 4 and 5 in MASTER_PLAN) are tightly coupled but should be implemented as separate concerns with a clean interface.
- **Live Prompts require Knowledge Graph:** Prompts are grounded in extracted concepts and their graph neighborhood — not just raw text. Prompts built on raw text alone miss the structural context that makes them useful.
- **Alien Hints require both Quiz/Prompt infrastructure AND source chunks:** The hint must reference the question, the correct answer's graph context, and the original lecture evidence. All three must be queryable together.
- **Mastery Scoring requires Quiz + Review Events:** Mastery state is computed from quiz outcomes, live prompt outcomes, and manual review events. The scoring model depends on all three data sources.
- **Tour Weak Spots requires graph traversal:** This feature cannot be implemented as a simple list — it requires edge-aware traversal to produce a meaningful learning path. The graph edge schema must be complete.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — proves the core thesis that "recording a lecture visibly grows your knowledge universe."

- [ ] Browser audio recording with start/pause/stop — core capture capability
- [ ] Live transcript display (rolling, chunked) — makes recording feel productive
- [ ] Concept extraction per chunk → knowledge nodes and edges — the core differentiator
- [ ] Knowledge graph that updates live during recording — makes learning tangibly visible
- [ ] Galaxy Home with full-screen interactive graph (zoom, pan, click, search) — the main "wow" surface
- [ ] Live active-learning prompt every 3–6 minutes — proves active learning during capture
- [ ] Alien Hint system (3 levels) on prompts — the branded differentiator
- [ ] Post-recording quiz (5–10 questions) with hints — closes the active-learning loop
- [ ] Mastery states (new/seen/shaky/strong) per node — makes graph meaningful over time
- [ ] Node Detail page (meaning, sources, timestamps, mastery, quiz history) — enables deep exploration
- [ ] Recording Review page (transcript, summary, session graph, quiz) — post-session workflow
- [ ] User marks during recording (important, confused, review-later, bookmark) — engagement during capture
- [ ] Review Mode with weak nodes and "tour my weak spots" — retention backbone

### Add After Validation (v1.x)

Features to add once the core is confirmed working and worth using.

- [ ] Cluster-based review (by topic group) — trigger: users request it after using by-recording review
- [ ] Node merge suggestions (when user sees near-duplicates) — trigger: graph accumulates garbage nodes after 10+ sessions
- [ ] Export session as Markdown or PDF — trigger: users request offline reference
- [ ] Course tags / workspace separation (multiple subjects) — trigger: users use it for more than one class

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Cross-device sync — requires revisiting the architecture (currently single Supabase project, no auth)
- [ ] Import from Obsidian / Roam / Notion — high effort, low priority until large user base
- [ ] Video recording — storage and processing cost; audio-only covers the v1 use case
- [ ] Custom SRS scheduling intervals — only needed if users outgrow the graph-based review model
- [ ] Graph sharing / read-only export — future social layer if product achieves traction

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Browser audio recording | HIGH | LOW | P1 |
| Live transcript display | HIGH | MEDIUM | P1 |
| Concept extraction pipeline | HIGH | HIGH | P1 |
| Knowledge graph (live update) | HIGH | HIGH | P1 |
| Galaxy Home interactive graph | HIGH | HIGH | P1 |
| Live active-learning prompts | HIGH | HIGH | P1 |
| Post-recording quiz | HIGH | HIGH | P1 |
| Alien Hint system | HIGH | MEDIUM | P1 |
| Mastery states per node | HIGH | MEDIUM | P1 |
| Node Detail page | HIGH | MEDIUM | P1 |
| Recording Review page | HIGH | MEDIUM | P1 |
| User marks during recording | MEDIUM | LOW | P1 |
| Review Mode (weak nodes + tour) | HIGH | HIGH | P1 |
| Timestamp-linked navigation | MEDIUM | MEDIUM | P1 |
| Session graph slice view | MEDIUM | MEDIUM | P2 |
| Confidence rating on prompts | MEDIUM | LOW | P2 |
| Cluster-based review | MEDIUM | HIGH | P2 |
| Course tags / workspace separation | MEDIUM | MEDIUM | P2 |
| Node merge suggestions (UX) | LOW | MEDIUM | P3 |
| Export to Markdown/PDF | LOW | LOW | P3 |

---

## Competitor Feature Analysis

| Feature | Otter.ai | RemNote | Obsidian | Galaxy of Knowledge |
|---------|----------|---------|----------|---------------------|
| Live audio transcription | YES — core product | NO — manual notes only | NO | YES — core pipeline |
| Knowledge graph | NO | YES — from manual notes | YES — from manual links | YES — auto-built from transcript |
| Spaced repetition | NO | YES — FSRS built-in | Via plugins only | PARTIAL — mastery states + graph-based review (not full SRS queue) |
| Live prompts during recording | NO | NO | NO | YES — differentiator |
| Concept auto-extraction | NO (only summary) | NO (manual) | NO (manual) | YES — differentiator |
| Hint system | NO | NO | NO | YES — differentiator |
| Timestamp-node cross-linking | PARTIAL (jump to time) | NO | NO | YES — bidirectional |
| Mastery tracking per concept | NO | YES | Via plugins | YES |
| Session graph slice | NO | NO | NO | YES |
| Tour my weak spots | NO | NO | NO | YES |
| Galaxy/constellation aesthetic | NO | NO | NO | YES — core visual identity |
| Single-user, no auth | NO (requires account) | NO (requires account) | YES (local) | YES |

---

## Sources

- [Otter.ai Review 2025 — bluedothq](https://www.bluedothq.com/blog/otter-ai-review)
- [Otter.ai Features](https://otter.ai/features)
- [RemNote Help Center — vs Anki/SuperMemo](https://help.remnote.com/en/articles/6025618-remnote-vs-anki-supermemo-and-other-spaced-repetition-tools)
- [RemNote Help Center — FSRS Algorithm](https://help.remnote.com/en/articles/9124137-the-fsrs-spaced-repetition-scheduler)
- [Obsidian Forum — Personal Knowledge Graphs](https://forum.obsidian.md/t/personal-knowledge-graphs/69264)
- [Personal Knowledge Graphs in Obsidian — Medium](https://volodymyrpavlyshyn.medium.com/personal-knowledge-graphs-in-obsidian-528a0f4584b9)
- [Roam Research Review — toolfinder.co](https://toolfinder.co/tools/roam-research)
- [FSRS Algorithm — domenic.me](https://domenic.me/fsrs/)
- [CLARE: Context-Aware Knowledge Graph Construction from Transcripts — MDPI](https://www.mdpi.com/2078-2489/16/10/866)
- [Active Learning at Scale — IES](https://ies.ed.gov/use-work/awards/active-learning-scale-transforming-teaching-and-learning-large-scale-learning-science-and-generative)
- [Best Spaced Repetition Apps 2025 — notionist.app](https://notionist.app/best-spaced-repetition-app)
- [Top Graph-Based Knowledge Management Tools 2025 — knowing.app](https://blog.knowing.app/posts/top-graph-based-knowledge-management-tools-2025/)
- [Build a Real-Time Transcription App with React and Deepgram](https://deepgram.com/learn/build-a-real-time-transcription-app-with-react-and-deepgram)
- [MediaStream Recording API — MDN](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream_Recording_API/Using_the_MediaStream_Recording_API)

---

*Feature research for: Knowledge-graph learning app with lecture capture and active learning*
*Researched: 2026-03-10*
