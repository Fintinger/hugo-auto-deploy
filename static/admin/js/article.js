/**
 * Article Model — V1
 *
 * Builds an in-memory Article index from GitHub Tree API entries.
 * No network calls. No DOM. Pure data shaping.
 *
 * Rules:
 *   - Only paths under `content/posts/{year}/{month}/{day}/`
 *   - Only `.md` files (case-insensitive)
 *   - Paths inside any index.assets subtree are NEVER articles
 *   - isBundle is set ONLY for `index.md` whose directory contains an `index.assets/` subtree
 *   - Each Markdown file is one Article — same-directory multi-md is supported
 */

(function () {
    'use strict';

    var POSTS_PREFIX = 'content/posts/';

    /**
     * Check if a tree entry is a candidate article path.
     */
    function isArticlePath(path) {
        if (!path) return false;
        if (path.indexOf(POSTS_PREFIX) !== 0) return false;
        if (path.toLowerCase().indexOf('.md') !== path.length - 3) return false;
        // Reject anything inside an index.assets directory.
        if (path.indexOf('/index.assets/') >= 0) return false;
        return true;
    }

    /**
     * Parse a posts path into year / month / day / filename / directory.
     * Returns null if path is not a well-formed posts path.
     */
    function parsePath(path) {
        var rest = path.substring(POSTS_PREFIX.length); // e.g. "2026/08/26/index.md"
        var parts = rest.split('/');
        if (parts.length < 4) return null;

        var year = parts[0];
        var month = parts[1];
        var day = parts[2];
        var filename = parts.slice(3).join('/');

        // Loose validation: year/month/day are 4 / 2 / 2 digit strings.
        if (!/^\d{4}$/.test(year)) return null;
        if (!/^\d{2}$/.test(month)) return null;
        if (!/^\d{2}$/.test(day)) return null;

        var lastSlash = path.lastIndexOf('/');
        var directory = path.substring(0, lastSlash + 1); // "content/posts/2026/08/26/"

        return {
            year: year,
            month: month,
            day: day,
            filename: filename,
            directory: directory
        };
    }

    /**
     * Build the Article list from raw tree entries.
     * Walks the tree twice: once to collect bundle directories, once to emit articles.
     */
    function parseTree(treeEntries) {
        if (!Array.isArray(treeEntries)) return [];

        // First pass: collect directories that contain index.assets/ subtrees.
        var bundleDirs = Object.create(null);
        for (var i = 0; i < treeEntries.length; i++) {
            var entry = treeEntries[i];
            if (entry.type !== 'tree') continue;
            var p = entry.path;
            var idx = p.indexOf('/index.assets');
            if (idx > 0 && p.substring(idx) === '/index.assets') {
                // Tree entry is itself the index.assets subtree; mark its parent.
                var dir = p.substring(0, idx) + '/';
                bundleDirs[dir] = true;
            }
        }

        // Second pass: emit Article records.
        var articles = [];
        for (var j = 0; j < treeEntries.length; j++) {
            var e = treeEntries[j];
            if (e.type !== 'blob') continue;
            if (!isArticlePath(e.path)) continue;

            var parsed = parsePath(e.path);
            if (!parsed) continue;

            var isIndex = parsed.filename === 'index.md';
            var hasBundle = !!bundleDirs[parsed.directory];

            articles.push({
                path: e.path,
                filename: parsed.filename,
                directory: parsed.directory,
                year: parsed.year,
                month: parsed.month,
                day: parsed.day,
                isIndex: isIndex,
                isBundle: isIndex && hasBundle,
                assetsPath: hasBundle ? (parsed.directory + 'index.assets/') : null,
                sha: e.sha,
                size: typeof e.size === 'number' ? e.size : null
            });
        }

        return articles;
    }

    /**
     * Sort articles by year desc, month desc, day desc, filename asc.
     * In-place.
     */
    function sortArticles(articles) {
        articles.sort(function (a, b) {
            if (a.year !== b.year) return b.year < a.year ? -1 : 1;
            if (a.month !== b.month) return b.month < a.month ? -1 : 1;
            if (a.day !== b.day) return b.day < b.day ? -1 : 1;
            if (a.filename < b.filename) return -1;
            if (a.filename > b.filename) return 1;
            return 0;
        });
        return articles;
    }

    /**
     * Build a nested directory structure: { year: { month: { day: [articles] } } }.
     * Years/months/days are also exposed as ordered arrays via the returned metadata.
     */
    function buildDirectoryTree(articles) {
        var byYear = Object.create(null);
        var yearOrder = [];
        var monthOrderByYear = {};
        var dayOrderByYearMonth = {};

        for (var i = 0; i < articles.length; i++) {
            var a = articles[i];
            if (!byYear[a.year]) {
                byYear[a.year] = { _order: [] };
                yearOrder.push(a.year);
                monthOrderByYear[a.year] = [];
                dayOrderByYearMonth[a.year] = {};
            }
            if (!byYear[a.year][a.month]) {
                byYear[a.year][a.month] = { _order: [] };
                monthOrderByYear[a.year].push(a.month);
                dayOrderByYearMonth[a.year][a.month] = [];
            }
            if (!byYear[a.year][a.month][a.day]) {
                byYear[a.year][a.month][a.day] = [];
                dayOrderByYearMonth[a.year][a.month].push(a.day);
            }
            byYear[a.year][a.month][a.day].push(a);
        }

        // Sort orders desc.
        function sortDesc(arr) { arr.sort().reverse(); }
        sortDesc(yearOrder);
        for (var yi = 0; yi < yearOrder.length; yi++) {
            var y = yearOrder[yi];
            sortDesc(monthOrderByYear[y]);
            for (var mi = 0; mi < monthOrderByYear[y].length; mi++) {
                var m = monthOrderByYear[y][mi];
                sortDesc(dayOrderByYearMonth[y][m]);
            }
        }

        return {
            byYear: byYear,
            yearOrder: yearOrder,
            monthOrderByYear: monthOrderByYear,
            dayOrderByYearMonth: dayOrderByYearMonth
        };
    }

    /**
     * Filter articles by query.
     * Matches against filename, path, year, month, day (case-insensitive).
     */
    function filterArticles(articles, query) {
        if (!query) return articles.slice();
        var q = String(query).toLowerCase().trim();
        if (!q) return articles.slice();
        return articles.filter(function (a) {
            return (a.filename && a.filename.toLowerCase().indexOf(q) >= 0)
                || (a.path && a.path.toLowerCase().indexOf(q) >= 0)
                || (a.year && a.year.indexOf(q) >= 0)
                || (a.month && a.month.indexOf(q) >= 0)
                || (a.day && a.day.indexOf(q) >= 0);
        });
    }

    /**
     * Format byte size as human-readable string.
     */
    function formatSize(n) {
        if (n == null || isNaN(n)) return '';
        if (n < 1024) return n + ' B';
        if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1024 / 1024).toFixed(2) + ' MB';
    }

    /**
     * Find an article by path. Returns null if not found.
     */
    function findByPath(articles, path) {
        if (!Array.isArray(articles)) return null;
        for (var i = 0; i < articles.length; i++) {
            if (articles[i].path === path) return articles[i];
        }
        return null;
    }

    /* ============================================
       Stage 5 — New article creation
       ============================================ */

    /**
     * Format a Date object as YYYY-MM-DD using local timezone
     * (NOT UTC — using toISOString() would shift by timezone offset).
     * Uses duck-typing instead of instanceof Date to be robust across
     * iframe / VM / bundler boundaries.
     */
    function formatLocalDate(date) {
        if (!date || typeof date.getFullYear !== 'function') return '';
        var t = date.getTime();
        if (isNaN(t)) return '';
        var y = date.getFullYear();
        var m = String(date.getMonth() + 1).padStart(2, '0');
        var d = String(date.getDate()).padStart(2, '0');
        return y + '-' + m + '-' + d;
    }

    /**
     * Parse a YYYY-MM-DD string into components.
     * Returns null if invalid.
     */
    function parseDateString(str) {
        if (!str || typeof str !== 'string') return null;
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
        if (!m) return null;
        var year = parseInt(m[1], 10);
        var month = parseInt(m[2], 10);
        var day = parseInt(m[3], 10);
        if (month < 1 || month > 12) return null;
        if (day < 1 || day > 31) return null;
        // Round-trip through Date to catch invalid combinations like 2026-02-30.
        var d = new Date(year, month - 1, day);
        if (d.getFullYear() !== year || d.getMonth() !== month - 1 || d.getDate() !== day) return null;
        return { year: year, month: month, day: day, date: str };
    }

    /**
     * Build the canonical new-article path: content/posts/YYYY/MM/DD/{filename}
     * If filename is omitted, defaults to index.md (Page Bundle entry).
     */
    function buildArticlePath(date, filename) {
        var parts = parseDateString(typeof date === 'string' ? date : formatLocalDate(date));
        if (!parts) return '';
        var fn = (filename && String(filename).trim()) || 'index.md';
        // Filename must have already been validated; we only normalize the .md suffix here.
        if (fn.toLowerCase().slice(-3) !== '.md') fn += '.md';
        return 'content/posts/' +
            parts.year + '/' +
            String(parts.month).padStart(2, '0') + '/' +
            String(parts.day).padStart(2, '0') +
            '/' + fn;
    }

    /**
     * Parse a comma/newline-separated input into a cleaned, deduped array.
     * - trim each item
     * - drop empty
     * - preserve user input order
     * - case-sensitive dedupe
     */
    function parseListInput(raw) {
        if (!raw) return [];
        var parts = String(raw).split(/[,\n]/);
        var seen = Object.create(null);
        var out = [];
        for (var i = 0; i < parts.length; i++) {
            var t = parts[i].trim();
            if (!t) continue;
            if (seen[t]) continue;
            seen[t] = true;
            out.push(t);
        }
        return out;
    }

    /**
     * Validate a new-article filename (NOT a path).
     * Rules:
     *   - non-empty after trim
     *   - ends with .md (case-insensitive)
     *   - max length 80 (reasonable for any FS)
     *   - no path separators (/ or \)
     *   - no parent references (.. or .)
     *   - no Windows-reserved-illegal chars: : * ? " < > |
     *   - no control characters (ASCII < 0x20)
     *   - no leading/trailing whitespace (we trim before checking)
     *
     * Returns { ok: true, normalized } on success (normalized has trimmed .md suffix).
     * Returns { ok: false, error } on failure.
     */
    function validateArticleFilename(input) {
        if (input == null) return { ok: false, error: '文件名不能为空' };
        var fn = String(input);
        // Trim leading/trailing whitespace; reject if blank after trim.
        fn = fn.replace(/^\s+|\s+$/g, '');
        if (!fn) return { ok: false, error: '文件名不能为空' };
        if (fn.length > 80) return { ok: false, error: '文件名过长（> 80 字符）' };
        // Path separators (must come before .. check).
        if (/[\/\\]/.test(fn)) return { ok: false, error: '文件名不能包含路径分隔符 / 或 \\' };
        // Parent reference / single dot.
        if (fn === '..' || fn === '.' || fn.indexOf('..') >= 0) {
            return { ok: false, error: '文件名不能包含 ..' };
        }
        // Windows-reserved-illegal characters.
        if (/[:*?"<>|]/.test(fn)) return { ok: false, error: '文件名包含非法字符 (: * ? " < > |)' };
        // Control characters.
        if (/[\x00-\x1f]/.test(fn)) return { ok: false, error: '文件名包含控制字符' };
        // Must end with .md (case-insensitive).
        if (fn.toLowerCase().slice(-3) !== '.md') return { ok: false, error: '文件名必须以 .md 结尾' };
        // Stem must be non-empty (e.g. ".md" alone is invalid).
        if (fn.length <= 3) return { ok: false, error: '文件名不能只有扩展名' };
        return { ok: true, normalized: fn };
    }

    /**
     * Escape a string for safe inclusion in YAML double-quoted scalar.
     * Per YAML 1.2 spec, only " and \ need escaping inside double-quoted strings.
     * Control chars are escaped as \xHH for safety.
     */
    function yamlEscape(str) {
        if (str == null) return '';
        var out = '';
        for (var i = 0; i < str.length; i++) {
            var c = str.charCodeAt(i);
            var ch = str[i];
            if (ch === '\\') out += '\\\\';
            else if (ch === '"') out += '\\"';
            else if (ch === '\n') out += '\\n';
            else if (ch === '\r') out += '\\r';
            else if (ch === '\t') out += '\\t';
            else if (c < 0x20) out += '\\x' + c.toString(16).padStart(2, '0');
            else out += ch;
        }
        return out;
    }

    /**
     * Generate Front Matter YAML for a NEW article.
     * V1: whole-file serialization is acceptable because there is no original
     * Front Matter to preserve.
     *
     * formData = {
     *   title, date, categories[], tags[], draft (bool), math (bool), body
     * }
     */
    function generateFrontMatter(formData) {
        var lines = [];
        lines.push('---');
        lines.push('title: "' + yamlEscape(formData.title || '') + '"');
        lines.push('date: ' + (formData.date || ''));
        if (Array.isArray(formData.categories) && formData.categories.length > 0) {
            lines.push('categories:');
            for (var i = 0; i < formData.categories.length; i++) {
                lines.push('- "' + yamlEscape(formData.categories[i]) + '"');
            }
        }
        if (Array.isArray(formData.tags) && formData.tags.length > 0) {
            lines.push('tags:');
            for (var j = 0; j < formData.tags.length; j++) {
                lines.push('- "' + yamlEscape(formData.tags[j]) + '"');
            }
        }
        if (formData.draft) {
            lines.push('draft: true');
        }
        if (formData.math) {
            lines.push('math: true');
        }
        lines.push('---');
        var body = (formData.body || '').replace(/^\s+/, '');
        // Body always starts with a blank line after the closing ---
        return lines.join('\n') + '\n\n' + body + (body ? '\n' : '');
    }

    /**
     * Sanitize a title for use in a Git commit message.
     *  - strip newlines
     *  - collapse internal whitespace
     *  - trim
     *  - cap length
     */
    function sanitizeTitleForCommit(title, prefix) {
        var t = String(title || '').replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
        var max = 60;
        if (t.length > max) t = t.slice(0, max - 1) + '…';
        var p = prefix ? prefix + ' ' : '';
        return p + t;
    }

    /**
     * Validate a new-article form.
     * Returns { ok: true } or { ok: false, errors: { fieldName: message } }.
     */
    function validateForm(formData) {
        var errors = {};
        var title = (formData.title || '').trim();
        if (!title) errors.title = '标题不能为空';
        else if (title.length > 200) errors.title = '标题过长（> 200 字符）';

        var date = parseDateString(formData.date);
        if (!date) errors.date = '日期格式无效（应为 YYYY-MM-DD）';

        if (formData.categories && !Array.isArray(formData.categories)) {
            errors.categories = '分类格式无效';
        }
        if (formData.tags && !Array.isArray(formData.tags)) {
            errors.tags = '标签格式无效';
        }

        if (Object.keys(errors).length > 0) {
            return { ok: false, errors: errors };
        }
        return { ok: true };
    }

    window.ArticleModel = {
        POSTS_PREFIX: POSTS_PREFIX,
        isArticlePath: isArticlePath,
        parsePath: parsePath,
        parseTree: parseTree,
        sortArticles: sortArticles,
        buildDirectoryTree: buildDirectoryTree,
        filterArticles: filterArticles,
        formatSize: formatSize,
        findByPath: findByPath,

        // Stage 5 — new article creation
        formatLocalDate: formatLocalDate,
        parseDateString: parseDateString,
        buildArticlePath: buildArticlePath,
        parseCategoriesInput: parseListInput,
        parseTagsInput: parseListInput,
        validateForm: validateForm,
        validateArticleFilename: validateArticleFilename,
        generateFrontMatter: generateFrontMatter,
        sanitizeTitleForCommit: sanitizeTitleForCommit
    };
})();