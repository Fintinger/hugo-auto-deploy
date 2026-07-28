---
date: 2020-08-13
title: Ajax重复请求
tags:
  - Ajax
categories:
  - 前端
---

> 在发送某一次请求时，如果不对请求做去重处理那么，同一个请求有可能会发送很多次，一个个慢慢响应，这会很大程度影响性能以及页面的使用体验

**全局变量**

```javascript
/**
 * baseURL 是每次请求的地址
 * x 表示XMLHttpRequest实例，初始为null
 * isSending 是用来判断请求是否处于发送状态的标识
 */
const baseURL = "http://127.0.0.1:8000/delay"
let x = null, isSending = false
```

## 原生请求

```javascript
if (isSending) x.abort()
x = new XMLHttpRequest()
//正处于发送状态，修改标识
isSending = true
x.open("GET", baseURL)
x.send()
x.onreadystatechange = function () {
    if (x.readyState === 4) {//当readyState=4,表示已经发送完毕，修改标识，是否成功返回则无需关心
        isSending = false
        if (x.status >= 200 && x.status < 300) {
            console.log(x.response);
        }
    }
}
```

## jQuery 请求

> jQuery做ajax请求时，可以仅针对一次请求，也可以利用[jQuery全局事件](https://api.jquery.com/category/ajax/global-ajax-event-handlers/)对所有请求加以限制

#### 仅本次请求

```javascript
$.ajax({
    url: baseURL,
    type: "GET",
    beforeSend: function (jqxhr, settings) {
        if (isSending) x.abort()
        x = jqxhr
        isSending = true
    },
    success: data => {
        isSending = false
        console.log(data)
    }
    complete: function () {
        /*isSending = false*/
    },
})
```

**说明：**

- `beforeSend`中将XMLHttpRequest 对象`jqxhr`和设置`settings`作为参数传递给回调函数。
- 修改`isSending = false`在`complete`或者`success`中j均可。
   - `complete[XHR,TS]`参数为XMLHttpRequest对象和说明请求状态的字符串textStatus，有（`"success"`，`"notmodified"`，`"nocontent"`，`"error"`，`"timeout"`，`"abort"`，或`"parsererror"`）
   - `success[data, TS, XHR]`参数为响应体data，textstatus，和XMLHttpRequest对象
   - `complete`在`success`之前执行

#### 全局请求

```javascript
$(document).ajaxSend(function (event,jqXHR,ajaxOptions) {
    if (isSending) x.abort()
    x = jqXHR
    isSending = true
}).ajaxComplete(function () {
    isSending = false
});
```

**说明：**

- 要作此限制，要求在所有的jQuery请求中设置`global = true`，当然，这是个默认值，所以不单独设置即为接受全局事件，如果不希望某个请求生效全局事件，设置`global = false`即可。
- 全局事件永远不会针对**跨域脚本**或**JSONP请求**触发，无论其`global`值如何。
- 从jQuery 1.9开始，所有[jQuery全局Ajax事件](https://api.jquery.com/category/ajax/global-ajax-event-handlers/)的处理程序都必须附加到`document`

#### jQuery Ajax各个事件的执行顺序

> 来自[kelelipeng](https://www.cnblogs.com/kelelipeng/p/11045888.html)

![jQuery Ajax各个事件的执行顺序](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcecChRJ0Yb4.uSLAYRKhcKlwFkyFTp5KW5t8KzMIT9fG0TlcGnNxgzwCeSLozEahFpjCga3kCJYCrBkhV*R5jK8!/r)

## axios请求

```javascript
const CancelToken = axios.CancelToken;
let cancel, isSending = false;

//请求拦截，即请求之前do something....
axios.interceptors.request.use(function (config) {
    if (isSending) cancel("Do not submit requests multiple times")
    isSending = true
    return config
})
//响应拦截，即请求之后do something....
axios.interceptors.response.use(function (res) {
    isSending = false
    return res
})
axios.defaults.baseURL = "http://127.0.0.1:8000"

//开始请求
axios({
    url:'/delay',
    method:"POST",
    cancelToken: new CancelToken(function executor(c) {
        // executor 函数接收一个 cancel 函数作为参数
        cancel = c;
    })
}).then(res => {
    //do something....
}).catch(err => {
    //err.message为前面cancel()携带的提示信息
    console.error(err.message);
})
```

**说明：**

- 请求拦截时，如果运行到`cancel()`,后续会被`.catch(err)`捕获，可在`catch(err)`中做一些处理，`cancel()`中携带的提示信息会被`catch(err)`捕捉，储存在`err.message`中
- 这里利用到的`cancelToken`比较晦涩，具体[研读](http://www.axios-js.com/zh-cn/docs/#%E5%8F%96%E6%B6%88)