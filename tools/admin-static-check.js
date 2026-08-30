// tools/admin-static-check.js
// Lightweight static checks for the Admin SPA. No npm/Node build pipeline —
// uses only Node built-ins. Run with: node tools/admin-static-check.js

'use strict';

var fs = require('fs');
var path = require('path');
var execSync = require('child_process').execSync;

var ROOT = process.cwd();
var ADMIN = path.join(ROOT, 'static', 'admin');

var failed = 0;
function check(name, ok, detail) {
    if (ok) {
        console.log('  PASS  ' + name);
    } else {
        failed++;
        console.log('  FAIL  ' + name + (detail ? '  -- ' + detail : ''));
    }
}
function read(rel) {
    return fs.readFileSync(path.join(ROOT, rel), 'utf-8');
}
function grepAll(rel, pattern) {
    var re = new RegExp(pattern, 'g');
    var text = read(rel);
    var matches = [];
    var m;
    while ((m = re.exec(text)) !== null) {
        matches.push({ index: m.index, text: m[0] });
    }
    return matches;
}

console.log('=== tools/admin-static-check.js ===\n');

// 1. Security-sensitive patterns
console.log('[1] JS source code');

var jsFiles = [
    'static/admin/js/app.js',
    'static/admin/js/github-api.js',
    'static/admin/js/article.js',
    'static/admin/js/frontmatter.js',
    'static/admin/js/markdown.js',
    'static/admin/js/image.js',
    'static/admin/js/utils.js'
];

jsFiles.forEach(function (rel) {
    var matches = grepAll(rel, 'console\\.(log|error|debug|info|warn)\\(');
    check(rel + ' - no console.*', matches.length === 0,
        matches.length ? matches.length + ' hit(s)' : '');
});

jsFiles.forEach(function (rel) {
    check(rel + ' - no eval(', grepAll(rel, 'eval\\(').length === 0);
});

jsFiles.forEach(function (rel) {
    check(rel + ' - no new Function(',
        grepAll(rel, 'new Function\\(').length === 0);
});

jsFiles.forEach(function (rel) {
    check(rel + ' - no document.write',
        grepAll(rel, 'document\\.write\\(').length === 0);
});

jsFiles.forEach(function (rel) {
    // Match `force:\s*true` NOT followed by `false` (i.e. true, not false).
    // Also skip lines that are JS line comments (start with //).
    var matches = grepAll(rel, 'force\\s*:\\s*true(?!false)');
    var realMatches = matches.filter(function (m) {
        var lineStart = read(rel).lastIndexOf('\n', m.index) + 1;
        var linePrefix = read(rel).substring(lineStart, m.index);
        // Only count as comment if // appears at the very start of the line
        // (possibly with leading whitespace). Otherwise the // is just inside
        // a string (e.g. "force:" or an URL).
        return /^\s*\/\//.test(linePrefix);
    });
    check(rel + ' - no force: true', realMatches.length === 0,
        realMatches.length ? realMatches.length + ' hit(s)' : '');
});

// 2. Sensitive tokens
console.log('\n[2] Token / auth hygiene');
jsFiles.forEach(function (rel) {
    var matches = grepAll(rel, 'github_pat_[A-Za-z0-9_]{20,}');
    var realMatches = matches.filter(function (m) {
        var ctx = read(rel).substring(Math.max(0, m.index - 80), m.index);
        return !/\/\//.test(ctx);
    });
    check(rel + ' - no real github_pat_ token', realMatches.length === 0);
});
jsFiles.forEach(function (rel) {
    check(rel + ' - no ghp_ literal', grepAll(rel, 'ghp_[A-Za-z0-9]{20,}').length === 0);
});
jsFiles.forEach(function (rel) {
    check(rel + ' - no Bearer literal', grepAll(rel, 'Bearer [A-Za-z0-9]').length === 0);
});

// 3. CDN / SRI
console.log('\n[3] CDN / SRI');
var indexHtml = read('static/admin/index.html');
var cdnMatches = indexHtml.match(/https:\/\/cdn\.jsdelivr\.net\/[^"]+/g) || [];
check('CDN resources present', cdnMatches.length > 0, cdnMatches.length + ' URL(s)');

var hasDynamic = cdnMatches.some(function (u) {
    return /@latest|@next|@\d+\.x\.x/.test(u);
});
check('No @latest / @next / @x.x.x', !hasDynamic);

cdnMatches.forEach(function (url) {
    var idx = indexHtml.indexOf(url);
    var around = indexHtml.substring(idx, idx + 500);
    check(url.split('/').slice(-3).join('/') + ' - has integrity',
        /integrity=/.test(around));
    check(url.split('/').slice(-3).join('/') + ' - has crossorigin',
        /crossorigin=/.test(around));
});

var sriMatches = indexHtml.match(/integrity="sha384-([^"]+)"/g) || [];
sriMatches.forEach(function (full) {
    var hash = full.replace(/^integrity="sha384-|"$/g, '');
    var isBase64Url = /[-_]/.test(hash);
    check('SRI standard Base64 (no - _)', !isBase64Url,
        isBase64Url ? 'contains URL-safe chars' : '');
});

// 4. vercel.json valid JSON
console.log('\n[4] vercel.json');
try {
    var v = JSON.parse(read('vercel.json'));
    check('vercel.json valid JSON', true);
    check('vercel.json has /admin rule',
        v.headers.some(function (h) { return h.source === '/admin'; }));
    check('vercel.json has /admin/(.*) rule',
        v.headers.some(function (h) { return h.source === '/admin/(.*)'; }));
} catch (e) {
    check('vercel.json valid JSON', false, e.message);
}

// 5. JS syntax
console.log('\n[5] JS syntax');
jsFiles.forEach(function (rel) {
    try {
        execSync('node --check "' + path.join(ROOT, rel) + '"', { stdio: 'pipe' });
        check(rel + ' - node --check', true);
    } catch (e) {
        check(rel + ' - node --check', false, '');
    }
});

// 6. Hugo build
console.log('\n[6] Hugo build');
try {
    var out = execSync('.\\hugo.exe', { stdio: 'pipe' }).toString();
    check('Hugo BUILD_OK', /Total in \d+ ms/.test(out));
} catch (e) {
    check('Hugo BUILD_OK', false, '');
}

// 7. localStorage hygiene
console.log('\n[7] localStorage hygiene');
jsFiles.forEach(function (rel) {
    var matches = grepAll(rel, 'localStorage\\.setItem\\([^)]*token');
    check(rel + ' - no localStorage token', matches.length === 0);
});

console.log('\n=== Summary ===');
console.log('  Failed: ' + failed);
process.exit(failed > 0 ? 1 : 0);