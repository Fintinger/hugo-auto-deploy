---
date: 2020-08-18
title: ES6之Promise用法小结
tags:
  - ES6
  - Javascript
categories:
  - 前端
  - 学习总结
weight: 3
---

**Promise** 对象用于表示一个异步操作的最终完成 (或失败), 及其结果值。其目的主要是解决以往回调中嵌套回调的"嵌套地狱"问题，使代码可读性更好，更美观!

## 基本用法

对于一个标准的Prommise，其基本写法为:

```javascript
new Promise(function (resolve, reject) {
   //do something...
    //success
    resolve('success')
    //fail & reject
   // reject('rejected') *resolve和reject只能出现一个
}).then(
    function (value) {
        //if succeed,do something...
    }, function (reason) {
        //if fail & reject,do something...
    }
)
```

如果采用ES6的**箭头函数**写法，则为:

```javascript
new Promise((resolve, reject) => {
    resolve('success')
    //reject('rejected')
}).then(
    value => {},
    reason => {}
)
```

> 始终牢记，前一个`Promise()`必须是在后面一个`.then()`中处理，
>
> 如果前一个`Promsie()`中没有改变状态，即没有`resolve()/reject()`方法，后面的`.then`就不会针对这个`Promsie()`处理

## Promise错误处理

> `Promise()`中的错误处理有两种方式,`.then()`和`.catch()`

##### `.then()`

- **特点：** "一一对应"，即一个`then()`对应处理上一个`Promise`
- **用法：**

```javascript
new Promise((resolve, reject) => {
    // 12+p
    // throw new Error('fail')
        reject('失败')
}).then(null, reason => {
    // console.log(reason.message);
    console.log(reason);
})
/*output:
    p is not defined
    fail
    失败
*/
```

> 因为是`reject()`或者失败状态，因此,`.then()`中的`value`没有意义，直接把`value => {}`用`null`代替

##### .`catch()`

- **特点：** "总览全局,全包"，及最后调用`.catch()`的位置以上所有的`Promise`中的错误都由`.catch()`捕获
- **用法**：

```javascript
new Promise((resolve, reject) => {
    resolve('success')
}).then(v => {
    console.log(v);
    return new Promise((resolve, reject) => {
            1 + b
            resolve('success-2')
        })
    }
).then(v => console.log(v))
    .catch(error => console.log(error.message))
/*output:
    success
    b is not defined
*/	
```

> 在`.then()`中返回一个`Promise`，后面的`.then()`就是对这个`Promise`的处理，因为返回的`Promise`中发生了`b is not defined`的错误，因此被`.catch()`捕获，后面的`resolve()`不再执行。

## finally()

> 无论resolve还是reject，`.finally()`最后都会执行

```javascript
new Promise((resolve, reject) => {
        //resolve('请求成功')
        reject('请求失败')
}).then(
    value => {
        console.log(value);
    },
    reason => {
        console.log(reason);
    }
).finally(() => {
    //do something....
})
```

## all()

> 所有的Promise都会执行的部分可以写到`.all()`中，用一个Promise集合promises(自定义)调用

```javascript
const promises = ['fin', 'jqf'].map(name => {
    return ajax('http://127.0.0.1:3000/users/' + name)
})
console.log(promises);//(2) [Promise, Promise]
Promise.all(promises).then(user=>console.log(user))//(2) [{…}, {…}]
```

**使用：** 可以用来批量获取数据，利用map数组方法

```javascript
 /**
  * 提供一个username数组，就会依次返回需要的数据
  * @param{Array}names
  * @returns {Promise<unknown[]>}
  */
function search(names) {
    const promises = names.map(name => {
        return ajax('http://127.0.0.1:3000/users?username=' + name)
    })
    return Promise.all(promises)
}

/*******使用*******/

search(names).then(res => {
    //...do something
})
```

## race()

> 与all()类似，接收一个可迭代的参数——Promise集合等，哪个先返回状态(resolve&reject)就执行哪个，其他的不予执行。

