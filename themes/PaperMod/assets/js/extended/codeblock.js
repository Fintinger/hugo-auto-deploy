(function () {
    'use strict';

    // 复制文本：优先 Clipboard API，回退 execCommand（兼容非 HTTPS / 旧浏览器）
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            return navigator.clipboard.writeText(text);
        }
        return new Promise(function (resolve, reject) {
            try {
                var ta = document.createElement('textarea');
                ta.value = text;
                ta.style.position = 'fixed';
                ta.style.top = '-9999px';
                ta.style.opacity = '0';
                document.body.appendChild(ta);
                ta.focus();
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
                resolve();
            } catch (err) {
                reject(err);
            }
        });
    }

    function buildCodeBlocks() {
        var blocks = document.querySelectorAll('.post-content .highlight');
        for (var i = 0; i < blocks.length; i++) {
            var hl = blocks[i];
            var code = hl.querySelector('code');
            if (!code) {
                continue;
            }

            // 语言标签：从 code.language-xxx 读取（lineNos 开启时 code 仅在第二列，textContent 不含行号）
            var lang = '';
            var cls = code.className || '';
            var m = cls.match(/language-([\w-]+)/);
            if (m) {
                lang = m[1];
            }

            var header = document.createElement('div');
            header.className = 'highlight-header';

            var label = document.createElement('span');
            label.className = 'highlight-lang';
            label.textContent = lang ? lang : 'text';
            header.appendChild(label);

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'copy-code';
            btn.textContent = '复制';

            (function (button, source) {
                button.addEventListener('click', function () {
                    copyText(source).then(function () {
                        button.textContent = '已复制';
                        setTimeout(function () { button.textContent = '复制'; }, 2000);
                    }).catch(function () {
                        button.textContent = '复制失败';
                        setTimeout(function () { button.textContent = '复制'; }, 2000);
                    });
                });
            })(btn, code.textContent);

            header.appendChild(btn);
            hl.insertBefore(header, hl.firstChild);

            // 长代码块：容器可滚动时标记 .is-clipped 以显示底部渐隐提示
            if (hl.scrollHeight > hl.clientHeight + 1) {
                hl.classList.add('is-clipped');
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', buildCodeBlocks);
    } else {
        buildCodeBlocks();
    }
})();
