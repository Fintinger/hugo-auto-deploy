---
date: 2020-03-21
title: 常用的一些html代码
tags:
  - HTML
categories:
  - 前端

---
## 1. 获取网页logo
 [京东](https://www.jd.com/) :  www.jd.com
>后面加 "/favicon.ico"即可

 [京东logo](https://www.jd.com/favicon.ico) : www.jd.com/favicon.ico

## 2. webstorm网页logo简易写法
 - **```link:favicon``` 按Tab键**

## 3.meta标签
- 为搜索引擎提供的关键字列表( name="keywords")：
>各关键词间用英文逗号“,”隔开。META的通常用处是指定搜索引擎用来提高搜索质量的关键词。

`<meta name="keywords" content="牙疼怎么办，智齿是什么，拔牙多少钱，矫正多少钱，九院医生，北大口腔，瑞尔口腔，拜耳口腔">`

- 用来告诉搜索引擎你的网站主要内容(name="description")：

`<meta name="description" content="有牙齿问题,找河马牙医,儿童口腔，全国儿童口腔在线咨询，牙疼怎么办，拔牙多少钱，矫正多少钱，种植牙，有牙齿问题">`
	
- 优先以webkit内核渲染页面("renderer")：

`<meta name="renderer" content="webkit" />`


## 4.复合选择器

`div#main{ color:green}`
>表示选中div中id为main的元素

## 5.标签居中
1)  水平居中
**行内标签/行内-块级标签:**
`text-align:center`

**块级标签:**

`margin:0 auto`

2)垂直居中
- 行内标签/行内-块级标签:
    - 设置行高为盒子高度`line-hight:50px;` 
    - 图片加文字时:`vertical-align:middle;`

- 块级标签:
> `设置“子绝父相”`  ==> `top，left设置为50%` ==> `margin-left和nargin-top设置为负的盒子对应宽高的一半`

```
     .father{
        background-color:red;
        height:150px;
        width:150px;
        position:relative;
            }
    .child{
        background-color:yellow;
        height:50px;
        width:50px;
        position:absolute;
        left:50%;
         top:50%;
        margin-left:-25px;
        margin-top:-25px;
            }
```

## 6.text-transform属性
`capitalize`	文本中的每个单词以大写字母开头。

`uppercase`	定义仅有大写字母。

`lowercase`	定义无大写字母，仅有小写字母。

## 7.overflow属性
`hidden`	内容会被修剪，并且其余内容是不可见的。

`scroll`	内容会被修剪，但是浏览器会显示滚动条以便查看其余的内容。

`auto`  	如果内容被修剪，则浏览器会显示滚动条以便查看其余的内容。

## 8.box-sizing属性
`border-box` 设置边框和内边距盒子不会被撑大，即“向内挤”

## 9. 高度塌陷的解决(+设置margin父元素被顶下来)
>父元素的高度一旦塌陷, 所有标准流中元素的位置将会上移，导致整个页面的布局混乱

**方案1：开启父元素的BFC**
 一般都是使用`overflow:hidden`来开启BFC，即父元素设置`overflow:hidden`

**方案2: 在塌陷的父元素的最后添加一个空白的div，然后对该div进行清除浮动**
 父元素之后加`<div style="clear:both"></div>`

**方案3: 使用after伪类(注意设置content)，向父元素后添加一个块元素，并对其清除浮动     √** 
 添加CSS
 ```
.clearfix:after{
	content:"";
	display:block;
	clear:both;
}
```
>子元素和父元素相邻的垂直外边距会发生重叠，子元素的外边距会传递给父元素，即**给子元素设置margin父元素会被顶下来**
解决方案：` .clearfix::before{ content: ''; display: table; clear: both;}`

最终，把要解决这两个问题的元素加`class="clearfix" `,然后设置

``` 
.clearfix::before,.clearfix::after{
content: ''; 
display: table; 
clear: both; 
}
```

>这是一个多功能的,  既可以解决高度塌陷，又可以确保父元素和子元素的垂直外边距不会重叠

## 10.双飞翼布局和圣杯布局
![主要区别](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/1nSAZ*B78DPTEG5idIpYk7GrftVAZ3Lz7W0g7jZrnaZg9H0R661NsqEG4G0gr6GOg8njf8X0UrLxUrf0k74RX1bL52mzzOyfsLWC4HS8UHI!/b&bo=4QV9A.EFfQMCSW0!&rf=viewer_4)

- 双飞翼

```
<!--CSS部分-->
        *{
            margin: 0;
            padding: 0;
        }
        .container{
            min-width: 400px;
            background-color: #e91e63;
            height: 200px;
        }
        .main{
            float: left;
            width: 100%;
            height: 200px;
            background-color: oldlace;
        }
        .left,.right{
            /**************/
            text-align: center;
            line-height: 200px;
            font-size: 100px;
            color: #fff;
            /*************/
            height: 200px;
            width: 200px;
            background-color: lightgreen;
            float: left;
        }
        .left{
            margin-left: -100%;
        }
        .right{
            margin-left: -200px;
        }
        .main-content{
            margin: 0 200px;
        }
<!--HTML部分-->
<div class="container">
    <div class="main">
        <div class="main-content"></div>
    </div>
    <div class="left">←</div>
    <div class="right">→</div>
</div>
```

- 圣杯

```
<!--CSS部分-->
        *{
            margin: 0;
            padding: 0;
        }
        .container{
            min-width: 400px;
            background-color: #e91e63;
            height: 200px;

            padding: 0 200px;
        }
        .main{
            float: left;
            width: 100%;
            height: 200px;
            background-color: oldlace;
        }
        .left,.right{
            /**************/
            text-align: center;
            line-height: 200px;
            font-size: 100px;
            color: #fff;
            /*************/
            float: left;
            height: 200px;
            width: 200px;
            background-color: lightgreen;

        }
        .left{
            margin-left: -100%;
            position: relative;
            left: -200px;
        }
        .right{
            margin-left: -200px;
            position: relative;
            right: -200px;
        }
<!--HTML部分-->
<div class="container">
    <div class="main"></div>
    <div class="left">←</div>
    <div class="right">→</div>
</div>

```

## 11.溢出文字显示为省略号

```
overflow: hidden;
text-overflow:ellipsis; 
white-space: nowrap;
```

