// API Helper Functions
const API = {
    // Goals
    async getGoals(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/goals/?${query}`);
        return response.json();
    },

    async getGoal(id) {
        const response = await fetch(`/api/goals/${id}`);
        return response.json();
    },

    async createGoal(data) {
        const response = await fetch('/api/goals/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateGoal(id, data) {
        const response = await fetch(`/api/goals/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteGoal(id) {
        const response = await fetch(`/api/goals/${id}`, { method: 'DELETE' });
        return response.json();
    },

    // Milestones
    async getMilestones(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/milestones/?${query}`);
        return response.json();
    },

    async createMilestone(data) {
        const response = await fetch('/api/milestones/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateMilestone(id, data) {
        const response = await fetch(`/api/milestones/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteMilestone(id) {
        const response = await fetch(`/api/milestones/${id}`, { method: 'DELETE' });
        return response.json();
    },

    // Tasks
    async getTasks(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/tasks/?${query}`);
        return response.json();
    },

    async createTask(data) {
        const response = await fetch('/api/tasks/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateTask(id, data) {
        const response = await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteTask(id) {
        const response = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        return response.json();
    },

    // Members
    async getMembers(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/members/?${query}`);
        return response.json();
    },

    async createMember(data) {
        const response = await fetch('/api/members/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateMember(id, data) {
        const response = await fetch(`/api/members/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteMember(id) {
        const response = await fetch(`/api/members/${id}`, { method: 'DELETE' });
        return response.json();
    },

    async getMembersSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/members/summary?${query}`);
        return response.json();
    },

    // Years
    async getYears() {
        const response = await fetch('/api/years');
        return response.json();
    },

    // Dashboard
    async getDashboardSummary(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/dashboard/summary?${query}`);
        return response.json();
    },

    // Gantt
    async getGanttData(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/gantt/data?${query}`);
        return response.json();
    },

    // Ideas
    async getIdeas(params = {}) {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/ideas/?${query}`);
        return response.json();
    },

    async getIdea(id) {
        const response = await fetch(`/api/ideas/${id}`);
        return response.json();
    },

    async createIdea(data) {
        const response = await fetch('/api/ideas/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async updateIdea(id, data) {
        const response = await fetch(`/api/ideas/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteIdea(id) {
        const response = await fetch(`/api/ideas/${id}`, { method: 'DELETE' });
        return response.json();
    },

    async convertIdeaToGoal(id) {
        const response = await fetch(`/api/ideas/${id}/convert`, { method: 'POST' });
        return response.json();
    },

    // Comments
    async getComments(ideaId) {
        const response = await fetch(`/api/ideas/${ideaId}/comments`);
        return response.json();
    },

    async createComment(ideaId, data) {
        const response = await fetch(`/api/ideas/${ideaId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    },

    async deleteComment(commentId) {
        const response = await fetch(`/api/ideas/comments/${commentId}`, { method: 'DELETE' });
        return response.json();
    }
};
