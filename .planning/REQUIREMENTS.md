# Requirements: Galaxy of Knowledge

**Defined:** 2026-03-10
**Core Value:** The knowledge galaxy must feel alive — recording a lecture should visibly grow the user's constellation of understanding, making learning tangible and explorable.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Audio & Transcription

- [ ] **AUD-01**: User can start, pause, and stop audio recording from browser microphone
- [ ] **AUD-02**: User sees a session timer while recording
- [ ] **AUD-03**: User sees live transcript updating in near real time during recording
- [ ] **AUD-04**: User sees timestamps alongside transcript chunks
- [ ] **AUD-05**: User can mark moments as important, confused, review-later, or bookmark during recording
- [ ] **AUD-06**: Recording session (transcript, metadata, marks) persists after stopping

### Knowledge Graph

- [ ] **GRAPH-01**: User sees a full-screen interactive 2D knowledge graph on Galaxy Home
- [ ] **GRAPH-02**: User can zoom, pan, hover, and click nodes in the graph
- [ ] **GRAPH-03**: User can search nodes by label
- [ ] **GRAPH-04**: User can filter graph by node type, mastery state, and date
- [ ] **GRAPH-05**: Graph updates in real time as new concepts are extracted during recording
- [ ] **GRAPH-06**: Near-duplicate concepts merge automatically via semantic similarity
- [ ] **GRAPH-07**: Nodes display visual mastery states: new (soft animate-in), seen, shaky (subtle pulse), strong (bright glow)
- [ ] **GRAPH-08**: Stronger edges are displayed first to avoid visual clutter
- [ ] **GRAPH-09**: Side panels show recent recordings, weak concepts, and new nodes

### Concept Extraction

- [ ] **EXT-01**: System extracts concepts, definitions, examples, formulas, comparisons, and unresolved questions from transcript chunks
- [ ] **EXT-02**: System creates typed edges between related concepts (similar_to, defines, contrasts_with, prerequisite_for, etc.)
- [ ] **EXT-03**: Repeated mentions reinforce existing nodes and edges (increase weight/count)
- [ ] **EXT-04**: Each node links back to source transcript chunks with quote excerpts and timestamps

### Active Learning

- [ ] **LEARN-01**: User receives a lightweight prompt every 3-6 minutes during recording or at topic shifts
- [ ] **LEARN-02**: Prompts are grounded in recently extracted concepts, not just raw text
- [ ] **LEARN-03**: Prompt types include: concept recall, definition ID, connection choice, confidence check, one-sentence summary
- [ ] **LEARN-04**: User can answer, dismiss, or snooze live prompts
- [ ] **LEARN-05**: Prompt answers and confidence ratings are persisted

### Post-Recording Quiz

- [ ] **QUIZ-01**: System generates a 5-10 question quiz after recording ends
- [ ] **QUIZ-02**: Quiz questions are grounded only in the just-finished session's content
- [ ] **QUIZ-03**: Quiz prioritizes important, confused, or flagged concepts
- [ ] **QUIZ-04**: Quiz types include: recall, relation matching, definition recognition, example ID, comparison
- [ ] **QUIZ-05**: On quiz completion, user sees score, weak concepts, and suggested review path
- [ ] **QUIZ-06**: Quiz results update node mastery scores and highlight weak nodes in galaxy

### Alien Hint System

- [ ] **HINT-01**: Alien Hint button appears on live prompt cards, quiz question cards, and node review screens
- [ ] **HINT-02**: Hints escalate through 3 levels: cryptic clue, directed nudge, stronger scaffold
- [ ] **HINT-03**: First hint does not reveal the direct answer
- [ ] **HINT-04**: Hints are grounded in lecture content, transcript context, and graph neighborhood
- [ ] **HINT-05**: Hint usage is tracked per question/node in the alien_hints table
- [ ] **HINT-06**: Hint UI uses subtle transmission aesthetic (elegant glow, not gimmicky)

### Node Detail & Cross-Linking

- [ ] **NODE-01**: Clicking a node shows meaning, related nodes, source recordings, timestamps, mastery, and quiz history
- [ ] **NODE-02**: User can jump from a node to the exact recording moment where it appeared
- [ ] **NODE-03**: Clicking transcript chunks highlights relevant nodes
- [ ] **NODE-04**: User marks are visible in both transcript and node views
- [ ] **NODE-05**: Node detail supports mini review action and Alien Hint

### Review & Mastery

- [ ] **REV-01**: Each node has a mastery state: new, seen, shaky, strong
- [ ] **REV-02**: Mastery updates based on quiz outcomes, review outcomes, and prompt answers
- [ ] **REV-03**: Review Mode supports: review weak nodes, by recording, by cluster, tour-my-weak-spots
- [ ] **REV-04**: Review paths follow related concepts through graph edges
- [ ] **REV-05**: Review flow integrates Alien Hints

### UI & Visual Identity

- [ ] **UI-01**: Dark, elegant galaxy/constellation theme across all pages
- [ ] **UI-02**: Liquid glass components from 21st.dev for panels, cards, and overlays
- [ ] **UI-03**: Shader-based galaxy/starfield background on Galaxy Home
- [ ] **UI-04**: Scroll animations on page transitions and section reveals
- [ ] **UI-05**: Living cosmos graph: nodes drift, pulse, glow, react to hover/click with physics and ripple effects
- [ ] **UI-06**: Adaptive effects: full visual intensity on Galaxy Home, toned down on functional pages
- [ ] **UI-07**: Accessible keyboard navigation and focus styles
- [ ] **UI-08**: Reduced-motion support for users who prefer it

### Pages & Navigation

- [ ] **NAV-01**: Galaxy Home page with full-screen graph, search, filters, side panels
- [ ] **NAV-02**: Live Recording page with controls, timer, transcript, concepts, mini graph, marks, prompt card
- [ ] **NAV-03**: Recording Review page with transcript, summary, graph slice, related nodes, quiz
- [ ] **NAV-04**: Node Detail page/panel with full node context
- [ ] **NAV-05**: Review Mode page with review flows and mastery-based navigation

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Audio
- **AUD-V2-01**: Support multiple audio input sources
- **AUD-V2-02**: Audio playback with transcript sync (karaoke-style highlighting)

### Enhanced Graph
- **GRAPH-V2-01**: 3D graph visualization option
- **GRAPH-V2-02**: Graph export/import
- **GRAPH-V2-03**: Course-level graph segmentation

### Enhanced Learning
- **LEARN-V2-01**: Spaced repetition scheduling for review sessions
- **LEARN-V2-02**: Custom quiz generation on demand

## Out of Scope

| Feature | Reason |
|---------|--------|
| Authentication / multi-user | Single-user app — no auth complexity needed |
| Teams / sharing / collaboration | Explicitly excluded — derailed Roam Research's roadmap |
| 3D graph for v1 | Performance collapses at 200+ nodes; 2D is sufficient |
| Mobile native app | Web-first; mobile later |
| Video recording | Audio-only for v1; video adds storage/processing complexity |
| Full Anki-style SRS queue | Creates "review debt guilt" that causes abandonment |
| Real-time collaboration | No multi-user features |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| (Populated by roadmap) | | |

**Coverage:**
- v1 requirements: 44 total
- Mapped to phases: 0
- Unmapped: 44

---
*Requirements defined: 2026-03-10*
*Last updated: 2026-03-10 after initial definition*
