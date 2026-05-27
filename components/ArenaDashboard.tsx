"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  AlertCircle,
  BarChart3,
  Check,
  DollarSign,
  Download,
  ExternalLink,
  Hash,
  Languages,
  Link2,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Star,
  Sun,
  Trash2,
  Trophy,
  Users,
  X
} from "lucide-react";
import { showToast, ToastContainer } from "@/components/Toast";
import type { ArenaLeaderboardKind, ArenaLeaderboardResponse, ArenaModel } from "@/lib/arena";

type ApiState =
  | { status: "idle" | "loading"; data: null; error: null }
  | { status: "ready"; data: ArenaLeaderboardResponse; error: null }
  | { status: "error"; data: ArenaLeaderboardResponse | null; error: string };

type Language = "zh" | "en";
type Theme = "light" | "dark" | "system";

const preferredDefaults = ["claude", "gpt", "gemini"];
const maxSelected = 10;
const storagePrefix = "llm-arena-compare";
const leaderboardKey = `${storagePrefix}:leaderboard`;
const languageKey = "llm-arena-compare:language";
const themeKey = "llm-arena-compare:theme";
const sharedFavoritesKey = `${storagePrefix}:favorites`;
const previousSavedSelectionKey = "llm-arena-compare:selected";
const legacySavedSelectionKey = "arena-model-compare:selected";
const legacyFavoritesKey = "arena-model-compare:favorites";
const emptyModels: ArenaModel[] = [];
const fallbackSourceUrls: Record<ArenaLeaderboardKind, string> = {
  text: "https://arena.ai/leaderboard/text",
  code: "https://arena.ai/leaderboard/code/webdev"
};

