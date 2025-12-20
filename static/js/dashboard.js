// Dashboard Charts Management
const Dashboard = {
    typeChart: null,
    productChart: null,

    init() {
        // Charts will be created when data is loaded
    },

    async update(year) {
        const summary = await API.getDashboardSummary({ year });
        this.updateSummaryCards(summary);
        this.updateCharts(summary);
    },

    updateSummaryCards(summary) {
        document.getElementById('totalGoals').textContent = summary.total_goals;
        document.getElementById('totalMilestones').textContent = summary.total_milestones;
        document.getElementById('totalTasks').textContent = summary.total_tasks;
        document.getElementById('overallProgress').textContent = Math.round(summary.overall_progress) + '%';
    },

    updateCharts(summary) {
        this.updateTypeChart(summary.by_type);
        this.updateProductChart(summary.by_product);
    },

    updateTypeChart(data) {
        const ctx = document.getElementById('typeChart').getContext('2d');

        if (this.typeChart) {
            this.typeChart.destroy();
        }

        const labels = [];
        const values = [];
        const counts = [];
        const colors = [];

        if (data.issue) {
            labels.push('문제점 개선');
            values.push(data.issue.progress);
            counts.push(data.issue.count);
            colors.push('#f97316');
        }
        if (data.feature) {
            labels.push('신규 기능');
            values.push(data.feature.progress);
            counts.push(data.feature.count);
            colors.push('#8b5cf6');
        }
        if (data.feedback) {
            labels.push('사용자 피드백');
            values.push(data.feedback.progress);
            counts.push(data.feedback.count);
            colors.push('#059669');
        }

        this.typeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '평균 진척률 (%)',
                    data: values,
                    backgroundColor: colors,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => `목표 수: ${counts[context.dataIndex]}개`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    },

    updateProductChart(data) {
        const ctx = document.getElementById('productChart').getContext('2d');

        if (this.productChart) {
            this.productChart.destroy();
        }

        const labels = Object.keys(data);
        const values = labels.map(k => data[k].progress);
        const counts = labels.map(k => data[k].count);

        if (labels.length === 0) {
            this.productChart = new Chart(ctx, {
                type: 'bar',
                data: { labels: ['데이터 없음'], datasets: [{ data: [0] }] },
                options: { responsive: true, maintainAspectRatio: false }
            });
            return;
        }

        const colors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

        this.productChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: '평균 진척률 (%)',
                    data: values,
                    backgroundColor: colors.slice(0, labels.length),
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            afterLabel: (context) => `목표 수: ${counts[context.dataIndex]}개`
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
};
