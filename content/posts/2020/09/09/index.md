---
date: 2020-09-09
title: Es6中的class类
tags:
  - Javascript
  - Es6
categories:
  - 前端
---
> class实质上是对js中继承的封装组合，用一种“语法糖”的形式实现原型链的继承

## 静态属性/方法

> 静态方法/属性是指，函数作为对象时，定义在其原型(`__proto__`)上的方法，而需要实例化继承的动态方法是定义在其原型对象(`prototype`) 中的，静态方法中的参数都是固定的，直接通过整个构造函数调用，实例化对象并不会继承；而动态方法中的参数会因为实例化对象的不同而产生改变，实例化对象默认是继承的。

```javascript
function User(){}
User.__proto__.show=function(){}
console.dir(User)
//这里的show()方法就属于静态方法
```

在class中，利用`static`定义静态属性/方法

```javascript
class Admin{
  static show(){}//__proto__中
  show(){}//prototype中
}
console.dir(Admin)
```

#### 关于class一些注意点

1. class中声明的方法在prototype对象中，由于默认的属性特征设置，这些方法是不可遍历的！

```javascript
class Admin{
  show(){}
}
console.log(
Object.getOwnPropertyDescriptor(
Admin.prototype,"show"
))
//enumerable: false
```

2. class中声明方法时，**方法之间不用`,`隔开！**
3. class中默认开启严格模式

## class中的属性保护

> 主要可以通过三种途径实现属性保护：Symbol,weakmap,私有属性

#### 1.Symbol

```javascript
/*利用Symbol创建一个受保护的属性的集合对象,无法直接获取，只能通过自定义的get/set方法*/

const protects = Symbol('受保护的属性')

class User {
    constructor(name) {
        this.name = name
        this[protects] = {
            host: 'https://www.fintinger.xyz',
            token: '5574f1b81bbe4e3847e7a83c0a84a442',
            password: '123456'
        }
    }

    set host(url) {
        if (!/^https?:/i.test(url)) {
            throw new Error('不合法的地址!')
        }
        this[protects].host = url
    }
    get password(){
        return this[protects].password
    }
}

let jqf = new User('jqf')
jqf.name = 'fin'
console.log(jqf);
jqf.host='https://123.com'
console.log(jqf);
console.log(jqf.password);//123456，由于设置了get，所以可以获取到
```

**注意：** 1.通过`[]`给value设置symbol类型的值，具有唯一性！

​			2.利用Symbol定义一个保护组，把所有需要保护的属性、方法封闭起来，这样还是可以通过查看结构看到受保护属性的key,value。 👇

