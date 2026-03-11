# Roadmap: Galaxy of Knowledge

## Overview

Six phases take the project from bare repository to deployed, quality-verified product. The first phase lays the app skeleton and design system. The second builds the product's defining surface — the living knowledge galaxy. The third wires in the full audio-to-graph pipeline so lectures actually populate the galaxy. The fourth adds the active-learning layer (prompts, hints, quiz) that turns passive attendance into retrieval practice. The fifth completes knowledge navigation with node detail and review mode. The sixth hardens the system for production. Phases 1-5 are strictly sequential; each depends on the data and architecture established by its predecessor.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - App scaffold, design system, Supabase schema, provider interfaces, and seed data
- [ ] **Phase 2: Galaxy Home** - Full-screen interactive 2D knowledge graph with living cosmos visuals, search, filters, and side panels
- [ ] **Phase 3: Recording Pipeline** - Browser audio capture, real-time transcription, concept extraction, and live graph updates
- [ ] **Phase 4: Active Learning** - Live prompts during recording, Alien Hint system, and post-recording quiz with mastery seeding
- [ ] **Phase 5: Knowledge Navigation** - Node detail page, bidirectional transcript cross-linking, review mode, and mastery system
- [ ] **Phase 6: Quality and Deploy** - Playwright E2E suite, security audit, Core Web Vitals, and production deploy

## Phase Details

### Phase 1: Foundation
**Goal**: A running Next.js app with galaxy design system, all route shells, complete Supabase schema, typed data layer, provider interfaces, and realistic seed data — everything downstream phases build into
**Depends on**: Nothing (first phase)
**Requirements**: UI-01, UI-02, UI-04, UI-07, UI-08
**Success Criteria** (what must be TRUE):
  1. All five routes load without errors: `/`, `/recording`, `/recordings/[id]`, `/nodes/[id]`, `/review`
  2. Galaxy dark theme tokens (colors, spacing, motion, radii) apply consistently across all pages
  3. Liquid glass panels and scroll animations render using 21st.dev Magic components
  4. Keyboard navigation and focus styles work on all interactive elements
  5. Reduced-motion media query disables animations site-wide when enabled
**Plans**: TBD

### Phase 2: Galaxy Home
**Goal**: Users can explore their full knowledge galaxy — an interactive, living 2D graph at `/` with glow/pulse mastery visuals, search, filters, WebGL starfield, side panels, and Supabase Realtime subscription stub ready for Phase 3
**Depends on**: Phase 1
**Requirements**: GRAPH-01, GRAPH-02, GRAPH-03, GRAPH-04, GRAPH-05, GRAPH-06, GRAPH-07, GRAPH-08, GRAPH-09, UI-03, UI-05, UI-06, NAV-01
**Success Criteria** (what must be TRUE):
  1. User sees a full-screen force-directed 2D graph with seed data nodes; can zoom, pan, hover, and click nodes without layout thrash
  2. Nodes display mastery states visually: new concepts animate in softly, shaky concepts pulse, strong concepts glow brighter
  3. User can search by label and filter by node type, mastery state, and date to isolate graph subsets
  4. Side panels show recent recordings, weak concepts, and newest nodes from seed data
  5. WebGL starfield background renders on Galaxy Home only; graph adapts visual intensity (full effects here, toned down on functional pages)
**Plans**: TBD

### Phase 3: Recording Pipeline
**Goal**: Users can record a class lecture and watch the knowledge galaxy grow in real time — audio captured in the browser, transcribed, concepts extracted, nodes and edges created, and the galaxy updated live via Supabase Realtime
**Depends on**: Phase 2
**Requirements**: AUD-01, AUD-02, AUD-03, AUD-04, AUD-05, AUD-06, EXT-01, EXT-02, EXT-03, EXT-04, NAV-02
**Success Criteria** (what must be TRUE):
  1. User can start, pause, and stop audio recording; session timer runs throughout
  2. Live transcript updates in near real time with timestamps alongside each chunk
  3. User can mark moments as important, confused, review-later, or bookmark; marks persist after stopping
  4. Concepts, definitions, examples, formulas, and comparisons are extracted from transcript chunks and create or reinforce nodes — near-duplicate concepts merge automatically
  5. Galaxy Home graph visibly gains new nodes and edges within seconds of a concept appearing in the transcript
