/**移动端/桌面端响应式行为：移动端抽屉导航 + 桌面端背景视频加载
 * 独立 IIFE 包裹，内部判空 + try-catch，避免单点故障连坐全站。
 * 依赖：getSetResource.js 挂到 window 的 getSetAllResource / setBgvidCallBack。
 */
(function () {
    'use strict';

    var body = document.body;
    var menuList = document.querySelectorAll('#menu>li');
    var socialIconsInProfile = document.querySelector('.main>.profile>.profile_inner>div.social-icons');
    var socialIconsInMenu = document.querySelector('.header>.nav>.social-icons-container');
    var main = document.querySelector('main.main');
    var header = document.querySelector('body.mobile>.header');

    /** 判断是否为移动端 */
    function isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    /** 隐藏元素（判空，避免 null.classList 崩溃） */
    function hideEl(el) {
        if (el && el.classList && !el.classList.contains('hidden')) {
            el.classList.add('hidden')
        }
    }

    /** 显示元素（判空） */
    function showEl(el) {
        if (el && el.classList && el.classList.contains('hidden')) {
            el.classList.remove('hidden')
        }
    }

    function showHeader(h) {
        if (!h) return;
        showEl(h);
        if (h.classList.contains('animate__slideOutLeft')) {
            h.classList.replace('animate__slideOutLeft', 'animate__slideInLeft')
        } else if (h.classList.contains('animate__slideInDown')) {
            h.classList.replace('animate__slideInDown', 'animate__slideInLeft')
        }
    }

    function hideHeader(h) {
        if (!h) return;
        if (h.classList.contains('animate__slideInLeft')) {
            h.classList.replace('animate__slideInLeft', 'animate__slideOutLeft')
        } else if (h.classList.contains('animate__slideInDown')) {
            h.classList.replace('animate__slideInDown', 'animate__slideOutLeft')
        }
    }

    if (isMobile()) {
        try {
            //移动端显示social-icons
            showEl(socialIconsInMenu)
            //初始化body
            body.classList.add('mobile')
            var mHeader = document.querySelector('body.mobile>.header');
            //初始隐藏目录
            hideEl(mHeader)
            //Body中追加目录显示按钮
            var showBtn = document.createElement('i')
            showBtn.className = 'menu-bar btn-show fab fa-bars'
            showBtn.addEventListener('click', function (e) {
                showHeader(mHeader)
                e.stopPropagation()
            })
            body.appendChild(showBtn)
            //Menu中追加目录隐藏按钮
            var hideBtn = document.createElement('i')
            hideBtn.className = 'menu-bar btn-hidden fab fa-chevron-left'
            hideBtn.addEventListener('click', function (e) {
                hideHeader(mHeader);
                e.stopPropagation()
            })
            if (mHeader) {
                var nav = mHeader.querySelector('.nav');
                if (nav) nav.appendChild(hideBtn)
            }
            //让menu中的符号消失并且大写
            menuList.forEach(function (el) {
                var span = el.querySelector('span')
                if (span) {
                    span.innerText = span.innerText.replace(/[^a-z|A-Z]+/, '').toUpperCase()
                }
            })

            //social icons控制
            if (socialIconsInProfile && socialIconsInMenu) {
                hideEl(socialIconsInProfile);
                showEl(socialIconsInMenu);
            }
        } catch (e) {
            console.error('[mobile.js] mobile init error:', e)
        }
    } else {
        try {
            //Blog在非移动端显示背景视频
            if (typeof window.getSetAllResource === 'function') {
                window.getSetAllResource([
                    { url: '/videos/bg.webm', callBack: window.setBgvidCallBack },
                ])
            }
            //social icons控制
            hideEl(socialIconsInMenu);
        } catch (e) {
            console.error('[mobile.js] desktop init error:', e)
        }
    }
})();
