---
date: 2020-07-06
title: ES6中新增关于Array的方法
tags:
  - Javascript
  - ES6
categories:
  - 前端
---
在javascript中，Array()经常用到，利用ES6中的一些新特性会让数组的处理更加方便快捷
# 1.迭代空数组

直接创建一个数组

```javascript
const arr=new Array(4);
//Output:[undefined，undefined，undefined，undefined]
```

利用map方法，转化成新的数组，企图得到 [0,1,2,3] 数组

```javascript
const arr=new Array(4);
arr.map((ele,index) => index);
//Output:[undefined，undefined，undefined，undefined]
```

解决这个问题可以在创建数组时用到`Array.apply`

> apply与call类似，都是用来继承父类的方法的，不同之处是：
>
> - call() 方法分别接受参数。`person.fullName.apply(person1, ["Oslo", "Norway"]);`
>
> - apply() 方法接受数组形式的参数.`	person.fullName.call(person1, "Oslo", "Norway");`
>
> 如果要使用数组而不是参数列表，则 apply() 方法非常方便。

```javascript
const arr = Array.apply(null, new Array(4));
arr.map((ele,index) => index);
//Output:[0,1,2,3]
```

由此，我们可以创建一个指定最大值、最小值、或者长度生成指定数列的方法

```javascript
/**
     * 生成自定义的连续数列
     * @param{Number}min
     * @param{Number}max
     * @param{Number}len
     */
    function newArr({min = null, max = null, len = null} = {}) {
        let newArray=[], skip = min
        if (len == null) {len = max - min + 1}
        if (min == null) {skip = -max}
        const arr = Array.apply(null, new Array(len));
        newArray = arr.map((ele, index) => {
            return Math.abs(index + skip)
        }).sort((a, b) => a - b)//数组排序指定的方法
        newArray = [...new Set(newArray)]//数组去重，return 0那里会有重复的0
    }

    newArr({max: 10, len:200})

```

>1. JS最为合理的设置多个**默认值**的方法,[CSDN上Jonithan_具体讲解](https://blog.csdn.net/a695993410/article/details/80717995)

   ```javascript
   function third({x = 1 ,y = 2} = {}) {
       return x+y
       }
   ```
>
>2. 数组排序方法[sort(*sortby*)](https://www.w3school.com.cn/js/jsref_sort.asp)，*sortby* 可选。规定排序顺序,**必须是函数**。

   ```javascript
   function sortNumber(a,b){return a - b}
   let arr=[3,1,6,7,9,2,0]
   arr.sort(sortNumber)
  //Output [0,1,2,3,6,7,9]
   ```

>3. 箭头函数，[Arrow function](https://www.liaoxuefeng.com/wiki/1022910821149312/1031549578462080)，=>

  ```javascript
  x => x * x
   //上面的箭头函数相当于：
   function (x) {
       return x * x;
   }
  ```

# 2. 给方法传一个空参数

如果调用一个方法，并不填其中一个参数，会报错

```javascript
function test(a,b,c) {console.log("do something")}
test(1,,3)
//Output Uncaught SyntaxError: Unexpected token
```

解决办法之一就是，改为传`null` 或 `undefined`

```javascript
test(1,null,3)
//Output do something
```

利用ES6中新增的[展开语法](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/Spread_syntax)， 可以在函数调用/数组构造时, 将数组表达式或者string在语法层面展开；还可以在构造字面量对象时, 将对象表达式按key-value的方式展开。

```javascript
test(...[1,,3])
//Output do something
```

> 展开语法还可以用来做**数组或对象的合并**
>
> ```javascript
> arr1=[1,2,3]
> arr2=[4,5,6]
> obj1={name:"fintinger",age:19,gender:"male"}
> obj2={realName:"李栓蛋",hobby:"unknown",gender:"confidential"}
> 
> [...arr1,...arr2];
> //Output [ 1, 2, 3, 4, 5, 6 ]
> 
> {...obj1,...obj2}
> //Output {name: 'fintinger', age: 19,gender: 'confidential',realName: '李栓蛋',hobby:'unknown'}
> //对象合并的过程中，相同key，后面value会覆盖前面value
> ```
>
> 还可以用来将数组转为对象
>
> ```javascript
> arr1=[1,2,3]
> {...arr1}
> //Output { '0': 1, '1': 2, '2': 3 }
> ```
>
> 

由此，可以得到**数组去重**的新方法

```javascript
const arr = [...new Set([1, 2, 3, 3])]
//Output [1,2,3]
```

或者，下面代码也可以达到数组去重的效果，用到[Array.from()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from)方法

```javascript
const arr=Array.from(new Set([1, 2, 3, 3]))
//Output [1,2,3]
```

# 3.数组扁平化

对于一个数组`arr = [1, [2, [3, 4]]]`,将其转化为`[1,2,3,4]`,可以用到[reduce](https://www.runoob.com/jsref/jsref-reduce.html)，ES6中提供了更为简单的方法,[flat(depth)](https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Array/flat#Browser_compatibility)，参数`depth`，代表展开嵌套数组的深度，默认是1

- `reduce(function(total, currentValue, currentIndex, arr), initialValue)`

```javascript
let arr= [1, [2, [3, 4]]]
function flatten(arr) {
  return arr.reduce(function (prev, next) {
    return prev.concat(Array.isArray(next) ? flatten(next) : next);
  }, []);
}
flatten(arrO)
//Output [1,2,3,4]
```

- `flat(depth)`

  ```javascript
  let arr= [1, [2, [3, 4]]]
  arr.flat(3);
  //Output [1,2,3,4]
  ```

# 4.截断数组

修改数组长度为某一固定值

```javascript
let array = [0, 1, 2, 3, 4, 5];
array.length = 3;
console.log(array);

//Output: [0, 1, 2];
```

# 5.获取数组最后一项

```javascript
let arr = [0, 1, 2, 3, 4, 5];
const last = arr[arr.length - 1]
//Output: 5;
```

或者，利用`slice`

```javascript
const last = arr.slice(-1)[0]
//Output: 5;
```

