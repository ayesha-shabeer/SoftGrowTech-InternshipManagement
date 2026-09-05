/**
 * InternTrack - Profile Management Controller
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Profile.init();
  }
});

const Profile = {
  init() {
    this.populateProfileData();
    this.initFormHandlers();
  },

  populateProfileData() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    // View Fields
    const nameHero = document.getElementById('profile-hero-name');
    const studentIdHero = document.getElementById('profile-hero-studentid');
    const roleHero = document.getElementById('profile-hero-role');
    const domainHero = document.getElementById('profile-hero-domain');
    const deptHero = document.getElementById('profile-hero-dept');
    const startHero = document.getElementById('profile-hero-start');
    const durationHero = document.getElementById('profile-hero-duration');
    const supervisorHero = document.getElementById('profile-hero-supervisor');

    if (nameHero) nameHero.textContent = user.name;
    if (studentIdHero) studentIdHero.textContent = user.studentId || 'INT-2026-WD01';
    if (roleHero) roleHero.textContent = user.role;
    if (domainHero) domainHero.textContent = user.domain || user.department || 'Web Development';
    if (deptHero) deptHero.textContent = user.department;
    if (startHero) startHero.textContent = user.issueDate || user.startDate || '5 August 2026';
    if (durationHero) durationHero.textContent = user.duration || '1 Month';
    if (supervisorHero) supervisorHero.textContent = user.supervisor || 'SoftGrowTech Team';

    // Edit Form Inputs
    const nameInput = document.getElementById('edit-name-input');
    const studentIdInput = document.getElementById('edit-studentid-input');
    const emailInput = document.getElementById('edit-email-input');
    const domainInput = document.getElementById('edit-domain-input');
    const deptInput = document.getElementById('edit-dept-input');
    const bioInput = document.getElementById('edit-bio-input');

    if (nameInput) nameInput.value = user.name || '';
    if (studentIdInput) studentIdInput.value = user.studentId || 'INT-2026-WD01';
    if (emailInput) emailInput.value = user.email || '';
    if (domainInput) domainInput.value = user.domain || 'Web Development';
    if (deptInput) deptInput.value = user.department || '';
    if (bioInput) bioInput.value = user.bio || '';

    // Avatars
    document.querySelectorAll('.profile-avatar-preview').forEach(el => {
      if (el.tagName.toLowerCase() === 'img') {
        el.src = user.avatar;
      }
    });
  },

  initFormHandlers() {
    const form = document.getElementById('profile-edit-form');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const currentUser = Auth.getCurrentUser() || {};
      const name = document.getElementById('edit-name-input').value.trim();
      const studentId = document.getElementById('edit-studentid-input').value.trim();
      const email = document.getElementById('edit-email-input').value.trim();
      const domain = document.getElementById('edit-domain-input').value.trim();
      const dept = document.getElementById('edit-dept-input').value.trim();
      const bio = document.getElementById('edit-bio-input').value.trim();

      if (!name || !email) {
        App.showToast('Name and email cannot be empty.', 'error');
        return;
      }

      const updated = Auth.updateCurrentUser({
        name,
        studentId,
        email,
        domain,
        role: domain ? `${domain} Intern` : (currentUser.role || 'Intern'),
        department: dept,
        bio
      });

      if (updated) {
        this.populateProfileData();
        App.initUserProfile();
        App.showToast('Profile information updated successfully!', 'success', 'Profile Saved');
      }
    });

    // Avatar Presets Switcher
    const presetBtns = document.querySelectorAll('.avatar-preset-btn');
    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const newAvatar = btn.getAttribute('data-avatar-url');
        if (newAvatar) {
          Auth.updateCurrentUser({ avatar: newAvatar });
          this.populateProfileData();
          App.initUserProfile();
          App.showToast('Profile avatar changed!', 'info');
        }
      });
    });
  }
};
