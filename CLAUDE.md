# ClassRecording Project

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
- **MCP Servers** (configured in `.mcp.json`, gitignored):
  - `@playwright/mcp` — Browser automation and testing
  - `@21st-dev/magic` — AI React/Tailwind component generation
  - `@_davideast/stitch-mcp` — Google Stitch UI design to code
- **Runtime**: Node.js 20, npm

## Installed Toolkits

### Everything Claude Code (ECC) — `affaan-m/everything-claude-code`
- **16 agents** in `.claude/agents/` — planner, architect, code-reviewer, security-reviewer, tdd-guide, e2e-runner, etc.
- **65+ skills** in `.claude/skills/ecc/` — frontend-patterns, api-design, security-review, tdd-workflow, docker-patterns, etc.
- **40+ commands** in `.claude/commands/` — `/plan`, `/tdd`, `/code-review`, `/build-fix`, `/verify`, etc.
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

### UI/UX Pro Max — `nextlevelbuilder/ui-ux-pro-max-skill`
Located in `.claude/skills/`:
- banner-design, brand, design, design-system, slides, ui-styling, ui-ux-pro-max

## Project Structure

```
tests/                    — Playwright test files (*.spec.ts)
.claude/agents/           — AI agents (ECC)
.claude/commands/         — Slash commands (ECC + GSD)
.claude/rules/            — Coding standards and rules
.claude/skills/ecc/       — Everything Claude Code skills
.claude/skills/security/  — Trail of Bits security skills
.claude/skills/           — UI/UX Pro Max skills
playwright.config.ts      — Playwright configuration
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:headed   # Run tests with browser visible
npm run test:report   # View HTML test report
```
