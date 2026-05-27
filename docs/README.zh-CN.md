<div align="center">
  <img src="../public/favicon.svg" width="64" height="64" alt="LLM Arena Compare" />
  <h1>LLM Arena Compare / LLM Arena 模型对比</h1>
  <p><strong>赛博斗蛐蛐 — 自选模型横向 PK，一眼看出谁强谁弱</strong></p>

  [![MIT License](https://img.shields.io/badge/license-MIT-blue.svg)](../LICENSE)
  [![Node](https://img.shields.io/badge/node-%3E%3D20.9-brightgreen.svg)](../package.json)
  [![CI](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml/badge.svg)](https://github.com/tianyu0413/llm-arena-compare/actions/workflows/ci.yml)

  <h3><a href="https://llm-arena-compare.vercel.app">👉 立即在线体验 — 无需安装，打开即用</a></h3>

  [English README](../README.md)
</div>

---

<p align="center">
  <img src="../public/preview.png" alt="LLM Arena Compare preview" width="900" style="border-radius:8px;" />
</p>

## 🤔 为什么需要这个工具？

### Arena 是什么？

[LMSYS Chatbot Arena](https://arena.ai) 是目前最权威的大模型评测榜单之一。它基于**真人盲评投票**（ELO 排名机制），而非传统 benchmark 刷分，真实反映模型在日常对话中的实际表现。GPT、Claude、Gemini、Llama 等主流模型都在这个擂台上 PK，累计投票数超百万。

### 痛点在哪？

Arena 官网只提供一张完整排行榜，**无法自选 3~10 个模型进行横向对比**。当你想回答"Claude vs GPT vs Gemini 到底谁强？"这类问题时，只能在几百行的表格里反复翻找、手动记录——体验极差。

### 这个工具做了什么？

**LLM Arena Compare** 让你像"斗蛐蛐"一样：挑出你关心的模型，摆在一起，从分数、排名、票数、价格到上下文窗口，一张图一目了然。选完还能分享链接给别人，打开即复现对比结果。

## ✨ 功能亮点

- **🏆 双榜对比** — Arena Text + Code WebDev 榜单实时同步
- **🔍 智能搜索** — 按模型名称/组织/协议快速筛选，键盘 `/` 聚焦
- **⭐ 常用组合** — 收藏模型组合，下次打开即用
- **📊 可视化图表** — 分数横向柱状图、排名/票数对比图
- **🌙 深色模式** — 自动跟随系统或手动切换
- **🔗 URL 分享** — 选好模型后一键分享链接，对方打开即恢复对比状态
- **📥 数据导出** — 导出 CSV / 复制 Markdown 表格
- **⌨️ 键盘快捷键** — `/` 搜索、`Esc` 清除
- **📱 移动友好** — 响应式侧边栏，移动端流畅使用

## 🛠 技术栈

Next.js 16 · React 19 · TypeScript · Tailwind CSS · Recharts · Cheerio · lucide-react

## 🚀 本地开发

```bash
git clone https://github.com/tianyu0413/llm-arena-compare.git
cd llm-arena-compare
npm install
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000)

## 📡 API

```text
GET /api/arena/text
GET /api/arena/code
```

返回结构：

```ts
{
  sourceUrl: string;
  fetchedAt: string;
  cached: boolean;
  models: ArenaModel[];
}
```

> 这不是 Arena 官方 API。它解析 Arena 公开榜单 HTML；如果 Arena 页面结构变化，解析逻辑可能需要维护。

## ⚠️ 限制

- 服务端缓存是内存缓存（5 分钟 TTL / 实例）
- 当前覆盖 Arena Text 和 Code WebDev 两个榜单
- 如果 Arena 改变公开 HTML 结构，解析器可能需要更新

## 🗺 路线图

- [ ] 支持更多 Arena 分类（Vision、Hard Prompts 等）
- [ ] 历史分数快照
- [ ] 导出对比图片
- [ ] 自定义图表配色

## 🤝 贡献

参见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 📄 许可证

[MIT](../LICENSE)
