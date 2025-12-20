// Gantt Chart Management
const GanttChart = {
    chart: null,
    viewMode: 'Week',

    init() {
        // Setup view mode buttons
        document.querySelectorAll('.gantt-view-modes button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gantt-view-modes button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.viewMode = e.target.dataset.mode;
                if (this.chart) {
                    this.chart.change_view_mode(this.viewMode);
                }
            });
        });
    },

    async update(year) {
        const data = await API.getGanttData({ year });

        // Filter out items without dates and prepare for Frappe Gantt
        const tasks = data
            .filter(item => item.start && item.end)
            .map(item => ({
                id: item.id,
                name: item.name,
                start: item.start,
                end: item.end,
                progress: item.progress,
                dependencies: item.dependencies || '',
                custom_class: this.getCustomClass(item)
            }));

        const container = document.getElementById('gantt');

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📅</div>
                    <p>표시할 일정이 없습니다.</p>
                    <p>목표에 시작일과 종료일을 설정해주세요.</p>
                </div>
            `;
            this.chart = null;
            return;
        }

        container.innerHTML = '<svg id="gantt-svg"></svg>';

        try {
            this.chart = new Gantt('#gantt-svg', tasks, {
                view_mode: this.viewMode,
                date_format: 'YYYY-MM-DD',
                language: 'ko',
                custom_popup_html: (task) => {
                    return `
                        <div class="details-container">
                            <h5>${task.name}</h5>
                            <p>진척률: ${task.progress}%</p>
                            <p>${task.start} ~ ${task.end}</p>
                        </div>
                    `;
                },
                on_click: (task) => {
                    this.handleTaskClick(task);
                },
                on_progress_change: (task, progress) => {
                    this.handleProgressChange(task, progress);
                }
            });
        } catch (error) {
            console.error('Gantt chart error:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <p>간트 차트를 표시할 수 없습니다.</p>
                </div>
            `;
        }
    },

    getCustomClass(item) {
        if (item.type === 'goal') {
            return item.goal_type === 'issue' ? 'bar-issue' : 'bar-feature';
        } else if (item.type === 'milestone') {
            return 'bar-milestone';
        }
        return 'bar-task';
    },

    handleTaskClick(task) {
        const [type, id] = task.id.split('-');
        const numId = parseInt(id);

        if (type === 'goal') {
            // Open goal editor
            API.getGoal(numId).then(goal => {
                Editor.showGoalForm(goal);
            });
        }
        // Add milestone and task handling if needed
    },

    async handleProgressChange(task, progress) {
        const [type, id] = task.id.split('-');
        const numId = parseInt(id);
        const roundedProgress = Math.round(progress);

        try {
            if (type === 'goal') {
                await API.updateGoal(numId, { progress: roundedProgress });
            } else if (type === 'milestone') {
                await API.updateMilestone(numId, { progress: roundedProgress });
            } else if (type === 'task') {
                await API.updateTask(numId, { progress: roundedProgress });
            }
            // Refresh dashboard to reflect changes
            Dashboard.update(App.currentYear);
        } catch (error) {
            console.error('Failed to update progress:', error);
        }
    }
};

// Add custom styles for Gantt
const ganttStyles = document.createElement('style');
ganttStyles.textContent = `
    .bar-issue .bar {
        fill: #f97316 !important;
    }
    .bar-issue .bar-progress {
        fill: #ea580c !important;
    }
    .bar-feature .bar {
        fill: #8b5cf6 !important;
    }
    .bar-feature .bar-progress {
        fill: #7c3aed !important;
    }
    .bar-milestone .bar {
        fill: #f59e0b !important;
    }
    .bar-milestone .bar-progress {
        fill: #d97706 !important;
    }
    .bar-task .bar {
        fill: #3b82f6 !important;
    }
    .bar-task .bar-progress {
        fill: #2563eb !important;
    }
    .gantt .details-container {
        padding: 10px;
        background: white;
        border-radius: 4px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
    .gantt .details-container h5 {
        margin: 0 0 5px 0;
        font-size: 14px;
    }
    .gantt .details-container p {
        margin: 3px 0;
        font-size: 12px;
        color: #64748b;
    }
`;
document.head.appendChild(ganttStyles);
