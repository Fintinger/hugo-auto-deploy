---
date: 2020-08-11
title: 跨域及CORS官方跨域
tags:
  - Jsonp
  - Ajax
  - Jquery
categories:
  - 前端
sticky: 1
---

## JSONP

> jsonp跨域的实现仅限于**GET请求**，不可用于POST

**说明：**实现的基本思路是利用html中**`script`标签本身可跨域**的特性，在发送请求时，在页面中创建`script`标签，追加到页面中。这实际上就像利用script标签引入外部资源

```javascript
/*main.js*/
//申明handle函数
function handle(data) {
    //do something....
}

ele.onclick = function () {
    //1.创建script标签
    const script = document.createElement("script")
    //2.修改script的src属性
    script.src = "http://127.0.0.1:8000/jsonP"
    script.id="tempScript"//添加id方便移除
    //3.追加到页面中
    document.body.appendChild(script)
}
```

```javascript
/*server.js*/
app.get('/jsonP', (request, response) => {
    const data = {
        exist:1,
        msg:"用户名已经存在!"
    }
    let str = JSON.stringify(data)
    response.send(`
    handle(${str});
    document.body.removeChild(document.querySelector("#tempScript"))
    `)
})
```

**注意：**`response.send()/response.end()`中利用ES6语法规范中的模板字符串直接返回一段js代码，script标签会自动解析并作用到页面上

![响应体内容](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcUKEuDhmiVdG46JQ5DRe3DVCkB4ufErcOY6WajvYFCIRUbC.03SFzL1m1GKcPaRQf.RgJ646lzeAVdMz2DYjmCM!/r)

## CORS

如果要实现跨域，官方的解决方案是**[CORS](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)**，即通过设置CORS响应头实现跨域，这种跨域GET或POST请求均有效

```javascript
//服务端设置响应头
app.all('/data', (request, response) => {
    response.setHeader('Access-Control-Allow-Origin', '*')//允许来自所有域的请求
    
    response.setHeader('Access-Control-Allow-Headers', '*')//请求中允许携带的首部字段(可以携带自定义请求头)
    
    response.setHeader('Access-Control-Allow-Methods', '*')//允许使用的所有请求方法
})
```

## Jquery跨域

```javascript
/*main.js*/
$.getJSON('http://127.0.0.1:8000/jqueryJsonp?callback=?', function (data) {
    //do something....
})

//或者,

$.ajax({
    url:"http://127.0.0.1:8000/jqueryJsonp",
    type:"GET",
    dataType:"jsonp",
    success:function(data){
        //do something....
    }
})
```
**注意：** url后的`callback=?`必须加上，jQuery 将自动替换`?`为正确的函数名，以执行回调函数。 **此行以后的代码将在这个回调函数执行前执行**。


```javascript
app.all('/jqueryJsonp', (request, response) => {
    const data = {
        name: "jqf",
        age: "19"
    }
    let str = JSON.stringify(data)
    let cb = request.query.callback
    response.send(`${cb}(${str})`)
})
```

**注意：** 这里的`cb = request.query.callback`是上面main.js中的回调函数，jQuery会自动注册一个新的函数，用来代替mian.js中`$.getJSON()`后的回调函数，对比上面jsonp原理剖析即可理解，在`response.send()`中返回的js代码中的函数必须是已经声明过的！而在这里，这个已经申明过的函数就是mian.js中`$.getJSON()`后的回调函数！

![url callback后的值已经被替换](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcQqmqVultkcEnqc6Qs1DziKM*fQTU3WFAsb43K3pnvM.6E5VWVV5hkEcVh9wslSxTwyA4mMSdw*Doa54b*XZPkc!/r)

<img src="http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcQqmqVultkcEnqc6Qs1DziKzSuWauS8rju6c1B2XuXcyh9lPBNwkVRiRMi.Gkj4ILVMaz4J0yysnPlf9wj8wwdk!/r" alt="回调在响应体中" style="zoom:150%;" />

skr~~