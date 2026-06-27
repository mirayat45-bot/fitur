// ═══════════════════════════════════════════
// login.js — Empty Neon Login Preview Patch v2
// Tujuan: login screen dibuat kosong tanpa teks/form/tombol.
// File ini sengaja tidak mengubah struktur project lain.
// ═══════════════════════════════════════════
'use strict';

(function () {
  const SESSION_KEY = 'kasir_session';
  const SESSION_MAX_AGE = 12 * 60 * 60 * 1000;

  function getSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw);
      if (!session || !session.loginAt) return null;

      if (Date.now() - session.loginAt > SESSION_MAX_AGE) {
        localStorage.removeItem(SESSION_KEY);
        return null;
      }

      return session;
    } catch {
      return null;
    }
  }

  function buildEmptyLogin() {
    const loginPage = document.getElementById('pg-login');
    if (!loginPage) return;

    loginPage.classList.add('neon-login-screen', 'is-empty-preview');
    loginPage.setAttribute('aria-label', 'Empty neon login preview');

    // Paksa bersih: semua teks, logo, form, tombol, dan katalog di area login dihapus dari tampilan.
    loginPage.innerHTML = `
      <div class="blob3" aria-hidden="true"></div>
      <div class="login-container login-container-empty" aria-hidden="true">
        <div class="lcard login-force-empty-card">
          <div class="login-force-empty-core"></div>
        </div>
      </div>
    `;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const session = getSession();
    if (session) {
      window.location.href = 'dashboard.html';
      return;
    }

    buildEmptyLogin();
  });

  // Stub aman supaya onclick lama tidak error kalau masih ada elemen tersisa dari cache lama.
  window.login = function () {};
  window.doLogin = function () {};
  window.pickRole = function () {};
  window.installApp = function () {};
  window.showKatalog = function () {};
  window.closeKatalog = function () {};
})();
