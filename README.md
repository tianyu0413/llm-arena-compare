<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="LLM Arena Compare" />
  <h1>LLM Arena Compare</h1>
  <p><strong>Pick your models, compare side by side, see who wins at a glance</strong></p>

  [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D20.9-brightgreen.svg)](package.json)
  [![CI](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml/badge.svg)](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml)

  <h3><a href="https://llm-arena-compare.vercel.app">👉 Try it online — no install required</a></h3>

  [中文](docs/README.zh-CN.md)
</div>

---

<p align="center">
  <img src="public/preview.png" alt="LLM Arena Compare preview" width="900" style="border-radius:8px;" />
</p>

## 🤔 Why this tool?

### What is Arena?

[LMSYS Chatbot Arena](https://arena.ai) is one of the most authoritative LLM evaluation leaderboards. It ranks models by **real human blind-voting** (ELO mechanism) rather than traditional benchmarks, reflecting actual performance in everyday conversations. Major models like GPT, Claude, Gemini, and Llama all compete here, with over a million cumulative votes.

### The pain point

The official Arena site only provides a single full leaderboard — **you cannot select 3–10 models for a side-by-side comparison**. When you want to answer "Claude vs GPT vs Gemini — who's actually better?", you're stuck scrolling through hundreds of rows and mentally tracking numbers.

### What this tool does

**LLM Arena Compare** lets you pick the models you care about, place them side by side, and instantly visualize scores, ranks, votes, pricing, and context windows in one view. You can also share a link so others can open your exact comparison.

## ✨ Features

- **🏆 Dual leaderboards** — Arena Text + Code WebDev synced in real time
- **🔍 Smart search** — Filter by model name, organization, or license; press `/` to focus
- **⭐ Favorite sets** — Save model combinations and restore them next time
- **📊 Visual charts** — Horizontal bar charts for scores, rank & vote comparisons
- **🌙 Dark mode** — Follow system preference or toggle manually
- **🔗 URL sharing** — Share your comparison via link; recipients see the same view
- **📥 Data export** — Download CSV or copy Markdown table to clipboard
- **⌨️ Keyboard shortcuts** — `/` to search, `Esc` to clear
- **📱 Mobile friendly** — Responsive sidebar, smooth on mobile devices

## 🛠 Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Recharts · Cheerio · lucide-react

## 🚀 Local Development

```bash
git clone https://github.com/tianyu0413/llm-arena-compare.git
cd llm-arena-compare
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📡 API

```text
GET /api/arena/text
GET /api/arena/code
```

Response:

```ts
{
  sourceUrl: string;
  fetchedAt: string;
  cached: boolean;
  models: ArenaModel[];
}
```

> Not an official Arena API. Parses public leaderboard HTML; may need maintenance if Arena changes its page structure.

## ⚠️ Limitations

- Server cache is in-memory (5 min TTL per instance)
- Covers Arena Text and Code WebDev leaderboards only
- HTML parser may break if Arena restructures its public page

## 🗺 Roadmap

- [ ] More Arena categories (Vision, Hard Prompts, etc.)
- [ ] Historical score snapshots
- [ ] Export comparison as image
- [ ] Customizable chart color palette

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

[MIT](LICENSE)
