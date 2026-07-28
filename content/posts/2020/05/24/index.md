---
date: 2020-05-24
title: 常用的一些html小问题
tags:
  - HTML
categories:
  - 前端
---
## 1. 网页出现横向滚动条？
```
<body style=`overflow:-Scroll;overflow-y:hidden >  </body>
```
*让横条没有：*
```
 <body style=`overflow:-Scroll;overflow-x:hidden> </body>
```
*两个都去掉？更简单了*
```
<body scroll="no" >  </body>
```
*火狐底部滚动条不显示：*
```
 html { overflow:-moz-scrollbars-vertical; }
```
## 2. 网页图标？
```
<link rel="shortcut icon " href="images/favicon.ico">
```
## 3. Height:100%失效？
```
<html style="height: 100%;">

        <body style="height: 100%;">

                  <div style="height: 100%;">

                          <p>        这样这个div的高度就会100%了      </p>

                 </div>

           </body>

</html>
```
## 4. 设置一个元素不可见？

*opacity 设为 0、将 visibility 设为 hidden、将 display 设为 none 或者将 position 设为 absolute*

***注意：***

*1> display=none元素消失，不占位置*

*2> opacity =0、 visibility =hidden只是视觉上不可见，其实还在那里占位置*

## 5.input无法输入？
![](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/1nSAZ*B78DPTEG5idIpYk3deCXgANSfusOc27uwWvtbht1AY*rXQHj67maLLPy*B6zFAIM0qX*950aqkK0bmOZ8F1c42GuXetWlvTrzxK1o!/b&bo=tgLRALYC0QACKQ0!&rf=viewer_4)

*==>    height:0;    (将包裹提示的div高度设置为0，让其不再遮挡即可)*

## 6.input标签显示手势？
```
input{
cursor:pointer;           
}  
 /* 鼠标移入按钮范围时出现手势 */*
```
## 7. JS中的一些语法

*1> 注意书写其中的  ""（引号） ！！！！* 
```
document.getElementById("btn");
```



*2>onclick,.onload...等事件都可以用这个，可以避免代码污染啥的（也不一定）*
```
.addEventListener('click',function f1() {}**
```


*3>可以给一个标签中加入另一个标签*
```
createElement('')***
```

## 8.addEventListener & onmouse×××的区别：
- onmouseover
![正常](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/1nSAZ*B78DPTEG5idIpYkwbv3rUZYzJz1ui9ouSJnYUv.XY519lpYDe1MSUcSpFZ3p85bI9e6bQtkGpI2ieN1YGj58LaGfkNZtOhQ*8Xexc!/b&bo=GQYsARkGLAECGT0!&rf=viewer_4)

```
<!--CSS部分-->
 *{margin: 0;padding: 0;border: none;}
        ##progress{width: 1000px;height: 20px;line-height: 20px;
            /*background-color: ##e8e8e8;*/
            margin: 100px auto;position: relative;
        }
        ##progress_bar{width: 900px;height: 100%;background-color: ##ccc;border-radius: 8px;
            position: relative;}
        ##progress_value{position: absolute;right: 30px;top: 0;}
        ##progress_bar_fg{width: 0;height: 100%;background-color: purple;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;}
        span{
            width: 10px;
            height: 30px;
            background-color: purple;
            position: absolute;
            left: 0;
            top: -5px;
            border-radius: 5px;
            cursor: pointer;
        }
<!--HTML部分-->
    <div id="progress">
        <div id="progress_bar">
            <div id="progress_bar_fg"></div>
            <span></span>
        </div>
        <div id="progress_value">0%</div>
    </div>
<!--JS部分-->
 window.onload = function () {
        // 1. 获取需要的标签
        var progress = document.getElementById("progress");
        var progress_bar = progress.children[0];
        var progress_bar_fg = progress_bar.children[0];
        var mask = progress_bar.children[1];
        var progress_value =  progress.children[1];

        // 2. 监听鼠标按下
        mask.onmousedown = function (event) {
            var e = event || window.event;

            // 2.1 获取初始位置
            var offsetLeft = event.clientX - mask.offsetLeft;

            // 2.2 监听鼠标的移动
            document.onmousemove = function (event) {
                var e = event || window.event;

                // 2.3 获取移动的位置
                var x = e.clientX - offsetLeft;

                // 边界值处理
                if(x < 0){
                    x = 0;
                }else if(x >= progress_bar.offsetWidth - mask.offsetWidth){
                    x = progress_bar.offsetWidth - mask.offsetWidth;
                }

                // 2.4 走起来
                mask.style.left = x + 'px';
                progress_bar_fg.style.width = x + 'px';
                progress_value.innerHTML = parseInt(x / (progress_bar.offsetWidth - mask.offsetWidth) * 100) + '%';

                return false;
            };

            // 2.5 监听鼠标抬起
            document.onmouseup = function () {
                document.onmousemove = null;
            }
        }
    }
```

