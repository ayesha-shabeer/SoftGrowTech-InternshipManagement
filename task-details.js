/**
 * InternTrack - Task Details Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    TaskDetails.init();
  }
});

const TaskDetails = {
  currentTask: null,

  init() {
    const urlParams = new URLSearchParams(window.location.search);
    const taskId = urlParams.get('id') || 'task-1';
    this.loadTask(taskId);
  },

  loadTask(taskId) {
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    this.currentTask = tasks.find(t => t.id === taskId) || tasks[0];

    if (!this.currentTask) {
      window.location.href = 'tasks.html';
      return;
    }

    this.renderTask();
  },

  renderTask() {
    const t = this.currentTask;

    // Elements
    const titleEl = document.getElementById('task-detail-title');
    const categoryEl = document.getElementById('task-detail-category');
    const descEl = document.getElementById('task-detail-desc');
    const statusEl = document.getElementById('task-detail-status');
    const priorityEl = document.getElementById('task-detail-priority');
    const assignedEl = document.getElementById('task-detail-assigned');
    const dueEl = document.getElementById('task-detail-due');
    const instructionsEl = document.getElementById('task-detail-instructions');
    const requirementsList = document.getElementById('task-detail-requirements');
    const resourcesList = document.getElementById('task-detail-resources');
    const submitBtn = document.getElementById('task-submit-cta-btn');

    if (titleEl) titleEl.textContent = t.title;
    if (categoryEl) categoryEl.textContent = `${t.category || 'Engineering'} • ${t.type}`;
    if (descEl) descEl.textContent = t.description;
    if (assignedEl) assignedEl.textContent = t.assignedDate;
    if (dueEl) dueEl.textContent = t.dueDate;
    if (instructionsEl) instructionsEl.textContent = t.instructions;

    // Status Badge
    if (statusEl) {
      let badgeClass = 'badge-pending';
      if (t.status === 'Completed') badgeClass = 'badge-completed';
      else if (t.status === 'In Review') badgeClass = 'badge-in-review';
      else if (t.status === 'Overdue') badgeClass = 'badge-overdue';

      statusEl.className = `badge ${badgeClass}`;
      statusEl.innerHTML = `<span class="badge-dot"></span> ${t.status}`;
    }

    // Priority Badge
    if (priorityEl) {
      let priorityClass = 'badge-low';
      if (t.priority === 'High') priorityClass = 'badge-high';
      else if (t.priority === 'Medium') priorityClass = 'badge-medium';

      priorityEl.className = `badge ${priorityClass}`;
      priorityEl.innerHTML = `<i data-lucide="flag" style="width: 12px; height: 12px;"></i> ${t.priority} Priority`;
    }

    // Requirements Checklist
    if (requirementsList) {
      requirementsList.innerHTML = t.requirements.map((req, i) => `
        <li style="display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; font-size: 0.92rem; color: var(--text-main);">
          <span style="width: 20px; height: 20px; border-radius: 50%; background: var(--primary-light); color: var(--primary); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; margin-top: 2px;">✓</span>
          <span>${req}</span>
        </li>
      `).join('');
    }

    // Resources
    if (resourcesList) {
      if (t.resources && t.resources.length > 0) {
        resourcesList.innerHTML = t.resources.map(res => `
          <div class="file-preview-card" style="margin-bottom: 8px;">
            <div class="file-info">
              <i data-lucide="file-text" style="color: var(--primary); width: 20px; height: 20px;"></i>
              <div>
                <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${res.name}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${res.size}</div>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="App.showToast('Downloading resource: ${res.name}', 'info')">
              <i data-lucide="download" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        `).join('');
      } else {
        resourcesList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No external resource files attached.</p>';
      }
    }

    // Submit CTA button
    if (submitBtn) {
      if (t.status === 'Completed') {
        submitBtn.className = 'btn btn-secondary btn-lg';
        submitBtn.innerHTML = '<i data-lucide="check-circle"></i> Work Already Submitted';
        submitBtn.removeAttribute('href');
        submitBtn.style.cursor = 'default';
      } else {
        submitBtn.setAttribute('href', `submit.html?taskId=${t.id}`);
      }
    }

    if (window.lucide) lucide.createIcons();
  }
};
