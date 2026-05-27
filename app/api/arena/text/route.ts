import { getArenaLeaderboard } from "@/lib/arenaRoute";

export const dynamic = "force-dynamic";

export async function GET() {
  return getArenaLeaderboard("text");
}
