# Roadmap Dashboard 프로젝트

이 프로젝트에서 작업할 때 반드시 `roadmap-context` 스킬을 참조하세요.

## 필수 스킬

- **roadmap-context**: 프로젝트 구조, API, 데이터 모델 등 컨텍스트 제공
  - 코드 수정, 버그 수정, 기능 추가 전에 항상 이 스킬을 먼저 확인
  - 작업 완료 후 references/ 폴더의 문서 업데이트 필수

## 빠른 참조

- **기술 스택**: FastAPI + SQLAlchemy + SQLite / Vanilla JS + CSS
- **서버**: `uvicorn app.main:app --reload --port 8000`
- **DB 파일**: `roadmap.db`

## 주요 기능

1. 대시보드 (목표 진행 현황)
2. 간트차트 (타임라인)
3. PDF 내보내기
4. DB 내보내기/가져오기 (팀 데이터 공유)
5. 아이디어 관리
