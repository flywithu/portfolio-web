// 그룹별 독립 보유 모드
// — OFF (default): 같은 ticker 가 모든 그룹에서 동일 값 (auto-sync)
// — ON: 그룹별 독립 보유 (서로 다른 평단/수량 가능 — 다중 계좌 시나리오)

const KEY = "portfolio_independent_groups";

export function getIndependentGroupsMode(): boolean {
  try { return localStorage.getItem(KEY) === "1"; }
  catch { return false; }
}

export function setIndependentGroupsMode(v: boolean): void {
  try { localStorage.setItem(KEY, v ? "1" : "0"); }
  catch { /* noop */ }
}
