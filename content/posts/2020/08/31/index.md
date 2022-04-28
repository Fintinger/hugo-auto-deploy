---
date: 2020-08-31
title: JavaScript基础之对象
tags:
  - Javascript
categories:
  - 前端
---

## 对象中参数获取和值的接收

#### 1.对象中利用key获取value`.` | ` []`

```javascript
let obj = {name: 'jqf', age: 19}
for (let key in obj) {
    // console.log(obj.key);//会报undefined
    console.log(obj[key]);//jqf,19
}
```

👉 `delete Object.key()`

```javascript
delete obj.name
console.log(obj);//{ age: 19 }
```

#### 2.参数/配置合并

👉 **展开语法**

> 利用展开语法合并对象，让后面传入的参数覆盖默认参数，完成合并

```javascript
function upload(params) {
    let config = {
        url: '/images',
        type: '*.jpg,*.png'
    }
    config = {...config, ...params}

    //do something...
    console.log(config);
}

upload({type:'*.webp'})//{ url: '/images', type: '*.webp' }
```

👉 **解构赋值**

> 解构赋值会把相同key的进行合并，后面覆盖掉前面的

```javascript
function upload(params = {}) {
    let {url = '/images', type = '*.jpg,*.png'} = params

    //do something...
    console.log(url, type);
}

upload({type: '*.webp'})///images *.webp
```

**关于解构赋值？**

```javascript
let user = {name: 'jqf', age: 18}
let {name: n, age: a} = user
console.log(n, a);
```

**注意：** 等号左边是源数据，右边是要赋值的变量，二者相同时可省略

#### 3.hasOwnProperty() 自身属性中是否具有指定的属性

> 与[`in`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/in) 运算符不同，该方法会忽略掉那些从原型链上继承到的属性

```javascript
let obj={
    name:'jqf',
    age:19
}
console.log(obj.hasOwnProperty('name'));//true
console.log('name' in obj);///true
console.log(obj.hasOwnProperty('hasOwnProperty'));//false
console.log('hasOwnProperty' in obj);//true
```

#### 4.Object.assign() 对象合并

👉 **参数：**` Object.assign(target, ...sources) `  

`target` 表示目标对象

`sources` 表示源对象

👉 **返回值：** 目标对象

```javascript
let params={
    url:'/image',
    type:'*.jpg'
}
let config={
    type: '*.png'
}
let returnObj=Object.assign(config,params)
console.log(config);//{ type: '*.jpg', url: '/image' }
console.log(returnObj);//{ type: '*.jpg', url: '/image' }
```

#### 5.用for-of遍历对象？

> 对象可以直接用for-in遍历，for-of专门用于遍历可迭代对象

```javascript
let user={
    name:'jqf',
    age:18
}
for (let [key,value] of Object.entries(user)) {
    console.log(key,value);
}
```

**说明：** `Object.entries(obj)`  返回一个数组，是`Object.keys()` 和 `Object.values()` 的合并

## 对象的拷贝

#### 1.浅拷贝

```javascript
let a = {
    name: 'jqf',
    age: 18
}

//#1 解构赋值
let b = {name: a.name, age: a.age}
console.log(b);

//#2 for-in循环赋值
let c = {}
for (let aKey in a) {
    let key = aKey
    c[key] = a[key]
}
console.log(c);

//#3 对象合并
let d={}
// Object.assign(d,a)
d={...a}
console.log(d);
```

**问题：** 浅拷贝之后，对于多层次的对象，赋值之后会修改掉原来的对象！

```javascript
let user={
    name:'jqf',
    lessons:{
        title:'EN',
        score:29
    }
}
let b={...user}
b.name='fin'
b.lessons.score=18

console.log(b);//{ name: 'fin', lessons: { title: 'EN', score: 18 } }
console.log(user);//{ name: 'jqf', lessons: { title: 'EN', score: 18 } }
/**
*目的是只修改b中的score，原来user中的却也被修改
*/
```

