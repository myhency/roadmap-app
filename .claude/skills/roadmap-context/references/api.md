# API 변경 이력

API 엔드포인트 및 라우터 변경 사항

---

## 2024-12-28

### DB 내보내기/가져오기 API

- `GET /api/export-db` - SQLite DB 파일 다운로드
- `POST /api/import-db` - DB 파일 업로드로 현재 DB 교체 (백업 후 복원 지원)

---

## 초기 구조

### 기본 엔드포인트

- `GET /` - 대시보드 페이지
- `GET /api/dashboard/summary` - 진행 요약
- `GET /api/years` - 연도 목록
- `GET /api/gantt/data` - 간트 데이터
- `/api/goals/` - Goal CRUD
- `/api/milestones/` - Milestone CRUD
- `/api/tasks/` - Task CRUD
- `/api/members/` - Member CRUD
- `/api/ideas/` - Idea CRUD
