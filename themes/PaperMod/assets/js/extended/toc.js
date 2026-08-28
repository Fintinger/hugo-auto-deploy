/**文章目录（TOC）交互：展开/收起、图钉锁定、关闭、点击跳转后收起
 * @author Archai
 */
(function () {
    const toc = document.querySelector('.toc')
    if (!toc) return

    const toggle = toc.querySelector('.toc-toggle')
    const panel = toc.querySelector('.toc-panel')
    const pin = toc.querySelector('.toc-pin')
    const close = toc.querySelector('.toc-close')

    const open = () => {
        toc.classList.add('open')
        if (toggle) toggle.setAttribute('aria-expanded', 'true')
    }

    const closePanel = () => {
        if (toc.classList.contains('locked')) return
        toc.classList.remove('open')
        if (toggle) toggle.setAttribute('aria-expanded', 'false')
    }

    /* 展开/收起 */
    if (toggle) {
        toggle.addEventListener('click', () => {
            if (toc.classList.contains('open')) closePanel()
            else open()
        })
    }

    /* 图钉锁定：锁定后持续展开，再点取消 */
    if (pin) {
        pin.addEventListener('click', (e) => {
            e.stopPropagation()
            const locked = toc.classList.toggle('locked')
            pin.setAttribute('aria-pressed', String(locked))
            if (locked) open()
        })
    }

    /* 关闭按钮：收起并解除锁定 */
    if (close) {
        close.addEventListener('click', () => {
            toc.classList.remove('locked')
            if (pin) pin.setAttribute('aria-pressed', 'false')
            toc.classList.remove('open')
            if (toggle) toggle.setAttribute('aria-expanded', 'false')
        })
    }

    /* 点击目录项跳转后收起（移动端体验更好；桌面端保留面板由用户关闭） */
    if (panel) {
        panel.querySelectorAll('a[href^="#"]').forEach((a) => {
            a.addEventListener('click', () => {
                if (window.innerWidth <= 768) closePanel()
            })
        })
    }

    /* 未锁定且面板展开时，页面滚动自动收起（锁定后不收起） */
    window.addEventListener('scroll', () => {
        if (!toc.classList.contains('open') || toc.classList.contains('locked')) return
        closePanel()
    }, { passive: true })
})();
