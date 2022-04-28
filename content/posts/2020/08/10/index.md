---
date: 2020-08-10
title: Ajax学习小结
tags:
  - Ajax
categories:
  - 前端
  - 学习总结
weight: 3
---

> 学习地址:https://www.bilibili.com/video/BV1WC4y1b78y，主要通过express的简单功能来搭建本地的服务，进而更好地学习Ajax

## 发送Ajax请求的方式

### 原生Ajax

```javascript
//1.创建对象
const xhr = new XMLHttpRequest()
//2.初始化
xhr.open([type], [url])//xhr.open("GET","https://www.x.com")
//3.发送
xhr.send()
//4.处理返回结果
xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
            //...do something
            console.log(xhr.status)//状态码
            console.log(xhr.statusText)//状态字符串
            console.log(xhr.getAllResponseHeaders)//所有请求头信息
            console.log(xhr.response)//响应体
        }
    }
}
```

**说明：**

- `readyState`: 返回一个 XMLHttpRequest 代理当前所处的状态

| 值   | 状态               | 描述                                                |
| ---- | ------------------ | --------------------------------------------------- |
| `0`  | `UNSENT`           | 代理被创建，但尚未调用 open() 方法。                |
| `1`  | `OPENED`           | `open()` 方法已经被调用。                           |
| `2`  | `HEADERS_RECEIVED` | `send()` 方法已经被调用，并且头部和状态已经可获得。 |
| `3`  | `LOADING`          | 下载中； `responseText` 属性已经包含部分数据。      |
| `4`  | `DONE`             | 下载操作已完成。                                    |

> 因此，`xhr.readyState === 4`表示整个请求过程已经完毕，可以进行后续

- `status`: 返回了`XMLHttpRequest` 响应中的数字状态码

