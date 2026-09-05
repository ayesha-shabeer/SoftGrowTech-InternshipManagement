/**
 * SoftGrowTech - Authentication & Seed Data Manager
 * Handles user authentication state, demo credentials, student IDs, domains, and data persistence in localStorage.
 */

const STORAGE_KEYS = {
  USERS: 'interntrack_users',
  CURRENT_USER: 'interntrack_current_user',
  TASKS: 'interntrack_tasks',
  SUBMISSIONS: 'interntrack_submissions',
  NOTIFICATIONS: 'interntrack_notifications',
  SETTINGS: 'interntrack_settings',
  THEME: 'interntrack_theme'
};

// Initial Seed Data for Demo Intern
const DEFAULT_USER = {
  id: 'usr_001',
  studentId: 'INT-2026-WD01',
  name: 'Sarah Ahmed',
  email: 'sarah.ahmed@example.com',
  password: 'password123',
  domain: 'Web Development',
  role: 'Web Development Intern',
  department: 'Web Development',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  startDate: '5 August 2026',
  issueDate: '5 August 2026',
  duration: '1 Month',
  bio: 'Passionate computer science student specializing in modern front-end technologies, UI/UX systems, and responsive web applications at SoftGrowTech.',
  supervisor: 'SoftGrowTech Team'
};

const DEFAULT_TASKS = [
  {
    id: 'task-1',
    title: 'Responsive Portfolio Website',
    type: 'Project',
    category: 'Frontend',
    description: 'Design and build a multi-page responsive personal portfolio using semantic HTML5, modern CSS3 Flexbox/Grid, and clean JavaScript.',
    requirements: [
      'Fully responsive across mobile (320px+), tablet, and desktop',
      'W3C valid semantic HTML markup',
      'Interactive project showcase with filtering',
      'Accessible color contrast (WCAG AA)',
      'Optimized load speed and modern web typography'
    ],
    instructions: 'Create a clean repository on GitHub. Document all architectural decisions in the README. Include a live deployment link on Vercel or GitHub Pages.',
    assignedDate: '2026-08-05',
    dueDate: '2026-08-11',
    status: 'Completed',
    priority: 'High',
    score: '9.5/10',
    resources: [
      { name: 'Design System Guidelines.pdf', size: '1.2 MB' },
      { name: 'Wireframe Assets.zip', size: '4.8 MB' }
    ]
  },
  {
    id: 'task-2',
    title: 'Note Making Website (NoteFlow)',
    type: 'Project',
    category: 'JavaScript Application',
    description: 'Design, develop, and deliver NoteFlow — a responsive notes application using HTML5, CSS3, and JavaScript with localStorage persistence, live search, and colored categorization tags.',
    requirements: [
      'Note creation, rich multiline editing, and category tags',
      'Real-time localStorage persistence with zero data loss on refresh',
      'Instant search by keyword and category live filtering',
      'Pinning important notes and favoriting capability',
      'Light and Dark theme switching with responsive layout'
    ],
    instructions: 'Submit GitHub repository and live deployment link meeting all technical requirements set by SoftGrowTech for Task 2.',
    assignedDate: '2026-08-12',
    dueDate: '2026-08-18',
    status: 'Completed',
    priority: 'High',
    score: '9.6/10',
    resources: [
      { name: 'NoteFlow Functional Specs.pdf', size: '1.1 MB' },
      { name: 'NoteFlow Architecture Blueprint.pdf', size: '2.4 MB' }
    ]
  },
  {
    id: 'task-3',
    title: 'Landing Page UI & Animation',
    type: 'Project',
    category: 'UI/UX',
    description: 'Build a high-converting SaaS landing page with dark mode switch, smooth scroll animations, and interactive feature carousels.',
    requirements: [
      'Dark / Light theme toggle with CSS custom properties',
      'Performant CSS animations and subtle hover micro-interactions',
      'Hero dashboard preview with SVG vector illustrations',
      'Sticky header with mobile responsive drawer'
    ],
    instructions: 'Ensure smooth 60fps animations without causing layout recalculation thrashing.',
    assignedDate: '2026-08-19',
    dueDate: '2026-08-25',
    status: 'Completed',
    priority: 'High',
    score: '9.3/10',
    resources: [
      { name: 'Figma Token Export.json', size: '340 KB' },
      { name: 'Brand Color Palette.pdf', size: '1.5 MB' }
    ]
  },
  {
    id: 'task-4',
    title: 'E-Commerce Product Catalog & Cart',
    type: 'Assignment',
    category: 'Frontend',
    description: 'Develop an interactive product grid with category filters, dynamic pricing calculator, cart drawer, and responsive image galleries.',
    requirements: [
      'Dynamic filtering by price range, brand, and rating',
      'Interactive cart drawer with quantity adjustments and subtotal calculation',
      'Toast notifications on item added/removed',
      'Keyboard navigable modal for product quick-view'
    ],
    instructions: 'Structure your JavaScript using modular object patterns or ES modules for maintainability.',
    assignedDate: '2026-08-26',
    dueDate: '2026-09-01',
    status: 'Completed',
    priority: 'Medium',
    score: '9.1/10',
    resources: [
      { name: 'Product Dataset.json', size: '2.1 MB' },
      { name: 'API Specification.pdf', size: '950 KB' }
    ]
  },
  {
    id: 'task-5',
    title: 'Internship Management Website',
    type: 'Project',
    category: 'Full Application',
    description: 'Design and engineer the official SoftGrowTech Internship Management Website and Deliverable Submission Platform — an enterprise-grade SaaS application.',
    requirements: [
      'Complete end-to-end user experience with authentication and route guards',
      'Dynamic dashboard with KPI metrics, SVG activity charts, and milestone tracker',
      'Drag-and-drop task submission engine with file preview and quick presets',
      'Comprehensive profile, settings, and verified SoftGrowTech company branding',
      'Flawless responsive design from 320px mobile to 4K displays'
    ],
    instructions: 'Final internship capstone project. Deliver clean, semantic, production-quality code. Due by 12:00 AM Midnight.',
    assignedDate: '2026-08-26',
    dueDate: '2026-09-05 (12:00 AM Midnight)',
    status: 'Pending',
    priority: 'High',
    score: null,
    resources: [
      { name: 'Capstone Guidelines & Rubric.pdf', size: '3.4 MB' },
      { name: 'Architecture Blueprint.pdf', size: '1.8 MB' }
    ]
  }
];