#### 2.深拷贝

> 深拷贝利用递归的方式，深层次拷贝整个对象

```javascript
function deepCopy(obj) {
    let res = {};
    for (let objKey in obj) {
        res[objKey] = typeof obj[objKey] === 'object'
            ? deepCopy(obj[objKey])
            : obj[objKey]
    }
    return res
}

let user = {name: 'jqf', lessons: {title: 'EN', score: 29}}
let b = deepCopy(user)
console.log(b);//{ name: 'jqf', lessons: { title: 'EN', score: 29 } }

b.lessons.score = 0
console.log(user);//{ name: 'jqf', lessons: { title: 'EN', score: 29 } }
console.log(b);//{ name: 'jqf', lessons: { title: 'EN', score: 0 } }
```

这样原对象中的value就不会被修改了！

**弊端：** 如果user对象中含有数组类型的数据，该方法会出现问题！

**递归深拷贝方法的改进：**

> `instanceof()` 可以检测是不是属于Array等
>
> `Object.entries()`  可以将数组分解为索引+值的形式储存起来

优化：

```javascript
function deepCopy(obj) {
    let res = obj instanceof Array ? [] : {}
    for (const [k, v] of Object.entries(obj)) {
        res[k] = typeof v == "object" ? deepCopy(v) : v
    }
    return res
}

let user = {
    name: 'jqf',
    lessons: {title: 'EN', score: 29},
    skills: ['CSS', 'JS', 'H5']
}
let b = deepCopy(user)
console.log(b);//{name: 'jqf',lessons: { title: 'EN', score: 29 },skills: [ 'CSS', 'JS', 'H5' ]}
```

## 构造函数创建对象

```JavaScript
function User(name) {
    this.name = name;
    this.show = function () {
        console.log(`My name is ${this.name}`)
    }
}

let jqf = new User('jqf')
jqf.show()//My name is jqf
```

> javascript中的很多类型都是由构造函数定义的，定义其方法属性等等...可以通过new 的方式实例化，比如`new Array、new Boolean()、new String()、new Function()...`

## 对象的属性描述

#### 获取属性描述符

**方法：** `Object.getOwnPropertyDescriptor(obj, PropertyKey)`

**作用：** 返回指定对象上一个自有属性对应的属性描述符。（自有属性指的是直接赋予该对象的属性，不需要从原型链上进行查找的属性

```javascript
let obj={
    name:'jqf',
    age:18
}
console.log(Object.getOwnPropertyDescriptor(obj, 'name'));
//{value: "jqf", writable: true, enumerable: true, configurable: true}
```

#### 属性描述符

👉`value`

该属性的值(仅针对数据属性描述符有效)

👉 `writable` **可写 (可修改的)**

