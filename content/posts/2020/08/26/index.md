---
date: 2020-08-26
title: JavaScript基础之Map与Weakmap类型
tags:
  - Javascript
categories:
  - 前端
---

## Map类型

#### 1.属性

👉 `set()` 设置值

```javascript
let map = new Map()
let fn = function () {console.log('this is function')}
let user = {name: 'jqf', age: 18}

map.set('key', 'value')
map.set(fn, 'function')
map.set(user, 'object')

console.log(map);
/*Map(3){"key" => "value", ƒ => "function", {…} => "object"}*/
```

**注意：** Map类型，字符串、函数、对象都可以作为key设置

👉 `size` Map长度

```javascript
console.log(map.size);//3
```

👉`get()` 获取值

```javascript
console.log(map.get(fn));//function

//通过key获取value
```

👉 `delete() / clear()` 删除某个，清空Map

```javascript
console.log(map.delete(fn));//true
console.log(map);
/*Map(3){"key" => "value",  {…} => "object"}*/
```

👉 `has()` 是否有某个key

```javascript
console.log(map.has(user));//true
```

#### 2.遍历

👉`forEach(val,key,map)`

```javascript
map.forEach((value, key, map) =>{
    console.log(value);//value,function,object
    console.log(key);//key,Function,Object
    console.log(map);//map
} )
```

👉`for-of(ele)`

```javascript
for (const [key,value] of map) {//利用解构赋值的方式分别获取！
    console.log(value);//value,function,object
}
```

**注意：** 如果用个变量接收`for-of`遍历的值，得到

```javascript
for (const ele of map) {
    console.log(ele);
}
/*OUTPUT:
* ["key","value"]
* [f,"function"]
* [{...},"object"]
* */
```

#### 3.类型转换

> 利用展开语法可以快速转换Map为普通数组

```javascript
console.log([...map]);//[Array(2), Array(2), Array(2)]
console.log([...map.values()])//["value", "function", "object"]
console.log([...map.keys()]);//["key", ƒ, {Object}]
```

#### 4.用途

利用Map保存DOM及其属性值，`key=DOM,value=属性值` ！！

## Weakmap

#### 1.属性

与Map基本一致，参考Weakset！

**注意：** weakMap的key不能是字符串！