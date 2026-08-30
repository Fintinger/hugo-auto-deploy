/**
 * Image upload foundation — V1 (Stage 9A)
 *
 * Scope:
 *   - Local validation, sanitization, dedup, target-path computation
 *   - Cursor-based Markdown insertion
 *   - NO GitHub API calls, NO network upload
 *
 * Stage 9B will use these building blocks to actually upload via Contents API
 * at the moment the user clicks "保存修改".
 */

(function () {
    'use strict';

    var ALLOWED_MIME = ['image/png', 'image/jpeg', 'image/gif', 'image/webp'];
    var ALLOWED_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp'];
    var MAX_SIZE = 5 * 1024 * 1024; // 5 MB
    var MAX_FILENAME_LEN = 80;

    /**
     * Validate an image File object. Returns { ok: true } or { ok: false, error }.
     */
    function validateImage(file) {
        if (!file) return { ok: false, error: '未选择文件' };
        if (typeof file.size !== 'number' || file.size <= 0) {
            return { ok: false, error: '文件为空' };
        }
        if (file.size > MAX_SIZE) {
            return { ok: false, error: '图片超过 5 MB，请先压缩后上传' };
        }
        var type = (file.type || '').toLowerCase();
        var ext = (file.name || '').split('.').pop().toLowerCase();
        var mimeOk = ALLOWED_MIME.indexOf(type) >= 0;
        var extOk = ALLOWED_EXT.indexOf(ext) >= 0;
        if (!mimeOk && !extOk) {
            return { ok: false, error: '不支持的文件类型（仅允许 png / jpg / jpeg / gif / webp）' };
        }
        return { ok: true };
    }

    /**
     * Sanitize a user-provided filename.
     *  - trim
     *  - remove path separators (/ \\)
     *  - remove ".."  (anywhere)
     *  - remove control characters
     *  - remove Windows-reserved chars (: * ? " < > |)
     *  - collapse leading/trailing whitespace / dots / underscores in stem
     *  - keep extension
     *  - cap total length
     */
    function sanitizeFilename(name) {
        if (!name) return 'image';
        var s = String(name).trim();
        s = s.replace(/[\/\\]/g, '_');         // path separators
        s = s.split('..').join('');              // parent refs: remove ".." entirely
        s = s.replace(/[\x00-\x1f]/g, '');       // control chars
        s = s.replace(/[:*?"<>|]/g, '');          // Windows-reserved
        // Split into stem and ext.
        var dotIdx = s.lastIndexOf('.');
        var stem = dotIdx > 0 ? s.substring(0, dotIdx) : s;
        var ext = dotIdx > 0 ? s.substring(dotIdx) : '';
        // Collapse leading/trailing whitespace, dots, and underscores.
        stem = stem.replace(/^[\s._]+|[\s._]+$/g, '');
        if (!stem) stem = 'image';
        if (stem.length > 60) stem = stem.substring(0, 60);
        var combined = stem + ext;
        if (combined.length > MAX_FILENAME_LEN) {
            ext = ext.substring(0, Math.max(0, MAX_FILENAME_LEN - stem.length));
        }
        return stem + ext;
    }

    /**
     * Generate a unique filename that does not collide with `existing` names.
     * Pattern: name-1.ext, name-2.ext, ... up to 1000.
     * Fallback: name-<timestamp>.ext
     */
    function generateUniqueName(baseSafeName, existing) {
        if (!existing) existing = [];
        if (existing.indexOf(baseSafeName) < 0) return baseSafeName;
        var dotIdx = baseSafeName.lastIndexOf('.');
        var stem = dotIdx > 0 ? baseSafeName.substring(0, dotIdx) : baseSafeName;
        var ext = dotIdx > 0 ? baseSafeName.substring(dotIdx) : '';
        for (var i = 1; i < 1000; i++) {
            var candidate = stem + '-' + i + ext;
            if (existing.indexOf(candidate) < 0) return candidate;
        }
        return stem + '-' + Date.now() + ext;
    }

    /**
     * Compute the target repo-relative path for a new image in a Page Bundle.
     *   articlePath: "content/posts/2026/08/30/index.md"
     *   safeName:    "screenshot.png"
     * Returns: "content/posts/2026/08/30/index.assets/screenshot.png"
     * Returns null if inputs are invalid.
     */
    function computeTargetPath(articlePath, safeName) {
        if (!articlePath || !safeName) return null;
        var sepIdx = articlePath.lastIndexOf('/');
        if (sepIdx < 0) return null;
        var dir = articlePath.substring(0, sepIdx);
        return dir + '/index.assets/' + safeName;
    }

    /**
     * Build the Markdown reference text for a pending image.
     * Format: ![<alt>](index.assets/<filename>)
     * The path is relative to the article file (which lives in the same dir).
     */
    function buildMarkdown(safeName) {
        var alt = safeName.replace(/\.[^.]+$/, '');
        return '![' + alt + '](index.assets/' + safeName + ')';
    }

    /**
     * Insert text at the cursor position of a textarea. Preserves selection focus.
     * Triggers an 'input' event so dirty-state / preview listeners fire.
     */
    function insertAtCursor(textarea, text) {
        if (!textarea) return;
        var start = textarea.selectionStart;
        var end = textarea.selectionEnd;
        var value = textarea.value || '';
        textarea.value = value.substring(0, start) + text + value.substring(end);
        var newPos = start + text.length;
        try {
            textarea.selectionStart = textarea.selectionEnd = newPos;
            textarea.focus();
        } catch (e) { /* ignore in non-DOM envs */ }
        // Dispatch 'input' so dirty + preview observers run.
        try {
            var ev = new Event('input', { bubbles: true });
            textarea.dispatchEvent(ev);
        } catch (e) { /* ignore */ }
    }

    /* ============================================
       Public API
       ============================================ */
    window.ImageUpload = {
        ALLOWED_MIME: ALLOWED_MIME,
        ALLOWED_EXT: ALLOWED_EXT,
        MAX_SIZE: MAX_SIZE,
        MAX_FILENAME_LEN: MAX_FILENAME_LEN,
        validateImage: validateImage,
        sanitizeFilename: sanitizeFilename,
        generateUniqueName: generateUniqueName,
        computeTargetPath: computeTargetPath,
        buildMarkdown: buildMarkdown,
        insertAtCursor: insertAtCursor
    };
})();