当且仅当属性的值可以被改变时为true。(仅针对数据属性描述有效）

👉`enumerable` **可枚举**

当且仅当指定对象的属性可以被枚举出时，为 `true`。

> 设置为false，`entries()`,`keys()`,`values()`,`for-in`等都无法使用

👉`configurable` **可配置**

当且仅当指定对象的属性描述可以被改变或者属性可被删除时，为true。

> 设置为false，`delete`删除key,不可用。`Object.defineProperty()` 都无法使用

👉`set`

获取该属性的设置器函数（setter）。 如果没有设置器， 该值为undefined。(仅针对包含访问器或设置器的属性描述有效)

👉`get`

获取该属性的访问器函数（getter）。如果没有访问器， 该值为undefined。(仅针对包含访问器或设置器的属性描述有效)

#### 控制属性描述符

**方法：** `Object.defineProperty()`

```javascript
let obj={
    name:'jqf',
    age:18
}
//单个修改
Object.defineProperty(obj,'name',{
    writable:false
});
Object.defineProperty(obj,'age',{
    writable:false
})
//批量修改
Object.defineProperties(obj,{
    name:{enumerable:false},
    age:{enumerable:false}
})

console.log(Object.getOwnPropertyDescriptors(obj));
```

#### 其他一些方法

👉 `Object.preventExtensions(obj)` 

**作用：** 阻止往对象中添加属性/方法

**判断：** `Object.isExtensible()` 判断是否可以添加属性

```javascript
let obj={
    name:'jqf',
    age:18
}
Object.preventExtensions(obj)
obj.info='ohhhhh'

console.log(Object.isExtensible(obj));//false
console.log(obj);//...
```

👉 `Object.seal(obj)` 封闭对象

**作用：** 阻止往对象中添加属性/方法(但可以修改)，属性描述符configurable和enumerable不可被修改，writable可单向修改为false，但不可以由false改为true；

**判断：** `Object.isSealed(obj)`

```javascript
let obj={
    name:'jqf',
    age:18
}
Object.seal(obj)
obj.name='fin'

console.log(Object.isSealed(obj));//true
console.log(Object.getOwnPropertyDescriptors(obj));//configurable: false,name:'fin'
```

👉 `Object.freeze(obj)`

**作用：** 阻止往对象添加属性/方法， 也阻止修改属性/方法，属性描述符不可修改

**判断：** `Object.isFrozen(obj)`

```javascript
let obj={
    name:'jqf',
    age:18
}
Object.freeze(obj)

console.log(Object.isFrozen(obj));//true
console.log(Object.getOwnPropertyDescriptors(obj));//configurable: false
```

> `Object.seal(obj)`& `Object.freeze(obj)`区别:
>
> `Object.freeze(obj)`“冰冻”对象本身以及一切现有的属性值(value)以及属性的特性(property descriptor).在函数Object.seal()中也许还可以修改属性值以及修改 属性的特性writable(true-->false)，但是在Object.freeze ()中，这些都干不了

## 访问器

>ECMAScript 5 (2009) 引入了 Getter 和 Setter。Getter 和 Setter 允许您定义对象访问器（被计算的属性）。

#### 基本用法

```javascript
let user = {
    data: {name: 'jqf', age: 19},
    get age() {
        return `${this.data.name}现在${this.data.age}岁`
    },
    set age(v) {
        if (typeof v !== 'number' || v <= 10 || v > 100) {
            throw new Error('年龄不合法')
        }
        this.data.age = v
    }
}
console.log(Object.getOwnPropertyDescriptors(user,'age'))//get:f set:f
console.log(user.age);//jqf现在18岁
console.log(user.age = 10);//Uncaught Error: 年龄不合法
```

#### 应用

👉 **伪造属性**

```javascript
let cart = {
    lists: [
        {name: 'Macbook', price: 8988},
        {name: 'shirt', price: 59},
        {name: 'office table', price: 11900},
    ],
    get total(){
        return this.lists.reduce((t,i)=> t+i.price,0)
    }
}
console.log(cart.total);//20947
```

👉 **访问器实现批量设置对象属性**

```javascript
let user = {
    data: {name: 'jqf', age: 19},
    set config(cfg) {
        [this.data.name, this.data.age] = cfg.split(",")
    }
}
user.config = 'fin,18'
console.log(user);
```

👉 `token()`**的读写处理**

> localStorage 和 sessionStorage 属性允许在浏览器中存储 key/value 对的数据。localStorage 用于长久保存整个网站的数据，保存的数据没有过期时间，直到手动去删除。localStorage 属性是只读的。如果你只想将数据保存在当前会话中，可以使用 [sessionStorage](https://www.runoob.com/jsref/prop-win-sessionstorage.html) 属性， 该数据对象临时保存同一窗口(或标签页)的数据，在关闭窗口或标签页之后将会删除这些数据。具体[GO](https://www.runoob.com/jsref/prop-win-localstorage.html)

```javascript
let Request = {
    set token(v) {
        localStorage.setItem('token', v)
    },
    get token() {
        let token = localStorage.getItem('token')
        return token
    }
}
// Request.token='EF3%F^323D'
console.log(Request.token);
```

#### 优先级

> 定义在set或get中的属性优先级高于普通定义的

```javascript
let user = {
    name: 'jqf',
    get name() {
        return 'get-name'
    }
}
console.log(user.name);//get-name
```

## Proxy代理拦截

> Proxy 对象用于定义基本操作的自定义行为（如属性查找、赋值、枚举、函数调用等）。

#### 方法

👉[`handler.getPrototypeOf()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getPrototypeOf)

`Object.getPrototypeOf` 方法的捕捉器。

👉[`handler.setPrototypeOf()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/setPrototypeOf)

`Object.setPrototypeOf` 方法的捕捉器。

👉[`handler.isExtensible()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/isExtensible)

`Object.isExtensible` 方法的捕捉器。

👉[`handler.preventExtensions()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/preventExtensions)

`Object.preventExtensions` 方法的捕捉器。

👉[`handler.getOwnPropertyDescriptor()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/getOwnPropertyDescriptor)

`Object.getOwnPropertyDescriptor` 方法的捕捉器。

👉[`handler.defineProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/defineProperty)

`Object.defineProperty`方法的捕捉器。

👉[`handler.has()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/has)

`in` 操作符的捕捉器。

👉[`handler.get()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/get)

属性读取操作的捕捉器。

👉[`handler.set()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/set)

属性设置操作的捕捉器。

👉[`handler.deleteProperty()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/deleteProperty)

`delete` 操作符的捕捉器。

👉[`handler.ownKeys()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/ownKeys)

`Object.getOwnPropertyNames` 方法和 `Object.getOwnPropertySymbols` 方法的捕捉器。

👉[`handler.apply()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/apply)

函数调用操作的捕捉器。

👉[`handler.construct()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy/handler/construct)

`new` 操作符的捕捉器。

#### 使用案例

👉 **使用代理查看函数执行时间：** 

```javascript
function factorial(num) {
    return num === 1 ? num : num * factorial(num - 1)
}

let p = new Proxy(factorial, {
    apply(target, thisArg, argArray) {
        console.time('run')
        factorial.apply(null, argArray)//argArray为原函数传入的参数
        console.timeEnd('run')
    }
})

p(6)//run: 0.159ms
```
👉 **使用代理对数组过滤拦截：** 

```javascript
let lessons = [
    {title: 'Javascript进阶教程', click: 9800},
    {title: 'web全栈', click: 8000},
    {title: 'CSS属性深度剖析', click: 9900}
]

let proxy = new Proxy(lessons, {
    get(target, p, value, receiver) {
        const len = 5
        const tarTitle=target[p].title
        target[p].title =
            tarTitle.length > len
                ? tarTitle.substr(0, len) + '.'.repeat(3)
                : tarTitle
        return target[p]
    }
})
console.log(proxy[2]);
console.log(proxy);
```

👉 **使用代理实现vue.js数据双向绑定：**

```html
<!--HTML部分-->
<input type="text" v-model="title">
<input type="text" v-model="title">
<h3 v-bind="title">这里的数据也会改变</h3>
```

```javascript
//JS部分
function Vue() {
    let proxy = new Proxy({}, {
        set(target, p, value, receiver) {
            document.querySelectorAll(`[v-model=${p}]`).forEach(i => {
                i.value = value
            })
            document.querySelectorAll(`[v-bind=${p}]`).forEach(i => {
                i.innerHTML = value
            })
        },
        get(target, p, receiver) {}
    })
    this.init = function () {
        document.querySelectorAll('[v-model]').forEach(i => {
            i.addEventListener('keyup', function () {
                proxy[i.getAttribute('v-model')] = i.value
            })
        })
    }
}
new Vue().init()
```