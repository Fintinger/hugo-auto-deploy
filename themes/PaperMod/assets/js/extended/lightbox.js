/**图片灯箱：点击文章内图片全屏预览（跳过位于链接内的图片）
 * @author Archai
 */
{
    const overlay = document.createElement('div')
    overlay.className = 'lightbox'
    const lightboxImg = document.createElement('img')
    overlay.appendChild(lightboxImg)
    document.body.appendChild(overlay)

    const open = (src, alt) => {
        lightboxImg.src = src
        lightboxImg.alt = alt || ''
        overlay.classList.add('open')
    }
    const close = () => overlay.classList.remove('open')

    document.querySelectorAll('.post-content img').forEach((el) => {
        if (el.closest('a')) return
        el.classList.add('lightboxable')
        el.addEventListener('click', () => {
            open(el.currentSrc || el.src, el.alt)
        })
    })

    overlay.addEventListener('click', close)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close()
    })
}
