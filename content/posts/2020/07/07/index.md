---
date: 2020-07-07
title: 剪贴板功能实现
tags:
  - Jquery
  - myFunction
categories:
  - 前端
---

经常会用到指定内容的复制粘贴问题，用到`document`的[`execCommand`](https://developer.mozilla.org/zh-CN/docs/Web/API/Document/execCommand)  方法,为此，我将这个功能封装为一个简单的函数:

```javascript
    function doCopy($el, {deepCopy = false, copyTips = true, language = "Chinese", bgColor = "#ff6666", fontColor = "#fff"} = {}) {
        let tempEl = $("<input id='selectEl' type='text' value=''>").val($el.text())
        if (deepCopy) {
            tempEl.val($el.html())
        }
        tempEl.appendTo($("body"))
        document.querySelector('#selectEl').select();
        document.execCommand('copy');
        tempEl.remove()
        if (copyTips) {
            let tipEl = $("<div class='copyTips' >成功复制到剪切板</div>")
            tipEl.css({fontFamily: "'Microsoft YaHei', sans-serif",fontSize: "1.2rem",position: "fixed",top: "1rem",textAlign: "center", left: "50%",fontWeight: "bolder", borderRadius: ".5rem",marginLeft: "-8rem",width: "16rem",height: "3rem", lineHeight:"3rem", background: bgColor,boxShadow: "0 6px 10px -8px #000",color: fontColor, letterSpacing: "4px",boxSizing: "border-box",padding: "0 10px 0 10px", display: "none"})
            if (language === "English") {
                tipEl.text('Successfully copied!').css({letterSpacing: "0"})
            }
            tipEl.appendTo($("body"))
            $(".copyTips").fadeIn(800)
            setTimeout(function () {
                $(".copyTips").fadeOut(500)
            }, 1000)
        }
    }
```

# 使用(Usage)

> 这个方法依赖于jquery，目前最新的jquery为v3.5.1



### $el

- **类型：**`jquery DOM`

- **默认值：** 无默认值，必须指定

- **用法：**

```javascript
  doCopy($(".custom"))
```

### deepCopy

- **类型：**`boolean`

- **默认值：**`false`

- **用法：**

```javascript
  doCopy($(".custom"),{
  	deepCopy:true
  })
```

- **说明：**  是否复制指定元素下的DOM结构，`false`则为仅复制执行的jqueryDOM里面的文字

### copyTips

- **类型：**`boolean`

- **默认值：**`true`

- **用法：**

```javascript
  doCopy($(".custom"),{
  	copyTips:true
  })
```

- **说明：** 是否显示复制完成的提示框

### language

- **类型：**`String`

- **默认值:**`"Chinese"`

- **用法：**

```javascript
  doCopy($(".custom"),{
  	language:"English"
  })
```

- **说明：** 指定提示框的语言，两个值`"Chinese" ` 和`"English"`

### bgColor

- **类型：**`String`

- **默认值:**`"#ff6666"`

- **用法：**

```javascript
  doCopy($(".custom"),{
  	bgColor:"green"
  })
```

- **说明：** 指定提示框的背景色

### fontColor

- **类型：**`String`

- **默认值:**`"#fff"`

- **用法：**

```javascript
  doCopy($(".custom"),{
  	fontColor:"#000"
  })
```

- **说明：** 指定提示框的字体颜色




