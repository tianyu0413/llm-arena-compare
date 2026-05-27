import * as cheerio from "cheerio";

export const ARENA_TEXT_SOURCE_URL = "https://arena.ai/leaderboard/text";
export const ARENA_CODE_SOURCE_URL = "https://arena.ai/leaderboard/code/webdev";
export const CACHE_TTL_MS = 5 * 60_000;

export type ArenaLeaderboardKind = "text" | "code";

export type ArenaModel = {
  id: string;
  name: string;
  organization: string;
  license: string;
  rank: number | null;
  score: number | null;
  ci: string | null;
  votes: number | null;
  priceInput: string | null;
  priceOutput: string | null;
  context: string | null;
};

export type ArenaLeaderboardResponse = {
  sourceUrl: string;
  fetchedAt: string;
  cached: boolean;
  models: ArenaModel[];
};

export type ArenaTextResponse = ArenaLeaderboardResponse;

export function slugifyModelName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumber(value: string | undefined): number | null {
  if (!value) {
    return null;
  }

  const cleaned = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return cleaned ? Number(cleaned[0]) : null;
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").replace(/\u00a0/g, " ").trim();
}

function splitScore(value: string): { score: number | null; ci: string | null } {
  const score = parseNumber(value);
  const ciMatch = value.match(/±\s*([\d.]+)/);
  const rangeMatch = value.match(/\+([\d.]+)\s*\/\s*-([\d.]+)/);

  return {
    score,
    ci: ciMatch ? `±${ciMatch[1]}` : rangeMatch ? `+${rangeMatch[1]}/-${rangeMatch[2]}` : null
  };
}

function splitPrice(value: string): { priceInput: string | null; priceOutput: string | null } {
  const parts = value
    .split("/")
    .map((part) => normalizeText(part))
    .filter(Boolean);

  if (parts.length >= 2) {
    return {
      priceInput: parts[0],
      priceOutput: parts[1]
    };
  }

  return {
    priceInput: value ? normalizeText(value) : null,
    priceOutput: null
  };
}

function extractOrganizationAndLicense(modelCellText: string, modelName: string) {
  const suffix = normalizeText(modelCellText.split(modelName).pop() ?? "");
  const knownLicenses = ["Proprietary", "Open Source", "Open Weight", "Research"];
  const license = knownLicenses.find((item) => suffix.includes(item)) ?? "Unknown";
  const organization = normalizeText(suffix.replace(license, "").replace(/[·•]/g, "")) || "Unknown";

  return { organization, license };
}

function parseTableRows(html: string): ArenaModel[] {
  const $ = cheerio.load(html);
  const models: ArenaModel[] = [];

  $("tr").each((_, row) => {
    const cells = $(row)
      .find("th,td")
      .map((__, cell) => normalizeText($(cell).text()))
      .get()
      .filter(Boolean);

    if (cells.length < 4 || !/^\d+$/.test(cells[0])) {
      return;
    }

    const modelLink = $(row)
      .find("a")
      .filter((__, link) => normalizeText($(link).text()).length > 0)
      .first();
    const modelName = normalizeText(modelLink.text()) || cells[2] || cells[1];
    const { organization, license } = extractOrganizationAndLicense(cells[2] ?? modelName, modelName);
    const scoreDetails = splitScore(cells[3] ?? "");
    const price = splitPrice(cells[5] ?? "");

    models.push({
      id: slugifyModelName(modelName),
      name: modelName,
      organization,
      license,
      rank: parseNumber(cells[0]),
      score: scoreDetails.score,
      ci: scoreDetails.ci,
      votes: parseNumber(cells[4]),
      priceInput: price.priceInput,
      priceOutput: price.priceOutput,
      context: cells[6] ?? null
    });
  });

  return dedupeModels(models);
}

function parseRscFallback(html: string): ArenaModel[] {
  const text = normalizeText(
    cheerio
      .load(html)
      .root()
      .text()
      .replace(/\\"/g, '"')
  );
  const rankTableStart = text.indexOf("Rank Rank Spread Model Score Votes");

  if (rankTableStart === -1) {
    return [];
  }

  const sliced = text.slice(rankTableStart, rankTableStart + 200_000);
  const rankPattern =
    /(?:^|\s)(\d{1,3})\s+\d{1,3}\s+\d{1,3}\s+([a-zA-Z0-9][a-zA-Z0-9._()[\]\-:/ ]{2,120}?)([A-Z][A-Za-z0-9 .&-]{1,40})\s+(Proprietary|Open Source|Open Weight|Research)\s+(\d{3,4})\s*±\s*([\d.]+)(?:\s+Preliminary)?\s+([\d,]+)/g;

  const models: ArenaModel[] = [];
  let match: RegExpExecArray | null;

  while ((match = rankPattern.exec(sliced)) !== null) {
    const [, rank, rawName, organization, license, score, ci, votes] = match;
    const name = normalizeText(rawName);

    if (!name || name.toLowerCase().includes("rank spread")) {
      continue;
    }

    models.push({
      id: slugifyModelName(name),
      name,
      organization: normalizeText(organization),
      license,
      rank: parseNumber(rank),
      score: parseNumber(score),
      ci: `±${ci}`,
      votes: parseNumber(votes),
      priceInput: null,
      priceOutput: null,
      context: null
    });
  }

  return dedupeModels(models);
}

function dedupeModels(models: ArenaModel[]): ArenaModel[] {
  const seen = new Set<string>();
  return models.filter((model) => {
    if (!model.id || seen.has(model.id)) {
      return false;
    }
    seen.add(model.id);
    return true;
  });
}

export function parseArenaLeaderboard(html: string): ArenaModel[] {
  const tableModels = parseTableRows(html);

  if (tableModels.length > 0) {
    return tableModels;
  }

  return parseRscFallback(html);
}

export const parseArenaTextLeaderboard = parseArenaLeaderboard;
