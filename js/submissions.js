/**
 * InternTrack - Submissions & Drag-and-Drop Upload Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  const user = Auth.requireAuth();
  if (user) {
    Submissions.init();
  }
});

const Submissions = {
  uploadedFiles: [],

  init() {
    // Determine page context
    const path = window.location.pathname.split('/').pop();

    if (path === 'submit.html') {
      this.initSubmitForm();
      this.initDropzone();
    } else if (path === 'submissions.html') {
      this.renderSubmissionsList();
    } else if (path === 'submission-details.html') {
      this.renderSubmissionDetails();
    }
  },

  // --- Submit Work Page Form ---
  initSubmitForm() {
    const taskSelect = document.getElementById('submission-task-select');
    const form = document.getElementById('submission-form');
    const titleInput = document.getElementById('submission-title-input');
    const typeSelect = document.getElementById('submission-type-select');
    const descInput = document.getElementById('submission-desc-input');
    const githubInput = document.getElementById('submission-github-input');
    const demoInput = document.getElementById('submission-demo-input');
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');

    const urlParams = new URLSearchParams(window.location.search);
    const preselectedTaskId = urlParams.get('taskId');

    const updateFormForTask = (taskId, forceOverwrite = false) => {
      if (!taskId) return;
      const found = tasks.find(t => t.id === taskId);
      if (!found) return;

      if (titleInput && (!titleInput.value || forceOverwrite)) {
        titleInput.value = found.title;
      }
      if (typeSelect && (!typeSelect.value || forceOverwrite)) {
        typeSelect.value = found.type || 'Project';
      }
      if (descInput && (!descInput.value || forceOverwrite)) {
        descInput.value = found.description || `Milestone deliverable for ${found.title}.`;
      }
    };

    if (taskSelect) {
      taskSelect.innerHTML = `
        <option value="">-- Select an assigned task --</option>
        ${tasks.map(t => `
          <option value="${t.id}" ${t.id === preselectedTaskId ? 'selected' : ''}>
            ${t.title} (${t.status})
          </option>
        `).join('')}
      `;

      // Auto-fill project title if preselected
      if (preselectedTaskId) {
        updateFormForTask(preselectedTaskId, true);
      }

      // Auto-fill project title & details whenever task changes
      taskSelect.addEventListener('change', (e) => {
        updateFormForTask(e.target.value, false);
      });
    }

    // Quick fill preset buttons
    const btnQuickInternship = document.getElementById('btn-quick-fill-internship');
    if (btnQuickInternship) {
      btnQuickInternship.addEventListener('click', () => {
        const task5 = tasks.find(t => t.id === 'task-5' || t.title.toLowerCase().includes('internship')) || tasks[4];
        if (task5 && taskSelect) {
          taskSelect.value = task5.id;
        }
        if (titleInput) titleInput.value = 'Internship Management Website (SoftGrowTech Portal)';
        if (typeSelect) typeSelect.value = 'Project';
        if (descInput) {
          descInput.value = 'Comprehensive Web Development capstone for SoftGrowTech: Developed a responsive intern dashboard featuring authentication, assigned tasks tracking, work submission pipeline with drag-and-drop file upload, productivity metrics, and official SoftGrowTech corporate footer. Deadline 12:00 AM Midnight.';
        }
        if (githubInput) githubInput.value = 'https://github.com/softgrowtech/internship-website';
        if (demoInput) demoInput.value = 'https://internship.softgrowtech.in';
        App.showToast('Loaded details for Internship Management Website (Due 12:00 AM Midnight)', 'info', 'Preset Applied');
      });
    }

    const btnQuickNoteFlow = document.getElementById('btn-quick-fill-noteflow');
    if (btnQuickNoteFlow) {
      btnQuickNoteFlow.addEventListener('click', () => {
        const task2 = tasks.find(t => t.id === 'task-2' || t.title.toLowerCase().includes('note')) || tasks[1];
        if (task2 && taskSelect) {
          taskSelect.value = task2.id;
        }
        if (titleInput) titleInput.value = 'Note Making Website (NoteFlow)';
        if (typeSelect) typeSelect.value = 'Project';
        if (descInput) {
          descInput.value = 'Full-featured Note Making Web Application (NoteFlow) created with HTML5, modern CSS flex/grid layout, and local storage persistence for note drafting, tags, search filtering, and deletion.';
        }
        if (githubInput) githubInput.value = 'https://github.com/ayesha-shabeer/NoteFlow-Website';
        if (demoInput) demoInput.value = 'https://noteflow-notes.pages.dev';
        App.showToast('Loaded details for Note Making Website (NoteFlow)', 'info', 'Preset Applied');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmissionSubmit();
      });
    }
  },

  // --- Drag and Drop File Upload ---
  initDropzone() {
    const dropzone = document.getElementById('upload-dropzone');
    const fileInput = document.getElementById('file-upload-input');
    const previewList = document.getElementById('file-preview-list');

    if (!dropzone || !fileInput) return;

    ['dragenter', 'dragover'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('drag-active');
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropzone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('drag-active');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      this.handleSelectedFiles(files);
    });

    dropzone.addEventListener('click', () => {
      fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
      this.handleSelectedFiles(e.target.files);
    });
  },

  handleSelectedFiles(files) {
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      // Validate file size (< 10MB)
      if (file.size > 10 * 1024 * 1024) {
        App.showToast(`File "${file.name}" exceeds the 10MB limit.`, 'error', 'File Too Large');
        return;
      }

      // Check duplicates
      if (this.uploadedFiles.some(f => f.name === file.name)) return;

      const fileObj = {
        name: file.name,
        size: this.formatFileSize(file.size),
        rawSize: file.size
      };

      this.uploadedFiles.push(fileObj);
    });

    this.renderFilePreviews();
    App.showToast(`Attached ${files.length} file(s) for upload`, 'info');
  },

  formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  },

  renderFilePreviews() {
    const list = document.getElementById('file-preview-list');
    if (!list) return;

    if (this.uploadedFiles.length === 0) {
      list.innerHTML = '';
      return;
    }

    list.innerHTML = this.uploadedFiles.map((file, index) => `
      <div class="file-preview-card">
        <div class="file-info">
          <i data-lucide="file-archive" style="color: var(--primary); width: 22px; height: 22px;"></i>
          <div>
            <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${file.name}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${file.size} • Ready for upload</div>
          </div>
        </div>
        <button type="button" class="btn btn-ghost btn-sm" onclick="Submissions.removeFile(${index})" aria-label="Remove File">
          <i data-lucide="trash-2" style="color: var(--danger); width: 16px; height: 16px;"></i>
        </button>
      </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
  },

  removeFile(index) {
    this.uploadedFiles.splice(index, 1);
    this.renderFilePreviews();
  },

  handleSubmissionSubmit() {
    const taskId = document.getElementById('submission-task-select').value;
    const title = document.getElementById('submission-title-input').value.trim();
    const type = document.getElementById('submission-type-select').value;
    const desc = document.getElementById('submission-desc-input').value.trim();
    const githubUrl = document.getElementById('submission-github-input').value.trim();
    const demoUrl = document.getElementById('submission-demo-input').value.trim();

    // Client-side validation
    if (!taskId) {
      App.showToast('Please select a task for this submission.', 'warning', 'Required Field');
      return;
    }
    if (!title) {
      App.showToast('Please provide a project title.', 'warning', 'Required Field');
      return;
    }
    if (!desc) {
      App.showToast('Please describe your submission and implementation approach.', 'warning', 'Required Field');
      return;
    }

    const newSubmission = {
      id: 'sub-' + Date.now().toString().slice(-4),
      taskId: taskId,
      projectTitle: title,
      type: type || 'Task',
      submittedOn: new Date().toISOString().split('T')[0],
      githubUrl: githubUrl || 'https://github.com/softgrowtech/internship-website',
      liveDemoUrl: demoUrl || 'https://internship.softgrowtech.in',
      description: desc,
      files: this.uploadedFiles.length > 0 ? this.uploadedFiles : [
        { name: `${title.toLowerCase().replace(/\s+/g, '-')}-submission.zip`, size: '2.4 MB' }
      ],
      status: 'Submitted',
      score: 'Pending',
      reviewer: 'SoftGrowTech Review Team',
      reviewedOn: 'Pending Review',
      feedback: 'Your submission has been queued for evaluation. Your supervisor will review the repository and provide feedback shortly.'
    };

    // Save to submissions
    const submissions = JSON.parse(localStorage.getItem('interntrack_submissions') || '[]');
    submissions.unshift(newSubmission);
    localStorage.setItem('interntrack_submissions', JSON.stringify(submissions));

    // Update Task Status
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      tasks[taskIndex].status = 'In Review';
      localStorage.setItem('interntrack_tasks', JSON.stringify(tasks));
    }

    // Add notification
    const notifs = JSON.parse(localStorage.getItem('interntrack_notifications') || '[]');
    notifs.unshift({
      id: 'notif-' + Date.now(),
      title: 'Work Submitted Successfully',
      message: `"${title}" has been submitted for review.`,
      time: 'Just now',
      read: false,
      type: 'success'
    });
    localStorage.setItem('interntrack_notifications', JSON.stringify(notifs));

    // Show Success Modal / Screen
    const modal = document.getElementById('submission-success-modal');
    if (modal) {
      App.openModal('submission-success-modal');
    } else {
      App.showToast('Work submitted successfully!', 'success', 'Submission Sent');
      setTimeout(() => {
        window.location.href = 'submissions.html';
      }, 1000);
    }
  },

  // --- Submissions History List ---
  renderSubmissionsList() {
    const submissions = JSON.parse(localStorage.getItem('interntrack_submissions') || '[]');
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');
    const tbody = document.getElementById('submissions-tbody');
    const filterSelect = document.getElementById('submissions-status-filter');
    const assignedContainer = document.getElementById('assigned-milestones-container');

    // Render Assigned Milestones Awaiting Submission Banner
    if (assignedContainer) {
      // Find assigned tasks (like Task 5) that are Pending or In Review
      const pendingMilestones = tasks.filter(t => t.status === 'Pending' || t.status === 'In Review');
      if (pendingMilestones.length > 0) {
        assignedContainer.innerHTML = pendingMilestones.map(t => {
          const isPending = t.status === 'Pending';
          return `
            <div class="card" style="margin-bottom: 20px; border-left: 4px solid ${isPending ? 'var(--warning)' : 'var(--primary)'}; background: var(--bg-card); box-shadow: var(--shadow-sm);">
              <div class="card-body" style="display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding: 18px 22px;">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span class="badge ${isPending ? 'badge-pending' : 'badge-in-review'}">
                      <span class="badge-dot"></span> ${isPending ? 'Assigned Milestone • Not Submitted' : 'Submitted • Under Review'}
                    </span>
                    <span class="badge badge-high">${t.priority || 'High'} Priority</span>
                  </div>
                  <h3 style="font-size: 1.2rem; margin-bottom: 6px; color: var(--text-main); font-weight: 700;">${t.title}</h3>
                  <div style="display: flex; flex-wrap: wrap; gap: 16px; font-size: 0.85rem; color: var(--text-muted);">
                    <div>
                      <strong style="color: var(--text-main);">Assigned:</strong> ${t.assignedDate}
                    </div>
                    <div>
                      <strong style="color: var(--danger);">Deadline:</strong> ${t.dueDate} (Deadline is till midnight)
                    </div>
                  </div>
                </div>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                  <a href="submission-details.html?taskId=${t.id}" class="btn btn-outline btn-sm">Submission Details</a>
                  ${isPending ? `
                    <a href="submit.html?taskId=${t.id}" class="btn btn-primary btn-sm" style="display: inline-flex; align-items: center; gap: 6px;">
                      <i data-lucide="upload-cloud" style="width: 16px; height: 16px;"></i>
                      <span>Submit Deliverable</span>
                    </a>
                  ` : `
                    <span class="badge badge-in-review" style="font-size: 0.85rem; padding: 6px 12px;">Submitted & Queued for Review</span>
                  `}
                </div>
              </div>
            </div>
          `;
        }).join('');
      } else {
        assignedContainer.innerHTML = '';
      }
    }

    if (!tbody) return;

    const render = (filter = 'all') => {
      const filtered = filter === 'all' 
        ? submissions 
        : submissions.filter(s => s.status.toLowerCase().replace(/\s+/g, '-') === filter.toLowerCase());

      if (filtered.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" style="text-align: center; padding: 48px 16px;">
              <div class="empty-state">
                <div class="empty-state-icon">
                  <i data-lucide="file-check" style="width: 32px; height: 32px;"></i>
                </div>
                <div class="empty-state-title">No submissions found</div>
                <p class="empty-state-text">Submit your completed internship tasks to start building your track record.</p>
                <a href="submit.html" class="btn btn-primary btn-sm">Submit Work</a>
              </div>
            </td>
          </tr>
        `;
        if (window.lucide) lucide.createIcons();
        return;
      }

      tbody.innerHTML = filtered.map(s => {
        let badgeClass = 'badge-submitted';
        if (s.status === 'Approved') badgeClass = 'badge-approved';
        else if (s.status === 'Under Review') badgeClass = 'badge-under-review';
        else if (s.status === 'Needs Revision') badgeClass = 'badge-needs-revision';

        return `
          <tr>
            <td>
              <div class="table-cell-title">${s.projectTitle}</div>
              <div class="table-cell-sub">${s.files ? s.files.length : 1} file(s) attached</div>
            </td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${s.submittedOn}</td>
            <td><span class="badge badge-low">${s.type}</span></td>
            <td>
              <span class="badge ${badgeClass}">
                <span class="badge-dot"></span>
                ${s.status}
              </span>
            </td>
            <td>
              <span style="font-weight: 700; color: ${s.score !== 'Pending' ? 'var(--primary)' : 'var(--text-muted)'}; font-size: 0.9rem;">
                ${s.score}
              </span>
            </td>
            <td style="font-size: 0.85rem; color: var(--text-muted);">${s.reviewer}</td>
            <td>
              <a href="submission-details.html?id=${s.id}" class="btn btn-outline btn-sm">View Feedback</a>
            </td>
          </tr>
        `;
      }).join('');

      if (window.lucide) lucide.createIcons();
    };

    render('all');

    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        render(e.target.value);
      });
    }
  },

  // --- Detailed Submission View ---
  renderSubmissionDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const subId = urlParams.get('id');
    const taskId = urlParams.get('taskId');
    const submissions = JSON.parse(localStorage.getItem('interntrack_submissions') || '[]');
    const tasks = JSON.parse(localStorage.getItem('interntrack_tasks') || '[]');

    let sub = null;
    if (subId) {
      sub = submissions.find(s => s.id === subId);
    }
    if (!sub && taskId) {
      sub = submissions.find(s => s.taskId === taskId);
    }

    // Elements
    const titleEl = document.getElementById('submission-detail-title');
    const typeEl = document.getElementById('submission-detail-type');
    const dateEl = document.getElementById('submission-detail-date');
    const descEl = document.getElementById('submission-detail-desc');
    const statusEl = document.getElementById('submission-detail-status');
    const scoreEl = document.getElementById('submission-detail-score');
    const reviewerEl = document.getElementById('submission-detail-reviewer');
    const feedbackTextEl = document.getElementById('submission-detail-feedback');
    const githubLinkEl = document.getElementById('submission-github-link');
    const demoLinkEl = document.getElementById('submission-demo-link');
    const filesContainer = document.getElementById('submission-files-container');
    const ctaContainer = document.getElementById('submission-detail-cta-container');

    // If no submitted record exists yet for this task (e.g. Task 5 is just assigned)
    if (!sub && (taskId || subId)) {
      const task = tasks.find(t => t.id === taskId || t.id === subId);
      if (task) {
        if (titleEl) titleEl.textContent = `${task.title} (SoftGrowTech Portal)`;
        if (typeEl) typeEl.textContent = `${task.type} Assignment`;
        if (dateEl) dateEl.textContent = `Assigned on ${task.assignedDate} • Deadline: ${task.dueDate}`;
        if (descEl) descEl.textContent = task.description;
        if (scoreEl) scoreEl.textContent = 'Pending Submission';
        if (reviewerEl) reviewerEl.textContent = 'SoftGrowTech Review Team';
        if (feedbackTextEl) {
          feedbackTextEl.textContent = `This capstone deliverable is assigned to you. Deadline is till midnight (${task.dueDate}). When your implementation is ready, click "Submit Deliverable" below to upload your GitHub repository and live deployment for mentor grading.`;
        }

        if (statusEl) {
          statusEl.className = 'badge badge-pending';
          statusEl.innerHTML = '<span class="badge-dot"></span> Assigned (Not Submitted)';
        }

        if (githubLinkEl) {
          githubLinkEl.href = 'https://github.com/softgrowtech/internship-website';
          githubLinkEl.textContent = 'https://github.com/softgrowtech/internship-website';
        }
        if (demoLinkEl) {
          demoLinkEl.href = 'https://internship.softgrowtech.in';
          demoLinkEl.textContent = 'https://internship.softgrowtech.in';
        }

        if (filesContainer) {
          filesContainer.innerHTML = '<p style="color: var(--text-muted); font-size: 0.85rem;">No files uploaded yet. Click Submit Deliverable to upload archives.</p>';
        }

        if (ctaContainer) {
          ctaContainer.innerHTML = `
            <a href="submit.html?taskId=${task.id}" class="btn btn-primary btn-full btn-lg" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              <i data-lucide="upload-cloud" style="width: 18px; height: 18px;"></i>
              <span>Submit Deliverable Now</span>
            </a>
          `;
        }

        if (window.lucide) lucide.createIcons();
        return;
      }
    }

    // Default to first submission if not specified
    if (!sub) {
      sub = submissions[0];
    }

    if (!sub) {
      window.location.href = 'submissions.html';
      return;
    }

    // Populate Fields for existing submission
    if (titleEl) titleEl.textContent = sub.projectTitle;
    if (typeEl) typeEl.textContent = `${sub.type} Submission`;
    if (dateEl) dateEl.textContent = `Submitted on ${sub.submittedOn}`;
    if (descEl) descEl.textContent = sub.description;
    if (scoreEl) scoreEl.textContent = sub.score;
    if (reviewerEl) reviewerEl.textContent = sub.reviewer;
    if (feedbackTextEl) feedbackTextEl.textContent = sub.feedback;

    if (githubLinkEl) {
      githubLinkEl.href = sub.githubUrl;
      githubLinkEl.textContent = sub.githubUrl;
    }
    if (demoLinkEl) {
      demoLinkEl.href = sub.liveDemoUrl;
      demoLinkEl.textContent = sub.liveDemoUrl;
    }

    if (statusEl) {
      let badgeClass = 'badge-submitted';
      if (sub.status === 'Approved') badgeClass = 'badge-approved';
      else if (sub.status === 'Under Review') badgeClass = 'badge-under-review';
      else if (sub.status === 'Needs Revision') badgeClass = 'badge-needs-revision';

      statusEl.className = `badge ${badgeClass}`;
      statusEl.innerHTML = `<span class="badge-dot"></span> ${sub.status}`;
    }

    if (filesContainer && sub.files) {
      filesContainer.innerHTML = sub.files.map(file => `
        <div class="file-preview-card" style="margin-bottom: 8px;">
          <div class="file-info">
            <i data-lucide="file-check" style="color: var(--primary); width: 20px; height: 20px;"></i>
            <div>
              <div style="font-weight: 600; font-size: 0.88rem; color: var(--text-main);">${file.name}</div>
              <div style="font-size: 0.75rem; color: var(--text-muted);">${file.size}</div>
            </div>
          </div>
          <button class="btn btn-ghost btn-sm" onclick="App.showToast('Downloading file: ${file.name}', 'info')">
            <i data-lucide="download" style="width: 16px; height: 16px;"></i>
          </button>
        </div>
      `).join('');
    }

    if (ctaContainer && sub) {
      ctaContainer.innerHTML = `
        <a href="submit.html?taskId=${sub.taskId}" class="btn btn-outline btn-full btn-sm" style="display: flex; align-items: center; justify-content: center; gap: 6px;">
          <i data-lucide="refresh-cw" style="width: 14px; height: 14px;"></i>
          <span>Resubmit / Update Deliverable</span>
        </a>
      `;
    }

    if (window.lucide) lucide.createIcons();
  }
};
