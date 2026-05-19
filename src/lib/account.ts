// account 정규화 — 공백 trim 만 수행.
// "보유" 도 이제 일반 사용자 그룹이므로 별도 변환 안 함
// (레거시 account="" → "보유" 데이터 통합은 migrateEmptyAccountToHolding 가 담당).
export function normalizeAccount(acc: string | null | undefined): string {
  return (acc ?? "").trim();
}
