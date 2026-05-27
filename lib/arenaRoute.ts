import { NextResponse } from "next/server";
import {
  ARENA_CODE_SOURCE_URL,
  ARENA_TEXT_SOURCE_URL,
  CACHE_TTL_MS,
  type ArenaLeaderboardKind,
  type ArenaLeaderboardResponse,
  parseArenaLeaderboard
} from "@/lib/arena";

type CacheEntry = {
  response: ArenaLeaderboardResponse | null;
  cachedAt: number;
};

const cacheByKind = new Map<ArenaLeaderboardKind, CacheEntry>();

const sourceByKind: Record<ArenaLeaderboardKind, string> = {
  text: ARENA_TEXT_SOURCE_URL,
  code: ARENA_CODE_SOURCE_URL
};

export async function getArenaLeaderboard(kind: ArenaLeaderboardKind) {
  const now = Date.now();
  const cached = cacheByKind.get(kind);
  const sourceUrl = sourceByKind[kind];

  if (cached?.response && now - cached.cachedAt < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.response, cached: true });
  }

  try {
    const response = await fetch(sourceUrl, {
      headers: {
        "user-agent": `Mozilla/5.0 (compatible; LlmArenaCompare/0.1; +${sourceUrl})`,
        accept: "text/html,application/xhtml+xml"
      },
      cache: "no-store"
    });

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `Arena returned ${response.status} ${response.statusText}`,
          sourceUrl
        },
        { status: 502 }
      );
    }

    const html = await response.text();
    const models = parseArenaLeaderboard(html);

    if (models.length === 0) {
      return NextResponse.json(
        {
          error: "Could not parse any models from the public Arena leaderboard page.",
          sourceUrl
        },
        { status: 502 }
      );
    }

    const payload: ArenaLeaderboardResponse = {
      sourceUrl,
      fetchedAt: new Date().toISOString(),
      cached: false,
      models
    };

    cacheByKind.set(kind, {
      response: payload,
      cachedAt: now
    });

    return NextResponse.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown fetch error";

    return NextResponse.json(
      {
        error: message,
        sourceUrl
      },
      { status: 502 }
    );
  }
}
