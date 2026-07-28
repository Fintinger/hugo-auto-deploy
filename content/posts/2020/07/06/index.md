---
date: 2020-07-06
title: 避免多条件并列 
tags:
  - Javascript
  - 语法糖
categories:
  - 前端
---

开发中有时会遇到多个条件，执行相同的语句，也就是多个`||`这种：

```javascript
if (status === 'process' || status === 'wait' || status === 'fail') {
  doSomething()
}
```

这种写法语义性、可读性都不太好。可以通过`switch case`或`includes`这种进行改造。

```javascript
switch case
switch(status) {
  case 'process':
  case 'wait':
  case 'fail':
    doSomething()
}
includes
const enum = ['process', 'wait', 'fail']
if (enum.includes(status)) {
  doSomething()
```