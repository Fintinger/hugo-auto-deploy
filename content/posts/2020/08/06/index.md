---
date: 2020-08-06
title: Ajax基础及Express框架基本使用
tags:
  - Ajax
  - Express
categories:
  - 前端

---

## Baike

> Ajax 即“**A**synchronous**J**avascript **A**nd **X**ML”（异步 JavaScript 和 XML），是指一种创建交互式、快速动态网页应用的网页开发技术，无需重新加载整个网页的情况下，能够更新部分网页的技术。
>
> 通过在后台与服务器进行少量数据交换，Ajax 可以使网页实现异步更新。**这意味着可以在不重新加载整个网页的情况下，对网页的某部分进行更新。**---百度百科

## 请求报文

*格式以及参数如下*

```javascript
行 GET / HTTP/1.1 
头 Host: fintinger.xyz
   Cookie: keyword=xyz
   Content-type: application/x-www-form-urlencoded
   User-agent: Chrome 83
空行 (必须有)
体 [GET]:空
   [POST]:空/username=admin&password=admin
```

![图示为Chrome浏览器请求报文](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcV0baQ9D.7iAnh8TAhtflNlZZ8DV0YbfOJ4TQyMAZ4RKs5Go2RewG1iAkBcVq5qxG*2fNv5F1gbo9kcwCkqdfOE!/r)

## 响应报文

*格式以及参数如下*

```javascript
行 HTTP/1.1 200 Ok 
头 Content-Type: text/html; charset=utf-8
   Content-Length: 22
   Content-encoding: gzip
空行 (必须有)
体 <html>
	 <head>
	 </head>
	 <body>
	 	<h1>Hello!</h1>
	 </body>
   </html>
```

![响应行，响应头](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcV27q*hPIqSWrbXgWR1DiBx1kP01rxcUeZFz4*JsogHbZQwFOu4bOzy*tL1gQhXafxcupKm9UrtgqWfE2Ukw2YU!/r)

![响应体](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcdW*zYEiSIPhFD1ArXaaPCiKZbBmIuDx7NnI*HF.tUYOCSrZw6*W.JtM9C89d2nEvCQJrkIqvMRXYVnCZTxIu*Q!/r)

## Express框架使用

```javascript
//1.引入express
const express=require('express')

//2.创建应用对象
const app=express()

//3.创建路由规则
/**
 * request 请求报文封装
 * response 响应报文封装
 */
app.get('/',(request,response)=>{
    //设置响应
    response.send('<h1>Hello express</h1>')
})

//4.监听端口启动服务
app.listen(8000,()=>{
    console.log("服务已经启动,8000端口监听中...."+"\n"+"http://127.0.0.1:8000/");
})
```

- **运行**

  ```javascript
  node express.js
  ```

- **结果**

  ![编辑器结果](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcdW*zYEiSIPhFD1ArXaaPCjOOaK*JpmPB8QTtWk*ws*zL5eyyFivwuqPCpk47Q47grwrIrD7dQE.s12dy.K6Z2A!/r)

  ![浏览器结果](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcdW*zYEiSIPhFD1ArXaaPCguyse7MXOVQikbqk9sMSvChNqFIkR61BbsiG*ctowDGEzBhweB6TW.L6sPandIiuo!/r)

  

- **另外，**

```javascript
response.sendFile([path])//response.sendFile(__dirname + '/index.html')
```

**可以实现访问该路径打开指定网页的效果**