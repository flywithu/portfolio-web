// 그룹(account)별 예수금 — localStorage 기반 (브라우저별).
// { [account: string]: number } 형태. 0 이하는 저장하지 않고 삭제.
// export/import 동기화는 exportAll.settings.deposits 로 함께 처리.

const KEY = "portfolio_deposits";

export function getDeposits(): Record<string, number> {
  try {
    const v = localStorage.getItem(KEY);
    if (!v) return {};
    const obj: unknown = JSON.parse(v);
    if (!obj || typeof obj !== "object") return {};
    const out: Record<string, number> = {};
    for (const [k, val] of Object.entries(obj as Record<string, unknown>)) {
      if (typeof val === "number" && Number.isFinite(val) && val > 0) out[k] = val;
    }
    return out;
  } catch {
    return {};
  }
}

export function getDeposit(account: string): number {
  const d = getDeposits()[account];
  return Number.isFinite(d) ? d : 0;
}

// 모든 그룹 예수금 합 — 합산(내주식) 탭용
export function getTotalDeposits(): number {
  return Object.values(getDeposits()).reduce((a, b) => a + b, 0);
}

export function setDeposit(account: string, amount: number): void {
  try {
    const all = getDeposits();
    if (Number.isFinite(amount) && amount > 0) all[account] = Math.round(amount);
    else delete all[account];
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* noop */
  }
}

// import 시 통째로 교체 (Drive 동기화)
export function replaceAllDeposits(map?: Record<string, number>): void {
  try {
    if (!map || typeof map !== "object") return;
    const clean: Record<string, number> = {};
    for (const [k, v] of Object.entries(map)) {
      if (typeof v === "number" && Number.isFinite(v) && v > 0) clean[k] = Math.round(v);
    }
    localStorage.setItem(KEY, JSON.stringify(clean));
  } catch {
    /* noop */
  }
}
