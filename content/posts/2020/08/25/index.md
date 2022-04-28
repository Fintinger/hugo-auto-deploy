---
date: 2020-08-24
title: JavaScript基础之数组深倔
tags:
  - Javascript
categories:
  - 前端
---

> 数组是经常用到的一种数据结构

## 定义方法

```javascript
let a = new Array(3)
let b = [1, 2, 3]
```

> **如何定义一个只有一个元素的数组？**

`new Array(n)`表示有n个空元素的的数组，利用`Array.of(n)`,可以定义一个只有n元素的数组

## 类型转换

> 利用`join` 可以把数组转成字符串

```javascript
let a = [1, 2, 3, 4, 5]
let b = a.join('')
console.log(b);
```

 **说明：** `join` 的作用就是将数组中的所有元素用指定的符号连接，成为一个字符串

>  **如何把DOM集合NodeList转换成普通数组形式？**

`Nodelist`形式无法使用`.map(),reduce()`等方法(能用`forEach()`)，处理不太方便，因此需要转换成普通数组类型

```javascript
let titles = document.querySelectorAll('h1');

[...titles].map((v, i,titles) => {
    console.log(v);
})
titles.map()//Uncaught TypeError: titles.map is not a function
```

**注意：** 利用[展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)可以把DOM集合转换成普通数组形式

## 解构赋值

> 是一种数组间批量赋值的方法

```javascript
let [name, age] = ['fin', 18]
console.log(name)//fin
console.log(age)//18
```

