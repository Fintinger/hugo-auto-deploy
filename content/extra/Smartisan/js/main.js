window.onload=function (ev) {
    var header=document.getElementById("header");
    var search=document.getElementById("search");
    var searchInfo=document.getElementById("inA");
    var ceiling=document.getElementById("ceiling");
    var playBox=document.getElementById("playBox");
    var plays=playBox.children;
    var clickDot=document.getElementById("clickDot");
    var lis=clickDot.children;
    var index=1;
    var allCom=document.getElementsByClassName("com");
    var prices=document.getElementsByClassName("price");
    var originalP=document.getElementById("originalP");
    var btns=document.getElementsByClassName("detail");
    var byReady=document.getElementsByClassName("buy-ready")[0];
    var pro3Images=document.getElementById("pro3Images").children;
    var pro3Is=document.getElementById("pro3Is").children;
    var packageImages=document.getElementById("packageImages").children;
    var packageIs=document.getElementById("packageIs").children;
    var pro3desc=document.getElementById("pro3desc");
    var packageDesc=document.getElementById("packageDesc");
    var ceilingLis=document.getElementById("ceilingLis");
    var ceilingItems=ceilingLis.getElementsByTagName("a");
    var tabItems=document.getElementsByClassName("tab-item");
    var tabItem=document.getElementsByClassName("tab-items")[0];
    /*处理输入框*/
    search.onfocus=function (ev1) {
        search.placeholder="请输入搜索的商品";
        searchInfo.style.display="none";
    };
    search.onblur=function (ev1) {
        if (!search.value){
            search.placeholder="";
            searchInfo.style.display="block";
        }
    };
    /*吸顶效果*/
    window.onscroll=function (ev1) {
        if (scroll().top>=65){
            ceiling.style.position="fixed";
            ceiling.style.top="0px";
        }else if (scroll().top<65){
            ceiling.style.position="";
            ceiling.style.top="";
        }
    };
   /*定义scroll函数*/
    function scroll() {
        if(!window.pageYOffset===null){//最新浏览器
            return{
                "top": window.pageYOffset,
                "left":window.pageXOffset
            }
        }else if (document.compatMode==="CSS1Compat"){//支持W3C
            return {
                "top":document.documentElement.scrollTop,
                "left":document.documentElement.scrollLeft
            }
        }else {             //怪异模式
            return {
                "top":document.body.scrollTop,
                "left":document.body.scrollLeft
            }}
    }
    /*tab选项卡*/
    for (var t=0;t<ceilingItems.length;t++){
        (function (ind) {
            ceilingItems[ind].onmouseover=function () {
                for (var i = 0; i < tabItems.length; i++) {
                    tabItems[i].classList.remove("active")
                }
                tabItems[ind].classList.add("active");
            }
        })(t);
        tabItem.onmouseleave=function () {
            for (var i = 0; i < tabItems.length; i++) {
                tabItems[i].classList.remove("active")
            }
        };
        header.onmouseenter=function () {
            for (var i = 0; i < tabItems.length; i++) {
                tabItems[i].classList.remove("active")
            }
        }
    }

    /*轮播图*/
    /*定义函数变量*/
    function play() {
        for (var i = 0; i < plays.length; i++) {
            plays[i].className="";
            lis[i].className="";
        }
        index<=plays.length-1?index++:index=1;
        plays[index-1].className="current";
        lis[index-1].className="current";
    }
    var speed=3000;
    /*********************/
   var playTimer= setInterval(play,speed);
    playBox.onmouseover=function (ev1) {
        clearInterval(playTimer);
    };
    playBox.onmouseout=function (ev1) {
        clearInterval(playTimer);
        playTimer=setInterval(play,speed)
    };
/*小点点击*/
    for (var i = 0; i < lis.length; i++) {
        (function (j) {
            lis[j].onclick=function () {
                for (var i = 0; i < plays.length; i++) {
                    plays[i].className="";
                    lis[i].className="";
                }
                plays[j].className="current";
                lis[j].className="current";
                index=j+1;
            }
        })(i)

    }
    /*广告栏*/
    /*鼠标移入事件*/
    for (var j = 0; j <allCom.length ; j++) {
        (function (ind) {
            allCom[ind].onmouseover=function () {
                prices[ind].style.opacity=0;
                if (ind===3){
                    originalP.style.opacity=0;
                }
                btns[ind].style.opacity=1;
                if (ind===1){
                    byReady.style.opacity=1;
                }
            };
            allCom[ind].onmouseout=function () {
                prices[ind].style.opacity=1;
                if (ind===3){
                    originalP.style.opacity=1;
                }
                btns[ind].style.opacity=0;
                if (ind===1){
                    byReady.style.opacity=0;
                }

            }
        })(j)
    }
    /*切换图片*/
for (var m=0;m<pro3Is.length;m++){
    (function (ind) {
        pro3Is[ind].onmouseover=function () {
            if (ind===0){
                pro3desc.innerText="精品配件 返厂特惠直降";
                pro3desc.style.color="#e04e4e"
            }else {
                pro3desc.innerText="高通骁龙™ 855Plus · 4800 万模范四摄 · Smartisan OS 7.0";
                pro3desc.style.color="#999"
            }

            pro3Images[0].style.display="none";
            pro3Images[1].style.display="none";
            pro3Images[2].style.display="none";
            pro3Images[ind].style.display="block";
        }
    })(m)
}
for (var n=0;n<packageIs.length;n++){
    (function (ind) {
        packageIs[ind].onmouseover=function () {
            if (ind===0){
                packageDesc.innerText="地平线8号, 返厂特惠直降";
                packageDesc.style.color="#e04e4e"
            }else {
                packageDesc.innerText="高通骁龙™ 855Plus · 4800 万模范四摄 · Smartisan OS 7.0";
                packageDesc.style.color="#999"
            }
            packageImages[0].style.display="none";
            packageImages[1].style.display="none";
            packageImages[2].style.display="none";
            packageImages[ind].style.display="block";
        }
    })(n)
}
};
