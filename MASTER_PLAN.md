You are Claude Code working inside the ClassRecording repository.

Read and obey the repository directives in CLAUDE.md first, especially:
- run `npm test` after every change
- write tests alongside every feature in `tests/`
- never leave broken tests
- review all new dependencies with `npm audit`
- use Trail of Bits security skills for audits
- check OWASP Top 10 on all web-facing code
- use `gh` CLI for GitHub workflow
- use Context7 MCP for library documentation before coding

Project: Galaxy of Knowledge
Git repo: nickmincu/ClassRecording

Goal:
Build a single-user web app that records class audio, transcribes it continuously, extracts concepts in near real time, grows a visual "galaxy of knowledge" graph as new information comes in, asks lightweight active-learning questions during recording, gives a short quiz immediately after each recording, and includes an "Alien Hint" button that gives contextual hints like help from an alien source of knowledge.

This repo already has:
- Playwright test scripts and @playwright/mcp / @playwright/test in package.json
- MCP servers: Playwright, 21st.dev Magic, Google Stitch, Context7, Supabase, Vercel, Figma, Next Devtools
- ECC skills/agents/commands
- GSD workflow commands/agents
- Trail of Bits security skills
- web-quality skills
- Claude SEO skills
- UI/UX Pro Max skills

Use those tools by name throughout the project.

==================================================
MASTER EXECUTION RULES
==================================================

1. Before using any library or framework, use Context7 MCP to fetch the latest docs and examples.
2. Before installing any new dependency:
   - use `supply-chain-risk-auditor`
   - run `npm audit`
   - justify why the dependency is needed
3. Use GSD workflow for phase planning/execution/verification.
4. Use ECC planner/architect/code-reviewer/tdd-guide/e2e-runner/security-reviewer where appropriate.
5. Build in small vertical slices.
6. After each slice:
   - run `npm test`
   - fix failures immediately
   - summarize what changed
7. Use Playwright MCP for browser verification and screenshots.
8. Use web-quality skills before calling any phase complete.
9. Use Vercel MCP only after local flows pass.
10. Default to a clean, premium, dark, "galaxy of knowledge" aesthetic with restrained motion and clear usability.

==================================================
PRODUCT VISION
==================================================

The app is a personal learning universe.

Main idea:
- Each recording becomes part of a living galaxy.
- Concepts, definitions, examples, rules, comparisons, and unresolved questions become nodes.
- Similar ideas connect into constellations and clusters.
- The graph updates while the lecture is still happening.
- The system actively checks understanding during the session.
- After the session, the app quizzes the user specifically on that recording.
- The user can click any node to see what it is, how it connects, where it appeared, how well they know it, and where to review it.
- The user can ask for a hint from an "alien source of knowledge" via a themed hint button.

Single-user only:
- no auth
- no teams
- no collaboration
- no sharing
- no multi-tenant logic

==================================================
REQUIRED UX / PRODUCT FEATURES
==================================================

Core pages:
1. Galaxy Home
2. Live Recording
3. Recording Review
4. Node Detail
5. Review Mode

Main visual identity:
- dark, elegant, galaxy / constellation aesthetic
- glowing knowledge nodes
- clear clusters
- subtle motion only
- must remain highly usable, not decorative clutter

Required feature set:
- record audio from browser
- stream or chunk audio to backend
- continuously transcribe
- extract concepts and relationships from transcript chunks
- update knowledge graph in near real time
- generate lightweight live active-learning prompts every few minutes or at topic shifts
- generate a 5–10 question post-recording quiz based only on the finished recording
- track mastery per node
- show weak concepts in the galaxy
- cross-link transcript chunks, nodes, timestamps, and quiz results
- include "Alien Hint" system

Alien Hint system requirements:
- visible "Ask the Aliens" or "Alien Hint" button on:
  - live active-learning prompt cards
  - post-recording quiz questions
  - node review screens
- hint should not reveal the answer immediately
- hint levels:
  1. cryptic clue
  2. directed nudge
  3. stronger scaffold