**Plans**: TBD

### Phase 4: Active Learning
**Goal**: Users are actively prompted to retrieve and reflect during and after recording — live lightweight prompts every 3-6 minutes, an Alien Hint system available on all learning surfaces, and a post-recording quiz that seeds mastery scores
**Depends on**: Phase 3
**Requirements**: LEARN-01, LEARN-02, LEARN-03, LEARN-04, LEARN-05, HINT-01, HINT-02, HINT-03, HINT-04, HINT-05, HINT-06, QUIZ-01, QUIZ-02, QUIZ-03, QUIZ-04, QUIZ-05, QUIZ-06, NAV-03
**Success Criteria** (what must be TRUE):
  1. A non-blocking prompt card appears during recording at 3-6 minute intervals or at topic shifts; user can answer, dismiss, or snooze without interrupting recording
  2. Alien Hint button is present on live prompt cards, quiz question cards, and node review screens; hints escalate through three levels without revealing the direct answer on the first level
  3. Hint UI uses the transmission aesthetic (elegant glow effect); hint usage is tracked per question in the alien_hints table
  4. Post-recording quiz generates 5-10 questions grounded in that session; prioritizes important and confused concepts
  5. Quiz completion shows score, highlights weak concepts in the galaxy, and updates node mastery scores
**Plans**: TBD

### Phase 5: Knowledge Navigation
**Goal**: Users can navigate from any learning surface to any related piece of knowledge — clicking nodes reveals full context, clicking transcript chunks highlights nodes, Review Mode guides targeted re-study through graph edges with mastery-based routing
**Depends on**: Phase 4
**Requirements**: NODE-01, NODE-02, NODE-03, NODE-04, NODE-05, REV-01, REV-02, REV-03, REV-04, REV-05, NAV-04, NAV-05
**Success Criteria** (what must be TRUE):
  1. Clicking a node shows its meaning, related nodes, source recordings with timestamps, mastery state, and quiz history
  2. User can jump from a node directly to the recording moment where it appeared; clicking transcript chunks highlights the corresponding nodes in the graph
  3. User marks are visible in both transcript view and node detail view
  4. Review Mode offers: review weak nodes, by recording, by cluster, and tour-my-weak-spots; paths follow graph edges through related concepts
  5. Mastery state (new/seen/shaky/strong) updates correctly after quiz outcomes, review outcomes, and prompt answers; Alien Hints are available in the review flow
**Plans**: TBD

### Phase 6: Quality and Deploy
**Goal**: The complete system passes Playwright E2E coverage of the full user flow, clears Trail of Bits security audit, meets Core Web Vitals thresholds, and is deployed to Vercel production
**Depends on**: Phase 5
**Requirements**: (none — hardening phase; validates delivery of all prior requirements)
**Success Criteria** (what must be TRUE):
  1. Playwright E2E suite covers the full flow: Galaxy Home -> Live Recording -> Prompt -> Hint -> Stop -> Quiz -> Hint -> Node Detail -> Review Mode — all tests pass
  2. Trail of Bits security audit (supply-chain-risk-auditor, insecure-defaults, static-analysis) raises no critical or high findings
  3. Core Web Vitals pass on Galaxy Home: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
  4. WebGL starfield has a graceful CSS fallback when WebGL is unavailable; shader does not cause frame drops on the recording page
  5. App is deployed to Vercel production; no API keys are in NEXT_PUBLIC_ vars or committed to the repo
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 0/TBD | Not started | - |
| 2. Galaxy Home | 0/TBD | Not started | - |
| 3. Recording Pipeline | 0/TBD | Not started | - |
| 4. Active Learning | 0/TBD | Not started | - |
| 5. Knowledge Navigation | 0/TBD | Not started | - |
| 6. Quality and Deploy | 0/TBD | Not started | - |
