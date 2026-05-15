// 시스템 탭 (주요지수 / 반도체 / 내주식) 표시 여부 — localStorage 기반.
// 기본값: 모두 ON. 사용자가 OFF 한 탭만 false 저장.

export interface TabVisibility {
  usMarket: boolean;
  semiCheck: boolean;
  myStocks: boolean;
}

const KEY_US = "portfolio_tab_us_market";
const KEY_SEMI = "portfolio_tab_semi_check";
const KEY_MY = "portfolio_tab_my_stocks";

function read(key: string): boolean {
  try {
    const v = localStorage.getItem(key);
    return v === null ? true : v === "1";
  } catch { return true; }
}
function write(key: string, v: boolean): void {
  try { localStorage.setItem(key, v ? "1" : "0"); }
  catch { /* noop */ }
}

export function getTabVisibility(): TabVisibility {
  return {
    usMarket: read(KEY_US),
    semiCheck: read(KEY_SEMI),
    myStocks: read(KEY_MY),
  };
}

export function setTabVisibility(patch: Partial<TabVisibility>): void {
  if (patch.usMarket !== undefined) write(KEY_US, patch.usMarket);
  if (patch.semiCheck !== undefined) write(KEY_SEMI, patch.semiCheck);
  if (patch.myStocks !== undefined) write(KEY_MY, patch.myStocks);
}
