/**
 * InternTrack - Core Application Engine
 * Global layout interactivity, theme management, toast notifications, and modal controls.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.initTheme();
    this.initSidebar();
    this.initUserProfile();
    this.initNotifications();
    this.initDropdowns();
    this.initIcons();
    this.highlightActiveNav();
  },

  // --- Theme Management ---
  initTheme() {
    const savedTheme = localStorage.getItem('interntrack_theme') || 'light';
    this.setTheme(savedTheme);

    const themeToggleBtns = document.querySelectorAll('.theme-toggle-btn');
    themeToggleBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.setTheme(nextTheme);
        this.showToast(`Switched to ${nextTheme} theme`, 'info', 'Appearance Updated');
      });
    });
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('interntrack_theme', theme);

    // Update icon states if present
    document.querySelectorAll('.theme-icon-sun').forEach(el => {
      el.style.display = theme === 'dark' ? 'inline-block' : 'none';
    });
    document.querySelectorAll('.theme-icon-moon').forEach(el => {
      el.style.display = theme === 'dark' ? 'none' : 'inline-block';
    });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // --- Sidebar Mobile Drawer ---
  initSidebar() {
    const menuBtn = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    let backdrop = document.querySelector('.sidebar-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (menuBtn && sidebar) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }
  },

  // --- Highlight Active Nav Item ---
  highlightActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
      const link = item.querySelector('a');
      if (link) {
        const href = link.getAttribute('href');
        if (href === currentPath || (currentPath === '' && href === 'index.html')) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      }
    });
  },

  // --- User Profile Header Sync ---
  initUserProfile() {
    const currentUser = Auth.getCurrentUser();
    if (!currentUser) return;

    // Update user names
    document.querySelectorAll('.user-name-display').forEach(el => {
      el.textContent = currentUser.name;
    });

    // Update user student IDs
    document.querySelectorAll('.user-studentid-display').forEach(el => {
      el.textContent = currentUser.studentId || 'INT-2026-WD01';
    });

    // Update user domains
    document.querySelectorAll('.user-domain-display').forEach(el => {
      el.textContent = currentUser.domain || currentUser.department || 'Web Development';
    });

    // Update user roles
    document.querySelectorAll('.user-role-display').forEach(el => {
      el.textContent = currentUser.role;
    });

    // Update user emails
    document.querySelectorAll('.user-email-display').forEach(el => {
      el.textContent = currentUser.email;
    });

    // Update user department
    document.querySelectorAll('.user-dept-display').forEach(el => {
      el.textContent = currentUser.department;
    });

    // Update avatars
    document.querySelectorAll('.user-avatar-img').forEach(el => {
      if (currentUser.avatar) {
        if (el.tagName.toLowerCase() === 'img') {
          el.src = currentUser.avatar;
          el.alt = currentUser.name;
        } else {
          el.style.backgroundImage = `url(${currentUser.avatar})`;
          el.textContent = '';
        }
      } else {
        el.textContent = currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2);
      }
    });

    // Logout buttons
    document.querySelectorAll('.btn-logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    });
  },

  // --- Notification Center ---
  initNotifications() {
    const notifsContainer = document.querySelector('.notifications-list');
    const badge = document.querySelector('.notif-badge');
    const notifs = JSON.parse(localStorage.getItem('interntrack_notifications') || '[]');

    const unreadCount = notifs.filter(n => !n.read).length;
    if (badge) {
      if (unreadCount > 0) {
        badge.style.display = 'block';
      } else {
        badge.style.display = 'none';
      }
    }

    if (notifsContainer) {
      if (notifs.length === 0) {
        notifsContainer.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications</div>';
      } else {
        notifsContainer.innerHTML = notifs.map(n => `
          <div class="notification-item ${n.read ? '' : 'unread'}">
            <div style="width: 8px; height: 8px; border-radius: 50%; background: ${n.type === 'success' ? 'var(--success)' : n.type === 'warning' ? 'var(--warning)' : 'var(--primary)'}; margin-top: 6px;"></div>
            <div>
              <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-main);">${n.title}</div>
              <div style="font-size: 0.78rem; color: var(--text-muted); margin: 2px 0;">${n.message}</div>
              <div style="font-size: 0.7rem; color: var(--text-subtle);">${n.time}</div>
            </div>
          </div>
        `).join('');
      }
    }

    // Mark as read clicker
    const markReadBtn = document.querySelector('.btn-mark-all-read');
    if (markReadBtn) {
      markReadBtn.addEventListener('click', () => {
        const updated = notifs.map(n => ({ ...n, read: true }));
        localStorage.setItem('interntrack_notifications', JSON.stringify(updated));
        if (badge) badge.style.display = 'none';
        document.querySelectorAll('.notification-item').forEach(el => el.classList.remove('unread'));
        App.showToast('All notifications marked as read', 'info');
      });
    }
  },

  // --- Generic Dropdowns ---
  initDropdowns() {
    document.addEventListener('click', (e) => {
      const toggle = e.target.closest('[data-dropdown-toggle]');
      if (toggle) {
        e.stopPropagation();
        const targetId = toggle.getAttribute('data-dropdown-toggle');
        const targetMenu = document.getElementById(targetId);

        // Close others
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
          if (menu !== targetMenu) menu.classList.remove('active');
        });

        if (targetMenu) {
          targetMenu.classList.toggle('active');
        }
      } else if (!e.target.closest('.dropdown-menu')) {
        document.querySelectorAll('.dropdown-menu.active').forEach(menu => {
          menu.classList.remove('active');
        });
      }
    });
  },

  // --- Global Toast Notification System ---
  showToast(message, type = 'success', title = '') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let defaultTitle = 'Success';
    let iconName = 'check-circle';
    if (type === 'error') {
      defaultTitle = 'Error';
      iconName = 'alert-circle';
    } else if (type === 'warning') {
      defaultTitle = 'Warning';
      iconName = 'alert-triangle';
    } else if (type === 'info') {
      defaultTitle = 'Information';
      iconName = 'info';
    }

    const displayTitle = title || defaultTitle;

    toast.innerHTML = `
      <div class="toast-icon"><i data-lucide="${iconName}"></i></div>
      <div class="toast-content">
        <div class="toast-title">${displayTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close Toast"><i data-lucide="x"></i></button>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    const removeToast = () => {
      toast.classList.add('hiding');
      setTimeout(() => {
        if (toast.parentElement) toast.remove();
      }, 300);
    };

    toast.querySelector('.toast-close').addEventListener('click', removeToast);
    setTimeout(removeToast, 4000);
  },

  // --- Modal Helpers ---
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // --- Initialize Lucide Icons ---
  initIcons() {
    if (window.lucide) {
      lucide.createIcons();
    }
  }
};
