# Galaxy of Knowledge

## What This Is

A single-user web app that records class audio, continuously transcribes it, extracts concepts in near real time, and grows a visual "galaxy of knowledge" graph as new information arrives. Includes live active-learning prompts during recording, post-recording quizzes, and an "Alien Hint" system that gives contextual clues grounded in lecture content. Built for one person to turn passive lectures into an active, explorable knowledge universe.

## Core Value

The knowledge galaxy must feel alive — recording a lecture should visibly grow the user's constellation of understanding, making learning tangible and explorable.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Record class audio from browser and stream/chunk to backend
- [ ] Continuously transcribe audio chunks in near real time
- [ ] Extract concepts, definitions, examples, rules, comparisons from transcript
- [ ] Build and update a 2D knowledge graph as new content arrives
- [ ] Galaxy Home page with full-screen interactive graph, search, filters, side panels
- [ ] Live Recording page with controls, transcript, extracted concepts, mini graph, user marks
- [ ] Live active-learning prompts every 3-6 minutes or at topic shifts
- [ ] Post-recording quiz (5-10 questions) grounded only in that session
- [ ] Alien Hint system with 3 hint levels on prompts, quiz, and review screens
- [ ] Node Detail page with meaning, sources, timestamps, mastery, quiz history
- [ ] Recording Review page with transcript, summary, graph slice, quiz
- [ ] Review Mode with weak nodes, by-recording, by-cluster, tour-my-weak-spots
- [ ] Mastery scoring per node (new, seen, shaky, strong) updated by quiz/review outcomes
- [ ] Cross-link transcript chunks, nodes, timestamps, and quiz results
- [ ] User marks during recording: important, confused, review later, bookmark timestamp

### Out of Scope

- Authentication / multi-user / teams / sharing — single-user only, no auth needed
- 3D graph — use performant 2D for MVP, avoid decorative clutter
- Real-time collaboration — no multi-user features
- Mobile app — web-first
- Video recording — audio only for v1

## Context

**Visual direction:**
- 21st.dev Magic MCP for component generation: liquid glass components, scroll animations, shaders
- Adaptive effects: full visual showcase on Galaxy Home and landing views, toned down on functional pages (recording, quiz, review)
- Dark, elegant galaxy/constellation aesthetic — premium feel with restrained but impactful motion

**Graph interaction:**
- Living cosmos: nodes glow, pulse, drift subtly — feels like looking at a real star map
- Interactive playground: nodes react to hover/click with physics, ripple effects, satisfying micro-interactions
- Stronger concepts glow more, weak concepts pulse subtly, new concepts animate in softly

**Alien Hint system:**
- Subtle transmission aesthetic — elegant glow effect, minimal theming
- Hints feel like a premium feature, not a gimmick
- 3 levels: cryptic clue, directed nudge, stronger scaffold
- Grounded in lecture content and graph context

**Technical environment:**
- Next.js App Router, TypeScript, Tailwind CSS
- Supabase for database (12 tables defined in MASTER_PLAN.md)
- Vercel for deployment
- AI/transcription providers behind interfaces for future swapping
- Playwright for testing
- 8 MCP servers configured for development tooling

**Prior work:**
- MASTER_PLAN.md contains full phased execution plan (Phase 0-11), data model, graph rules, active learning rules, page specs, and acceptance criteria
- Tooling infrastructure fully set up: ECC, GSD, Trail of Bits security, web quality skills, SEO skills, UI/UX Pro Max

## Constraints

- **Stack**: Next.js App Router + TypeScript + Tailwind CSS + Supabase + Vercel — specified in MASTER_PLAN.md
- **Single-user**: No auth, no multi-tenant, no sharing — keeps architecture simple
- **AI providers**: Must be behind interfaces so transcription/extraction/hint providers can be swapped later
- **Graph**: 2D only for MVP — must be performant with hundreds of nodes
- **Components**: Use 21st.dev Magic MCP for liquid glass, scroll animations, shader components
- **Security**: All dependencies audited, OWASP Top 10 checked, no committed secrets

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 21st.dev liquid glass + shaders for UI | User wants premium, modern visual feel beyond standard Tailwind | -- Pending |
| Adaptive visual intensity | Full effects on galaxy/landing, toned down on working pages | -- Pending |
| Living cosmos + interactive graph | Graph should feel alive and reactive, not static data viz | -- Pending |
| Subtle alien transmission style | Hints should feel elegant and premium, not gimmicky | -- Pending |
| 2D graph for MVP | Avoids complexity of 3D, keeps performance good with many nodes | -- Pending |
| Supabase as database | MCP available, managed Postgres, good DX for single-user app | -- Pending |

---
*Last updated: 2026-03-10 after initialization*