const translations = {
  zh: {
    appKickerText: "Arena 文本榜单",
    appKickerCode: "Arena Code 榜单",
    appTitle: "模型能力对比",
    appDescriptionText: "同步公开 Arena 文本榜单，保存常用模型组合，下次打开即可继续对比。",
    appDescriptionCode: "同步公开 Arena Code WebDev 榜单，保存常用模型组合，下次打开即可继续对比。",
    leaderboard: "榜单",
    textLeaderboard: "文本",
    codeLeaderboard: "Code",
    selected: "已选",
    favorites: "常用",
    models: "模型",
    cached: "缓存数据",
    synced: "最新同步",
    loading: "同步中",
    source: "来源",
    refresh: "刷新",
    retry: "重试",
    language: "语言",
    chinese: "中文",
    english: "English",
    searchPlaceholder: "搜索模型或组织",
    favoriteModels: "常用模型",
    saveCurrent: "保存当前选择",
    applyFavorites: "应用常用模型",
    clearFavorites: "清空常用模型",
    favoriteEmpty: "先选择模型，再点保存；或在列表里点星标，把模型加入常用。",
    loadingModels: "正在同步 Arena 榜单",
    loadingHint: "解析公开排行榜并准备对比视图。",
    addToCompare: "加入对比",
    removeFromCompare: "移出对比",
    saveFavorite: "保存为常用",
    removeFavorite: "取消常用",
    compareView: "对比视图",
    compareHint: "至少选择 2 个模型进行对比；分数越高越好，排名数值越小越好。",
    defaultSet: "默认组合",
    needMoreModels: "再选择至少一个模型，图表和表格会立即更新。",
    maxSelectedNotice: "已达到 10 个模型上限。移除一个已选模型后可继续添加。",
    scoreChartText: "Arena 文本分数横向对比",
    scoreChartCode: "Arena Code 分数横向对比",
    rankVotes: "排名和票数",
    priceTable: "模型价格表",
    noResultsTitle: "没有匹配的模型",
    noResultsHint: "换一个关键词，或清空搜索条件查看全部模型。",
    clearSearch: "清空搜索",
    syncFailedTitle: "同步失败",
    syncFailedHint: "无法读取 Arena 公开页面。可以重试，或打开来源页面确认 Arena 当前是否可访问。",
    knownLimitation: "本项目解析公开 HTML，不是 Arena 官方 API；页面结构变化时可能需要维护。",
    bestScore: "最高分数",
    bestRank: "最佳排名",
    mostVotes: "最多票数",
    cheapestInput: "最低输入价",
    noValue: "暂无",
    tableModel: "模型",
    tableRank: "排名",
    tableScore: "分数",
    tableVotes: "票数",
    tableInputPrice: "输入价格",
    tableOutputPrice: "输出价格",
    tablePrice: "价格",
    tableContext: "上下文",
    scoreLegendText: "Arena 文本分数",
    scoreLegendCode: "Arena Code 分数",
    rankLegend: "排名",
    votesLegend: "票数",
    shareLink: "分享链接",
    linkCopied: "链接已复制到剪贴板",
    exportCsv: "导出 CSV",
    csvExported: "CSV 已导出",
    copyMarkdown: "复制 Markdown",
    markdownCopied: "Markdown 已复制到剪贴板",
    favoritesSaved: "已保存为常用模型",
    favoritesCleared: "常用模型已清空",
    favoritesApplied: "已应用常用模型",
    theme: "主题",
    modelPanel: "模型面板"
  },
  en: {
    appKickerText: "Arena Text Leaderboard",
    appKickerCode: "Arena Code Leaderboard",
    appTitle: "Model Capability Compare",
    appDescriptionText: "Sync the public Arena text leaderboard, save favorite model sets, and continue comparing next time.",
    appDescriptionCode: "Sync the public Arena Code WebDev leaderboard, save favorite model sets, and continue comparing next time.",
    leaderboard: "Leaderboard",
    textLeaderboard: "Text",
    codeLeaderboard: "Code",
    selected: "Selected",
    favorites: "Favorites",
    models: "models",
    cached: "Cached",
    synced: "Synced",
    loading: "Syncing",
    source: "Source",
    refresh: "Refresh",
    retry: "Retry",
    language: "Language",
    chinese: "中文",
    english: "English",
    searchPlaceholder: "Search models or organizations",
    favoriteModels: "Favorite Models",
    saveCurrent: "Save current selection",
    applyFavorites: "Apply favorites",
    clearFavorites: "Clear favorites",
    favoriteEmpty: "Select models and save them here, or star models from the list.",
    loadingModels: "Syncing Arena leaderboard",
    loadingHint: "Parsing the public ranking page and preparing the comparison view.",
    addToCompare: "Add to compare",
    removeFromCompare: "Remove from compare",
    saveFavorite: "Save as favorite",
    removeFavorite: "Remove favorite",
    compareView: "Compare View",
    compareHint: "Select at least 2 models. Higher score is better; lower rank number is better.",
    defaultSet: "Default set",
    needMoreModels: "Select at least one more model and the charts will update immediately.",
    maxSelectedNotice: "You have reached the 10-model limit. Remove one selected model before adding more.",
    scoreChartText: "Arena Text Score Comparison",
    scoreChartCode: "Arena Code Score Comparison",
    rankVotes: "Rank and Votes",
    priceTable: "Model Pricing",
    noResultsTitle: "No matching models",
    noResultsHint: "Try another keyword or clear the search to see all models.",
    clearSearch: "Clear search",
    syncFailedTitle: "Sync failed",
    syncFailedHint: "Could not read the public Arena page. Retry or open the source page to check availability.",
    knownLimitation: "This project parses public HTML and is not an official Arena API; page changes may require maintenance.",
    bestScore: "Best Score",
    bestRank: "Best Rank",
    mostVotes: "Most Votes",
    cheapestInput: "Cheapest Input",
    noValue: "N/A",
    tableModel: "Model",
    tableRank: "Rank",
    tableScore: "Score",
    tableVotes: "Votes",
    tableInputPrice: "Input Price",
    tableOutputPrice: "Output Price",
    tablePrice: "Price",
    tableContext: "Context",
    scoreLegendText: "Arena Text Score",
    scoreLegendCode: "Arena Code Score",
    rankLegend: "Rank",
    votesLegend: "Votes",
    shareLink: "Share Link",
    linkCopied: "Link copied to clipboard",
    exportCsv: "Export CSV",
    csvExported: "CSV exported",
    copyMarkdown: "Copy Markdown",
    markdownCopied: "Markdown copied to clipboard",
    favoritesSaved: "Saved as favorites",
    favoritesCleared: "Favorites cleared",
    favoritesApplied: "Favorites applied",
    theme: "Theme",
    modelPanel: "Model Panel"
  }
} satisfies Record<Language, Record<string, string>>;

function formatNumber(value: number | null, language: Language) {
  return value == null ? "—" : new Intl.NumberFormat(language === "zh" ? "zh-CN" : "en-US").format(value);
}

function formatDate(value: string, language: Language) {
  return new Intl.DateTimeFormat(language === "zh" ? "zh-CN" : "en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    month: "short",
    day: "numeric"
  }).format(new Date(value));
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

