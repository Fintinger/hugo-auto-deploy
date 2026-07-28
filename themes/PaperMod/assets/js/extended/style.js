//首页控制
if (document.getElementsByClassName("profile")[0]) {

    window.onload = function () {
        let profile = document.querySelector(".profile_inner")
        profile.style.display = "block"
        profile.style.animation = "profileOut  1s"
    }
    //隐藏竖向滚动条
    document.documentElement.style.overflowY = 'hidden'
    document.documentElement.style.overflowX = 'hidden'
    //body添加动画类
    document.body.classList.add('animate')
    //给header和main添加特殊class
    document.querySelector('header.header').classList.add('homepage')
    main.classList.add('homepage')
    //首页且是PC端删除主题切换按钮
    if (!isMobile()) {
        document.querySelector('.logo-switches').classList.add('hidden')
    }
} else {
    //body移除动画类
    document.body.classList.remove('animate')
}

//在文章列表控制
let articleList = document.getElementsByClassName("post-entry")
let articleFooterList = document.getElementsByClassName("entry-footer")
if (articleFooterList[0]) {
    // 设置最新和置顶文章
    setLatestAndPinnedArticles("newestArticle", "fa-arrow-circle-up");
    //为文章列表添加动画延迟class
    Array.from(articleList).forEach((el, ind) => {
        if(!el) return
        el.classList.add(`animate__delay-${ind * 2}00ms`)
    })
}

//只在文章详情页控制
if (document.getElementsByClassName("post-single")[0]) {
    //图片下面的alt添加
    document.querySelectorAll(".imgAlt").forEach(el => {
        el.innerHTML = el.previousElementSibling.children[0].attributes.alt.value;
    })
    //toc固定按钮控制
    const pinToc = document.querySelector("#pinToc>i");
    if (pinToc)
        pinToc.addEventListener("click", evt => {
            let toc = evt.target.parentElement.parentElement.parentElement.parentElement

            document.querySelector("details .details").classList.toggle("hidden")
            toc.classList.toggle('animate__fadeInRight')
            toc.classList.toggle('pinned')
        })
    //给post-tag染色
    printTags("post-tags")
}

//在标签页控制(/tags)
if (document.querySelector(".terms-tags")) {
    printTags("terms-tags")
}

/**
 * 给tags染色
 * @param{String} className 传入包裹tag的主元素的class
 */
function printTags(className) {
    if (!document.getElementsByClassName(className)[0]) return;
    let postTags = document.getElementsByClassName(className)[0]
    let artBoard = ["#FC427B", "#3B3B98", "#F97F51", "#55E6C1",
        "#1dd1a1", "#00a8ff", "#fbc531", "#4cd137", "#487eb0",
        "#e84118", "#353b48"]
    Array.from(postTags.children).forEach(el => {
        el.querySelector("a").style.background = artBoard[Math.round(Math.random() * (artBoard.length - 1))]
    })
}

/**
 * 设置最新和置顶文章
 * @param{String} newestClass
 * @param {String} pinnedClass
 */
function setLatestAndPinnedArticles(newestClass, pinnedClass) {
    // 新增这一行，非文章列表页直接退出，不再执行DOM操作
    if (!document.querySelector('.entry-footer')) return;
    //文章尾注时间
    let articleFooterList = document.getElementsByClassName("entry-footer")
    //最新文章时间（初始值设置为2000.1.1，不可能比这更早）
    let newestArticleTime = new Date('2000').getTime();
    //最新文章索引
    let newestArticleIndex = 0;
    //当前文章时间
    let articleTime = '';
    //现在时间，与现在时间作比较
    let nowTime = new Date();
    //时间比较规则
    let compareTimeMethod;

    //遍历：找出最新文章
    Array.from(articleFooterList).forEach((el, ind) => {
        if (!el) return;
        // 关键修复：判断是否存在第一个子元素，不存在直接跳过当前项
        const timeDom = el.children?.[0];
        if (!timeDom) return;

        articleTime = new Date(timeDom.getAttribute("title"));
        //同年同月且间隔不超过一天
        compareTimeMethod = articleTime.getFullYear() === nowTime.getFullYear() && articleTime.getMonth() === nowTime.getMonth() && nowTime.getDate() - articleTime.getDate() <= 1
        if (compareTimeMethod) {
            let tagElementI = el.parentElement.querySelector(".fab");
            if (tagElementI) {
                tagElementI.style.display = "inline-block";
                tagElementI.innerText = "New"
                tagElementI.setAttribute("title", "Newest")
                newestClass.split(" ").forEach(e => tagElementI.classList.add(e))
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
    Array.from(articleFooterList).forEach((el, index) => {
        if (!el) return;
        // 同样增加子元素判断
        const timeDom = el.children?.[0];
        if (!timeDom) return;

        articleTime = new Date(timeDom.getAttribute("title"));
        if (articleTime.getTime() < newestArticleTime && index < newestArticleIndex) {
            let tagElementI = el.parentElement.querySelector(".fab");
            if (tagElementI) {
                tagElementI.style.display = "inline-block";
                tagElementI.setAttribute("title", "Pinned")
                pinnedClass.split(" ").forEach(e => tagElementI.classList.add(e))
            }
        }
    })
}



