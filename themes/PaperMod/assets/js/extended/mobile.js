const body = document.body;

const menuList = document.querySelectorAll('#menu>li');
const socialIconsInProfile = document.querySelector('.main>.profile>.profile_inner>div.social-icons');
const socialIconsInMenu = document.querySelector('.header>.nav>div.social-icons');
const main = document.querySelector('main.main');
// const menuBar = `<i class="" aria-hidden="true"></i>`

//手机端简化首页动效
if (isMobile()) {
    //初始化body
    body.classList.add('mobile')
    const header = document.querySelector('body.mobile>.header');
    //初始隐藏目录
    hideEl(header);
    header.classList.replace('animate__slideInDown', 'animate__slideInLeft')
    //Body中追加目录显示按钮
    let showBtn = document.createElement('i')
    showBtn.className = 'menu-bar btn-show fab fa-bars'
    showBtn.addEventListener('click', (e) => {
        showEl(header);
        e.stopPropagation()
    })
    body.appendChild(showBtn)
    //Menu中追加目录隐藏按钮
    /*< i
    className = ""
    aria - hidden = "true" > < /i>*/
    let hideBtn=document.createElement('i')
    hideBtn.className='menu-bar btn-hidden fab fa-chevron-left'
    hideBtn.addEventListener('click', (e) => {
        hideEl(header);
        e.stopPropagation()
    })
    header.querySelector('.nav').appendChild(hideBtn)
    //让menu中的符号消失并且大写
    menuList.forEach(el => {
        let text = el.querySelector('span').innerText
        el.querySelector('span').innerText = text.replace(/[^a-z|A-Z]+/, '').toUpperCase()
    })

    //social icons控制
    if (socialIconsInProfile && socialIconsInMenu) {
        hideEl(socialIconsInProfile);
        showEl(socialIconsInMenu);
    }


    //headerMenu控制
    // clickToHideMenu([body, document.querySelector('h1')])

} else {
    //Blog在非移动端显示背景视频
    getSetAllResource([
        {url: 'https://jqf.oss-cn-beijing.aliyuncs.com/videos/7kgkoysahpw31.mp4', callBack: setBgvidCallBack},
    ])
    //social icons控制
    hideEl(socialIconsInMenu);
}

/**
 * 判断是否为移动端
 * @returns {boolean}
 */
function isMobile() {
    return /Android|iPhone|iPad|iPod|BlackBerry|webOS|Windows Phone|SymbianOS|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * 隐藏元素
 */
function hideEl(el) {
    el.classList.add('hidden')
}

/**
 * 显示元素
 */
function showEl(el) {
    el.classList.remove('hidden')
}

/**
 * 需要点击隐藏目录的元素
 * @param{Array}elList
 */
function clickToHideMenu(elList) {
    elList.forEach(el => {
        el.addEventListener('click', () => {
            hideEl(header);
        })
    })
}