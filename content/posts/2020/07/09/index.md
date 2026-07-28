---
date: 2020-07-09
title: 获取文件扩展名
tags:
  - Javascript
  - myFunction
categories:
  - 前端
---
该怎么去获得文件名字符串中的文件扩展名呢？

一种较为强大的解决方法是利用String的`slice`、`lastIndexOf`方法：

```javascript
function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
}
console.log(getFileExtension3(''));                            // ''
console.log(getFileExtension3('filename'));                    // ''
console.log(getFileExtension3('filename.txt'));                // 'txt'
console.log(getFileExtension3('.hiddenfile'));                 // ''
console.log(getFileExtension3('hiddenfile.'));                 // ''
console.log(getFileExtension3('filename.with.many.dots.ext')); // 'ext'
```

# 说明

`filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2)`

> 本方法中的`>>>`运算目的是
>
> 找到最后一个`.`所在索引，然后索引`-1+2`，相当于+1，则`slice`方法返回`.`后面的后缀名
>
> `.`不会再开头，否则索引会是0，因为`-1>>>0 =﻿﻿﻿﻿ 4294967295`，所不会匹配到
>
> `.`出现在末尾，索引会等于`length+1`，也不会匹配到

###  [`slice(start,end)`](https://www.w3school.com.cn/js/jsref_slice_array.asp)

- **说明：**`start`必须指定，负值为从后往前数，若只指定`start`值，则返回`start`位置及后面一直到数组结尾所有的元素
- **注意：**区别于删除数组中的一段元素的方法 `Array.splice()`

###  [`lastIndexOf(searchvalue,fromindex)`](https://www.w3school.com.cn/js/jsref_lastIndexOf.asp)

- **说明：**如果要检索的字符串值没有出现，则该方法返回 -1，该方法对大小写敏感
- **使用：**

```javascript
var str="Hello world!"
document.write(str.lastIndexOf("Hello") + "<br />")//0
document.write(str.lastIndexOf("World") + "<br />")//-1
document.write(str.lastIndexOf("world"))//6
```

###  [位运算符](https://www.w3school.com.cn/js/js_bitwise.asp)

- **说明：**在执行位运算之前，JavaScript 将数字转换为 32 位有符号整数。执行按位操作后，结果将转换回 64 位 JavaScript 数。

- **使用：**

| 操作    | 结果 | 等同于       | 结果 |
| :------ | :--- | :----------- | :--- |
| 5 & 1   | 1    | 0101 & 0001  | 0001 |
| 5 \| 1  | 5    | 0101 \| 0001 | 0101 |
| 5 ^ 1   | 4    | 0101 ^ 0001  | 0100 |
| ~ 5     | 10   | ~0101        | 1010 |
| 5 << 1  | 10   | 0101 << 1    | 1010 |
| 5 >> 1  | 2    | 0101 >> 1    | 0010 |
| 5 >>> 1 | 2    | 0101 >>> 1   | 0010 |