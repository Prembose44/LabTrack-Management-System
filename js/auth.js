/**
 * LabTrack — Authentication & Role Guard Module
 * Stores session in localStorage. No backend needed (demo).
 * Admin: admin@lab.com / Admin@123
 * Student: any other valid credentials
 */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'labtrack_session';
  var ADMIN_EMAIL  = 'admin@lab.com';
  var ADMIN_PASS   = 'Admin@123';

  /* ── Session helpers ─────────────────────────────────────── */
  function getSession() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function setSession(role, name, email) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      role: role, name: name, email: email
    }));
  }

  /* ── Public API ──────────────────────────────────────────── */

  /**
   * Attempt login. Returns 'admin' or 'student'.
   * @param {string} email
   * @param {string} password
   * @returns {'admin'|'student'}
   */
  function login(email, password) {
    if (email === ADMIN_EMAIL && password === ADMIN_PASS) {
      setSession('admin', 'Arjun Kumar', email);
      return 'admin';
    }
    // Any other credentials → student
    var nameParts = email.split('@')[0].replace(/[._\-]/g, ' ').split(' ');
    var name = nameParts.map(function (w) {
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    }).join(' ');
    setSession('student', name || 'Student', email);
    return 'student';
  }

  /** Clear session and redirect to login page. */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = 'login.html';
  }

  /** @returns {'admin'|'student'|null} */
  function getRole()  { var s = getSession(); return s ? s.role  : null; }

  /** @returns {string} Display name of logged-in user */
  function getName()  { var s = getSession(); return s ? s.name  : 'User'; }

  /** @returns {string} Email of logged-in user */
  function getEmail() { var s = getSession(); return s ? s.email : ''; }

  /**
   * Redirect non-admins away. Call at very top of every admin page.
   * Not logged in → login.html
   * Logged in as student → student-dashboard.html
   */
  function guardAdmin() {
    var role = getRole();
    if (!role) { window.location.replace('login.html'); return; }
    if (role !== 'admin') { window.location.replace('student-dashboard.html'); }
  }

  /**
   * Redirect non-students away. Call at very top of every student page.
   * Not logged in → login.html
   * Logged in as admin → admin-dashboard.html
   */
  function guardStudent() {
    var role = getRole();
    if (!role) { window.location.replace('login.html'); return; }
    if (role !== 'student') { window.location.replace('admin-dashboard.html'); }
  }

  /**
   * Populate any element with data-auth-name / data-auth-role in the page.
   * Call after DOM is ready.
   */
  function hydratePage() {
    var s = getSession();
    if (!s) return;
    document.querySelectorAll('[data-auth-name]').forEach(function (el) {
      el.textContent = s.name;
    });
    document.querySelectorAll('[data-auth-role]').forEach(function (el) {
      el.textContent = s.role === 'admin' ? 'Lab Administrator' : 'Student';
    });
    document.querySelectorAll('[data-auth-email]').forEach(function (el) {
      el.textContent = s.email;
    });

    // Update avatars dynamically based on name
    var encoded = encodeURIComponent(s.name);
    var avatarUrl = 'https://ui-avatars.com/api/?name=' + encoded + '&background=006d77&color=fff&size=128&bold=true';
    document.querySelectorAll('img[src*="pravatar"]').forEach(function (img) {
      img.src = avatarUrl;
    });
    document.querySelectorAll('[data-auth-avatar]').forEach(function (img) {
      img.src = avatarUrl;
    });
  }

  /* Export */
  global.LabTrackAuth = {
    login: login,
    logout: logout,
    getRole: getRole,
    getName: getName,
    getEmail: getEmail,
    getSession: getSession,
    guardAdmin: guardAdmin,
    guardStudent: guardStudent,
    hydratePage: hydratePage
  };

})(window);
