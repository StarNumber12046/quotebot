# Quotebot Hosting Guide

This guide covers hosting the **web frontend on Vercel** and the **Discord bot using Docker**.

## 1. Web Frontend (Vercel)

### Prerequisites
- A Vercel account
- A database (PostgreSQL recommended, e.g. Neon, Supabase, or self-hosted)
- Discord OAuth application credentials

### Environment Variables (Web)
Configure these in your Vercel project settings:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Connection string for your database (e.g. `postgres://...`) |
| `BETTER_AUTH_SECRET` | Secret key for Better Auth (generate one for security) |
| `BETTER_AUTH_URL` | The full URL of your deployed application (e.g. `https://your-project.vercel.app`) |
| `BETTER_AUTH_DB_URL` | Database URL for Better Auth (often same as `DATABASE_URL`) |
| `DISCORD_CLIENT_ID` | Discord Application Client ID |
| `DISCORD_CLIENT_SECRET` | Discord Application Client Secret |
| `NEXT_PUBLIC_POSTHOG_KEY` | (Optional) Public API key for PostHog analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | (Optional) PostHog host URL |

### Deployment Steps
1. Push your code to a Git repository (GitHub/GitLab/Bitbucket).
2. Import the project into Vercel.
3. Select `apps/web` as the Root Directory if prompted (or configure it in Project Settings > Root Directory).
4. Enter the environment variables listed above.
5. Click **Deploy**.

---

## 2. Discord Bot (Docker)

### Prerequisites
- Docker installed on your host machine
- A Discord Bot Token

### Environment Variables (Bot)
These should be passed to the Docker container or defined in a `.env` file. Since the bot shares the application database with the web frontend (via the `@repo/backend` package), the `DATABASE_URL` is required.

| Variable | Description |
|---|---|
| `DISCORD_TOKEN` | Your Discord Bot Token |
| `APPLICATION_ID` | Your Discord Application ID |
| `BLOB_READ_WRITE_TOKEN` | Token for Vercel Blob storage (or compatible blob storage) |
| `DATABASE_URL` | Connection string for the shared PostgreSQL database |

### Database Initialization
Before running the bot or web app, you must push the database schema to your PostgreSQL instance. This uses the `@repo/backend` package.

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Push Schema**
   Run the following command from the root of the repo, ensuring `DATABASE_URL` is set in your environment or `.env` file:
   ```bash
   DATABASE_URL="your_connection_string" pnpm db:push
   ```
   *Note: `db:push` is a script defined in `packages/backend/package.json` that runs `drizzle-kit push`.*

### Deployment Steps

1. **Build the Docker Image**
   From the root of the repository:
   ```bash
   docker build -t quotebot .
   ```

2. **Run the Container**
   ```bash
   docker run -d \
     --name quotebot \
     -e DISCORD_TOKEN="your_token_here" \
     -e APPLICATION_ID="your_app_id" \
     -e BLOB_READ_WRITE_TOKEN="your_blob_token" \
     -e DATABASE_URL="your_database_url" \
     quotebot
   ```

   **Or using a `.env` file:**
   ```bash
   docker run -d --name quotebot --env-file .env quotebot
   ```

### Notes
- Ensure your bot has the necessary intents enabled in the Discord Developer Portal.
- The bot and web app **must** share the same `DATABASE_URL` to access the same quote data.
