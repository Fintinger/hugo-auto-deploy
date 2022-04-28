---
title: JavaScript基础之Symbol类型
date: 2020-08-24
tags:
  - Javascript
categories:
  - 前端

---

> `Symbol()` 类型不能当做普通对象(不能加属性值)，只能当做一种永远都不会重复的字符串

## 定义

**方法：** `Symbol(desc)`、`Symbol.for(desc)`

```javascript
let s1 = Symbol('d')
let s2 = Symbol.for('d')
let s3 = Symbol.for('d')

console.log(s1.description);//d
console.log(Symbol.keyFor(s2));//d
console.log(s1 === s3);//false
console.log(s2 === s3);//true
```

**注意：** 利用`Symbol()` 定义的值永远都不会相等，而`Symbol.for()` 定义的，如果描述相同，则值相等

## 定义对象时，`key`相同会覆盖的问题

**普通方式定义：**

```javascript
let user1={
    name:'李四'
}
let user2={
    name:'李四'
}
let grade={
    [user1.name]:{C:98,E:60},
    [user2.name]:{C:99,E:59}
}
console.log(grade);//{'李四':{C:99,E:59}}
```

可以看到，后面的覆盖掉了前面的

**利用`Symbol()` 定义**

```javascript
let user1={
    name:'李四',
    key:Symbol()
}
let user2={
    name:'李四',
    key:Symbol()
}
let grade={
    [user1.key]:{C:98,E:60},
    [user2.key]:{C:99,E:59}
}

console.log(grade)//{[Symbol(user1)]: { C: 98, E: 60 },[Symbol(user2)]: { C: 99, E: 59 }}
console.log(grade[user1.key])//{C:98,E:60}
```

## 定义在对象中的Symbol无法访问到

```javascript
let symbol = Symbol('desc')
let user = {
    name: '李四',
    age: 18,
    [symbol]: 123
}

for (let key in user) {
    console.log(key);//name,age
}
```
普通方式无法获取`Symbol`类型的key

```javascript
for (let key of Object.getOwnPropertySymbols(user)) {
    console.log(key);//Symbol(desc)
}
console.log(Object.getOwnPropertySymbols(user));//[Symbol(desc)]
```

`Object.getOwnPropertySymbols(user)` 是只获取`Symbol` 类型

```javascript
for (let key of Reflect.ownKeys(user)) {
    console.log(key);//name, age, Symbol(desc)
}
console.log(Reflect.ownKeys(user));//[ 'name', 'age', Symbol(desc) ]
```

`Reflect.ownKeys(user)` 能获取到包括`Symbol`类型的所有的key

**说明：** 后面这两种方法都是把key转为数组，然后用`for-of` 操作，而对象的遍历用`for-in` 

## 举个🌰 

> 对象属性保护

```javascript
let pwd = Symbol('This is a Symbol')

class User {
    constructor(name, password) {
        this.name = name
        this[pwd] = password
    }

    getPWD() {
        return `${this.name}先生/女士您好,您的密码为：${this[pwd]},请务必牢记!`
    }
}

let jqf = new User('jqf', 'wrBh8w7ZDDANDyn')

console.log(jqf.getPWD());//jqf先生/女士您好,您的密码为：wrBh8w7ZDDANDyn,请务必牢记!
for (let jqfKey in jqf) {
    console.log(jqfKey + ':' + jqf[jqfKey]);//name:jqf,没有获取到this.pwd
}
```

实例化之后，利用简单粗暴的`for-in`是无法获取this.pwd这个值的，只好通过内置方法`getPWD()` 获取！