const DEFAULT_SUBMISSIONS = [
  {
    id: 'sub-001',
    taskId: 'task-1',
    projectTitle: 'Personal Developer Portfolio & Showcase',
    type: 'Project',
    submittedOn: '2026-08-10',
    githubUrl: 'https://github.com/sarahahmed/developer-portfolio',
    liveDemoUrl: 'https://sarah-ahmed-portfolio.vercel.app',
    description: 'Completed my multi-page portfolio featuring 4 case studies, dark mode, accessible keyboard navigation, and an interactive contact form.',
    files: [
      { name: 'portfolio-source-v1.0.zip', size: '4.2 MB' },
      { name: 'lighthouse-audit-report.pdf', size: '680 KB' }
    ],
    status: 'Approved',
    score: '9.5 / 10',
    reviewer: 'SoftGrowTech Review Team',
    reviewedOn: '2026-08-11',
    feedback: 'Outstanding work! The typography hierarchy, spacing, and accessibility score (100 on Lighthouse) are exceptional. Excellent documentation in your GitHub README.'
  },
  {
    id: 'sub-002',
    taskId: 'task-2',
    projectTitle: 'NoteFlow — Note Making Web Application',
    type: 'Project',
    submittedOn: '2026-08-17',
    githubUrl: 'https://github.com/ayeshashabeer/noteflow-website',
    liveDemoUrl: 'https://noteflow-notes.vercel.app',
    description: 'Engineered the NoteFlow notes application featuring clean Markdown editing, dynamic filtering, real-time localStorage persistence, and responsive UI meeting all SoftGrowTech Task 2 requirements.',
    files: [
      { name: 'noteflow-v2.0-source.zip', size: '3.1 MB' },
      { name: 'noteflow-task2-report.pdf', size: '1.4 MB' }
    ],
    status: 'Approved',
    score: '9.6 / 10',
    reviewer: 'SoftGrowTech Evaluation Team',
    reviewedOn: '2026-08-18',
    feedback: 'Outstanding work on the Note Making Website! The localStorage serialization, instant search, and clean design system are top tier. All requirements verified successfully.'
  },
  {
    id: 'sub-003',
    taskId: 'task-3',
    projectTitle: 'SaaS Landing Page & Dark Theme Engine',
    type: 'Project',
    submittedOn: '2026-08-24',
    githubUrl: 'https://github.com/sarahahmed/saas-landing-page',
    liveDemoUrl: 'https://modern-saas-landing.vercel.app',
    description: 'Engineered a modern landing page featuring CSS variable theming, SVG charts, dynamic testimonial slider, and mobile drawer menu.',
    files: [
      { name: 'saas-landing-distribution.zip', size: '5.6 MB' }
    ],
    status: 'Approved',
    score: '9.3 / 10',
    reviewer: 'SoftGrowTech Review Team',
    reviewedOn: '2026-08-26',
    feedback: 'Submission received and reviewed by the frontend engineering team. Excellent visual polish and 60fps animations.'
  }
];

