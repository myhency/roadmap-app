---
name: front-test
description: Roadmap Dashboard 프론트엔드 테스트를 위한 skill. vibium MCP 도구를 사용하여 브라우저 기반 UI 테스트를 수행한다. /front-test 명령으로 실행. 다음 상황에서 사용: (1) UI 요소가 제대로 렌더링되는지 확인, (2) 버튼 클릭, 폼 입력 등 상호작용 테스트, (3) 탭 전환 및 네비게이션 테스트, (4) 스크린샷 캡처를 통한 시각적 검증.
---

# Roadmap Dashboard 프론트엔드 테스트

vibium MCP 도구를 사용하여 Roadmap Dashboard의 프론트엔드를 테스트한다.

## 사전 요구사항

서버가 실행 중이어야 함:
```bash
cd /Users/james/Developer/roadmap && uvicorn app.main:app --reload --port 8000
```

## 테스트 워크플로우

### 1. 브라우저 시작 및 페이지 접속

```
mcp__vibium__browser_launch()
mcp__vibium__browser_navigate(url="http://localhost:8000")
```

### 2. 스크린샷 캡처

```
mcp__vibium__browser_screenshot(filename="test-screenshot.png")
```

### 3. 테스트 완료 후 브라우저 종료

```
mcp__vibium__browser_quit()
```

## 주요 CSS 선택자

### 헤더 영역
| 요소 | 선택자 |
|------|--------|
| 연도 필터 | `#yearFilter` |
| 목표 추가 버튼 | `#addGoalBtn` |
| 인력 추가 버튼 | `#addMemberBtn` |
| PDF 내보내기 버튼 | `#exportPdfBtn` |
| 데이터 삭제 버튼 | `#resetDataBtn` |

### 탭 네비게이션
| 탭 | 선택자 |
|----|--------|
| 대시보드 | `.tab-btn[data-tab="dashboard"]` |
| 목표 관리 | `.tab-btn[data-tab="goal-manager"]` |
| 인력 관리 | `.tab-btn[data-tab="members"]` |
| 브레인스토밍 | `.tab-btn[data-tab="brainstorming"]` |

### 대시보드 요약 카드
| 요소 | 선택자 |
|------|--------|
| 전체 목표 수 | `#totalGoals` |
| 마일스톤 수 | `#totalMilestones` |
| 태스크 수 | `#totalTasks` |
| 전체 진척률 | `#overallProgress` |

### 필터
| 요소 | 선택자 |
|------|--------|
| 유형 필터 | `#typeFilter` |
| 팀 필터 | `#teamFilter` |
| 인력 유형 필터 | `#memberTypeFilter` |
| 인력 역할 필터 | `#memberRoleFilter` |
| 아이디어 상태 필터 | `#ideaStatusFilter` |

### 간트 차트
| 요소 | 선택자 |
|------|--------|
| 간트 컨테이너 | `#gantt` |
| 주 단위 보기 | `.gantt-view-modes button[data-mode="Week"]` |
| 월 단위 보기 | `.gantt-view-modes button[data-mode="Month"]` |

### 칸반 보드 (목표 관리)
| 요소 | 선택자 |
|------|--------|
| 칸반 보드 | `#kanbanBoard` |
| 백로그 컬럼 | `.kanban-column[data-quarter="backlog"]` |
| Q1 컬럼 | `.kanban-column[data-quarter="Q1"]` |
| Q2 컬럼 | `.kanban-column[data-quarter="Q2"]` |
| Q3 컬럼 | `.kanban-column[data-quarter="Q3"]` |
| Q4 컬럼 | `.kanban-column[data-quarter="Q4"]` |

### 편집 패널
| 요소 | 선택자 |
|------|--------|
| 편집 패널 | `#editPanel` |
| 패널 닫기 버튼 | `#closeEditPanel` |
| 패널 콘텐츠 | `#editPanelContent` |

## 테스트 시나리오 예시

### 탭 전환 테스트
```
mcp__vibium__browser_click(selector=".tab-btn[data-tab='goal-manager']")
mcp__vibium__browser_screenshot(filename="goal-manager-tab.png")
```

### 목표 추가 버튼 클릭
```
mcp__vibium__browser_click(selector="#addGoalBtn")
mcp__vibium__browser_screenshot(filename="add-goal-panel.png")
```

### 요소 존재 확인
```
mcp__vibium__browser_find(selector="#totalGoals")
```

### 폼 입력 테스트
```
mcp__vibium__browser_type(selector="input[name='title']", text="테스트 목표")
```
