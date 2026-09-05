/**
 * InternTrack - Progress, Analytics & Achievements Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Progress.init();
  }
});

const Progress = {
  init() {
    this.renderStats();
    this.renderActivityChart();
    this.renderTrendLineChart();
    this.renderAchievements();
  },

  renderStats() {
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    const submissions = JSON.parse(localStorage.getItem('interntrack_submissions') || '[]');

    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'Completed').length;
    const pending = tasks.filter(t => t.status === 'Pending').length;
    const inReview = tasks.filter(t => t.status === 'In Review').length;

    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    const percentEl = document.getElementById('progress-overall-percent');
    const barFill = document.getElementById('progress-bar-fill');
    const totalEl = document.getElementById('progress-tasks-total');
    const compEl = document.getElementById('progress-tasks-completed');
    const pendEl = document.getElementById('progress-tasks-pending');
    const revEl = document.getElementById('progress-tasks-review');

    if (percentEl) percentEl.textContent = `${rate}%`;
    if (barFill) barFill.style.width = `${rate}%`;
    if (totalEl) totalEl.textContent = total;
    if (compEl) compEl.textContent = completed;
    if (pendEl) pendEl.textContent = pending;
    if (revEl) revEl.textContent = inReview;
  },

  renderActivityChart() {
    const chartSvg = document.getElementById('progress-weekly-svg');
    if (!chartSvg) return;

    // 6-week completion bars
    const weeks = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'];
    const completedCounts = [2, 3, 2, 4, 1, 3];
    const chartHeight = 180;
    const chartWidth = 560;
    const barWidth = 44;
    const gap = (chartWidth - (weeks.length * barWidth)) / (weeks.length + 1);

    let bars = '';
    weeks.forEach((w, i) => {
      const val = completedCounts[i];
      const maxVal = 5;
      const h = (val / maxVal) * (chartHeight - 50);
      const x = gap + i * (barWidth + gap);
      const y = chartHeight - h - 30;

      bars += `
        <g class="chart-bar" style="cursor: pointer;">
          <rect x="${x}" y="${y}" width="${barWidth}" height="${h}" rx="6" fill="#4F46E5" opacity="0.9">
            <title>${w}: ${val} Tasks Completed</title>
          </rect>
          <text x="${x + barWidth/2}" y="${y - 8}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--primary)">${val}</text>
          <text x="${x + barWidth/2}" y="${chartHeight - 8}" text-anchor="middle" font-size="11" fill="var(--text-muted)">${w}</text>
        </g>
      `;
    });

    chartSvg.innerHTML = `
      <defs>
        <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#6366F1"/>
          <stop offset="100%" stop-color="#4F46E5"/>
        </linearGradient>
      </defs>
      ${bars}
    `;
  },

  renderTrendLineChart() {
    const trendSvg = document.getElementById('progress-trend-svg');
    if (!trendSvg) return;

    // Smooth spline trend line
    const points = [
      { x: 40, y: 140, val: '65%' },
      { x: 140, y: 115, val: '72%' },
      { x: 240, y: 90, val: '80%' },
      { x: 340, y: 65, val: '88%' },
      { x: 440, y: 35, val: '94%' }
    ];

    const polyPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    let dotsAndLabels = '';
    points.forEach(p => {
      dotsAndLabels += `
        <circle cx="${p.x}" cy="${p.y}" r="5" fill="#FFFFFF" stroke="#4F46E5" stroke-width="3"/>
        <text x="${p.x}" y="${p.y - 12}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--primary)">${p.val}</text>
      `;
    });

    trendSvg.innerHTML = `
      <polyline fill="none" stroke="#4F46E5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${polyPoints}"/>
      ${dotsAndLabels}
    `;
  },

  renderAchievements() {
    const container = document.getElementById('achievements-container');
    if (!container) return;

    const achievements = [
      {
        id: 'ach-1',
        title: 'First Submission',
        desc: 'Completed and submitted your first internship assignment.',
        icon: '🏆',
        unlocked: true,
        date: 'Unlocked Jun 17'
      },
      {
        id: 'ach-2',
        title: 'Code Quality Star',
        desc: 'Scored 9.0 or higher on a project submission review.',
        icon: '⭐',
        unlocked: true,
        date: 'Unlocked Jun 19'
      },
      {
        id: 'ach-3',
        title: '5 Tasks Completed',
        desc: 'Reach 5 finished assignments across your internship journey.',
        icon: '🔥',
        unlocked: false,
        date: '2 / 5 completed'
      },
      {
        id: 'ach-4',
        title: 'Final Project Ready',
        desc: 'Unlocked capstone requirements and started execution.',
        icon: '🚀',
        unlocked: true,
        date: 'Unlocked Aug 18'
      }
    ];

    container.innerHTML = achievements.map(a => `
      <div class="achievement-card ${a.unlocked ? 'unlocked' : 'locked'}">
        <div class="achievement-badge-icon">${a.icon}</div>
        <div>
          <div style="font-weight: 700; font-size: 0.95rem; color: var(--text-main);">${a.title}</div>
          <div style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0 6px;">${a.desc}</div>
          <div style="font-size: 0.72rem; font-weight: 600; color: ${a.unlocked ? 'var(--primary)' : 'var(--text-subtle)'};">
            ${a.date}
          </div>
        </div>
      </div>
    `).join('');
  }
};
