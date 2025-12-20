// Editor Panel Management
const Editor = {
    panel: null,
    overlay: null,
    content: null,
    title: null,
    currentYear: 2026,
    members: [],

    init() {
        this.panel = document.getElementById('editPanel');
        this.overlay = document.getElementById('overlay');
        this.content = document.getElementById('editPanelContent');
        this.title = document.getElementById('editPanelTitle');

        document.getElementById('closeEditPanel').addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', () => this.close());

        this.loadMembers();
    },

    async loadMembers() {
        this.members = await API.getMembers({ year: this.currentYear });
    },

    open(title) {
        this.title.textContent = title;
        this.panel.classList.add('open');
        this.overlay.classList.add('visible');
        document.body.classList.add('panel-open');
    },

    close() {
        this.panel.classList.remove('open');
        this.overlay.classList.remove('visible');
        document.body.classList.remove('panel-open');
    },

    getMemberOptions() {
        return this.members.map(m => `<option value="${m.id}">${m.name} (${m.role})</option>`).join('');
    },

    // Goal Form
    showGoalForm(goal = null) {
        const isEdit = goal !== null;
        this.open(isEdit ? '목표 수정' : '새 목표 추가');

        this.content.innerHTML = `
            <form id="goalForm">
                <div class="form-group">
                    <label>유형 *</label>
                    <select name="type" required>
                        <option value="issue" ${goal?.type === 'issue' ? 'selected' : ''}>문제점 개선 (Issue)</option>
                        <option value="feature" ${goal?.type === 'feature' ? 'selected' : ''}>신규 기능 (Feature)</option>
                        <option value="feedback" ${goal?.type === 'feedback' ? 'selected' : ''}>사용자 피드백 (Feedback)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목 *</label>
                    <input type="text" name="title" value="${goal?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <textarea name="description">${goal?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>기대효과</label>
                    <textarea name="expected_effect" placeholder="이 목표를 달성했을 때 기대되는 효과를 입력하세요">${goal?.expected_effect || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>연도 *</label>
                        <input type="number" name="year" value="${goal?.year || this.currentYear}" required>
                    </div>
                    <div class="form-group">
                        <label>분기</label>
                        <select name="quarter">
                            <option value="">선택 안함</option>
                            <option value="Q1" ${goal?.quarter === 'Q1' ? 'selected' : ''}>Q1</option>
                            <option value="Q2" ${goal?.quarter === 'Q2' ? 'selected' : ''}>Q2</option>
                            <option value="Q3" ${goal?.quarter === 'Q3' ? 'selected' : ''}>Q3</option>
                            <option value="Q4" ${goal?.quarter === 'Q4' ? 'selected' : ''}>Q4</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>팀</label>
                        <input type="text" name="team" value="${goal?.team || ''}">
                    </div>
                    <div class="form-group">
                        <label>제품</label>
                        <input type="text" name="product" value="${goal?.product || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>태그</label>
                    <input type="text" name="tags" value="${goal?.tags || ''}" placeholder="쉼표로 구분하여 입력 (예: 성능개선, 보안, UI)">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>시작일</label>
                        <input type="date" name="start_date" value="${goal?.start_date || ''}">
                    </div>
                    <div class="form-group">
                        <label>종료일</label>
                        <input type="date" name="end_date" value="${goal?.end_date || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>진척률</label>
                    <div class="progress-input">
                        <input type="range" name="progress" min="0" max="100" value="${goal?.progress || 0}"
                               oninput="this.nextElementSibling.textContent = this.value + '%'">
                        <span>${goal?.progress || 0}%</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="Editor.close()">취소</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
                </div>
            </form>
        `;

        document.getElementById('goalForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.progress = parseInt(data.progress);
            data.year = parseInt(data.year);
            if (!data.quarter) data.quarter = null;
            if (!data.tags) data.tags = null;
            if (!data.start_date) data.start_date = null;
            if (!data.end_date) data.end_date = null;

            if (isEdit) {
                await API.updateGoal(goal.id, data);
            } else {
                await API.createGoal(data);
            }
            this.close();
            App.refresh();
        });
    },

    // Milestone Form
    showMilestoneForm(goalId, milestone = null) {
        const isEdit = milestone !== null;
        this.open(isEdit ? '마일스톤 수정' : '새 마일스톤 추가');

        this.content.innerHTML = `
            <form id="milestoneForm">
                <div class="form-group">
                    <label>제목 *</label>
                    <input type="text" name="title" value="${milestone?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <textarea name="description">${milestone?.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>시작일</label>
                        <input type="date" name="start_date" value="${milestone?.start_date || ''}">
                    </div>
                    <div class="form-group">
                        <label>마감일</label>
                        <input type="date" name="due_date" value="${milestone?.due_date || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>진척률</label>
                    <div class="progress-input">
                        <input type="range" name="progress" min="0" max="100" value="${milestone?.progress || 0}"
                               oninput="this.nextElementSibling.textContent = this.value + '%'">
                        <span>${milestone?.progress || 0}%</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="Editor.close()">취소</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
                </div>
            </form>
        `;

        document.getElementById('milestoneForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.progress = parseInt(data.progress);
            data.goal_id = goalId;
            if (!data.start_date) data.start_date = null;
            if (!data.due_date) data.due_date = null;

            if (isEdit) {
                await API.updateMilestone(milestone.id, data);
            } else {
                await API.createMilestone(data);
            }
            this.close();
            App.refresh();
        });
    },

    // Task Form
    showTaskForm(milestoneId, task = null) {
        const isEdit = task !== null;
        this.open(isEdit ? '태스크 수정' : '새 태스크 추가');

        this.content.innerHTML = `
            <form id="taskForm">
                <div class="form-group">
                    <label>제목 *</label>
                    <input type="text" name="title" value="${task?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <textarea name="description">${task?.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>담당자</label>
                    <select name="assignee_id">
                        <option value="">선택 안함</option>
                        ${this.getMemberOptions()}
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>시작일</label>
                        <input type="date" name="start_date" value="${task?.start_date || ''}">
                    </div>
                    <div class="form-group">
                        <label>마감일</label>
                        <input type="date" name="due_date" value="${task?.due_date || ''}">
                    </div>
                </div>
                <div class="form-group">
                    <label>진척률</label>
                    <div class="progress-input">
                        <input type="range" name="progress" min="0" max="100" value="${task?.progress || 0}"
                               oninput="this.nextElementSibling.textContent = this.value + '%'">
                        <span>${task?.progress || 0}%</span>
                    </div>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="Editor.close()">취소</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
                </div>
            </form>
        `;

        // Set selected assignee
        if (task?.assignee_id) {
            document.querySelector(`select[name="assignee_id"]`).value = task.assignee_id;
        }

        document.getElementById('taskForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.progress = parseInt(data.progress);
            data.milestone_id = milestoneId;
            data.assignee_id = data.assignee_id ? parseInt(data.assignee_id) : null;
            if (!data.start_date) data.start_date = null;
            if (!data.due_date) data.due_date = null;

            if (isEdit) {
                await API.updateTask(task.id, data);
            } else {
                await API.createTask(data);
            }
            this.close();
            App.refresh();
        });
    },

    // Member Form
    showMemberForm(member = null) {
        const isEdit = member !== null;
        this.open(isEdit ? '인력 수정' : '새 인력 추가');

        this.content.innerHTML = `
            <form id="memberForm">
                <div class="form-group">
                    <label>이름 *</label>
                    <input type="text" name="name" value="${member?.name || ''}" required>
                </div>
                <div class="form-group">
                    <label>역할 *</label>
                    <select name="role" required>
                        <option value="총괄" ${member?.role === '총괄' ? 'selected' : ''}>총괄</option>
                        <option value="BE Developer" ${member?.role === 'BE Developer' ? 'selected' : ''}>BE Developer</option>
                        <option value="FE Developer" ${member?.role === 'FE Developer' ? 'selected' : ''}>FE Developer</option>
                        <option value="AI/ML Engineer" ${member?.role === 'AI/ML Engineer' ? 'selected' : ''}>AI/ML Engineer</option>
                        <option value="UI/UX" ${member?.role === 'UI/UX' ? 'selected' : ''}>UI/UX</option>
                        <option value="DevOps" ${member?.role === 'DevOps' ? 'selected' : ''}>DevOps</option>
                        <option value="Other" ${member?.role === 'Other' ? 'selected' : ''}>Other</option>
                    </select>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>팀</label>
                        <input type="text" name="team" value="${member?.team || ''}">
                    </div>
                    <div class="form-group">
                        <label>배치 예정 제품</label>
                        <select name="product">
                            <option value="">선택 안함</option>
                            <option value="H Chat" ${member?.product === 'H Chat' ? 'selected' : ''}>H Chat</option>
                            <option value="API Platform" ${member?.product === 'API Platform' ? 'selected' : ''}>API Platform</option>
                            <option value="공통" ${member?.product === '공통' ? 'selected' : ''}>공통</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>유형 *</label>
                        <select name="type" required>
                            <option value="existing" ${member?.type === 'existing' ? 'selected' : ''}>기존 인력</option>
                            <option value="new" ${member?.type === 'new' ? 'selected' : ''}>신규 인력</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>연도 *</label>
                        <input type="number" name="year" value="${member?.year || this.currentYear}" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>입사일/입사 예정일</label>
                    <input type="date" name="join_date" value="${member?.join_date || ''}">
                </div>
                <div class="form-actions">
                    ${isEdit ? '<button type="button" class="btn btn-danger" onclick="Editor.deleteMember(' + member.id + ')">삭제</button>' : ''}
                    <button type="button" class="btn btn-outline" onclick="Editor.close()">취소</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
                </div>
            </form>
        `;

        document.getElementById('memberForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.year = parseInt(data.year);
            if (!data.join_date) data.join_date = null;
            if (!data.product) data.product = null;

            if (isEdit) {
                await API.updateMember(member.id, data);
            } else {
                await API.createMember(data);
            }
            this.close();
            this.loadMembers();
            App.refresh();
        });
    },

    async deleteMember(id) {
        if (confirm('이 인력을 삭제하시겠습니까?')) {
            await API.deleteMember(id);
            this.close();
            this.loadMembers();
            App.refresh();
        }
    },

    // Idea Form
    showIdeaForm(idea = null) {
        const isEdit = idea !== null;
        this.open(isEdit ? '아이디어 수정' : '새 아이디어 추가');

        this.content.innerHTML = `
            <form id="ideaForm">
                <div class="form-group">
                    <label>유형 *</label>
                    <select name="type" required>
                        <option value="issue" ${idea?.type === 'issue' ? 'selected' : ''}>문제점 개선 (Issue)</option>
                        <option value="feature" ${idea?.type === 'feature' ? 'selected' : ''}>신규 기능 (Feature)</option>
                        <option value="feedback" ${idea?.type === 'feedback' ? 'selected' : ''}>사용자 피드백 (Feedback)</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>제목 *</label>
                    <input type="text" name="title" value="${idea?.title || ''}" required>
                </div>
                <div class="form-group">
                    <label>설명</label>
                    <textarea name="description">${idea?.description || ''}</textarea>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>연도 *</label>
                        <input type="number" name="year" value="${idea?.year || this.currentYear}" required>
                    </div>
                    <div class="form-group">
                        <label>제품</label>
                        <input type="text" name="product" value="${idea?.product || ''}">
                    </div>
                </div>
                ${isEdit ? `
                <div class="form-row">
                    <div class="form-group">
                        <label>우선순위</label>
                        <select name="priority">
                            <option value="0" ${idea?.priority === 0 ? 'selected' : ''}>없음</option>
                            <option value="1" ${idea?.priority === 1 ? 'selected' : ''}>높음</option>
                            <option value="2" ${idea?.priority === 2 ? 'selected' : ''}>중간</option>
                            <option value="3" ${idea?.priority === 3 ? 'selected' : ''}>낮음</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>상태</label>
                        <select name="status">
                            <option value="open" ${idea?.status === 'open' ? 'selected' : ''}>검토 중</option>
                            <option value="approved" ${idea?.status === 'approved' ? 'selected' : ''}>승인됨</option>
                            <option value="rejected" ${idea?.status === 'rejected' ? 'selected' : ''}>거절됨</option>
                        </select>
                    </div>
                </div>
                ` : ''}
                <div class="form-actions">
                    <button type="button" class="btn btn-outline" onclick="Editor.close()">취소</button>
                    <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '추가'}</button>
                </div>
            </form>
        `;

        document.getElementById('ideaForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);
            data.year = parseInt(data.year);
            if (data.priority !== undefined) {
                data.priority = parseInt(data.priority);
            }

            if (isEdit) {
                await API.updateIdea(idea.id, data);
            } else {
                await API.createIdea(data);
            }
            this.close();
            App.loadIdeas();
        });
    }
};
