/**
 * GitHub REST API Wrapper — V1
 *
 * Responsibilities:
 *   - Encapsulate all fetch() calls to https://api.github.com
 *   - Inject required headers (Accept / X-GitHub-Api-Version / Authorization)
 *   - Decode UTF-8 base64 file contents correctly (Chinese safe)
 *   - Build safe path URLs (encode segments but preserve '/')
 *   - Map GitHub error responses to AdminError with codes
 *   - Read rate-limit headers and surface a typed error
 *   - Limited retry for transient network / 5xx errors
 *
 * Out of scope (later stages):
 *   - Bulk Git Data API (trees/commits)
 *   - OAuth / GitHub App
 *   - Vercel API
 */

(function () {
    'use strict';

    /* ============================================
       Repository target — V1 fixed
       ============================================ */
    var REPOSITORY = Object.freeze({
        owner: 'Fintinger',
        repo: 'hugo-auto-deploy',
        branch: 'main'
    });

    var API_BASE = 'https://api.github.com';
    var API_VERSION = '2026-03-10';

    var MAX_RETRIES = 3;
    var RETRY_BASE_MS = 600; // 600, 1200, 2400
    var DEFAULT_TIMEOUT_MS = 30000; // 30 seconds per request (prevents indefinite hangs)

    /* ============================================
       AdminError
       ============================================ */
    function AdminError(code, message, details) {
        this.name = 'AdminError';
        this.code = code;
        this.message = message || code;
        this.details = details || null;
    }
    AdminError.prototype = Object.create(Error.prototype);
    AdminError.prototype.constructor = AdminError;

    /* ============================================
       Rate limit cache
       ============================================ */
    var rateLimit = {
        limit: null,
        remaining: null,
        reset: null, // epoch seconds
        lastChecked: 0
    };

    function updateRateLimitFromHeaders(headers) {
        if (!headers) return;
        var l = headers.get('X-RateLimit-Limit');
        var r = headers.get('X-RateLimit-Remaining');
        var e = headers.get('X-RateLimit-Reset');
        if (l !== null) rateLimit.limit = parseInt(l, 10);
        if (r !== null) rateLimit.remaining = parseInt(r, 10);
        if (e !== null) rateLimit.reset = parseInt(e, 10);
        rateLimit.lastChecked = Date.now();
    }

    function getRateLimitSnapshot() {
        return {
            limit: rateLimit.limit,
            remaining: rateLimit.remaining,
            reset: rateLimit.reset,
            secondsUntilReset: rateLimit.reset
                ? Math.max(0, rateLimit.reset - Math.floor(Date.now() / 1000))
                : null
        };
    }

    /* ============================================
       Path builder — encode segments but keep '/'
       ============================================ */
    function buildContentsPath(repoPath) {
        if (!repoPath) return '';
        return String(repoPath)
            .replace(/^\/+/, '')
            .split('/')
            .filter(function (s) { return s.length > 0; })
            .map(function (seg) { return encodeURIComponent(seg); })
            .join('/');
    }

    /* ============================================
       UTF-8 base64 helpers (Chinese safe)
       ============================================ */
    function encodeUTF8ToBase64(str) {
        // Always encode via UTF-8 bytes, not atob() over the raw string.
        var bytes = new TextEncoder().encode(str);
        var bin = '';
        var chunk = 0x8000;
        for (var i = 0; i < bytes.length; i += chunk) {
            bin += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
        }
        return btoa(bin);
    }

    function decodeBase64ToUTF8(b64) {
        if (typeof b64 !== 'string') return '';
        // Strip whitespace + GitHub may include newlines.
        var clean = b64.replace(/\s+/g, '');
        var bin = atob(clean);
        var bytes = new Uint8Array(bin.length);
        for (var i = 0; i < bin.length; i++) {
            bytes[i] = bin.charCodeAt(i);
        }
        return new TextDecoder('utf-8').decode(bytes);
    }

    /* ============================================
       Response → AdminError mapping
       ============================================ */
    function mapStatusToCode(status, body) {
        if (status === 401) return 'AUTH_INVALID';
        if (status === 404) return 'NOT_FOUND';
        if (status === 409) return 'CONFLICT';
        if (status === 422) return 'VALIDATION';
        if (status === 429) return 'RATE_LIMIT';

        if (status === 403) {
            // Distinguish secondary rate limit / abuse detection.
            var msg = (body && body.message) || '';
            if (/abuse/i.test(msg) || /secondary rate/i.test(msg)) return 'RATE_LIMIT';
            return 'AUTH_FORBIDDEN';
        }

        if (status >= 500 && status < 600) return 'SERVER_ERROR';

        return 'UNKNOWN';
    }

    /* ============================================
       Core _request()
       ============================================ */
    function _request(token, method, urlPath, body, opts) {
        opts = opts || {};
        var attempt = 0;
        var lastError = null;

        function attemptOnce() {
            var url = urlPath.indexOf('http') === 0 ? urlPath : (API_BASE + urlPath);
            var headers = {
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': API_VERSION
            };
            if (token) headers['Authorization'] = 'Bearer ' + token;

            var fetchOpts = {
                method: method,
                headers: headers,
                cache: 'no-store'
            };

            if (body !== undefined && body !== null && method !== 'GET' && method !== 'HEAD') {
                fetchOpts.body = JSON.stringify(body);
                headers['Content-Type'] = 'application/json';
            }

            // Set up timeout via AbortController (falls back to no timeout if unavailable).
            var controller = (typeof AbortController !== 'undefined') ? new AbortController() : null;
            var timer = null;
            if (controller && DEFAULT_TIMEOUT_MS > 0) {
                fetchOpts.signal = controller.signal;
                timer = setTimeout(function () {
                    try { controller.abort(); } catch (e) { /* ignore */ }
                }, DEFAULT_TIMEOUT_MS);
            }

            return fetch(url, fetchOpts).then(function (response) {
                if (timer) clearTimeout(timer);
                updateRateLimitFromHeaders(response.headers);
                return response.text().then(function (text) {
                    var data = null;
                    try { data = text ? JSON.parse(text) : null; }
                    catch (e) { /* keep data null; GitHub returned non-JSON */ }

                    if (response.ok) {
                        return {
                            ok: true,
                            status: response.status,
                            data: data,
                            headers: response.headers,
                            rateLimit: getRateLimitSnapshot()
                        };
                    }

                    var code = mapStatusToCode(response.status, data);

                    // Extract retry hints.
                    var retryAfter = response.headers.get('Retry-After');
                    var extra = {
                        status: response.status,
                        body: data,
                        retryAfterSeconds: retryAfter ? parseInt(retryAfter, 10) : null
                    };

                    return {
                        ok: false,
                        status: response.status,
                        code: code,
                        error: new AdminError(code, (data && data.message) || response.statusText, extra),
                        headers: response.headers,
                        rateLimit: getRateLimitSnapshot()
                    };
                });
            }, function (networkErr) {
                if (timer) clearTimeout(timer);
                var msg = (networkErr && networkErr.message) || '网络异常';
                var isTimeout = !!(networkErr && networkErr.name === 'AbortError');
                var code = isTimeout ? 'TIMEOUT' : 'NETWORK_ERROR';
                var userMsg = isTimeout
                    ? '请求超时（' + (DEFAULT_TIMEOUT_MS / 1000) + '秒）。请检查网络后重试。'
                    : msg;
                return {
                    ok: false,
                    status: 0,
                    code: code,
                    error: new AdminError(code, userMsg, { original: String(networkErr) })
                };
            });
        }

        function shouldRetry(result) {
            if (!result || result.ok) return false;
            // Only retry network errors and 5xx
            if (result.code === 'NETWORK_ERROR') return true;
            if (result.code === 'SERVER_ERROR') return true;
            return false;
        }

        function runWithRetry() {
            attempt++;
            return attemptOnce().then(function (result) {
                if (result.ok) return result;
                if (attempt < MAX_RETRIES && shouldRetry(result)) {
                    var delay = RETRY_BASE_MS * Math.pow(2, attempt - 1);
                    return new Promise(function (resolve) {
                        setTimeout(function () { resolve(runWithRetry()); }, delay);
                    });
                }
                return result;
            });
        }

        return runWithRetry();
    }

    /* ============================================
       High-level API methods
       ============================================ */

    function getAuthenticatedUser(token) {
        return _request(token, 'GET', '/user').then(function (r) {
            if (!r.ok) throw r.error;
            return {
                login: r.data.login,
                id: r.data.id,
                avatarUrl: r.data.avatar_url,
                htmlUrl: r.data.html_url,
                type: r.data.type,
                rateLimit: r.rateLimit
            };
        });
    }

    function getRepository(token) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo);
        return _request(token, 'GET', path).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                fullName: r.data.full_name,
                defaultBranch: r.data.default_branch,
                private: r.data.private,
                htmlUrl: r.data.html_url,
                size: r.data.size,
                permissions: r.data.permissions || null,
                rateLimit: r.rateLimit
            };
        });
    }

    function getBranch(token) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/branches/' + encodeURIComponent(REPOSITORY.branch);
        return _request(token, 'GET', path).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                name: r.data.name,
                commitSha: r.data.commit && r.data.commit.sha,
                protected: !!(r.data.protected),
                rateLimit: r.rateLimit
            };
        });
    }

    /**
     * Git Tree API — preferred for repo-wide discovery (1 request).
     * Returns { sha, truncated, tree, rateLimit }.
     * If truncated === true, the caller MUST NOT pretend it has a full view;
     * fallback strategies are the caller's responsibility (see Stage 4 fallback).
     */
    function getTree(token, recursive) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/git/trees/' + encodeURIComponent(REPOSITORY.branch) +
                   '?recursive=' + (recursive ? '1' : '0');
        return _request(token, 'GET', path).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                sha: r.data.sha,
                truncated: !!r.data.truncated,
                tree: r.data.tree || [],
                rateLimit: r.rateLimit
            };
        });
    }

    function listContents(token, repoPath) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/contents/' + buildContentsPath(repoPath) +
                   '?ref=' + encodeURIComponent(REPOSITORY.branch);
        return _request(token, 'GET', path).then(function (r) {
            if (!r.ok) throw r.error;
            if (!Array.isArray(r.data)) {
                // Single file path; not a directory listing.
                throw new AdminError('VALIDATION', '路径不是目录');
            }
            return {
                items: r.data.map(function (it) {
                    return {
                        name: it.name,
                        path: it.path,
                        type: it.type, // 'file' | 'dir'
                        size: it.size,
                        sha: it.sha,
                        htmlUrl: it.html_url
                    };
                }),
                rateLimit: r.rateLimit
            };
        });
    }

    function getFile(token, repoPath) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/contents/' + buildContentsPath(repoPath) +
                   '?ref=' + encodeURIComponent(REPOSITORY.branch);
        return _request(token, 'GET', path).then(function (r) {
            if (!r.ok) throw r.error;
            if (Array.isArray(r.data)) {
                throw new AdminError('VALIDATION', '路径是目录不是文件');
            }
            return {
                path: r.data.path,
                sha: r.data.sha,
                size: r.data.size,
                type: r.data.type,
                encoding: r.data.encoding,
                content: decodeBase64ToUTF8(r.data.content || ''),
                htmlUrl: r.data.html_url,
                rateLimit: r.rateLimit
            };
        });
    }

    function _putContents(token, repoPath, body) {
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/contents/' + buildContentsPath(repoPath);
        return _request(token, 'PUT', path, body);
    }

    function createFile(token, repoPath, content, message) {
        var payload = {
            message: message || 'post: create ' + repoPath,
            content: encodeUTF8ToBase64(content),
            branch: REPOSITORY.branch
        };
        return _putContents(token, repoPath, payload).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                path: r.data.content && r.data.content.path,
                sha: r.data.content && r.data.content.sha,
                commitSha: r.data.commit && r.data.commit.sha,
                htmlUrl: r.data.content && r.data.content.html_url,
                rateLimit: r.rateLimit
            };
        });
    }

    function updateFile(token, repoPath, content, sha, message) {
        if (!sha) {
            return Promise.reject(new AdminError('VALIDATION', 'updateFile 必须提供 sha'));
        }
        var payload = {
            message: message || 'post: update ' + repoPath,
            content: encodeUTF8ToBase64(content),
            sha: sha,
            branch: REPOSITORY.branch
        };
        return _putContents(token, repoPath, payload).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                path: r.data.content && r.data.content.path,
                sha: r.data.content && r.data.content.sha,
                commitSha: r.data.commit && r.data.commit.sha,
                htmlUrl: r.data.content && r.data.content.html_url,
                rateLimit: r.rateLimit
            };
        });
    }

    function deleteFile(token, repoPath, sha, message) {
        if (!sha) {
            return Promise.reject(new AdminError('VALIDATION', 'deleteFile 必须提供 sha'));
        }
        var path = '/repos/' + encodeURIComponent(REPOSITORY.owner) + '/' + encodeURIComponent(REPOSITORY.repo) +
                   '/contents/' + buildContentsPath(repoPath);
        var payload = {
            message: message || 'chore: delete ' + repoPath,
            sha: sha,
            branch: REPOSITORY.branch
        };
        return _request(token, 'DELETE', path, payload).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                commitSha: r.data.commit && r.data.commit.sha,
                rateLimit: r.rateLimit
            };
        });
    }

    /**
     * Stage 8 — Article delete using Git Data API.
     *
     * One logical delete (article + bundle assets) produces ONE commit on main.
     *
     * Flow (all steps are sequential, no Promise.all for write ops):
     *   1. GET branch  → get current commit SHA + tree SHA
     *   2. GET tree (recursive) → get all entries
     *   3. POST trees → create new tree with target entries removed (sha:null)
     *   4. POST commits → create new commit pointing to new tree, parent = current commit
     *   5. PATCH refs/heads/main { sha, force:false } → update reference
     *
     * Concurrency safety:
     *   - force:false (default) means GitHub rejects the update if it's not a
     *     fast-forward. If another commit lands between step 1 and step 5, our
     *     ref update fails with 422 Unprocessable Entity. We surface this as
     *     CONFLICT and the caller MUST retry with fresh state.
     *   - We NEVER use force:true.
     *
     * opts = {
     *   paths:   [string]   — repo-relative paths to delete (must exist in tree)
     *   message: string     — commit message
     * }
     * Returns { commitSha, treeSha, rateLimit }.
     */
    function deleteArticle(token, opts) {
        if (!opts || !Array.isArray(opts.paths) || opts.paths.length === 0) {
            return Promise.reject(new AdminError('VALIDATION', 'paths 必须是非空数组'));
        }
        if (!opts.message) {
            return Promise.reject(new AdminError('VALIDATION', 'message 必填'));
        }

        // Step 1: GET branch (commit SHA + tree SHA)
        return getBranch(token).then(function (branchRes) {
            var parentCommitSha = branchRes.commitSha;
            if (!parentCommitSha) {
                throw new AdminError('UNKNOWN', '无法获取 main 分支 HEAD commit SHA');
            }
            // Step 2: GET tree (recursive) for current commit.
            // The branch endpoint doesn't return tree SHA directly, so we need
            // the commit endpoint. (We use getTree with explicit commit ref to
            // avoid race when main moves between the two calls.)
            return getCommit(token, parentCommitSha).then(function (commitInfo) {
                var parentTreeSha = commitInfo.treeSha;
                if (!parentTreeSha) {
                    throw new AdminError('UNKNOWN', '无法获取 commit ' + parentCommitSha + ' 的 tree SHA');
                }
                // Step 2b: GET tree (recursive) at that commit.
                return getTreeAt(token, parentTreeSha, true).then(function (treeRes) {
                    if (treeRes.truncated) {
                        throw new AdminError('VALIDATION',
                            'Tree API 返回截断数据（仓库过大），无法安全删除。');
                    }
                    var existing = {};
                    for (var i = 0; i < treeRes.tree.length; i++) {
                        existing[treeRes.tree[i].path] = treeRes.tree[i];
                    }
                    // Step 2c: Verify every target path exists in the tree.
                    for (var j = 0; j < opts.paths.length; j++) {
                        if (!existing[opts.paths[j]]) {
                            throw new AdminError('NOT_FOUND',
                                '文件不存在: ' + opts.paths[j]);
                        }
                    }
                    // Step 3: Build a sparse tree update — only the deletion entries.
// We send only the paths we want to remove (each with sha:null). GitHub
// applies these against base_tree and inherits every other path from it.
// Sending N deletion entries instead of (N - len(paths)) full entries
// keeps the request body tiny and avoids 504 timeouts on large repos.
//
// GitHub requires every entry — even a deletion with sha:null — to carry
// `path`, `mode`, and `type`. We source mode/type from the original tree
// entry (looked up via the `existing` dict built above) so:
//   - a regular .md file comes back with mode='100644' type='blob'
//   - an assets subtree comes back with mode='040000' type='tree'
// GitHub will then drop each entry from the new tree.
                    var deletionEntries = [];
                    for (var p = 0; p < opts.paths.length; p++) {
                        var original = existing[opts.paths[p]];
                        deletionEntries.push({
                            path: opts.paths[p],
                            mode: (original && original.mode) || '100644',
                            type: (original && original.type) || 'blob',
                            sha: null
                        });
                    }
                    // Step 4: POST trees (create new tree with base_tree +
                    // sparse deletion entries).
                    return _request(token, 'POST',
                        '/repos/' + encodeURIComponent(REPOSITORY.owner) +
                        '/' + encodeURIComponent(REPOSITORY.repo) +
                        '/git/trees',
                        { base_tree: parentTreeSha, tree: deletionEntries }
                    ).then(function (treeCreateRes) {
                        if (!treeCreateRes.ok) throw treeCreateRes.error;
                        var newTreeSha = treeCreateRes.data.sha;
                        if (!newTreeSha) {
                            throw new AdminError('UNKNOWN', 'Trees API 返回的 tree SHA 为空');
                        }
                        // Step 5: POST commits.
                        return _request(token, 'POST',
                            '/repos/' + encodeURIComponent(REPOSITORY.owner) +
                            '/' + encodeURIComponent(REPOSITORY.repo) +
                            '/git/commits',
                            {
                                message: opts.message,
                                tree: newTreeSha,
                                parents: [parentCommitSha]
                            }
                        ).then(function (commitCreateRes) {
                            if (!commitCreateRes.ok) throw commitCreateRes.error;
                            var newCommitSha = commitCreateRes.data.sha;
                            if (!newCommitSha) {
                                throw new AdminError('UNKNOWN', 'Commits API 返回的 commit SHA 为空');
                            }
                            // Step 6: PATCH refs/heads/main (force:false).
                            return _request(token, 'PATCH',
                                '/repos/' + encodeURIComponent(REPOSITORY.owner) +
                                '/' + encodeURIComponent(REPOSITORY.repo) +
                                '/git/refs/heads/' + encodeURIComponent(REPOSITORY.branch),
                                { sha: newCommitSha, force: false }
                            ).then(function (refRes) {
                                if (!refRes.ok) {
                                    if (refRes.status === 422 || refRes.code === 'CONFLICT') {
                                        // Concurrent commit landed between step 1 and step 6.
                                        throw new AdminError('CONFLICT',
                                            '远程 main 已被其他人更新（不是 fast-forward）。请刷新后重试。');
                                    }
                                    throw refRes.error;
                                }
                                return {
                                    commitSha: newCommitSha,
                                    treeSha: newTreeSha,
                                    rateLimit: refRes.rateLimit
                                };
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * GET /repos/{o}/{r}/git/commits/{sha} — returns commit metadata.
     */
    function getCommit(token, sha) {
        return _request(token, 'GET',
            '/repos/' + encodeURIComponent(REPOSITORY.owner) +
            '/' + encodeURIComponent(REPOSITORY.repo) +
            '/git/commits/' + encodeURIComponent(sha)
        ).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                sha: r.data.sha,
                treeSha: r.data.tree && r.data.tree.sha,
                parents: (r.data.parents || []).map(function (p) { return p.sha; }),
                rateLimit: r.rateLimit
            };
        });
    }

    /**
     * Stage 9B — Create a Git blob.
     *   content:  string body (text or base64-encoded binary)
     *   encoding: 'utf-8' (default) or 'base64'
     * Returns the blob SHA on success.
     */
    function createBlob(token, content, encoding) {
        var enc = encoding || 'utf-8';
        return _request(token, 'POST',
            '/repos/' + encodeURIComponent(REPOSITORY.owner) +
            '/' + encodeURIComponent(REPOSITORY.repo) +
            '/git/blobs',
            { content: content, encoding: enc }
        ).then(function (r) {
            if (!r.ok) throw r.error;
            return r.data.sha;
        });
    }

    /**
     * Read a File / Blob as a base64 string (without the data URL prefix).
     * Uses FileReader.readAsDataURL which handles large payloads internally,
     * avoiding the call-stack overflow of String.fromCharCode on multi-MB data.
     */
    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () {
                var s = String(reader.result || '');
                var comma = s.indexOf(',');
                resolve(comma >= 0 ? s.substring(comma + 1) : s);
            };
            reader.onerror = function () { reject(reader.error || new Error('FileReader 失败')); };
            reader.readAsDataURL(file);
        });
    }

    /**
     * Stage 9B — Atomic multi-file commit using Git Data API.
     * opts = {
     *   baseCommitSha,    // current main HEAD commit SHA
     *   changes,          // [{ path, type: 'text'|'image', content?, file? }]
     *   message
     * }
     * Returns { commitSha, treeSha, rateLimit }.
     *
     * Force:false on PATCH refs/heads/main — concurrent commits fail with 422.
     */
    function commitChanges(token, opts) {
        if (!opts || !opts.baseCommitSha) {
            return Promise.reject(new AdminError('VALIDATION', 'baseCommitSha 必填'));
        }
        if (!opts.changes || !opts.changes.length) {
            return Promise.reject(new AdminError('VALIDATION', 'changes 必填且非空'));
        }
        if (!opts.message) {
            return Promise.reject(new AdminError('VALIDATION', 'message 必填'));
        }

        var ownerRepo = '/repos/' + encodeURIComponent(REPOSITORY.owner) +
            '/' + encodeURIComponent(REPOSITORY.repo);

        return getCommit(token, opts.baseCommitSha).then(function (commitInfo) {
            var baseTreeSha = commitInfo.treeSha;
            if (!baseTreeSha) {
                throw new AdminError('UNKNOWN', '无法获取 base commit 的 tree SHA');
            }
            return getTreeAt(token, baseTreeSha, true).then(function (treeRes) {
                if (treeRes.truncated) {
                    throw new AdminError('VALIDATION', 'Tree API 返回截断数据，无法安全提交');
                }
                // Build blob for each change.
                var blobPromises = opts.changes.map(function (change) {
                    if (change.type === 'text') {
                        return createBlob(token, change.content, 'utf-8').then(function (sha) {
                            return { path: change.path, mode: '100644', type: 'blob', sha: sha };
                        });
                    }
                    // image: read File as base64, create blob.
                    return fileToBase64(change.file).then(function (b64) {
                        return createBlob(token, b64, 'base64').then(function (sha) {
                            return { path: change.path, mode: '100644', type: 'blob', sha: sha };
                        });
                    });
                });
                return Promise.all(blobPromises).then(function (newEntries) {
                    // Create new tree (base_tree + entries).
                    return _request(token, 'POST', ownerRepo + '/git/trees', {
                        base_tree: baseTreeSha,
                        tree: newEntries
                    }).then(function (treeRes) {
                        if (!treeRes.ok) throw treeRes.error;
                        var newTreeSha = treeRes.data.sha;
                        if (!newTreeSha) {
                            throw new AdminError('UNKNOWN', 'Trees API 返回的 tree SHA 为空');
                        }
                        // Create commit.
                        return _request(token, 'POST', ownerRepo + '/git/commits', {
                            message: opts.message,
                            tree: newTreeSha,
                            parents: [opts.baseCommitSha]
                        }).then(function (commitRes) {
                            if (!commitRes.ok) throw commitRes.error;
                            var newCommitSha = commitRes.data.sha;
                            if (!newCommitSha) {
                                throw new AdminError('UNKNOWN', 'Commits API 返回的 commit SHA 为空');
                            }
                            // Update main ref with force:false.
                            return _request(token, 'PATCH',
                                ownerRepo + '/git/refs/heads/' + encodeURIComponent(REPOSITORY.branch),
                                { sha: newCommitSha, force: false }
                            ).then(function (refRes) {
                                if (!refRes.ok) {
                                    if (refRes.status === 422 || refRes.code === 'CONFLICT') {
                                        throw new AdminError('CONFLICT',
                                            '远程 main 已被其他人更新（不是 fast-forward）。请刷新后重试。');
                                    }
                                    throw refRes.error;
                                }
                                // Stage 14.3 — Bug 2 contract guard. Refuse
                                // to return a malformed result so callers
                                // never see `result.commitSha === undefined`.
                                if (!newCommitSha) {
                                    throw new AdminError('UNKNOWN',
                                        'GitHub API 返回的 commit SHA 为空');
                                }
                                if (!newTreeSha) {
                                    throw new AdminError('UNKNOWN',
                                        'GitHub API 返回的 tree SHA 为空');
                                }
                                return {
                                    commitSha: newCommitSha,
                                    treeSha: newTreeSha,
                                    rateLimit: refRes.rateLimit
                                };
                            });
                        });
                    });
                });
            });
        });
    }

    /**
     * GET /repos/{o}/{r}/git/trees/{sha}?recursive=1 — explicit tree fetch.
     * (getTree() above targets a branch ref; this one targets a commit sha.)
     */
    function getTreeAt(token, sha, recursive) {
        return _request(token, 'GET',
            '/repos/' + encodeURIComponent(REPOSITORY.owner) +
            '/' + encodeURIComponent(REPOSITORY.repo) +
            '/git/trees/' + encodeURIComponent(sha) +
            '?recursive=' + (recursive ? '1' : '0')
        ).then(function (r) {
            if (!r.ok) throw r.error;
            return {
                sha: r.data.sha,
                truncated: !!r.data.truncated,
                tree: r.data.tree || [],
                rateLimit: r.rateLimit
            };
        });
    }

    /* ============================================
       Public API
       ============================================
       ============================================ */
    window.GitHubAPI = {
        REPOSITORY: REPOSITORY,
        AdminError: AdminError,

        getAuthenticatedUser: getAuthenticatedUser,
        getRepository: getRepository,
        getBranch: getBranch,
        getTree: getTree,
        listContents: listContents,
        getFile: getFile,
        createFile: createFile,
        updateFile: updateFile,
        deleteFile: deleteFile,
        deleteArticle: deleteArticle,
        getCommit: getCommit,
        getTreeAt: getTreeAt,
        createBlob: createBlob,
        commitChanges: commitChanges,
        fileToBase64: fileToBase64,

        // Helpers exposed for tests / advanced UI use.
        _encodeBase64: encodeUTF8ToBase64,
        _decodeBase64: decodeBase64ToUTF8,
        _buildContentsPath: buildContentsPath,
        _getRateLimit: getRateLimitSnapshot
    };
})();