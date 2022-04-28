---
date: 2020-09-20
title: Javascript正则表达式
tags:
  - Javascript
  - 正则
categories:
  - 前端
sticky: 4 
---

> 关于正则表达式的创建，就不做过多的赘述

::: tip

由于不知名原因，span标签报错，因此全部替换为[sp]

:::

## 关于转义

#### 1.字面量形式创建的RegExp

**转义形式：** `\d`, `\.`, `\s` 等

```javascript
let str='fintinger2592030861.com$323e'
let reg=/\d+\.com/
str.match(reg);//2592030861.com
```

#### 2.对象形式创建的RegExp

**转义形式：** `\\d`, `\\.`, `\\s`等

```javascript
let str = 'fintinger2592030861.com$323e'
let reg = new RegExp('\\d+\\.com', 'g')
str.match(reg)//2592030861.com
```

## 边界约束

> 利用`^`和`$`分别限制开头和结尾

```javascript
let str = 'bdhw42556jbjkhb2592030861jrh4jbhkfehrbj43jk32kbbjhb'
let reg = /\d{3,6}/
let reg2 = /^\d{3,6}$/
str.match(reg)//42556
str.match(reg2)//null
```

## 元字符

|   元字符    | 用法                                        |
| :---------: | :------------------------------------------ |
| `\d` & `\D` | 表示数字和非数字                            |
| `\s` & `\S` | 表示空白（空格，换行，Tab制表符等）和非空白 |
| `\w` & `\W` | 表示字母，数字，下划线和非...               |
|     `.`     | 查找单个字符，除了换行和行结束符            |

## 模式修正符

| 修饰符 | 描述                                                     |
| :----- | :------------------------------------------------------- |
| `i`    | 执行对大小写不敏感的匹配。                               |
| `g`    | 执行全局匹配（查找所有匹配而非在找到第一个匹配后停止）。 |
| `m`    | 执行多行匹配。                                           |

## 字符属性匹配 