function readStoredIds(key: string, legacyKeys: string[] = []) {
  try {
    const value = [key, ...legacyKeys].map((item) => window.localStorage.getItem(item)).find(Boolean);
    const parsed = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed.filter((item) => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function readStoredIdUnion(keys: string[]) {
  const ids = keys.flatMap((key) => readStoredIds(key));
  return Array.from(new Set(ids));
}

function selectionKeyFor(kind: ArenaLeaderboardKind) {
  return `${storagePrefix}:${kind}:selected`;
}

function legacySelectionKeyFor(kind: ArenaLeaderboardKind) {
  return kind === "text" ? [previousSavedSelectionKey, legacySavedSelectionKey] : [];
}

function legacyFavoriteKeys() {
  return [
    `${storagePrefix}:text:favorites`,
    `${storagePrefix}:code:favorites`,
    legacyFavoritesKey
  ];
}

function readStoredLanguage(): Language {
  try {
    return window.localStorage.getItem(languageKey) === "en" ? "en" : "zh";
  } catch {
    return "zh";
  }
}

function readStoredLeaderboard(): ArenaLeaderboardKind {
  try {
    return window.localStorage.getItem(leaderboardKey) === "code" ? "code" : "text";
  } catch {
    return "text";
  }
}

function readStoredTheme(): Theme {
  try {
    const val = window.localStorage.getItem(themeKey);
    if (val === "dark" || val === "light") return val;
    return "light";
  } catch {
    return "light";
  }
}

function applyThemeClass(theme: Theme) {
  const isDark =
    theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", isDark);
}

function readUrlParams(): { board?: ArenaLeaderboardKind; models?: string[] } | null {
  try {
    const params = new URLSearchParams(window.location.search);
    const board = params.get("board");
    const models = params.get("models");
    if (!board && !models) return null;
    return {
      board: board === "code" ? "code" : board === "text" ? "text" : undefined,
      models: models ? models.split(",").filter(Boolean) : undefined
    };
  } catch {
    return null;
  }
}

function buildShareUrl(leaderboard: ArenaLeaderboardKind, selectedIds: string[]) {
  const url = new URL(window.location.href.split("?")[0]);
  url.searchParams.set("board", leaderboard);
  if (selectedIds.length > 0) {
    url.searchParams.set("models", selectedIds.join(","));
  }
  return url.toString();
}

function exportCsv(models: ArenaModel[]) {
  const header = "Model,Organization,License,Rank,Score,CI,Votes,Input Price,Output Price,Context";
  const rows = models.map((m) =>
    [
      `"${m.name}"`,
      `"${m.organization}"`,
      `"${m.license}"`,
      m.rank ?? "",
      m.score ?? "",
      m.ci ?? "",
      m.votes ?? "",
      m.priceInput ?? "",
      m.priceOutput ?? "",
      m.context ?? ""
    ].join(",")
  );
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "arena-compare.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function buildMarkdownTable(models: ArenaModel[]) {
  const header = "| Model | Rank | Score | Votes | Input Price | Output Price | Context |";
  const separator = "| --- | ---: | ---: | ---: | ---: | ---: | --- |";
  const rows = models.map(
    (m) =>
      `| ${m.name} | ${m.rank ?? "—"} | ${m.score ?? "—"} ${m.ci ?? ""} | ${m.votes ?? "—"} | ${m.priceInput ?? "—"} | ${m.priceOutput ?? "—"} | ${m.context ?? "—"} |`
  );
  return [header, separator, ...rows].join("\n");
}

function buildDefaultSelection(models: ArenaModel[]) {
  const selected = preferredDefaults
    .map((keyword) => models.find((model) => normalize(model.name).includes(keyword)))
    .filter((model): model is ArenaModel => Boolean(model));
  const unique = Array.from(new Map(selected.map((model) => [model.id, model])).values());

  if (unique.length >= 3) {
    return unique.slice(0, 3).map((model) => model.id);
  }

  return models.slice(0, 3).map((model) => model.id);
}

function parsePrice(value: string | null) {
  if (!value) {
    return null;
  }

  const match = value.replace(/,/g, "").match(/[\d.]+/);
  return match ? Number(match[0]) : null;
}

function SkeletonRows() {
  return (
    <div className="space-y-2 p-2">
      {Array.from({ length: 8 }, (_, index) => (
        <div className="grid grid-cols-[34px_minmax(0,1fr)_42px_34px] items-center gap-2 rounded-md px-2 py-2" key={index}>
          <div className="size-5 animate-pulse rounded border border-ink/10 bg-ink/10" />
          <div className="space-y-2">
            <div className="h-3.5 w-4/5 animate-pulse rounded bg-ink/10" />
            <div className="h-3 w-2/3 animate-pulse rounded bg-ink/10" />
          </div>
          <div className="h-4 w-10 animate-pulse rounded bg-ink/10" />
          <div className="size-8 animate-pulse rounded-md bg-ink/10" />
        </div>
      ))}
    </div>
  );
}

export function ArenaDashboard() {
  const [apiState, setApiState] = useState<ApiState>({ status: "idle", data: null, error: null });
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [hasUserSelection, setHasUserSelection] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [language, setLanguage] = useState<Language>("zh");
  const [leaderboard, setLeaderboard] = useState<ArenaLeaderboardKind>("text");
  const [activeStorageKind, setActiveStorageKind] = useState<ArenaLeaderboardKind | null>(null);
  const [theme, setTheme] = useState<Theme>("system");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const urlParamsApplied = useRef(false);

  const t = translations[language];
  const sourceUrl = apiState.data?.sourceUrl ?? fallbackSourceUrls[leaderboard];
  const appKicker = leaderboard === "text" ? t.appKickerText : t.appKickerCode;
  const appDescription = leaderboard === "text" ? t.appDescriptionText : t.appDescriptionCode;
  const scoreChartTitle = leaderboard === "text" ? t.scoreChartText : t.scoreChartCode;
  const scoreLegend = leaderboard === "text" ? t.scoreLegendText : t.scoreLegendCode;

  const loadArenaData = useCallback(async (kind = leaderboard, resetData = false) => {
    setApiState((current) => ({
      status: "loading",
      data: resetData ? null : current.data,
      error: null
    }) as ApiState);

    try {
      const response = await fetch(`/api/arena/${kind}`, { cache: "no-store" });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error ?? "Arena sync failed");
      }

      setApiState({ status: "ready", data: payload, error: null });
    } catch (error) {
      setApiState((current) => ({
        status: "error",
        data: current.data,
        error: error instanceof Error ? error.message : "Arena sync failed"
      }));
    }
  }, [leaderboard]);

  useEffect(() => {
    setLanguage(readStoredLanguage());
    const storedTheme = readStoredTheme();
    setTheme(storedTheme);
    applyThemeClass(storedTheme);
    const urlParams = readUrlParams();
    if (urlParams?.board) {
      setLeaderboard(urlParams.board);
      if (urlParams.models && urlParams.models.length > 0) {
        setSelectedIds(urlParams.models.slice(0, maxSelected));
        setHasUserSelection(true);
        urlParamsApplied.current = true;
      }
    } else {
      setLeaderboard(readStoredLeaderboard());
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(languageKey, language);
    document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  }, [language, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    window.localStorage.setItem(themeKey, theme === "system" ? "" : theme);
    applyThemeClass(theme);
  }, [theme, storageReady]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    window.localStorage.setItem(leaderboardKey, leaderboard);
    setQuery("");
    if (!urlParamsApplied.current) {
      setHasUserSelection(false);
      setSelectedIds(readStoredIds(selectionKeyFor(leaderboard), legacySelectionKeyFor(leaderboard)).slice(0, maxSelected));
    }
    urlParamsApplied.current = false;
    setFavoriteIds(readStoredIdUnion([sharedFavoritesKey, ...legacyFavoriteKeys()]).slice(0, maxSelected));
    setActiveStorageKind(leaderboard);
    void loadArenaData(leaderboard, true);
  }, [leaderboard, loadArenaData, storageReady]);

  const models = apiState.data?.models ?? emptyModels;
  const isInitialLoading = (apiState.status === "idle" || apiState.status === "loading") && models.length === 0;

  const modelById = useMemo(() => new Map(models.map((model) => [model.id, model])), [models]);

  useEffect(() => {
    if (!storageReady || models.length === 0 || hasUserSelection || selectedIds.length > 0) {
      return;
    }

    const validFavorites = favoriteIds.filter((id) => modelById.has(id)).slice(0, maxSelected);
    setSelectedIds(validFavorites.length > 0 ? validFavorites : buildDefaultSelection(models));
  }, [favoriteIds, hasUserSelection, modelById, models, selectedIds.length, storageReady]);

  useEffect(() => {
    if (storageReady && activeStorageKind === leaderboard) {
      window.localStorage.setItem(selectionKeyFor(leaderboard), JSON.stringify(selectedIds));
    }
  }, [activeStorageKind, leaderboard, selectedIds, storageReady]);

  useEffect(() => {
    if (storageReady && activeStorageKind === leaderboard) {
      window.localStorage.setItem(sharedFavoritesKey, JSON.stringify(favoriteIds));
    }
  }, [activeStorageKind, favoriteIds, leaderboard, storageReady]);

  useEffect(() => {
    if (!storageReady || selectedIds.length === 0) return;
    const url = buildShareUrl(leaderboard, selectedIds);
    window.history.replaceState(null, "", url);
  }, [leaderboard, selectedIds, storageReady]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (document.activeElement === searchRef.current) {
          setQuery("");
          searchRef.current?.blur();
        }
        setSidebarOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filteredModels = useMemo(() => {
    const term = normalize(query);
    const source = term
      ? models.filter((model) =>
          [model.name, model.organization, model.license].some((field) => normalize(field).includes(term))
        )
      : models;

    return [...source].sort((a, b) => {
      const aFavorite = favoriteIds.includes(a.id) ? 0 : 1;
      const bFavorite = favoriteIds.includes(b.id) ? 0 : 1;

      if (aFavorite !== bFavorite) {
        return aFavorite - bFavorite;
      }

      return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER);
    });
  }, [favoriteIds, models, query]);

  const selectedModels = useMemo(
    () => selectedIds.map((id) => modelById.get(id)).filter((model): model is ArenaModel => Boolean(model)),
    [modelById, selectedIds]
  );

  const favoriteModels = useMemo(
    () => favoriteIds.map((id) => modelById.get(id)).filter((model): model is ArenaModel => Boolean(model)),
    [favoriteIds, modelById]
  );

  const scoreChartData = [...selectedModels]
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .map((model) => ({
      name: model.name,
      shortName: model.name.length > 30 ? `${model.name.slice(0, 30)}...` : model.name,
      score: model.score,
      rank: model.rank,
      votes: model.votes
    }));

  const compactChartData = selectedModels.map((model) => ({
    name: model.name.length > 22 ? `${model.name.slice(0, 22)}...` : model.name,
    score: model.score,
    rank: model.rank,
    votes: model.votes
  }));

  const bestScore = selectedModels.reduce<ArenaModel | null>(
    (best, model) => (model.score != null && (!best || model.score > (best.score ?? -Infinity)) ? model : best),
    null
  );
  const bestRank = selectedModels.reduce<ArenaModel | null>(
    (best, model) => (model.rank != null && (!best || model.rank < (best.rank ?? Infinity)) ? model : best),
    null
  );
  const mostVotes = selectedModels.reduce<ArenaModel | null>(
    (best, model) => (model.votes != null && (!best || model.votes > (best.votes ?? -Infinity)) ? model : best),
    null
  );
  const cheapestInput = selectedModels.reduce<ArenaModel | null>((best, model) => {
    const value = parsePrice(model.priceInput);
    const bestValue = best ? parsePrice(best.priceInput) : null;

    if (value == null) {
      return best;
    }

    return bestValue == null || value < bestValue ? model : best;
  }, null);

  function toggleModel(model: ArenaModel) {
    setHasUserSelection(true);
    setSelectedIds((current) => {
      if (current.includes(model.id)) {
        return current.filter((id) => id !== model.id);
      }

      if (current.length >= maxSelected) {
        return current;
      }

      return [...current, model.id];
    });
  }

  function removeModel(id: string) {
    setHasUserSelection(true);
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function toggleFavorite(model: ArenaModel) {
    setFavoriteIds((current) => {
      if (current.includes(model.id)) {
        return current.filter((id) => id !== model.id);
      }

      return [...current, model.id].slice(0, maxSelected);
    });
  }

  function saveCurrentAsFavorites() {
    setFavoriteIds(selectedIds.slice(0, maxSelected));
    showToast(t.favoritesSaved);
  }

  function applyFavorites() {
    const validFavorites = favoriteIds.filter((id) => modelById.has(id)).slice(0, maxSelected);

    if (validFavorites.length === 0) {
      return;
    }

    setHasUserSelection(true);
    setSelectedIds(validFavorites);
    showToast(t.favoritesApplied);
  }

  function resetSelection() {
    setHasUserSelection(true);
    setSelectedIds(buildDefaultSelection(models));
  }

  function handleShareLink() {
    const url = buildShareUrl(leaderboard, selectedIds);
    navigator.clipboard.writeText(url).then(() => showToast(t.linkCopied));
  }

  function handleExportCsv() {
    exportCsv(selectedModels);
    showToast(t.csvExported);
  }

  function handleCopyMarkdown() {
    const md = buildMarkdownTable(selectedModels);
    navigator.clipboard.writeText(md).then(() => showToast(t.markdownCopied));
  }

  function cycleTheme() {
    setTheme((current) => {
      if (current === "light") return "dark";
      if (current === "dark") return "system";
      return "light";
    });
  }

  const scoreChartHeight = Math.max(280, scoreChartData.length * 46 + 48);
  const maxSelectionReached = selectedIds.length >= maxSelected;
  const showEmptySearch = !isInitialLoading && models.length > 0 && filteredModels.length === 0;
  const modelCountLabel = isInitialLoading ? t.loading : `${filteredModels.length} / ${models.length} ${t.models}`;
  const syncedLabel = apiState.data
    ? `${apiState.data.cached ? t.cached : t.synced} · ${formatDate(apiState.data.fetchedAt, language)}`
    : t.loading;
  const summaryCards = [
    {
      icon: Trophy,
      label: t.bestScore,
      value: bestScore?.score?.toString() ?? t.noValue,
      detail: bestScore?.name ?? "—"
    },
    {
      icon: Hash,
      label: t.bestRank,
      value: bestRank?.rank != null ? `#${bestRank.rank}` : t.noValue,
      detail: bestRank?.name ?? "—"
    },
    {
      icon: Users,
      label: t.mostVotes,
      value: mostVotes?.votes != null ? formatNumber(mostVotes.votes, language) : t.noValue,
      detail: mostVotes?.name ?? "—"
    },
    {
      icon: DollarSign,
      label: t.cheapestInput,
      value: cheapestInput?.priceInput ?? t.noValue,
      detail: cheapestInput?.name ?? "—"
    }
  ];

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Sun;

  return (
    <main className="min-h-screen bg-surface text-ink">
      <ToastContainer />
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid gap-4 border-b border-ink/10 pb-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-sea">
              <Trophy className="size-4" />
              {appKicker}
            </div>
            <h1 className="text-2xl font-semibold tracking-normal sm:text-3xl">{t.appTitle}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-ink/65">{appDescription}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <div className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-panel p-1 text-ink/70">
              <BarChart3 className="ml-1 size-4 text-ink/45" />
              <span className="sr-only">{t.leaderboard}</span>
              <button
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  leaderboard === "text" ? "bg-sea text-white" : "hover:bg-mist"
                }`}
                onClick={() => setLeaderboard("text")}
                type="button"
              >
                {t.textLeaderboard}
              </button>
              <button
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  leaderboard === "code" ? "bg-sea text-white" : "hover:bg-mist"
                }`}
                onClick={() => setLeaderboard("code")}
                type="button"
              >
                {t.codeLeaderboard}
              </button>
            </div>
            <div className="inline-flex items-center gap-1 rounded-md border border-ink/10 bg-panel p-1 text-ink/70">
              <Languages className="ml-1 size-4 text-ink/45" />
              <button
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  language === "zh" ? "bg-sea text-white" : "hover:bg-mist"
                }`}
                onClick={() => setLanguage("zh")}
                type="button"
              >
                {t.chinese}
              </button>
              <button
                className={`rounded px-2 py-1 text-xs font-medium transition ${
                  language === "en" ? "bg-sea text-white" : "hover:bg-mist"
                }`}
                onClick={() => setLanguage("en")}
                type="button"
              >
                {t.english}
              </button>
            </div>
            <button
              className="inline-flex size-9 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/60 transition hover:border-sea/40 hover:text-sea"
              onClick={cycleTheme}
              title={t.theme}
              type="button"
            >
              <ThemeIcon className="size-4" />
            </button>
            <span className="rounded-md border border-ink/10 bg-panel px-3 py-2 text-ink/70">
              {t.selected} {selectedModels.length} / {maxSelected}
            </span>
            <span className="hidden rounded-md border border-ink/10 bg-panel px-3 py-2 text-ink/70 sm:inline-block">{syncedLabel}</span>
            <a
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-3 py-2 text-ink/70 transition hover:border-sea/40 hover:text-sea"
              href={sourceUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t.source}
              <ExternalLink className="size-4" />
            </a>
            <button
              className="inline-flex items-center gap-2 rounded-md bg-sea px-3 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={apiState.status === "loading"}
              onClick={() => loadArenaData()}
              type="button"
            >
              <RefreshCw className={`size-4 ${apiState.status === "loading" ? "animate-spin" : ""}`} />
              {t.refresh}
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-3 py-2 text-ink/70 transition hover:border-sea/40 hover:text-sea lg:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              type="button"
            >
              {sidebarOpen ? <PanelLeftClose className="size-4" /> : <PanelLeftOpen className="size-4" />}
              {t.modelPanel}
            </button>
          </div>
        </header>

        {apiState.status === "error" ? (
          <div className="rounded-md border border-coral/30 bg-coral/10 px-4 py-4 text-sm text-coral">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0" />
                <div>
                  <div className="font-semibold">{t.syncFailedTitle}</div>
                  <p className="mt-1 text-coral/85">{t.syncFailedHint}</p>
                  <p className="mt-1 text-coral/75">{t.knownLimitation}</p>
                  <p className="mt-2 font-mono text-xs text-coral/80">{apiState.error}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  className="rounded-md bg-coral px-3 py-2 text-xs font-semibold text-white transition hover:bg-coral/90"
                  onClick={() => loadArenaData()}
                  type="button"
                >
                  {t.retry}
                </button>
                <a
                  className="rounded-md border border-coral/30 bg-panel px-3 py-2 text-xs font-semibold text-coral transition hover:bg-coral/5"
                  href={sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t.source}
                </a>
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid min-h-[720px] grid-cols-1 gap-5 lg:grid-cols-[390px_minmax(0,1fr)]">
          {sidebarOpen && (
            <div className="fixed inset-0 z-30 bg-ink/30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
          <aside className={`flex min-h-0 flex-col overflow-hidden rounded-md border border-ink/10 bg-panel shadow-soft transition-all ${
            sidebarOpen
              ? "fixed inset-y-0 left-0 z-40 w-[340px] rounded-none border-0 sm:w-[390px]"
              : "hidden lg:flex"
          }`}>
            <div className="border-b border-ink/10 p-4">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink/40" />
                <input
                  ref={searchRef}
                  className="h-11 w-full rounded-md border border-ink/15 bg-mist/45 pl-10 pr-3 text-sm outline-none transition focus:border-sea focus:bg-panel"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={`${t.searchPlaceholder}  (/)`}
                  value={query}
                />
              </label>
              <div className="mt-3 flex items-center justify-between text-xs text-ink/55">
                <span>{modelCountLabel}</span>
                <span>
                  {favoriteModels.length} {t.favorites}
                </span>
              </div>
            </div>

            <div className="border-b border-ink/10 bg-mist/30 p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <Star className="size-4 fill-saffron text-saffron" />
                  {t.favoriteModels}
                </div>
                <div className="flex gap-1">
                  <button
                    className="inline-flex size-8 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/60 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={selectedModels.length === 0}
                    onClick={saveCurrentAsFavorites}
                    title={t.saveCurrent}
                    type="button"
                  >
                    <Save className="size-4" />
                  </button>
                  <button
                    className="inline-flex size-8 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/60 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={favoriteIds.length === 0}
                    onClick={applyFavorites}
                    title={t.applyFavorites}
                    type="button"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    className="inline-flex size-8 items-center justify-center rounded-md border border-ink/10 bg-panel text-ink/60 transition hover:border-coral/40 hover:text-coral disabled:opacity-35"
                    disabled={favoriteIds.length === 0}
                    onClick={() => {
                      setFavoriteIds([]);
                      showToast(t.favoritesCleared);
                    }}
                    title={t.clearFavorites}
                    type="button"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>

              {favoriteModels.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {favoriteModels.map((model) => (
                    <button
                      className="max-w-full rounded-md border border-saffron/25 bg-saffron/10 px-2.5 py-1.5 text-left text-xs font-medium text-ink transition hover:border-saffron/60"
                      key={model.id}
                      onClick={() => toggleModel(model)}
                      type="button"
                    >
                      <span className="block max-w-[280px] truncate">{model.name}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs leading-5 text-ink/55">{t.favoriteEmpty}</p>
              )}
            </div>

            {maxSelectionReached ? (
              <div className="border-b border-saffron/20 bg-saffron/10 px-4 py-2 text-xs text-ink/70">
                {t.maxSelectedNotice}
              </div>
            ) : null}

            <div className="min-h-0 flex-1 overflow-y-auto p-2">
              {isInitialLoading ? (
                <>
                  <div className="px-3 py-4 text-sm text-ink/60">
                    <div className="font-medium text-ink">{t.loadingModels}</div>
                    <div className="mt-1 text-xs">{t.loadingHint}</div>
                  </div>
                  <SkeletonRows />
                </>
              ) : null}

              {showEmptySearch ? (
                <div className="px-4 py-10 text-center">
                  <div className="text-sm font-semibold">{t.noResultsTitle}</div>
                  <p className="mt-2 text-sm text-ink/55">{t.noResultsHint}</p>
                  <button
                    className="mt-4 rounded-md border border-ink/10 bg-panel px-3 py-2 text-xs font-semibold text-ink/70 transition hover:border-sea/40 hover:text-sea"
                    onClick={() => setQuery("")}
                    type="button"
                  >
                    {t.clearSearch}
                  </button>
                </div>
              ) : null}

              {!isInitialLoading &&
                filteredModels.map((model) => {
                  const checked = selectedIds.includes(model.id);
                  const favorite = favoriteIds.includes(model.id);
                  const disabled = !checked && selectedIds.length >= maxSelected;

                  return (
                    <div
                      className={`mb-1 grid w-full grid-cols-[34px_minmax(0,1fr)_auto_34px] items-center gap-2 rounded-md px-2 py-2 transition ${
                        checked ? "bg-sea/10 ring-1 ring-sea/20" : "hover:bg-mist/50"
                      }`}
                      key={model.id}
                    >
                      <button
                        className={`flex size-5 items-center justify-center rounded border ${
                          checked ? "border-sea bg-sea text-white" : "border-ink/20 bg-panel text-transparent"
                        } disabled:opacity-35`}
                        disabled={disabled}
                        onClick={() => toggleModel(model)}
                        title={checked ? t.removeFromCompare : t.addToCompare}
                        type="button"
                      >
                        <Check className="size-3.5" />
                      </button>
                      <button
                        className="min-w-0 text-left disabled:opacity-45"
                        disabled={disabled}
                        onClick={() => toggleModel(model)}
                        type="button"
                      >
                        <span className="block truncate text-sm font-medium">{model.name}</span>
                        <span className="block truncate text-xs text-ink/50">
                          #{model.rank ?? "—"} · {model.organization} · {model.license}
                        </span>
                      </button>
                      <span className="text-sm font-semibold tabular-nums">{model.score ?? "—"}</span>
                      <button
                        className={`inline-flex size-8 items-center justify-center rounded-md transition ${
                          favorite ? "text-saffron" : "text-ink/25 hover:text-saffron"
                        }`}
                        onClick={() => toggleFavorite(model)}
                        title={favorite ? t.removeFavorite : t.saveFavorite}
                        type="button"
                      >
                        <Star className={`size-4 ${favorite ? "fill-saffron" : ""}`} />
                      </button>
                    </div>
                  );
                })}
            </div>
          </aside>

          <section className="min-w-0 space-y-5">
            <div className="rounded-md border border-ink/10 bg-panel p-4 shadow-soft">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-sea">
                    <BarChart3 className="size-4" />
                    {t.compareView}
                  </div>
                  <p className="mt-1 text-sm text-ink/55">{t.compareHint}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-2.5 py-1.5 text-xs font-medium text-ink/65 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={models.length === 0}
                    onClick={resetSelection}
                    type="button"
                  >
                    <RotateCcw className="size-3.5" />
                    {t.defaultSet}
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-ink/10 bg-panel px-2.5 py-1.5 text-xs font-medium text-ink/65 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={selectedModels.length === 0}
                    onClick={handleShareLink}
                    type="button"
                  >
                    <Link2 className="size-3.5" />
                    {t.shareLink}
                  </button>
                  {selectedModels.map((model) => (
                    <button
                      className="inline-flex max-w-[260px] items-center gap-2 rounded-md border border-ink/10 bg-mist px-2.5 py-1.5 text-xs font-medium transition hover:border-coral/40 hover:text-coral"
                      key={model.id}
                      onClick={() => removeModel(model.id)}
                      type="button"
                    >
                      <span className="truncate">{model.name}</span>
                      <X className="size-3.5 shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {summaryCards.map((card) => {
                const Icon = card.icon;

                return (
                  <div className="rounded-md border border-ink/10 bg-panel p-4 shadow-soft transition-shadow hover:shadow-lg" key={card.label}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-xs font-medium uppercase tracking-wide text-ink/45">{card.label}</div>
                      <Icon className="size-4 text-sea" />
                    </div>
                    <div className="mt-2 text-xl font-semibold tabular-nums">{card.value}</div>
                    <div className="mt-1 truncate text-xs text-ink/50">{card.detail}</div>
                  </div>
                );
              })}
            </div>

            {selectedModels.length < 2 ? (
              <div className="rounded-md border border-saffron/30 bg-saffron/10 px-4 py-4 text-sm">
                {t.needMoreModels}
              </div>
            ) : null}

            <div className="rounded-md border border-ink/10 bg-panel p-4 shadow-soft animate-fade-in">
              <h2 className="text-base font-semibold">{scoreChartTitle}</h2>
              <div className="mt-4" style={{ height: scoreChartHeight }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={scoreChartData}
                    layout="vertical"
                    margin={{ left: 12, right: 28, top: 8, bottom: 8 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" horizontal={false} />
                    <XAxis domain={["dataMin - 15", "dataMax + 8"]} tick={{ fontSize: 12, fill: "var(--color-ink)" }} type="number" />
                    <YAxis dataKey="shortName" tick={{ fontSize: 12, fill: "var(--color-ink)" }} type="category" width={210} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-panel)", border: "1px solid var(--chart-grid)", color: "var(--color-ink)" }} />
                    <Legend />
                    <Bar dataKey="score" fill="var(--chart-score)" name={scoreLegend} radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-md border border-ink/10 bg-panel p-4 shadow-soft animate-fade-in">
              <h2 className="text-base font-semibold">{t.rankVotes}</h2>
              <div className="mt-4 h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={compactChartData} margin={{ left: 0, right: 12, top: 8, bottom: 28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                    <XAxis dataKey="name" angle={-20} interval={0} textAnchor="end" tick={{ fontSize: 11, fill: "var(--color-ink)" }} />
                    <YAxis yAxisId="left" reversed tick={{ fontSize: 12, fill: "var(--color-ink)" }} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "var(--color-ink)" }} />
                    <Tooltip contentStyle={{ backgroundColor: "var(--color-panel)", border: "1px solid var(--chart-grid)", color: "var(--color-ink)" }} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="rank" fill="var(--chart-rank)" name={t.rankLegend} radius={[4, 4, 0, 0]} />
                    <Bar yAxisId="right" dataKey="votes" fill="var(--chart-votes)" name={t.votesLegend} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="overflow-hidden rounded-md border border-ink/10 bg-panel shadow-soft">
              <div className="flex items-center justify-between border-b border-ink/10 px-4 py-3">
                <h2 className="text-base font-semibold">{t.priceTable}</h2>
                <div className="flex gap-1">
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-panel px-2.5 py-1.5 text-xs font-medium text-ink/60 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={selectedModels.length === 0}
                    onClick={handleExportCsv}
                    type="button"
                  >
                    <Download className="size-3.5" />
                    {t.exportCsv}
                  </button>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-md border border-ink/10 bg-panel px-2.5 py-1.5 text-xs font-medium text-ink/60 transition hover:border-sea/40 hover:text-sea disabled:opacity-35"
                    disabled={selectedModels.length === 0}
                    onClick={handleCopyMarkdown}
                    type="button"
                  >
                    <Link2 className="size-3.5" />
                    {t.copyMarkdown}
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-ink/10 bg-mist/70 text-xs uppercase tracking-wide text-ink/55">
                    <tr>
                      <th className="px-4 py-3">{t.tableModel}</th>
                      <th className="px-4 py-3 text-right">{t.tableRank}</th>
                      <th className="px-4 py-3 text-right">{t.tableScore}</th>
                      <th className="px-4 py-3 text-right">{t.tableVotes}</th>
                      <th className="px-4 py-3 text-right">{t.tableInputPrice}</th>
                      <th className="px-4 py-3 text-right">{t.tableOutputPrice}</th>
                      <th className="px-4 py-3 text-right">{t.tableContext}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedModels.map((model) => (
                      <tr className="border-b border-ink/5 last:border-0 transition-colors hover:bg-mist/30" key={model.id}>
                        <td className="px-4 py-3">
                          <div className="max-w-[320px] truncate font-medium">{model.name}</div>
                          <div className="text-xs text-ink/50">
                            {model.organization} · {model.license}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-saffron tabular-nums">
                          #{model.rank ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-sea tabular-nums">
                          {model.score ?? "—"} <span className="text-xs font-normal text-ink/45">{model.ci}</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatNumber(model.votes, language)}</td>
                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{model.priceInput ?? "—"}</td>
                        <td className="px-4 py-3 text-right tabular-nums whitespace-nowrap">{model.priceOutput ?? "—"}</td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">{model.context ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
