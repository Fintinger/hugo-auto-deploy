---
date: 2020-09-04
title: JavaScript中的继承与原型链分析
tags:
  - Javascript
categories:
  - 前端
sticky: 3
---

## 原型链自定义设置

> 原型链的设置可以通过`Object.creative `, `__proto__`, `Object.setProperty`三种方法

#### Object.creative ()

**说明：** 该方法只能设置原型链，而不能获取

```javascript
let a1 = {name: 'a1'}
let b1 = Object.create(a1)
b1.name = 'b1'
console.log(b1);
```

> `Object.creative()`为创建对象的方法，第一个参数为其原型对象，第二个参数为其默认属性，这些属性默认是不可写，不可遍历，不可修改的

```javascript
let b=Object.create(null,{
    a:{value:'ohh', enumerable:true},
    b:{value:'jqf'},
})
console.log(Object.getOwnPropertyDescriptors(b));
//a: {value: "ohh", writable: false, enumerable: true, configurable: false}
//b: {value: "jqf", writable: false, enumerable: false, configurable: false}
```

#### `__proto__`

**说明：** 能设置，能获取，实质上是setter，getter

```javascript
let a2 = {name: 'a2'}
let b2 = {name: 'b2'}
a2.__proto__ = b2
console.log(a2);
console.log(a2.__proto__);//{name: "b2"}
```

> 关于`__proto__`是setter,getter？

```javascript
let a = Object.prototype
console.log(Object.getOwnPropertyDescriptor(a, '__proto__'));
//可以看到'__proto__'的属性描述中有set,get
```

#### Object.setProperty

```javascript
let a3 = {name: 'a3'}
let b3 = {name: 'b3'}
Object.setPrototypeOf(a3, b3)
console.log(a3);
console.log(Object.getPrototypeOf(a3));//b3
```

#### 原型链示意图

![修改_20200904114048](https://gitee.com/fintinger/figure-bed/raw/master//images/20200904150734.png)

## 关于检测

#### 原型链检测

👉 ` instanceof`

**说明：** 检测a的原型链上有无A的原型(A.prototype)=>构造函数

```javascript
function A() {}
let a = new A()
console.log(a instanceof A);//true
```

👉 `isPrototypeOf`

**说明：** 检测b的原型链上有无c对象=>对象

```javascript
let b = {name: 'b'}
let c = {name: 'c'}
Object.setPrototypeOf(b, c)

console.log(c.isPrototypeOf(b));//true
```

#### 属性检测

👉 `in`

**说明：** 检测本对象及其原型链有无指定属性

👉 `hasOwnProperty`

**说明：** 只是检测本对象有无指定属性

```javascript
let a = {name: 'jqf'}
let b = {age: 19}

Object.setPrototypeOf(a, b)

console.log("age" in a);//true
console.log(a.hasOwnProperty("age"));//false
```

> 使用for循环时，加上判断是否为本身的key，以免遍历继承与父级的key

```javascript
for (const key in a) {
    console.log('non-if:'+key);
    if (a.hasOwnProperty(key)){
        console.log('if-'+key);
    }
}
/*Output
non-if:name
if:name
non-if:age
*/
```

## 关于继承

#### 构造函数

```javascript
 function User() {
     this.name = 'User'
 }
 User.prototype.show = function () {
     console.warn('show method');
 }
 function Admin() {
     this.name = 'Admin'
 }
```

**说明：** User 和 Admin分别为两个不相干的构造函数。如果想在Admin的实例化对象能用到`User.prototype`的方法(prototype为一个对象，其中含有对应构造函数的方法)，让`Admin.prototype`的上级为`User.prototype`，这样`Admin.prototype`中，就能用`User.prototype`中的方法了，简而言之，就是**修改子类`Admin.prototype` 的原型链，使其父级为`User.prototype`**

> 注意：**构造函数中的方法一般都定义在其原型prototype对象中**，这样，当这个构造函数实例化的时候，不会重新拷贝出来定义在构造函数中的方法，造成不必要的资源浪费,切记！**用对象的方法定义构造函数的prototype之后，必须加上constructor属性**

```javascript
function Animation() {}
Animation.prototype = {
    constructor: Animation,//修改其构造函数!!!
    show: function () {
        this.style.display = 'block'
    },
    hide: function () {
        this.style.display = 'none'
    }
}
```

#### 开始继承

```javascript
//__proto__方法/Object.create()方法/Object.setPrototypeOf()方法

Object.setPrototypeOf(Admin.prototype, User.prototype)
Object.defineProperty(Admin.prototype, 'constructor', {
    value: Admin,
    enumerable: false
})
Admin.prototype.info = function () {
    console.log('Admin');
}
```

#### 完成继承

```javascript
let _admin = new Admin()
_admin.show()//show method
_admin.info()//Admin
console.log(_admin.__proto__.constructor === Admin)//true
//实例化的对象可以调用Admin中的方法，也可以用User中的方法
```

**图示**

![继承的图示](https://gitee.com/fintinger/figure-bed/raw/master//images/20200904150426.gif)

#### 继承函数封装

```javascript
/**
 * 下级继承上级构造函数
 * @param{Function}sub 下级函数
 * @param{Function}sup 上级函数
 */
function inherit(sub, sup) {
    Object.setPrototypeOf(sub.prototype, sup.prototype)
    Object.defineProperty(sub.prototype, 'constructor', {
        value: sub,
        enumerable: false
    })
}
```

#### 对象合并实现多继承

>Javascript 中一个构造函数无法继承多个基函数的方法，即**多继承**，如果都采用构造函数的方式，就只能一层层往上继承，才能做到多继承的效果，但是这样写显然会存在很多问题。于是想到，可以把一些方法写成对象的形式，然后在继承的prototype中合并，这样，就能分门别类地实现按需多继承

**方法对象及基函数：**

````javascript
const Request = {
    ajax: function () {
        return '请求后台中....'
    }
}
const Address = {getAddress: _ => '获取地址中....'}
const Access = {getAccess: _ => '获取权限中....'}
const Info = {
    __proto__: Request,
    getMore() {
        //super=this.__proto__
        console.log(super.ajax(), '获取更多信息中...');
    }
}
function User(name, age) {
    this.name = name
    this.age = age
}
User.prototype.show = function () {
    console.log(this.name, this.age)
}
````

**继承：**

```javascript
/*管理员构造函数*/
function Admin(name, age) {
    User.call(this, name, age)
}
inherit(Admin, User)

Object.assign(Admin.prototype, Access, Request, Info)//使用哪些合并哪些
let a = new Admin('jqf', 19)
a.show()
console.log(a.getAccess());
a.getMore()

/*会员构造函数*/
function Member(name, age) {
    User.call(this, name, age)
}
inherit(Member, User)

Object.assign(Member.prototype, Access, Address)
let b = new Member('fin', 18)
b.show()
console.log(b.getAccess());
console.log(b.getAddress());
```

**说明：** 

- `super`关键字用于访问和调用一个对象的父对象上的函数。[GO](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super)

- 利用`call/apply` 调用父级构造函数！