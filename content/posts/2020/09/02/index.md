---
date: 2020-09-02
title: 关于JavaScript模块化
tags:
  - Javascript
categories:
  - 前端
---

## 自定义一个模块引擎

**要求：** 能够让模块之间产生依赖关系

**代码**

```javascript
let _module = (function () {
    let moduleList = {}

    function define(name, modules, action) {
        modules.map((n, i) => {
            //将传入的只含名称的模块数组 => 指定名称模块的返回结果
            modules[i] = moduleList[n]
        })
        moduleList[name] = action.apply(null, modules)
        // console.log(moduleList);
    }

    return {define}
})();
//定义一个工具库，暴露给外界使用，输出
_module.define('tools', [], function () {
    return {
        max(arr) {
            return arr.sort((a, b) => b - a)[0]//获取最大值挺别致昂
        },
        min(arr) {
            return arr.sort((a, b) => b - a)[arr.length - 1];
        }
    }
});
//使用之前定义的工具库，引入
_module.define('use', ['tools'], function (m) {
    console.log(m.max([1, 2, 5, 3, 8]));//8
    console.log(m.min([1, 2, 5, 3, 8]));//1
})
```

## JS中模块化的使用

#### 1.基本使用

> `export` 暴露给外界使用，`import` 引入

```javascript
/*module.js*/
let a = "jqf"

function getName() {
    console.log(a);
}
//利用export暴露给外界
export {a, getName}
```

```html
<!--use.html-->
<script type="module">
// type="module"，./ 都必须书写！
     
import {a,getName} from "./module.js";

console.log(a);//jqf
getName();//jqf
</script>
```

#### 2.批量导入

```javascript
import * as api from './modules.js'
```

**使用：** `api.a` |`api.getName()`...

> 不太建议直接使用这种方法，因为有时候并不需要全部导入，只导入需要即可

#### 3.别名导出导入

```javascript
import {a as user,getName} from './modules.js'
```

=> 将导入的`a` 命名为 `user`

同理，导出时也可以重命名

```javascript
export {a as user,getName} from './modules.js'
```

#### 4.默认导出

```javascript
export default function getName(){
	//...
}
//或者
export {getName as default}
```

导入时，

```javascript
import gName from './modules.js'
```

**说明：** 默认导出只有一个，用任意名接收即可，但是，规范化的要求是**导入默认导出的时候，名称尽量与文件名一样或者相同**

另外，当混合时

```javascript
export {a, getName as default}
```

```javascript
import modules,{a} from './modules.js'
//默认导出和普通导出用','隔开
```

#### 5.模块的合并导出

**方法：** 建立一个js文件，导入所有的模块，并且编成组再导出

```javascript
import * as m1 from './module1.js'
import * as m2 from './module2.js'

export {m1,m2}
```

> 编成组之后可以避免不同模块中导出重名的情况

```javascript
//使用
import * as api from './index.js'

api.m1.getName()
```

#### 6.按需加载

> 由于 import 只能在外部顶层，无法在{ }等中使用，因此无法做到按需加载，事件触发加载......

**方法： ** `import(src)` 函数

**参数：** `src` js文件的加载路径

**返回值：** 返回一个`Promise`，进行后续操作

```javascript
document.querySelector("button").addEventListener("click", function () {
    import('./modules.js').then((module) => {
        console.log(module.max([1, 2, 5, 7, 3, 8, 5]));
    })
})
```