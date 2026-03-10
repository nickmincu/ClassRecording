# Galaxy of Knowledge — ClassRecording Project

## Project Overview

A single-user web app that records class audio, transcribes it continuously, extracts concepts in near real time, and grows a visual "galaxy of knowledge" graph as new information comes in. Includes live active-learning prompts during recording, post-recording quizzes, and an "Alien Hint" system that gives contextual clues grounded in lecture content.

- **Stack**: Next.js App Router, TypeScript, Tailwind CSS, Supabase, Vercel
- **Aesthetic**: Dark, elegant, galaxy/constellation theme — glowing nodes, clear clusters, subtle motion, highly usable
- **Architecture**: Single-user, local-first, no auth/teams/sharing
- **AI providers**: Behind interfaces so they can be swapped later

## Master Plan

**Read `MASTER_PLAN.md` before starting any new phase.** It contains the full phased execution plan (Phase 0–11), data model, graph rules, active learning rules, page specs, Alien Hint system specs, and acceptance criteria. Work phase by phase, using the tools/skills/agents specified in each phase.

## Testing Directives (MANDATORY)

- **Run tests after every change**: After implementing any new feature, bug fix, or refactor, run `npm test` and verify all tests pass before considering the task complete.
- **Write tests first or alongside**: Every new feature or component MUST have corresponding Playwright tests in `tests/`. No feature is done without a passing test.
- **Never break existing tests**: If a change causes test failures, fix them immediately before moving on. Do not commit broken tests.
- **Test before committing**: Always run `npm test` before any git commit. Do not commit if tests fail.
- **Regression testing**: When fixing a bug, add a test that reproduces the bug first, then fix it.

## Security Directives (MANDATORY)

- **Review all new dependencies** before installing — check for known vulnerabilities with `npm audit`
- **Use Trail of Bits security skills** (`.claude/skills/security/`) for code audits: supply-chain-risk-auditor, insecure-defaults, static-analysis, differential-review
- **Run security scans** on any new MCP server or skill before trusting it
- **Never commit secrets** — API keys stay in `.mcp.json` (gitignored) or `.env`
- **Check for OWASP Top 10** vulnerabilities in all web-facing code

## Git Workflow

- Repository is hosted on GitHub under `nickmincu/ClassRecording`
- Commit frequently with descriptive messages
- If tests fail after a change, revert or fix — never push broken code
- Use `gh` CLI for GitHub operations (PRs, issues, etc.)

## Tech Stack

- **Testing**: Playwright (`@playwright/test`) with Chromium
- **MCP Servers** (8 servers in `.mcp.json`, gitignored):
  - `@playwright/mcp` — Browser automation and testing
  - `@21st-dev/magic` — AI React/Tailwind component generation
  - `@_davideast/stitch-mcp` — Google Stitch UI design to code
  - `@upstash/context7-mcp` — Live documentation for 1000+ libraries
  - `supabase` — Database management, schema, migrations, auth (OAuth on first use)
  - `vercel` — Deployment monitoring, env vars, build logs (OAuth on first use)
  - `figma` — Live Figma design access: layers, tokens, styles (OAuth on first use)
  - `next-devtools-mcp` — Next.js route info, component trees, build errors
- **Runtime**: Node.js 20, npm

## Installed Toolkits

### Everything Claude Code (ECC) — `affaan-m/everything-claude-code`
- **16 agents** in `.claude/agents/` — planner, architect, code-reviewer, security-reviewer, tdd-guide, e2e-runner, etc.
- **65+ skills** in `.claude/skills/ecc/` — frontend-patterns, api-design, security-review, tdd-workflow, docker-patterns, etc.
- **40+ commands** in `.claude/commands/` — `/plan`, `/tdd`, `/code-review`, `/build-fix`, `/verify`, etc.
- **Scripts** in `.claude/scripts/` — hook runners, lib utilities, quality gates
- **Rules** in `.claude/rules/` — coding standards, git workflow, testing, security

### Get Shit Done (GSD) — `gsd-build/get-shit-done`
- **Commands** in `.claude/commands/gsd/` — `/gsd:new-project`, `/gsd:plan-phase`, `/gsd:execute-phase`, `/gsd:verify-work`, `/gsd:quick`
- Prevents context rot with structured spec-driven development
- Atomic git commits per task, parallel wave execution

### Trail of Bits Security Skills — `trailofbits/skills`
Located in `.claude/skills/security/`:
- **supply-chain-risk-auditor** — Dependency threat analysis
- **insecure-defaults** — Hardcoded credentials and risky configs
- **static-analysis** — CodeQL, Semgrep, SARIF integration
- **differential-review** — Security-focused code change review
- **variant-analysis** — Find similar vulnerabilities across codebase
- **entry-point-analyzer** — Identify state-changing entry points
- **semgrep-rule-creator** — Custom vulnerability detection rules
- **audit-context-building** — Deep architectural security analysis
- **agentic-actions-auditor** — Review GitHub Actions for vulnerabilities
- **fp-check** — Validate security findings

### Web Quality Skills — `addyosmani/web-quality-skills`
Located in `.claude/skills/web-quality/`:
- **web-quality-audit** — Comprehensive quality review across all categories
- **performance** — Loading speed, resource optimization, critical rendering path
- **core-web-vitals** — LCP ≤2.5s, INP ≤200ms, CLS ≤0.1
- **accessibility** — WCAG 2.1 compliance, screen reader, keyboard navigation
- **seo** — Technical crawlability, meta elements, JSON-LD schema
- **best-practices** — Security headers, modern APIs, code quality

### Claude SEO — `AgriciDaniel/claude-seo`
Located in `.claude/skills/seo/`:
- 13 sub-skills: seo-audit, seo-page, seo-technical, seo-content, seo-schema, seo-images, seo-sitemap, seo-geo, seo-hreflang, seo-plan, seo-programmatic, seo-competitor-pages, seo-core
- 6 subagents: seo-content, seo-performance, seo-schema, seo-sitemap, seo-technical, seo-visual

### UI/UX Pro Max — `nextlevelbuilder/ui-ux-pro-max-skill`
Located in `.claude/skills/`:
- banner-design, brand, design, design-system, slides, ui-styling, ui-ux-pro-max

## Project Structure

```
tests/                    — Playwright test files (*.spec.ts)
.claude/agents/           — AI agents (16 ECC + 12 GSD)
.claude/commands/         — Slash commands (40 ECC + 32 GSD)
.claude/scripts/          — ECC hook runners, lib utilities, quality gates
.claude/hooks/            — GSD hook scripts (statusline, context monitor)
.claude/get-shit-done/    — GSD core (bin, templates, workflows, references)
.claude/rules/            — Coding standards and rules
.claude/skills/ecc/       — Everything Claude Code skills (65+)
.claude/skills/security/  — Trail of Bits security skills (10)
.claude/skills/web-quality/ — Lighthouse, a11y, Core Web Vitals, SEO (6)
.claude/skills/seo/       — Claude SEO deep audit skills (13)
.claude/skills/           — UI/UX Pro Max skills (7)
.claude/settings.json     — Merged hooks config (GSD + ECC)
playwright.config.ts      — Playwright configuration
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:headed   # Run tests with browser visible
npm run test:report   # View HTML test report
```