- hints must be grounded in the actual lecture content / graph context
- track hint usage per question / node
- visually theme hints as transmissions/signals from an alien intelligence
- include a cooldown or progressive reveal to avoid replacing learning
- hints should improve learning, not just give answers

==================================================
DEFAULT TECHNICAL DIRECTION
==================================================

First, inspect the existing repo. If Next.js app structure does not already exist, bootstrap a modern app stack.

Preferred stack unless repo constraints strongly suggest otherwise:
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui if useful
- local-first single-user architecture
- Supabase as default database/backend because Supabase MCP is available
- keep AI/transcription/embedding providers behind interfaces so they can be swapped later
- deploy-ready for Vercel because Vercel MCP is available

Important:
- do not overengineer auth or multi-user infra
- do not default to a noisy 3D graph
- use a performant 2D graph for MVP
- if adding any dependency, justify it and audit it first

Use these MCP tools deliberately:
- Context7 MCP: library docs and implementation examples
- 21st.dev Magic MCP: generate reusable UI components
- Google Stitch MCP: high-level screen flows and page structures
- Figma MCP: only if a Figma file is available; use for extracting tokens/specs
- Playwright MCP: browser testing, screenshots, visual verification
- Supabase MCP: schema, migrations, queries, storage if needed
- Vercel MCP: deployment setup, env vars, logs
- Next.js Devtools MCP: route inspection, debugging, build errors

==================================================
PROPOSED DATA MODEL
==================================================

Use or adapt this schema:

recording_sessions
- id
- title
- started_at
- ended_at
- duration_seconds
- status
- raw_transcript
- cleaned_transcript
- summary_short
- summary_structured_json

transcript_chunks
- id
- recording_session_id
- chunk_index
- started_at_offset_ms
- ended_at_offset_ms
- raw_text
- cleaned_text
- topic_label
- confidence_score

knowledge_nodes
- id
- canonical_label
- display_label
- node_type
- description_short
- course_tag nullable
- first_seen_at
- last_seen_at
- mention_count
- mastery_score
- mastery_state
- visual_weight
- metadata_json

knowledge_edges
- id
- source_node_id
- target_node_id
- edge_type
- weight
- evidence_count
- first_created_at
- last_reinforced_at
- metadata_json

node_mentions
- id
- node_id
- recording_session_id
- transcript_chunk_id
- quote_excerpt
- started_at_offset_ms
- ended_at_offset_ms
- mention_type

live_prompts
- id
- recording_session_id
- transcript_chunk_id nullable
- prompt_type
- prompt_text
- options_json nullable
- correct_answer_json nullable
- shown_at
- answered_at nullable
- user_answer_json nullable
- correctness nullable
- confidence_rating nullable

session_quizzes
- id
- recording_session_id
- generated_at
- total_questions
- score_percent nullable
- result_summary_json

session_quiz_questions
- id
- session_quiz_id
- node_id nullable
- question_type
- question_text
- options_json nullable
- correct_answer_json
- explanation_text
- difficulty_level
- display_order

session_quiz_answers
- id
- question_id
- user_answer_json
- is_correct
- answered_at

user_marks
- id
- recording_session_id
- transcript_chunk_id nullable
- mark_type
- note_text nullable
- created_at

review_events
- id
- node_id
- source
- outcome
- confidence nullable
- created_at

alien_hints
- id
- source_type (`live_prompt`, `session_quiz`, `review_node`)
- source_id
- hint_level (`cryptic`, `nudge`, `scaffold`)
- hint_text
- grounded_context_json
- created_at
- used_at nullable

==================================================
GRAPH RULES
==================================================

Node types:
- recording
- concept
- definition
- example
- formula
- comparison
- unresolved_question

Edge types:
- similar_to
- same_session
- example_of
- defines
- contrasts_with
- prerequisite_for
- frequently_cooccurs_with
- part_of_cluster

