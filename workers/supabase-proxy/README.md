# Supabase Edge Function 프록시

Cloudflare/Vercel/Netlify 워커와 동일한 CORS 프록시를 Supabase Edge Functions(Deno)로 배포.
**카드(결제정보) 등록 불필요** — 무료 한도 50만 호출/월.

```
workers/supabase-proxy/
└─ supabase/functions/proxy/index.ts   # Deno.serve 핸들러
```

## 배포 방법 (CLI)

```bash
brew install supabase/tap/supabase     # 최초 1회 (또는 npm i -g supabase)
cd workers/supabase-proxy
supabase login                          # 브라우저 인증 (카드 없이 가입)
# 1) 프로젝트가 없으면 supabase.com 대시보드에서 무료 프로젝트 생성 → project-ref 확인
# 2) 함수 배포 (공개 프록시 → JWT 검증 끔)
supabase functions deploy proxy --no-verify-jwt --project-ref <PROJECT_REF>
```

배포 후 함수 URL:
```
https://<PROJECT_REF>.supabase.co/functions/v1/proxy
```

> ⚠️ `--no-verify-jwt` 필수 — 없으면 모든 요청에 Authorization 헤더를 요구해 공개 프록시로 못 씀.

## 앱에 연결

1. 루트 `.env.production` 의 `VITE_PROXY_URL_6` 주석 해제 후 위 URL 로 교체:
   ```
   VITE_PROXY_URL_6=https://<PROJECT_REF>.supabase.co/functions/v1/proxy
   ```
2. 앱 재빌드/배포 (`npm run deploy`).
   - 클라이언트는 이미 6번째 슬롯을 인식함 (`src/lib/api.ts` PUBLIC_PROXY_URLS).

## 동작 확인

```bash
BASE="https://<PROJECT_REF>.supabase.co/functions/v1/proxy"
# 200 + JSON 이면 정상
curl "$BASE/?url=https%3A%2F%2Fwts-info-api.tossinvest.com%2Fapi%2Fv3%2Fstock-prices%3Fmeta%3Dtrue%26productCodes%3DA005930"
```

## 한도 / 비고

- 무료 50만 호출/월. Netlify·Cloudflare보다 낮으니 라운드로빈 보조용.
- 카드 미등록이라 초과해도 과금 없음.
- investing.com 은 IP 봇차단으로 막힐 수 있음(Netlify와 동일) → `fetchProxied` 자동 fallback.
