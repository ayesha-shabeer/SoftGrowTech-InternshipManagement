/**
 * InternTrack - Dashboard Controller
 * Dynamic KPI calculation, Milestone progress tracking, Recent tasks table, and SVG Charts.
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Dashboard.init();
  }
});

const Dashboard = {
  init() {
    this.renderGreeting();
    this.renderKPIs();
    this.renderMilestones();
    this.renderRecentTasks();
    this.renderWeeklyChart();
  },

  renderGreeting() {
    const user = Auth.getCurrentUser();
    const greetingEl = document.getElementById('dashboard-greeting');
    if (greetingEl && user) {
      const hour = new Date().getHours();
      let timeOfDay = 'Good morning';
      if (hour >= 12 && hour < 17) timeOfDay = 'Good afternoon';
      else if (hour >= 17) timeOfDay = 'Good evening';

      const firstName = user.name.split(' ')[0];
      greetingEl.innerHTML = `${timeOfDay}, ${firstName} <span style="display:inline-block; animation: wave 1.5s infinite transform;">👋</span>`;
    }
  },

  renderKPIs() {
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    const submissions = JSON.parse(localStorage.getItem('interntrack_submissions') || '[]');

    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'Completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
    const inReviewTasks = tasks.filter(t => t.status === 'In Review').length;

    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Elements
    const totalTasksEl = document.getElementById('kpi-total-tasks');
    const completedTasksEl = document.getElementById('kpi-completed-tasks');
    const pendingTasksEl = document.getElementById('kpi-pending-tasks');
    const completionRateEl = document.getElementById('kpi-completion-rate');

    if (totalTasksEl) totalTasksEl.textContent = totalTasks;
    if (completedTasksEl) completedTasksEl.textContent = completedTasks;
    if (pendingTasksEl) pendingTasksEl.textContent = pendingTasks;
    if (completionRateEl) completionRateEl.textContent = `${completionRate}%`;

    // Linear progress bar in summary
    const progressFill = document.getElementById('dashboard-progress-fill');
    const progressPercentText = document.getElementById('dashboard-progress-percent');
    if (progressFill) progressFill.style.width = `${completionRate}%`;
    if (progressPercentText) progressPercentText.textContent = `${completionRate}%`;

    // Counts text
    const totalCountText = document.getElementById('stat-total-count');
    const completedCountText = document.getElementById('stat-completed-count');
    const pendingCountText = document.getElementById('stat-pending-count');
    const reviewCountText = document.getElementById('stat-review-count');

    if (totalCountText) totalCountText.textContent = `${totalTasks} Tasks`;
    if (completedCountText) completedCountText.textContent = `${completedTasks} Completed`;
    if (pendingCountText) pendingCountText.textContent = `${pendingTasks} Pending`;
    if (reviewCountText) reviewCountText.textContent = `${inReviewTasks} In Review`;
  },

  renderMilestones() {
    const milestones = [
      { id: 1, title: 'Orientation', completed: true },
      { id: 2, title: 'First Task', completed: true },
      { id: 3, title: 'Midpoint Review', completed: true },
      { id: 4, title: 'Final Project', completed: false, active: true },
      { id: 5, title: 'Completion', completed: false }
    ];

    const container = document.getElementById('milestone-stepper-container');
    if (!container) return;

    const completedCount = milestones.filter(m => m.completed).length;
    const progressPercent = ((completedCount - 1) / (milestones.length - 1)) * 100;

    container.innerHTML = `
      <div class="milestone-track-line">
        <div class="milestone-track-progress" style="width: ${progressPercent}%;"></div>
      </div>
      ${milestones.map((m, idx) => `
        <div class="milestone-node ${m.completed ? 'completed' : m.active ? 'active' : ''}">
          <div class="milestone-dot">
            ${m.completed ? '✓' : (idx + 1)}
          </div>
          <div class="milestone-title">${m.title}</div>
        </div>
      `).join('')}
    `;
  },

  renderRecentTasks() {
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    const tbody = document.getElementById('recent-tasks-tbody');
    if (!tbody) return;

    // Show recent tasks (include all assigned milestone tasks)
    const recentTasks = tasks.slice(0, 5);

    if (recentTasks.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 32px; color: var(--text-muted);">
            No tasks found.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = recentTasks.map(t => {
      let badgeClass = 'badge-pending';
      if (t.status === 'Completed') badgeClass = 'badge-completed';
      else if (t.status === 'In Review') badgeClass = 'badge-in-review';
      else if (t.status === 'Overdue') badgeClass = 'badge-overdue';

      return `
        <tr>
          <td>
            <div class="table-cell-title">${t.title}</div>
            <div class="table-cell-sub">${t.category || 'Development'}</div>
          </td>
          <td>
            <span class="badge badge-low">${t.type}</span>
          </td>
          <td style="color: var(--text-muted); font-size: 0.85rem;">
            ${t.assignedDate}
          </td>
          <td style="color: var(--text-muted); font-size: 0.85rem; font-weight: 500;">
            ${t.dueDate}
          </td>
          <td>
            <span class="badge ${badgeClass}">
              <span class="badge-dot"></span>
              ${t.status}
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 8px;">
              <a href="task-details.html?id=${t.id}" class="btn btn-outline btn-sm">View</a>
              ${t.status !== 'Completed' ? `<a href="submit.html?taskId=${t.id}" class="btn btn-primary btn-sm">Submit</a>` : ''}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderWeeklyChart() {
    const chartSvg = document.getElementById('dashboard-activity-chart');
    if (!chartSvg) return;

    // SVG Bar & Sparkline visualization
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const values = [4, 6, 8, 5, 9, 3, 7];
    const maxVal = 10;
    const chartHeight = 180;
    const chartWidth = 700;
    const barWidth = 48;
    const gap = (chartWidth - (days.length * barWidth)) / (days.length + 1);

    let barsSvg = '';
    days.forEach((day, i) => {
      const val = values[i];
      const h = (val / maxVal) * (chartHeight - 50);
      const x = gap + i * (barWidth + gap);
      const y = chartHeight - h - 30;

      barsSvg += `
        <g class="bar-group" style="cursor: pointer;">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="8" fill="url(#indigoGradient)" opacity="0.9">
            <title>${day}: ${val} hours / tasks active</title>
          </rect>
          <text x="${x + barWidth/2}" y="${y - 10}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--primary)">${val}h</text>
          <text x="${x + barWidth/2}" y="${chartHeight - 8}" text-anchor="middle" font-size="12" font-weight="500" fill="var(--text-muted)">${day}</text>
        </g>
      `;
    });

    chartSvg.innerHTML = `
      <defs>
        <linearGradient id="indigoGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#6366F1" />
          <stop offset="100%" stop-color="#4F46E5" />
        </linearGradient>
      </defs>
      ${barsSvg}
    `;
  }
};
