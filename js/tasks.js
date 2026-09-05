/**
 * InternTrack - Tasks Listing & Filtering Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Tasks.init();
  }
});

const Tasks = {
  tasks: [],
  filteredTasks: [],

  init() {
    this.loadTasks();
    this.initFilters();
    this.renderTasks();
  },

  loadTasks() {
    this.tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    this.filteredTasks = [...this.tasks];
  },

  initFilters() {
    const searchInput = document.getElementById('task-search-input');
    const statusFilter = document.getElementById('task-status-filter');
    const priorityFilter = document.getElementById('task-priority-filter');
    const sortFilter = document.getElementById('task-sort-filter');

    const applyFilters = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const status = statusFilter ? statusFilter.value : 'all';
      const priority = priorityFilter ? priorityFilter.value : 'all';
      const sort = sortFilter ? sortFilter.value : 'due-asc';

      this.filteredTasks = this.tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(query) || 
                              task.description.toLowerCase().includes(query) ||
                              (task.category && task.category.toLowerCase().includes(query));
        
        const matchesStatus = status === 'all' || task.status.toLowerCase() === status.toLowerCase();
        const matchesPriority = priority === 'all' || task.priority.toLowerCase() === priority.toLowerCase();

        return matchesSearch && matchesStatus && matchesPriority;
      });

      // Sorting
      const parseDueDate = (d) => {
        if (!d) return 0;
        const clean = d.split('(')[0].trim();
        return new Date(clean).getTime() || 0;
      };

      if (sort === 'due-asc') {
        this.filteredTasks.sort((a, b) => parseDueDate(a.dueDate) - parseDueDate(b.dueDate));
      } else if (sort === 'due-desc') {
        this.filteredTasks.sort((a, b) => parseDueDate(b.dueDate) - parseDueDate(a.dueDate));
      } else if (sort === 'title-asc') {
        this.filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
      }

      this.renderTasks();
    };

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
    if (sortFilter) sortFilter.addEventListener('change', applyFilters);
  },

  renderTasks() {
    const gridContainer = document.getElementById('tasks-grid');
    const countEl = document.getElementById('tasks-count-display');

    if (countEl) {
      countEl.textContent = `Showing ${this.filteredTasks.length} of ${this.tasks.length} tasks`;
    }

    if (!gridContainer) return;

    if (this.filteredTasks.length === 0) {
      gridContainer.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <div class="empty-state-icon">
            <i data-lucide="inbox" style="width: 32px; height: 32px;"></i>
          </div>
          <div class="empty-state-title">No tasks found</div>
          <p class="empty-state-text">Try adjusting your search filters or check back later for new task assignments.</p>
          <button class="btn btn-outline btn-sm" onclick="Tasks.resetFilters()">Clear Filters</button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    gridContainer.innerHTML = this.filteredTasks.map(t => {
      let badgeClass = 'badge-pending';
      if (t.status === 'Completed') badgeClass = 'badge-completed';
      else if (t.status === 'In Review') badgeClass = 'badge-in-review';
      else if (t.status === 'Overdue') badgeClass = 'badge-overdue';

      let priorityBadgeClass = 'badge-low';
      if (t.priority === 'High') priorityBadgeClass = 'badge-high';
      else if (t.priority === 'Medium') priorityBadgeClass = 'badge-medium';

      return `
        <div class="card card-hover" style="display: flex; flex-direction: column; justify-content: space-between;">
          <div class="card-body">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 8px;">
              <span class="badge ${priorityBadgeClass}">
                <i data-lucide="flag" style="width: 12px; height: 12px;"></i>
                ${t.priority} Priority
              </span>
              <span class="badge ${badgeClass}">
                <span class="badge-dot"></span>
                ${t.status}
              </span>
            </div>
            <h3 style="font-size: 1.15rem; margin-bottom: 8px;">${t.title}</h3>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5; margin-bottom: 16px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
              ${t.description}
            </p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-muted); border-top: 1px solid var(--border-color-subtle); padding-top: 12px;">
              <div style="display: flex; align-items: center; gap: 4px;">
                <i data-lucide="calendar" style="width: 14px; height: 14px;"></i>
                <span>Due ${t.dueDate}</span>
              </div>
              <span style="font-weight: 600; color: var(--text-main);">${t.type}</span>
            </div>
          </div>
          <div class="card-footer" style="display: flex; gap: 8px; justify-content: flex-end;">
            <a href="task-details.html?id=${t.id}" class="btn btn-outline btn-sm" style="flex: 1;">Details</a>
            ${t.status !== 'Completed' ? `<a href="submit.html?taskId=${t.id}" class="btn btn-primary btn-sm" style="flex: 1;">Submit Work</a>` : `<span class="btn btn-secondary btn-sm" style="flex: 1; opacity: 0.7; cursor: default;">Finished ✓</span>`}
          </div>
        </div>
      `;
    }).join('');

    if (window.lucide) lucide.createIcons();
  },

  resetFilters() {
    const searchInput = document.getElementById('task-search-input');
    const statusFilter = document.getElementById('task-status-filter');
    const priorityFilter = document.getElementById('task-priority-filter');

    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = 'all';
    if (priorityFilter) priorityFilter.value = 'all';

    this.filteredTasks = [...this.tasks];
    this.renderTasks();
  }
};
