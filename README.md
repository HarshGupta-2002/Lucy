# Lucy — Discord Moderation Bot

A lightweight, slash-command-based Discord moderation bot built with [discord.js v14](https://discord.js.org/). Lucy provides server administrators and moderators with a clean set of moderation tools — ban, kick, mute, timeout, and more — all accessible through Discord's native `/` slash command interface.

---

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup & Installation](#setup--installation)
- [Configuration](#configuration)
- [Running the Bot](#running-the-bot)
- [Registering Slash Commands](#registering-slash-commands)
- [Commands Reference](#commands-reference)
- [Logging](#logging)
- [License](#license)

---

## Features

- Slash command interface (no message prefix needed)
- Discord permission-gated commands — only users with the right server permissions can invoke each command
- Runtime bot permission checks before any action is taken
- Ephemeral error replies — errors are only visible to the invoker
- IST-aware persistent logging to both console and `bot.log`
- Auto-revert timed timeouts (in-memory)
- DM-based unique invite link generation

---

## Prerequisites

Ensure the following are installed and available before proceeding:

| Requirement | Version | Notes |
|---|---|---|
| [Node.js](https://nodejs.org/) | v18 or higher | v23.x recommended |
| npm | Bundled with Node.js | Used to install dependencies |
| A Discord Application | — | Created via the [Discord Developer Portal](https://discord.com/developers/applications) |

---

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/lucy.git
cd lucy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create Your Discord Application & Bot

You will need a Discord bot token and application client ID. Follow these steps:

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **"New Application"** and give it a name (e.g., `Lucy`)
3. Navigate to the **"Bot"** tab in the left sidebar
4. Click **"Add Bot"** → confirm
5. Under the bot's username, click **"Reset Token"** and copy the token — this is your `TOKEN`
6. Navigate to **"OAuth2"** → **"General"** and copy the **Client ID** — this is your `CLIENT_ID`

> **Important — Enable Privileged Intents:**  
> On the **Bot** tab, scroll down to **Privileged Gateway Intents** and enable:
> - `Server Members Intent`
> - `Message Content Intent`  
> Without these, the bot will fail to start or function correctly.

### 4. Invite the Bot to Your Server

Use the OAuth2 URL Generator under **OAuth2 → URL Generator**:
- Scopes: `bot`, `applications.commands`
- Bot Permissions: `Administrator` (or at minimum: `Ban Members`, `Kick Members`, `Mute Members`, `Manage Messages`, `Create Instant Invite`)

Copy the generated URL and open it in your browser to add the bot to your server.

---

## Configuration

Create a `.env` file in the project root with the following values:

```env
TOKEN=your_bot_token_here
CLIENT_ID=your_application_client_id_here
```

| Variable | Description | Where to Find |
|---|---|---|
| `TOKEN` | Your Discord bot's secret token | Discord Developer Portal → Bot → Reset Token |
| `CLIENT_ID` | Your Discord application's client ID | Discord Developer Portal → OAuth2 → General |

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## Running the Bot

### Development (with auto-restart on file changes)

```bash
npm run dev
```

Uses `nodemon` to watch for file changes and automatically restart the bot.

### Production

```bash
node bot.js
```

---

## Registering Slash Commands

Slash commands must be registered with Discord's API before they appear in any server. This is a one-time step (re-run whenever you add or modify commands):

```bash
npm run register
```

This calls `scripts/deployCommands.js`, which pushes all command definitions globally to Discord using the REST API. Global commands may take up to **1 hour** to propagate across all servers.

---

## Logging

All events are logged to both the console and `bot.log` in the project root using IST (UTC+5:30) timestamps.

**Log format:**
```
[DD-MM-YYYYTHH:MM:SS] [LEVEL] [Server: ServerName (ID)] Message
```

**Log levels:**

| Level | Usage |
|---|---|
| `INFO` | Successful actions (ban, kick, mute, bot startup, etc.) |
| `WARN` | Non-critical issues (e.g., malformed command file) |
| `DEBUG` | Internal step-by-step actions (e.g., channel permission edits) |
| `ERROR` | Failures and exceptions, including stack traces |

---

## License

This project is licensed under the [MIT License](LICENSE).
