---
date: 2020-07-01
title: JavaScript瀑布流布局
tags:
  - Javascript
  - myFunction
categories:
  - 前端
---

# 什么是瀑布流？

一种图片在网页的布局方式，具体要求为：**从页面第二行开始，后续图片跟在页面中最矮的那张图片后面**

![瀑布流布局](https://s1.ax1x.com/2020/07/01/NTht0I.png)



# 用JavaScript怎么实现？

为此我将整个过程封装为一个函数。

```html
/*HTML部分*/
<head>
	<link rel="stylesheet" href="main.css">
</head>
<div id="box"></div>//container和img由js动态加入
<script src="jquery.min.js"></script>
<script src="loadFile.js"></script>
<script src="main.js"></script>
```

```css
/*CSS部分*/
/*首先清空默认样式*/
#box{
    position: relative;
}
.container{
    float: left;
}
.container>.pic{
    width: 200px;
}
.container>.pic>img{
    width: 100%;
}
```

```js
/*JS部分*/
/*loadFile.js(在window.onload之前执行，加载DOM树)*/	
$(function () {
    function addImg(imgNum,eleID) {
        let container
        for (let i = 1; i < imgNum; i++) {
            container=$("<div class='container'><div class='pic'><img src='images/"+i+".jpg' alt=''></div></div>")
            $(eleID).append(container)
        }
    }
    addImg(109,"#box");
})
/*******************************************/
/*main.js(在$(function(){})之前执行，DOM树加载完毕 )*/
window.onload=function () {
   let waterFall=function (eleID) {
        let boxWidth = 0, colo = 0, $egEle = $(eleID).children().eq(0), boxArr = [], heightArr = [], minHeight = 0,minHeightInd = 0
        /*1.父盒子居中*/
        /*1.1盒子宽度*/
        boxWidth = $egEle.outerWidth()
        /*1.2列数*/
        colo = parseInt($(window).width() / boxWidth)
        /*1.3实现居中*/
        $(eleID).css({
            // width: boxWidth * colo + "px",
            margin: "0 auto"
        })
        /*2.定位盒子*/
        /*2.1找出第一行盒子最矮的一个*/
        /*2.1.1 第一行盒子高度数列*/
        boxArr = $egEle.prevObject
        // console.log(boxArr);
        for (let i = 0; i < boxArr.length; i++) {
            if (i < colo) {//第一行盒子
                heightArr.push(boxArr.eq(i).outerHeight())
            } else {
                /*2.1.2 盒子中最矮的一个值及索引*/
                minHeight = Math.min.apply(null, heightArr)
                minHeightInd = heightArr.indexOf(minHeight)
                /*2.2定位后续盒子*/
                boxArr.eq(i).css({
                    position: "absolute",
                    top: minHeight + "px",
                    left: boxWidth * minHeightInd + "px"
                })
                /*2.3 高度数列更新*/
                heightArr[minHeightInd] += boxArr.eq(i).outerHeight()
            }
        }
    }

    /*执行*/
    waterFall("#box");
}
```



# 一些疑惑点

1. `container`之间无任何外边距，照片之间间距是由`container`的内边距造成的

2. 用js加载图片文件后，获取元素高度出现了异常(所有盒子高度为一个奇怪的值)，是因为**$(function(){})**与**window.onload=function(){}**的区别造成的
  
   之前将文件的加载和后续样式的更改js全部写到了`$(function(){})`中
   
   后面将loadFile.js写到`$(function(){})`，将main.js写到`window.onload=function(){}`就解决了
   
> **$(function(){})**与**window.onload=function(){}**的区别
   >
   > - `$(function(){})`就是`$(document).ready=function(){}`，是在加载DOM树的时候执行
   > - `window.onload=function(){}`则是在DOM树加载完成之后才执行
   > - `$(function(){})`比`window.onload=function(){}`先执行

3.为了代码的易用性以及可维护性，将父盒子`#box`的居中用js动态来完成

   对于块级元素来说，居中使用到的是`margin:0 auto`，但前提是**块级元素必须要有宽度**

   而这个块级元素`#box`的宽度是动态的，`Width = boxWidth * colo`,即宽度为`container`宽度乘以列数, `colo = parseInt($(window).width() / boxWidth)`,

4.除第一行的盒子之外，后续盒子全部用绝对定位来排列


4.1 怎么确定盒子在第一行？
	
拿到盒子数列`boxArr`！

利用到jQuery中的`prevObject`属性，

> jquery选择器在遍历的过程中都会找到一组元素（一个jQuery对象），然后jQuery会把这组元素推入到栈中，`prevObject`属性就指向这个对象栈中的前一个对象，通过这个属性就可以回溯到最初的DOM元素集，减少重复的查找和遍历操作

然后遍历boxArr，如果索引小于列数，即`index < colo`,则这些元素都属于第一行
​
	
4.2 后续盒子定位？
​	

拿到第一行盒子的高度数列组`heightArr`
​	

第一行之后的第一个盒子定位在`heightArr`中的最小值盒子之后


> `heightArr`最小值?
> `Math.min.apply(null,heightArr)`   ,
>

5.`heightArr`最小高度的更新☆


`heightArr[minHeightInd] += boxArr.eq(i).outerHeight()`

