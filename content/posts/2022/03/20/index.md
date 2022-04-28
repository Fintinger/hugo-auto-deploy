---
title: canvas绘制跟随鼠标移动的线条
date: 2022-03-20
categories: 
 - 前端
tags:
 - Canvas
 - Css
---

在浏览网页时无意中发现了下面这种背景互动的效果：

![GIF动画演示](index.assets/%E6%88%AA%E5%9B%BE_20223420123450.gif)

通过一番周折，最终找到以下实现代码

```js
function randomLine() {
        function n(n, e, t) {
            return n.getAttribute(e) || t
        }
        function e(n) {
            return document.getElementsByTagName(n)
        }
        function t() {
            var t = e("script"), o = t.length, i = t[o - 1];
            return { l: o, z: n(i, "zIndex", -88), o: n(i, "opacity", .5), c: n(i, "color","0,0,0"), n: n(i, "count", 150) }
        }
        function o() {
            a = m.width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                c = m.height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        }
        function i() {
            r.clearRect(0, 0, a, c);
            var n, e, t, o, m, l;
            s.forEach(function (i, x) {
                for (i.x += i.xa, i.y += i.ya, i.xa *= i.x > a || i.x < 0 ? -1 : 1, i.ya *= i.y > c || i.y < 0 ? -1 : 1, r.fillRect(i.x - .5, i.y - .5, 1, 1), e = x + 1; e < u.length; e++)n = u[e],
                    null !== n.x && null !== n.y && (o = i.x - n.x, m = i.y - n.y,
                        l = o * o + m * m, l < n.max && (n === y && l >= n.max / 2 && (i.x -= .03 * o, i.y -= .03 * m),
                            t = (n.max - l) / n.max, r.beginPath(), r.lineWidth = t / 2, r.strokeStyle = "rgba(" + d.c + "," + (t + .2) + ")", r.moveTo(i.x, i.y), r.lineTo(n.x, n.y), r.stroke()))
            }),
                x(i)
        }
        var a, c, u, m = document.createElement("canvas"),
            d = t(), l = "c_n" + d.l, r = m.getContext("2d"),
            x = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function (n) {
                    window.setTimeout(n, 1e3 / 45)
                },
            w = Math.random, y = { x: null, y: null, max: 2e4 }; m.id = l, m.style.cssText = "position:fixed;top:0;left:0;z-index:" + d.z + ";opacity:" + d.o, e("body")[0].appendChild(m), o(), window.onresize = o,
                window.onmousemove = function (n) {
                    n = n || window.event, y.x = n.clientX, y.y = n.clientY
                },
                window.onmouseout = function () {
                    y.x = null, y.y = null
                };
        for (var s = [], f = 0; d.n > f; f++) {
            var h = w() * a, g = w() * c, v = 2 * w() - 1, p = 2 * w() - 1; s.push({ x: h, y: g, xa: v, ya: p, max: 6e3 })
        }
        u = s.concat([y]),
            setTimeout(function () { i() }, 100)
    };
```

实现的效果如下：

<iframe src="./demo/demo1.html" width="100%" height="300px" frameborder="0"style="border:1px solid #ccc" ></iframe>

观察一下代码可以看到以下几个可以设置的参数：

`zIndex` canvas在页面的层级关系

`opacity` 生成线条的透明度(实则为canvas的整体透明度)

`color` 即所有线条的颜色

`count` 是线条的数量

如果让颜色透明度随机产生，加上下面的代码

```js
//generate random color code
function r() {
    return Math.floor(Math.random() * 255);
}
function rc() {
    return `${r()},${r()},${r()}`
}
function ro() {
    return (Math.floor((Math.random() * 4 + 5))) / 10
}
```

并且修改`function t()`的内容

```js
function t() {
    var t = e("script"), o = t.length, i = t[o - 1];
    return { l: o, z: n(i, "zIndex", -88), o: n(i, "opacity", ro()), c: n(i, "color", rc()), n: n
(i, "count", 300) }
}
```

则会有下面的效果(双击随机改变颜色和透明度)

<iframe src="./demo/demo2.html" width="100%" height="300px" frameborder="0"style="border:1px solid #ccc" ></iframe>

此外，

掌握以上方法，甚至还可以让每条线的颜色都不同，但是会很占用资源😥