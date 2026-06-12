// "내꺼먼저" — 켜면 보유 종목(shares>0)을 목록 위로 정렬. localStorage 저장.
const KEY = "held_first";

export function getHeldFirst(): boolean {
  try { return localStorage.getItem(KEY) === "1"; }
  catch { return false; }
}
export function setHeldFirst(v: boolean): void {
  try { localStorage.setItem(KEY, v ? "1" : "0"); }
  catch { /* noop */ }
}