Rules:
- do not create garbage duplicate nodes
- compare normalized labels + semantic similarity before creating a node
- reinforce existing nodes/edges when repeated
- stronger concepts glow more
- weak concepts pulse subtly
- new concepts animate in softly
- recent session nodes should be visually discoverable
- default graph should show strongest edges first to avoid clutter

==================================================
ACTIVE LEARNING RULES
==================================================

Live prompts:
- one lightweight question every 3–6 minutes or after strong topic shifts
- based on the recent transcript chunk(s)
- low-friction, answerable quickly
- types:
  - key concept recall
  - identify definition/example/rule
  - choose correct connection
  - confidence check
  - one-sentence summary

Post-recording quiz:
- 5–10 questions
- grounded only in the just-finished recording
- prioritize important/confused/flagged concepts
- include:
  - recall
  - relation matching
  - definition recognition
  - example identification
  - comparison
- on completion:
  - show score
  - show weak concepts
  - update mastery
  - highlight weak nodes in the galaxy
  - suggest review path

==================================================
PAGES TO BUILD
==================================================

1. Galaxy Home
- full-screen graph
- search
- filters by node type, mastery, date
- side panels for recent recordings, weak concepts, new nodes
- click node => node detail panel or page

2. Live Recording
- start / pause / stop recording
- session timer
- live transcript
- rolling extracted concepts
- mini live graph
- user marks: important, confused, review later, bookmark timestamp
- live active-learning prompt card
- Alien Hint button on prompt card

3. Recording Review
- transcript
- summary
- extracted concepts
- session graph slice
- related prior nodes
- quick quiz
- Alien Hint button on quiz questions

4. Node Detail
- node meaning
- related nodes
- source recordings and timestamps
- mastery status
- quiz history
- mini quiz / review action
- Alien Hint button

5. Review Mode
- review weak nodes
- review by recording
- review by cluster
- "tour my weak spots"
- hint-aware review flow

==================================================
PHASED EXECUTION PLAN
==================================================

PHASE 0 — REPO AUDIT AND EXECUTION PLAN
Use:
- Agents: planner, architect, gsd-project-researcher, gsd-codebase-mapper
- Commands: `/gsd:new-project`, `/gsd:map-codebase`, `/plan`
- Skills: frontend-patterns, api-design, strategic-compact, search-first

Actions:
1. Read CLAUDE.md and inspect repo structure.
2. Map current codebase and identify what is missing.
3. Use Context7 MCP for:
   - Next.js App Router
   - Tailwind
   - Supabase
   - graph visualization options
   - MediaRecorder/browser audio APIs
4. Propose final architecture and dependency list.
5. Before installing anything, run:
   - `supply-chain-risk-auditor`
   - `npm audit`

Deliverables:
- architecture summary
- dependency decision log
- folder/file plan
- testing plan
- security plan

Tests:
- none yet beyond baseline test sanity check if applicable

Security:
- audit all new dependencies
- ensure no secrets are hardcoded
- review OWASP implications of audio upload and API routes

PHASE 1 — APP BOOTSTRAP + DESIGN SYSTEM
Use:
- MCP: Context7, 21st.dev Magic, Google Stitch, Next Devtools
- Agents: architect, planner, code-reviewer
- Commands: `/gsd:plan-phase`, `/gsd:execute-phase`, `/checkpoint`
- Skills: ui-ux-pro-max, design-system, ui-styling, frontend-patterns, coding-standards

Actions:
1. Bootstrap app if missing:
   - Next.js App Router
   - TypeScript
   - Tailwind
2. Create core layout and route structure.
3. Use Stitch MCP to map screen flow to routes.
4. Use 21st.dev Magic MCP to generate polished reusable UI primitives where helpful.
5. Create design tokens:
   - colors
   - spacing
   - radii
   - shadows
   - motion
6. Establish "galaxy of knowledge" visual language.
7. Add reduced-motion support and clear focus styles.

Required routes:
- `/`
- `/recording`
- `/recordings/[id]`
- `/nodes/[id]`
- `/review`

