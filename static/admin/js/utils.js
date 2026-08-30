/**
 * Admin Utilities
 *
 * V1 — pure helpers. No GitHub API call. No Markdown rendering.
 */

window.AdminUtils = (function () {
    'use strict';

    /**
     * Token masking for UI display.
     * "github_pat_xxxxx..." -> "github_pat_**********xxxx"
     */
    function maskToken(token) {
        if (!token) return '';
        if (token.length <= 8) return '****';
        var prefix = token.slice(0, 11); // "github_pat_"
        var tail = token.slice(-4);
        return prefix + '**********' + tail;
    }

    /**
     * Basic token shape check (Fine-grained PAT starts with github_pat_).
     * NOT a real auth check — only a UI hint.
     */
    function looksLikeToken(token) {
        if (!token) return false;
        var t = String(token).trim();
        if (t.length < 20) return false;
        return /^github_pat_[A-Za-z0-9_]+$/.test(t) || /^[A-Za-z0-9_]{20,}$/.test(t);
    }

    /**
     * Read the blog's existing theme preference (set by PaperMod).
     * Returns 'dark' or 'light'. Never throws.
     */
    function readBlogThemePref() {
        try {
            var v = window.localStorage.getItem('pref-theme');
            if (v === 'dark' || v === 'light') return v;
        } catch (e) { /* localStorage may be blocked */ }
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    }

    /**
     * Apply Admin theme.
     * Independent from blog theme — Admin has its own toggle.
     */
    function applyAdminTheme(theme) {
        if (theme === 'dark') {
            document.body.classList.add('theme-dark');
        } else {
            document.body.classList.remove('theme-dark');
        }
    }

    /**
     * Safe sessionStorage wrapper (can be blocked in private mode).
     */
    var storage = (function () {
        var available = (function () {
            try {
                var k = '__admin_test__';
                window.sessionStorage.setItem(k, '1');
                window.sessionStorage.removeItem(k);
                return true;
            } catch (e) {
                return false;
            }
        })();

        return {
            get: function (key) {
                if (!available) return null;
                try { return window.sessionStorage.getItem(key); } catch (e) { return null; }
            },
            set: function (key, value) {
                if (!available) return false;
                try { window.sessionStorage.setItem(key, value); return true; }
                catch (e) { return false; }
            },
            remove: function (key) {
                if (!available) return;
                try { window.sessionStorage.removeItem(key); } catch (e) { /* ignore */ }
            }
        };
    })();

    /**
     * Debounce.
     */
    function debounce(fn, wait) {
        var timer = null;
        return function () {
            var ctx = this, args = arguments;
            clearTimeout(timer);
            timer = setTimeout(function () { fn.apply(ctx, args); }, wait || 200);
        };
    }

    /**
     * Toast helper. Auto-dismiss after 4s.
     */
    function toast(message, kind) {
        var wrap = document.getElementById('toast-wrap');
        if (!wrap) return;
        var node = document.createElement('div');
        node.className = 'toast' + (kind ? ' ' + kind : '');
        node.textContent = message;
        wrap.appendChild(node);
        setTimeout(function () {
            node.style.opacity = '0';
            setTimeout(function () { if (node.parentNode) node.parentNode.removeChild(node); }, 200);
        }, 4000);
    }

    return {
        maskToken: maskToken,
        looksLikeToken: looksLikeToken,
        readBlogThemePref: readBlogThemePref,
        applyAdminTheme: applyAdminTheme,
        storage: storage,
        debounce: debounce,
        toast: toast
    };
})();