```javascript
const p1 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 300, 'p1 done')
});

const p2 = new Promise(function (resolve, reject) {
    setTimeout(resolve, 50, 'p2 done');
});

const p3 = new Promise(function (resolve, reject) {
    setTimeout(reject, 100, 'p3 rejected');
});

Promise.race([p1, p2, p3]).then(function(data) {
    // 显然p2更快，所以状态变成了fulfilled
    // 如果p3更快，那么状态就会变成rejected
    console.log(data); // p2 doned
}).catch(function(err) {
    console.log(err); // 不执行
});
```

## 使用Promise封装一些函数

> 使用Promise封装一些常用的方法，更加扁平，完美！

### 原生Ajax封装

```javascript
function ajax(url) {
    return new Promise((reslove, reject) => {
        let x = new XMLHttpRequest()
        x.open("GET", url)
        x.send()
        x.onreadystatechange = function () {
            if (x.readyState === 4) {
                if (x.status >= 200 && x.status < 300) {
                    reslove(JSON.parse(x.response))
                }else {
                    reject("加载失败")
                }
            }
        }
        x.onerror=function (){
            reject("其它错误")
        }
    })
}
```

**使用：**

```javascript
ajax(url).then(res => {
    //...do something
})
```

### Promise队列

> 利用Promise可以实现前一个任务完成之后再完成后一个任务这样的任务队列顺序

##### 基本用法

````javascript
let promise = Promise.resolve("1")
promise.then(v => {
    //返回一个新的Promise，
    // 后面的.then就是针对这个Promise的
    // 因此会等1s第一个.then()执行完毕后再执行后面的.then()
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(v);
            resolve("2")
        }, 1000)
    })
}).then(v => {
    setTimeout(() => {
        console.log(v);
    }, 1000)
})
````

> `Promise.resolve()`直接返回一个成功状态的Promise，同理，`Promise.reject()`则返回一个拒绝状态的Promise.。

##### 利用map()方法

> map() 方法返回一个新数组，数组中的元素为原始数组元素调用函数处理后的值。map() 方法按照原始数组元素顺序依次处理元素。[GO](https://www.runoob.com/jsref/jsref-map.html)

```javascript
function queue(arr) {
    //定义一个初始完成状态的Promise
    let promise = Promise.resolve()
    arr.map(v => {
        //不断更新promise的值
        //使之永远是上一次执行的Promise
        promise = promise.then(value => {
            return new Promise(resolve => {
                setTimeout(() => {
                    // console.log(v);
                    v()
                    resolve()
                }, 1000)
            })
        })
    })
}
```

**说明：** 

- `v`代表arr数组中的`value`，可以使函数组成arr
- 关键是利用`promise`接收上一个执行的`Promise()`，不断更新就能做到循环期间不断循环

**使用：**

```javascript
function f1(){
    console.log('my name is jqf,');
}
function f3(){
    console.log('ohhhhhhhh.');
}
function f2(){
    console.log("i'm 19.");
}
queue([f1,f2,f3]) //my name is jqf,i'm 19. ohhhhhhhh.
```

##### 利用reduce()方法

> reduce()是数组的方法，作用是首先有一个最后的返回值，这个值给定初始值，然后利用数组遍历的当前值，索引最终返回这个最后的返回值，[GO](https://www.runoob.com/jsref/jsref-reduce.html)

```javascript
//reduce()为数组中的方法
//"_"是占位的，因为这里的参数没有意义，用"_"占位即可
function queue(arr) {
    arr.reduce((promise, num) => {
        return promise.then(_ => {
            return new Promise(resolve => {
                setTimeout(_ => {
                    console.log(num);
                    resolve()
                }, 1000)
            })
        })
    }, Promise.resolve())
}
```

**说明：**

- reduce的参数

```javascript
array.reduce(function(total, currentValue, currentIndex, arr), initialValue)
```



