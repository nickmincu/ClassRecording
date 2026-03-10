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
- **MCP**: `@playwright/mcp` — Playwright MCP server for browser automation via MCP protocol
- **Runtime**: Node.js 20, npm

## Project Structure

```
tests/           — Playwright test files (*.spec.ts)
playwright.config.ts — Playwright configuration
```

## Running Tests

```bash
npm test              # Run all tests
npm run test:headed   # Run tests with browser visible
npm run test:report   # View HTML test report
```
