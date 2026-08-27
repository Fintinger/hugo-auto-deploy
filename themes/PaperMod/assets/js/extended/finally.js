/**这里所有的js都会被最后执行，可以用于覆盖主题默认存在的一些JS设定
 * @author Archai
 * @website https://blog.archai.site
 */
{
    const aList = document.querySelectorAll('.header a')

//去除a中的样式
    aList.forEach(el => {
        el.removeAttribute("style")
        let span = el.querySelector("span")
        if (span) {
            span.removeAttribute('style')
        }
    })

//文章表格响应式：为 .post-content 下的表格包裹滚动容器
    document.querySelectorAll('.post-content table').forEach((table) => {
        if (table.closest('.highlight') || table.parentElement.classList.contains('article-table-wrapper')) {
            return
        }
        const wrapper = document.createElement('div')
        wrapper.className = 'article-table-wrapper'
        table.parentNode.insertBefore(wrapper, table)
        wrapper.appendChild(table)
    })
}