> Unicode Property：字符属于标点、空格、字母等等。每个Unicode字符只能属于唯一Unicode Property。.NET、Java、PHP和Ruby等语言支持。具体，[GO](https://zh.wikipedia.org/wiki/%E6%AD%A3%E5%88%99%E8%A1%A8%E8%BE%BE%E5%BC%8F#Unicode%E5%A4%84%E7%90%86)

![图片来自维基百科](https://gitee.com/fintinger/figure-bed/raw/master//images/20200920101841.png)

## 原子组和原子表

#### 1.原子表

**定义方法** ：`[]` 

**常用的一些方法：**

👉 编组就会用 '或' 关系匹配

```javascript
/[123]/
//表示1|2|3
```

👉 排除匹配

```javascript
/[^/d:-,]/
//表示匹配不是数字,':','-',','的
```

**注意：** 原子表中的字符全为其本义（除非转义`\`），不会进行解析，比如 ' . ' 等

👉匹配所有

```JavaScript
/[\d\D]/
//匹配数字与非数字，即所有
```

👉范围匹配

```javascript
/[a-z]/
//表示a-z的所有字母
```

#### 2.原子组

**定义方法：** `()`

**常用方法：**

👉重复匹配

```javascript
/(abc)/
//表示匹配'abc'整体字符串
```

> 原子组中的分组会依次编号，用`\1,\2...`获取到

```javascript
let str = `<span>ohh[/sp]`
let reg = /<(sp)>(.+)<\/\1>/
let res = str.replace(reg, `<p>$2</p>`)
console.log(res);//<p>ohh</>
```

**注意：** 正则表达式中用`\1`获取，而replace中用`$2`获取！

**编号的更多用法**

👉 **标记不记录组 **=> `?:`

```javascript
let str = `<span>ohh[/sp]`
let reg = /(?:<span>)(.+)(<\/sp>)/
let res = str.replace(reg, `$1`)
console.log(res);//ohh
```

这里的$1表示'ohh'这一组，因为'[sp]'被标记为不记录组

👉 **自定义组名**  => ` ?<name>`

```javascript
let str = `<span>ohh[/sp]`
let reg = /[sp](?<content>.+)<\/sp>/
let res = str.replace(reg, `<p>$<content></p>`)
console.log(res);//<p>ohh</p>
```

当原子组比较多时用这种方法即可(原来的`$1`也可以得到，不会改变顺序)

## 重复匹配与禁止贪婪

#### 重复匹配

| 量词    | 描述                         |
| ------- | ---------------------------- |
| `+`     | 匹配1或多个，相当于`{1,}`    |
| `*`     | 匹配0或多个，相当于`{0,}`    |
| `?`     | 匹配0或1个，相当于“有或没有” |
| `{2}`   | 只允许匹配2个，限定数量      |
| `{2,4}` | 允许匹配 [2, 10] 个          |

```javascript
let str='124ffr9fre12345ver'
reg=/\d{2,5}/g//只允许匹配2~5个数字
let res=str.match(reg)
console.log(res);/[ '124', '12345' ]
```

#### 禁止贪婪

> 在重复匹配后面加上·`?`

| 量词                          | 描述          |
| ----------------------------- | ------------- |
| `+?`                          | 只允许匹配1个 |
| `*?`                          | 只允许0个     |
| `{2,100}?` / `{2,}?` / `{2}?` | 只允许2个     |

```javascript
let str=`
[sp]123[/sp]
[sp]叼[/sp]
<span>ohh[/sp]
`
reg=/<(sp)>[\s\S]*?<\/\1>/g
let res=str.match(reg)
console.log(res);
//[ '[sp]123[/sp]', '[sp]叼[/sp]', '<span>ohh[/sp]' ]
```

利用禁止贪婪，每次只匹配一个符合正则的字串(一个sp及中间内容)，如果不禁止贪婪（去掉正则中?），则会匹配到从头开始到最后一个满足结尾的字串（所有的sp及中间内容）。

## 相关方法

#### 字符串的正则方法

> 即 String.prototype中的关于正则的方法

👉 `search()` 

返回正则所匹配到的值的索引，找不到则返回-1

👉 `match()`

返回正则所匹配的到的字符串，找不到返回null,**返回值与是否有`\g`有关**

- 如果没有`\g`，即不进行全局查找，它将返回一个数组，其中存放了与它找到的匹配文本有关的信息

![不全局返回值](https://gitee.com/fintinger/figure-bed/raw/master//images/20200920164755.png)

- 如果有`\g`， match() 方法将执行全局检索，找到 stringObject 中的所有匹配子字符串

👉 `matchAll()`，新方法，具体了解[GO](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/matchAll)

返回一个包含**所有匹配正则表达式的结果**及**分组捕获组**的迭代器

```javascript
const regexp = /t(e)(st(\d?))/g;
const str = 'test1test2';

const array = [...str.matchAll(regexp)];

console.log(array[0]);
// expected output: Array ["test1", "e", "st1", "1"]

console.log(array[1]);
// expected output: Array ["test2", "e", "st2", "2"]
```

👉 `split()` / `replace()`也支持正则

...

#### 正则对象方法

👉 `test()`

返回检测的结果，true/false

👉 `exec()`

>  在全局模式`\g`下，调用一次返回一次存放了与它找到的匹配文本有关的信息的数组，并且会修改该正则的`lastIndex`为**匹配字符下一个字符在整个字符串中的索引，即"last index"**，直至找不到，则会返回`null`，`lastIndex`变为0

```javascript
let str=`
[sp]123[/sp]
[sp]叼[/sp]
[sp]ohh[/sp]
`
reg=/<(sp)>[\s\S]*?<\/\1>/g
console.log(reg.exec(str));//找到的匹配文本及其有关的信息
console.log(reg.lastIndex);//17
console.log(reg.exec(str));
console.log(reg.lastIndex);//32
console.log(reg.exec(str));
console.log(reg.lastIndex);//49
console.log(reg.exec(str));
console.log(reg.lastIndex);//0

```

利用这一特性，可以在较低端浏览器下实现字符串中的`matchAll`方法

```javascript
while((res=reg.exec(str))){
	result.push(res)
}
//res=reg.exec(str)仅为赋值操作，判断为"==="!!!
//将每次的exec结果临时储存在res，然后push到result数组中
```

👉 `compile()`方法

emmm...

## 断言匹配

> 断言匹配就是正则是否匹配的条件，写在原子组中

| 量词    | 描述        |
| ------- | ----------- |
| `(?=)`  | 后面为...   |
| `(?<=)` | 前面为...   |
| `(?!)`  | 后面不为... |
| `(?<!)` | 前面不为... |

```javascript
/(?!.*.辣鸡*)/
//开始到结尾任意位置不能有"辣鸡"
```

