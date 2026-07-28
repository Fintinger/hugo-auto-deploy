---
date: 2020-07-18
title: vue.js学习心得
tags:
  - Vue.js
categories:
  - 前端
---

## 1. 关于元素显示与隐藏

### ` # v-show="name"`

- **说明：** 如果data中name为true就显示，否则该元素`display:none`

### ` # v-if="name"`

- **说明：** 如果data中name为true就显示，否则该元素变成一段注释`<!---->`，就被删掉了!

> `v-if` 是“真正”的条件渲染，因为它会确保在切换过程中条件块内的事件监听器和子组件适当地被销毁和重建。
>
> `v-if` 也是**惰性的**：如果在初始渲染时条件为假，则什么也不做——直到条件第一次变为真时，才会开始渲染条件块。
>
> 相比之下，`v-show` 就简单得多——不管初始条件是什么，元素总是会被渲染，并且只是简单地基于 CSS 进行切换。
>
> 一般来说，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。因此，如果需要非常频繁地切换，则使用 `v-show` 较好；如果在运行时条件很少改变，则使用 `v-if` 较好。

## 2. 访问data

### `　# v-model`

- **说明：** 与data中的值绑定，会随着data中的值得改变而改变，如果是`input`则data中的值会随着`input`中的值的改变而改变

### `# v-if`

- **说明：**用于条件性地渲染一块内容

  > **在`<template>`元素上使用 v-if 条件渲染分组**
  >
  > 因为 `v-if` 是一个指令，所以必须将它添加到一个元素上。但是如果想切换(隐藏或显示)多个元素呢？此时可以把一个`<template>`元素当做不可见的包裹元素，并在上面使用 `v-if`。最终的渲染结果将不包含`<template>`元素。
  >
  > 这样做的好处就是不用再写一个`<div>`将需要隐藏的元素包裹

### `# v-show`

- **说明：** 条件切换`display`属性

### `# v-for`

- **说明：** 在data中定义一个数组`arr`，然后用`v-for="val in arr"`访问到

## 3. v-on

- **简写**：@
- **说明：** `v-on="fn()"`
  - 如果函数`fn`没有参数，直接写`fn`即可
  - 如果有参数，带括号传参即可
  - 如果需要一次性绑定多个事件，用对象的形式，比如`v-on="{mouseenter:entereDiv,mouseleave:leaveDiv}"` 这时候就不能简写了

## 4.全局组件和局部组件

### 全局组件

```javascript
Vue.component('my_web', {
    template: "<a target='_blank' href='https://www.fintinger.xyz'>Fintinger'blog✍</a>",
});
new Vue({
    el: "#app",
})
```

> **注意为component，单数**

### 局部组件

```javascript
let surf_web = {
    template: "<a target='_blank' href='https://www.fintinger.xyz'>Fintinger'blog✍</a>"
}
new Vue({
    el: "#app",
    components: {
        surf_web: surf_web
    }
})
```

> **注意为components，复数**

### Vue.extend( options )

- **参数**：

  - `{Object} options`

- **用法**：

  使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。

  ```javascript
  // 创建构造器
  var Profile = Vue.extend({
    template: '<p>{{firstName}} {{lastName}} aka {{alias}}</p>',
    data: function () {
      return {
        firstName: 'Walter',
        lastName: 'White',
        alias: 'Heisenberg'
      }
    }
  })
  // 创建 Profile 实例，并挂载到一个元素上。
  new Profile().$mount('#mount-point')
  
  //result: <p>Walter White aka Heisenberg</p>	
  ```

> Vue.extend可以利用$mount将构建的组件挂载到任意一个元素上，不一定是`#app`，但必须先实例化Profile,
>
> 组件中的data要通过function方法返回出来，而且不能使用箭头函数

## 5.驼峰式的一些坑

- 在定义组件名的时候，不能用"驼峰式"，应该用`_`或者`-`

- 定义函数名的时候最好也不用驼峰式，我在使用`this.$emit(fn,data)`时，使用驼峰式出现错误

## 6.组件间的通信

### 父子通信(自定义属性传参)

- **情形：**假设自定义一个`eg-el`组件，希望通过`<eg-el username="lsd"></eg-el>`这种方式传入username的值给到template使用

- **实现：**

  ```html
  <!--html-->
  <div id="app">
      <eg-el username="lsd"></eg-el>
  </div>
  <template id="egEl">
      <a :href="'/user/'+username">@{{username}}</a>
  </template>
  ```

  ```javascript
  //javascript
  let egEl={
      template:"#egEl",
      props:['username'],//这里使用到prop
  }
  new Vue({
      el:"#app",
      components:{
          "eg-el": egEl
      }
  })
  ```

### 子父通信(一个组间中包含另一个组件)

- **情形：** 假定有两个组件`<father>`和`<child>`，而`<father>`中有`<child>`组件，且子组件事件的触发需要引起父组件中的某些变化！

