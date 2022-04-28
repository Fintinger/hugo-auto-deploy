---
date: 2020-08-23
title: JavaScript基础之值类型
tags:
  - Javascript
categories:
  - 前端

---

## 字符串

#### 1.截取字符串

> 主要有`slice()`、`substr()`、`substring()` 三种方法

- **一个参数[i]**

都是从i开始截取，返回n及其后面的全部字符串。

- **第二个参数[i,n]**

`slice(i,n)`和`substring(i,n)`表示从`i`开始截取到`n`；`substr(i,n)`，表示从`i`开始截取`n`个

- **负参数**

`slice()`和`substr()`将最后一位记为-1，然后依次编号；`substring()`则会将任何负参数变为0，然后查找

```javascript
let w = 'fintinger.xyz'
let a = w.slice(-4, w.length)
let b = w.substring(-1, 2)
let c = w.substr(-4, 4)

console.log(a, b, c);//.xyz fi .xyz
```

#### 2.查找字符串

> 主要有`indexof()`、`includes()`、`lastIndexof()` 三种方法

**共同点：**

- 两个参数`[searchString,position]`，第一个为要检索的字符串，第二个为开始检索位置；
- 若`position < 0`，则`position = 0`
- `position`可以省略

**不同之处：**

- `lastIndexof()`为从右往左找，找到第一个立即返回索引！其他两个都是从左往右
- `indexof(),lastIndexof()`找不到则返回`-1`，`includes()`找不到返回`false`
- `position `省略之后，`includes(),indexof()`默认值为0，`lastIndexof()`则为`str.length`

#### 3.重复函数 repeat()

**作用：** 复制粘贴指定字符串指定次数

**案例：**

```javascript
/**
 * 电话号码模糊处理
 * @param{String|Number}number
 * @param{Number}len
 * @returns {Error|string}
 * @constructor
 */
function Phone(number, len = 4) {
    number = String(number)
    return number.length < len ? new Error('参数错误') : number.slice(0, -len) + '*'.repeat(len)
}

Phone(6995498, 4);//699****
```

#### 4.去空格函数trim()

**作用：** ` trim() `方法用于删除字符串的头尾空格。`trim() `方法不会改变原始字符串。

**案例：** 输入密码时限制输入空格

```javascript
let inp = document.querySelector('input')
let tip = document.querySelector('#tip')

    inp.addEventListener('keyup', function () {
        tip.innerHTML = ''
        this.value = this.value.trim()//无法输入空格，动态监听！！
        if (this.value.length < 6 || this.value.length > 12) {
            tip.innerHTML = '密码长度为6-11位'
        }
    })
```

#### 5.获取字符串某个位置的值函数 charAt() 或 索引

```javascript
let w = 'fintinger'
console.log(w.charAt(3));//t
console.log(w[3]);//t
```

**区别：** 如果找不到，`charAt()`返回空字符串，索引则返回`undefined`

## 布尔类型

> 对于其他类型，分以下两种：
>
> `undefined,null,0 `  都相当于`false`
>
> `>=1的数值,字符串等 `  都相当于`true`

**注意：** 凡是>1的数都为`true`，但`≠true`，`true=1`

```javascript
console.log(true == 1);//true
```

#### 类型转换：

利用`!!`可以转为布尔类型

```javascript
console.log(!!1);//true
console.log(!!0);//false
```

## 数值类型

#### 1.判断是否为整数函数 isTnteger()

**使用：**

```javascript
Number.isInteger(2.1)//fasle
```

> 也可以利用`parseInt()`判断

```
let num=2

console.log(Number.isInteger(num));//true
console.log(parseInt(num) === num);//true
```

#### 2.Math()对象

> Math为内置对象，包含数学上的多种方法

**取最大/最小值 max()/min()：**

```javascript
/*依次传入形式*/
let b = Math.max(1, 2, 4, 6)
console.log(b);//6

/*数组形式*/
let c = [1, 2, 4, 6]
b = Math.max.apply(null, c)
console.log(b);//6
```

**说明：** 利用`apply` 传递数组参数，`call` 不能传递数组参数。另外，利用[展开语法(Spread syntax)](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)

```javascript
b=Math.max(...c)
console.log(b)//6
```

#### 3.随机数

> 利用`Math.random()`可以取到 [0,1) 之间的随机数

**注意：** 假设取 0~3 之间的随机数，利用`Math.round(Math.random()*3)` 取到的数：

| 范         围 | 取 到 的 值 | 概                率 |
| :-----------: | :---------: | :------------------: |
|  [ 0, 0.5 )   |      0      |        1 / 6         |
| [ 0.5, 1.5 )  |      1      |        1 / 3         |
| [ 1.5, 2.5 )  |      2      |        1 / 3         |
|  [ 2.5, 3 )   |      3      |        1 / 6         |

用到`Math.floor()` 向下取整，`Math.floor(Math.random * (3+1) )`：
| 范         围 | 取 到 的 值 | 概                率 |
| :-----------: | :---------: | :------------------: |
|    [ 0, 1)    |      0      |        1 / 4         |
|   [ 1, 2 )    |      1      |        1 / 4         |
|   [ 2, 3 )    |      2      |        1 / 4         |
|   [ 3, 4 )    |      3      |        1 / 4         |

因此总结出一般规律：

**取 0~n 之间的随机整数：**

```javascript
Math.floor(Math.random() * (n + 1))
```

**取 m~n 之间的随机整数：**

```javascript
Math.floor(m + Math.random() * (n - m + 1))
```

## 4.时间

> Date() 为内置对象，处理与时间相关的问题

#### 1.类型转换

**标准时间 => 时间戳**：

```javascript
const date = new Date('2001-04-02 12:43:56')
console.log(date * 1); //986186636000
console.log(Number(date)); //986186636000
console.log(date.valueOf()); //986186636000
console.log(date.getTime()); //986186636000
```

**时间戳 => 标准时间：**

```javascript
let timeStamp = 986186636000
console.log(new Date(timeStamp));//2001-04-02T04:43:56.000Z
```

#### 2.格式化时间

利用内置属性，可以封装一个简单的时间格式化函数

```javascript
/**
 * 格式化时间，时间戳
 * @param{Date|Number}date
 * @param{String}format
 * @returns {string}
 */
function dateFormat(date, format = "YYYY-MM-DD HH:mm:SS") {
    date = new Date(date)
    const config = {
        YYYY: date.getFullYear(),
        MM: date.getMonth() + 1,
        DD: date.getDate(),
        HH: date.getHours(),
        mm: date.getMinutes(),
        SS: date.getSeconds(),
    }
    for (let key in config) {
        //补 "0" 操作
        config[key] = String(config[key]).length < 2 ? '0' + config[key] : config[key]
        format = format.replace(key, config[key])
    }
    return format
}

dateFormat(Date.now());//2020-08-23 13:05:03
```

**注意：** 

- `getMonth()`返回的月份是从0开始的，需要`+1`
- 获取日期是`getDate()`,而不是`getDay()`

> 另外，可以利用第三方库达到需要的效果，比如[Moment.js](http://momentjs.cn/)

skr skr~~~