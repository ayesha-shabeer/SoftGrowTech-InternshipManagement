/**
 * InternTrack - Settings Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Settings.init();
  }
});

const Settings = {
  init() {
    this.initAccountSettings();
    this.initAppearanceSettings();
    this.initNotificationSettings();
    this.initResetData();
  },

  initAccountSettings() {
    const form = document.getElementById('account-settings-form');
    if (!form) return;

    const user = Auth.getCurrentUser();
    const emailInput = document.getElementById('settings-email-input');
    if (emailInput && user) {
      emailInput.value = user.email;
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentPass = document.getElementById('settings-current-pass').value;
      const newPass = document.getElementById('settings-new-pass').value;
      const confirmPass = document.getElementById('settings-confirm-pass').value;

      if (!currentPass) {
        App.showToast('Please enter your current password.', 'warning');
        return;
      }

      if (user.password !== currentPass) {
        App.showToast('Current password does not match.', 'error');
        return;
      }

      if (newPass) {
        if (newPass.length < 6) {
          App.showToast('New password must be at least 6 characters long.', 'warning');
          return;
        }
        if (newPass !== confirmPass) {
          App.showToast('New passwords do not match.', 'error');
          return;
        }

        Auth.updateCurrentUser({ password: newPass });
        document.getElementById('settings-current-pass').value = '';
        document.getElementById('settings-new-pass').value = '';
        document.getElementById('settings-confirm-pass').value = '';

        App.showToast('Password updated successfully!', 'success', 'Security Updated');
      } else {
        App.showToast('Account details verified.', 'info');
      }
    });
  },

  initAppearanceSettings() {
    const currentTheme = localStorage.getItem('interntrack_theme') || 'light';
    const lightRadio = document.getElementById('theme-light-radio');
    const darkRadio = document.getElementById('theme-dark-radio');

    if (currentTheme === 'dark' && darkRadio) {
      darkRadio.checked = true;
    } else if (lightRadio) {
      lightRadio.checked = true;
    }

    const radios = document.querySelectorAll('input[name="theme-choice"]');
    radios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        const theme = e.target.value;
        App.setTheme(theme);
        App.showToast(`Applied ${theme} appearance`, 'info');
      });
    });
  },

  initNotificationSettings() {
    const savedPreferences = JSON.parse(localStorage.getItem('interntrack_pref_notifs') || '{"reminders": true, "submissions": true, "announcements": true}');

    const remCheck = document.getElementById('notif-reminders-check');
    const subCheck = document.getElementById('notif-submissions-check');
    const annCheck = document.getElementById('notif-announcements-check');

    if (remCheck) remCheck.checked = savedPreferences.reminders;
    if (subCheck) subCheck.checked = savedPreferences.submissions;
    if (annCheck) annCheck.checked = savedPreferences.announcements;

    const notifForm = document.getElementById('notification-settings-form');
    if (notifForm) {
      notifForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prefs = {
          reminders: remCheck ? remCheck.checked : true,
          submissions: subCheck ? subCheck.checked : true,
          announcements: annCheck ? annCheck.checked : true
        };
        localStorage.setItem('interntrack_pref_notifs', JSON.stringify(prefs));
        App.showToast('Notification preferences saved', 'success');
      });
    }
  },

  initResetData() {
    const resetBtn = document.getElementById('btn-reset-demo-data');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset all demo tasks, submissions, and profile data to default?')) {
          localStorage.clear();
          initializeSeedData();
          App.showToast('Demo data reset to factory defaults', 'info');
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 800);
        }
      });
    }
  }
};
