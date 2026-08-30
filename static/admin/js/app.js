/**
 * Admin App — Stage 3 Entry
 *
 * Responsibilities:
 *   - Token state in sessionStorage
 *   - Show / hide token toggle
 *   - REAL GitHub verification (GET /user → GET /repo → GET /branch)
 *   - Status badge (disconnected / connecting / connected / failed)
 *   - Theme toggle (independent from blog)
 *   - Connection info display (user / repo / branch) when connected
 *   - Disconnect clears state and storage
 *
 * Out of scope (later stages):
 *   - Article list / editor / image upload / Markdown rendering
 */

(function () {
    'use strict';

    var U = window.AdminUtils;
    var API = window.GitHubAPI;
    var M = window.ArticleModel;
    var STORAGE_KEY_TOKEN = 'admin.github.token';

    // Generation counter for loadArticles / loadArticlesFresh. Any in-flight
    // request whose gen !== articlesGeneration at completion is discarded —
    // this prevents stale tree snapshots from clobbering a newer one when
    // a save/create fires before the initial load completes.
    var articlesGeneration = 0;

    var els = {
        tokenInput: document.getElementById('token-input'),
        toggleVisibility: document.getElementById('toggle-token-visibility'),
        connectBtn: document.getElementById('connect-btn'),
        clearBtn: document.getElementById('clear-btn'),
        statusBadge: document.getElementById('status-badge'),
        themeToggle: document.getElementById('theme-toggle'),
        tokenSection: document.getElementById('token-section'),
        connectionInfo: document.getElementById('connection-info'),
        infoUser: document.getElementById('info-user'),
        infoRepo: document.getElementById('info-repo'),
        infoBranch: document.getElementById('info-branch'),
        disconnectBtn: document.getElementById('disconnect-btn'),
        articleListCard: document.getElementById('article-list-card'),
        refreshBtn: document.getElementById('refresh-articles-btn'),
        searchInput: document.getElementById('article-search'),
        treeStatus: document.getElementById('tree-status'),
        treeEl: document.getElementById('article-tree'),
        truncatedBanner: document.getElementById('tree-truncated-banner'),
        errorBanner: document.getElementById('article-error-banner'),
        articleCount: document.getElementById('article-count'),
        articleSelected: document.getElementById('article-selected'),
        articleSelectedPath: document.getElementById('article-selected-path'),
        articleSelectedSha: document.getElementById('article-selected-sha'),
        articleSelectedSize: document.getElementById('article-selected-size'),
        articleSelectedBundle: document.getElementById('article-selected-bundle'),
        editArticleBtn: document.getElementById('edit-article-btn'),
        backToListBtn: document.getElementById('back-to-list-btn'),
        // Edit article form (Stage 7)
        editForm: document.getElementById('edit-article-form'),
        edLoadStatus: document.getElementById('edit-load-status'),
        edTitle: document.getElementById('ed-title'),
        edDate: document.getElementById('ed-date'),
        edCategories: document.getElementById('ed-categories'),
        edTags: document.getElementById('ed-tags'),
        edDraft: document.getElementById('ed-draft'),
        edMath: document.getElementById('ed-math'),
        edBody: document.getElementById('ed-body'),
        edSaveBtn: document.getElementById('ed-save-btn'),
        edCancel: document.getElementById('edit-cancel-btn'),
        edCancel2: document.getElementById('ed-cancel-2'),
        edErrorBanner: document.getElementById('ed-error-banner'),
        edSuccessBanner: document.getElementById('ed-success-banner'),
        edConflictBanner: document.getElementById('ed-conflict-banner'),
        edConflictReload: document.getElementById('ed-conflict-reload-btn'),
        edConflictKeep: document.getElementById('ed-conflict-keep-btn'),
        // Stage 8 — delete modal
        edDeleteBtn: document.getElementById('ed-delete-btn'),
        edDeleteModal: document.getElementById('ed-delete-modal'),
        edDeletePreview: document.getElementById('ed-delete-preview'),
        edDeleteKeep: document.getElementById('ed-delete-keep'),
        edDeleteConfirmLabel: document.getElementById('ed-delete-confirm-label'),
        edDeleteConfirmInput: document.getElementById('ed-delete-confirm-input'),
        edDeleteConfirmHint: document.getElementById('ed-delete-confirm-hint'),
        edDeleteConfirmBtn: document.getElementById('ed-delete-confirm-btn'),
        edDeleteError: document.getElementById('ed-delete-error'),
        // Stage 9A — image upload (new article form)
        naImageSection: document.getElementById('na-image-section'),
        naInsertImageBtn: document.getElementById('na-insert-image-btn'),
        naImageInput: document.getElementById('na-image-input'),
        naImageError: document.getElementById('na-image-error'),
        naPendingList: document.getElementById('na-pending-list'),
        naPendingItems: document.getElementById('na-pending-items'),
        naPendingCount: document.querySelector('#na-pending-list .pending-count'),
        // Stage 9A — image upload (edit form)
        edImageSection: document.getElementById('ed-image-section'),
        edInsertImageBtn: document.getElementById('ed-insert-image-btn'),
        edImageInput: document.getElementById('ed-image-input'),
        edImageError: document.getElementById('ed-image-error'),
        edPendingList: document.getElementById('ed-pending-list'),
        edPendingItems: document.getElementById('ed-pending-items'),
        edPendingCount: document.querySelector('#ed-pending-list .pending-count'),
        edTitleError: document.getElementById('ed-title-error'),
        edDateError: document.getElementById('ed-date-error'),
        edEditorSplit: document.getElementById('ed-editor-split'),
        edEditorPane: document.getElementById('ed-editor-pane'),
        edPreviewPane: document.getElementById('ed-preview-pane'),
        edMarkdownPreview: document.getElementById('ed-markdown-preview'),
        edTabEdit: document.getElementById('ed-editor-tab-edit'),
        edTabPreview: document.getElementById('ed-editor-tab-preview'),
        edEditorCdnStatus: document.getElementById('ed-editor-cdn-status'),
        // New article form (Stage 5)
        newArticleBtn: document.getElementById('new-article-btn'),
        newArticleForm: document.getElementById('new-article-form'),
        naCancel: document.getElementById('new-article-cancel'),
        naCancel2: document.getElementById('na-cancel-2'),
        naTitle: document.getElementById('na-title'),
        naDate: document.getElementById('na-date'),
        naPathPreview: document.getElementById('na-path-preview'),
        naFilename: document.getElementById('na-filename'),
        naFilenameError: document.getElementById('na-filename-error'),
        naCategories: document.getElementById('na-categories'),
        naTags: document.getElementById('na-tags'),
        naDraft: document.getElementById('na-draft'),
        naMath: document.getElementById('na-math'),
        naBody: document.getElementById('na-body'),
        naSaveDraft: document.getElementById('na-save-draft'),
        naPublish: document.getElementById('na-publish'),
        naTitleError: document.getElementById('na-title-error'),
        naDateError: document.getElementById('na-date-error'),
        naErrorBanner: document.getElementById('na-error-banner'),
        // Stage 6 — Markdown editor + preview
        editorSplit: document.querySelector('.editor-split'),
        editorPane: document.getElementById('editor-pane'),
        previewPane: document.getElementById('preview-pane'),
        markdownPreview: document.getElementById('markdown-preview'),
        editorTabEdit: document.getElementById('editor-tab-edit'),
        editorTabPreview: document.getElementById('editor-tab-preview'),
        editorCdnStatus: document.getElementById('editor-cdn-status')
    };

    var state = {
        token: U.storage.get(STORAGE_KEY_TOKEN) || '',
        status: 'disconnected',
        connection: null,
        articles: [],
        directoryTree: null,
        truncated: false,
        loadingArticles: false,
        selectedArticle: null,
        collapsed: Object.create(null),
        formVisible: false,
        formDirty: false,
        formSubmitting: false,
        edit: null,
        deletePreview: null,
        // Stage 9A — pending image uploads (in-memory only, not yet pushed to GitHub)
        pendingUploads: []      // [{ id, file, originalName, safeName, type, size, previewUrl, status:'pending', targetPath, formMode:'new'|'edit' }]
    };

    /* ============================================
       Rendering
       ============================================ */
    function renderStatus() {
        if (!els.statusBadge) return;
        var label;
        switch (state.status) {
            case 'connecting': label = '正在连接'; break;
            case 'connected':  label = '已连接'; break;
            case 'failed':     label = '连接失败'; break;
            default:           label = '未连接';
        }
        els.statusBadge.setAttribute('data-status', state.status);
        var text = els.statusBadge.querySelector('.status-text');
        if (text) text.textContent = label;
    }

    function renderActions() {
        var hasToken = !!state.token;
        if (els.connectBtn) {
            var busy = state.status === 'connecting';
            els.connectBtn.disabled = !hasToken || busy;
            els.connectBtn.textContent = '';
            var icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            icon.setAttribute('viewBox', '0 0 24 24');
            icon.setAttribute('width', '16');
            icon.setAttribute('height', '16');
            icon.setAttribute('fill', 'none');
            icon.setAttribute('stroke', 'currentColor');
            icon.setAttribute('stroke-width', '2');
            icon.setAttribute('stroke-linecap', 'round');
            icon.setAttribute('stroke-linejoin', 'round');
            icon.setAttribute('aria-hidden', 'true');
            icon.innerHTML = '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>';
            els.connectBtn.appendChild(icon);
            els.connectBtn.appendChild(document.createTextNode(busy ? '正在连接…' : '连接 GitHub'));
        }
        if (els.clearBtn) {
            els.clearBtn.hidden = !hasToken || state.status === 'connected';
        }
    }

    function renderConnectionInfo() {
        var connected = state.status === 'connected' && state.connection;
        if (els.tokenSection) {
            els.tokenSection.hidden = !!connected;
        }
        if (els.connectionInfo) {
            els.connectionInfo.hidden = !connected;
        }
        if (els.articleListCard) {
            els.articleListCard.hidden = !connected;
        }
        if (connected) {
            if (els.infoUser) els.infoUser.textContent = state.connection.user.login;
            if (els.infoRepo) els.infoRepo.textContent = state.connection.repo.fullName;
            if (els.infoBranch) els.infoBranch.textContent = state.connection.branch.name;
        }
    }

    function syncInput() {
        if (!els.tokenInput) return;
        if (!state.token) {
            els.tokenInput.value = '';
        } else if (els.tokenInput.value === '') {
            els.tokenInput.placeholder = U.maskToken(state.token);
        }
    }

    /* ============================================
       Error formatting
       ============================================ */
    function formatError(err) {
        if (!err) return '未知错误';
        if (err.code === 'AUTH_INVALID')    return 'Token 无效或已过期，请重新输入';
        if (err.code === 'AUTH_FORBIDDEN')  return 'Token 权限不足，请检查 Fine-grained PAT 是否授予 Contents 读写权限';
        if (err.code === 'NOT_FOUND')       return '仓库或资源不存在（请检查 token 是否授权 Fintinger/hugo-auto-deploy）';
        if (err.code === 'RATE_LIMIT') {
            var rl = API._getRateLimit();
            var sec = rl && rl.secondsUntilReset != null ? rl.secondsUntilReset : null;
            return 'GitHub API 速率限制' + (sec ? '，' + Math.ceil(sec / 60) + ' 分钟后重试' : '，请稍后再试');
        }
        if (err.code === 'SERVER_ERROR')   return 'GitHub 服务异常（5xx），请稍后重试';
        if (err.code === 'NETWORK_ERROR')  return '网络异常，请检查连接';
        if (err.code === 'TIMEOUT')         return '请求超时（30秒），请检查网络后重试';
        if (err.code === 'VALIDATION')     return '请求参数无效：' + (err.message || '');
        return err.message || err.code || '未知错误';
    }

    /* ============================================
       Wiring
       ============================================ */
    function wireVisibility() {
        if (!els.toggleVisibility || !els.tokenInput) return;
        var wrap = els.tokenInput.parentElement;
        els.toggleVisibility.addEventListener('click', function () {
            var visible = wrap.classList.toggle('is-visible');
            els.tokenInput.type = visible ? 'text' : 'password';
        });
    }

    /**
     * Stage 10 — Central handler for GitHub API errors.
     * - AUTH_INVALID (401) or AUTH_FORBIDDEN (403 not rate-limit) → wipe token,
     *   reset connection state, force user to reconnect.
     * - RATE_LIMIT (secondary rate limit) → keep token, just surface error.
     * - Other errors → just return; caller decides how to display.
     * Returns true if the token was cleared (caller may want to abort UI flow).
     */
    function handleApiError(err) {
        if (!err) return false;
        if (err.code === 'AUTH_INVALID' || err.code === 'AUTH_FORBIDDEN') {
            // Token is invalid or no longer has the required scope.
            U.storage.remove(STORAGE_KEY_TOKEN);
            state.token = '';
            state.status = 'disconnected';
            state.connection = null;
            if (els.tokenInput) els.tokenInput.value = '';
            renderStatus();
            renderActions();
            renderConnectionInfo();
            syncInput();
            return true;
        }
        return false;
    }

    function wireConnect() {
        if (!els.connectBtn) return;
        els.connectBtn.addEventListener('click', function () {
            var raw = (els.tokenInput.value || '').trim();
            if (!U.looksLikeToken(raw)) {
                state.status = 'failed';
                state.connection = null;
                renderStatus();
                renderConnectionInfo();
                U.toast('Token 格式无效，请使用 Fine-grained PAT（以 github_pat_ 开头）', 'error');
                return;
            }
            state.token = raw;
            U.storage.set(STORAGE_KEY_TOKEN, raw);
            state.status = 'connecting';
            state.connection = null;
            renderStatus();
            renderActions();
            renderConnectionInfo();

            runVerification(raw).then(function (conn) {
                state.connection = conn;
                state.status = 'connected';
                renderStatus();
                renderActions();
                renderConnectionInfo();
                syncInput();
                U.toast('已连接 GitHub · ' + conn.user.login, 'success');
                loadArticles();
            }).catch(function (err) {
                handleApiError(err);
                state.status = 'failed';
                state.connection = null;
                // Wipe token on auth failure to avoid persistent bad state.
                if (err && (err.code === 'AUTH_INVALID' || err.code === 'AUTH_FORBIDDEN')) {
                    U.storage.remove(STORAGE_KEY_TOKEN);
                    state.token = '';
                    if (els.tokenInput) els.tokenInput.value = '';
                }
                renderStatus();
                renderActions();
                renderConnectionInfo();
                U.toast(formatError(err), 'error');
            });
        });
    }

    function wireClear() {
        if (!els.clearBtn) return;
        els.clearBtn.addEventListener('click', function () {
            U.storage.remove(STORAGE_KEY_TOKEN);
            state.token = '';
            state.status = 'disconnected';
            state.connection = null;
            if (els.tokenInput) els.tokenInput.value = '';
            renderStatus();
            renderActions();
            renderConnectionInfo();
            syncInput();
            U.toast('Token 已清除', 'success');
        });
    }

    function wireDisconnect() {
        if (!els.disconnectBtn) return;
        els.disconnectBtn.addEventListener('click', function () {
            // Disconnect = clear token + return to disconnected state. No remote action.
            U.storage.remove(STORAGE_KEY_TOKEN);
            state.token = '';
            state.status = 'disconnected';
            state.connection = null;
            if (els.tokenInput) els.tokenInput.value = '';
            renderStatus();
            renderActions();
            renderConnectionInfo();
            syncInput();
            U.toast('已断开连接', 'success');
        });
    }

    function wireTokenInput() {
        if (!els.tokenInput) return;
        var persist = U.debounce(function () {
            var raw = (els.tokenInput.value || '').trim();
            if (!raw) {
                U.storage.remove(STORAGE_KEY_TOKEN);
                state.token = '';
                state.status = 'disconnected';
                state.connection = null;
                renderStatus();
                renderActions();
                renderConnectionInfo();
                return;
            }
            state.token = raw;
            U.storage.set(STORAGE_KEY_TOKEN, raw);
            renderActions();
        }, 250);
        els.tokenInput.addEventListener('input', persist);
    }

    function wireTheme() {
        if (!els.themeToggle) return;
        els.themeToggle.addEventListener('click', function () {
            var isDark = document.body.classList.contains('theme-dark');
            U.applyAdminTheme(isDark ? 'light' : 'dark');
            try { window.localStorage.setItem('admin-theme', isDark ? 'light' : 'dark'); }
            catch (e) { /* ignore */ }
        });
    }

    /* ============================================
       Real verification — Stage 3
       ============================================ */
    function runVerification(token) {
        return API.getAuthenticatedUser(token).then(function (user) {
            return API.getRepository(token).then(function (repo) {
                // Verify write permission at minimum.
                var perms = repo.permissions || {};
                if (perms.push === false && perms.maintain === false && perms.admin === false) {
                    throw new API.AdminError(
                        'AUTH_FORBIDDEN',
                        'Token 对目标仓库无写权限。请在 Fine-grained PAT 中授予 Contents: Read and write。'
                    );
                }
                return API.getBranch(token).then(function (branch) {
                    return { user: user, repo: repo, branch: branch };
                });
            });
        });
    }

    /* ============================================
       Article loading (Stage 4)
       ============================================ */
    function loadArticles() {
        if (!state.token || state.status !== 'connected') return;
        if (state.loadingArticles) return;
        state.loadingArticles = true;
        var gen = ++articlesGeneration;
        setArticleError(null);
        if (els.refreshBtn) els.refreshBtn.disabled = true;
        if (els.treeStatus) els.treeStatus.textContent = '正在加载 Git Tree...';
        if (els.truncatedBanner) els.truncatedBanner.hidden = true;

        API.getTree(state.token, true).then(function (treeRes) {
            if (gen !== articlesGeneration) return; // stale — a newer request superseded us
            state.truncated = !!treeRes.truncated;
            var articles = M.parseTree(treeRes.tree);
            M.sortArticles(articles);
            state.articles = articles; // replace, do not accumulate
            state.directoryTree = M.buildDirectoryTree(articles);
            // Reset collapsed state to expanded for fresh load.
            state.collapsed = Object.create(null);
            // Auto-collapse older years to keep initial render compact.
            if (state.directoryTree.yearOrder.length > 1) {
                for (var i = 1; i < state.directoryTree.yearOrder.length; i++) {
                    state.collapsed['y:' + state.directoryTree.yearOrder[i]] = true;
                }
            }
            renderArticleTree();
            renderArticleCount();
            if (els.truncatedBanner) {
                els.truncatedBanner.hidden = !state.truncated;
            }
            var msg = '共 ' + articles.length + ' 篇文章' +
                (state.truncated ? '（Tree 被截断，可能不全）' : '');
            if (els.treeStatus) els.treeStatus.textContent = msg;
        }).catch(function (err) {
            if (gen !== articlesGeneration) return; // stale — ignore error
            handleApiError(err);
            setArticleError(formatError(err));
            if (els.treeStatus) els.treeStatus.textContent = '加载失败';
        }).then(function () {
            if (gen !== articlesGeneration) return;
            state.loadingArticles = false;
            if (els.refreshBtn) els.refreshBtn.disabled = false;
        });
    }

    /**
     * loadArticlesFresh: bypass GitHub CDN tree caching by first fetching
     * the latest commit SHA via getCommit, then getTreeAt with that specific
     * SHA. Use after saveEdit / submitNewArticle so the new article
     * immediately appears in the tree.
     *
     * CRITICAL: Unlike loadArticles(), this function MUST run even if a
     * previous loadArticles() is still in flight. After save/create we need
     * the latest tree right now — bailing out on state.loadingArticles would
     * leave the user with a stale tree until the in-flight load completes.
     *
     * We use a generation counter (articlesGeneration) to discard the result
     * of any earlier in-flight loadArticles() / loadArticlesFresh() if a
     * newer one starts while it is still pending.
     */
    function loadArticlesFresh() {
        if (!state.token || state.status !== 'connected') return;
        var gen = ++articlesGeneration;
        setArticleError(null);
        if (els.refreshBtn) els.refreshBtn.disabled = true;
        if (els.treeStatus) els.treeStatus.textContent = '正在加载最新 Tree...';
        if (els.truncatedBanner) els.truncatedBanner.hidden = true;

        API.getBranch(state.token).then(function (branch) {
            return API.getCommit(state.token, branch.commitSha).then(function (commit) {
                return API.getTreeAt(state.token, commit.treeSha, true);
            });
        }).then(function (treeRes) {
            if (gen !== articlesGeneration) return; // stale — a newer request superseded us
            state.truncated = !!treeRes.truncated;
            var articles = M.parseTree(treeRes.tree);
            M.sortArticles(articles);
            state.articles = articles;
            state.directoryTree = M.buildDirectoryTree(articles);
            state.collapsed = Object.create(null);
            if (state.directoryTree.yearOrder.length > 1) {
                for (var i = 1; i < state.directoryTree.yearOrder.length; i++) {
                    state.collapsed['y:' + state.directoryTree.yearOrder[i]] = true;
                }
            }
            renderArticleTree();
            renderArticleCount();
            if (els.truncatedBanner) {
                els.truncatedBanner.hidden = !state.truncated;
            }
            var msg = '共 ' + articles.length + ' 篇文章' +
                (state.truncated ? '（Tree 被截断，可能不全）' : '');
            if (els.treeStatus) els.treeStatus.textContent = msg;
        }).catch(function (err) {
            if (gen !== articlesGeneration) return; // stale — ignore error
            handleApiError(err);
            setArticleError(formatError(err));
            if (els.treeStatus) els.treeStatus.textContent = '加载失败';
        }).then(function () {
            if (gen !== articlesGeneration) return;
            state.loadingArticles = false;
            if (els.refreshBtn) els.refreshBtn.disabled = false;
        });
    }

    function setArticleError(message) {
        if (!els.errorBanner) return;
        if (message) {
            els.errorBanner.textContent = message;
            els.errorBanner.hidden = false;
        } else {
            els.errorBanner.hidden = true;
        }
    }

    function renderArticleCount() {
        if (els.articleCount) {
            els.articleCount.textContent = state.articles.length + ' 篇';
        }
    }

    function renderArticleTree() {
        if (!els.treeEl) return;
        var tree = state.directoryTree;
        if (!tree || state.articles.length === 0) {
            els.treeEl.innerHTML = '<div class="tree-empty">没有文章</div>';
            return;
        }

        var searchQuery = (els.searchInput && els.searchInput.value || '').trim();
        var filtered = M.filterArticles(state.articles, searchQuery);
        var filteredDirs = M.buildDirectoryTree(filtered);

        els.treeEl.innerHTML = '';
        if (filtered.length === 0) {
            els.treeEl.innerHTML = '<div class="tree-empty">无匹配文章</div>';
            return;
        }

        var frag = document.createDocumentFragment();
        for (var yi = 0; yi < filteredDirs.yearOrder.length; yi++) {
            var y = filteredDirs.yearOrder[yi];
            frag.appendChild(buildYearNode(y, filteredDirs));
        }
        els.treeEl.appendChild(frag);
    }

    function buildYearNode(year, dir) {
        var wrap = document.createElement('div');
        wrap.className = 'tree-node';

        var row = document.createElement('div');
        row.className = 'tree-row';
        row.setAttribute('role', 'treeitem');
        row.dataset.key = 'y:' + year;

        var toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = state.collapsed['y:' + year] ? '▸' : '▾';

        var label = document.createElement('span');
        label.className = 'tree-label year';
        label.textContent = year;

        row.appendChild(toggle);
        row.appendChild(label);

        row.addEventListener('click', function () {
            state.collapsed['y:' + year] = !state.collapsed['y:' + year];
            renderArticleTree();
        });

        wrap.appendChild(row);

        var children = document.createElement('div');
        children.className = 'tree-children';
        if (state.collapsed['y:' + year]) children.classList.add('collapsed');
        var months = dir.monthOrderByYear[year] || [];
        for (var mi = 0; mi < months.length; mi++) {
            var m = months[mi];
            children.appendChild(buildMonthNode(year, m, dir));
        }
        wrap.appendChild(children);
        return wrap;
    }

    function buildMonthNode(year, month, dir) {
        var wrap = document.createElement('div');
        wrap.className = 'tree-node';

        var row = document.createElement('div');
        row.className = 'tree-row';
        row.dataset.key = 'y:' + year + ':m:' + month;

        var toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = state.collapsed['y:' + year + ':m:' + month] ? '▸' : '▾';

        var label = document.createElement('span');
        label.className = 'tree-label month';
        label.textContent = month;

        row.appendChild(toggle);
        row.appendChild(label);

        row.addEventListener('click', function () {
            state.collapsed['y:' + year + ':m:' + month] = !state.collapsed['y:' + year + ':m:' + month];
            renderArticleTree();
        });

        wrap.appendChild(row);

        var children = document.createElement('div');
        children.className = 'tree-children';
        if (state.collapsed['y:' + year + ':m:' + month]) children.classList.add('collapsed');
        var days = (dir.dayOrderByYearMonth[year] && dir.dayOrderByYearMonth[year][month]) || [];
        for (var di = 0; di < days.length; di++) {
            var d = days[di];
            children.appendChild(buildDayNode(year, month, d, dir));
        }
        wrap.appendChild(children);
        return wrap;
    }

    function buildDayNode(year, month, day, dir) {
        var wrap = document.createElement('div');
        wrap.className = 'tree-node';

        var row = document.createElement('div');
        row.className = 'tree-row';
        row.dataset.key = 'y:' + year + ':m:' + month + ':d:' + day;

        var toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.textContent = state.collapsed['y:' + year + ':m:' + month + ':d:' + day] ? '▸' : '▾';

        var label = document.createElement('span');
        label.className = 'tree-label day';
        label.textContent = day;

        row.appendChild(toggle);
        row.appendChild(label);

        row.addEventListener('click', function () {
            state.collapsed['y:' + year + ':m:' + month + ':d:' + day] = !state.collapsed['y:' + year + ':m:' + month + ':d:' + day];
            renderArticleTree();
        });

        wrap.appendChild(row);

        var children = document.createElement('div');
        children.className = 'tree-children';
        if (state.collapsed['y:' + year + ':m:' + month + ':d:' + day]) children.classList.add('collapsed');
        var articles = dir.byYear[year][month][day] || [];
        for (var i = 0; i < articles.length; i++) {
            children.appendChild(buildFileNode(articles[i]));
        }
        wrap.appendChild(children);
        return wrap;
    }

    function buildFileNode(article) {
        var node = document.createElement('div');
        node.className = 'tree-file';
        if (state.selectedArticle && state.selectedArticle.path === article.path) {
            node.classList.add('selected');
        }
        node.setAttribute('role', 'treeitem');
        node.dataset.path = article.path;

        var name = document.createElement('span');
        name.className = 'tree-file-name';
        name.textContent = article.filename;
        if (article.isBundle) {
            var marker = document.createElement('span');
            marker.className = 'bundle-marker';
            marker.textContent = '📦 bundle';
            name.appendChild(marker);
        }

        var size = document.createElement('span');
        size.className = 'tree-file-size';
        size.textContent = M.formatSize(article.size);

        node.appendChild(name);
        node.appendChild(size);

        node.addEventListener('click', function () {
            selectArticle(article);
        });
        return node;
    }

    function selectArticle(article) {
        state.selectedArticle = article;
        if (!els.articleSelected) return;
        els.articleSelected.hidden = false;
        if (els.articleSelectedPath) els.articleSelectedPath.textContent = article.path;
        if (els.articleSelectedSha) els.articleSelectedSha.textContent = article.sha || '—';
        if (els.articleSelectedSize) els.articleSelectedSize.textContent = M.formatSize(article.size) || '—';
        if (els.articleSelectedBundle) {
            els.articleSelectedBundle.textContent = article.isBundle
                ? ('是 · ' + article.assetsPath)
                : '否';
        }
        // Refresh tree to show selection highlight.
        renderArticleTree();
    }

    function wireArticleList() {
        if (els.refreshBtn) {
            els.refreshBtn.addEventListener('click', function () {
                loadArticles();
            });
        }
        if (els.searchInput) {
            var onSearch = U.debounce(function () {
                renderArticleTree();
            }, 200);
            els.searchInput.addEventListener('input', onSearch);
        }
    }

    /* ============================================
       Stage 7 — Edit existing article flow
       ============================================ */

    function hideEditForm() {
        if (!els.editForm) return;
        var editPending = state.pendingUploads.filter(function (p) { return p.formMode === 'edit'; }).length;
        var msg = '当前编辑内容尚未保存，确定离开吗？';
        if (editPending > 0) {
            msg = '当前编辑内容与 ' + editPending + ' 张待上传图片尚未保存，确定离开吗？';
        }
        if ((state.edit && state.edit.isDirty && !state.edit.isSaving) || editPending > 0) {
            if (!window.confirm(msg)) {
                return;
            }
        }
        // Revoke edit-mode object URLs.
        state.pendingUploads = state.pendingUploads.filter(function (p) {
            if (p.formMode === 'edit' && p.previewUrl) {
                try { URL.revokeObjectURL(p.previewUrl); } catch (e) { /* ignore */ }
                return false;
            }
            return true;
        });
        state.edit = null;
        if (els.editForm) els.editForm.hidden = true;
        if (els.edErrorBanner) els.edErrorBanner.hidden = true;
        if (els.edSuccessBanner) els.edSuccessBanner.hidden = true;
        if (els.edLoadStatus) els.edLoadStatus.hidden = true;
        clearEditFormErrors();
        renderPendingList('edit');
    }

    function clearEditFormErrors() {
        if (els.edTitleError) { els.edTitleError.textContent = ''; els.edTitleError.classList.remove('error'); }
        if (els.edDateError) { els.edDateError.textContent = ''; els.edDateError.classList.remove('error'); }
    }

    function setEditBanner(message, kind) {
        var b = kind === 'success' ? els.edSuccessBanner : els.edErrorBanner;
        var other = kind === 'success' ? els.edErrorBanner : els.edSuccessBanner;
        if (!b) return;
        if (other) other.hidden = true;
        if (message) {
            b.textContent = message;
            b.hidden = false;
        } else {
            b.hidden = true;
        }
    }

    function setEditSubmitting(submitting) {
        if (state.edit) state.edit.isSaving = submitting;
        if (els.edSaveBtn) els.edSaveBtn.disabled = submitting;
        if (els.edCancel) els.edCancel.disabled = submitting;
        if (els.edCancel2) els.edCancel2.disabled = submitting;
        if (els.edTitle) els.edTitle.readOnly = submitting;
        if (els.edDate) els.edDate.readOnly = submitting;
        if (els.edCategories) els.edCategories.readOnly = submitting;
        if (els.edTags) els.edTags.readOnly = submitting;
        if (els.edBody) els.edBody.readOnly = submitting;
        if (els.edDraft) els.edDraft.disabled = submitting;
        if (els.edMath) els.edMath.disabled = submitting;
        if (els.editArticleBtn) els.editArticleBtn.disabled = submitting;
    }

    function loadArticleForEdit(path) {
        if (state.formVisible) hideNewArticleForm();
        state.edit = {
            path: path,
            originalSha: null,
            originalRaw: null,
            originalFrontMatterRaw: null,
            originalBody: null,
            frontMatter: {},
            body: '',
            hasFrontMatter: false,
            isLoading: true,
            isSaving: false,
            isDirty: false,
            // Cached latest response (used by save / conflict resolution).
            latestRaw: null,
            latestSha: null
        };
        if (els.editForm) els.editForm.hidden = false;
        if (els.edLoadStatus) {
            els.edLoadStatus.textContent = '正在读取 GitHub 文件...';
            els.edLoadStatus.hidden = false;
        }
        if (els.edErrorBanner) els.edErrorBanner.hidden = true;
        if (els.edSuccessBanner) els.edSuccessBanner.hidden = true;
        if (els.edConflictBanner) els.edConflictBanner.hidden = true;
        // Disable save while loading.
        setEditSubmitting(true);

        API.getFile(state.token, path).then(function (file) {
            var parsed = window.FrontMatter.parse(file.content);
            var fields = window.FrontMatter.extractFields(parsed.frontMatterRaw);

            state.edit.originalSha = file.sha;
            state.edit.originalRaw = file.content;
            state.edit.originalFrontMatterRaw = parsed.frontMatterRaw;
            state.edit.originalBody = parsed.body;
            state.edit.frontMatter = fields;
            state.edit.body = parsed.body;
            state.edit.hasFrontMatter = parsed.hasFrontMatter;
            // Also seed latest cache.
            state.edit.latestRaw = file.content;
            state.edit.latestSha = file.sha;

            // Release readOnly BEFORE populating — some browsers / input
            // types can refuse programmatic value updates on readOnly fields
            // in certain focus states. Releasing first guarantees a clean
            // assignment.
            setEditSubmitting(false);

            // Populate form (defensive: every field has an explicit fallback
            // so a missing extractor field never blanks an input).
            if (els.edTitle) els.edTitle.value = fields && fields.title ? String(fields.title) : '';
            if (els.edDate) els.edDate.value = fields && fields.date ? String(fields.date) : '';
            if (els.edCategories) els.edCategories.value = Array.isArray(fields && fields.categories) ? fields.categories.join(', ') : '';
            if (els.edTags) els.edTags.value = Array.isArray(fields && fields.tags) ? fields.tags.join(', ') : '';
            if (els.edDraft) els.edDraft.checked = !!(fields && fields.draft);
            if (els.edMath) els.edMath.checked = !!(fields && fields.math);
            if (els.edBody) els.edBody.value = parsed.body != null ? parsed.body : '';

            if (els.edLoadStatus) els.edLoadStatus.hidden = true;
            state.edit.isLoading = false;
        }).catch(function (err) {
            handleApiError(err);
            state.edit = null;
            if (els.editForm) els.editForm.hidden = true;
            if (els.edLoadStatus) els.edLoadStatus.hidden = true;
            setEditSubmitting(false);
            setEditBanner('读取失败: ' + formatError(err), 'error');
        });
    }

    /**
     * Reload edit state from a known latest remote file response.
     * Used after a conflict is resolved by [重新加载远程版本].
     * Caller passes a {content, sha} pair from getFile().
     */
    function reloadEditFromLatest(file) {
        if (!state.edit || !file) return;
        var parsed = window.FrontMatter.parse(file.content);
        var fields = window.FrontMatter.extractFields(parsed.frontMatterRaw);

        state.edit.originalSha = file.sha;
        state.edit.originalRaw = file.content;
        state.edit.originalFrontMatterRaw = parsed.frontMatterRaw;
        state.edit.originalBody = parsed.body;
        state.edit.frontMatter = fields;
        state.edit.body = parsed.body;
        state.edit.hasFrontMatter = parsed.hasFrontMatter;
        state.edit.latestRaw = file.content;
        state.edit.latestSha = file.sha;
        state.edit.isDirty = false;

        if (els.edTitle) els.edTitle.value = fields && fields.title ? String(fields.title) : '';
        if (els.edDate) els.edDate.value = fields && fields.date ? String(fields.date) : '';
        if (els.edCategories) els.edCategories.value = Array.isArray(fields && fields.categories) ? fields.categories.join(', ') : '';
        if (els.edTags) els.edTags.value = Array.isArray(fields && fields.tags) ? fields.tags.join(', ') : '';
        if (els.edDraft) els.edDraft.checked = !!(fields && fields.draft);
        if (els.edMath) els.edMath.checked = !!(fields && fields.math);
        if (els.edBody) els.edBody.value = parsed.body != null ? parsed.body : '';
    }

    function markEditDirty() {
        if (state.edit && !state.edit.isSaving && !state.edit.isLoading) {
            state.edit.isDirty = true;
        }
    }

    function collectEditChanges() {
        if (!state.edit) return null;

        var originalFm = state.edit.frontMatter || {};
        var changes = {};
        var hasAny = false;

        // Title
        var curTitle = (els.edTitle && els.edTitle.value || '').trim();
        if (curTitle !== String(originalFm.title || '')) {
            if (!curTitle) {
                setEditBanner('标题不能为空', 'error');
                if (els.edTitleError) {
                    els.edTitleError.textContent = '标题不能为空';
                    els.edTitleError.classList.add('error');
                }
                return null;
            }
            changes.title = curTitle;
            hasAny = true;
        }

        // Date
        var curDate = els.edDate ? els.edDate.value : '';
        if (curDate !== String(originalFm.date || '')) {
            if (curDate && !window.ArticleModel.parseDateString(curDate)) {
                setEditBanner('日期格式无效', 'error');
                if (els.edDateError) {
                    els.edDateError.textContent = '日期格式无效';
                    els.edDateError.classList.add('error');
                }
                return null;
            }
            changes.date = curDate;
            hasAny = true;
        }

        // Categories (array)
        var curCats = window.ArticleModel.parseCategoriesInput(els.edCategories ? els.edCategories.value || '' : '');
        var origCats = Array.isArray(originalFm.categories) ? originalFm.categories : [];
        if (!arrayEq(curCats, origCats)) {
            changes.categories = curCats;
            hasAny = true;
        }

        // Tags (array)
        var curTags = window.ArticleModel.parseCategoriesInput(els.edTags ? els.edTags.value || '' : '');
        var origTags = Array.isArray(originalFm.tags) ? originalFm.tags : [];
        if (!arrayEq(curTags, origTags)) {
            changes.tags = curTags;
            hasAny = true;
        }

        // draft (boolean) — current convention: draft:true only; absence = false.
        var curDraft = !!(els.edDraft && els.edDraft.checked);
        var origDraft = !!originalFm.draft;
        if (curDraft !== origDraft) {
            changes.draft = curDraft ? true : '__DELETE__';
            hasAny = true;
        }

        // math (boolean) — same convention as draft.
        var curMath = !!(els.edMath && els.edMath.checked);
        var origMath = !!originalFm.math;
        if (curMath !== origMath) {
            changes.math = curMath ? true : '__DELETE__';
            hasAny = true;
        }

        // Body change
        var curBody = els.edBody ? els.edBody.value : '';
        var bodyChanged = curBody !== state.edit.originalBody;

        if (!hasAny && !bodyChanged) {
            return { noChange: true };
        }
        return { changes: changes, bodyChanged: bodyChanged, newBody: curBody };
    }

    function arrayEq(a, b) {
        if (a === b) return true;
        if (!a || !b) return false;
        if (a.length !== b.length) return false;
        for (var i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
        return true;
    }

    function saveEdit() {
        if (!state.edit || state.edit.isSaving) return;
        var edit = state.edit;
        clearEditFormErrors();
        setEditBanner(null);
        if (els.edConflictBanner) els.edConflictBanner.hidden = true;

        var collected = collectEditChanges();
        if (collected === null) return;
        if (collected.noChange) {
            setEditBanner('没有检测到修改，未提交。', 'success');
            edit.isDirty = false;
            return;
        }

        setEditSubmitting(true);

        API.getFile(state.token, edit.path).then(function (latest) {
            if (latest.content !== edit.originalRaw) {
                edit.latestRaw = latest.content;
                edit.latestSha = latest.sha;
                showConflictUI();
                setEditSubmitting(false);
                return;
            }

            var patchedFm;
            if (edit.hasFrontMatter) {
                patchedFm = window.FrontMatter.patch(edit.originalFrontMatterRaw, collected.changes);
            } else if (Object.keys(collected.changes).length > 0) {
                patchedFm = window.FrontMatter.patch('', collected.changes);
            } else {
                patchedFm = '';
            }

            var nl = window.FrontMatter.detectNewline(edit.originalRaw || '\n');

// FM wrapper rule:
            //   - If patched FM has any non-whitespace content → wrap with ---
            //   - If patched FM is empty (user deleted all fields, or article
            //     never had FM and no FM fields were added) → no wrapper, output body only.
            // This guarantees we never produce an empty --- \\n --- block.
            var fmHasContent = patchedFm.trim().length > 0;
            var finalRaw;
            if (fmHasContent) {
                finalRaw = '---' + nl + patchedFm + nl + '---' + nl + (collected.bodyChanged ? collected.newBody : edit.originalBody);
                if (!/(\\r?\\n)$/.test(finalRaw)) finalRaw += nl;
            } else {
                // No FM wrapper — output body only (NEVER originalRaw, which contains FM).
                finalRaw = collected.bodyChanged ? collected.newBody : edit.originalBody;
            }

            var title = (edit.frontMatter && edit.frontMatter.title) || edit.path.split('/').pop();
            var willBeDraft = !!(els.edDraft && els.edDraft.checked);
            var commitPrefix = willBeDraft ? 'post: draft' : 'post:';
            var commitMsg = window.ArticleModel.sanitizeTitleForCommit(title, commitPrefix);

            return API.updateFile(state.token, edit.path, finalRaw, latest.sha, commitMsg).then(function (result) {
                edit.originalRaw = finalRaw;
                edit.originalSha = result.sha;
                edit.latestRaw = finalRaw;
                edit.latestSha = result.sha;
                edit.isDirty = false;
                setEditBanner('已保存（Commit ' + (result.commitSha || '').slice(0, 7) + '）。等待 Vercel 自动部署。', 'success');

                API.getFile(state.token, edit.path).then(function (reloaded) {
                    if (!state.edit) return;
                    reloadEditFromLatest(reloaded);
                }).catch(function () { /* ignore */ });

                loadArticlesFresh();
            });
        }).catch(function (err) {
            handleApiError(err);
            if (err && err && err.code === 'CONFLICT') {
                showConflictUI();
            } else {
                setEditBanner(formatError(err), 'error');
            }
        }).then(function () {
            setEditSubmitting(false);
        });
    }

    /**
     * Show the conflict banner with [重新加载远程版本] / [保留当前编辑内容].
     * Stores the latest response on state.edit so the reload action uses it
     * without an extra API call.
     */
    function showConflictUI() {
        if (els.edErrorBanner) els.edErrorBanner.hidden = true;
        if (els.edSuccessBanner) els.edSuccessBanner.hidden = true;
        if (els.edConflictBanner) els.edConflictBanner.hidden = false;
        if (state.edit) {
            state.edit.isSaving = false;
            setEditSubmitting(false);
        }
        // Scroll conflict banner into view.
        if (els.edConflictBanner && els.edConflictBanner.scrollIntoView) {
            els.edConflictBanner.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    function hideConflictUI() {
        if (els.edConflictBanner) els.edConflictBanner.hidden = true;
    }

    function reloadFromRemote() {
        if (!state.edit || !state.edit.latestRaw) return;
        var file = {
            content: state.edit.latestRaw,
            sha: state.edit.latestSha
        };
        reloadEditFromLatest(file);
        hideConflictUI();
        setEditBanner('已从远程重新加载。可以继续编辑。', 'success');
    }

    function keepLocalEdits() {
        hideConflictUI();
        setEditBanner('当前内容尚未保存。远程版本已变化，再次保存时会再次校验 baseline。', 'success');
    }

    /**
     * Replace pending-image src placeholders in the rendered HTML with
     * object URLs so the user can preview what they uploaded. The placeholder
     * uses the literal text "PENDINGIMG:0" in the src attribute which marked.js
     * emits as <img src="PENDINGIMG:0">. We rewrite the src after render.
     */
    function renderPreviewWithPending(html, formMode) {
        if (!state.pendingUploads || state.pendingUploads.length === 0) {
            return html;
        }
        for (var i = 0; i < state.pendingUploads.length; i++) {
            var p = state.pendingUploads[i];
            if (p.formMode !== formMode) continue;
            var placeholder = 'PENDINGIMG:' + i;
            // marked.js wraps src in quotes; build a safe regex.
            var re = new RegExp('src="' + placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"', 'g');
            html = html.replace(re, 'src="' + p.previewUrl + '" data-pending="1"');
        }
        return html;
    }

    function renderEditPreview() {
        if (!els.edMarkdownPreview) return;
        var MP = window.MarkdownPreview;
        if (!MP || !MP.isReady()) {
            els.edMarkdownPreview.innerHTML = '<p class="muted small">预览组件未加载（marked.js CDN 不可达）。编辑器仍可正常使用。</p>';
            return;
        }
        // Pre-process: replace pending-image refs with safe markers so marked.js
        // does not try to resolve them as URLs.
        var bodyValue = els.edBody ? els.edBody.value : '';
        var processed = bodyValue;
        for (var i = 0; i < state.pendingUploads.length; i++) {
            var p = state.pendingUploads[i];
            if (p.formMode !== 'edit') continue;
            var ref = 'index.assets/' + p.safeName;
            var placeholder = 'PENDINGIMG:' + i;
            // Replace all occurrences of this ref in the markdown source.
            processed = processed.split(ref).join(placeholder);
        }
        var result = MP.render(processed);
        if (!result.ok) {
            els.edMarkdownPreview.innerHTML = '<p class="adm-math-error">' +
                (result.error ? result.error.replace(/</g, '&lt;') : '渲染失败') + '</p>';
            return;
        }
        result.html = renderPreviewWithPending(result.html, 'edit');
        els.edMarkdownPreview.innerHTML = result.html;
    }

    function setEditActiveTab(tab) {
        if (!els.edEditorSplit) return;
        if (tab !== 'edit' && tab !== 'preview') tab = 'edit';
        els.edEditorSplit.setAttribute('data-active', tab);
        if (els.edTabEdit) els.edTabEdit.classList.toggle('active', tab === 'edit');
        if (els.edTabPreview) els.edTabPreview.classList.toggle('active', tab === 'preview');
        if (tab === 'preview') renderEditPreview();
    }

function updateEditCdnStatus() {
        if (!els.edEditorCdnStatus) return;
        var parts = [];
        if (typeof window.marked === 'undefined') parts.push('marked');
        if (typeof window.katex === 'undefined') parts.push('katex');
        if (typeof window.hljs === 'undefined') parts.push('highlight');
        if (parts.length === 0) {
            els.edEditorCdnStatus.textContent = '预览就绪';
        } else {
            els.edEditorCdnStatus.textContent = 'CDN 未加载：' + parts.join(', ');
        }
    }

    /* ============================================
       Stage 8 — Article delete flow
       ============================================ */

    /**
     * Compute the set of files to delete for a given article.
     *  - Always: article.path (the .md file)
     *  - If article.isBundle: also every file under article.assetsPath
     *  - Never: sibling .md files in the same directory
     *  - Never: assets that might be shared with other files
     *
     * Note: this is the local computed intent. The actual delete list must
     * be re-verified against the remote tree at delete time.
     */
    function computeDeleteFiles(article) {
        if (!article) return [];
        var files = [article.path];
        if (article.isBundle && article.assetsPath) {
            // List assets from the current article's known assets.
            // Actual remote assets are looked up at delete time.
            // For now, we only know the directory. The remote tree is
            // queried when building the actual delete set in openDeleteModal.
            files.push(article.assetsPath);
        }
        return files;
    }

    /**
     * Open the delete confirmation modal. Computes the actual delete set by
     * querying the remote tree (NEVER trusting cached state) and presents
     * the file list + requires title confirmation.
     */
    function openDeleteModal() {
        if (!state.edit || state.edit.isSaving || !els.edDeleteModal) return;
        if (els.edDeleteError) { els.edDeleteError.hidden = true; els.edDeleteError.textContent = ''; }

        var article = state.edit;
        if (els.edDeletePreview) {
            els.edDeletePreview.innerHTML = '<li class="muted small">正在从 GitHub 读取当前 tree…</li>';
        }
        if (els.edDeleteKeep) els.edDeleteKeep.hidden = true;
        if (els.edDeleteConfirmInput) els.edDeleteConfirmInput.value = '';
        if (els.edDeleteConfirmHint) els.edDeleteConfirmHint.textContent = '';
        if (els.edDeleteConfirmBtn) els.edDeleteConfirmBtn.disabled = true;
        els.edDeleteModal.hidden = false;

        var sepIdx = article.path.lastIndexOf('/');
        var dirPath = sepIdx > 0 ? article.path.substring(0, sepIdx) : '';
        var fileName = sepIdx > 0 ? article.path.substring(sepIdx + 1) : article.path;

        // Use getCommit + getTreeAt(commit.treeSha, recursive) instead of
        // listContents(dirPath). The contents API is non-recursive, so it
        // never returns files under index.assets/. As a result, deleting
        // a bundle article left every image behind in the repo.
        //
        // We collect:
        //   - actualDelete: every blob/tree entry inside dirPath that
        //     belongs to this article (the .md itself + every entry
        //     under index.assets/ when bundle)
        //   - siblingKeep:  everything else inside dirPath
        API.getBranch(state.token).then(function (branch) {
            return API.getCommit(state.token, branch.commitSha).then(function (commit) {
                return API.getTreeAt(state.token, commit.treeSha, true);
            });
        }).then(function (treeRes) {
            if (treeRes.truncated) {
                throw new API.AdminError('VALIDATION',
                    'Tree API 返回截断数据（仓库过大），无法安全删除。');
            }
            // article.directory already ends with '/', use it directly as prefix.
            var dirPrefix = article.directory || (dirPath ? dirPath + '/' : '');
            // article.assetsPath ends with '/' in our article model, but
            // GitHub Tree entry paths do NOT (e.g. 'index.assets', not
            // 'index.assets/'). Strip the trailing slash so prefix matches
            // both the directory entry itself and every file under it.
            var assetsPrefix = (article.assetsPath || '').replace(/\/+$/, '');
            var actualDelete = [];
            var siblingKeep = [];
            for (var i = 0; i < treeRes.tree.length; i++) {
                var e = treeRes.tree[i];
                // Only consider entries under this article's directory.
                if (dirPrefix && e.path.indexOf(dirPrefix) !== 0) continue;
                var inBundle = !!(assetsPrefix &&
                    (e.path === assetsPrefix ||
                     e.path.indexOf(assetsPrefix + '/') === 0));
                var isArticleFile = (e.path === article.path);
                if (isArticleFile || inBundle) {
                    actualDelete.push(e.path);
                } else {
                    // Sibling file (another .md or unrelated tree entry)
                    // at the same depth — keep.
                    siblingKeep.push(e.path);
                }
            }

            if (actualDelete.length === 0) {
                // File disappeared between load and delete intent.
                els.edDeletePreview.innerHTML = '';
                if (els.edDeleteError) {
                    els.edDeleteError.textContent = '文章已经不存在。请刷新文章列表。';
                    els.edDeleteError.hidden = false;
                }
                return;
            }

            // Render preview list.
            var html = '';
            for (var k = 0; k < actualDelete.length; k++) {
                html += '<li>' + escapeHtml(actualDelete[k]) + '</li>';
            }
            if (siblingKeep.length > 0) {
                html += '<li class="muted small">共 ' + actualDelete.length + ' 个文件被删除；'
                    + siblingKeep.length + ' 个同目录文件保留</li>';
            } else {
                html += '<li class="muted small">共 ' + actualDelete.length + ' 个文件</li>';
            }
            els.edDeletePreview.innerHTML = html;

            // Show kept files.
            if (siblingKeep.length > 0 && els.edDeleteKeep) {
                var keepHtml = '<strong>不会删除（同目录其他文件）：</strong><br>'
                    + siblingKeep.map(escapeHtml).join('<br>');
                els.edDeleteKeep.innerHTML = keepHtml;
                els.edDeleteKeep.hidden = false;
            }

            // Configure confirmation.
            // If article has title in front matter, require typing it.
            // Otherwise (no title), require typing the filename.
            var titleFm = (article.frontMatter && article.frontMatter.title) || '';
            var confirmString;
            var hintText;
            if (titleFm) {
                confirmString = titleFm;
                hintText = '完整输入以下文字（含标点、空格不敏感前后空白）';
                if (els.edDeleteConfirmLabel) {
                    els.edDeleteConfirmLabel.textContent = '请输入完整文章标题确认删除';
                }
            } else {
                confirmString = fileName;
                hintText = '文章无 front matter title，请输入完整文件名';
                if (els.edDeleteConfirmLabel) {
                    els.edDeleteConfirmLabel.textContent = '请输入完整文件名确认删除';
                }
            }
            state.deletePreview = {
                paths: actualDelete,
                keep: siblingKeep,
                confirmString: confirmString,
                title: titleFm,
                fileName: fileName
            };
            // Show what the user must type in the input placeholder and hint.
            if (els.edDeleteConfirmInput) els.edDeleteConfirmInput.placeholder = confirmString;
            if (els.edDeleteConfirmHint) {
                // Build the hint as real DOM nodes so <code> renders as a
                // styled inline element instead of literal text. Setting
                // textContent with '<code>...</code>' leaves the literal
                // tags visible to the user and causes the title to appear
                // "missing characters".
                while (els.edDeleteConfirmHint.firstChild) {
                    els.edDeleteConfirmHint.removeChild(els.edDeleteConfirmHint.firstChild);
                }
                els.edDeleteConfirmHint.appendChild(document.createTextNode(hintText + '：'));
                var codeEl = document.createElement('code');
                codeEl.textContent = confirmString;
                els.edDeleteConfirmHint.appendChild(codeEl);
            }
        }).catch(function (err) {
            handleApiError(err);
            if (els.edDeleteError) {
                els.edDeleteError.textContent = '无法读取远程 tree: ' + formatError(err);
                els.edDeleteError.hidden = false;
            }
        });
    }

    function closeDeleteModal() {
        if (els.edDeleteModal) els.edDeleteModal.hidden = true;
        if (els.edDeleteConfirmInput) els.edDeleteConfirmInput.value = '';
        if (els.edDeleteConfirmBtn) els.edDeleteConfirmBtn.disabled = true;
        state.deletePreview = null;
    }

    function checkDeleteConfirm() {
        if (!state.deletePreview) {
            if (els.edDeleteConfirmBtn) els.edDeleteConfirmBtn.disabled = true;
            return;
        }
        var typed = (els.edDeleteConfirmInput && els.edDeleteConfirmInput.value || '').trim();
        var required = state.deletePreview.confirmString;
        if (els.edDeleteConfirmBtn) {
            els.edDeleteConfirmBtn.disabled = (typed !== required);
        }
    }

    function executeDelete() {
        if (!state.deletePreview || !state.edit) return;
        var dp = state.deletePreview;
        var edit = state.edit;
        if (els.edDeleteConfirmBtn) els.edDeleteConfirmBtn.disabled = true;
        if (els.edDeleteError) { els.edDeleteError.hidden = true; }

        var titleFm = dp.title || edit.path.split('/').pop();
        var commitMsg = window.ArticleModel.sanitizeTitleForCommit(titleFm, 'post: delete');

        API.deleteArticle(state.token, {
            paths: dp.paths,
            message: commitMsg
        }).then(function (result) {
            // Success.
            closeDeleteModal();
            state.edit = null;
            if (els.editForm) els.editForm.hidden = true;
            setEditBanner('已删除 ' + dp.paths.length + ' 个文件（Commit ' +
                (result.commitSha || '').slice(0, 7) + '）。等待 Vercel 自动部署。', 'success');
            loadArticlesFresh(); // refresh tree from GitHub (bypass CDN cache)
        }).catch(function (err) {
            handleApiError(err);
            if (err && err.code === 'CONFLICT') {
                // Concurrent commit landed during delete flow.
                if (els.edDeleteError) {
                    els.edDeleteError.textContent = '远程 main 已被其他人更新（不是 fast-forward）。请刷新后重试。';
                    els.edDeleteError.hidden = false;
                }
            } else if (err && err.code === 'NOT_FOUND') {
                if (els.edDeleteError) {
                    els.edDeleteError.textContent = '文章已经不存在。请刷新文章列表。';
                    els.edDeleteError.hidden = false;
                }
            } else {
                if (els.edDeleteError) {
                    els.edDeleteError.textContent = formatError(err);
                    els.edDeleteError.hidden = false;
                }
            }
            if (els.edDeleteConfirmBtn) els.edDeleteConfirmBtn.disabled = false;
        });
    }

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function wireEditForm() {
        if (els.editArticleBtn) {
            els.editArticleBtn.addEventListener('click', function () {
                if (state.selectedArticle) loadArticleForEdit(state.selectedArticle.path);
            });
        }
        if (els.backToListBtn) {
            els.backToListBtn.addEventListener('click', function () {
                // Go back to article list: clear selected article state and
                // hide the article-selected / edit-form sections.
                if (state.edit && state.edit.isDirty && !window.confirm('当前编辑内容尚未保存，确定离开吗？')) {
                    return;
                }
                if (state.edit) {
                    // Safe revoke — previewUrl may not exist on plain edit session.
                    try {
                        if (state.edit.previewUrl) URL.revokeObjectURL(state.edit.previewUrl);
                    } catch (e) { /* ignore */ }
                    state.edit = null;
                }
                state.selectedArticle = null;
                if (els.articleSelected) els.articleSelected.hidden = true;
                if (els.editForm) els.editForm.hidden = true;
                if (els.edErrorBanner) els.edErrorBanner.hidden = true;
                if (els.edSuccessBanner) els.edSuccessBanner.hidden = true;
                if (els.edLoadStatus) els.edLoadStatus.hidden = true;
                if (els.edConflictBanner) els.edConflictBanner.hidden = true;
            });
        }
        var cancelHandlers = [els.edCancel, els.edCancel2];
        for (var i = 0; i < cancelHandlers.length; i++) {
            if (cancelHandlers[i]) {
                cancelHandlers[i].addEventListener('click', function () { hideEditForm(); });
            }
        }
        if (els.edSaveBtn) {
            els.edSaveBtn.addEventListener('click', saveEdit);
        }
        // Stage 7B — conflict resolution handlers.
        if (els.edConflictReload) {
            els.edConflictReload.addEventListener('click', reloadFromRemote);
        }
        if (els.edConflictKeep) {
            els.edConflictKeep.addEventListener('click', keepLocalEdits);
        }
        // Stage 8 — delete handlers.
        if (els.edDeleteBtn) {
            els.edDeleteBtn.addEventListener('click', openDeleteModal);
        }
        if (els.edDeleteConfirmInput) {
            els.edDeleteConfirmInput.addEventListener('input', checkDeleteConfirm);
        }
        if (els.edDeleteConfirmBtn) {
            els.edDeleteConfirmBtn.addEventListener('click', executeDelete);
        }
        // Modal close handlers (backdrop click + cancel button).
        var modalCloseBtns = els.edDeleteModal
            ? els.edDeleteModal.querySelectorAll('[data-modal-close]') : [];
        for (var mc = 0; mc < modalCloseBtns.length; mc++) {
            modalCloseBtns[mc].addEventListener('click', closeDeleteModal);
        }
        // Mark dirty on any input change.
        var dirtyEls = [els.edTitle, els.edDate, els.edCategories, els.edTags, els.edBody];
        for (var j = 0; j < dirtyEls.length; j++) {
            if (dirtyEls[j]) dirtyEls[j].addEventListener('input', markEditDirty);
        }
        var dirtyChecks = [els.edDraft, els.edMath];
        for (var k = 0; k < dirtyChecks.length; k++) {
            if (dirtyChecks[k]) dirtyChecks[k].addEventListener('change', markEditDirty);
        }
        // Preview tab.
        if (els.edTabEdit) {
            els.edTabEdit.addEventListener('click', function () { setEditActiveTab('edit'); });
        }
        if (els.edTabPreview) {
            els.edTabPreview.addEventListener('click', function () {
                setEditActiveTab('preview');
                renderEditPreview();
            });
        }
        if (els.edBody) {
            // See wireMarkdownEditor for the rationale: always render on
            // input. Desktop side-by-side layout never sets
            // data-active === 'preview', so a guard here would skip rendering.
            var debouncedRender = U.debounce(renderEditPreview, 220);
            els.edBody.addEventListener('input', debouncedRender);
        }
        setEditActiveTab('edit');
        updateEditCdnStatus();
    }

    /* ============================================
       Stage 5 — New article flow
       ============================================ */

    function showNewArticleForm() {
        state.formVisible = true;
        state.formDirty = false;
        state.formSubmitting = false;
        if (els.newArticleForm) els.newArticleForm.hidden = false;
        // Pre-fill date with today (local timezone).
        if (els.naDate && !els.naDate.value) {
            els.naDate.value = M.formatLocalDate(new Date());
        }
        updatePathPreview();
        if (els.naTitle) els.naTitle.focus();
    }

    function hideNewArticleForm() {
        var newPending = state.pendingUploads.filter(function (p) { return p.formMode === 'new'; }).length;
        var msg = '当前编辑内容尚未保存，确定关闭吗？';
        if (newPending > 0) {
            msg = '当前编辑内容与 ' + newPending + ' 张待上传图片尚未保存，确定关闭吗？';
        }
        if ((state.formDirty || newPending > 0) && !window.confirm(msg)) {
            return;
        }
        // Drop only "new"-mode pending uploads (keep edit ones intact).
        state.pendingUploads = state.pendingUploads.filter(function (p) {
            if (p.formMode === 'new' && p.previewUrl) {
                try { URL.revokeObjectURL(p.previewUrl); } catch (e) { /* ignore */ }
                return false;
            }
            return true;
        });
        state.formVisible = false;
        state.formDirty = false;
        if (els.newArticleForm) els.newArticleForm.hidden = true;
        clearFormErrors();
        renderPendingList('new');
    }

    function resetForm() {
        if (els.naTitle) els.naTitle.value = '';
        if (els.naDate) els.naDate.value = M.formatLocalDate(new Date());
        if (els.naFilename) els.naFilename.value = 'index.md';
        if (els.naCategories) els.naCategories.value = '';
        if (els.naTags) els.naTags.value = '';
        if (els.naDraft) els.naDraft.checked = true;
        if (els.naMath) els.naMath.checked = false;
        if (els.naBody) els.naBody.value = '';
        state.formDirty = false;
        clearFormErrors();
        updatePathPreview();
    }

    function clearFormErrors() {
        if (els.naTitleError) { els.naTitleError.textContent = ''; els.naTitleError.classList.remove('error'); }
        if (els.naDateError) { els.naDateError.textContent = ''; els.naDateError.classList.remove('error'); }
        if (els.naFilenameError) { els.naFilenameError.textContent = ''; els.naFilenameError.classList.remove('error'); }
        if (els.naErrorBanner) els.naErrorBanner.hidden = true;
    }

    function setFormFieldError(field, message) {
        var el = null;
        if (field === 'title') el = els.naTitleError;
        else if (field === 'date') el = els.naDateError;
        else if (field === 'filename') el = els.naFilenameError;
        if (el) {
            el.textContent = message;
            el.classList.add('error');
        }
    }

    function setFormBanner(message) {
        if (!els.naErrorBanner) return;
        if (message) {
            els.naErrorBanner.textContent = message;
            els.naErrorBanner.hidden = false;
        } else {
            els.naErrorBanner.hidden = true;
        }
    }

    function updatePathPreview() {
        if (!els.naPathPreview) return;
        var dateStr = (els.naDate && els.naDate.value) || M.formatLocalDate(new Date());
        var filename = (els.naFilename && els.naFilename.value) || 'index.md';
        els.naPathPreview.textContent = M.buildArticlePath(dateStr, filename) || '—';
    }

    function markDirty() {
        if (!state.formSubmitting) {
            state.formDirty = true;
        }
    }

    function collectFormData() {
        return {
            title: (els.naTitle && els.naTitle.value || '').trim(),
            date: (els.naDate && els.naDate.value) || '',
            filename: ((els.naFilename && els.naFilename.value) || 'index.md').trim(),
            categories: M.parseCategoriesInput(els.naCategories && els.naCategories.value || ''),
            tags: M.parseTagsInput(els.naTags && els.naTags.value || ''),
            draft: !!(els.naDraft && els.naDraft.checked),
            math: !!(els.naMath && els.naMath.checked),
            body: (els.naBody && els.naBody.value) || ''
        };
    }

    function setSubmitting(submitting) {
        state.formSubmitting = submitting;
        if (els.naSaveDraft) els.naSaveDraft.disabled = submitting;
        if (els.naPublish) els.naPublish.disabled = submitting;
        if (els.naCancel) els.naCancel.disabled = submitting;
        if (els.naCancel2) els.naCancel2.disabled = submitting;
        if (els.naTitle) els.naTitle.readOnly = submitting;
        if (els.naDate) els.naDate.readOnly = submitting;
        if (els.naFilename) els.naFilename.readOnly = submitting;
        if (els.naCategories) els.naCategories.readOnly = submitting;
        if (els.naTags) els.naTags.readOnly = submitting;
        if (els.naBody) els.naBody.readOnly = submitting;
        if (els.naDraft) els.naDraft.disabled = submitting;
        if (els.naMath) els.naMath.disabled = submitting;
        if (els.newArticleBtn) els.newArticleBtn.disabled = submitting;
    }

    /**
     * Submit new article (draft or publish).
     * Flow:
     *   1. Validate form
     *   2. Build path + content
     *   3. Conflict detection (getFile → expect 404)
     *   4. createFile
     *   5. On success: refresh article list (second API call), close form, toast
     */
    function submitNewArticle(publishMode) {
        if (state.formSubmitting) return;
        clearFormErrors();
        var formData = collectFormData();

        // Filename validation (separate from validateForm so the error maps to the filename field).
        var fnValidation = M.validateArticleFilename(formData.filename);
        if (!fnValidation.ok) {
            setFormFieldError('filename', fnValidation.error);
            return;
        }
        formData.filename = fnValidation.normalized;

        var validation = M.validateForm(formData);
        if (!validation.ok) {
            if (validation.errors.title) setFormFieldError('title', validation.errors.title);
            if (validation.errors.date) setFormFieldError('date', validation.errors.date);
            if (validation.errors.categories) setFormBanner(validation.errors.categories);
            if (validation.errors.tags) setFormBanner(validation.errors.tags);
            return;
        }

        var path = M.buildArticlePath(formData.date, formData.filename);
        if (!path) {
            setFormFieldError('date', '无法生成路径');
            return;
        }

        // Force draft/publish mode based on button.
        formData.draft = !publishMode;

        var content = M.generateFrontMatter(formData);
        var commitMsg = M.sanitizeTitleForCommit(formData.title, publishMode ? 'post:' : 'post: draft');

        setSubmitting(true);
        setFormBanner(null);

        // Step 1: conflict detection.
        API.getFile(state.token, path).then(function () {
            // 200 — file already exists.
            throw new API.AdminError('CONFLICT', '该文章路径已经存在，请修改文件名或日期');
        }).catch(function (err) {
            // NOT_FOUND is the EXPECTED outcome for a brand-new article —
            // the contents API returns 404 when the path does not exist.
            // Treat it as a non-error: do not call handleApiError, do not
            // surface a toast, do not clear the token. Just dispatch the
            // create path (with or without pending image uploads).
            if (err && err.code === 'NOT_FOUND') {
                // Good — no conflict.
                // Stage 9B — dispatch based on pending uploads.
                if (state.pendingUploads.length > 0) {
                    return submitNewArticleWithImages(path, content, commitMsg);
                }
                return API.createFile(state.token, path, content, commitMsg);
            }
            // Real error (auth/network/etc): surface it and propagate.
            handleApiError(err);
            throw err;
        }).then(function (result) {
            // Success.
            state.formDirty = false;
            var shortSha = (result.commitSha || '').slice(0, 7);
            var htmlUrl = result.htmlUrl || '';
            var action = publishMode ? '发布' : '草稿已保存';
            var message =
                '✓ ' + action + '：' + path +
                '\nCommit：' + shortSha;
            U.toast(message, 'success', 6000);
            if (htmlUrl) {
                window.open(htmlUrl, '_blank', 'noopener,noreferrer');
            }
            resetForm();
            hideNewArticleForm();
            loadArticlesFresh(); // Refresh list to include the new file (bypass CDN cache)
        }).catch(function (err) {
            handleApiError(err);
            setFormBanner(formatError(err));
            // Re-enable form on failure.
        }).then(function () {
            setSubmitting(false);
        });
    }

    /**
     * Stage 9B — New article with images via Git Data API.
     * Single atomic commit containing: article.md + all new image blobs.
     * For a brand new article, there is no existing remote target to conflict with;
     * we only need to ensure no two pending uploads produce the same name.
     */
    function submitNewArticleWithImages(path, content, commitMsg) {
        var pending = state.pendingUploads.filter(function (p) { return p.formMode === 'new'; });

        // Total size cap.
        var totalBytes = 0;
        for (var i = 0; i < pending.length; i++) totalBytes += pending[i].size || 0;
        if (totalBytes > 20 * 1024 * 1024) {
            setSubmitting(false);
            setFormBanner('本次图片总大小超过 20MB，请分次保存。');
            return Promise.reject(new API.AdminError('VALIDATION', '图片总大小超过 20MB'));
        }

        // Re-verify each pending file.
        for (var j = 0; j < pending.length; j++) {
            var v = window.ImageUpload.validateImage(pending[j].file);
            if (!v.ok) {
                setSubmitting(false);
                setFormBanner('图片校验失败：' + pending[j].originalName + ' — ' + v.error);
                return Promise.reject(new API.AdminError('VALIDATION', v.error));
            }
        }

        // Resolve final names (no remote to conflict with, but pending queue itself
        // may have same-name entries from 9A's dedup — already handled there).
        var remotePaths = new Set();
        var finalNames = resolveFinalPendingNames(pending, remotePaths);

        // Re-validate references in body (new article body = collected form data body).
        var refCheck = checkPendingReferences(content);
        if (!refCheck.ok) {
            setSubmitting(false);
            var orphanNames = refCheck.orphans.map(function (o) { return o.name; }).join(', ');
            setFormBanner('检测到待上传图片未被当前文章引用：' + orphanNames + '。请移除或重新插入。');
            return Promise.reject(new API.AdminError('VALIDATION', '存在未被引用的图片'));
        }

        // Update body if any rename happened.
        var finalRaw = content;
        var anyRenamed = false;
        for (var k = 0; k < finalNames.length; k++) {
            if (finalNames[k].finalSafeName !== finalNames[k].originalSafeName) {
                anyRenamed = true;
                break;
            }
        }
        if (anyRenamed) {
            finalRaw = updateBodyReferencesForFinalNames(content, pending, finalNames);
        }

        // Build changes array: article.md + each image blob.
        var changes = [{
            path: path,
            type: 'text',
            content: finalRaw
        }];
        for (var n = 0; n < pending.length; n++) {
            var p = pending[n];
            var fn = null;
            for (var q = 0; q < finalNames.length; q++) {
                if (finalNames[q].id === p.id) { fn = finalNames[q]; break; }
            }
            if (!fn) continue;
            changes.push({
                path: fn.finalTargetPath,
                type: 'image',
                file: p.file
            });
        }

        // Get current main HEAD as base.
        return API.getBranch(state.token).then(function (branch) {
            return API.getCommit(state.token, branch.commitSha).then(function (commit) {
                return API.commitChanges(state.token, {
                    baseCommitSha: commit.sha,
                    changes: changes,
                    message: commitMsg
                });
            });
        }).then(function (result) {
            // Success.
            state.formDirty = false;
            // Revoke object URLs and clear pending uploads.
            for (var r = state.pendingUploads.length - 1; r >= 0; r--) {
                if (state.pendingUploads[r].formMode === 'new' &&
                    state.pendingUploads[r].previewUrl) {
                    try { URL.revokeObjectURL(state.pendingUploads[r].previewUrl); } catch (e) { /* ignore */ }
                }
            }
            state.pendingUploads = state.pendingUploads.filter(function (p) {
                return p.formMode !== 'new';
            });
            var shortSha = result.commitSha.slice(0, 7);
            U.toast('✓ 已发布（含 ' + pending.length + ' 张图片，Commit ' + shortSha + '）', 'success', 6000);
            resetForm();
            hideNewArticleForm();
            loadArticlesFresh(); // Refresh tree to include the new article + images (bypass CDN cache)
        });
    }

    function wireNewArticle() {
        if (els.newArticleBtn) {
            els.newArticleBtn.addEventListener('click', function () {
                if (state.formVisible) {
                    hideNewArticleForm();
                } else {
                    showNewArticleForm();
                }
            });
        }
        var cancelHandlers = [els.naCancel, els.naCancel2];
        for (var i = 0; i < cancelHandlers.length; i++) {
            if (cancelHandlers[i]) {
                cancelHandlers[i].addEventListener('click', function () {
                    hideNewArticleForm();
                });
            }
        }
        if (els.naDate) {
            els.naDate.addEventListener('input', function () {
                updatePathPreview();
                markDirty();
            });
        }
        if (els.naFilename) {
            els.naFilename.addEventListener('input', function () {
                updatePathPreview();
                markDirty();
            });
        }
        // Mark dirty on any input change.
        var dirtyEls = [els.naTitle, els.naCategories, els.naTags, els.naBody];
        for (var j = 0; j < dirtyEls.length; j++) {
            if (dirtyEls[j]) dirtyEls[j].addEventListener('input', markDirty);
        }
        var dirtyChecks = [els.naDraft, els.naMath];
        for (var k = 0; k < dirtyChecks.length; k++) {
            if (dirtyChecks[k]) dirtyChecks[k].addEventListener('change', markDirty);
        }

        if (els.naSaveDraft) {
            els.naSaveDraft.addEventListener('click', function () {
                submitNewArticle(false);
            });
        }
        if (els.naPublish) {
            els.naPublish.addEventListener('click', function () {
                submitNewArticle(true);
            });
        }

        // Stage 6: Markdown editor + preview.
        wireMarkdownEditor();

        // beforeunload protection — when form dirty OR pending uploads exist.
        window.addEventListener('beforeunload', function (e) {
            var hasPending = state.pendingUploads && state.pendingUploads.length > 0;
            if ((state.formDirty || hasPending) && !state.formSubmitting) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
            return undefined;
        });
    }

    /* ============================================
       Stage 9A — Image upload (local pending queue)
       ============================================ */

    function clearPendingUploads() {
        for (var i = 0; i < state.pendingUploads.length; i++) {
            if (state.pendingUploads[i].previewUrl) {
                try { URL.revokeObjectURL(state.pendingUploads[i].previewUrl); } catch (e) { /* ignore */ }
            }
        }
        state.pendingUploads = [];
    }

    /**
     * Stage 9B — Resolve final safe names for pending uploads, avoiding
     * conflicts with the remote tree AND with each other.
     * Returns [{ id, originalSafeName, finalSafeName, finalTargetPath }].
     */
    function resolveFinalPendingNames(pendingList, remotePathSet) {
        var taken = new Set(remotePathSet);
        var result = [];
        function pathTaken(p) {
            return taken.has(p);
        }
        for (var i = 0; i < pendingList.length; i++) {
            var p = pendingList[i];
            var baseSafe = p.safeName;
            var candidate = baseSafe;
            var candidatePath = p.targetPath; // initially (before rename)
            var counter = 0;
            while (pathTaken(candidatePath) || result.some(function (r) {
                return r.finalTargetPath === candidatePath;
            })) {
                counter++;
                var dotIdx = baseSafe.lastIndexOf('.');
                var stem = dotIdx > 0 ? baseSafe.substring(0, dotIdx) : baseSafe;
                var ext = dotIdx > 0 ? baseSafe.substring(dotIdx) : '';
                candidate = stem + '-' + counter + ext;
                candidatePath = p.targetPath.replace(p.safeName, candidate);
            }
            result.push({
                id: p.id,
                originalSafeName: p.safeName,
                finalSafeName: candidate,
                finalTargetPath: candidatePath
            });
            taken.add(candidatePath);
        }
        return result;
    }

    /**
     * Stage 9B — Update body Markdown references to match final safe names.
     * Each pending has a unique `markdown` (the literal text 9A inserted).
     * Process in REVERSE order so that later replacements don't shift
     * earlier insertion positions. The alt text is preserved from
     * the original markdown (i.e., the user's chosen caption is NOT changed
     * when we have to rename the file to avoid a remote conflict).
     * If not found, the user has deleted the reference; the upload is skipped.
     */
    function updateBodyReferencesForFinalNames(body, pendingList, finalNames) {
        var result = body;
        for (var i = pendingList.length - 1; i >= 0; i--) {
            var p = pendingList[i];
            var fn = null;
            for (var j = 0; j < finalNames.length; j++) {
                if (finalNames[j].id === p.id) { fn = finalNames[j]; break; }
            }
            if (!fn) continue;
            if (fn.finalSafeName === p.safeName) continue; // no change
            // Extract the original alt text from the original markdown insertion.
            // Format: ![alt](index.assets/<safeName>)
            var altMatch = p.markdown.match(/^!\[([^\]]*)\]\(index\.assets\/[^\)]+\)$/);
            var alt = altMatch ? altMatch[1] : fn.finalSafeName.replace(/\.[^.]+$/, '');
            var newMd = '![' + alt + '](index.assets/' + fn.finalSafeName + ')';
            var oldMd = p.markdown;
            var idx = result.indexOf(oldMd);
            if (idx >= 0) {
                result = result.substring(0, idx) + newMd + result.substring(idx + oldMd.length);
            }
            // If not found, the user has deleted the image; the upload
            // caller's "consistency check" will skip this pending.
        }
        return result;
    }

    /**
     * Stage 9B — Compute total bytes across all pending uploads.
     */
    function totalPendingSize() {
        var s = 0;
        for (var i = 0; i < state.pendingUploads.length; i++) {
            s += state.pendingUploads[i].size || 0;
        }
        return s;
    }

    /**
     * Stage 9B — Verify every pending's target is referenced in the body.
     * Returns { ok: true } or { ok: false, orphans: [{id, name}] }.
     */
    function checkPendingReferences(body) {
        var orphans = [];
        for (var i = 0; i < state.pendingUploads.length; i++) {
            var p = state.pendingUploads[i];
            var ref = 'index.assets/' + p.safeName;
            if (body.indexOf(ref) < 0) {
                orphans.push({ id: p.id, name: p.safeName });
            }
        }
        return orphans.length === 0 ? { ok: true } : { ok: false, orphans: orphans };
    }

    function pendingExistsByName(safeName, formMode) {
        for (var i = 0; i < state.pendingUploads.length; i++) {
            if (state.pendingUploads[i].formMode === formMode &&
                state.pendingUploads[i].safeName === safeName) {
                return true;
            }
        }
        return false;
    }

    function pendingExistsById(id) {
        for (var i = 0; i < state.pendingUploads.length; i++) {
            if (state.pendingUploads[i].id === id) return i;
        }
        return -1;
    }

    function addPendingUpload(file, formMode, articlePathOrFilename) {
        var IU = window.ImageUpload;
        var validation = IU.validateImage(file);
        if (!validation.ok) {
            showImageError(formMode, validation.error);
            return null;
        }
        // Determine target directory.
        var isBundle = false;
        if (formMode === 'edit' && state.edit) {
            isBundle = !!state.edit.isBundle;
        } else if (formMode === 'new') {
            // For new article, allow upload only if filename === 'index.md'
            // (which we treat as a Page Bundle by convention).
            isBundle = (articlePathOrFilename === 'index.md');
        }
        if (!isBundle) {
            showImageError(formMode, '当前文章不是标准 Page Bundle（index.md + index.assets/），暂不支持图片上传。');
            return null;
        }

        // Sanitize + dedup filename.
        var baseSafe = IU.sanitizeFilename(file.name);
        var existing = [];
        for (var i = 0; i < state.pendingUploads.length; i++) {
            if (state.pendingUploads[i].formMode === formMode) {
                existing.push(state.pendingUploads[i].safeName);
            }
        }
        var safeName = IU.generateUniqueName(baseSafe, existing);

        // Compute target path.
        var targetPath;
        if (formMode === 'edit' && state.edit) {
            targetPath = IU.computeTargetPath(state.edit.path, safeName);
        } else {
            // New: we know the date dir but the article hasn't been created yet.
            // Use the path that WILL be created.
            var d = (els.naDate && els.naDate.value) || IU.formatLocalDate(new Date());
            var dir = 'content/posts/' + d.substring(0, 4) + '/' + d.substring(5, 7) + '/' + d.substring(8, 10);
            targetPath = dir + '/index.assets/' + safeName;
        }

        // Create preview URL.
        var previewUrl;
        try { previewUrl = URL.createObjectURL(file); }
        catch (e) { showImageError(formMode, '无法创建预览：' + e.message); return null; }

        var pending = {
            id: 'pu_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8),
            file: file,
            originalName: file.name,
            safeName: safeName,
            type: file.type,
            size: file.size,
            previewUrl: previewUrl,
            status: 'pending',
            targetPath: targetPath,
            formMode: formMode
        };
        state.pendingUploads.push(pending);
        hideImageError(formMode);
        renderPendingList(formMode);
        return pending;
    }

    function removePendingUpload(id) {
        var idx = pendingExistsById(id);
        if (idx < 0) return;
        var p = state.pendingUploads[idx];
        if (p.previewUrl) {
            try { URL.revokeObjectURL(p.previewUrl); } catch (e) { /* ignore */ }
        }
        state.pendingUploads.splice(idx, 1);
        renderPendingList(p.formMode);
    }

    function showImageError(formMode, message) {
        var el = formMode === 'new' ? els.naImageError : els.edImageError;
        if (!el) return;
        el.textContent = message;
        el.hidden = false;
    }

    function hideImageError(formMode) {
        var el = formMode === 'new' ? els.naImageError : els.edImageError;
        if (!el) return;
        el.hidden = true;
        el.textContent = '';
    }

    function formatBytes(n) {
        if (!n || n < 1024) return (n || 0) + ' B';
        if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
        return (n / 1024 / 1024).toFixed(2) + ' MB';
    }

    function renderPendingList(formMode) {
        var itemsEl, listEl, countEl;
        if (formMode === 'new') {
            itemsEl = els.naPendingItems;
            listEl = els.naPendingList;
            countEl = els.naPendingCount;
        } else {
            itemsEl = els.edPendingItems;
            listEl = els.edPendingList;
            countEl = els.edPendingCount;
        }
        if (!itemsEl) return;
        var pending = state.pendingUploads.filter(function (p) { return p.formMode === formMode; });
        if (countEl) countEl.textContent = String(pending.length);
        if (listEl) listEl.hidden = pending.length === 0;
        itemsEl.innerHTML = '';
        for (var i = 0; i < pending.length; i++) {
            var p = pending[i];
            var node = document.createElement('div');
            node.className = 'pending-item';
            var img = document.createElement('img');
            img.src = p.previewUrl;
            img.alt = p.safeName;
            var nameDiv = document.createElement('div');
            nameDiv.className = 'pending-item-name';
            nameDiv.textContent = p.safeName;
            var metaDiv = document.createElement('div');
            metaDiv.className = 'pending-item-meta';
            metaDiv.textContent = formatBytes(p.size) + ' · 等待保存';
            var removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'pending-item-remove';
            removeBtn.textContent = '×';
            removeBtn.title = '从队列移除';
            removeBtn.setAttribute('aria-label', '移除 ' + p.safeName);
            (function (id) {
                removeBtn.addEventListener('click', function () { removePendingUpload(id); });
            })(p.id);
            node.appendChild(removeBtn);
            node.appendChild(img);
            node.appendChild(nameDiv);
            node.appendChild(metaDiv);
            itemsEl.appendChild(node);
        }
    }

    function handleImageFiles(formMode, files, textarea, articlePathOrFilename) {
        if (!files || !files.length) return;
        hideImageError(formMode);
        for (var i = 0; i < files.length; i++) {
            var pending = addPendingUpload(files[i], formMode, articlePathOrFilename);
            if (pending && textarea) {
                // Insert Markdown at cursor and leave cursor after.
                var IU = window.ImageUpload;
                var md = IU.buildMarkdown(pending.safeName);
                IU.insertAtCursor(textarea, md);
            }
        }
    }

    function setupImageSection(formMode) {
        var btn, input, textarea, articlePathOrFilename;
        if (formMode === 'new') {
            btn = els.naInsertImageBtn;
            input = els.naImageInput;
            textarea = els.naBody;
            articlePathOrFilename = els.naFilename ? els.naFilename.value : 'index.md';
        } else {
            btn = els.edInsertImageBtn;
            input = els.edImageInput;
            textarea = els.edBody;
            articlePathOrFilename = null; // not used; state.edit.isBundle is used
        }
        if (!btn || !input) return;

        btn.addEventListener('click', function () { input.click(); });
        input.addEventListener('change', function () {
            handleImageFiles(formMode, input.files, textarea, articlePathOrFilename);
            input.value = ''; // allow re-selecting the same file
        });

        // Drag-and-drop onto textarea.
        if (textarea) {
            ['dragenter', 'dragover'].forEach(function (ev) {
                textarea.addEventListener(ev, function (e) {
                    if (e.dataTransfer && e.dataTransfer.types &&
                        Array.prototype.indexOf.call(e.dataTransfer.types, 'Files') >= 0) {
                        e.preventDefault();
                        textarea.classList.add('is-drop-target');
                    }
                });
            });
            ['dragleave', 'dragend'].forEach(function (ev) {
                textarea.addEventListener(ev, function (e) {
                    textarea.classList.remove('is-drop-target');
                });
            });
            textarea.addEventListener('drop', function (e) {
                textarea.classList.remove('is-drop-target');
                if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
                    e.preventDefault();
                    handleImageFiles(formMode, e.dataTransfer.files, textarea, articlePathOrFilename);
                }
            });
        }
    }

    function resetPendingForNewArticle() {
        clearPendingUploads();
        hideImageError('new');
        renderPendingList('new');
    }

    function resetPendingForEdit() {
        // Keep pending uploads that belong to edit, drop those that belong to new.
        state.pendingUploads = state.pendingUploads.filter(function (p) {
            if (p.formMode === 'edit' && p.previewUrl) {
                try { URL.revokeObjectURL(p.previewUrl); } catch (e) { /* ignore */ }
                return false;
            }
            return true;
        });
        hideImageError('edit');
        renderPendingList('edit');
    }

    /* ============================================
       Stage 6 — Markdown editor + live preview
       ============================================ */
    function renderPreview() {
        if (!els.markdownPreview) return;
        var MP = window.MarkdownPreview;
        if (!MP || !MP.isReady()) {
            // CDN failed — show source as plain text, do NOT block editing.
            els.markdownPreview.innerHTML = '<p class="muted small">预览组件未加载（marked.js CDN 不可达）。编辑器仍可正常使用，最终效果以 Hugo 构建为准。</p>';
            return;
        }
        var bodyValue = els.naBody ? els.naBody.value : '';
        var processed = bodyValue;
        for (var i = 0; i < state.pendingUploads.length; i++) {
            var p = state.pendingUploads[i];
            if (p.formMode !== 'new') continue;
            var ref = 'index.assets/' + p.safeName;
            var placeholder = 'PENDINGIMG:' + i;
            processed = processed.split(ref).join(placeholder);
        }
        var result = MP.render(processed);
        if (!result.ok) {
            els.markdownPreview.innerHTML = '<p class="adm-math-error">' +
                (result.error ? result.error.replace(/</g, '&lt;') : '渲染失败') + '</p>';
            return;
        }
        result.html = renderPreviewWithPending(result.html, 'new');
        els.markdownPreview.innerHTML = result.html;
    }

    function setEditorActiveTab(tab) {
        if (!els.editorSplit) return;
        if (tab !== 'edit' && tab !== 'preview') tab = 'edit';
        els.editorSplit.setAttribute('data-active', tab);
        if (els.editorTabEdit) {
            els.editorTabEdit.classList.toggle('active', tab === 'edit');
        }
        if (els.editorTabPreview) {
            els.editorTabPreview.classList.toggle('active', tab === 'preview');
        }
        if (tab === 'preview') {
            renderPreview();
        }
    }

    function updateCdnStatus() {
        if (!els.editorCdnStatus) return;
        var parts = [];
        if (typeof window.marked === 'undefined') parts.push('marked');
        if (typeof window.katex === 'undefined') parts.push('katex');
        if (typeof window.hljs === 'undefined') parts.push('highlight');
        if (parts.length === 0) {
            els.editorCdnStatus.textContent = '预览就绪';
        } else {
            els.editorCdnStatus.textContent = 'CDN 未加载：' + parts.join(', ');
        }
    }

    function wireMarkdownEditor() {
        // Render preview when body changes (debounced).
        // The previous guard `active === 'preview'` skipped rendering on
        // desktop, where the editor and preview panes are side-by-side and
        // `data-active` stays at its default value ('edit'). Always render:
        // CSS decides whether the preview pane is visible; markdown.js
        // returns early if window.marked is not loaded.
        if (els.naBody) {
            var debouncedRender = U.debounce(renderPreview, 220);
            els.naBody.addEventListener('input', debouncedRender);
        }
        // Tab switching.
        if (els.editorTabEdit) {
            els.editorTabEdit.addEventListener('click', function () { setEditorActiveTab('edit'); });
        }
        if (els.editorTabPreview) {
            els.editorTabPreview.addEventListener('click', function () {
                setEditorActiveTab('preview');
                renderPreview();
            });
        }
        // Default: desktop shows both (CSS); mobile defaults to edit.
        setEditorActiveTab('edit');
        updateCdnStatus();
    }

    /* ============================================
       Theme init
       ============================================ */
    function initTheme() {
        var adminTheme;
        try { adminTheme = window.localStorage.getItem('admin-theme'); }
        catch (e) { adminTheme = null; }
        if (adminTheme !== 'dark' && adminTheme !== 'light') {
            adminTheme = U.readBlogThemePref();
        }
        U.applyAdminTheme(adminTheme);
    }

    /**
     * On load, if we have a stored token, verify it.
     * If verification fails (e.g. expired), clear state.
     */
    function init() {
        initTheme();
        if (state.token) {
            state.status = 'connecting';
            renderStatus();
            renderActions();
            runVerification(state.token).then(function (conn) {
                state.connection = conn;
                state.status = 'connected';
                renderStatus();
                renderActions();
                renderConnectionInfo();
                syncInput();
                loadArticles();
            }).catch(function () {
                U.storage.remove(STORAGE_KEY_TOKEN);
                state.token = '';
                state.status = 'disconnected';
                state.connection = null;
                renderStatus();
                renderActions();
                renderConnectionInfo();
            });
        } else {
            renderStatus();
            renderActions();
            renderConnectionInfo();
        }
        wireVisibility();
        wireConnect();
        wireClear();
        wireDisconnect();
        wireTokenInput();
        wireTheme();
        wireArticleList();
        wireNewArticle();
        wireEditForm();
        setupImageSection('new');
        setupImageSection('edit');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();