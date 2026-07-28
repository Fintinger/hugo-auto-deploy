---
date: 2020-05-29
title: 关于Javascript模块化
tags:
  - Javascript
categories:
  - 前端
---

模块功能主要由两个命令构成：`export`和`import`。`export`命令用于规定模块的对外接口，`import`命令用于输入其他模块提供的功能。
```
//profile.js
export var firstName = 'Michael';
export var lastName = 'Jackson';
export function sayName () {
    return firstName + lastName;
}
export default function () {
    console.log('foo');
}
```

```
// main.js
import { firstName, lastName , sayName} from './profile.js';
```
> 注意：在index.html中引入的时候需要给script加type="module",即

```
<script type="module" src="./profiles.js"></script>
<script type="module" src="./main.js"></script>
```

---
![ 本文来自公众号“前端者也”](https://gitee.com/fintinger/figure-bed/raw/master//images/20201012130740.png)