Tests to write:
- homepage route loads
- major nav flows exist
- critical page shells render

Security:
- review new UI dependencies
- run insecure-defaults on config and env handling

After implementation:
- run `npm test`

PHASE 2 — DATABASE + DATA MODEL
Use:
- MCP: Supabase, Context7
- Agents: architect, database-reviewer, code-reviewer
- Commands: `/gsd:plan-phase`, `/gsd:execute-phase`, `/verify`
- Skills: api-design, backend-patterns, postgres-patterns, database-migrations

Actions:
1. Create schema for all core tables:
   - recording_sessions
   - transcript_chunks
   - knowledge_nodes
   - knowledge_edges
   - node_mentions
   - live_prompts
   - session_quizzes
   - session_quiz_questions
   - session_quiz_answers
   - user_marks
   - review_events
   - alien_hints
2. Keep schema single-user and simple.
3. Add typed data access layer.
4. Seed mock data for graph exploration before real audio pipeline is complete.

Tests to write:
- seeded data displays correctly in UI
- graph data fetch path works
- node detail queries work
- recording review page can load seeded session

Security:
- review DB access patterns
- use entry-point-analyzer on API/data routes
- confirm no unsafe write paths

After implementation:
- run `npm test`

PHASE 3 — GALAXY HOME
Use:
- MCP: 21st.dev Magic, Stitch, Playwright, Next Devtools, Context7
- Agents: architect, e2e-runner, code-reviewer
- Commands: `/gsd:execute-phase`, `/e2e`, `/verify`
- Skills: frontend-patterns, ui-ux-pro-max, performance, core-web-vitals, accessibility

Actions:
1. Implement the main graph page.
2. Choose a performant 2D graph library after checking Context7 docs.
3. Support:
   - zoom
   - pan
   - hover
   - click
   - filters
   - search
4. Add side panels:
   - recent recordings
   - weak concepts
   - new nodes
5. Build node state visuals:
   - new
   - seen
   - shaky
   - strong

Tests to write:
- graph page renders
- node click opens detail
- filters affect graph
- search finds nodes
- weak concepts panel works

Security:
- review client-side data exposure
- differential-review on graph-related changes

Quality:
- use Playwright MCP for screenshots and interaction checks
- run web-quality-audit, accessibility, performance, core-web-vitals

After implementation:
- run `npm test`

PHASE 4 — LIVE RECORDING PIPELINE
Use:
- MCP: Context7, Next Devtools, Supabase, Playwright
- Agents: architect, tdd-guide, e2e-runner, build-error-resolver
- Commands: `/tdd`, `/gsd:execute-phase`, `/build-fix`
- Skills: frontend-patterns, backend-patterns, api-design, verification-loop

Actions:
1. Implement browser audio capture with MediaRecorder.
2. Chunk audio and send to backend routes.
3. Persist recording sessions and transcript chunks.
4. Build live recording UI:
   - controls
   - timer
   - transcript pane
   - extracted concepts pane
   - mini live graph
   - user marks
5. Keep transcription provider behind an interface.
6. If real transcription provider is not configured yet, use a mock adapter with realistic stubbed data.
7. Ensure this phase works end-to-end with mock or real data.

Tests to write:
- start/pause/stop flow
- recording state changes in UI
- transcript chunks appear
- user marks persist
- recording session saves correctly

Security:
- review upload/API routes with OWASP mindset
- entry-point-analyzer on all recording endpoints
- insecure-defaults for media/storage config

After implementation:
- run `npm test`

PHASE 5 — KNOWLEDGE EXTRACTION + GRAPH UPDATE ENGINE
Use:
- MCP: Context7, Supabase, Next Devtools
- Agents: architect, code-reviewer, refactor-cleaner
- Commands: `/gsd:execute-phase`, `/refactor-clean`, `/verify`
- Skills: backend-patterns, api-design, frontend-patterns, coding-standards

