---
date: 2020-07-08
title: 一组循环数组
tags:
  - Javascript
  - myFunction
categories:
  - 前端
---
做网页轮播图，或者音乐播放列表时经常要用到一组循环的数组，到最后一项返回第一项，第一项返回最后一项

# 利用两次判断

```javascript
function doLoop( arr ){

    arr.loop_idx = 0;

    // 返回当前的元素
    arr.current = function(){

      if( this.loop_idx < 0 ){// 第一次检查
        this.loop_idx = this.length - 1;// 更新 loop_idx
      }

      if( this.loop_idx >= this.length ){// 第二次检查
        this.loop_idx = 0;// 更新 loop_idx
      }

      return arr[ this.loop_idx ];//返回元素
    };
    
    // 增加 loop_idx 然后返回新的当前元素
    arr.next = function(){
      this.loop_idx++;
      return this.current();
    };
    // 减少 loop_idx 然后返回新的当前元素
    arr.prev = function(){
      this.loop_idx--;
      return this.current();
    };
}
```

# 取余运算%

```javascript
function make_looper( arr ){

    arr.loop_idx = 0;

    // return current item
    arr.current = function(){
      this.loop_idx = ( this.loop_idx ) % this.length;// 无需检查 !!
      return arr[ this.loop_idx ];
    };

    // 增加 loop_idx 然后返回新的当前元素
    arr.next = function(){
      this.loop_idx++;
      return this.current();
    };
    
    // 减少 loop_idx 然后返回新的当前元素
    arr.prev = function(){
      this.loop_idx += this.length - 1;
      return this.current();
    };
}
```

**关于`this.loop_idx += this.length - 1`**

对于`arr=[1,2,3,4]`这样一个数组，执行`arr.prev`后，索引由`0,1,2,3`变成`3,4,5,6`，之后在`prev()`中执行`current()`索引又变成`3,0,1,2`,并不会出现索引超过`length`或者索引小于0的情况!