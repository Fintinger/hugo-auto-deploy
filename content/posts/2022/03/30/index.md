---
title: 浏览器本地存储
date: 2022-03-30
categories: 
 - 前端
tags:
 - Javascript
---

## webStorage

1. 存储内容大小一般支持5MB左右(不同浏览器可能还不一样)。

2. 浏览器端通过Window.sessionStorage和Window.localStorage属性来实现本地存储机制。

3. 相关API:

   - `xxxStorage.setItem('key','value');`

     该方法接受一个键和值作为参数,会把键值对添加到存储中,如果键名存在,则更新其对应的值。

   - `xxxStorage.getItem('key');`

     该方法接受一个键名作为参数，返回键名对应的值。

   - `xxxStorage.removeItem('key');`

     该方法接受一个键名作为参数，并把该键名从存储中删除。

   - `xxxStorage.clear();`

     该方法会清空存储中的所有数据。

4. 备注:
     1. SessionStorage存储的内容会随着浏览器窗口关闭而消失。
     2. LocalStorage存储的内容，需要手动清除才会消失。
     3. `xxxStorage.getItem('key');`如果key对应的value获取不到，那么getItem的返回值是null。
     4. 可以通过`JSON.stringify()`存储对象，通过`JSON.parse()`解析对象，`JSON.parse(null)`的结果仍然是null。

