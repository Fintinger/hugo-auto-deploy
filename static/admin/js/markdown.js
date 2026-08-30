/**
 * Markdown rendering pipeline — V1
 *
 * Architecture:
 *   raw markdown
 *     ↓  pre-process shortcodes → comment-marker placeholders
 *     ↓  pre-process math       → comment-marker placeholders
 *     ↓  marked.parse()
 *     ↓  restore shortcode markers → <aside class="shortcode">
 *     ↓  restore math markers → KaTeX renderToString
 *     ↓  highlight.js on <pre><code>
 *     ↓  custom sanitizer (DOMParser allowlist)
 *     ↓  innerHTML
 *
 * Security:
 *   - innerHTML is ONLY called after the sanitizer pass.
 *   - KaTeX is invoked with throwOnError:true + trust:false (no raw HTML).
 *   - Hugo shortcodes are NEVER parsed as HTML — replaced with safe <aside>
 *     placeholders that only contain text content.
 *   - On any uncaught error, returns { ok:false, error } and the caller
 *     must NOT touch the DOM.
 */

(function () {
    'use strict';

    /* ============================================
       Sentinel markers — must NOT appear in source content
       ============================================ */
    var SHORTCODE_TOKEN = 'shortcode';
    var MATH_TOKEN = 'math';

    function makeMarker(kind, id) {
        // HTML comment that marked.js will preserve verbatim in its HTML output.
        return '<!--ADMK:' + kind + ':' + id + '-->';
    }

    function markerRe(kind) {
        return new RegExp('<!--ADMK:' + kind + ':(\\d+)-->', 'g');
    }

    /* ============================================
       Pre-process: Hugo shortcodes
       Hugo shortcode formats:
         {{< name arg1 arg2 >}}
         {{< name arg1="value" >}}
         {{< name >}}content{{< /name >}}
         {{% name %}}content{{% /name %}}
       ============================================ */
    // Self-closing: {{< name args >}}  OR  {{% name args %}}
    var SHORTCODE_SELF = /\{\{[<%]\s*([a-zA-Z][\w-]*)([\s\S]*?)\s*[%>]\s*\}\}/g;
    // Paired: {{< name args >}}...{{< /name >}}  OR  {{% %}}...{{% /name %}}
    var SHORTCODE_PAIR = /\{\{[<%]\s*([a-zA-Z][\w-]*)([\s\S]*?)\s*[%>]\s*\}\}([\s\S]*?)\{\{[<%]\s*\/\s*\1\s*[%>]\s*\}\}/g;

    function preprocessShortcodes(text) {
        var placeholders = [];
        var result = text;

        // Paired first (must come before self-closing to avoid partial matches).
        result = result.replace(SHORTCODE_PAIR, function (match, name, args, body) {
            var id = placeholders.length;
            placeholders.push({ id: id, name: name, args: args.trim(), body: body, raw: match });
            return makeMarker(SHORTCODE_TOKEN, id);
        });

        // Self-closing.
        result = result.replace(SHORTCODE_SELF, function (match, name, args) {
            var id = placeholders.length;
            placeholders.push({ id: id, name: name, args: args.trim(), body: null, raw: match });
            return makeMarker(SHORTCODE_TOKEN, id);
        });

        return { text: result, placeholders: placeholders };
    }

    /* ============================================
       Pre-process: Math blocks
       ============================================ */
    // $$ ... $$  block math
    var MATH_BLOCK = /\$\$([\s\S]*?)\$\$/g;
    // $...$ inline math (avoid matching $$ boundaries)
    var MATH_INLINE = /(^|[^$])\$([^$\n]+)\$(?!\$)/g;

    function preprocessMath(text) {
        var placeholders = [];
        var result = text;

        // Block math first.
        result = result.replace(MATH_BLOCK, function (match, formula) {
            var id = placeholders.length;
            placeholders.push({ id: id, display: true, formula: formula });
            return makeMarker(MATH_TOKEN, id);
        });

        // Inline math.
        result = result.replace(MATH_INLINE, function (match, prefix, formula) {
            var id = placeholders.length;
            placeholders.push({ id: id, display: false, formula: formula });
            return prefix + makeMarker(MATH_TOKEN, id);
        });

        return { text: result, placeholders: placeholders };
    }

    /* ============================================
       Restore placeholders
       ============================================ */
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function buildShortcodeHTML(p) {
        // Safe placeholder card. No HTML from user — all attributes escaped.
        var head = '<aside class="adm-shortcode" data-name="' + escapeHTML(p.name) + '">';
        head += '<span class="adm-shortcode-tag">Hugo Shortcode</span>';
        head += '<code class="adm-shortcode-name">' + escapeHTML(p.name) + '</code>';
        if (p.args) {
            head += '<span class="adm-shortcode-args">' + escapeHTML(p.args) + '</span>';
        }
        if (p.body) {
            head += '<pre class="adm-shortcode-body">' + escapeHTML(p.body) + '</pre>';
        }
        head += '<span class="adm-shortcode-note">Hugo 构建时渲染</span>';
        head += '</aside>';
        return head;
    }

    function tryRenderMath(placeholder) {
        if (typeof window.katex === 'undefined') return null;
        try {
            var html = window.katex.renderToString(placeholder.formula, {
                displayMode: !!placeholder.display,
                throwOnError: true,
                trust: false,
                strict: 'function',
                output: 'html'
            });
            return '<span class="adm-math' + (placeholder.display ? ' adm-math-block' : '') + '">' + html + '</span>';
        } catch (e) {
            // KaTeX parse failed — fall back to raw source.
            var sep = placeholder.display ? '$$' : '$';
            return '<code class="adm-math-error">' + escapeHTML(sep + placeholder.formula + sep) + '</code>';
        }
    }

    function restoreMarkers(html, shortcodes, maths) {
        var out = html;

        // Shortcode markers.
        out = out.replace(markerRe(SHORTCODE_TOKEN), function (match, id) {
            var p = shortcodes[parseInt(id, 10)];
            return p ? buildShortcodeHTML(p) : '';
        });

        // Math markers.
        out = out.replace(markerRe(MATH_TOKEN), function (match, id) {
            var p = maths[parseInt(id, 10)];
            if (!p) return '';
            var rendered = tryRenderMath(p);
            return rendered != null ? rendered : ('<code class="adm-math-error">' + escapeHTML(p.formula) + '</code>');
        });

        return out;
    }

    /* ============================================
       Custom sanitizer — DOMParser allowlist
       ============================================ */
    var ALLOWED_TAGS = {
        // tag → void (no children) or not
        'h1': false, 'h2': false, 'h3': false, 'h4': false, 'h5': false, 'h6': false,
        'p': false, 'br': true, 'hr': true,
        'strong': false, 'em': false, 'del': false, 's': false, 'u': false, 'ins': false,
        'ul': false, 'ol': false, 'li': false,
        'blockquote': false,
        'pre': false, 'code': false,
        'a': false, 'img': true,
        'table': false, 'thead': false, 'tbody': false, 'tr': false, 'th': false, 'td': false,
        'div': false, 'span': false,
        // Custom shortcode placeholder.
        'aside': false
    };

    var ALLOWED_ATTRS = {
        'a': ['href', 'title', 'rel'],
        'img': ['src', 'alt', 'title', 'width', 'height'],
        'code': ['class'],
        'pre': ['class'],
        'span': ['class'],
        'div': ['class'],
        'aside': ['class', 'data-name'],
        'th': ['align'], 'td': ['align']
    };

    var SAFE_URL_RE = /^(?:https?:|mailto:|tel:|#|\/(?!\/))/i;
    // Stage 10: all data: URLs are rejected (V1 hardening).
    // This blocks inline base64 images, SVG data URLs, etc. in user-controlled
    // markdown. Image previews go through blob: object URLs instead.
    var ALLOW_DATA_URL = false;

    function isSafeURL(url) {
        if (!url) return false;
        var s = String(url).trim();
        if (!s) return false;
        // Strip whitespace/control chars inside the URL.
        s = s.replace(/[\s\u0000-\u001F]+/g, '');
        // Reject all data: URLs unconditionally.
        if (/^data:/i.test(s)) return false;
        if (s.indexOf(':') === -1) return true; // relative URL
        return SAFE_URL_RE.test(s);
    }

    function sanitizeNode(node, doc) {
        var children = Array.prototype.slice.call(node.childNodes);
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if (child.nodeType === 1 /* ELEMENT */) {
                var tag = child.tagName.toLowerCase();
                if (!Object.prototype.hasOwnProperty.call(ALLOWED_TAGS, tag)) {
                    // Replace with text content (defense: never keep dangerous subtree).
                    var text = doc.createTextNode(child.textContent || '');
                    child.parentNode.replaceChild(text, child);
                    continue;
                }
                // Strip all attributes that are not in allowlist.
                var allowed = ALLOWED_ATTRS[tag] || [];
                var attrs = Array.prototype.slice.call(child.attributes);
                for (var a = 0; a < attrs.length; a++) {
                    var attr = attrs[a];
                    var name = attr.name.toLowerCase();
                    // Defense: explicitly strip event handlers / javascript: attrs.
                    if (name.indexOf('on') === 0) { child.removeAttribute(attr.name); continue; }
                    if (allowed.indexOf(name) === -1) { child.removeAttribute(attr.name); continue; }
                    if ((name === 'href' || name === 'src') && !isSafeURL(attr.value)) {
                        child.removeAttribute(attr.name);
                        continue;
                    }
                    // Force rel for external links.
                    if (name === 'href' && /^https?:/i.test(attr.value)) {
                        child.setAttribute('rel', 'noopener noreferrer');
                    }
                }
                // For void elements, do not recurse (they have no children).
                if (!ALLOWED_TAGS[tag]) {
                    sanitizeNode(child, doc);
                }
            } else if (child.nodeType === 8 /* COMMENT */) {
                child.parentNode.removeChild(child);
            } else if (child.nodeType === 7 /* PROCESSING_INSTRUCTION */) {
                child.parentNode.removeChild(child);
            }
        }
    }

    function sanitizeHTML(html) {
        var doc = window.document.implementation.createHTMLDocument('');
        var container = doc.createElement('div');
        container.innerHTML = html;
        sanitizeNode(container, doc);
        return container.innerHTML;
    }

    /* ============================================
       Highlight.js for <pre><code>
       ============================================ */
    function highlightCodeBlocks(root) {
        if (typeof window.hljs === 'undefined') return;
        var blocks = root.querySelectorAll('pre code');
        for (var i = 0; i < blocks.length; i++) {
            try {
                window.hljs.highlightElement(blocks[i]);
            } catch (e) { /* ignore one block */ }
        }
    }

    /* ============================================
       Main entry: render(markdown) -> { ok, html?, error? }
       ============================================ */
    function render(markdown) {
        if (typeof window.marked === 'undefined') {
            return { ok: false, error: 'Markdown 渲染库未加载（marked.js）' };
        }

        var scResult = preprocessShortcodes(String(markdown || ''));
        var mathResult = preprocessMath(scResult.text);

        var markedOptions = {
            gfm: true,
            breaks: true,
            headerIds: false,
            mangle: false
        };

        var html;
        try {
            html = window.marked.parse(mathResult.text, markedOptions);
        } catch (e) {
            return { ok: false, error: 'Markdown 解析失败：' + (e && e.message || '未知错误') };
        }

        // Restore markers → safe HTML (shortcodes are placeholders; math via KaTeX).
        html = restoreMarkers(html, scResult.placeholders, mathResult.placeholders);

        // Sanitize.
        var safe;
        try {
            safe = sanitizeHTML(html);
        } catch (e) {
            return { ok: false, error: 'HTML 清洗失败：' + (e && e.message || '未知错误') };
        }

        // Highlight code blocks (operates on the sanitized HTML string).
        var container = document.createElement('div');
        container.innerHTML = safe;
        try {
            highlightCodeBlocks(container);
        } catch (e) { /* swallow highlight errors */ }
        safe = container.innerHTML;

        return { ok: true, html: safe };
    }

    function isReady() {
        return typeof window.marked !== 'undefined';
    }

    /* ============================================
       Public API
       ============================================ */
    window.MarkdownPreview = {
        render: render,
        isReady: isReady,
        // Exposed for tests / advanced callers.
        _preprocessShortcodes: preprocessShortcodes,
        _preprocessMath: preprocessMath,
        _restoreMarkers: restoreMarkers,
        _sanitizeHTML: sanitizeHTML,
        _escapeHTML: escapeHTML
    };
})();