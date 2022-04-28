---
date: 2020-08-22
title: JavaScript基础之JS黑洞
tags:
  - Javascript
categories:
  - 前端
---

> JavaScript中最容易忽视的一些点

## let和var

> 都用来定义变量，但二者之间有些细微的差别

#### 区别1: 是否有块作用域

```javascript
var a = 1
{
    // var a=2
    let a = 2
}
console.log(a);

//output var:a=2  let:a=1
```

```javascript
var i=1
// for (var i = 0; i <3; i++) {
for (let i = 0; i <3; i++) {
    //..do something
}
console.log(i);

//output var:i=3  let:i=1
```

**说明：** 可以看出，`var`并没有作用域的概念，定义在特定作用于内的变量会受到作用域外的影响，`let`则不会

#### 区别2：全局污染问题

```javascript
console.log(window.screenLeft);//600
// var screenLeft = 1
let screenLeft = 1
console.log(window.screenLeft);

//output var:1 let:600
```

**说明：** `var`定义的变量用`window`对象也可以访问，当定义一些特定的`key`时，会造成全局的污染!

#### 区别3：重复声明的问题

```javascript
var a=1
var a=2
console.log(a);//2
let b=1
let b=2
console.log(b);//SyntaxError: Identifier 'b' has already been declared
```

**说明：** `var`重复声明变量不会报错，而`let` 或者 `const`则会报错

## 变量冻结

> 利用`Object`的方法 `freeze(obj)` 可以冻结对象，无法修改

```javascript
const HOST = {
    url: 'https://www.fintinger.xyz',
    port: 8000,
}
HOST.port = 9000
console.log(HOST);//port:9000

Object.freeze(HOST)
HOST.port = 3000
console.log(HOST);//port:9000
```

**说明：** 可以看到，利用`Object.freeze(HOST)` 冻结`HOST` 对象之后，其中的参数已经无法修改

## 传值&传址

> 传址和传值在内存中的表现形式是不一样的。传值会重新开辟空间储存；而传址只是让地址指向，而不会重新开辟空间 

```javascript
let a = 1
let b = a
a = 2
console.log(a, b);//2,1
```

```javascript
let obj1 = {
    name: 'jqf',
    age: 19
}
let obj2 = obj1
obj2.name = 'fin'
console.log(obj1, obj2)
//{ name: 'fin', age: 19 } { name: 'fin', age: 19 }
```

**说明：** 

- 第一段代码中，b和a分别指向不同的地址，只是值都是1，修改a并不会影响到b
- 第二段代码中，b和a指向相同地址，修改b就同样影响了a

**图示：**

![传值过程示意](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcSWmZeozXEZrzn6p73WfYMgXqukSBKTtLY55ab9bnsZDw5T9hHbxkLTTXjTVWyv06HhG2EUwAygQKwgAQqv*Sv4!/b&bo=4QLTAeEC0wECGT0!&rf=viewer_4)

![传址过程示意](http://m.qpic.cn/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcSWmZeozXEZrzn6p73WfYMgAi9RerOsxNywFOcUpBeOSpONEd2PtuTnc*iK5XIUljhZWmoE3m80*.QWrxvUZiRw!/b&bo=qgK8AaoCvAECGT0!&rf=viewer_4)

## 严格模式

> 使用严格模式会使代码的严谨性更好，适用更广，不易出错

**使用：** 在指定位置加上`"use strict"`

**作用域：** 指定位置及以下作用域

```javascript
a = 2

function tes() {
    "use strict"
    b = 2
    console.log(b);
}

console.log(a);//2
tes()//ReferenceError: b is not defined
```