如果用到[展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

```javascript
let arr = [...'fin']
console.log(arr);//[ 'f', 'i', 'n' ]

let [a, ...b] = [1, 'fin', 2, 3]
console.log(a, b);//1 [ 'fin', 2, 3 ]
```

**注意：** 

`...`在变量(前)位置，表示 “合并，聚拢”

`...`在值位置(后)，表示 “分散，拆解”

## 关于数组的一些方法

#### 1.截取数组

**方法：** `slice(from,to)`  & `splice(from,len)`

**区别：** 

- `slice()`只是截取并返回一部分，原数组不会改变
- `splice()` 为截取并返回部分，原数组变为截取后剩余部分

```javascript
let arr = [1, 2, 3, 4, 5]

console.log(arr.slice(0, 2));//[1,2]
console.log(arr);//[1,2,3,4,5]

console.log(arr.splice(2, 2));//[3,4]
console.log(arr);//[1,2,5]
```

#### 2.元素添加与移除

**方法：** `unshift() & shift()` 与 `push() & pop()`

**区别：**

| 方向/方式 |    添加     |   移除    |
| :-------: | :---------: | :-------: |
| **前面**  | `unshift()` | `shift()` |
| **后面**  |  `push()`   |  `pop()`  |

> **如何在中间某个位置插入？**

```javascript
let arr = [1, 2, 3, 4, 5]

arr.splice(2, 0, 'fin')

console.log(arr);//[ 1, 2, 'fin', 3, 4, 5 ]
```

**说明：** 

`arr.splice(2, 0, 'fin')`表示在原数组中截去2开始0长度的一段，然后用`'fin'`替换，相当于在原数组索引为2的位置插入`fin` 。

```javascript
/**
 * 指定数组中的某个元素移动到指定位置
 * @param{Array}arr
 * @param{Number}from
 * @param{Number}to
 * @returns {*}
 */
function move(arr, from, to) {
    if (from < 0 || to > arr.length) {
        console.error('参数错误')
        return
    }
    let moveItem = arr.splice(from, 1)//得到的是一个元素的数组形式、
    arr.splice(to, 0, ...moveItem)
    return arr
}

let arr = [1, 2, 'fin', 3, 4]
move(arr, 2, 4)
console.log(arr);//[ 1, 2, 3, 4, 'fin' ]
```

#### 3.清空数组

**方法：** 

```javascript
let arr = [1, 2, 3, 4]

arr=[]
console.log(arr);//[]
```

```javascript
let arr = [1, 2, 3, 4]

arr.length=0
console.log(arr);//[]
```

**区别：**

`arr=[]`只是改变了arr的指针指向；`arr.length = 0`是真正意义上的清空

#### 4.查找操作

> 关于`indexof() lastInsexof() includes()` 三个方法，可以看前一篇文章,[GO](https://www.fintinger.xyz/posts/2020/08/23/JavaScript%E5%9F%BA%E7%A1%80%E4%B9%8B%E5%80%BC%E7%B1%BB%E5%9E%8B.html)

**补充方法：** `find() & findIndex()`

```javascript
let arr = [1, 2, 3, 4]

let a = arr.find((v, i, o) => {
    return v === 3
})
console.log(a);//3

arr = [
    {name: 'jqf', age: '18'},
    {name: 'fin', age: '19'}
]
let res = arr.find((value) => {
    return value.name = 'jqf'
})
console.log(res);//{name: 'jqf', age: '18'}
```

**说明：** `find()` 方法更适用于查找对象等引用类型组成的数组，这样更具有优势

**注意：**`includes()`方法查找对象等引用类型时会出错

#### ５.排序方法

**方法：** `sort()`

**使用：**

```javascript
let arr = [1, 8, 3, 9, 6, 5, 2, 7, 0]
arr.sort((a, b) => a - b)
console.log(arr);//[0, 1, 2, 3, 5, 6, 7, 8, 9]

let col = ['a', 'c', 'b']
col.sort()
console.log(col);//['a', 'b', 'c']
```

**说明：** 如果调用该方法时**没有使用参数**，将**按字母顺序对数组中的元素进行排序**，说得更精确点，是**按照字符编码的顺序进行排序**。

#### 6.循环遍历数组

**方法：** `for-of`、`for-in`、`forEach()`、`map()`、`reduce()`、`filter()`、`every()`、`some()`.

**说明：**

 👉`for-of`

```javascript
let arr = [
    {name: "jqf", age: 18, gender: 'male'},
    {name: 'zzh', age: 20, gender: 'female'},
    {name: "fin", age: 19, gender: 'male'}
]

for (const val of arr) {
    console.log(val);//直接获得arr中的值
}
```

👉`for-in`

```javascript
for (const eleKey in arr[0]) {
        console.log(eleKey);//name, age, gender
}
```

**注意：** `for-in ` 获得的是对象中的 "key" ，**无法直接对数组使用**

👉`forEach()`

```javascript
arr.forEach((v, i, a) => {
    console.log(v);
})
```

👉`map()`

```javascript
arr.map((v, i, a) => {
    console.log(v);
})
```

👉`reduce()`❗

```javascript
let res = arr.reduce((res, v, i, a) => {
    v.intro = 'ohhhh'
    return res
}, arr)
console.log(res);
```

**注意：** `reduce` 方法会改变初始数组，接收五个参数

```javascript
reduce(callbackfn(total,currentValue,currentIndex,array)=>{
	//...do something
},initialValue)
```

`total` 用来接收`initialvalue` 初始值，并且记录最终返回值

👉`filter()`

```javascript
res = arr.filter((v, i, a) => {
    return v.gender === 'male'
})
console.log(res);//{name: "jqf", age: 18, gender: 'male'},{name: "fin", age: 19, gender: 'male'}
```

**注意：** 顾名思义，`filter` 用来批量过滤数组，最终返回处理后的数组

👉`every()`

```javascript
let res = arr.every((v, i, a) => {
    console.log(i);//0,1
    return v.gender === 'male'
})
console.log(res ? '全部是male' : '有female')//有female
```

**注意：** `every()` 只有当数组中的所有元素都满足`return` 后的函数时，整个结果才为`true` ，否则为`false`

👉`some()`

```javascript
res = arr.some((v, i, a) => {
    console.log(i);//0
    return v.gender = 'male'
})
console.log(res ? '有male' : '全部是female')//有male
```

**注意：** `some()` 与`every` 相对应，表示只要有满足`return` 后的函数的值，就立即返回`true` 

👉 **另外**

`map()`、`reduce()`、`filter()`、`every()`、`some()` 后面都可以跟一个`thisArg`的参数，表示在该作用域在`this`的指向！

```javascript
arr.map(() => {
    console.log(this)//Window(),Window(),Window()
},window)
```



skr~skr~~