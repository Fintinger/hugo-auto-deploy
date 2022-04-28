---
title: Vue中的数据监视原理
date: 2022-03-21
categories:
 - 前端
tags:
 - Vue.js
---


## 1.vue会监视data中所有层次的数据.

vue对于配置在data中的所有对象都会以key值作为目标进行监视，不论多少层，都会递归地为每一个key配置getter和setter(通过`Object.defineProperty()`)。

> 相关阅读 [MDN关于defineProperty的说明](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty)

## 2.如何监测**对象**中的数据?

  通过setter实现监视,且要在new Vue时就传入要监测的数据，即在data中提前配置。

  (1).对象中后追加的属性,Vue默认不做响应式处理

直接通过修改vm._data或者vm来添加key，并不会配置getter和setter，因此不会做响应式

  (2).如需给后添加的属性做响应式,请使用如下API:
       `Vue.set(target,key/index,value)`或`vm.$set(target,key/index,value)`（可以同时修改数组和对象）

​	 **特别注意: Vue.set()和vm.$set()不能直接给vm或vm的根数据对象(vm._data)添加属性!!!**

## 3.如何监测**数组**中的数据?

   在**数组中直接通过索引的方式修改数组并不会引起Vue的响应**，那么要如何做呢？Vue通过[包裹数组更新元素的方法](https://vuejs.bootcss.com/guide/list.html#%E6%95%B0%E7%BB%84%E6%9B%B4%E6%96%B0%E6%A3%80%E6%B5%8B)(对原数组方法进行修改)实现,本质就是做了两件事:

   (1). 调用原生对应的方法对数组进行更新.

   (2). 重新解析模板,进而更新页面.

就包裹了下面的七种数组方法：

- `push()`
- `pop()`
- `shift()`
- `unshift()`
- `splice()`
- `sort()`
- `reverse()`

也就是说，通过上面七种方法修改数组，会让Vue做出响应。

例如想要修改数组中索引为0的位置的数据，可以通过 `vm.data.arr.splice(0,0,val)`或`Vue.set(vm.data.arr,0,val)`又或者`vm.$set(vm.data.arr,0,val)`，在具体的由Vue管理的方法中this指向的应该就是vm！！

## 数据劫持

Vue通过setter,getter对数据进行动态监测，其实就是“劫持”了数据😯