const DEFAULT_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Submission Approved',
    message: 'Your submission for "Personal Developer Portfolio" scored 9.5/10.',
    time: '2 hours ago',
    read: false,
    type: 'success'
  },
  {
    id: 'notif-2',
    title: 'New Review in Progress',
    message: 'SoftGrowTech Review Team started reviewing "SaaS Landing Page & Dark Theme Engine".',
    time: 'Yesterday',
    read: false,
    type: 'info'
  },
  {
    id: 'notif-3',
    title: 'Deadline Reminder',
    message: 'Task "E-Commerce Product Catalog" is due in 10 days.',
    time: '3 days ago',
    read: true,
    type: 'warning'
  }
];

// Initialize Storage if empty or upgrade existing user format
function initializeSeedData() {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([DEFAULT_USER]));
  } else {
    // Ensure existing user has studentId & domain
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    let modified = false;
    users.forEach(u => {
      if (!u.studentId) {
        u.studentId = 'INT-2026-WD01';
        modified = true;
      }
      if (!u.domain) {
        u.domain = u.department || 'Web Development';
        modified = true;
      }
      if (!u.supervisor || u.supervisor.includes('Alex Chen')) {
        u.supervisor = 'SoftGrowTech Team';
        modified = true;
      }
      if (u.startDate === '2026-06-01' || !u.issueDate || u.startDate !== '5 August 2026') {
        u.startDate = '5 August 2026';
        u.issueDate = '5 August 2026';
        modified = true;
      }
      if (u.duration === '3 Months' || !u.duration || u.duration !== '1 Month') {
        u.duration = '1 Month';
        modified = true;
      }
    });
    if (modified) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
  }

  // Upgrade active session if it still has legacy supervisor name or old duration/start
  const curUserStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
  if (curUserStr) {
    try {
      const curUser = JSON.parse(curUserStr);
      let curMod = false;
      if (curUser && curUser.supervisor && curUser.supervisor.includes('Alex Chen')) {
        curUser.supervisor = 'SoftGrowTech Team';
        curMod = true;
      }
      if (curUser && (curUser.startDate === '2026-06-01' || curUser.duration === '3 Months' || curUser.startDate !== '5 August 2026' || curUser.duration !== '1 Month' || !curUser.issueDate)) {
        curUser.startDate = '5 August 2026';
        curUser.issueDate = '5 August 2026';
        curUser.duration = '1 Month';
        curMod = true;
      }
      if (curMod) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(curUser));
      }
    } catch(e) {}
  }

  // NOTE: CURRENT_USER is intentionally NOT seeded here.
  // It is only set on login/register and removed on logout.
  // Auto-seeding CURRENT_USER would prevent users from ever logging out.

  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(DEFAULT_TASKS));
  } else {
    try {
      const storedTasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.TASKS) || '[]');
      let taskMod = false;
      storedTasks.forEach(t => {
        if (t.description && t.description.includes('InternTrack')) {
          t.description = t.description.replace(/InternTrack/g, 'SoftGrowTech Internship Platform');
          taskMod = true;
        }
        if (t.id === 'task-2' && (!t.title.includes('Note') || t.status !== 'Completed')) {
          t.title = 'Note Making Website (NoteFlow)';
          t.category = 'JavaScript Application';
          t.description = 'Design, develop, and deliver NoteFlow — a responsive notes application using HTML5, CSS3, and JavaScript with localStorage persistence, live search, and colored categorization tags.';
          t.status = 'Completed';
          t.score = '9.6/10';
          taskMod = true;
        }
        if (t.id === 'task-5') {
          t.title = 'Internship Management Website';
          t.dueDate = '2026-09-05 (12:00 AM Midnight)';
          t.priority = 'High';
          // If task-5 was previously set to 'Submitted' in cached storage, reset it to 'Pending' (assigned)
          if (t.status === 'Submitted') {
            t.status = 'Pending';
            t.score = null;
            taskMod = true;
          }
        }
      });
      if (taskMod) localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(storedTasks));
    } catch(e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUBMISSIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(DEFAULT_SUBMISSIONS));
  } else {
    try {
      let storedSubs = JSON.parse(localStorage.getItem(STORAGE_KEYS.SUBMISSIONS) || '[]');
      let subMod = false;
      storedSubs.forEach(s => {
        if (s.reviewer && s.reviewer.includes('Alex Chen')) {
          s.reviewer = 'SoftGrowTech Review Team';
          subMod = true;
        }
        if (s.taskId === 'task-2' && !s.projectTitle.includes('Note')) {
          s.projectTitle = 'NoteFlow — Note Making Web Application';
          s.status = 'Approved';
          s.score = '9.6 / 10';
          subMod = true;
        }
      });
      // Remove any pre-seeded task-5 submission with id 'sub-004' so that Task 5 is NOT pre-submitted
      if (storedSubs.some(s => s.id === 'sub-004')) {
        storedSubs = storedSubs.filter(s => s.id !== 'sub-004');
        subMod = true;
      }
      if (subMod) localStorage.setItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(storedSubs));
    } catch(e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  } else {
    try {
      const storedNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
      let notifMod = false;
      storedNotifs.forEach(n => {
        if (n.message && n.message.includes('Alex Chen')) {
          n.message = n.message.replace(/Alex Chen/g, 'SoftGrowTech Review Team');
          notifMod = true;
        }
      });
      if (notifMod) localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(storedNotifs));
    } catch(e) {}
  }
}

