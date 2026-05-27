# Contributing

Thanks for your interest in improving LLM Arena Compare.

## Local Development

Requirements:

- Node.js `>=20.9.0`
- npm

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Checks Before Opening a PR

Run:

```bash
npm run check
```

This executes ESLint and a production Next.js build.

## Project Notes

- The app parses the public Arena Text and Code WebDev leaderboard HTML.
- Do not add private API calls or credentials.
- Keep the default UI language as Chinese and preserve the English language switcher.
- If Arena changes its page structure, update `lib/arena.ts` and document the maintenance note in the README.

## Commit Style

Use short, descriptive commit messages, for example:

```text
Improve empty search state
Add bilingual README links
Harden Arena leaderboard parser
```
