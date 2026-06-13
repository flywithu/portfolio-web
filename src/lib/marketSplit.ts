// 보유 종목 시장 분리 — 코스피 / 코스닥 / ETF / 기타(미국상장 등). PC·모바일 공용.
import type { Stock } from "../types";
import { isEtfByName } from "./format";

export type MarketCat = "KOSPI" | "KOSDAQ" | "ETF" | "기타";

export const MARKET_CAT_LABEL: Record<MarketCat, string> = {
  KOSPI: "코스피", KOSDAQ: "코스닥", ETF: "ETF", 기타: "기타",
};
// 섹션 표시 순서
export const MARKET_CAT_ORDER: MarketCat[] = ["KOSPI", "KOSDAQ", "ETF", "기타"];

export function marketCatOf(
  s: Stock, krMarketMap: Map<string, string>
): MarketCat {
  if (isEtfByName(s.name)) return "ETF";
  const m = krMarketMap.get(s.ticker);
  if (m === "KOSDAQ") return "KOSDAQ";
  if (m === "KOSPI") return "KOSPI";
  return "기타";   // 미국상장 등 — 코스피/코스닥 분류 안 되는 종목
}

export interface MarketSection { key: MarketCat; label: string; stocks: Stock[]; }

// 존재하는 카테고리만 순서대로 반환
export function splitByMarket(
  stocks: Stock[], krMarketMap: Map<string, string>
): MarketSection[] {
  const by: Record<MarketCat, Stock[]> = { KOSPI: [], KOSDAQ: [], ETF: [], 기타: [] };
  for (const s of stocks) by[marketCatOf(s, krMarketMap)].push(s);
  return MARKET_CAT_ORDER
    .filter(k => by[k].length > 0)
    .map(k => ({ key: k, label: MARKET_CAT_LABEL[k], stocks: by[k] }));
}

// 보유(내꺼, shares>0) / 미보유(내꺼아님) 로 먼저 나누고, 각각을 시장별로 분리.
export interface HeldMarketSplit {
  held: MarketSection[];      // 내꺼 — 코스피/코스닥/ETF/기타 (보유분)
  notHeld: MarketSection[];   // 내꺼아님 — 코스피/코스닥/ETF/기타 (관심·0주)
}
export function splitHeldAndMarket(
  stocks: Stock[], krMarketMap: Map<string, string>
): HeldMarketSplit {
  const held: Stock[] = [];
  const notHeld: Stock[] = [];
  for (const s of stocks) (s.shares > 0 ? held : notHeld).push(s);
  return {
    held: splitByMarket(held, krMarketMap),
    notHeld: splitByMarket(notHeld, krMarketMap),
  };
}
