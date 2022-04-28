---
date: 2019-12-23
title: CSS揭秘一书中的知识
tags:
  - CSS
categories:
  - 前端

---

## 1.backgrouond简写
  -  在background简写属性中指定background-sizing时，需要提供一个background-position值，而且要使用/作为分隔。
 ```css
background: [background-color] [background-image] [background-repeat] [background-attachment] [background-position] / [ background-size] [background-origin] [background-clip];
```

-----P13-----
## 2.background-clip
**规定背景的绘制区域：**![](https://upload-images.jianshu.io/upload_images/14911395-4ebd260b354f17dd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
得到一个白色背景并且有白色边框的盒子：
```css
border:10px solid hsla(0,0,100%,.5);
background:white;
background-clip:padding-box
```
![](https://upload-images.jianshu.io/upload_images/14911395-487315fd74eeadcd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

 **若不设置background-clip，背景会延伸至边框，边框的透明无法显示**

------P18-------
## 3.双重边框
- box-shadow
![](https://upload-images.jianshu.io/upload_images/14911395-0e08160fd3115f5e.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```
background:orange;
box-shadow:0 0 010px #655 , 0 0 0 15px deeppink; /*可以加任意层数边框*/
```

- outline
```css
 width:180px;
  height:90px;
  margin:30px auto;
  text-align:center; 
  padding:10px;
  background:##655;
  outline: ##fff dashed 1px;
  outline-offset: -15px;  /*设置outline向内缩进*/
  border-radius:8px;
```

![得到简单的缝边效果](https://upload-images.jianshu.io/upload_images/14911395-d2f82fae991b64ac.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
**注意：** outline可能会产生不贴合border-radius圆角的情况
![](https://upload-images.jianshu.io/upload_images/14911395-81cf8c8bb2f03b0d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

----P20----
## 4.box-shadow

- 只给下方设置阴影，（扩张半径为负的模糊半径）:![](https://upload-images.jianshu.io/upload_images/14911395-fafd034ec1d6ac9d.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```css
box-shadow: 0 5px 4px -4px black;
```

- 临边投影，(扩张半径为负的模糊半径的一半):![](https://upload-images.jianshu.io/upload_images/14911395-72a613e0e91b95ce.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
```css
  box-shadow: 3px 3px 6px -3px black;
```

----P88----

## 5.linear-gradient
> 取值 : (deg,color1 [%/num],color2[%/num]...)

1>角度：表示渐变的方向
![](https://upload-images.jianshu.io/upload_images/14911395-52ffdd40b83ed1bd.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)
>0°表示从下到上，也可以是特殊的 : to  top/bottom/left/right

2>颜色
3> 颜色后数字或取值
>表示指某个颜色值距离起点的开始位置 : 50%,20px......

**注意：如果某个色标的位置值比整个列表中在它之前的色标的位置值都要小，则该色标的位置值会被设置为它前面所有色标位置值的最大值。**
```css
.box{
  width:200px;
  height:150px;
  background-color:#58a;
  background:linear-gradient(-135deg,red 2em,#58a 0);
}
```

**结果**![](https://upload-images.jianshu.io/upload_images/14911395-0577c120832d0804.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

## 6.设置文字段落效果(hyphens属性)
```css
text-align:justify;
hyphens:auto;
```
