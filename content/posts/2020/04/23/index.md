---
date: 2020-04-23
title: Jquery一些操作
tags:
  - Jquery
categories:
  - 前端

---

## Jquery属性操作

#### 1.属性

`attr(attrName [,attrValue])` 操作所有属性（自定义和内置的）

`prop(attrName [,attrValue)) `操作HTML元素内置属性

`removeAttr(attrNam)`删除属性

`removeProp(attrName) `并不能删除HMTL元素上的属性

#### 2.CSS类

`addclass()`添加一个class值

`removeClass()`删除一个class值

`toggleClass()`切换一个class值(有则删掉该class，没有则加上，其他class不动)

`hasClasss()  `判断是否有指定class

#### 3.HTML代码/文本/值

`html([html])` 相当于innerHTML

`text([text)`相当于innerText

`val([value])` 设置/获取表单控件的值



## Jquery样式操作

#### 1.CSS操作

`css(atr,[value])`设置/获取CSS值  

>  参数可以是一个对象的形式`css({atr: value,})`

#### 2.位置

`offset()[.left/.top]`元素在页面中的坐标

> 设置只需要传一个对象即可 `{"left:num,top:num"}`

`position()[.left/.top] `元素在第一个定位的祖先元素内的坐标 (只读！)

`scollTop` ...

`scollLeft` ...

#### 3.尺寸

`width()/height()`内容尺寸

`innerwidth()/ innerHeight()`内容尺寸+ padding

`outerWidth()/ outerHeight()` 盒子的尺寸

![](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcd1Qilcb0uoWtG8pZG8gvqoalE8EE5LfqvMcq1g.AzAqSg0VAtan4UUfKlogjEH1QBBMY6Zi2Y9A4T0MhaQ1MJg!/r)



## Jquery筛选操作

#### 1. 过滤操作

`first ()`

`last() `

`eq()`

`not() `

`filter()`

`slice ()`

`has()`



#### 3.串联

`add()`把选中的元素加入当前集合

`addBack()`把调用该方法的元素加入当前集合

`end()`返回最后一次破坏性操作之前的DOM

`contents()`返回所有子节点的集合
#### 4 jQuery DOM对象操作

`each()`遍历

`map()`返回新的集合

`length`集合中元素的数量index（返回该元素在父元素中的索引位置）

`get([index])`返回集合指定索引的dom对象，还可以把jquerydom集合转为纯数组没参数

## 文档处理

#### 1.内部插入
`append(content|fn)`

`appendTo(content)`

`prepend(content|fn)`

`prependTo(content)`

#### 2.外部插入
`after(content|fn)`

`before(content|fn)`

`insertAfter(content)`

`insertBefore(content`
####  3.包裹
`wrap(html|ele|fn)`

`unwrap()`

`wrapAll(html|ele)`

`wrapInner(html|ele|fn)`

#### 4.替换
`replaceWith(content|fn)`

`replaceAll(selector)`

#### 5.删除
 `empty()`

`remove([expr])`

`detach([expr])`
#### 6.复制
`clone([Even[,deepEven]])`
## jQuery事件

#### 1.事件绑定

`on(event,fn)`  标准的事件绑定方式

  > on({}) 可以同时绑定多个事件

`one(event,fn)` 只能绑定一次事件

> 把事件名作为对象

#### 2.解除事件绑定

`off(["event"])` 可以去除所有，也可以解除指定事件

#### 3.事件委派

 `on(event,selector,fn)` 给父元素添加事件

  > 给新添加的元素绑定与之前存在的元素相同的方法（利用冒泡）

#### 4. 控制事件触发

 `trigger()`

`triggerHandler()`

> ① trigger返回的是 jqDOM可以连贯操作
② trigger可以触发元素自带的事件( input自带的事件，focus，submit...)
③ trigger会触发集合中所有元素的事件；trigger值触发集合中第一个元素的事件

#### 5.事件列表（新增）

`ready` 页面中DOM加载完毕（不同于onload）

`focusin` 获取焦点，绑定给输入框的父元素

`focusout` 失去焦点 ，绑定给输入框的父元素

`mouseenter` 代替`mouseover`

`moouseleave` 代替`mouseout`

`hover moouseleave`和`mouseenter`集合 

#### 6.事件对象

`pageX` 鼠标x坐标

`pageY` 鼠标y坐标

`target` 当前触发事件的元素

`which` 键盘按键的ASCII码

`type` 事件类型（事件名称）