HTTP 响应状态代码指示特定 [HTTP](https://developer.mozilla.org/zh-cn/HTTP) 请求是否已成功完成。响应分为五类：

| 响应状态码 | 响应信息   |
| ---------- | ---------- |
| 100-199    | 信息响应   |
| 200-299    | 成功响应   |
| 300-399    | 重定向     |
| 400-499    | 客户端错误 |
| 500-599    | 服务器错误 |

> 状态代码由 [section 10 of RFC 2616](https://tools.ietf.org/html/rfc2616#section-10)定义

- **关于获取以及处理json数据**

> 由于在服务端`response.send()`只接受`String`类型的数据

```javascript
/*服务端*/
let data={name:"jqf",age:18,}
JSON.stringify(data)//转为String类型

/*接收时*/
//第一种方式
JSON.parse(data)//重新转为json类型
//第二种方式
xhr.responseType="json"//直接设置
```

- **关于超时和网络错误**

```javascript
//设置超时时间
xhr.timeout=2000
//超时回调
xhr.ontimeout=function(){
    //...do something
}
//网络错误
xhr.onerror=function(){
    //...do something 
}
```

- **取消请求**

```javascript
xhr.abort()
```



### Jquery Ajax

- **$.get() / $.post()**

```javascript
//参数(url, [data], [callback], [type])
$.get("http://127.0.0.1:8000/jquery", {a: 1, b: 2}, function (data) {
    //do something....
}, "json")
```

> `"json"`会将响应体response中原来属于json格式的数据直接转化成json格式

- **$.ajax()**

```javascript
//参数 url,[settings]
//也可以直接写对象配置url
$.ajax({
    //路径
    url: "http://127.0.0.1:8000/jquery",
    //数据
    data: {
        a: 1, 
        b: 2
    },
    //请求类型
    type: "GET",
    //返回数据类型
    dataType: "json",
    //超时设置
    timeout: 2000,
    //请求头设置
    headers: {
        a: 1,
        w: "https://www.fintinger.xyz"
    },
    //成功回调
    success: (data) => console.log(data),
    //失败回调
    error: (err) => console.log("出错啦!"),
})
```

### Axios 

- **通用默认设置**

```javascript
axios.defaults.baseURL = "[baseurl]"//默认地址前缀，http://127.0.0.1:8000
```

- **axios.get(url[, config])**

```javascript
axios.get("/axios", {//由于已经配置了baseURL，所以路径直接简写
            params: {//url参数
                t: Date.now(),
                w: "get"
            },
            headers: {//请求头设置
                a: 1,
                b: 2
            }
        }).then(response => {//成功之后的回调
            console.log(response)
        })
```

- **axios.post(url[, data[, config]])**

```javascript
axios.post("/axios", {
            username: "fintinger",
            password: "Asknjska723#$@df"
        }, {
            params: {
                t: Date.now(),
                w: "post"
            },
            headers: {
                a: 1,
                b: 2
            }
        }).then(response => {
            console.log(response)
        })
```

- **通用型方法**

```javascript
axios({
    //URL
    url: "/axios",
    //方法
    method: "POST",
    //数据(GET不会携带数据,写会报错)
    data: {
        u: "fintinger",
        p: "103dfs@#d"
    },
    //URL后缀
    params: {
        t: Date.now(),
        w: "all"
    }
})
```

### fetch[URL,config] 

- **具体用法：**[GO](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch)

```javascript
fetch('http://127.0.0.1:8000/fetch',{
            method:"POST",
            headers:{
                a:1,
                b:2
            },
            body:'u=fintinger&pwd=1cdf@#ds'
        }).then(response=>response.json())
            .then(res=>console.log(res))
```

> 不管是请求还是响应都能够包含 body 对象,Body类定义了以下方法（这些方法都被`Request`和`Response`所实现）以获取 body 内容。这些方法都会返回一个被解析后的`Promise`对象和数据。
>
> - arrayBuffer()
> - blob()
> - json()
> - text()
> - formData()

## IE 缓存问题

> 对于ajax请求，IE浏览器会进行本地缓存，再次发送请求时不会返回服务器的最新数据，而是返回本地的缓存数据

### 解决办法

在路径后面加上`t=Date.now()`，即加上时间戳，这样再次请求时就会是与之前不同的请求路径，可以解决IE缓存机制带来的异常问题

```javascript
const xhr = new XMLHttpRequest()

xhr.open('GET', 'http://127.0.0.1:8000/server-ie?t=' + Date.now())//加时间戳

xhr.send()

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
            //...do something
        }
    }
}
```

## 重复请求的问题

> 用户多次做同一个请求，很大程度影响性能，因此是否可以在用户发送这次请求之前，判断是否与上次请求为同一请求，如果是，则取消掉上一次请求，重新发送这次请求

- **对于原生Ajax**

```javascript
//定义一个用于判断是否处于发送状态的标识
let isSending = false
let xhr = null

//如果同一个请求正在发送，则取消
if (isSending) xhr.abort()

xhr = new XMLHttpRequest()

xhr.open('GET', url)

xhr.send()

xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
        //已经发送完毕，修改标识，是否成功返回则无需关心
        isSending = false
    }
}
```

> Jquery 和 axios 发送ajax请求时的重复问题也存在，具体解决办法后续有讲到 [☞GO](https://www.fintinger.xyz/posts/2020/08/13/Ajax重复请求问题.html)

## 同源策略

> 同源策略是浏览器的一种安全策略，同源指的是协议、域名、端口号必须相同，违背同源策略的请求称为跨域请求	

**Demo**

```javascript
 /*描述*/
    /*
    - 创建本地服务，在9000端口的/home路径下打开index.html
    - 然后在index.html中访问同源的/user路径，体现同源策略
    */
    const btn = document.querySelector("button")

    btn.onclick = function () {
        const xhr = new XMLHttpRequest()
        //因为请求是同源的，因此URL不用加协议前缀，浏览器会自动补全的
        xhr.open("POST", "/user")
        xhr.send()
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status >= 200 && xhr.status < 300) {
                    console.log(xhr.response);
                }
            }
        }
    }
```

```javascript
const express = require('express')

const app = express()

app.get('/home', (request, response) => {
    response.sendFile(__dirname + '/index.html')
})
app.post('/user', (request, response) => {
    response.send("账号:fintinger" + "\n" + "密码:fe#5@42")
})


app.listen(9000, () => {
    console.log("服务已经启动,9000端口监听中...")
})
```

skr~

