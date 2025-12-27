// Main Application
const App = {
    currentYear: 2026,
    goals: [],
    members: [],
    ideas: [],
    currentTab: 'dashboard',

    async init() {
        // Initialize modules
        Editor.init();
        Dashboard.init();
        GanttChart.init();
        GoalManager.init();

        // Load available years
        await this.loadYears();

        // Setup event listeners
        this.setupEventListeners();

        // Initial load
        await this.refresh();
    },

    async loadYears() {
        const years = await API.getYears();
        const yearFilter = document.getElementById('yearFilter');
        yearFilter.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');

        if (years.length > 0) {
            this.currentYear = years[0];
            Editor.currentYear = years[0];
        }
    },

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Year filter
        document.getElementById('yearFilter').addEventListener('change', (e) => {
            this.currentYear = parseInt(e.target.value);
            Editor.currentYear = this.currentYear;
            Editor.loadMembers();
            this.refresh();
        });

        // Add goal button
        document.getElementById('addGoalBtn').addEventListener('click', () => {
            Editor.showGoalForm();
        });

        // Add member buttons (header and members tab)
        document.getElementById('addMemberBtn').addEventListener('click', () => {
            Editor.showMemberForm();
        });
        document.getElementById('addMemberBtn2').addEventListener('click', () => {
            Editor.showMemberForm();
        });

        // Data Management Dropdown
        const dataManageBtn = document.getElementById('dataManageBtn');
        const dataManageMenu = document.getElementById('dataManageMenu');

        dataManageBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            dataManageMenu.classList.toggle('show');
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#dataManageDropdown')) {
                dataManageMenu.classList.remove('show');
            }
        });

        // Export PDF button
        document.getElementById('exportPdfBtn').addEventListener('click', () => {
            dataManageMenu.classList.remove('show');
            this.exportPdf();
        });

        // Export DB button
        document.getElementById('exportDbBtn').addEventListener('click', () => {
            dataManageMenu.classList.remove('show');
            this.exportDb();
        });

        // Import DB button
        document.getElementById('importDbBtn').addEventListener('click', () => {
            dataManageMenu.classList.remove('show');
            document.getElementById('dbFileInput').click();
        });

        // DB file input change
        document.getElementById('dbFileInput').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.importDb(e.target.files[0]);
                e.target.value = ''; // Reset for next selection
            }
        });

        // [TEST] Reset all data button
        document.getElementById('resetDataBtn').addEventListener('click', () => {
            dataManageMenu.classList.remove('show');
            this.resetAllData();
        });

        // Type filter
        document.getElementById('typeFilter').addEventListener('change', () => {
            this.renderGoalsTree();
        });

        // Team filter
        document.getElementById('teamFilter').addEventListener('change', () => {
            this.renderGoalsTree();
        });

        // Member filters
        document.getElementById('memberTypeFilter').addEventListener('change', () => {
            this.renderMembersList();
        });
        document.getElementById('memberRoleFilter').addEventListener('change', () => {
            this.renderMembersList();
        });

        // Add idea button
        document.getElementById('addIdeaBtn').addEventListener('click', () => {
            Editor.showIdeaForm();
        });

        // Idea filters
        document.getElementById('ideaStatusFilter').addEventListener('change', () => {
            this.renderIdeasList();
        });
        document.getElementById('ideaTypeFilter').addEventListener('change', () => {
            this.renderIdeasList();
        });
        document.getElementById('ideaPriorityFilter').addEventListener('change', () => {
            this.renderIdeasList();
        });
    },

    switchTab(tabId) {
        this.currentTab = tabId;

        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.toggle('active', content.id === tabId);
        });

        // Refresh data based on tab
        if (tabId === 'members') {
            this.loadMembers();
        } else if (tabId === 'brainstorming') {
            this.loadIdeas();
        } else if (tabId === 'goal-manager') {
            GoalManager.update(this.currentYear);
        }
    },

    async refresh() {
        // Reload years in case new year was added
        await this.refreshYears();

        // Load all data
        this.goals = await API.getGoals({ year: this.currentYear });
        this.members = await API.getMembers({ year: this.currentYear });

        // Update all views
        await Dashboard.update(this.currentYear);
        await GanttChart.update(this.currentYear);
        this.renderGoalsTree();
        this.updateTeamFilter();

        // Load tab-specific data
        if (this.currentTab === 'members') {
            const summary = await API.getMembersSummary({ year: this.currentYear });
            this.updateMembersSummary(summary);
            this.renderRoleDistribution(summary.by_role);
            this.renderProductAssignments(summary.by_product, summary.unassigned);
            this.renderMembersList();
        } else if (this.currentTab === 'goal-manager') {
            await GoalManager.update(this.currentYear);
        }
    },

    async refreshYears() {
        const years = await API.getYears();
        const yearFilter = document.getElementById('yearFilter');
        const currentValue = yearFilter.value;

        yearFilter.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join('');

        // Keep current selection if it still exists
        if (years.includes(parseInt(currentValue))) {
            yearFilter.value = currentValue;
        } else if (years.length > 0) {
            yearFilter.value = years[0];
            this.currentYear = years[0];
            Editor.currentYear = years[0];
        }
    },

    async loadMembers() {
        this.members = await API.getMembers({ year: this.currentYear });
        const summary = await API.getMembersSummary({ year: this.currentYear });
        this.updateMembersSummary(summary);
        this.renderRoleDistribution(summary.by_role);
        this.renderProductAssignments(summary.by_product, summary.unassigned);
        this.renderMembersList();
    },

    updateMembersSummary(summary) {
        document.getElementById('existingCount').textContent = summary.existing;
        document.getElementById('newCount').textContent = summary.new;
        document.getElementById('totalMembers').textContent = summary.total;
    },

    renderRoleDistribution(byRole) {
        const container = document.getElementById('roleDistribution');
        const roles = Object.keys(byRole);

        if (roles.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-size: 0.875rem;">등록된 인력이 없습니다.</p>';
            return;
        }

        container.innerHTML = roles.map(role => {
            const data = byRole[role];
            return `
                <div class="role-item">
                    <span class="role-name">${role}</span>
                    <div class="role-counts">
                        <span class="role-count existing">기존 ${data.existing}</span>
                        <span class="role-count new">신규 ${data.new}</span>
                        <span class="role-total">${data.total}명</span>
                    </div>
                </div>
            `;
        }).join('');
    },

    renderProductAssignments(byProduct, unassigned) {
        const container = document.getElementById('productAssignments');
        const products = Object.keys(byProduct).filter(p => p !== '공통');

        let html = '';

        // Render each product group (except 공통)
        products.forEach(product => {
            const data = byProduct[product];
            html += this.renderProductGroup(product, data.members, data.count);
        });

        // Always render 공통 (Common) group
        const commonData = byProduct['공통'] || { members: [], count: 0 };
        html += this.renderProductGroup('공통', commonData.members, commonData.count);

        // Render unassigned members
        if (unassigned.count > 0) {
            html += this.renderProductGroup('미배정', unassigned.members, unassigned.count, true);
        }

        container.innerHTML = html;

        // Setup expand/collapse
        container.querySelectorAll('.product-group-header').forEach(header => {
            header.addEventListener('click', () => {
                const group = header.closest('.product-group');
                const expand = header.querySelector('.product-expand');
                const body = group.querySelector('.product-group-body');
                expand.classList.toggle('expanded');
                body.classList.toggle('expanded');
            });
        });
    },

    renderProductGroup(productName, members, count, isUnassigned = false) {
        const membersHtml = members.map(m => `
            <div class="product-member">
                <span class="product-member-type ${m.type}"></span>
                <span class="product-member-name">${m.name}</span>
                <span class="product-member-role">${m.role}</span>
            </div>
        `).join('');

        return `
            <div class="product-group ${isUnassigned ? 'unassigned' : ''}">
                <div class="product-group-header">
                    <div class="product-group-left">
                        <span class="product-expand expanded">▶</span>
                        <span class="product-name">${productName}</span>
                    </div>
                    <span class="product-count">${count}명</span>
                </div>
                <div class="product-group-body expanded">
                    <div class="product-members">
                        ${membersHtml || '<span style="color: var(--text-secondary);">배정된 인력 없음</span>'}
                    </div>
                </div>
            </div>
        `;
    },

    renderMembersList() {
        const container = document.getElementById('membersList');
        const typeFilter = document.getElementById('memberTypeFilter').value;
        const roleFilter = document.getElementById('memberRoleFilter').value;

        let filteredMembers = this.members;
        if (typeFilter) {
            filteredMembers = filteredMembers.filter(m => m.type === typeFilter);
        }
        if (roleFilter) {
            filteredMembers = filteredMembers.filter(m => m.role === roleFilter);
        }

        if (filteredMembers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <p>등록된 인력이 없습니다.</p>
                    <p>"+ 인력 추가" 버튼을 눌러 시작하세요.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredMembers.map(member => this.renderMemberCard(member)).join('');
    },

    renderMemberCard(member) {
        const typeClass = member.type === 'existing' ? 'existing' : 'new';
        const typeLabel = member.type === 'existing' ? '기존' : '신규';
        const joinDate = member.join_date ? new Date(member.join_date).toLocaleDateString('ko-KR') : '-';

        return `
            <div class="member-card" data-id="${member.id}">
                <div class="member-card-header">
                    <span class="member-name">${member.name}</span>
                    <span class="member-type ${typeClass}">${typeLabel}</span>
                </div>
                <div class="member-info">
                    <span>💼 ${member.role}</span>
                    ${member.team ? `<span>🏢 ${member.team}</span>` : ''}
                    <span>📅 ${member.type === 'new' ? '입사 예정: ' : ''}${joinDate}</span>
                </div>
                <div class="member-card-actions">
                    <button class="btn-icon" onclick="App.editMember(${member.id})" title="수정">✏️</button>
                    <button class="btn-icon" onclick="App.deleteMember(${member.id})" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    },

    updateTeamFilter() {
        const teams = [...new Set(this.goals.map(g => g.team).filter(Boolean))];
        const teamFilter = document.getElementById('teamFilter');
        teamFilter.innerHTML = '<option value="">전체 팀</option>' +
            teams.map(t => `<option value="${t}">${t}</option>`).join('');
    },

    renderGoalsTree() {
        const container = document.getElementById('goalsTree');
        const typeFilter = document.getElementById('typeFilter').value;
        const teamFilter = document.getElementById('teamFilter').value;

        let filteredGoals = this.goals;
        if (typeFilter) {
            filteredGoals = filteredGoals.filter(g => g.type === typeFilter);
        }
        if (teamFilter) {
            filteredGoals = filteredGoals.filter(g => g.team === teamFilter);
        }

        // 분기 오름차순 정렬 (Q1 > Q2 > Q3 > Q4 > 미정)
        const getQuarterOrder = (dateStr) => {
            if (!dateStr) return 5; // 미정은 맨 뒤로
            const month = parseInt(dateStr.split('-')[1]);
            if (month >= 1 && month <= 3) return 1;
            if (month >= 4 && month <= 6) return 2;
            if (month >= 7 && month <= 9) return 3;
            if (month >= 10 && month <= 12) return 4;
            return 5;
        };
        filteredGoals = [...filteredGoals].sort((a, b) => getQuarterOrder(a.start_date) - getQuarterOrder(b.start_date));

        if (filteredGoals.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <p>등록된 목표가 없습니다.</p>
                    <p>"+ 목표 추가" 버튼을 눌러 시작하세요.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredGoals.map(goal => this.renderGoalItem(goal)).join('');

        // Setup expand/collapse
        container.querySelectorAll('.goal-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.goal-actions') || e.target.closest('.btn-icon')) return;
                const item = header.closest('.goal-item');
                const expand = header.querySelector('.goal-expand');
                const children = item.querySelector('.goal-children');
                expand.classList.toggle('expanded');
                children.classList.toggle('expanded');
            });
        });
    },

    renderGoalItem(goal) {
        const typeClass = goal.type;
        const typeLabel = goal.type === 'issue' ? '문제점 개선' : goal.type === 'feature' ? '신규 기능' : '사용자 피드백';
        const tagsHtml = goal.tags ? goal.tags.split(',').map(tag => `<span class="goal-tag">${tag.trim()}</span>`).join('') : '';

        // 날짜를 분기로 변환
        const getQuarter = (dateStr) => {
            if (!dateStr) return null;
            const month = parseInt(dateStr.split('-')[1]);
            if (month >= 1 && month <= 3) return 'Q1';
            if (month >= 4 && month <= 6) return 'Q2';
            if (month >= 7 && month <= 9) return 'Q3';
            if (month >= 10 && month <= 12) return 'Q4';
            return null;
        };
        const quarter = getQuarter(goal.start_date);
        const quarterDisplay = quarter || '';

        // 담당자 목록 수집 (해당 제품 담당자만)
        const assignees = this.members.filter(member => {
            return member.product === goal.product;
        }).map(member => member.name);
        const assigneeDisplay = assignees.length > 0 ? assignees.join(', ') : '';

        return `
            <div class="goal-item" data-id="${goal.id}">
                <div class="goal-header">
                    <span class="goal-expand">▶</span>
                    <span class="goal-type ${typeClass}">${typeLabel}</span>
                    ${goal.product ? `<span class="goal-product">${goal.product}</span>` : ''}
                    ${tagsHtml ? `<div class="goal-tags">${tagsHtml}</div>` : ''}
                    <span class="goal-title">${goal.title}</span>
                    ${quarterDisplay ? `<span class="goal-dates">📅 ${quarterDisplay}</span>` : ''}
                    ${assigneeDisplay ? `<span class="goal-assignees">👤 ${assigneeDisplay}</span>` : ''}
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${goal.progress}%"></div>
                        </div>
                        <span class="progress-text">${goal.progress}%</span>
                    </div>
                    <div class="goal-actions">
                        <button class="btn-icon" onclick="App.addMilestone(${goal.id})" title="마일스톤 추가">➕</button>
                        <button class="btn-icon" onclick="App.editGoal(${goal.id})" title="수정">✏️</button>
                        <button class="btn-icon" onclick="App.deleteGoal(${goal.id})" title="삭제">🗑️</button>
                    </div>
                </div>
                <div class="goal-children">
                    ${goal.milestones.length > 0
                        ? goal.milestones.map(m => this.renderMilestoneItem(m, goal.id)).join('')
                        : '<div class="empty-children">마일스톤이 없습니다. ➕ 버튼을 눌러 추가하세요.</div>'
                    }
                </div>
            </div>
        `;
    },

    renderMilestoneItem(milestone, goalId) {
        return `
            <div class="milestone-item" data-id="${milestone.id}">
                <div class="milestone-header" onclick="App.toggleMilestone(this)">
                    <span class="goal-expand">▶</span>
                    <span class="milestone-icon">📍</span>
                    <span class="milestone-title">${milestone.title}</span>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                        </div>
                        <span class="progress-text">${milestone.progress}%</span>
                    </div>
                    <div class="goal-actions">
                        <button class="btn-icon" onclick="event.stopPropagation(); App.addTask(${milestone.id})" title="태스크 추가">➕</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); App.editMilestone(${goalId}, ${milestone.id})" title="수정">✏️</button>
                        <button class="btn-icon" onclick="event.stopPropagation(); App.deleteMilestone(${milestone.id})" title="삭제">🗑️</button>
                    </div>
                </div>
                <div class="goal-children">
                    ${milestone.tasks.map(t => this.renderTaskItem(t, milestone.id)).join('')}
                </div>
            </div>
        `;
    },

    renderTaskItem(task, milestoneId) {
        const assigneeName = task.assignee ? task.assignee.name : '';
        return `
            <div class="task-item" data-id="${task.id}">
                <span class="task-icon">✅</span>
                <span class="task-title">${task.title}</span>
                ${assigneeName ? `<span class="task-assignee">${assigneeName}</span>` : ''}
                <div class="goal-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${task.progress}%"></div>
                    </div>
                    <span class="progress-text">${task.progress}%</span>
                </div>
                <div class="goal-actions">
                    <button class="btn-icon" onclick="App.editTask(${milestoneId}, ${task.id})" title="수정">✏️</button>
                    <button class="btn-icon" onclick="App.deleteTask(${task.id})" title="삭제">🗑️</button>
                </div>
            </div>
        `;
    },

    toggleMilestone(header) {
        const expand = header.querySelector('.goal-expand');
        const children = header.nextElementSibling;
        expand.classList.toggle('expanded');
        children.classList.toggle('expanded');
    },

    // Goal actions
    async editGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            Editor.showGoalForm(goal);
        }
    },

    async deleteGoal(id) {
        if (confirm('이 목표를 삭제하시겠습니까? 하위 마일스톤과 태스크도 모두 삭제됩니다.')) {
            await API.deleteGoal(id);
            this.refresh();
        }
    },

    // Milestone actions
    addMilestone(goalId) {
        Editor.showMilestoneForm(goalId);
    },

    async editMilestone(goalId, milestoneId) {
        const goal = this.goals.find(g => g.id === goalId);
        const milestone = goal?.milestones.find(m => m.id === milestoneId);
        if (milestone) {
            Editor.showMilestoneForm(goalId, milestone);
        }
    },

    async deleteMilestone(id) {
        if (confirm('이 마일스톤을 삭제하시겠습니까? 하위 태스크도 모두 삭제됩니다.')) {
            await API.deleteMilestone(id);
            this.refresh();
        }
    },

    // Task actions
    addTask(milestoneId) {
        Editor.showTaskForm(milestoneId);
    },

    async editTask(milestoneId, taskId) {
        for (const goal of this.goals) {
            for (const milestone of goal.milestones) {
                if (milestone.id === milestoneId) {
                    const task = milestone.tasks.find(t => t.id === taskId);
                    if (task) {
                        Editor.showTaskForm(milestoneId, task);
                        return;
                    }
                }
            }
        }
    },

    async deleteTask(id) {
        if (confirm('이 태스크를 삭제하시겠습니까?')) {
            await API.deleteTask(id);
            this.refresh();
        }
    },

    // Member actions
    async editMember(id) {
        const member = this.members.find(m => m.id === id);
        if (member) {
            Editor.showMemberForm(member);
        }
    },

    async deleteMember(id) {
        if (confirm('이 인력을 삭제하시겠습니까?')) {
            await API.deleteMember(id);
            await this.loadMembers();
            Editor.loadMembers();
        }
    },

    // Idea actions
    async loadIdeas() {
        this.ideas = await API.getIdeas({ year: this.currentYear });
        this.updateIdeasSummary();
        this.renderIdeasList();
    },

    updateIdeasSummary() {
        const open = this.ideas.filter(i => i.status === 'open').length;
        const approved = this.ideas.filter(i => i.status === 'approved').length;
        const converted = this.ideas.filter(i => i.status === 'converted').length;

        document.getElementById('openIdeasCount').textContent = open;
        document.getElementById('approvedIdeasCount').textContent = approved;
        document.getElementById('convertedIdeasCount').textContent = converted;
        document.getElementById('totalIdeasCount').textContent = this.ideas.length;
    },

    renderIdeasList() {
        const container = document.getElementById('ideasList');
        const statusFilter = document.getElementById('ideaStatusFilter').value;
        const typeFilter = document.getElementById('ideaTypeFilter').value;
        const priorityFilter = document.getElementById('ideaPriorityFilter').value;

        let filteredIdeas = this.ideas;
        if (statusFilter) {
            filteredIdeas = filteredIdeas.filter(i => i.status === statusFilter);
        }
        if (typeFilter) {
            filteredIdeas = filteredIdeas.filter(i => i.type === typeFilter);
        }
        if (priorityFilter) {
            filteredIdeas = filteredIdeas.filter(i => i.priority === parseInt(priorityFilter));
        }

        if (filteredIdeas.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">💡</div>
                    <p>등록된 아이디어가 없습니다.</p>
                    <p>"+ 아이디어 추가" 버튼을 눌러 시작하세요.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = filteredIdeas.map(idea => this.renderIdeaCard(idea)).join('');

        // Setup expand/collapse
        container.querySelectorAll('.idea-card-header').forEach(header => {
            header.addEventListener('click', (e) => {
                if (e.target.closest('.idea-actions') || e.target.closest('.btn-icon')) return;
                const card = header.closest('.idea-card');
                const expand = header.querySelector('.idea-expand');
                const body = card.querySelector('.idea-card-body');
                expand.classList.toggle('expanded');
                body.classList.toggle('expanded');
            });
        });
    },

    renderIdeaCard(idea) {
        const typeClass = idea.type;
        const typeLabel = idea.type === 'issue' ? '문제점 개선' : idea.type === 'feature' ? '신규 기능' : '사용자 피드백';
        const priorityClass = idea.priority === 1 ? 'high' : idea.priority === 2 ? 'medium' : idea.priority === 3 ? 'low' : '';
        const priorityLabel = idea.priority === 1 ? '높음' : idea.priority === 2 ? '중간' : idea.priority === 3 ? '낮음' : '';
        const statusLabel = idea.status === 'open' ? '검토 중' : idea.status === 'approved' ? '승인됨' : idea.status === 'rejected' ? '거절됨' : '목표 전환';
        const createdDate = new Date(idea.created_at).toLocaleDateString('ko-KR');

        const commentsHtml = idea.comments.map(comment => {
            const commentDate = new Date(comment.created_at).toLocaleDateString('ko-KR');
            return `
                <div class="comment-item">
                    <div class="comment-header">
                        <span class="comment-author">${comment.author}</span>
                        <span class="comment-date">${commentDate}</span>
                    </div>
                    <div class="comment-content">${comment.content}</div>
                </div>
            `;
        }).join('');

        const canConvert = idea.status === 'approved';
        const canApprove = idea.status === 'open';
        const isConverted = idea.status === 'converted';

        return `
            <div class="idea-card" data-id="${idea.id}">
                <div class="idea-card-header">
                    <div class="idea-card-left">
                        <span class="idea-expand">▶</span>
                        <span class="idea-type ${typeClass}">${typeLabel}</span>
                        <span class="idea-title">${idea.title}</span>
                    </div>
                    <div class="idea-card-right">
                        ${priorityLabel ? `<span class="idea-priority ${priorityClass}">${priorityLabel}</span>` : ''}
                        <span class="idea-status ${idea.status}">${statusLabel}</span>
                        <div class="idea-actions">
                            <button class="btn-icon" onclick="event.stopPropagation(); App.editIdea(${idea.id})" title="수정">✏️</button>
                            <button class="btn-icon" onclick="event.stopPropagation(); App.deleteIdea(${idea.id})" title="삭제">🗑️</button>
                        </div>
                    </div>
                </div>
                <div class="idea-card-body">
                    ${idea.description ? `<div class="idea-description">${idea.description}</div>` : ''}
                    <div class="idea-meta">
                        <span>📅 생성일: ${createdDate}</span>
                        ${idea.product ? `<span>📦 제품: ${idea.product}</span>` : ''}
                    </div>
                    <div class="idea-comments">
                        <h4>💬 댓글 (${idea.comments.length})</h4>
                        <div class="comments-list">${commentsHtml || '<p style="color: var(--text-secondary); font-size: 0.875rem;">댓글이 없습니다.</p>'}</div>
                        <div class="comment-form">
                            <input type="text" id="commentAuthor-${idea.id}" placeholder="작성자" style="flex: 0 0 100px;">
                            <input type="text" id="commentContent-${idea.id}" placeholder="댓글을 입력하세요...">
                            <button class="btn btn-primary btn-sm" onclick="App.addComment(${idea.id})">등록</button>
                        </div>
                    </div>
                    ${!isConverted ? `
                    <div class="idea-card-footer">
                        ${canApprove ? `
                            <button class="btn btn-sm btn-approve" onclick="App.approveIdea(${idea.id})">승인</button>
                            <button class="btn btn-sm btn-reject" onclick="App.rejectIdea(${idea.id})">거절</button>
                        ` : ''}
                        ${canConvert ? `
                            <button class="btn btn-sm btn-convert" onclick="App.convertIdeaToGoal(${idea.id})">🎯 목표로 전환</button>
                        ` : ''}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    async editIdea(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            Editor.showIdeaForm(idea);
        }
    },

    async deleteIdea(id) {
        if (confirm('이 아이디어를 삭제하시겠습니까?')) {
            await API.deleteIdea(id);
            await this.loadIdeas();
        }
    },

    async approveIdea(id) {
        await API.updateIdea(id, { status: 'approved' });
        await this.loadIdeas();
    },

    async rejectIdea(id) {
        await API.updateIdea(id, { status: 'rejected' });
        await this.loadIdeas();
    },

    async convertIdeaToGoal(id) {
        if (confirm('이 아이디어를 목표로 전환하시겠습니까?')) {
            await API.convertIdeaToGoal(id);
            await this.loadIdeas();
            await this.refresh();
        }
    },

    async addComment(ideaId) {
        const authorInput = document.getElementById(`commentAuthor-${ideaId}`);
        const contentInput = document.getElementById(`commentContent-${ideaId}`);
        const author = authorInput.value.trim();
        const content = contentInput.value.trim();

        if (!author || !content) {
            alert('작성자와 댓글 내용을 입력해주세요.');
            return;
        }

        await API.createComment(ideaId, { author, content });
        authorInput.value = '';
        contentInput.value = '';
        await this.loadIdeas();
    },

    // Export
    async exportPdf() {
        const exportBtn = document.getElementById('exportPdfBtn');
        const originalText = exportBtn.textContent;
        exportBtn.textContent = '내보내는 중...';
        exportBtn.disabled = true;

        try {
            const { jsPDF } = window.jspdf;

            // A4 Landscape
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 10;
            const contentWidth = pageWidth - (margin * 2);
            let yPosition = margin;

            // 1. Title
            pdf.setFontSize(16);
            pdf.text(`Roadmap Dashboard ${this.currentYear}`, pageWidth / 2, yPosition + 5, { align: 'center' });
            yPosition += 15;

            // 2. Summary Cards
            const summarySection = document.querySelector('.summary-cards');
            if (summarySection) {
                const summaryCanvas = await html2canvas(summarySection, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                const summaryImgData = summaryCanvas.toDataURL('image/png');
                const summaryHeight = (summaryCanvas.height * contentWidth) / summaryCanvas.width;
                pdf.addImage(summaryImgData, 'PNG', margin, yPosition, contentWidth, summaryHeight);
                yPosition += summaryHeight + 10;
            }

            // 3. Charts Section
            const chartsSection = document.querySelector('.charts-section');
            if (chartsSection) {
                const chartsCanvas = await html2canvas(chartsSection, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: '#ffffff'
                });
                const chartsImgData = chartsCanvas.toDataURL('image/png');
                const chartsHeight = (chartsCanvas.height * contentWidth) / chartsCanvas.width;

                if (yPosition + chartsHeight > pageHeight - margin) {
                    pdf.addPage();
                    yPosition = margin;
                }

                pdf.addImage(chartsImgData, 'PNG', margin, yPosition, contentWidth, chartsHeight);
                yPosition += chartsHeight + 10;
            }

            // 4. Goals List (new page, item-by-item to avoid cutting)
            const goalItems = document.querySelectorAll('.goals-tree .goal-item');
            if (goalItems.length > 0) {
                pdf.addPage();
                yPosition = margin;

                // Add section title
                pdf.setFontSize(14);
                pdf.text('Goals List', margin, yPosition + 5);
                yPosition += 12;

                const availableHeight = pageHeight - margin;

                for (const goalItem of goalItems) {
                    const itemCanvas = await html2canvas(goalItem, {
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        backgroundColor: '#ffffff'
                    });

                    const itemImgData = itemCanvas.toDataURL('image/png');
                    const itemWidth = contentWidth;
                    const itemHeight = (itemCanvas.height * itemWidth) / itemCanvas.width;

                    // Check if item fits on current page
                    if (yPosition + itemHeight > availableHeight) {
                        pdf.addPage();
                        yPosition = margin;
                    }

                    pdf.addImage(itemImgData, 'PNG', margin, yPosition, itemWidth, itemHeight);
                    yPosition += itemHeight + 3; // 3mm gap between items
                }
            }

            // 5. Save PDF
            const fileName = `Roadmap_Dashboard_${this.currentYear}_${new Date().toISOString().split('T')[0]}.pdf`;
            pdf.save(fileName);

        } catch (error) {
            console.error('PDF export failed:', error);
            alert('PDF 내보내기 중 오류가 발생했습니다.');
        } finally {
            exportBtn.textContent = originalText;
            exportBtn.disabled = false;
        }
    },

    // [TEST] Reset all data - Remove after testing
    async resetAllData() {
        if (confirm('정말로 모든 데이터를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다!')) {
            if (confirm('한 번 더 확인합니다.\n\n모든 목표, 마일스톤, 태스크, 인력, 아이디어, 댓글이 삭제됩니다.')) {
                await fetch('/api/reset-all-data', { method: 'DELETE' });
                alert('모든 데이터가 삭제되었습니다.');
                location.reload();
            }
        }
    },

    // Export DB
    async exportDb() {
        try {
            const response = await fetch('/api/export-db');
            if (!response.ok) {
                throw new Error('DB 내보내기 실패');
            }
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().split('T')[0];
            a.download = `roadmap_${date}.db`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('DB export failed:', error);
            alert('DB 내보내기 중 오류가 발생했습니다.');
        }
    },

    // Import DB
    async importDb(file) {
        if (!confirm('DB를 가져오면 현재 데이터가 모두 대체됩니다.\n\n계속하시겠습니까?')) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await fetch('/api/import-db', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'DB 가져오기 실패');
            }

            alert('DB를 성공적으로 가져왔습니다.');
            location.reload();
        } catch (error) {
            console.error('DB import failed:', error);
            alert('DB 가져오기 중 오류가 발생했습니다.\n\n' + error.message);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