![还是可以看得到值](https://gitee.com/fintinger/figure-bed/raw/master//images/20200909112923.png)

#### 2.weakMap

```javascript
/*利用Weakmap创建一个受保护的属性的集合对象,打印看不到*/

const protects = new WeakMap()

class User {
    constructor(name) {
        this.name = name
        protects.set(this, {
            host: 'https://www.fintinger.xyz',
            token: '5574f1b81bbe4e3847e7a83c0a84a442',
            password: '5_q38.ep%6'
        })
    }

    set host(host) {
        if (!/^https?:/i.test(host)) {
            throw new Error('不合法的地址!')
        }
        protects.set(this, {...protects.get(this), host})
    }

    get host() {
        return protects.get(this).host
    }

}


let jqf = new User('jqf')
// jqf.name = 'fin'
console.log(jqf);
console.log(jqf.host);
jqf.host = 'https://123.com'
console.log(jqf);
console.log(jqf.host);
/*console.log(jqf.password);*/

```

**注意：** 1.利用weakset定义受保护属性的组，之后用`.set()&.get()` 去获取/设置其中的值

​			2weakSet设置的值，外界无法直接看到。👇

![外界看不到通过weakMap设置的值](https://gitee.com/fintinger/figure-bed/raw/master//images/20200909113659.png)

#### 3.私有属性

```javascript
/*利用#定义私有方法，私有属性！*/
class User{
    name='jqf'
    #age=18
    #show=() => {console.log('ohhh')}
    show(){console.log(this.#age)}
}
console.dir(User)
let a=new User()
console.dir(a)
console.log(a.name)
a.show()
// console.log(a.#age)

// console.log(a.#age)
//Uncaught SyntaxError: Private field '#age' must be declared in an enclosing class
```

**注意：** 1.私有方法的定义需要利用变量赋值的方式，直接在函数前加`#`会报错

​			2.私有方法/属性只能在class内部访问

#### 4.总结

|                            |      公共属性/方法       |             受保护属性/方法              |              私有属性/方法               |
| -------------------------- | :----------------------: | :--------------------------------------: | :--------------------------------------: |
| **定义方法**               | `class User{name='jqf'}` |             `Symbol,Weakmap`             |                   `#`                    |
| **class本身可否获取修改**  |            √             |                    √                     |                    √                     |
| **实例化对象可否获取修改** |            √             | 不可以直接获取，需要在class中设置set/get | 不可以直接获取，需要在class中设置set/get |

## class中的继承

> 通过`extends`继承，继承后必须执行`super()`，而且是在使用this之前执行

```javascript
class User{
    constructor(name) {
        console.log('user.name');
    }
    show(){
        return this.name
    }
}
class Admin extends User{
    constructor(name) {
        console.log('admin.name');
        super();
    }
    show(){
        return this.name
    }
}

let ad=new Admin()
console.dir(ad);
```

## super关键字

> **super**关键字用于访问和调用一个对象的父对象上的函数。[GO](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Operators/super) 

#### 在多重继承中

👉 `this.__proto__`

> 三层以上的继承链中，反复使用`this.__proto__`会报错

```javascript
let father={
    name:'father',
    show(){
        console.log(this.name);
    }
}
let user={
    __proto__: father,
    name:'user',
    show (){
        this.__proto__.show.call(this)
        // console.log(this.name);
        //报错：这里的this.__proto__是user本身！！！
    }
}
let admin={
    __proto__:user,
    name:'admin',
    show(){
        this.__proto__.show.call(this)
    }
}
admin.show()
```

👉 `super`

```javascript
//使用super代替this.__proto__，不会出现同样的问题
let father={
    name:'father',
    show(){
        console.log(this.name);
    }
}
let user={
    __proto__: father,
    name:'user',
    show (){
        super.show.call(this)
    }
}
let admin={
    __proto__:user,
    name:'admin',
    show(){
        super.show.call(this)
    }
}
admin.show()
```

**说明：** super始终是当前对象的父级！显得很稳~

#### super使用父类方法以及传参

```javascript
class Tools {
    max(arr) {
        return arr.sort((a, b) => b - a)[0]
    }

    getByKey(key) {
        return this.data.filter(i => i.name.toUpperCase().includes(key.toUpperCase()))
    }
}

class Lesson extends Tools {
    constructor(data) {
        super();
        this.data = data
    }

    /*利用super使用父类方法*/
    get mostExpensive() {
        return super.max.call(null, this.data.map(i => i.price))
    }

    /*重写父类的方法*/
    getByKey(key) {
        return super.getByKey(key).map(i => i.name)
    }
}


let data = [
    {name: "JS", price: 198},
    {name: "CSS", price: 98},
    {name: "Vue.js", price: 99}
];
let lesson = new Lesson(data)
console.log(lesson);
console.log(lesson.mostExpensive);//198
console.log(lesson.getByKey('js'));//[ 'JS', 'Vue.js' ]
```

**说明：**

> super 关键字，既可以当作函数使用，也可以当作对象使用。在这两种情况下，它的用法完全不同。

#### 1、super当做函数使用

super 作为函数调用时，代表父类的构造函数。ES6 要求，子类的构造函数必须执行一次 super() 函数。注意：作为函数时，super() 只能用在子类的构造函数之中，用在其他地方就会报错。

👉 **super 作为函数调用时，内部的 this 指的是子类实例**

```javascript
class A {
  constructor() {
    this.show();
  }
}
class B extends A {
  constructor() {
    super();
  }
  show(){
    console.log('实例');
  }
  static show(){
    console.log('子类');
  }
}
new B() 　//输出 '实例' ，new B 时触发了 B 的构造函数，所以触发了 super 方法，即触发了父类 A 的构造函数，此时的 this.show 的 this 指的是子类
```

#### 2、super 作为对象使用

super 作为对象时，在普通方法中，指向父类的原型对象(`this.prototype`)；在静态方法中，指向父类(`this.__proto__`)。

👉 **super在普通方法中（即非静态方法）的 this 关键字指向**

在子类普通方法中通过 super 调用父类的方法时，方法内部的 this 指向的是当前的子类实例。

```javascript
class A {
  constructor() {
    this.x = 1;
  }
  print() {
    console.log(this.x);
  }
}
class B extends A {
  constructor() {
    super();
    this.x = 2;
　　super.y = 123;//如果通过super对某个属性赋值,这时super就是this,赋值的属性会变成子类实例的属性。
  }
  m() {
    super.print();
  }
}
let b = new B();
b.m() // 2
console.log(b.y);  //123
```

👉 **super在静态方法中及此时的 this 关键字指向**

super作为对象，用在静态方法之中，这时 super 将直接指向父类，而不是父类的原型对象。

在子类的静态方法中通过 super 调用父类的方法时，方法内部的 this 指向当前的子类，而不是子类的实例。

```
class A {
  constructor() {
    this.x = 1;
  }
  static print() {
    console.log(this.x);
  }
}
class B extends A {
  constructor() {
    super();
    this.x = 2;
  }
  static m() {
    super.print();
  }
}
B.x = 3;
B.m() // 3
```

## 静态属性&方法的继承

> 如果把构造函数当做对象来看，就可以在其本身加上属性，方法，这些其实都为静态的，在class中，用extends继承时，会自动继承静态的属性和方法

```javascript
// function User() {}
//
// User.name = 'jqf'
// User.show = function () {
//     console.log('User.static method');
// }
//
// function Admin() {}
//
// Admin.__proto__ = User
// Admin.show()

/*在class中，用extends继承时，会自动继承静态的属性和方法*/
class User {
    static name='jqf'
    static show=function (){
        console.log('User.static method');
    }
}

class Admin extends User{}

Admin.show()
// let ad=new Admin()
// ad.show()
```

**注意：** 类的实例化中并不会继承静态的属性/方法，只能用父类调用

## 内置类的继承增强

> 可以利用`extends` 继承js中的内置类，为其增加一些更加方便快捷的方法，是增强

```javascript
//为Array增加了remove()方法
class Arr extends Array {
    constructor(...args) {
        super(...args);
    }

    remove(item) {
        let pos = super.findIndex(val => val === item);
        super.splice(pos,1)
        return this
    }
}

let arr = new Arr(1, 2, 3)
console.log(arr);
console.log(arr.remove(2));
```

##  对象合并实现多继承

参考之前js继承和原型链章节中的[对象合并实现多继承](https://www.fintinger.xyz/posts/2020/09/04/JavaScript%E4%B8%AD%E7%9A%84%E7%BB%A7%E6%89%BF%E4%B8%8E%E5%8E%9F%E5%9E%8B%E9%93%BE%E5%88%86%E6%9E%90.html#h2-3-h4-5)

只需要合并`User.prototype`和需要的对象即可！

