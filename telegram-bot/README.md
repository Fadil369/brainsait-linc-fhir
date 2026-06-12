<<<<<<< HEAD
# Dr. Najeeb Lectures Telegram Bot

A Telegram bot that uses Cloudflare Browser Run to access Dr. Najeeb Lectures, retrieve courses, and download notes/drawings.

## Architecture

```
┌─────────────────┐     ┌─────────────────────────┐     ┌─────────────────────┐
│  Telegram User  │────▶│  Cloudflare Worker      │────▶│  Browser Run        │
│  (@brainsait_bot)│     │  - Webhook Handler      │     │  (Puppeteer)        │
└─────────────────┘     │  - Command Router       │     │  - Login Flow       │
                        │  - Cookie Management    │     │  - Course Scraping  │
                        └─────────────────────────┘     │  - Notes Download   │
                                │                       └─────────────────────┘
                                ▼
                        ┌─────────────────────────┐
                        │  Cloudflare KV          │
                        │  - Session Cookies      │
                        │  - Cached Course Data   │
                        └─────────────────────────┘
```

## Features

- **Telegram Bot Commands**: `/start`, `/login`, `/courses`, `/notes`, `/status`, `/logout`
- **Browser Automation**: Uses Cloudflare Browser Run with Puppeteer
- **Session Persistence**: Stores cookies in KV for persistent login
- **Course Extraction**: Lists all active courses with progress
- **Notes/Drawing Access**: Retrieves notes and drawings from courses
- **Rate Limiting**: 10 requests/minute per user
- **Health Monitoring**: `/health` and `/api/status` endpoints
- **MarkdownV2 Formatting**: Rich text messages in Telegram

## Prerequisites

- Cloudflare account with Browser Run enabled
- Telegram bot token (already configured)
- Node.js 18+

## Setup

### 1. Install Dependencies

```bash
cd drnajeeb-bot
npm install
```

### 2. Create KV Namespace

```bash
npx wrangler kv namespace create SESSION_KV
npx wrangler kv namespace create SESSION_KV --preview
```

Update `wrangler.jsonc` with the KV namespace IDs.

### 3. Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

Or manually:

```bash
npx wrangler deploy
```

### 4. Set Telegram Webhook

```bash
node scripts/set-webhook.mjs https://drnajeeb-bot.<your-subdomain>.workers.dev
```

## Usage

1. **Start**: Send `/start` to the bot to see available commands
2. **Login**: Send `/login` to initiate the login flow
   - First time: You'll need to complete Google login manually
   - After first login: Cookies are saved for future use
3. **Courses**: Send `/courses` to list your active courses
4. **Notes**: Send `/notes` to get notes and drawings
5. **Status**: Send `/status` to check login status
6. **Logout**: Send `/logout` to clear saved session

## Commands

| Command | Description |
|---------|-------------|
| `/start` | Show welcome message |
| `/help` | Show available commands |
| `/login` | Start Google login flow |
| `/courses` | List active courses |
| `/notes` | Get notes and drawings |
| `/status` | Check login status |
| `/logout` | Clear saved session |
| `/screenshot [url]` | Take screenshot of URL |
| `/url` | Show configured URLs |
| `/clear` | Clear cache |

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Health check |
| `/health` | GET | Detailed health status |
| `/api/status` | GET | Session status |
| `/webhook` | POST | Telegram webhook |

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `TELEGRAM_BOT_TOKEN` | Telegram bot token | Configured |
| `TELEGRAM_WEBHOOK_SECRET` | Webhook secret | `drnajeeb_secret_2026` |
| `ALLOWED_USERS` | Comma-separated user IDs | `2076569901` |
| `DRNAJEEB_LOGIN_URL` | Login page URL | Configured |
| `DRNAJEEB_COURSES_URL` | Courses page URL | Configured |
| `DRNAJEEB_NOTES_URL` | Notes page URL | Configured |

### Adding Users

To allow additional users, update the `ALLOWED_USERS` variable in `wrangler.jsonc`:

```json
"vars": {
  "ALLOWED_USERS": "2076569901,123456789,987654321"
}
```

## File Structure

```
drnajeeb-bot/
├── src/
│   ├── index.ts          # Main Worker entry point
│   ├── telegram.ts       # Telegram API helpers
│   ├── browser.ts        # Browser Run automation
│   └── storage.ts        # KV cookie/session management
├── scripts/
│   └── set-webhook.mjs   # Webhook setup script
├── wrangler.jsonc        # Cloudflare Worker config
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── deploy.sh             # Deployment script
```

## Troubleshooting

### Bot not responding

1. Check if webhook is set: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`
2. Check Worker logs: `npx wrangler tail`

### Login issues

1. Use `/logout` to clear session
2. Use `/login` to re-authenticate
3. Check if cookies are expired (7-day TTL)

### Browser Run errors

1. Verify Browser Run is enabled in your Cloudflare account
2. Check Worker has the `browser` binding configured

## Security

- **Webhook Secret**: All webhook requests are verified with secret token
- **User Allowlist**: Only authorized Telegram users can access
- **Rate Limiting**: 10 requests per minute per user
- **Cookie Encryption**: Cookies are stored securely in KV

## License

Private - For personal use only

## Powered by

- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Cloudflare Browser Run](https://developers.cloudflare.com/browser-run/)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [Hono](https://hono.dev/)
=======
# drnajeeb-bot
Dr. Najeeb Lectures Telegram Bot with Browser Run automation
>>>>>>> origin/main
