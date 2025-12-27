// Gantt Chart Management
const GanttChart = {
    chart: null,
    viewMode: 'Month',
    currentTasks: [],
    currentYear: null,

    init() {
        // Setup view mode buttons
        document.querySelectorAll('.gantt-view-modes button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.gantt-view-modes button').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.viewMode = e.target.dataset.mode;
                // Re-render chart with new view mode (change_view_mode has bugs)
                if (this.currentTasks.length > 0) {
                    this.renderChart(this.currentTasks);
                }
            });
        });

        // Update year dropdown based on available years
        this.updateYearDropdown();
    },

    updateYearDropdown() {
        const yearSelect = document.getElementById('ganttScrollYear');
        if (!yearSelect) return;

        // Sync with the main year filter
        const mainYearFilter = document.getElementById('yearFilter');
        if (mainYearFilter) {
            const currentYear = parseInt(mainYearFilter.value);
            yearSelect.value = currentYear.toString();
        }
    },

    scrollToSelectedDate() {
        if (!this.chart) return;

        const yearSelect = document.getElementById('ganttScrollYear');
        const quarterSelect = document.getElementById('ganttScrollQuarter');
        if (!yearSelect || !quarterSelect) return;

        const year = parseInt(yearSelect.value);
        const quarter = parseInt(quarterSelect.value);

        // Q1=Jan(0), Q2=Apr(3), Q3=Jul(6), Q4=Oct(9)
        const targetMonth = (quarter - 1) * 3;
        const targetDate = new Date(year, targetMonth, 1);

        // Use Frappe Gantt's set_scroll_position method
        this.chart.set_scroll_position(targetDate);
    },

    renderChart(tasks) {
        const container = document.getElementById('gantt');
        container.innerHTML = '<svg id="gantt-svg"></svg>';

        // Adjust column width based on view mode
        const columnWidths = {
            'Week': 140,
            'Month': 120
        };

        this.chart = new Gantt('#gantt-svg', tasks, {
            view_mode: this.viewMode,
            date_format: 'YYYY-MM-DD',
            language: 'ko',
            column_width: columnWidths[this.viewMode] || 120,
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

        // Scroll to show the first task bar
        setTimeout(() => {
            const container = document.querySelector('.gantt-container');
            const firstBar = document.querySelector('.gantt .bar-wrapper');
            if (container && firstBar) {
                const barRect = firstBar.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();
                // Scroll so the first bar is near the left side with some padding
                const scrollPos = container.scrollLeft + (barRect.left - containerRect.left) - 100;
                container.scrollLeft = Math.max(0, scrollPos);
            }
        }, 200);
    },

    async update(year) {
        const container = document.getElementById('gantt');
        this.currentYear = year;

        // Define date range: from start of selected year to end of next year
        const rangeStart = `${year}-01-01`;
        const rangeEnd = `${year + 1}-12-31`;

        try {
            const data = await API.getGanttData({ year });

            // Filter out items without dates and clamp to year range
            let tasks = data
                .filter(item => item.start && item.end)
                .filter(item => {
                    // Only include tasks that overlap with our range
                    return item.end >= rangeStart && item.start <= rangeEnd;
                })
                .map(item => {
                    // Clamp dates to the range
                    let start = item.start;
                    let end = item.end;

                    if (start < rangeStart) start = rangeStart;
                    if (end > rangeEnd) end = rangeEnd;

                    return {
                        id: item.id,
                        name: item.name,
                        start: start,
                        end: end,
                        progress: item.progress,
                        dependencies: item.dependencies || '',
                        custom_class: this.getCustomClass(item)
                    };
                });

            if (tasks.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📅</div>
                        <p>표시할 일정이 없습니다.</p>
                        <p>목표에 시작일과 종료일을 설정해주세요.</p>
                    </div>
                `;
                this.chart = null;
                this.currentTasks = [];
                return;
            }

            this.currentTasks = tasks;
            this.renderChart(tasks);
        } catch (error) {
            console.error('Gantt chart error:', error);
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">⚠️</div>
                    <p>간트 차트를 표시할 수 없습니다.</p>
                    <p style="font-size: 0.75rem; color: #999;">${error.message}</p>
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
