/**
 * Front Matter parser + minimal-patch serializer — V1
 *
 * Goals:
 *   - parseFrontMatter: extract front matter + body, preserve CRLF/LF + BOM
 *   - patchFrontMatter:  field-level minimal change (preserve unknown fields,
 *                       original ordering, indentation, quoting, comments)
 *   - extractFields:     for UI display (returns plain object)
 *
 * Non-goals:
 *   - Full YAML round-trip. We DO NOT use yaml.dump() to rewrite.
 *   - Validation beyond what we use.
 */

(function () {
    'use strict';

    /* ============================================
       Helpers
       ============================================ */
    function detectNewline(text) {
        if (!text) return '\n';
        return text.indexOf('\r\n') >= 0 ? '\r\n' : '\n';
    }

    function escapeYamlString(s) {
        // YAML double-quoted string escapes: \ and " must be escaped.
        return String(s)
            .replace(/\\/g, '\\\\')
            .replace(/"/g, '\\"');
    }

    function formatScalarValue(v) {
        if (v === true) return 'true';
        if (v === false) return 'false';
        if (v === null || v === undefined) return '';
        var s = String(v);
        if (s === '') return '""';
        // Always quote string scalars for safety — preserves original style better
        // (project's existing FM uses double quotes for strings) and avoids any
        // edge-case YAML parsing ambiguity with non-ASCII or punctuation.
        if (/^-?\d+(\.\d+)?$/.test(s)) return s; // numbers stay bare
        return '"' + escapeYamlString(s) + '"';
    }

    /* ============================================
       parseFrontMatter(raw)
       Splits raw file into front matter + body.
       Returns { hasFrontMatter, delimiter, frontMatterRaw, body, newline }
       ============================================ */
    function parseFrontMatter(raw) {
        var placeholder = {
            hasFrontMatter: false,
            delimiter: '---',
            frontMatterRaw: '',
            body: '',
            newline: '\n'
        };
        if (!raw) return placeholder;

        // Strip UTF-8 BOM at start.
        var content = raw;
        if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

        var newline = detectNewline(content);

        // First line MUST be exactly '---' (no whitespace, no BOM).
        if (!content.startsWith('---')) {
            placeholder.body = content;
            placeholder.newline = newline;
            return placeholder;
        }

        // After the first '---' we need either a newline or end-of-file.
        // If first line is '---' but content continues, next must be newline.
        var afterFirst = content.substring(3);
        if (afterFirst.length > 0) {
            var c0 = afterFirst.charAt(0);
            if (c0 !== '\n' && c0 !== '\r') {
                // Not a valid FM delimiter (e.g., '---foo...')
                placeholder.body = content;
                placeholder.newline = newline;
                return placeholder;
            }
        }

        // Find the closing '---' on its own line.
        // Split into lines (preserving CRLF information).
        var lines = content.split(/\r?\n/);
        // lines[0] should be '---'
        var closingIdx = -1;
        for (var i = 1; i < lines.length; i++) {
            if (lines[i] === '---') {
                closingIdx = i;
                break;
            }
            // Otherwise keep looking — fields and arrays live inside FM until
            // the closing delimiter is found. If we reach EOF without finding it,
            // we fall through to the "no closing" branch below.
        }

        if (closingIdx === -1) {
            placeholder.body = content;
            placeholder.newline = newline;
            return placeholder;
        }

        var fmLines = lines.slice(1, closingIdx);
        var bodyLines = lines.slice(closingIdx + 1);

        return {
            hasFrontMatter: true,
            delimiter: '---',
            frontMatterRaw: fmLines.join(newline),
            body: bodyLines.join(newline),
            newline: newline
        };
    }

    /* ============================================
       patchFrontMatter(originalRaw, changes)
       Field-level minimal change.
       changes = { title: '...', tags: ['a', 'b'], draft: '__DELETE__' }
       Returns the patched raw front matter (NO surrounding --- delimiters).
       Unknown fields are preserved verbatim.
       ============================================ */
    function patchFrontMatter(originalRaw, changes) {
        // Note: we intentionally do NOT short-circuit on !originalRaw.
        // An article without FM (originalRaw === '') can still receive new fields
        // via the "append" branch below. Only an empty changes object is a no-op.
        if (!changes) return originalRaw || '';
        var newline = detectNewline(originalRaw);
        var lines = originalRaw.split(/\r?\n/);
        var out = [];
        var processed = {};
        var i = 0;

        while (i < lines.length) {
            var line = lines[i];
            var m = /^([a-zA-Z][\w-]*)\s*:\s*(.*)$/.exec(line);
            if (!m) {
                out.push(line);
                i++;
                continue;
            }
            var key = m[1];
            var rest = m[2];

            if (!Object.prototype.hasOwnProperty.call(changes, key) || processed[key]) {
                out.push(line);
                i++;
                continue;
            }

            var newValue = changes[key];
            processed[key] = true;

            // DELETE sentinel: drop the field entirely (including array items / continuation lines).
            if (newValue === '__DELETE__') {
                i++;
                while (i < lines.length) {
                    if (/^\s/.test(lines[i])) {
                        i++;
                    } else {
                        break;
                    }
                }
                continue;
            }

            // Array field.
            if (Object.prototype.toString.call(newValue) === '[object Array]') {
                var nextLine = lines[i + 1] || '';
                var indentMatch = /^(\s*)-/.exec(nextLine);
                if (indentMatch) {
                    // Block array. Replace 'field:' + items.
                    out.push(key + ':');
                    if (newValue.length === 0) {
                        // Empty array — keep as empty inline to preserve readability.
                        // Replace with `[]` on same line if all lines are simple.
                        out[out.length - 1] = key + ': []';
                    } else {
                        var indent = indentMatch[1];
                        for (var j = 0; j < newValue.length; j++) {
                            out.push(indent + '- "' + escapeYamlString(newValue[j]) + '"');
                        }
                    }
                    // Skip existing items.
                    i++;
                    while (i < lines.length && /^\s*-/.test(lines[i])) i++;
                } else {
                    // Inline array or no existing items.
                    if (newValue.length === 0) {
                        out.push(key + ': []');
                    } else {
                        var inline = newValue.map(function (s) {
                            return '"' + escapeYamlString(s) + '"';
                        }).join(', ');
                        out.push(key + ': [' + inline + ']');
                    }
                    i++;
                }
                continue;
            }

            // Scalar field.
            out.push(key + ': ' + formatScalarValue(newValue));
            i++;
        }

        // Determine if any new key needs to be appended (wasn't already in original).
        var needsAppend = Object.keys(changes).some(function (key) {
            return !processed[key] && changes[key] !== '__DELETE__';
        });

        // Trim trailing empty lines only when we are about to append new keys.
        if (needsAppend) {
            while (out.length > 0 && out[out.length - 1] === '') {
                out.pop();
            }
        }

        // Append new keys that weren't in the original (preserve original order in changes).
        if (needsAppend) {
            Object.keys(changes).forEach(function (key) {
                if (processed[key]) return;
                var newValue = changes[key];
                if (newValue === '__DELETE__') return;
                if (Object.prototype.toString.call(newValue) === '[object Array]') {
                    if (newValue.length === 0) {
                        out.push(key + ': []');
                    } else {
                        out.push(key + ':');
                        for (var k = 0; k < newValue.length; k++) {
                            out.push('  - "' + escapeYamlString(newValue[k]) + '"');
                        }
                    }
                } else {
                    out.push(key + ': ' + formatScalarValue(newValue));
                }
            });
        }

        return out.join(newline);
    }

    /* ============================================
       extractFields(fmRaw)
       Returns a plain object with the 6 supported fields.
       Used for UI display only. Unknown fields are ignored.
       ============================================ */
    function extractFields(fmRaw) {
        var fields = {};
        if (!fmRaw) return fields;
        var lines = fmRaw.split(/\r?\n/);
        var arrayKey = null;
        var arrayVal = [];

        function commitArray() {
            if (arrayKey) {
                fields[arrayKey] = arrayVal.slice();
                arrayKey = null;
                arrayVal = [];
            }
        }

        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];
            if (arrayKey) {
                var am = /^\s*-\s*(.*)$/.exec(line);
                if (am) {
                    var item = am[1].replace(/^['"]|['"]$/g, '').trim();
                    arrayVal.push(item);
                    continue;
                }
                commitArray();
            }
            var m = /^([a-zA-Z][\w-]*)\s*:\s*(.*)$/.exec(line);
            if (!m) continue;
            var key = m[1];
            var rest = m[2];
            if (rest.trim() === '') {
                arrayKey = key;
                arrayVal = [];
                continue;
            }
            if (/^\[.*\]$/.test(rest.trim())) {
                var inner = rest.trim().slice(1, -1);
                if (inner.trim() === '') {
                    fields[key] = [];
                } else {
                    fields[key] = inner.split(',').map(function (s) {
                        return s.trim().replace(/^['"]|['"]$/g, '');
                    }).filter(function (s) { return s.length > 0; });
                }
            } else {
                var val = rest.replace(/^['"]|['"]$/g, '').trim();
                if (val === 'true') fields[key] = true;
                else if (val === 'false') fields[key] = false;
                else fields[key] = val;
            }
        }
        commitArray();
        return fields;
    }

    /* ============================================
       Public API
       ============================================ */
    window.FrontMatter = {
        parse: parseFrontMatter,
        patch: patchFrontMatter,
        extractFields: extractFields,
        detectNewline: detectNewline,
        escapeYamlString: escapeYamlString,
        formatScalarValue: formatScalarValue
    };
})();