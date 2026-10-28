/* Admin editor layout: meta drawers + single active panel.
 *
 * app.js owns the workspace state machine (empty / selected / new / edit)
 * and the unsaved-changes guards. This file only wires the two meta
 * drawers so the editor can stay focused on the Markdown pane.
 */
(function () {
  'use strict';

  function q(id) {
    return document.getElementById(id);
  }

  var drawers = {
    edit: { drawer: q('ed-meta-drawer'), backdrop: q('ed-meta-backdrop'), trigger: q('ed-meta-open') },
    new: { drawer: q('na-meta-drawer'), backdrop: q('na-meta-backdrop'), trigger: q('na-meta-open') }
  };

  function anyOpen() {
    return Object.keys(drawers).some(function (key) {
      var d = drawers[key].drawer;
      return d && !d.hidden;
    });
  }

  function syncBodyLock() {
    if (document.body) {
      document.body.classList.toggle('meta-open', anyOpen());
    }
  }

  function setOpen(key, open) {
    var entry = drawers[key];
    if (!entry || !entry.drawer) return;
    // Only one drawer may be open at a time.
    Object.keys(drawers).forEach(function (other) {
      if (other === key) return;
      var otherEntry = drawers[other];
      if (!otherEntry.drawer) return;
      otherEntry.drawer.hidden = true;
      if (otherEntry.backdrop) otherEntry.backdrop.hidden = true;
      if (otherEntry.trigger) otherEntry.trigger.setAttribute('aria-expanded', 'false');
    });
    entry.drawer.hidden = !open;
    if (entry.backdrop) entry.backdrop.hidden = !open;
    if (entry.trigger) entry.trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    syncBodyLock();
  }

  function connect(key) {
    var entry = drawers[key];
    if (!entry) return;
    if (entry.trigger) {
      entry.trigger.setAttribute('aria-expanded', 'false');
      entry.trigger.addEventListener('click', function () {
        setOpen(key, !!entry.drawer.hidden);
      });
    }
    var close = document.getElementById(key === 'edit' ? 'ed-meta-close' : 'na-meta-close');
    if (close) {
      close.addEventListener('click', function () { setOpen(key, false); });
    }
    if (entry.backdrop) {
      entry.backdrop.addEventListener('click', function () { setOpen(key, false); });
    }
  }

  connect('edit');
  connect('new');

  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var closed = false;
    Object.keys(drawers).forEach(function (key) {
      var entry = drawers[key];
      if (entry.drawer && !entry.drawer.hidden) {
        setOpen(key, false);
        closed = true;
      }
    });
    if (closed) e.stopPropagation();
  });

  // The drawer footer mirrors the header actions without duplicating IDs.
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest ? e.target.closest('[data-meta-click]') : null;
    if (trigger) {
      var target = q(trigger.getAttribute('data-meta-click'));
      if (target && !target.disabled) {
        // Close first so the editor/error banners are visible; validation
        // can reopen the drawer synchronously if a field is invalid.
        Object.keys(drawers).forEach(function (key) {
          if (drawers[key].drawer && !drawers[key].drawer.hidden) setOpen(key, false);
        });
        target.click();
      }
      return;
    }
    var close = e.target.closest ? e.target.closest('[data-drawer-close]') : null;
    if (close) {
      setOpen(close.getAttribute('data-drawer-close'), false);
    }
  });

  window.AdminLayout = {
    openMeta: function (key) { setOpen(key, true); },
    closeMeta: function (key) { setOpen(key, false); },
    closeAll: function () {
      Object.keys(drawers).forEach(function (key) { setOpen(key, false); });
    }
  };
})();
