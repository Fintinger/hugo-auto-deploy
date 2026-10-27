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

// 3. Third-party assets (self-hosted since b630744 — jsDelivr unreachable in CN)
console.log('\n[3] Third-party assets / SRI');
var indexHtml = read('static/admin/index.html');

var remoteScripts = indexHtml.match(/<script[^>]+src="https?:\/\/[^"]+"/g) || [];
check('No remote <script> in admin', remoteScripts.length === 0,
    remoteScripts.length ? remoteScripts.length + ' hit(s)' : '');
var remoteStyles = indexHtml.match(/<link[^>]+href="https?:\/\/[^"]+"/g) || [];
check('No remote <link> in admin', remoteStyles.length === 0,
    remoteStyles.length ? remoteStyles.length + ' hit(s)' : '');

var localLibs = [
    '/libs/marked/marked.min.js',
    '/libs/highlight/highlight.min.js',
    '/libs/katex/katex.min.js',
    '/libs/katex/katex.min.css'
];
localLibs.forEach(function (u) {
    check('admin references ' + u, indexHtml.indexOf(u) >= 0);
    check('file exists static' + u,
        fs.existsSync(path.join(ROOT, 'static' + u)));
});

// Any remaining integrity attribute must still be standard Base64 SHA-384.
var sriMatches = indexHtml.match(/integrity="sha384-([^"]+)"/g) || [];
sriMatches.forEach(function (full) {
    var hash = full.replace(/^integrity="sha384-|"$/g, '');
    var isBase64Url = /[-_]/.test(hash);
    check('SRI standard Base64 (no - _)', !isBase64Url,
        isBase64Url ? 'contains URL-safe chars' : '');
});

// 4. /admin HTTP security headers (nginx snippet; vercel.json retired 2026-10-27,
//    site now served by Aliyun ECS + nginx — see docs/DEPLOYMENT.md)
console.log('\n[4] /admin HTTP security headers (nginx snippet)');
var SNIPPET = 'deploy/nginx/blog-admin-headers.conf';
var requiredHeaders = [
    'Content-Security-Policy',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'X-Robots-Tag',
    'Strict-Transport-Security'
];
var snippet = '';
try {
    snippet = read(SNIPPET);
    check(SNIPPET + ' exists', true);
    requiredHeaders.forEach(function (h) {
        check(SNIPPET + ' has ' + h, snippet.indexOf('add_header ' + h) >= 0);
    });
    check('snippet CSP sets frame-ancestors none',
        snippet.indexOf("frame-ancestors 'none'") >= 0);
} catch (e) {
    check(SNIPPET + ' exists', false, e.message);
}

check('index.html meta CSP fallback present',
    indexHtml.indexOf('http-equiv="Content-Security-Policy"') >= 0);

// Header CSP and meta CSP must stay aligned (meta is fallback only). The header
// may add frame-ancestors, which <meta> cannot express.
function normalizeCsp(s) {
    return s.replace(/;\s*$/, '').split(';')
        .map(function (d) { return d.trim(); })
        .filter(function (d) { return d && d.indexOf('frame-ancestors') !== 0; })
        .sort().join('; ');
}
var headerCsp = (snippet.match(/Content-Security-Policy "([^"]+)"/) || [])[1] || '';
var metaCsp = (indexHtml.match(/http-equiv="Content-Security-Policy" content="([^"]+)"/) || [])[1] || '';
check('header CSP matches meta CSP (frame-ancestors excluded)',
    headerCsp !== '' && metaCsp !== '' && normalizeCsp(headerCsp) === normalizeCsp(metaCsp),
    headerCsp === '' || metaCsp === '' ? 'CSP not found' : 'header/meta CSP drifted');

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