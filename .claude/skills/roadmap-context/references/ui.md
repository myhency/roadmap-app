# UI/프론트엔드 변경 이력

템플릿, JavaScript, CSS 변경 사항

---

## 2025-12-28

### Gantt 차트 시작점 이동 기능

- Gantt 차트 헤더에 년도/분기 선택 드롭다운 추가
- 년도 선택 시 메인 년도 필터와 동기화
- 드롭다운 변경 시 자동으로 해당 년도/분기로 이동
- Frappe Gantt의 `set_scroll_position(Date)` 메서드 사용

**관련 파일:**

- `templates/index.html`: 드롭다운 UI 추가 (onchange로 함수 호출)
- `static/js/gantt.js`: `scrollToSelectedDate()` 함수 추가
- `static/js/app.js`: 년도 동기화 로직 추가
- `static/css/style.css`: 드롭다운 스타일 추가

---

## 2024-12-28

### 데이터 관리 드롭다운 메뉴

- 헤더의 개별 버튼들을 "데이터 관리 ▾" 드롭다운으로 통합
- 드롭다운 메뉴 항목: PDF 내보내기, DB 내보내기, DB 가져오기, 전체 데이터 삭제
- 드롭다운 CSS 스타일 및 애니메이션 추가

---

## 2024-12-27

### Goal 표시 개선

- Goal 목록에 product, quarter, assignee 표시 추가
- 공통 멤버를 assignee 표시에서 제외
