---
date: 2020-10-03
title: PHP开发验证码类
tags:
  - PHP
categories:
  - 前端
sticky: 5 
---

> 利用php中的GD库可以完成验证码类的开发。[后盾人教程](https://houdunren.gitee.io/note/php/9%20%E5%9B%BE%E5%83%8F%E5%A4%84%E7%90%86.html#%E5%9B%BE%E5%83%8F%E5%A4%84%E7%90%86)

## PHP创建图像步骤

### 发送HTTP头信息，声明内容为图像

```php
header('Content-type:image/gif');
header('Content-type:image/jpeg');
header('Content-type:image/png');
```

通过设置头信息让浏览器渲染出图像，而不是HTML等其他类型

### 创建画布

```php
imageCreateTrueColor(width,height);
```

`width & height` 画布宽高，即为输出图片的尺寸,返回为`source` 类型，后续操作都是针对这个资源展开。

### 创建绘图所需要的颜色

```php
imageColorAllocate(img_resource,R,G,B);
```

颜色从属于创建画布产生的图像资源而存在，后面三个值分别为红绿蓝三个通道的值，为`int`类型,在0—255之间。

### 绘图（填充画布、画圆、画方块、画线条、画布上写字）

👉 **填充画布(画布背景)**

```php
imageFill(img_resource,x,y,color);
```

👉 **画圆**

```php
//绘制空心圆形
imageEllipse(img_res,x,y,w,h,color);
//绘制填充好的实心圆
imageFilledEllipse(img_res,x,y,w,h,color);
```

绘制 圆心(x,y) 宽 x，高 h，的圆

👉 **画方**

```php
//空心矩形
imageRectangle(img_res,x1,y1,x2,y2,color);
//实心矩形
imageFilledRectangle (img_res,x1,y1,x2,y2,color);
```

(x1,y1)为左上角坐标， (x2,y2)为右下角坐标

![绘制矩形图示](https://gitee.com/fintinger/figure-bed/raw/master//images/20201003214907.gif)

👉**画线条**

```
imageLine(img_res,x1,y1,x2,y2,color)
```

(x1,y1)与(x2,y2)两点确定的直线。

👉 **绘制像素(点)**

```php
imagesetpixel ( img_res , x , y , color )
```

👉 **输入文本**

```php
imagettftext (img_res , size , angle , x , y , color , fontfile ,text )
```

图像资源，字体尺寸，角度，第一个字符的基本点（大概是字符的左下角），Y 坐标（字体基线的位置），颜色 ，字体文件绝对路径(`realpath($path)`获取)，文本字符串（UTF-8 编码）

> ✨**文本盒子？**

```php
imagettfbbox ( size , angle , fontfile , text );
```

返回一个含有 8 个单元的数组表示了文本外框的四个角，得到文本范围的盒子大小，可以方便控制文本输出位置：

| 变量 | 位置          |
| ---- | ------------- |
| 0    | 左下角 X 位置 |
| 1    | 左下角 Y 位置 |
| 2    | 右下角 X 位置 |
| 3    | 右下角 Y 位置 |
| 4    | 右上角 X 位置 |
| 5    | 右上角 Y 位置 |
| 6    | 左上角 X 位置 |
| 7    | 左上角 Y 位置 |

### 输出图像

```php
imagegif(img_resource[,filename]);
imagejpeg(img_resource[,filename]);
imagepng(img_resource[,filename]);
imagebmp(img_resource[,filename]);
```

当设置第二个参数时表示储存文件，如果存在同名文件会覆盖

### 释放画布资源

```php
imageDestroy(img_resource);
```

图像输出完毕及时释放资源，把内存空间留给更需要的程序。

## 验证码类

### Verificationcode类

> 绘制画布，设置背景色，先写入随机文本，然后绘制随机干扰线，干扰点就可

```php
<?php

class Verificationcode
{

    protected $width;

    protected $height;

    protected $len;

    public $imgsource;

    protected $size;

    protected $fontfile;

    protected $rescode;

    public function __construct($w = 200, $h = 50, $len = 4, $size = null)
    {
        $this->width = $w;
        $this->height = $h;
        $this->len = $len;
        $this->size = is_null($size) ? $h * 0.4 : $size;
        $this->fontfile = realpath("source.ttf");
    }

    public function render()
    {
        $this->bg();
        $this->line();//文字下
        $this->text();
        $this->line();//文字上
        $this->pix();
        $this->show();

        return $this->rescode;
    }

    //绘制画布
    private function bg()
    {
        $img = imageCreateTrueColor($this->width, $this->height);
        $this->imgsource = $img;
        imagefill(
            $img,
            0,
            0,
            imageColorAllocate($img, 120, 120, 120)
        );
    }

    //绘制随机线条
    private function line()
    {
        for ($i = 0; $i < 3; $i++) {
            imagesetthickness($this->imgsource, mt_rand(1, 3));
            imageLine(
                $this->imgsource,
                mt_rand(0, $this->width),
                mt_rand(0, $this->height),
                mt_rand(0, $this->width),
                mt_rand(0, $this->height),
                $this->ran_color()
            );
        }
    }

    //绘制干扰点
    private function pix()
    {
        for ($i = 0; $i < 800; $i++) {
            imagesetpixel(
                $this->imgsource,
                mt_rand(0, $this->width),
                mt_rand(0, $this->height),
                $this->ran_color()
            );
        }
    }

    //随机文本
    private function text()
    {
        $range = "abcdefghijklmnopqrstuvwxyz0123456789";
        $code = '';
        for ($i = 0; $i < $this->len; $i++) {
            $text = $range[mt_rand(0, strlen($range) - 1)];
            $box = imagettfbbox($this->size, 0, $this->fontfile, $range[$i]);
            imagettftext(
                $this->imgsource,
                $this->size,
                mt_rand(-30, 30),
                ($this->width / $this->len) * $i + 10,
                $this->height / 2 + ($box[0] - $box[7]) / 2,
                $this->ran_text_color(),
                $this->fontfile,
                strtoupper($text)
            );
            $code .= strtoupper($text);
        }
        $this->rescode = $code;
    }

    //设置头信息并且输出png
    private function show()
    {
        header('Content-type:image/png');
        imagepng($this->imgsource);
    }

    private function ran_color()
    {
        return imageColorAllocate(
            $this->imgsource,
            mt_rand(0, 255),
            mt_rand(0, 255),
            mt_rand(0, 255),
        );
    }

    private function ran_text_color()
    {
        return imageColorAllocate(
            $this->imgsource,
            mt_rand(0, 80),
            mt_rand(0, 80),
            mt_rand(0, 80),
        );
    }

}
```

**说明：** 

- 如果不设置参数，默认图片尺寸为200×50，验证码长度为4，字体为 (0.4*图片高度)
- 通过计算使得文本始终处在垂直居中，水平分散对齐的状态

### 后端使用

⚡`server.php`

```php
<?php
//引入渲染验证码图片，并将这次返回的验证码存到session中
include "Verificationcode.php";
session_start();//session开始之前不能有输出
$code = new Verificationcode();
$res = $code->render();
$_SESSION["captcha"]=$res;
imageDestroy($code->imgsource);
```

**说明：**

- 调用`render()`函数，即可绘制出验证码图片，并返回这次的验证码字符串。
- 通过将返回的验证码字符串存入session中，可以进行后续验证操作

### 前端使用

```html
<img src="server.php" alt="" onclick="this.src='server.php?'+Math.random()">
```

✨ 可以将整个form表单提交至php后端，然后通过session中存储的验证码字符串进行验证，例如

```html
<form action="check.php" method="post" enctype="multipart/form-data">
    <table>
        <tr>
            <td><input type="text" placeholder="请输入验证码" name="captcha">
            <td><img src="server.php" alt="" onclick="this.src='server.php?'+Math.random()">
            </td>
        </tr>
    </table>
    <button>确定</button>
</form>
```

⚡`check.php`

```php
<?php
session_start();
include "main.html";
if (@strtoupper($_POST["captcha"])==@$_SESSION["captcha"]){
    echo "<p style='color: #4FEF10'>验证通过</p>";
}else{
    echo "<p style='color: #e01'>验证失败！</p>";
}
```

🎉🎉🎉