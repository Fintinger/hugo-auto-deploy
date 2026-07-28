---
date: 2020-08-26
title: JavaScript基础之Set与Weakset
tags:
  - Javascript
categories:
  - 前端
---

## Set类型

#### 1.属性

👉  `size` ：数组长度

```javascript
let set = new Set([1, 2, 3])

console.log(set.size);//9
```

👉 `add()` ：添加元素

```javascript
console.log(set.add(99));//返回修改后的数组Set(4) { 1, 2, 3, 99 }
console.log(set);//原数组已经被修改Set(4) { 1, 2, 3, 99 }
```

👉 `delete()` ：删除元素

```javascript
console.log(set.delete(99));//true
console.log(set);//Set(3) { 1, 2, 3 }
```

👉 `has()` ：有某个元素

```javascript
console.log(set.has(3)); //true
```

👉 `clear()`：清空数组

```javascript
set.clear()//返回undefined
console.log(set);//Set(0) {}
```

#### 2.遍历Set

👉 `forEach()` 方法

```javascript
let set=new Set(['jqf','fin','zzh'])
set.forEach((value, samevalue, set) => {
    console.log(value);//jqf,fin,zzh
    console.log(samevalue);//jqf,fin,zzh
    console.log(set);//Set(3) { 'jqf', 'fin', 'zzh' }
})

//这里回调中的参数，前两个都是一样的值，
//第三个参数为遍历的Set
```

👉 `[...set]` 把Set类型转为普通数组，再遍历

```javascript
[...set].map((v) => {
    console.log(v);
})

//就可以用到遍历普通数组的多种方法
```

#### 3.利用Set实现数组去重

**说明：** Set中不会存在重复的元素，利用这一特性，可以达到快速去重的目的

```javascript
let arr = [1, 2, 3, 2, 1, 4, 3, 2]

arr = [...new Set(arr)]

console.log(arr);//[1,2,3,4]
```

#### 4.交并差集的实现

👉 **并集**

```javascript
let a=new Set([1,2,3])
let b=new Set([2,3,4])

let res=new Set([...a,...b])
console.log(res);//Set(4) { 1, 2, 3, 4 }
```

👉 **交集**

```javascript
res = new Set(
    [...a].filter(v => b.has(v))
)
console.log(res);//Set(2) { 2, 3 }
```

👉 **差集**

```javascript
//a与b的差值，返回a中有b种没有的元素
res = new Set(
    [...a].filter(v => !b.has(v))
)
console.log(res);//Set(1) { 1 }
```

## Weakset类型

#### 1. 属性

没有`size`属性，其他set中的属性都有

### 2. 遍历

由于没有`size`属性，因此是无法遍历的

#### 3. 赋值

**注意：** Weakset中只能保存对象等引用类型的数据，无法保存Number等类型

```javascript
let b=new WeakSet([{name:'jqf'},{name:'fin'}])
console.log(b);//WeakSet {{…}, {…}}

let a=new WeakSet([1,2,3,4])
console.log(a);//Uncaught TypeError: Invalid value used in weak set
```

#### 4.用途

可以专门用来保存DOM元素等... 