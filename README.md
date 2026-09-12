# 통증 운동 기록

날짜별 아침·오후·밤 통증(0–5)과 세 가지 운동 시간을 기록하는 모바일 웹앱입니다.

- 전체보기: 통증 최솟값–최댓값, 하루 운동 시간 합계, 추가 활동 내용
- 가족용 접근 암호: 같은 기록 보기
- 편집용 접근 암호: 입력과 수정
- 저장 버전 검사로 다른 기기의 변경을 덮어쓰지 않도록 보호

## GitHub Pages

GitHub Pages serves the static frontend in `docs/`. Build it with:

```
npm ci
npx vite build --config vite.pages.config.ts
```

The frontend calls a separate authenticated API. GitHub does not store journal data or access codes. Access codes remain in memory only and are never embedded in the site bundle. Server-side code checks the access code digest and write permission for every request. The existing database is retained.

For the server, configure `RECORD_OWNER_ID`, `RECORD_ALLOWED_ORIGIN`, `RECORD_EDITOR_HASH`, and `RECORD_VIEWER_HASH` as runtime settings. Digests and owner identifiers are server-only. Never add real records, access codes, or local runtime folders to this repository.

The app uses React, Vite, and an authenticated Cloudflare D1 API. Existing records are imported; the original spreadsheet is not continuously synchronized.
