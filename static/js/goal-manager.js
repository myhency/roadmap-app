// Goal Manager - Kanban Board for Goal Scheduling
const GoalManager = {
    goals: [],
    currentYear: null,

    init() {
        this.setupDragAndDrop();
    },

    async update(year) {
        this.currentYear = year;
        this.goals = await API.getGoals({ year });
        this.render();
    },

    render() {
        // Clear all columns
        document.querySelectorAll('.kanban-column-body').forEach(col => {
            col.innerHTML = '';
        });

        // Reset counts
        const counts = { backlog: 0, Q1: 0, Q2: 0, Q3: 0, Q4: 0 };

        // Place goals in appropriate columns
        this.goals.forEach(goal => {
            const quarter = this.getQuarterFromDate(goal.start_date);
            const card = this.createGoalCard(goal);
            const column = document.querySelector(`.kanban-column-body[data-quarter="${quarter}"]`);
            if (column) {
                column.appendChild(card);
                counts[quarter]++;
            }
        });

        // Update counts
        Object.keys(counts).forEach(quarter => {
            const countEl = document.querySelector(`.kanban-column[data-quarter="${quarter}"] .column-count`);
            if (countEl) {
                countEl.textContent = counts[quarter];
            }
        });
    },

    getQuarterFromDate(dateStr) {
        if (!dateStr) return 'backlog';

        const month = parseInt(dateStr.split('-')[1]);
        if (month >= 1 && month <= 3) return 'Q1';
        if (month >= 4 && month <= 6) return 'Q2';
        if (month >= 7 && month <= 9) return 'Q3';
        if (month >= 10 && month <= 12) return 'Q4';
        return 'backlog';
    },

    getDateRangeFromQuarter(quarter, year) {
        const ranges = {
            'Q1': { start: `${year}-01-01`, end: `${year}-03-31` },
            'Q2': { start: `${year}-04-01`, end: `${year}-06-30` },
            'Q3': { start: `${year}-07-01`, end: `${year}-09-30` },
            'Q4': { start: `${year}-10-01`, end: `${year}-12-31` },
            'backlog': { start: null, end: null }
        };
        return ranges[quarter] || ranges['backlog'];
    },

    createGoalCard(goal) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.dataset.goalId = goal.id;
        card.draggable = true;

        const typeClass = goal.type;
        const typeLabel = goal.type === 'issue' ? '문제점' : goal.type === 'feature' ? '신규기능' : '피드백';
        const tagsHtml = goal.tags ? goal.tags.split(',').map(tag => `<span class="kanban-card-tag">${tag.trim()}</span>`).join('') : '';

        card.innerHTML = `
            <div class="kanban-card-header">
                <span class="kanban-card-type ${typeClass}">${typeLabel}</span>
                <span class="kanban-card-progress">${goal.progress}%</span>
            </div>
            <div class="kanban-card-title">${goal.title}</div>
            ${tagsHtml ? `<div class="kanban-card-tags">${tagsHtml}</div>` : ''}
            <div class="kanban-card-meta">
                ${goal.product ? `<span class="kanban-card-product">${goal.product}</span>` : ''}
                ${goal.team ? `<span class="kanban-card-team">${goal.team}</span>` : ''}
            </div>
            <div class="kanban-card-dates">
                ${goal.start_date ? `${goal.start_date} ~ ${goal.end_date || ''}` : '일정 미정'}
            </div>
            <div class="kanban-card-actions">
                <button class="btn-icon-sm" onclick="GoalManager.editGoal(${goal.id})" title="수정">✏️</button>
            </div>
        `;

        // Drag events
        card.addEventListener('dragstart', (e) => this.handleDragStart(e, goal));
        card.addEventListener('dragend', (e) => this.handleDragEnd(e));

        return card;
    },

    setupDragAndDrop() {
        document.querySelectorAll('.kanban-column-body').forEach(column => {
            column.addEventListener('dragover', (e) => this.handleDragOver(e));
            column.addEventListener('dragenter', (e) => this.handleDragEnter(e));
            column.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            column.addEventListener('drop', (e) => this.handleDrop(e));
        });
    },

    handleDragStart(e, goal) {
        e.target.classList.add('dragging');
        e.dataTransfer.setData('text/plain', goal.id);
        e.dataTransfer.effectAllowed = 'move';
    },

    handleDragEnd(e) {
        e.target.classList.remove('dragging');
        document.querySelectorAll('.kanban-column-body').forEach(col => {
            col.classList.remove('drag-over');
        });
    },

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    },

    handleDragEnter(e) {
        e.preventDefault();
        const column = e.target.closest('.kanban-column-body');
        if (column) {
            column.classList.add('drag-over');
        }
    },

    handleDragLeave(e) {
        const column = e.target.closest('.kanban-column-body');
        if (column && !column.contains(e.relatedTarget)) {
            column.classList.remove('drag-over');
        }
    },

    async handleDrop(e) {
        e.preventDefault();
        const column = e.target.closest('.kanban-column-body');
        if (!column) return;

        column.classList.remove('drag-over');

        const goalId = parseInt(e.dataTransfer.getData('text/plain'));
        const quarter = column.dataset.quarter;
        const dateRange = this.getDateRangeFromQuarter(quarter, this.currentYear);

        try {
            await API.updateGoal(goalId, {
                start_date: dateRange.start,
                end_date: dateRange.end
            });

            // Refresh all views
            await this.update(this.currentYear);
            await App.refresh();
        } catch (error) {
            console.error('Failed to update goal:', error);
            alert('목표 일정 업데이트에 실패했습니다.');
        }
    },

    editGoal(id) {
        const goal = this.goals.find(g => g.id === id);
        if (goal) {
            Editor.showGoalForm(goal);
        }
    }
};
