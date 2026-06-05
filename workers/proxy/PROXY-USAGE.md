# 전용 프록시 사용량 표시 (`/usage` + Cloudflare API 토큰)

설정 → 전용 프록시에서 각 프록시의 **오늘 요청수 / 100,000** 막대를 보고 싶을 때만.
설정 안 해도 모든 기능은 정상이며, 사용량만 "미지원"으로 안내됩니다.

> **왜 워커를 거치나요?** `api.cloudflare.com` 은 브라우저 CORS 를 허용하지 않아 앱에서 직접 조회가 불가능합니다.
> 그래서 워커가 `/usage` 에서 대신 조회합니다. **API 토큰은 워커 환경변수(서버측)** 에만 두어 브라우저에 노출되지 않습니다.

---

## 1) 워커 코드 최신화
[UPDATE-POST-SUPPORT.md](./UPDATE-POST-SUPPORT.md) 의 **업데이트 절차(1~5단계)** 로 최신 `worker.js` 를 붙여넣고 Deploy 하면
`/usage` 엔드포인트가 포함됩니다. (이미 최신이면 생략)

## 2) Cloudflare API 토큰 만들기
1. https://dash.cloudflare.com/profile/api-tokens → **Create Token** → **Create Custom Token → Get started**
2. **Token name**: 아무 이름 입력 (예: `portfolio-usage`) — **필수** (안 넣으면 "Enter a name for your token" 에러)
3. **Permissions**: 드롭다운 3개를 **Account / Account Analytics / Read** 로 설정 (읽기 전용, 최소 권한)
4. **Account Resources**: **Include / 내 계정** 선택
5. **Client IP Address Filtering**: 비워둠 (모든 IP 허용 — 기본값)
6. 맨 아래 **Continue to summary → Create Token**
7. 생성된 토큰 값 복사 (이 화면에서 **한 번만** 표시 — 못 보면 새로 만들기)

## 3) 워커 환경변수 설정
대시보드 → 내 워커 → **Settings → Variables and Secrets** 에서 추가 후 **Deploy/Save**:

| 이름 | 값 | 종류 |
|---|---|---|
| `CF_API_TOKEN` | 2)에서 만든 토큰 | **Secret (Encrypt)** |
| `CF_ACCOUNT_ID` | 계정 ID (아래 참고) | Text |
| `CF_SCRIPT_NAME` | (선택) 이 워커 스크립트명 | Text |

**Account ID 찾는 법** (비밀값 아님, 그냥 식별자):
- **URL에서 가장 쉬움**: 로그인 후 주소창 `https://dash.cloudflare.com/<여기가-Account-ID>/workers/...` — `dash.cloudflare.com/` 바로 뒤 긴 문자열.
- 또는 **Workers & Pages** 우측 **Account details** 에 *Account ID* + 복사 버튼.
- 또는 도메인 → **Overview** → 우측 **API** 박스의 *Account ID*.

> `CF_API_TOKEN`(시크릿)과 다른 값입니다. 토큰=비밀번호, Account ID=계정 번호.

- `CF_SCRIPT_NAME` 을 넣으면 **이 워커만의** 요청수, 비우면 **계정 전체** Workers 요청수(대시보드 "Requests today"와 동일).

## 4) 확인
브라우저에서 `https<나의-워커>/usage` 접속 → 아래면 성공:

```json
{ "requests": 9101, "limit": 100000, "date": "2026-06-06" }
```

이제 앱 **설정 → 전용 프록시** 에서 프록시마다 사용량 막대가 표시됩니다.

---

### 응답 종류
- `{ "requests": N, "limit": 100000, "date": "..." }` → 정상 (앱에 사용량 표시)
- `{ "error": "not-configured" }` → 토큰/계정ID 미설정 (앱은 "사용량 미지원" 안내)
- 그 외/에러 → 앱은 사용량 숨기고 안내만 표시

### 참고
- 무료 한도는 **계정 단위 100,000 req/day** (워커 개수와 무관).
- GraphQL Analytics 수치는 수 분 지연될 수 있습니다.
- 여러 워커(프록시)를 각자 따로 집계하려면 워커마다 `CF_SCRIPT_NAME` 을 지정하세요.
