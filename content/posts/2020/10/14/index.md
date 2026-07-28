---
title: PHP语法小结
date: 2020-10-14
categories:
 - 后端
 - 学习总结
tags:
 - PHP 
---

## 基本语法

### 输出语句

| 语句       | 功能                      |
| ---------- | ------------------------- |
| `echo`     | 输出字符串类型            |
| `print_r`  | 输出引用类型(对象,数组等) |
| `var_dunp` | 检测变量类型              |

::: tip
`echo`语句可用于给前端返回响应体。比如前端通过`ajax`请求，可以在`xhr.response`中直接得到`echo`的内容
:::

### 变量&常量

👉🏼 **变量**

| 语句      | 功能             | 返回值  |
| --------- | ---------------- | ------- |
| `isset()` | 检测变量是否存在 | boolean |
| `unset()` | 删除某个变量     | none    |

👉🏼 **常量**

常量用`const` 或 `define` 定义，常量名一般全部大写，不受作用域的限制

::: tip

一般是define在类外定义常量，const在类内定义常量，并且const必须通过`类名::变量名`来进行访问。但是php5.3以上支持类外通过const定义常量。

:::

:::danger

`const`不能在条件语句中使用，必出错

:::

> 参考文章 [《PHP中define() 与 const定义常量的区别详解》](https://www.jb51.net/article/163855.htm)

### 三元表达式及@使用

**省略写法**

```php
echo $name?:'NO';//输出本身的话，可以省略！
```

**`??`的作用**

①检测变量是否定义(`isset`) ②检测变量是否为空(`is_null`)

```php
echo $name??'NO';//NO
```

**@用来屏蔽错误**

```php
@(9/0)//不会报错
```

### 字符串相关函数

#### 定界符

以`<<<`开头，用相同字符串定义开头&结尾。

::: details

```php
$temp=<<<tem
<h1 style="color: #e01">这是一段临时HTML模板</h1>
<h5 style="color: #00b3ff">hhc</h5>
<script>
document.querySelector("h5").addEventListener("mouseenter",function (){
    this.style.color="#000";
})
</script>
tem;
```

:::

#### 字符串连接

`.`符号用来连接字符串

::: details

```php
$str="fer.com";
echo $str."=>"."hhhhc";
```

:::

#### 字符串长度

| 方法          | 参数              | 作用                                                   |
| ------------- | ----------------- | ------------------------------------------------------ |
| `strlen() `   | `[$str]`          | 获得字符串长度，中文一个字两个字符！                   |
| `mb_strlen()` | `[$str,encoding]` | 指定编码格式获取长度，指定为`utf8`，中文一个字一个字符 |

#### 字符串格式

| 方法                            | 作用                           |
| ------------------------------- | ------------------------------ |
| `trim()`                        | 去空格                         |
| `strtoupper()`&`strtolower`     | 大小写转换                     |
| `ucfirst()`                     | 指定一段字符串首字母大写       |
| `ucwords($sentence,delimiters)` | 以delimiters为分割，首字母大写 |

::: details

```php
$sentence="my name is jqf.let's go shopping!";
echo "<hr>";
echo ucwords($sentence,'.');//My name is jqf.Let's go shopping!
```

:::

#### 与数组相互转化

`explode(delimiter,$str)` & `implode(glue,$arr)`

#### 截取字符串

`substr($str,start,len)` & `mb_substr($str,start,len,encoding)`，返回截取的字符串，原字符串不会发生改变

#### md5加密

::: theorem MD5
**MD5信息摘要算法**（英语：MD5 Message-Digest Algorithm），一种被广泛使用的[密码散列函数](https://baike.baidu.com/item/密码散列函数/14937715)，可以产生出一个128位（16[字节](https://baike.baidu.com/item/字节/1096318)）的散列值（hash value），用于确保信息传输完整一致。

::: right
来自[百度百科](https://baike.baidu.com/item/MD5/212708)
:::

### 引入模块

| 方法                       | 说明                                                         |
| -------------------------- | ------------------------------------------------------------ |
| `include` & `include_once` | 弱引用，如果引入的文件不存在则会`warning`(可以用`@`屏蔽掉)，但后续代码仍然执行 |
| `require` & `require_once` | 强引用，所引文件不存在则会报`fatal mistake`,后续不再执行     |

::: tip

`include_once` & `require_once`用来避免**引入多次某个模块而造成的错误**，具体如下

:::

::: details

```php
//tools.php
<?php
function show(){
    return 'https://www.fintinger.xyz';
}
```

```php
//1.php
<?php
include 'tools.php';
echo show();
```

```php
//2.php
include_once "1.php";
include_once "tools.php";
```

`2.php`中引入了两次`tools.php`，通过`include_once`可以避免产生错误

:::

### 函数相关

#### 点语法

类似于javascript，可以在函数传参数的时候实现"聚合"的效果

::: details

```php
<?php
function sum(...$nums){
    print_r($nums);
    echo "<hr>";
    echo array_sum($nums);
}
sum(1,2,3,4,4,5,6,6,7,7,7,7);
```

:::

#### 传址&传值

`&` 用来传址

#### 严格模式

`declare(strict_types=1);`声明严格模式，严格模式下，如果约束了函数参数的类型，传入不是约束的值，会报错。

```php
declare(strict_types=1);
function sum(int ...$nums){
    return array_sum($nums);
}

echo sum(1,2,3,4,'5');//Fatal error
```

#### php标准的函数

```php
function show(int $var): string
{
    return 'hhc';
}//参数(php>5)和返回值(php>7)都有明确的类型约束
```

#### 好用的变量函数！

```php
$action="fn";
function fn(){
	//do something
}
$action()//即可调用fn函数
```

**具体应用** ：根据图片后缀设定对应处理函数

::: details

```php
function png()
{
    return 'png fn running...';
}

function jpg()
{
    return 'ipg fn running...';
}

$file = 'logo.png';

$action = explode('.', $file)[1];

echo function_exists($action)
    ? $action()
    : '无法处理这种格式的图片！';
```

:::

### 数组相关

#### 指针读取数组

`current($arr)`&`next($arr)` 操作数组指针，如果读取不到，current则为0

#### list()

list — 把数组中的值赋给一组变量。

```php
$info = array('coffee', 'brown', 'caffeine');

// 列出所有变量
list($drink, $color, $power) = $info;
echo "$drink is $color and $power makes it special.\n";
```



::: tip

在 PHP 7.1.0 之前的版本，**list()** 仅能用于数字索引的数组，并假定数字索引从 0 开始。

:::

也就是说 PHP>7.1.0，list可以用来解构`key=>value`型数组了

::: details

```php
$arr=[
    "age"=>"18",
    "name"=>"fin",
];
list("name"=>$name,"age"=>$age)=$arr;
echo $name;//fin
```

关于PHP中类似于ES6的对象解构赋值操作，有种更加稳妥方便的方式，那就是[extract()](https://www.php.net/manual/zh/function.extract.php)

```php
$arr=[
    "age"=>"18",
    "name"=>"fin",
];
extract($arr, EXTR_PREFIX_SAME, "wddx");//重复则覆盖，前缀为"wddx"
echo $name;//fin
```

:::

::: warning

PHP 5 里，**list()** 从最右边的参数开始赋值； PHP 7 里，**list()** 从最左边的参数开始赋值。

如果你用单纯的变量，不用担心这一点。 但是如果你用了具有索引的数组，通常你期望得到的结果和在 **list()** 中写的一样是从左到右的，但在 PHP 5 里实际上不是， 它是以相反顺序赋值的。

通常而言，不建议依赖于操作的顺序，在未来可能会再次发生修改。

:::

#### 操作数组

`foreach()`遍历数组

```php
foreach($arr $index=>$item){
    //可以获取索引和数组中的item
}
```

传址修改原数组

```php
foreach ($arr as &$item){
    //do something(修改传址进来的数组元素)
}
```

#### 数组增删操作

|            | 增              | 删            |
| ---------- | --------------- | ------------- |
| 从末尾     | `array_push`    | `array_pop`   |
| 从开始位置 | `array_unshift` | `array_shift` |

#### 其他方法（类似JS中）

```php
/*遍历*/
array_map()
array_values()
array_keys()
array_filter()


/*判断*/
array_key_exists()
in_array()

/*合并*/
array_merge()//[originArr,newArr]
array_change_key_case() //修改key的大小写小:0/CASE_LOWER 大:1/CASE_UPPER
```

::: details

```php
//递归实现多维数组key的大小写转换
<?php
$config = [
    "hOst" => "localhost",
    "POST" => 8000,
    "uSeR" => "admin",
    "cache" => [
        "hOst" => "127.0.0.1",
        "user" => [
            "namE" => "jqf",
            "token" => "qq9ad2437c622bdd38"
        ]
    ]
];
/**
 * @param array $arr
 * @param string $type
 * @return array
 */
function fin_array_change_key_case(array $arr, string $type = 'CASE_UPPER'): array
{
    $action = $type == "CASE_UPPER" ? 'strtoupper' : 'strtolower';
    foreach ($arr as $k => $v) {
        //删掉原先的
        unset($arr[$k]);
        //新的数组
        $arr[$action($k)] = is_array($v)
            ? fin_array_change_key_case($v)
            : $v;
    }
    return $arr;
}

$res = fin_array_change_key_case($config);
print_r($res);
```

:::

::: tip

`array_walk_recursive($arr,function (&$v,&$k,$case){}`，专门用于递归遍历多维数组，注意其中自动传入址

:::

### 时间相关

#### 基本操作

设置时区

```php
date_default_timezone_set(timezone_identifier)
```

**注：** timezone_identifier取值有"PRC"，"Asia/chongqing  "，"Asia/shanghai"，"Asia/urumqi"等，分别对应时区

格式化时间

```php
date('Y-m-d h:m:s');
```

时间戳

```php
time()
microtime(true)//true 返回浮点数 false 返回字符串
```

::: details

```php
<?php
//得到函数执行时间的函数
/**测试函数执行时间
 * @param null $begin
 * @param null $end
 * @return array|float|mixed|string
 */
function runtime($begin = null, $end = null)
{
    static $cache = [];
    if (is_null($begin)) {
        return $cache;
    } elseif (is_null($end)) {
        return $cache[$begin] = microtime(true);
    } else {
        //👇🏼！！！！
        $end = $cache[$end] ?? microtime(true);
        return round($end - $cache[$begin],2);
    }
}

//测试for和while循环
$LEN=10000000;

//1.for
runtime('for');
for ($i = 0; $i < $LEN; $i++) {}
runtime('forEnd');
echo 'for循环:'.runtime('for', 'forEnd');

echo "<hr>";

//2.while
runtime('while');
$i=0;
while ($i<$LEN){$i++;};
runtime('whileEnd');
echo 'while循环:'.runtime('while', 'whileEnd');
echo "<hr>";
echo '总执行时间:'.runtime('for','whileEnd');
```

:::

#### 一些相关函数

```php
<?php
//date() =>填参数得到不同的结果
//getdate() =>返回数组

/*转为时间戳*/
//具体查手册
//strtotime() =>参数为str,比如"NOW","2020-04-02 10:00:00"...
//strtotime('+1 year +10 day')=>1年10天后
//strtotime('next friday')=>下个星期五
```

#### 内置时间类

**Date()对象**

```php
<?php

//new Date()->format()//%m月%d天%h小时,一共%a天
//new Date()->setdate()
//new Date()->diff() 获取俩时间差值
//...

```
**DateInterval()对象**

```php
//参数'P2DT2H5M'=>增加2d2h5m
//P->开始,  D->'day',  T->分割日期和时间
//配合new Date->add($interval)函数使用！！！
```

### 正则表达式

**相关函数**

```php
<?php
//preg_match(reg,str,res) =>匹配一个
//preg_match_all()=>所有

//preg_split(reg,str)=>拆分字符串，返回处理后结果

//preg_replace(reg,val_replace,str)=>替换
//preg_replace_callback(reg,fn,str)=>fn中接收$matches实现复杂逻辑
```

::: warning

注意字符串操作函数的区别,`str_split` 等

:::



## COOKIE

cookie是客户端存储数据的手段，并在请求服务器时自动携带cookie数据。

::: tip

COOKIE 保存在浏览器

:::

### 设置

⚡ `setcookie()`

**参数:**

| 参数         | 说明                                                         |
| ------------ | ------------------------------------------------------------ |
| **name**     | Cookie的名称                                                 |
| **value**    | cookie的价值。该值存储在客户端计算机上; 不要存储敏感信息     |
| **expires**  | Cookie过期的时间。这是一个Unix时间戳，可以使用[time（）](https://www.php.net/manual/en/function.time.php)函数加上希望它到期之前的秒数来设置它。 |
| **path**     | 服务器上可以使用cookie的路径。如果设置为*“/”*，则cookie将在整个范围内可用 |
| **domain**   | cookie可用的域。（例如*“www.houdunren.com”*）将使cookie可用于该子域及其所有其他子域（即w2.www.houdunren.com）。要使cookie可用于整个域（包括其所有子域），只需将值设置为域名（在本例中为*“houdunren.com”*） |
| **secure**   | 表示cookie应仅通过客户端的安全HTTPS连接传输                  |
| **httponly** | 当**TRUE**cookie只能通过HTTP协议访问时。这意味着脚本语言（例如JavaScript）无法访问cookie。 |

来源: [后盾人教程](https://houdunren.gitee.io/note/php/8%20%E4%BC%9A%E8%AF%9D%E6%8E%A7%E5%88%B6.html#%E8%AE%BE%E7%BD%AE)

## SESSION

### 概述

session是服务器会话状态，可用于记录访问用户后台会话数据。不同用户或一个用户用不同浏览器在同一网站发起php请求会产生不同的session，然后保存在本地文件夹(session.save_path)或者其它端。

::: tip

与COOKIE不同，SESSION保存在本地

:::

![Chrome中](https://gitee.com/fintinger/figure-bed/raw/master//images/20201002191828.png)

保存的session在同一域下都可以通过`$_SESSION`访问到，为数组形式。

### 基本使用

```php
session_start();//开始
$_SESSION["web"] = "https://www.fintinger.xyz";//设置数据
print_r($_SESSION);//可以通过超全局数组获取
```

### 配置

#### SESSION储存目录

```php
session_save_path("./temp");//查看或设置
```

#### 自定义Name&Value

```php
//id一般在自定义session引擎的时候设置
session_name("jqf");
session_id("123");
session_start();//配置在开始之前
```

![自定义Name&Value](https://gitee.com/fintinger/figure-bed/raw/master//images/20201002193918.png)

### GC垃圾回收机制

> 如果使用默认的SESSION处理引擎，修改php.ini的配置即可

#### 过期时间

`session.gc_maxlifetime` 设置文件过期时间，默认为1440s = 24min。

::: tip

如果(下面讲到的概率)调用这个函数，就会遍历保存SESSION的文件夹，判断如果本次产生SESSION与上次产生相差超过24min就会删除上次产生的SESSION，更新为本次保存的SESSION($session_id不会改变，即文件名)。

:::

#### 调用概率

> 如果每次调用php，都回去保存SESSOIN的文件夹遍历，进行垃圾回收(GC)，当用户量很多时，就会很大程度上影响性能，因此加入了概率这一概念，即每次调用php时，启动垃圾回收程序的概率`session.gc_probability/session.gc_divisor`

👉 `session.gc_probability` 基率

session清除无效session的基率。

👉 `session.gc_divisor `

启动垃圾回收程序的概率。概率计算公式为：session.gc_probability / session.gc_divisor，如果网站访问量大建议将概率降低如 1 / 1000 ~ 5000。

### 自定义SESSION处理引擎

#### 使用

::: warning

在start之前设置，`session_set_save_handle(new FileHandle)`括号中为自定义的处理类

:::

然后按照正常session处理使用即可！

#### 定义

🎈 使用 `SessionHandlerInterface` 接口(implements)

```php
class FileHandle inplements SessionlandlerInterface{}
```

🎈**标准模板**

```php
<?php


class FileHandle implements SessionHandlerInterface
{

    /**
     * @inheritDoc
     */
    public function close()
    {
        // TODO: Implement close() method.
    }

    /**
     * @inheritDoc
     */
    public function destroy($session_id)
    {
        // TODO: Implement destroy() method.
    }

    /**
     * @inheritDoc
     */
    public function gc($maxlifetime)
    {
        // TODO: Implement gc() method.
    }

    /**
     * @inheritDoc
     */
    public function open($save_path, $name)
    {
        // TODO: Implement open() method.
    }

    /**
     * @inheritDoc
     */
    public function read($session_id)
    {
        // TODO: Implement read() method.
    }

    /**
     * @inheritDoc
     */
    public function write($session_id, $session_data)
    {
        // TODO: Implement write() method.
    }

}
```

逐一实现其中方法即可！

#### 实例

```php
<?php

/**
 * Class FileHandle
 * @param $path //session储存路径
 * @param $maxlifetime //session文件过期时间
 */
class FileHandle implements SessionHandlerInterface
{

    protected $path;

    protected $maxlifetime;

    public function __construct($path = "session", $maxlifetime = "1440")
    {
        $this->path = $this->mkdir($path);
        $this->maxlifetime = $maxlifetime;
    }

    private function mkdir($path)
    {
        is_dir($path) || mkdir($path);

        return realpath($path);
    }

    public function close(): bool
    {
        return true;
    }

    public function destroy($session_id): bool
    {
        if (is_file($this->path."/".$session_id)) {
            @unlink($this->path."/".$session_id);
        }

        return true;
    }

    public function gc($maxlifetime): bool
    {
        foreach (glob($this->path."/*") as $file) {
            if (filemtime($file) + $this->maxlifetime < time()) {
                @unlink($file);
            }
        }

        return true;
    }


    public function open($path, $name): bool
    {
        return true;
    }

    public function read($session_id): string
    {
        return (string)@file_get_contents($this->path."/".$session_id);
    }

    public function write($session_id, $session_data): bool
    {
        return (bool)@file_put_contents($this->path."/".$session_id, $session_data);
    }

}
```

**注意：** 

⚡ 处理的路径要为绝对路径才行，可以利用`realpath($path)`得到

⚡ 实现的方法就是，“开，关，读，写，卸，垃”，本方法中"开，关"没有做过多的处理

#### What't more💭

在write方法中添加延迟`sleep()`，并且修改`php.ini` 中的调用概率为1(`session.gc_divisor `=1)，即每次都调用垃圾回收，就可以看到session是在删除之后再被重新创建的！

## 文件操作

### 指针操作函数

`fseek($handle,int offset)` =>移动文件中指针

`fread($handle,length)` =>读取文件操作，指针会自动移动到length位置

::: tip

$handle 为`source` 类型，通过`fopen()`函数获得

:::

### 文件打开与写入操作fopen函数详解：

`fopen($path,mode)` ,mode的取值如下

| 模式 | 功能             | +模式        | 二进制文件         | 文件不存在 | 文件存在                               |
| ---- | ---------------- | ------------ | ------------------ | ---------- | -------------------------------------- |
| r    | 读取文件不可写   | r+可写入文件 | r+b 操作二进制文件 | 创建       | 操作                                   |
| w    | 从头写入，不可读 | w+可读取文件 | w+b..              | 创建       | 操作                                   |
| a    | 追加内容不可读取 | a+可读取     | a+b                | 创建       | 操作                                   |
| x    | 从头写入，不可读 | x+可读       | x+b                | 创建       | 不会打开，fopen返回false，产生一个警告 |

::: warning

操作二进制文件(图片等，需要设置头信息)，比如:`header('Content-type:image/jpg');`

:::

### 其他操作函数

读取操作

```php
<?php
$handle=fopen("file/test.txt",'r');

//feof($handle)=>文件读取是否完毕
//while (!feof($handle)){
//    echo fread($handle,1);
//}


//fgetc($handle)=>每次读取一个字符！
while (!feof($handle)){
    echo fgetc($handle);
}


//fgets($handle)=> 每次一行！

//fgetss($handle)=>v7.3弃用，
//fgetcsv($handle,split)=>读取，并指定用什么分割开来
```

权限判断，检查文件

```php
//文件&目录权限
//is_writable()
//is_readable()

//文件&目录检查
//file_exists()
//is_file()&is_dir()
```

### 快速读取&写入文件

`file_get_contents(filename|url)` 获取文件内容

`file_put_contents(filename,data)` =>w模式写入

`file_put_contents(filename,data,FILE_APPEND)` =>a模式写入

### 文件复制移动

**文件复制**

`copy($source,$dest)`

**文件移动**

`rename($oldname,$newname)`

**注：** `rename()` 同时具有重命名和移动文件的功能

### 目录操作函数

👉 `is_dir()`

**用途：** 判断是否存在该目录

👉 `mkdir($pathname,mode,recursive)`

**参数：**

[1] **$pathname** 路径

[2] **mode** 默认0777,意味着最大可能的访问权，一般设定为0755

::: warning

mode在windows 下被忽略

:::

**recursive** 是否递归创建，

```php
mkdir("a/b/c",0755,true)
```

👉 `readdir()` 

**说明：** 调用一次就读取一个当前目录下的文件或文件夹，读取不到则返回false

**注意：** readdir 方法会读取到"." 和 ".."这两个默认存在的目录

👉 `scandir()` 

**说明：** 相当于循环`readdir()`

👉 `glob()`

**说明：** 目录的遍历操作

**参数：**

[1] pattern 模式

```php
glob("./*")//当前路径下所有
glob("./*.php")//当前路径下的php文件
glob("{./*.php,*.txt}")//当前路径下php和txt
```

[2] flag

```php
//GLOB_MARK =>后面补 "/"
//GLOB_NOSORT =>使用系统默认排序
//GLOB_ERR =>没有权限操作目录时，停止所有动作（默认跳过）
//GLOB_NOCHECK =>目录不存在，返回模式
```

### 共享锁和独占锁

> `flock($handle,$operation)` 函数用来给文件上锁

| $operation | 名称   | 作用                                                     |
| ---------- | ------ | -------------------------------------------------------- |
| LOCK_SH    | 共享锁 | 如果是读取，不需要等待，但如果是写入，需要等待读取完成。 |
| LOCK_EX    | 独占锁 | 无论写入/读取都需要等待。                                |
| LOCK_UN    | 释放锁 | 无论使用共享/读占锁，使用完后需要解锁。                  |
| LOCK_NB    |        | 当被锁定时，不阻塞，而是提示锁定                         |

::: warning

windows不支持`$operation = LOCN_NB` ，也不支持flock的第四个参数,具体[GO](https://www.php.net/manual/zh/function.flock.php)

:::


> **情景1** 用户u1正在读取文件，u2的写入操作等到u1读取完毕之后(产生阻塞)才能再进行

```php
//u1.php
$handle=fopen("jqf.txt","r");
flock($handle,LOCK_SH);
sleep(3);//模拟写入操作的延时
echo fread($handle,99);
flock($handle,LOCK_UN);
fclose($handle);
```

```php
//u2.php
$handle = fopen("jqf.txt", "a+");
flock($handle, LOCK_EX);
fwrite($handle, '*hm');
fseek($handle, 0);
echo fread($handle, 99);
flock($handle,LOCK_UN);
fclose($handle);
```

> **情景2** u1写完之后（产生阻塞）u2才能读取

```php
//u1.php
$handle = fopen('jqf.txt', 'a+');
flock($handle, LOCK_EX);
sleep(3);
fwrite($handle, '*hm');
fseek($handle, 0);
echo fread($handle, 99);
flock($handle, LOCK_UN);
fclose($handle);
```

```php
//u2.php
$handle=fopen('jqf.txt','r+');
flock($handle,LOCK_SH);
echo fread($handle,99);
flock($handle,LOCK_UN);
fclose($handle);
```

### 关于文件和目录操作常用的一些函数

**[1] 格式化获取磁盘大小以及磁盘可用大小**

::: details

```php
/**格式化获取磁盘空间大小
 * 注意数组的顺序，判断由大到小!!!!
 * @param int $total
 * @return string
 */
function space_total(int $total):string
{
    $config=[3=>'GB',2=>'MB',1=>'KB'];
    foreach ($config as $num=>$unit) {
        if ($total>pow(1024,$num)){
            return round($total/pow(1024,$num)).$unit;
        }
    }
    return $total.'B';
}

echo "<hr>";
echo '磁盘总大小：'.space_total(disk_total_space('.'));
echo "<hr>";
echo '剩余大小：'.space_total(disk_free_space('.'));
```

:::

**[2]利用filetime实现缓存机制**

::: details

```php
/**
 * 如果刷新页面前后不超过10s，将会一直走缓存,否则会更新缓存
 * ob_start()&ob_get_contents()可以在引入时获取引入内容
 */
$CACHE = 'file/文件缓存/file.cache.php';
$BLADE = 'file/文件缓存/file.blade.php';

if (is_file($CACHE) && filemtime($CACHE) > time() - 10) {
    echo 'is cache...';
    include $CACHE;
} else {
    ob_start();
    include $BLADE;
    $content = ob_get_contents();
    file_put_contents($CACHE, $content);
}
```

:::

**[3] 利用var_export()快速生成配置文件**

::: tip

var_export 类似于 var_dump，当其第二个参数为TRUE时，会返回一个变量，而不是输出它

:::

::: details

```php
<?php
$db = ["host" => "localhost", "port" => 2000, "pwd" => "admin888"];
//不带true会输出符合php语法的数组
$config = var_export($db, true);

file_put_contents('file/var_export_config.php', "<?php return " . $config . ";");
```

:::

**[4] 统计目录大小**

::: details

```php
/**统计目录大小
 * @param string $dir
 * @return int
 */
function dir_size(string $dir = "."): int
{
    $size = 0;
    foreach (glob($dir . "/*") as $file) {
        $size += is_file($file)?filesize($file):dir_size($file);
    }
    return $size;
}
```

:::

**[5] 递归复制整体目录**

:::details

```php
/**递归复制整体目录
 * @param string $from
 * @param string $to
 * @return bool
 */
function copy_dir(string $from, string $to): bool
{
    !is_dir($to) && mkdir($to, 0755, true);
    foreach (glob($from . "/*") as $file) {
        $target = $to . "/" . basename($file);
        is_file($file)
            ? copy($file, $target)
            : copy_dir($file, $target);
    };
    return true;
}
```

:::

**[6] 删除多级目录**

::: danger

目录的删除操作一定要小心！避免目录层级错误导致的误删

:::

::: details

```php
/**删除多级目录
 * 千万小心！！！
 * @param string $dir
 * @return bool
 */
function del_dir(string $dir)
{
    if (!is_dir($dir)) {
        return true;
    }
    foreach (glob($dir . "/*") as $file) {
        is_file($file) ? unlink($file) : del_dir($file);
    }
    return rmdir($dir);
}
```

:::

::: tip

**目录的移动** 等价于复制+删除

:::

## 命名空间

> 在电脑的文件系统中，fin.txt这个文件在一个文件夹下不能同时存在两份，只能另建文件夹将二者分开，这就类似命名空间的概念，利用命名空间可以将类，函数或者常量的同名者分隔开来，避免产生冲突

### 几个关键字

#### 1. namespace

用`namespace`关键字声明一个类的命名空间，如果当做文件系统来看就是讲文件放到某个确定的位置，可以通过层级的文件夹路径找到。

::: tip

标准规范就是，类的命名空间与其所处文件夹名对应

:::

::: danger

namespace之前的代码都不会执行！

:::

#### 2.use

use关键字导入声明了命名空间的类等，所有支持命名空间的PHP版本支持三种别名或导入方式：为类名称使用别名、为接口使用别名或为命名空间名称使用别名。PHP 5.6开始允许导入函数或常量或者为它们设置别名。

具体方法：

::: details

```php
namespace foo;
use My\Full\Classname as Another;

// 下面的例子与 use My\Full\NSname as NSname 相同
use My\Full\NSname;

// 导入一个全局类
use ArrayObject;

// importing a function (PHP 5.6+)
use function My\Full\functionName;

// aliasing a function (PHP 5.6+)
use function My\Full\functionName as func;

// importing a constant (PHP 5.6+)
use const My\Full\CONSTANT;
```

:::

#### 3.自动加载

::: tip

如果两个类定义在不同的php文件中，使用use声明命名空间或者类之后，还需要用include/require引入进来，略微有点麻烦，我们希望有种自动处理的方法，使得我们只需要使用use声明，而include自动完成！

:::

**方法1 函数实现**

`spl_autoload_register()` 函数当使用use声明的命名空间类不存在时，会，自动调用该函数

```php
<?php
namespace App;

spl_autoload_register(
    function ($name) {
        $file = str_replace("\\", "/", $name).".php";
        require $file;
    }
);

use App\Module\Shop\Server\Member;
Member::show();
```

**方法2 面向对象形式**

::: warning

自动加载类需要与使用者在同一命名空间下，或者使用use&include正确引入

:::

```php
//Autoload.php类
namespace App;

class Autoload
{
    public static function boot()
    {
        spl_autoload_register([new self, "autoload"]);//注意传参方式
    }
    public function autoload($name)
    {
        $file = str_replace("\\", "/", $name).".php";
        require $file;
    }
}

Autoload::boot();//自动调用静态方法，引入之后不需调用
```

```php
//use.php
namespace App;
include "Autoload.php";
use App\Module\Shop\Server\Member;

Member::show();
```

**方法3 第三方工具—composer**

初始化

```sh
composer init
```

修改配置

```json
"autoload":{
    "psr-4":{
    "App\\":"App"
    }
}
```

构建

```sh
conposer build
```

然后引入生成的vendor文件夹下的autoload.php即可！

## 面向对象

> 使用类的方式实现某一功能，通过继承让代码变得更易维护

### 类中的量&方法

#### 静态变量&方法

```php
class User{
    protected static $name="fin";
    public static function show(){
        return self::$name;//self 关键字表示当前对象，
    }
}
$u=new User();
echo $u->show();
echo User::show();
```

静态方法/属性通过`类名::方法/属性`的方式调用

#### 常量

```php
class Model
{
    const EXISTS_VALUE=1;
}
echo Model::EXISTS_VALUE;
$m=new Model();
echo $m::EXISTS_VALUE;
```

- 常量名规范上全部大写

- 常量永远不会被改变

#### private&protect的区别

**主要区别在继承上：**

- `protect`定义的方法，继承后能在子类中直接访问
- `private`只供当前对象使用，继承后的子类无法访问

#### 构造函数与解析函数(魔术方法)

```php
class Test
{
    public function __construct()
    {
        echo "__construct";
    }

    public function __destruct()
    {
        echo "__destruct";
    }
  /*  public function __run()
    {
        echo "__run";
    }*/
}

new Test();
```

**说明：**

- 两者都会在new对象的时候自动执行
- 名称不可以自定义
- 前者一般用来赋值操作，后者做一些资源的释放等

### 继承&特殊类 

#### 单链式继承

> 用到`extends`关键字

🎈**防止继承后子类覆盖父类方法**

```php
class Father{
    private static $name="jqf";
    public final function show(){
        return Father::$name;
    }
}
class Child extends Father{
//    public function show(){}//Cannot override final method
}
```

利用`final`关键字定义父类中的方法，就可以避免父类方法被重写

#### 多继承

> 用`trait` 关键字定义类，用`use`引入

```php
<?php

trait Commit
{
    public function publish()
    {
        return __METHOD__;
    }
}

trait Log
{
    public function show()
    {
        return __METHOD__;
    }
}

class Topic
{
    use Commit, Log;
}

$topic = new Topic;
echo $topic->publish();
echo "<hr>";
echo $topic->show();
```

🎈 **多继承后的优先级**

当继承后方法名重复时，优先级为:`子类方法 > trait > extend`

🎈 **多继承方法名冲突问题**

```php
//类中方法名冲突，通过替换+改名解决
use Commit, Log{
    Commit::show insteadof  Log;//设置优先级
    Log::show as export;//优先级低的改名
}
```

设置优先级→优先级低的改名

🎈 **重新定义父类方法的访问权限**

```php
use Commit{
    Commit::publish as protected;
}
```

`protect`与`public`之间相互转换

#### 特殊类

| 特殊类 | 使用        | 说明                                                         |
| ------ | ----------- | ------------------------------------------------------------ |
| 抽象类 | `abstract`  | 子类必须实现其中声明的抽象方法                               |
| 接口   | `interface` | 类似一个标准,凡是通过 `implements` 关键字使用该接口的类，必须实现其中的所有方法 |
| 特征类 | `trait`     | 定义类用于多继承                                             |

### 魔术方法

> 魔术方法定义在父类当中，由子类触发

#### 属性相关

| 方法                  | 调用条件                                           |
| --------------------- | -------------------------------------------------- |
| `__get($name)`        | 获取对象中的**不可访问或不存在**的变量时会自动调用 |
| `__set($name,$value)` | 给对象设置**不可访问**值会自动调用                 |
| `__unset($name)`      | 删除对象中的**不可访问或不存在**变量会调用         |
| `__isset($name)`      | 判断对象中是否存在某变量调用                       |

#### 方法相关

| 方法                             | 调用条件                             |
| -------------------------------- | ------------------------------------ |
| `__call($name, $arguments)`      | 子类实例化调用的方法在子类中不存在时 |
| `__callStatic($name,$arguments)` | 子类静态方法不存在时                 |

#### 特殊

| 方法            | 调用条件                                                     |
| --------------- | ------------------------------------------------------------ |
| `__construct()` | `new` 即调用                                                 |
| `__destruct()`  | `new` 即调用                                                 |
| `__toString`    | 直接输出对象引用，不会产生错误，自动调用该方法,输出该方法中返回的字符串 |

## 错误&异常处理

### 错误

> 通过`error_reporting(0)`屏蔽系统默认的所有错误处理，然后通过`set_error_handler`设置自定义错误处理函数，第一个参数为函数，第二个为要处理的错误，默认为处理所有错误(E_ALL | E_STRICT),[[官网](https://www.php.net/manual/zh/function.set-error-handler.php)]

#### 错误处理函数的参数

| 参数       | 是否可选(Y/N) | 作用                                                         |
| ---------- | ------------- | ------------------------------------------------------------ |
| `$errcode` | N             | 是一个 integer，包含了错误的级别([错误码](https://www.php.net/manual/zh/errorfunc.constants.php)) |
| `$errmsg`  | N             | 是一个string，包含了错误的信息                               |
| `$errfile` | Y             | 是一个string，包含了发生错误的文件名                         |
| `$errline` | Y             | 是一个 integer，包含了错误发生的行号                         |

> 然后通过`error_log`函数选择将错误相关的信息发送到某个地方

```php
error_log ( string $message [, int $message_type = 0 [, string $destination [, string $extra_headers ]]] ) : bool
```

| message_type | 操作                                                         |
| ------------ | ------------------------------------------------------------ |
| 0            | `message` 发送到 PHP 的系统日志，使用 操作系统的日志机制或者一个文件，取决于 [error_log](https://www.php.net/manual/zh/errorfunc.configuration.php#ini.error-log) 指令设置了什么。 这是个默认的选项。 |
| 1            | `message` 发送到参数 `destination` 设置的邮件地址。 第四个参数 `extra_headers` 只有在这个类型里才会被用到。 |
| 2            | 不再是一个选项。                                             |
| 3            | `message` 被发送到位置为 `destination` 的文件里。 字符 `message` 不会默认被当做新的一行。 |
| 4            | `message` 直接发送到 SAPI 的日志处理程序中。                 |

### 异常

> 异常处理不同于错误，异常必须是使用`throw` 抛出异常，然后才能被`try catch` 捕获

#### 自定义异常的处理

##### 依赖方法

👉 `set_exception_handler` [[官网](https://www.php.net/manual/zh/function.set-exception-handler.php)]

> 设置用户自定义的异常处理函数

```php
//范例
<?php
function exception_handler($exception) {
  echo "Uncaught exception: " , $exception->getMessage(), "\n";
}

set_exception_handler('exception_handler');

throw new Exception('Uncaught Exception');
echo "Not Executed\n";
?>
```

在`exception_handler`可以接收到产生异常后的异常处理类，如果没有自定义异常处理类，默认为`Exception`类

##### 基本思路

> 自定义继承自`Exception`的异常处理的类，让其中默认存在`render()` 处理函数(用来区分默认的异常处理类`Exception`) 

> 定义异常监测类，其作用为执行`set_exception_handler`，然后在其设置的`exception_handler`函数中做判断：🎈如果该函数接受的参数(异常处理类)中存在`render()`函数，则该异常由自定义的异常处理类抛出，调用该异常处理类的`render()` 函数即可；🎈如果不存在`render()`函数，说明该异常没有自定义的异常处理类(是通过`throw new Exceprtion()` 抛出的异常)，再做处理即可；

> 然后定义具体逻辑，在具体位置判断需要抛出哪种异常即可。

#### 本例实现思路

> 本例主要实现两个模块，视图渲染+表单验证

##### ⚔ 视图渲染

> 主要作用是加载位于`Views`文件夹下的每个页面

**主要逻辑**

> 在入口文件`index.php`中引入定义在`bootstrap.php` 中的`composer`自动加载功能(使用use引入类，会自动调用include)，以及异常监测类。其中，异常检测类中的`set_exception_handler`自动执行

> 然后使用`Server\View`视图渲染类的`make`方法加载`Views` 下的`index.blade.php`文件。存在，则通过`include`引入，如果不存在会抛出`ViewException`异常

> 一旦抛出`ViewException`异常，就会通过`View`类的`make`方法加载`error.blade.php`，这个文件一定是要存在的

##### ⚔ 表单验证

> 提交表单到后台，通过验证类判断是否能通过验证，不能通过则携带着提示信息返回表单页面，能通过则加载成功的页面

**主要逻辑**

> 视图渲染模块无异常后会转到`index.blade.php`页面，其中含有展示在前端的表单，提交至`controller.php`

> `controller.php` 也需要引入`bootstrap.php` ，然后通过表单验证类`Server\ValidateException`进行验证。无异常执行下一句，即通过`View` 类加载成功页面`success.blade.php`.否则：

> 表单验证类`Server\ValidateException.php`中判断`$_POST`的内容，本例只判断是否为空，如果为空抛出表单验证异常`ValidateException`，`controller.php`中的后续不再执行

> 一旦抛出`ValidateException`表单验证异常，会将`ValidateException.php`中抛出异常时的消息存到SESSION中，然后通过`header("location:index.php")`返回入口文件路径，即重新开始输入表单。在表单中可以把存放在SESSION中的异常消息展示给用户作为提示。