// Authentication Helpers
const Auth = {
  getCurrentUser() {
    const user = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },

  getAllUsers() {
    const users = localStorage.getItem(STORAGE_KEYS.USERS);
    return users ? JSON.parse(users) : [];
  },

  /**
   * Login with Student ID, Full Name, or Email Address (supports letters, numbers, hyphens)
   */
  login(identifier, password) {
    initializeSeedData();
    const users = this.getAllUsers();
    const cleanId = (identifier || '').trim().toLowerCase();

    const foundUser = users.find(u => {
      const matchEmail = (u.email || '').toLowerCase() === cleanId;
      const matchStudentId = (u.studentId || '').toLowerCase() === cleanId;
      const matchName = (u.name || '').toLowerCase() === cleanId;
      return (matchEmail || matchStudentId || matchName) && u.password === password;
    });

    if (foundUser) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(foundUser));
      return { success: true, user: foundUser };
    }
    return { success: false, message: 'Invalid Student ID / Name / Email or incorrect password.' };
  },

  /**
   * Register with Student ID, Full Name, Domain, Department, Email, and Password
   */
  register(userData) {
    initializeSeedData();
    const users = this.getAllUsers();
    const cleanEmail = userData.email.toLowerCase().trim();
    const cleanStudentId = (userData.studentId || '').trim();

    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, message: 'An account with this email already exists.' };
    }

    if (cleanStudentId && users.some(u => (u.studentId || '').toLowerCase() === cleanStudentId.toLowerCase())) {
      return { success: false, message: 'This Student ID is already registered.' };
    }

    // Generate Student ID if not provided
    const studentId = cleanStudentId || ('INT-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase());
    const domain = userData.domain || 'Web Development';

    const newUser = {
      id: 'usr_' + Date.now(),
      studentId: studentId,
      name: userData.name,
      email: userData.email,
      password: userData.password,
      domain: domain,
      role: userData.role || (domain + ' Intern'),
      department: userData.department || domain,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      startDate: '5 August 2026',
      issueDate: '5 August 2026',
      duration: '1 Month',
      bio: 'Intern in ' + domain + ' at SoftGrowTech focused on building real-world projects.',
      supervisor: 'SoftGrowTech Team'
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

    return { success: true, user: newUser };
  },

  logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'logout.html';
  },

  requireAuth() {
    const user = this.getCurrentUser();
    if (!user) {
      window.location.href = 'register.html';
    }
    return user;
  },

  redirectIfAuth() {
    const user = this.getCurrentUser();
    if (user) {
      window.location.href = 'dashboard.html';
    }
  },

  updateCurrentUser(updatedFields) {
    let currentUser = this.getCurrentUser();
    if (!currentUser) return null;

    currentUser = { ...currentUser, ...updatedFields };
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));

    // Update in users array
    const users = this.getAllUsers().map(u => u.id === currentUser.id ? currentUser : u);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    return currentUser;
  }
};

// Initialize seed data immediately on script load
initializeSeedData();
