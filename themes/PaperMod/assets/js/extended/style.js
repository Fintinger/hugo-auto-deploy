/**首页控制 / 文章列表 newest/pinned 标记 / 标签染色
 * 独立 IIFE 包裹 + try-catch，避免单点故障连坐全站。
 * 原依赖 mobile.js 声明的全局 main / isMobile，现内部自行获取，去除跨文件隐式依赖。
 */
(function () {
    'use strict';

    function isMobile() {
        return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }

    var main = document.querySelector('main.main');

    //首页控制
    try {
        if (document.getElementsByClassName("profile")[0]) {
            window.onload = function () {
                var profile = document.querySelector(".profile_inner")
                if (profile) {
                    profile.style.display = "block"
                    profile.style.animation = "profileOut  1s"
                }
            }
            //隐藏竖向滚动条
            document.documentElement.style.overflowY = 'hidden'
            document.documentElement.style.overflowX = 'hidden'
            //body添加动画类
            document.body.classList.add('animate')
            //给header和main添加特殊class
            var header = document.querySelector('header.header')
            if (header) header.classList.add('homepage')
            if (main) main.classList.add('homepage')
            //首页且是PC端删除主题切换按钮
            if (!isMobile()) {
                var logoSwitches = document.querySelector('.logo-switches')
                if (logoSwitches) logoSwitches.classList.add('hidden')
            }
        } else {
            //body移除动画类
            document.body.classList.remove('animate')
        }
    } catch (e) {
        console.error('[style.js] homepage control error:', e)
    }

    //在文章列表控制
    try {
        var articleList = document.getElementsByClassName("post-entry")
        var articleFooterList = document.getElementsByClassName("entry-footer")
        if (articleFooterList[0]) {
            // 设置最新和置顶文章
            setLatestAndPinnedArticles("newestArticle", "fa-arrow-circle-up");
            //为文章列表添加动画延迟class
            Array.from(articleList).forEach(function (el, ind) {
                if (!el) return
                el.classList.add('animate__delay-' + (ind * 2) + '00ms')
            })
        }
    } catch (e) {
        console.error('[style.js] article list control error:', e)
    }

    //只在文章详情页控制
    try {
        if (document.getElementsByClassName("post-single")[0]) {
            //给post-tag染色
            printTags("post-tags")
        }
    } catch (e) {
        console.error('[style.js] post detail control error:', e)
    }

    //在标签页控制(/tags)
    try {
        if (document.querySelector(".terms-tags")) {
            printTags("terms-tags")
        }
    } catch (e) {
        console.error('[style.js] terms tags control error:', e)
    }

    /**
     * 给tags染色
     * @param{String} className 传入包裹tag的主元素的class
     */
    function printTags(className) {
        if (!document.getElementsByClassName(className)[0]) return;
        var postTags = document.getElementsByClassName(className)[0]
        var artBoard = ["#FC427B", "#3B3B98", "#F97F51", "#55E6C1",
            "#1dd1a1", "#00a8ff", "#fbc531", "#4cd137", "#487eb0",
            "#e84118", "#353b48"]
        Array.from(postTags.children).forEach(function (el) {
            var a = el.querySelector("a")
            if (a) {
                a.style.background = artBoard[Math.round(Math.random() * (artBoard.length - 1))]
            }
        })
    }

    /**
     * 设置最新和置顶文章
     * @param{String} newestClass
     * @param {String} pinnedClass
     */
    function setLatestAndPinnedArticles(newestClass, pinnedClass) {
        // 非文章列表页直接退出，不再执行DOM操作
        if (!document.querySelector('.entry-footer')) return;
        //文章尾注时间
        var articleFooterList = document.getElementsByClassName("entry-footer")
        //最新文章时间（初始值设置为2000.1.1，不可能比这更早）
        var newestArticleTime = new Date('2000').getTime();
        //最新文章索引
        var newestArticleIndex = 0;
        //当前文章时间
        var articleTime = '';
        //现在时间，与现在时间作比较
        var nowTime = new Date();
        //时间比较规则
        var compareTimeMethod;

        //遍历：找出最新文章
        Array.from(articleFooterList).forEach(function (el, ind) {
            if (!el) return;
            // 关键修复：判断是否存在第一个子元素，不存在直接跳过当前项
            var timeDom = el.children && el.children[0];
            if (!timeDom) return;

            articleTime = new Date(timeDom.getAttribute("title"));
            //同年同月且间隔不超过一天
            compareTimeMethod = articleTime.getFullYear() === nowTime.getFullYear() && articleTime.getMonth() === nowTime.getMonth() && nowTime.getDate() - articleTime.getDate() <= 1
            if (compareTimeMethod) {
                var tagElementI = el.parentElement.querySelector(".fab");
                if (tagElementI) {
                    tagElementI.style.display = "inline-block";
                    tagElementI.innerText = "New"
                    tagElementI.setAttribute("title", "Newest")
                    newestClass.split(" ").forEach(function (e) { tagElementI.classList.add(e) })
                }
            }
            /*获取最新发布文章的时间戳和索引*/
            //getTime()越大代表越新
            if (articleTime.getTime() > newestArticleTime) {
                newestArticleTime = articleTime.getTime()
                newestArticleIndex = ind;
            }
        })

        //再遍历，找出置顶文章
        Array.from(articleFooterList).forEach(function (el, index) {
            if (!el) return;
            // 同样增加子元素判断
            var timeDom = el.children && el.children[0];
            if (!timeDom) return;

            articleTime = new Date(timeDom.getAttribute("title"));
            if (articleTime.getTime() < newestArticleTime && index < newestArticleIndex) {
                var tagElementI = el.parentElement.querySelector(".fab");
                if (tagElementI) {
                    tagElementI.style.display = "inline-block";
                    tagElementI.setAttribute("title", "Pinned")
                    pinnedClass.split(" ").forEach(function (e) { tagElementI.classList.add(e) })
                }
            }
        })
    }
})();