Actions:
1. Implement transcript segmentation.
2. Implement concept extraction.
3. Implement relation extraction.
4. Implement node creation vs merge logic.
5. Implement edge scoring and reinforcement.
6. Link nodes back to transcript evidence.
7. Update graph live as new chunks are processed.
8. Avoid duplicate junk nodes.

Tests to write:
- near-duplicate concepts merge correctly
- repeated concepts reinforce nodes
- edges are created for valid relationships
- transcript evidence links are preserved
- graph updates reflect new session data

Security:
- review any model/provider interaction surfaces
- static-analysis on extraction modules if relevant

After implementation:
- run `npm test`

PHASE 6 — LIVE ACTIVE LEARNING
Use:
- MCP: Context7, Playwright
- Agents: tdd-guide, planner, code-reviewer, e2e-runner
- Commands: `/tdd`, `/gsd:execute-phase`, `/verify`
- Skills: frontend-patterns, backend-patterns, verification-loop, accessibility

Actions:
1. Implement live prompt generation cadence:
   - every 3–6 minutes
   - or topic shift
2. Build prompt card UI on recording page.
3. Support prompt types:
   - key concept recall
   - identify definition/example/rule
   - choose correct connection
   - confidence check
   - one-sentence summary
4. Persist answers and confidence.
5. Connect prompt outcomes to future mastery updates.

Tests to write:
- prompt appears at expected cadence or topic shift
- prompt answers save
- prompt types render correctly
- prompt dismiss/snooze works

Security:
- review prompt generation path
- ensure no unsafe rendering of generated content

After implementation:
- run `npm test`

PHASE 7 — ALIEN HINT SYSTEM
Use:
- MCP: 21st.dev Magic, Stitch, Context7, Playwright
- Agents: planner, architect, code-reviewer, e2e-runner
- Commands: `/gsd:execute-phase`, `/verify`, `/e2e`
- Skills: ui-ux-pro-max, frontend-patterns, accessibility, best-practices

Actions:
1. Design the "Alien Hint" interaction as a premium themed system:
   - subtle animated transmission panel
   - extraterrestrial but elegant
   - readable, not gimmicky
2. Add Hint buttons to:
   - live prompt card
   - session quiz question card
   - node review screens
3. Implement 3 hint levels:
   - cryptic clue
   - directed nudge
   - stronger scaffold
4. Ground hints in:
   - current question
   - transcript chunk(s)
   - related knowledge nodes
   - graph neighborhood
5. Track hint usage in `alien_hints`.
6. Prevent full answer leakage on first hint.
7. Add UI copy like:
   - "Signal detected"
   - "Alien transmission received"
   - "Request another transmission"
   but keep it tasteful.

Tests to write:
- hint button appears in all required surfaces
- hint levels escalate correctly
- first hint does not reveal direct answer
- hint usage is stored
- hint panel is keyboard accessible

Security:
- review generated hint rendering
- confirm no sensitive content leaks
- best-practices audit on component behavior

After implementation:
- run `npm test`

PHASE 8 — POST-RECORDING QUIZ
Use:
- MCP: Context7, Playwright, Supabase
- Agents: tdd-guide, architect, database-reviewer, e2e-runner
- Commands: `/tdd`, `/gsd:execute-phase`, `/verify`
- Skills: api-design, backend-patterns, frontend-patterns, accessibility

Actions:
1. Generate a 5–10 question quiz on recording completion.
2. Ground quiz only in that session's content.
3. Prioritize important/confused concepts.
4. Add Alien Hint button to question cards.
5. On submission:
   - compute score
   - identify weak concepts
   - update mastery
   - highlight weak nodes
   - suggest review path

Tests to write:
- quiz generates after recording ends
- quiz is session-specific
- answers persist
- score calculates correctly
- weak concepts surface in UI
- hint button works on quiz items

Security:
- review generated content rendering
- entry-point-analyzer on quiz submission endpoints

After implementation:
- run `npm test`

