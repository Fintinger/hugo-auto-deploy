---
title: Vue路由地址改变，页面却不刷新？
date: 2022-04-16
categories:
- 前端
tags:
- Vue.js
- VueRouter
---

>在网易云项目时，在歌手详情页点击相似的歌手跳转到`query`参数不同的另一个歌手详情页时，出现地址栏query参数变化，而页面却没有实时更新的现象，经过搜索找到以下解决方案：

## 方案一：`watch`监听路由

```js
watch: {
 // 方法1 //监听路由是否变化
  '$route' (to, from) {
   if(to.query.id !== from.query.id){
            this.id = to.query.id;
            this.init();//重新加载数据
        }
  }
}
//方法 2  设置路径变化时的处理函数
watch: {
'$route': {
    handler: 'init',
    immediate: true
  }
}
```

## 方案二：给`router-view`添加一个不同的`key`

给`router-view`添加一个不同的`key`，这样即使是公用组件，只要url变化了，就一定会重新创建这个组件。

```html
<router-view :key="$route.fullpath"></router-view>	
```

## 小洁🙎🏼‍♀️

抽象问题描述：同一path的页面跳转时路由参数变化，但是组件没有对应的更新。

实际原因：主要是因为获取参数写在了`created`或者`mounted`路由钩子函数中，路由参数变化的时候，这个生命周期不会重新执行。

