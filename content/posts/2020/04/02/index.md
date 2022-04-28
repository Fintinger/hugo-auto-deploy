---
date: 2020-04-02
title: Javascript一些操作
tags:
  - Javascript
categories:
  - 前端

---
## 1.通过id获取元素

```js
function $(id) {
return typeof id === 'string' ? document.getElementById(id): null;
}
```
## 2.日期格式化

```js
function formatDate(cDate) {
        //1.判断
        if (!cDate instanceof Date){
            return;
        }
        //2.转化
        var year=cDate.getFullYear();
        var month=cDate.getMonth();
        var date=cDate.getDate();
        var hour=cDate.getHours();
        var minute=cDate.getMinutes();
        var second=cDate.getSeconds();
        //2.1 补0
        month=month<10? '0'+month:month;
        date=date<10? '0'+date: date;
        minute=minute<10? '0'+minute:minute;
        second=second<10? '0'+second:second;
        return year + '-' + month + '-' + date + ' ' +hour+':'+minute+":"+second;
    }
    console.log(formatDate(new Date()));
```
## 3.匀速运动封装

```js
 /**
     * 设置一个盒子右边距匀速变化
     * @param{string} btnId
     * @param{string} boxId
     * @param{number} step
     * @param{number}target
     */
    function linearAnimation(btnId, boxId, step, target) {
        // 1. 获取需要的标签
        var btn = document.getElementById(btnId);
        var box = document.getElementById(boxId);
        // 2. 定义变量
        var timer = null, begin = 0;
        // 3. 监听按钮的点击
        btn.onclick = function () {
            // 3.1 清除定时器
            clearInterval(timer);
            // 3.2 设置定时器
            timer = setInterval(function () {
                // 相加
                begin += step;
                // 判断
                if(begin >= target){
                    begin = target;
                    clearInterval(timer);
                }            
                // 动起来
                box.style.marginLeft = begin + 'px';
            }, 100);
        }
    }
```
## 4.阻止冒泡

```js
if(event && event.stopPropagation){ // w3c标准
            event.stopPropagation();
        }else{ // IE系列 IE 678
            event.cancelBubble = true;
        }
```

## 5.选中内容获取

```js
var selectedText;
if(window.getSelection){ // 标准模式 获取选中的文字    
      selectedText = window.getSelection().toString();
}else{ // IE 系列   
      selectedText = document.selection.createRange().text;
}
```
## 6.JS继承

![](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/1nSAZ*B78DPTEG5idIpYk8htZSIHm9ixnVJEqwpdVEqi91R89AXCZrzF7FgWX24mYcglaiA260.asSOs7L*c2j4ySplFLO7Lv.X*NW66QGI!/r)
**代码如下:**
```
function Temp(){};

Temp.prototype=Person.prototype;

var stuProto=new Temp();

Student.prototype=stuProto.prototype;

stuProto.constructor=Student;
```