`preventDefault`阻止默认操作（例如a标签跳转，致使页面刷新）
  ![建议分开写](http://r.photo.store.qq.com/psc?/V11ijIHl1yJLHC/45NBuzDIW489QBoVep5mcd1Qilcb0uoWtG8pZG8gvqr9EVMXjbGX.dXZ1zIqWtXwnu.NY6rIk*sVrbcZ2IXtr01UczMhf6cXK.06k8eFn9k!/r)

 

## Jquery动画

#### 基本效果

`hide([time,fn])` 隐藏

`show([time,fn])` 显示

`toggle([time,fn])`

  > 基本效果的CSS属性变化：透明度变化，元素大小相关的样式 padding, border width/height外边距

  > `fn() `表示动画结束执行的函数

#### 滑动效果

`slidedown` 显示

`slideup` 隐藏

`slidetoggle `

> 垂直方向的变化 

#### 淡入淡出效果

`fadeOut()` 隐藏

`fadeIn()` 显示

`fadeToggle()`

`fadeTo(time,opicity,fn)`

#### 自定义动画

- animate({},time,fn)

> `{}`中为需要变化的值。
取值可以是toggle，可变化可恢复原样

`stop()` 暂停动画

`finish()` 结束动画（提前完成）

`delay(time)` 延迟动画（动画连续调用时加在中间，会等time时间执行后面的）

#### 动画设置

`jQuery. fx. off` 清除所有动画，恢复为默认效果

`jQuery. fx interval` 动画帧数

#### 动画队列

- 所有的动画操作会加入到队列中，依次执行
- 其他操作不会加入动画队列

####  jQuery动画与CSS3动画

- 兼容性，CS53的动画和过渡需要E9+， jQuery可以使用版本的
- CSS3的动画或者过渡必须给元素指定具体的CSS属性值

##  jQuery工具方法

#### 1.数组对象方法
`$.each（Aray,fn）`遍历数组或类数组对象

`$.grep（Array, fn）`过滤数组

`$.map（ Array, fn）`从数组取出信息，返回新的数组

`$.makeArray(likeArray)` 把类数组对象转化为纯数组

`$inArray(val，Array)` 判断元素在数组中的位置，不存在返回-1

`$.merge()` 合并数组

`toArray()` jQuery DOM方法，把jQueryDOM直接转化为纯数组


#### 2.函数方法

`$.proxy()` 改变函数中this指向


#### 3.类型判断
` $.type()`判断类型

` $.isFunction()`判断是否是函数/方法

` $.isEmptyobject()`判断是否是空的对象

` $.Plainobject()`判断是否是纯的对象（构造函数是obeject)

` $.window()`判断是否是 window对象

` $.isNumeric()`判断是否是数字(NaN虽然是number类型，但这个是false) 


#### 4.字符串
`$.trim()`取出两边的空格
`$.param()` 把对象序列化成字符串
> `{name:"lili",age:18}` ---->`name=lili&age=18`

#### 5. 版本

`$.fn.jquery`

## jQuery Ajax

#### 1.快速请求方法

- get

  `$.get(url,callback,[,datatype])`

- post

  $.post(url,[,data],callback,[,datatype])`

#### 2.ajax方法

- ajax()

  ```
  $.ajax{
  	url:,//地址
  	type:"get""post", //请求方式
      async:,//是否异步
      data:,//发送的数据 对象或字符串(序列化)
      dataType:,//响应的内容格式
      success://成功回调
      error://失败回调
  }
  ```

#### 3.表单方法

`serialize()` 把表单中含有name属性的表单控件的值拼接成字符串(序列化表单)
## jQuery插件

#### 1. select2 下拉框搜索插件

- 官网 http://select.org/

- Github http://github.com/select2/select2

- 用法

  ```
  $(dom).select2()
  $(dom).select2({
  	width:,
  	data:,
  	ajax:,
  	...
  })
  ```

  

#### 2.datetimepicker 时间日期插件

- github https://github.com/xdan/datetimepicker

- 用法

  ```
  //设置语言
  $.datetimepicker.setLocal("zh");
  //调用插件
  $(dom).datetimepicker({
  	datepicker:,
  	timepicker:,//false||true
  	format:"Y-m-d H:i"//H表示24小时制，h表示12小时制
  	value:,
  	...
  })
  ```

  

#### 3.全屏滚动插件

- 官网  https://alvarotrigo.com/fullPage/zh/ 

- Github说明  https://github.com/alvarotrigo/fullPage.js/tree/master/lang/chinese#fullpagejs 

- 用法

  ```
  <!--HTML部分-->
  <div id="fulPage">
  	<div class="section"></div>
  	<div class="section">
  		<div class="slide"></div>
  		<div class="slide"></div>
  		<div class="slide"></div>
  	</div>
  	<div class="section"></div>
  </div>
  <!--自定义的导航，写在包裹元素的外面-->
  
  <!--JS部分-->
  <script>
  	$("#fullPage").fullpage({
  		navigation:true,
  		sectionsColor:[]
  		...
  	})
  </script>
  ```

  

#### 4.lazeload 图片懒加载

- 官网 https://appelsiini.net/projects/lazyload/

- Github  https://github.com/tuupola/lazyload/tree/2.x 

- 用法：
```
  $("#lazyWrapper img").lazyload()
```

#### 5.layer弹窗插件

- 官网 http://layer.layui.com/?alone

- 用法

  ```
  layer.alert()
  layer.confirm()
  layer.msg()
  layer.load()
  layer.tips()
  layer.colse()
  layer.open({
  	type:,
  	title:,
  	content:
  	...
  })
  ...
  ```

  

#### 6.nice validator 表单验证

- 官网 https://validator.niceue.com/

- 使用

  ```
  $("form").validator
  ```

  

#### 7.jQuery-easing

- 官网 http://gsgd.co.uk/sandbox/jquery/easing/

- 用法

  ```js
  $(dom).hide(speed,easing,fn)
  ```

  

## 自定义插件

- jQuery.fn.extend() 给jQuery扩展方法

  ```js
  $.fn.extend({
  	方法名:function(){}
  })
  //或者
  $.fn.方法名=function(){}
  ```

  

- jQuery.extend()  给jQuery对象本身扩展方法

  ```js
  $.extend({
  	方法名:function(){}
  })
  ```



 ## jQuery官网 



#### jQuery UI
官网 https://jqueryui.com/



####  jQuery Mobile
官网 https://jquerymobile.com/

教程 http://www.runoob.com/jquerymobile/jquerymobile-tutorial.html

#### Sizzle
官网 https://sizzlejs.com/

#### Zepto
官网 http://zeptojs.com

jquery区别：https://www.zhihu.com/question/25379207