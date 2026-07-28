---
date: 2020-08-28
title: JavaScript基础之函数相关
tags:
  - Javascript
categories:
  - 前端
---

## 关于函数传参

>  当参数数量不确定时，通常用`arguments` 来统一接收

```javascript
function sum() {
    return [...arguments].reduce((res, i,) => res + i, 0)
}

let res = sum(1, 2, 3)
console.log(res);//6
```
**可以用展开语法代替arguments接收所有的参数：**

```javascript
function sum(...args) {
    return args.reduce((res, i,) => res + i, 0)
}

let res = sum(1, 2, 3)
console.log(res);//6
```

**注意：** 接收参数时展开语法放其他形参后面，做统一接收

## 递归函数

> 递归函数有两个关键点，一是要有退出执行的条件，二是要不断执行自身并返回

#### 递归思想实现阶乘函数

```javascript
function factorial(num) {
    if (num === 1) {
        return num
    }
    return num * factorial(--num)
}
```

如果用到箭头函数，可以简写为：

```javascript
function factorial(num) {
    return num === 1 ? num : num * factorial(--num)
}

console.log(factorial(3));//6
```

## call&apply

> call 或者 apply都是用来改变函数内部this指向，并且传递参数的

**基本用法：**

```javascript
let a = {name: 'jqf'}
let b = {name: 'fin'}

function getName(age, gender) {
    return `${this.name}今年${age}岁，性别${gender}`
}

let call = getName.call(a, 18, '男')
let apply = getName.apply(b, [19, '男'])
console.log(call);//jqf今年18岁，性别男
console.log(apply);//fin今年19岁，性别男
```

**说明：** 

- `call()`和`apply()` 传递参数的方式不一样，`call` 接收普通传参，`apply()`则接收数组形式的参数
- 可以用来调用公用的一些方法，避免代码的重复

## bind

> 与`call(),apply()` 不同的是，`bind()` 改变this指向后，并不会执行函数，只用于绑定this指向，也可以像`call()` 那样传递参数，bind()` 调用之后会返回新的函数

```javascript
function ChangeColor(target) {
    this.tar = target
    this.colorArr = ["#eccc68", "#ff4757", "#2ed573", "#3742fa"]
    this.run=function (){
        setInterval(function (){
            let i=Math.floor(Math.random()*this.colorArr.length)
            this.tar.style.backgroundColor=this.colorArr[i]
        }.bind(this)//只用来改变this指向
        ,1000)
    }
}
```



