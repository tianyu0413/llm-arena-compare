# LLM Arena Compare

[中文文档](docs/README.zh-CN.md)

## Live Demo

[https://llm-arena-compare.vercel.app](https://llm-arena-compare.vercel.app)

LLM Arena Compare is a local-first dashboard for comparing selected models from the public Arena Text and Code leaderboards. It helps you search models, save favorite model sets in the browser, refresh live leaderboard scores, and compare rank, score, votes, price, and context window in a focused visual interface.

![LLM Arena Compare preview](public/preview.png)

## Highlights

- Syncs the public Arena Text leaderboard from `https://arena.ai/leaderboard/text`.
- Syncs the public Arena Code WebDev leaderboard from `https://arena.ai/leaderboard/code/webdev`.
- Lets users search and select up to 10 models for side-by-side comparison.
- Saves favorites, current selection, selected leaderboard, and UI language in `localStorage`.
- Defaults to Chinese UI and includes an in-app `中文 / English` language switcher.
- Shows leaderboard-specific horizontal score charts, summary cards, rank/vote charts, and a comparison table.
- Uses a 5-minute in-memory server cache to reduce repeated requests to Arena.

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Recharts
- Cheerio
- lucide-react

## Quick Start

Requirements:

- Node.js `>=20.9.0`
- npm

1. Clone the repository and enter the project directory:

```bash
git clone https://github.com/tianyu0413/llm-arena-compare.git
cd llm-arena-compare
```

2. Install dependencies:

```bash
npm install
```

3. Run the project checks:

```bash
npm run check
```

4. Start the development server:

```bash
npm run dev
```

5. Open the app:

```text
http://localhost:3000
```

6. Build and run production locally:

```bash
npm run build
npm run start
```

If you already have the source code locally, start from the project directory:

```bash
cd /path/to/llm-arena-compare
```

## API

The app exposes two local API routes:

```text
GET /api/arena/text
GET /api/arena/code
```

Response shape:

```ts
{
  sourceUrl: string;
  fetchedAt: string;
  cached: boolean;
  models: ArenaModel[];
}
```

This is not an official Arena API. It parses the public leaderboard HTML and may need maintenance if Arena changes its page structure.

## Data Source and Limitations

- The app currently covers the Arena Text leaderboard and the Arena Code WebDev leaderboard.
- Data is fetched from the public leaderboard page, not from a private or official API.
- The server cache is in memory, so each deployment instance keeps its own short-lived 5-minute cache.
- If Arena changes its public HTML structure, the parser may need to be updated.
- Adjust `CACHE_TTL_MS` in `lib/arena.ts` if you need a different refresh cadence.

## Roadmap

- Additional Arena categories beyond the current Text and Code WebDev leaderboards.
- Export selected comparison data as CSV.
- More chart modes for price, context, and vote confidence.
- Historical snapshots if a persistent database is introduced.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## License

MIT
