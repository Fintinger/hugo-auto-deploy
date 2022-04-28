---
date: 2020-08-22
title: JavaScript基础之运算符
tags:
  - Javascript
categories:
  - 前端
---

## ++的前置与后置

```javascript
let a1 = 1
let b1 = 2
let c1 = b1 + a1++
console.log(a1, b1, c1);//2,2,3

let a2 = 1
let b2 = 2
let c2 = b2 + ++a2
console.log(a2, b2, c2);//2,2,4
```

**说明：** 

- 后置是先计算再++
- 前置是先++再计算

## 短路运算

```javascript
let a = 0;
let b = 1;
let c = a || b;
console.log(c);//1
```

利用这个原理，我们可以简化一些函数

```javascript
let sex = prompt('您的性别?')
    if (!sex){
        sex="保密"
    }
    console.log(sex);
```

=>

```javascript
let sex = prompt('您的性别?') || "保密"
console.log(sex);
```

再比如:

```javascript
/*function judge(num) {
    if (num % 2 === 0) {
        return "偶数"
    } else {
        return "奇数"
    }
}*/
function judge(num) {
    return num % 2 === 0 && "偶数" || "奇数"
    //return num % 2 === 0 ? "偶数" : "奇数"
}

console.log(judge(2));//偶数
```

**说明：** 可以用来简化`if`条件判断语句，具体如下面这段伪代码

```javascript
if (flag) {
    //...do something 
} else {
    //...do something 
}
```

简化为 =>

```javascript
flag && {...do someting} || {...do someting}
```

