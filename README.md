<div align="center">
  <img src="public/favicon.svg" width="64" height="64" alt="LLM Arena Compare" />
  <h1>LLM Arena Compare</h1>
  <p><strong>赛博斗蛐蛐 — 自选模型横向 PK，一眼看出谁强谁弱</strong></p>

  [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D20.9-brightgreen.svg)](package.json)
  [![CI](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml/badge.svg)](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml)

  <h3><a href="https://llm-arena-compare.vercel.app">👉 立即在线体验 — 无需安装，打开即用</a></h3>

  [中文文档](docs/README.zh-CN.md)
</div>

---

<p align="center">
  <img src="public/preview.png" alt="LLM Arena Compare preview" width="900" style="border-radius:8px;" />
</p>

## 🤔 为什么需要这个工具？

### Arena 是什么？

[LMSYS Chatbot Arena](https://arena.ai) 是目前最权威的大模型评测榜单之一。它基于**真人盲评投票**（ELO 排名机制），而非传统 benchmark 刷分，真实反映模型在日常对话中的实际表现。GPT、Claude、Gemini、Llama 等主流模型都在这个擂台上 PK，累计投票数超百万。

### 痛点在哪？

Arena 官网只提供一张完整排行榜，**无法自选 3~10 个模型进行横向对比**。当你想回答"Claude vs GPT vs Gemini 到底谁强？"这类问题时，只能在几百行的表格里反复翻找、手动记录——体验极差。

### 这个工具做了什么？

**LLM Arena Compare** 让你像"斗蛐蛐"一样：挑出你关心的模型，摆在一起，从分数、排名、票数、价格到上下文窗口，一张图一目了然。选完还能分享链接给别人，打开即复现对比结果。

## ✨ Features

- **🏆 双榜对比** — Arena Text + Code WebDev 榜单实时同步
- **🔍 智能搜索** — 按模型名称/组织/协议快速筛选，键盘 `/` 聚焦
- **⭐ 常用组合** — 收藏模型组合，下次打开即用
- **📊 可视化图表** — 分数横向柱状图、排名/票数对比图
- **🌙 深色模式** — 自动跟随系统 or 手动切换
- **🔗 URL 分享** — 选好模型后一键分享链接，对方打开即恢复对比
- **📥 数据导出** — 导出 CSV / 复制 Markdown 表格
- **⌨️ 键盘快捷键** — `/` 搜索、`Esc` 清除
- **📱 移动友好** — 响应式侧边栏，移动端流畅使用

## 🛠 Tech Stack

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Recharts · Cheerio · lucide-react

## 🚀 本地开发

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
