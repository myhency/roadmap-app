---
name: roadmap-context
description: Roadmap Dashboard 프로젝트의 컨텍스트를 제공하는 skill. 이 프로젝트 관련 모든 작업에서 자동으로 사용. 코드 수정, 버그 수정, 기능 추가, 파일 탐색 등 roadmap 프로젝트 작업 시 항상 먼저 이 skill을 참조. **중요**: 코드 변경 완료 후 반드시 주제별 파일(models.md, api.md, ui.md, features.md) 업데이트할 것.
---

# Roadmap Dashboard 프로젝트 컨텍스트

## 기술 스택

**Backend**: FastAPI + SQLAlchemy + SQLite + Pydantic
**Frontend**: Vanilla JS + Jinja2 + CSS
**Server**: Uvicorn (port 8000)

## 프로젝트 구조

```
roadmap/
├── app/
│   ├── main.py          # FastAPI 앱, 라우터 등록, 대시보드 API
│   ├── database.py      # DB 연결, 세션 관리
│   ├── models.py        # SQLAlchemy ORM 모델
│   ├── schemas.py       # Pydantic 스키마
│   └── routers/         # API 라우터
│       ├── goals.py
│       ├── milestones.py
│       ├── tasks.py
│       ├── members.py
│       └── ideas.py
├── static/
│   ├── css/style.css
│   └── js/              # 클라이언트 JS
├── templates/           # Jinja2 HTML 템플릿
└── roadmap.db           # SQLite 데이터베이스
```

## 데이터 모델 (계층 구조)

```
Goal (목표)
 ├── type: 'issue' | 'feature' | 'feedback'
 ├── year, quarter (Q1-Q4), team, product, tags
 ├── progress: 0-100
 └── Milestone[] (마일스톤)
      ├── start_date, due_date, progress
      └── Task[] (작업)
           ├── assignee_id → Member
           └── start_date, due_date, progress

Member (멤버)
 ├── name, role (PM/Developer/Designer/QA)
 ├── team, product, type ('existing'|'new')
 └── year, join_date

Idea (아이디어)
 ├── type: 'issue' | 'feature'
 ├── year, product, priority (1-3)
 ├── status: 'open'|'approved'|'rejected'|'converted'
 └── Comment[] (댓글)
```

## 주요 API 엔드포인트

| 엔드포인트 | 설명 |
|-----------|------|
| `GET /` | 메인 대시보드 페이지 |
| `GET /api/dashboard/summary?year=` | 진행 상황 요약 |
| `GET /api/years` | 사용 가능 연도 목록 |
| `GET /api/gantt/data?year=` | 간트차트 데이터 |
| `GET /api/export-db` | DB 파일 내보내기 |
| `POST /api/import-db` | DB 파일 가져오기 |
| `/api/goals/` | Goal CRUD |
| `/api/milestones/` | Milestone CRUD |
| `/api/tasks/` | Task CRUD |
| `/api/members/` | Member CRUD |
| `/api/ideas/` | Idea CRUD |

## 주요 기능

1. **대시보드**: 연도별 목표 진행 현황 (type/team/product별 통계)
2. **간트차트**: Goal → Milestone → Task 계층 시각화
3. **PDF 내보내기**: 진행 차트 + 목표 목록 PDF 생성
4. **아이디어 관리**: 아이디어 등록, 우선순위, 상태 관리, 댓글
5. **DB 내보내기/가져오기**: SQLite 파일로 데이터 공유 (메신저 등으로 파일 전송)

## 개발 명령어

```bash
# 서버 실행
uvicorn app.main:app --reload --port 8000

# 또는
python -m app.main
```

## 변경 이력 (필수)

**코드 변경 작업 완료 후 반드시 해당 주제의 파일을 업데이트할 것.**

| 변경 유형 | 파일 |
| --------- | ---- |
| 모델/스키마 변경 | [models.md](references/models.md) |
| API 엔드포인트 | [api.md](references/api.md) |
| UI/프론트엔드 | [ui.md](references/ui.md) |
| 새 기능/주요 변경 | [features.md](references/features.md) |

업데이트 형식:

```markdown
## YYYY-MM-DD

### 변경 제목

- 변경 내용 설명
```
