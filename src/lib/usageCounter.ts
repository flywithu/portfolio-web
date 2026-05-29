// 프록시 호출 카운터 — 이 브라우저에서 보낸 fetchProxied 횟수(일자별)를 localStorage 에 저장.
// 개인 워커 사용 시 = 개인 워커 호출수와 동일(라운드로빈 비활성). 공개 시 = 전체 공개 워커 호출 합.
// 캐시 히트(react-query)는 카운트 안 됨 — 실제 네트워크 호출만.

const KEY_PREFIX = "portfolio_proxy_calls_";

function ymd(d = new Date()): string {
  return d.getFullYear() + "-"
    + String(d.getMonth() + 1).padStart(2, "0") + "-"
    + String(d.getDate()).padStart(2, "0");
}
function key(date: Date): string { return KEY_PREFIX + ymd(date); }

export function incrementProxyCall(): void {
  try {
    const k = key(new Date());
    const cur = Number(localStorage.getItem(k) ?? "0");
    localStorage.setItem(k, String(cur + 1));
  } catch { /* noop */ }
}

export function getTodayProxyCalls(): number {
  try { return Number(localStorage.getItem(key(new Date())) ?? "0"); }
  catch { return 0; }
}

// 오늘 포함 최근 N일 합계
export function getRecentProxyCalls(days = 7): number {
  let sum = 0;
  try {
    const now = Date.now();
    for (let d = 0; d < days; d++) {
      const date = new Date(now - d * 86_400_000);
      sum += Number(localStorage.getItem(key(date)) ?? "0");
    }
  } catch { /* noop */ }
  return sum;
}

// 30일보다 오래된 키 정리 (앱 시작 시 1회 호출)
export function cleanupOldProxyCalls(): void {
  try {
    const cutoff = ymd(new Date(Date.now() - 30 * 86_400_000));
    for (const k of Object.keys(localStorage)) {
      if (!k.startsWith(KEY_PREFIX)) continue;
      const date = k.slice(KEY_PREFIX.length);
      if (date < cutoff) localStorage.removeItem(k);
    }
  } catch { /* noop */ }
}
