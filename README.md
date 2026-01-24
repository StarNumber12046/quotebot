# Quotebot

Quotebot is a comprehensive Discord quoting system that allows you to archive, manage, and view memorable messages from your server. It consists of a Discord bot for capturing quotes and a Next.js web dashboard for browsing them.

## Features

### 🤖 Discord Bot
- **/quote**: Archive a message as a quote.
- **/getquote**: Retrieve and display a random or specific quote.
- **/fakequote**: Create a fun, fabricated quote.
- **/quote_stealthy**: Archive a message discreetly.

### 🌐 Web Dashboard
- **Quote Gallery**: Browse all archived quotes in a clean interface.
- **Public View**: Shareable links for public quotes.
- **User Accounts**: Manage your saved quotes.
- **Search & Filter**: Easily find specific quotes or filter by "fake" quotes.

## Hosting & Deployment

Detailed instructions for hosting the **Web Frontend on Vercel** and the **Discord Bot on Docker** can be found in our hosting guide:

👉 **[Read the Hosting Guide](HOSTING.md)**

## Development

This project is a monorepo managed by [Turbo](https://turbo.build/repo).

### Prerequisites
- Node.js (Latest LTS)
- pnpm

### Getting Started

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Start development server:**
   ```bash
   pnpm dev
   ```

### Build

To build all apps and packages:

```bash
pnpm build
```