- **实现：**

  ```html
  <!--只使用父组件，子组件已经包含在父组件中，无需单独使用-->
  <div id="app">
      <my-balance></my-balance>
  </div>
  <!--子组件template-->
  <template id="show_balance">
      <button @click="myClick">我的余额</button>
  </template>
  <!--父组件template，其中使用到子组件！-->
  <template id="my_balance">
      <div>
          <show-balance @my_fn="toShowMyBalance"></show-balance>
          <p v-if="ToShow">您的余额为9800</p>
      </div>
  </template>
  ```

  > 这里的`@my_fn`是子组件中通过`this.$emit`出来的方法

  ```javascript
  /*注册父组件*/
  Vue.component("my-balance",{
      template: "#my_balance",
      methods:{
          toShowMyBalance:function (data) {
              this.ToShow=true
              console.log(data);//是子组件传入的数据
          }
      },
      data:function () {
          return{
              ToShow:false
          }
      }
  })
  /*注册子组件*/
    Vue.component("show-balance",{
      template: "#show_balance",
      methods: {
          myClick: function () {
              this.$emit("my_fn", {a: 1, b: 2})//$emit触发当前实例上的事件。附加参数都会传给监听器回调。
          }
      }
  })
  new Vue({
      el: "#app",
  })
  ```

### 平行组件通信(任意两个不相干的组件)

- **情形：** 假定有两个平行组件，需要一个组件能随着另一个组件的变化产生相应的变化！

- **实现**：[思路]首先定义全局Vue实例`let vm=new Vue()`,通过`vm.$emit`把fn和data传入，另一组件在[mounted](https://cn.vuejs.org/v2/api/#mounted)的时候用`vm.$on`接收，其中数据用回调`callback`接收（不严谨，后面有解释）！
  
  ```html
  <div id="app">
      <origin-input></origin-input>
      <deal-input></deal-input>
  </div>
  <template id="originInp">
      <div><h3>originInput:</h3><input type="text" v-model="oText" @keyup="o_input"></div>
  </template>
  <template id="dealInp">
      <div class="dealInp"><h3>dealInp:</h3>{{dText}}</div>
  </template>
  ```
  
  ```javascript
  /**
   *<origin-input>输入，在<deal-input>中也显示出来
   */
  let vm=new Vue()
  Vue.component("origin-input",{
      template:"#originInp",
      data:function () {
          return{
              oText:""
          }
      },
      methods:{
          o_input:function () {
              vm.$emit("d_input",this.oText)//类似trigger,出入的数据为this.oText
          }
      }
  })
  Vue.component("deal-input",{
      template: "#dealInp",
      data:function () {
          return{
              dText:""
          }
      },
      mounted:function () {
          vm.$on("d_input",(data)=>this.dText=data)//监听d_input事件的触发
      }
  })
  let app=new Vue({
      el:"#app",
  })
  ```
  > **关于` vm.$on`**
  >
  > ` vm.$on`会监听当前实例上的自定义事件。事件可以由 `vm.$emit` 触发。回调函数会接收所有传入事件触发函数的额外参数。
  >
  > 因此本例中的js部分从后往前阅读，则先是用` vm.$on`监听自定义事件`d_input`的触发并提供数据的处理回调，然后在上面用`vm.$emit`触发并传入数据

## 7.directive自定义指令

- **说明：** 定义`v-×××`这种指令

- **用法：**

  ```
  Vue.directive(name,callback(el,biding))
  ```

  - name：指令的名称，并不用指定为`v-×××`的形式
  - el：调用的元素
  - binding：`binding.value`为`v-×××`后面赋的值

- **详细用法：** [GO](https://cn.vuejs.org/v2/guide/custom-directive.html)

## 8.mixins混合

- **说明：** 是一个类似于封装函数的东西，将组建中的data，methods等封装起来公用

- **用法：**

  ```javascript
  //定义一个base公用对象，其中的data，methods可以复用，即使不用也无妨，mixins会挑有用的使用
  let base={
      data:function () {
          return{
              visible:false
          }
      },
      methods:{
          show:function () {
              this.visible=true
          },
          hide:function () {
              this.visible=false
          },
          toggle:function () {
              this.visible=!this.visible
          }
      }
  }
  Vue.component("show-details",{
      template:"#hove_details",
      mixins:[base]
  })
  Vue.component("more-details",{
      template:"#more_details",
      mixins:[base]
  })
  new Vue({
      el:"#app",
  })
  ```

## 9.slot插槽

- **说明：** 插槽的引入会让同一个组件的内容具有可更改行
- **用法：** 在template中用`<slot name="title">Title</slot>`指定插槽，在#app中利用`<div slot="titl e">Modified Title</div>` 使用插槽，其中**slot中的内容为默认值，而div中的为修改值，可以不指定**
- **具体用法：** [Go](https://cn.vuejs.org/v2/guide/components-slots.html)



---

skrskr~

