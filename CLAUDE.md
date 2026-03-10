# ClassRecording Project

## Testing Directives (MANDATORY)

- **Run tests after every change**: After implementing any new feature, bug fix, or refactor, run `npm test` and verify all tests pass before considering the task complete.
- **Write tests first or alongside**: Every new feature or component MUST have corresponding Playwright tests in `tests/`. No feature is done without a passing test.
- **Never break existing tests**: If a change causes test failures, fix them immediately before moving on. Do not commit broken tests.
- **Test before committing**: Always run `npm test` before any git commit. Do not commit if tests fail.
- **Regression testing**: When fixing a bug, add a test that reproduces the bug first, then fix it.

## Git Workflow

- Repository is hosted on GitHub under `nickmincu/ClassRecording`
- Commit frequently with descriptive messages
- If tests fail after a change, revert or fix — never push broken code
- Use `gh` CLI for GitHub operations (PRs, issues, etc.)

## Tech Stack

- **Testing**: Playwright (`@playwright/test`) with Chromium
- **MCP Servers**:
  - `@playwright/mcp` — Browser automation and testing via MCP
  - `@21st-dev/magic` — AI-powered React/Tailwind component generation from natural language (needs API key from https://21st.dev/magic/console)
  - `@_davideast/stitch-mcp` — Google Stitch integration for full-page UI design, screen-to-code, and site scaffolding
- **Runtime**: Node.js 20, npm

## UI/UX Skills (ui-ux-pro-max)

Installed from `nextlevelbuilder/ui-ux-pro-max-skill`. Provides design intelligence via `.claude/skills/`:

- **banner-design** — Banner sizes, styles, and layout patterns
- **brand** — Brand guidelines, color palettes, typography, voice framework, with helper scripts
- **design** — CIP deliverables, icon/logo design, design references
- **design-system** — AI-powered design system generation
- **slides** — Presentation/slide design
- **ui-styling** — UI styling patterns and techniques
- **ui-ux-pro-max** — Master skill combining all UI/UX capabilities

## Project Structure

```
tests/              — Playwright test files (*.spec.ts)
.claude/skills/     — UI/UX Pro Max skill files
playwright.config.ts — Playwright configuration
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:headed   # Run tests with browser visible
npm run test:report   # View HTML test report
```
