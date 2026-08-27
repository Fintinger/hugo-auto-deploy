/**文章阅读进度条：页面顶部随滚动推进（仅文章详情页）
 * @author Archai
 */
{
    const article = document.querySelector('article.post-single')
    if (article) {
        const bar = document.createElement('div')
        bar.className = 'reading-progress'
        document.body.appendChild(bar)

        const update = () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop
            const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
            bar.style.width = (docHeight > 0 ? (scrollTop / docHeight) * 100 : 0) + '%'
        }

        window.addEventListener('scroll', update, { passive: true })
        window.addEventListener('resize', update)
        update()
    }
}
