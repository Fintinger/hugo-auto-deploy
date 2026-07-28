---
title: Vue在页面直接展示模板语法{{xx}}
date: 2022-04-07
categories:
- 前端
tags:
- Vue.js
---

用vue.js写成的页面中，可能出现由于外部请求导致的页面展示阻塞现象，进而导致模板语法`{{xxx}}`直接展示在页面上，这其实跟页面加载的流程有关，整个页面加载的流程是：

<span style="color:#f22f27">解析html结构 -> 加载外部脚本和样式表文件 -> 解析并执行脚本代码 -> 构造HTML DOM模型 -> 加载图片等外部文件 -> 页面加载完毕</span>

所以，当HTML加载的时候，就会把`{{}} `当成文本加载出来，只有当vue初始化完成后，才会把{{}}解析成vue的语法。

遇到这种情况有以下几种解决方案：

1. 方案一(不推荐)：在head里面加入引入vue的script标签

   如果把引入vue的script放到head里面，那页面就不会出现`{{}}`，因为在body之前，vue就已经引入进并且加载完成了。

   <hr>

2. 方案二：`v-text|v-html`

   使用`v-text`插入文字，使用`v-html`插入HTML结构，替换原本使用的模板语法`{{xxx}}`

   <hr>

3. 方案三：`template`

   使用`<template>`标签包裹要渲染的HTML结构，那么只有vue解析时才会展示出该结构

   <hr>

4. 方案四：`v-cloak`指令 + CSS样式

   标签上的`v-cloak`属性在被vue解析到时会自动去掉，那么我们可以利用[CSS的属性选择器](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Attribute_selectors)，给有`v-cloak`属性的元素设置`display:none`样式，那么，在加载HTML时自然不会显示`{{xxx}}`，而在vue解析时又会显示出来，问题得以解决！
   
   

