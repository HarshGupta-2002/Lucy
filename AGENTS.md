# AGENTS.md — Coding Agent Rules for Lucy

This file defines the rules, conventions, and guardrails that any coding agent (AI or otherwise) **must follow** when working on this codebase. Read this file in full before making any change.

---

## 1. Code Style

### Semicolons
- **Do not use trailing semicolons.** This codebase uses a no-semicolon style throughout.
  ```js
  // ✅ Correct
  const logger = require('./utility/logger')

  // ❌ Wrong
  const logger = require('./utility/logger');
  ```

### Quotes
- Use **single quotes** for all strings, consistent with the existing code.
  ```js
  // ✅ Correct
  const reason = 'No reason provided'

  // ❌ Wrong
  const reason = "No reason provided"
  ```

### Indentation
- Use **tabs** for indentation, not spaces. Match the style of the file you are editing.

### Variable Declarations
- Prefer `const` for values that do not change, `let` for reassignable variables. Never use `var`.

### Async / Await
- All Discord API calls are async. Always use `async/await` with proper `try/catch` or `.catch()` handling. Do not leave unhandled promise rejections.

---

## 2. Command Structure

Every command file must export exactly two properties:

```js
module.exports = {
    data: new SlashCommandBuilder()  // defines the slash command schema
        .setName('command-name')
        .setDescription('Description'),

    async execute(interaction) {
        // handler logic
    }
}
```

- **`data`** — a `SlashCommandBuilder` instance. Without this, `commandHandler.js` will skip the file with a warning.
- **`execute(interaction)`** — the async handler. All errors must be caught and replied to using `MessageFlags.Ephemeral`.

### Permission Gating
- Every moderation command **must** call `.setDefaultMemberPermissions(PermissionFlagsBits.XYZ)` on its builder so Discord enforces who can see and invoke it.
- Additionally, perform a **runtime bot permission check** (e.g., `member.bannable`, `scope.permissions.has(...)`) before taking any action, and reply with an ephemeral error if the check fails.

### Command Placement
- Place commands in the correct subfolder under `commands/`:
  - `commands/moderation/` — moderation actions (ban, kick, mute, timeout, etc.)
  - `commands/events/` — general/utility interactions (greetings, info, etc.)
- Create a new subfolder if a genuinely new category is introduced. Update `README.md` accordingly.

---

## 3. Backward Compatibility

> **This is a strict rule. Do not bypass it.**

- **No change may break any existing command or feature**, whether or not it is directly related to the change being made.
- Before modifying shared utilities (`logger.js`, `commandHandler.js`), trace all callers and verify that the change is fully backward compatible.
- If a change is **not** backward compatible (e.g., changing a function signature, removing an export, changing `.env` variable names), you **must**:
  1. Clearly describe the breaking change and its impact.
  2. **Wait for explicit user confirmation** before proceeding.
  3. Never assume silence means approval.

---

## 4. Documentation

### README.md
- After **every** code change, review `README.md` and update it if the change affects anything documented there.
- Update the README when:
  - A new command is added or removed
  - A new folder or utility file is introduced
  - An `.env` variable is added, removed, or renamed
  - A feature's behavior changes (e.g., how timeout works)
  - An npm script is added or modified
- Do **not** overcrowd the README. Only add or update what is directly relevant. Remove documentation for things that no longer exist.

### Inline Comments
- Preserve all existing comments and docstrings unless they are directly incorrect due to your change.
- Add comments for non-obvious logic — especially async flows, permission checks, and timer-based behavior.

---

## 5. Logging

- Use the existing `logger` utility (`utility/logger.js`) for all logging. Do not use `console.log` directly.
- Choose the appropriate level:
  - `logger.info(...)` — successful, meaningful actions
  - `logger.warn(...)` — non-fatal issues or skipped operations
  - `logger.debug(...)` — step-by-step internal state, useful for tracing
  - `logger.error(...)` — failures and caught exceptions
- Pass the `guild` object as the second argument wherever the context is server-specific:
  ```js
  logger.info('User banned', interaction.guild)
  ```

---

## 6. Error Handling

- All command `execute()` functions must handle errors gracefully.
- Reply with an **ephemeral** message on failure so only the invoker sees it:
  ```js
  return interaction.reply({ content: 'Something went wrong', flags: MessageFlags.Ephemeral })
  ```
- Log all caught errors using `logger.error(error, guild)`.
- Never let a command crash silently. The global error handler in `bot.js` is a safety net, not a substitute for per-command handling.

---

## 7. Environment & Secrets

- Never hardcode tokens, IDs, or secrets in source files. All secrets must live in `.env` and be accessed via `process.env`.
- Never commit `.env`. It is already in `.gitignore` — keep it that way.
- If a new environment variable is required, document it in `README.md` under the **Configuration** section.

---

## 8. Dependencies

- Do not add new `npm` dependencies without a clear justification.
- If a new dependency is genuinely needed, use the exact version or a pinned range, and document why it was added in the relevant commit or PR description.
- Do not install dev dependencies as regular dependencies and vice versa.

---

## 9. Git Hygiene

- Write clear, descriptive commit messages. Use the imperative mood:
  - ✅ `Add /warn command with reason support`
  - ❌ `added warn stuff`
- One logical change per commit. Do not bundle unrelated changes.
- Do not commit `bot.log`, `node_modules/`, or `.env`.