- addEventListener

![出现BUG](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/1nSAZ*B78DPTEG5idIpYkw0qFWjdCLVjo0yOP2tk6YYs2O7N*IlnmdpYHipdXbNEstazeVKEpFoGEsIxs0xz00TkxlFh84TbXwoXob9TPuc!/b&bo=GQYsARkGLAECGT0!&rf=viewer_4)
```
<!--CSS部分-->
 *{margin: 0;padding: 0;border: none;}
        ##progress{width: 1000px;height: 20px;line-height: 20px;
            /*background-color: ##e8e8e8;*/
            margin: 100px auto;position: relative;
        }
        ##progress_bar{width: 900px;height: 100%;background-color: ##ccc;border-radius: 8px;
            position: relative;}
        ##progress_value{position: absolute;right: 30px;top: 0;}
        ##progress_bar_fg{width: 0;height: 100%;background-color: purple;
            border-top-left-radius: 8px;
            border-bottom-left-radius: 8px;}
        span{
            width: 10px;
            height: 30px;
            background-color: purple;
            position: absolute;
            left: 0;
            top: -5px;
            border-radius: 5px;
            cursor: pointer;
        }
<!--HTML部分-->
<div id="progress">
    <div id="progress_bar">
        <div id="progress_bar_fg"></div>
        <span></span>
    </div>
    <div id="progress_value">0%</div>
</div>
<!--JS部分-->
//  addEventListener();
    //  removeEventListener();
    window.addEventListener('load', function (ev) {
        // 1. 获取标签
        var progress = document.getElementById('progress');
        var progressBar = progress.children[0];
        var progressBarFg= progressBar.children[0];
        var mask= progressBar.children[1];
        var progressValue= progress.children[1];

        // 2. 监听鼠标在mask上面的按下
        mask.addEventListener('mousedown', function (evt) {
            var e = evt || window.event;
            // 2.1 获取按下的坐标
            var pointX = e.pageX - mask.offsetLeft;
            // 2.2 监听鼠标的移动
            document.addEventListener('mousemove', function (ev1) {
                var e = ev1 || window.event;
                // 2.3 获取水平方向移动的距离
                var x = e.pageX - pointX;

                if(x < 0){
                    x = 0;
                }else if(x > progressBar.offsetWidth - mask.offsetWidth){
                    x =  progressBar.offsetWidth - mask.offsetWidth
                }

                // 2.4 走起来
                mask.style.left = x + 'px';
                progressBarFg.style.width = x + 'px';
                progressValue.innerText = parseInt(x / (progressBar.offsetWidth - mask.offsetWidth)* 100) + '%';
                return false;
            }, false)
        }, false);

        // 3. 监听鼠标松开
        /* document.onmouseup = function (ev1) {
             document.addEventListener('mousemove', null);
         };*/


        document.addEventListener('mouseup', function (ev1) {
            document.removeEventListener('mousemove', null, false);
        }, false);



    });
```

## 9.手机端开发
务必写上
```html
<!-简写meta:vp 按Tab即可--->
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```