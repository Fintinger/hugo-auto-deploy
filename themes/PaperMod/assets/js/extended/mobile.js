//手机端简化首页动效
if (window.screen.width <= 640 && window.location.pathname === "/") {
    //profile删除hover效果
    document.querySelector(".profile_inner").style.opacity = 1;
    document.body.style.background = " url(\"https://picgo-jqf.oss-cn-beijing.aliyuncs.com/img/202204091921087.png\") no-repeat  center/cover fixed"
}
//Blog在移动端首页只展示图片，隐藏视频
if (window.screen.width > 640) {
    getSetAllResource([
        {url: 'https://jqf.oss-cn-beijing.aliyuncs.com/videos/7kgkoysahpw31.mp4', callBack: setBgvidCallBack},
    ])
}