PHASE 9 — NODE DETAIL + TRANSCRIPT CROSS-LINKING
Use:
- MCP: Next Devtools, Playwright, Context7
- Agents: architect, code-reviewer, e2e-runner
- Commands: `/gsd:execute-phase`, `/verify`
- Skills: frontend-patterns, backend-patterns, accessibility

Actions:
1. Clicking a node should show:
   - meaning
   - source recordings
   - timestamps
   - related nodes
   - mastery
   - quiz history
2. Clicking transcript chunks should highlight relevant nodes.
3. Node detail should support:
   - mini review
   - Alien Hint
   - jump to recording moment
4. Link user marks into both transcript and node views.

Tests to write:
- node-to-transcript linking works
- transcript-to-node linking works
- timestamps navigate correctly
- node detail shows related data

Security:
- review route params and data fetches
- differential-review on linked data flows

After implementation:
- run `npm test`

PHASE 10 — REVIEW MODE + MASTERY SYSTEM
Use:
- MCP: Context7, Playwright
- Agents: planner, architect, e2e-runner, code-reviewer
- Commands: `/gsd:execute-phase`, `/verify`, `/e2e`
- Skills: frontend-patterns, backend-patterns, performance, accessibility

Actions:
1. Implement mastery scoring and states:
   - new
   - seen
   - shaky
   - strong
2. Review Mode should support:
   - weak nodes
   - by recording
   - by cluster
   - tour my weak spots
3. Build path-based review between related concepts.
4. Use hint-aware review flow.
5. Feed review results back into mastery.

Tests to write:
- weak nodes appear correctly
- review flows work
- mastery changes after review outcomes
- tour my weak spots selects correct content

Security:
- review review-mode endpoints and state mutations
- static-analysis if new stateful routes are added

After implementation:
- run `npm test`

PHASE 11 — QUALITY, SECURITY, SEO, DEPLOY
Use:
- MCP: Playwright, Vercel, Next Devtools
- Agents: security-reviewer, code-reviewer, e2e-runner, chief-of-staff
- Commands: `/quality-gate`, `/verify`, `/code-review`, `/gsd:verify-work`
- Skills:
  - web-quality-audit
  - performance
  - core-web-vitals
  - accessibility
  - seo
  - best-practices
  - seo-core
  - seo-technical
  - seo-schema
  - supply-chain-risk-auditor
  - insecure-defaults
  - static-analysis
  - differential-review

Actions:
1. Run comprehensive quality pass.
2. Run accessibility pass.
3. Run Core Web Vitals optimization.
4. Add technical SEO:
   - metadata
   - Open Graph
   - sitemap if appropriate
   - schema where helpful
5. Run security review across all web-facing code.
6. Use Vercel MCP for deployment setup and logs only after local quality gates pass.

Tests to write:
- final smoke tests across all major routes
- final E2E for complete user flow:
  Galaxy Home → Live Recording → Prompt → Hint → Stop → Quiz → Hint → Node Detail → Review Mode

Security:
- full Trail of Bits skill pass
- OWASP review
- verify no secrets committed
- final dependency audit

After implementation:
- run `npm test`

==================================================
MANDATORY ACCEPTANCE CRITERIA
==================================================

The project is complete only when:
1. The app runs locally.
2. Galaxy Home is the main visual dashboard.
3. Recording can start/stop and produce transcript/session data.
4. The graph updates as new content comes in.
5. Live active-learning prompts work.
6. Post-recording quiz works.
7. Alien Hint system works in all required places.
8. Node detail and transcript cross-linking work.
9. Review mode works.
10. Playwright tests pass.
11. Security and quality checks have been run.
12. The final output includes:
   - architecture summary
   - dependency list
   - route map
   - schema summary
   - test coverage summary
   - security review summary
   - deployment notes

==================================================
EXECUTION STYLE
==================================================

Work phase by phase.
At the start of each phase:
- restate the goal
- list files to change
- list tools/skills/agents/commands you will use
- identify risks

At the end of each phase:
- summarize what changed
- list tests added
- show test results
- list any security checks run
- note any follow-up work

Start now with PHASE 0.
