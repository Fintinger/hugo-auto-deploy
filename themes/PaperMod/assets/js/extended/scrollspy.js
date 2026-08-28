/**文章目录滚动高亮（ScrollSpy）：随滚动高亮当前章节，固定模式下目录内部跟随滚动
 * @author Archai
 */
(function () {
    const tocInner = document.querySelector('.toc .inner')
    const content = document.querySelector('article.post-single .post-content')
    if (!tocInner || !content) return

    const links = Array.from(tocInner.querySelectorAll('a[href^="#"]'))
    if (!links.length) return

    /* toc 链接 href 可能被 URL 编码（中文标题 id），统一解码后再匹配 */
    const getId = (href) => {
        const raw = href.slice(1)
        try {
            return decodeURIComponent(raw)
        } catch (e) {
            return raw
        }
    }

    const headings = links
        .map(a => document.getElementById(getId(a.getAttribute('href'))))
        .filter(Boolean)
    if (!headings.length) return

    const setActive = (id) => {
        links.forEach(a => {
            a.classList.toggle('active', getId(a.getAttribute('href')) === id)
        })
        const panel = tocInner.closest('.toc-panel')
        const active = links.find(a => a.classList.contains('active'))
        if (active && panel && panel.scrollHeight > panel.clientHeight) {
            active.scrollIntoView({ block: 'nearest' })
        }
    }

    const observer = new IntersectionObserver((entries) => {
        const visible = entries.filter(e => e.isIntersecting)
        if (visible.length) {
            const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
            setActive(top.target.id)
        }
    }, { rootMargin: '-80px 0px -70% 0px', threshold: 0 })

    headings.forEach(h => observer.observe(h))
})();
