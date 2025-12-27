---
description: Roadmap Dashboard 프론트엔드 테스트 실행 (vibium 브라우저 자동화)
allowed-tools: mcp__vibium__browser_launch, mcp__vibium__browser_navigate, mcp__vibium__browser_click, mcp__vibium__browser_type, mcp__vibium__browser_screenshot, mcp__vibium__browser_find, mcp__vibium__browser_quit, Bash, Read
---

Roadmap Dashboard 프론트엔드 테스트를 수행한다.

## 프로젝트 정보

- 프로젝트 경로: /Users/james/Developer/roadmap
- 서버 실행: `uvicorn app.main:app --reload --port 8000`
- 테스트 URL: http://localhost:8000

## 테스트 실행 절차

1. 서버가 실행 중인지 확인하고, 실행 중이지 않으면 백그라운드로 서버를 시작한다
2. vibium 브라우저를 실행한다: `mcp__vibium__browser_launch()`
3. 페이지로 이동한다: `mcp__vibium__browser_navigate(url="http://localhost:8000")`
4. 사용자가 요청한 테스트를 수행한다
5. 스크린샷을 캡처하여 결과를 확인한다
6. 테스트 완료 후 브라우저를 종료한다: `mcp__vibium__browser_quit()`

## CSS 선택자 참조

SKILL.md 파일에서 주요 CSS 선택자를 확인할 수 있다:
- 파일 위치: /Users/james/Developer/roadmap/.claude/skills/front-test/SKILL.md

## 주요 선택자 요약

### 탭 네비게이션
- 대시보드: `.tab-btn[data-tab="dashboard"]`
- 목표 관리: `.tab-btn[data-tab="goal-manager"]`
- 인력 관리: `.tab-btn[data-tab="members"]`
- 브레인스토밍: `.tab-btn[data-tab="brainstorming"]`

### 주요 버튼
- 목표 추가: `#addGoalBtn`
- 인력 추가: `#addMemberBtn`
- 아이디어 추가: `#addIdeaBtn`
- PDF 내보내기: `#exportPdfBtn`

### 요약 정보
- 전체 목표: `#totalGoals`
- 마일스톤: `#totalMilestones`
- 태스크: `#totalTasks`
- 전체 진척률: `#overallProgress`

사용자 요청: $ARGUMENTS
