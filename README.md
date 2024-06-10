<p align="center">
<img src="https://blog.archai233.site/images/favicon.ico" width="128px" height="128px" alt="blog">
</p>

<h1 align="center">Archai 's blog</h1>

<p align="center">
<a href="https://github.com/gohugoio/hugo" target="_blank"><img src="https://img.shields.io/badge/hugo-v0.83.0-blueviolet?style=flat-square&logo=hugo" alt="hugo" /></a> 
<a href="https://github.com/adityatelange/hugo-PaperMod" target="_blank"><img src="https://img.shields.io/badge/hugoThemes-%40paperMod-blue?style=flat-square&logo=hugo" alt="paperMod" /></a>
<a href="https://github.com/vercel/vercel" target="_blank"><img src="https://img.shields.io/badge/Vercel-CLI%20-brightgreen?style=flat-square&logo=vercel" alt="paperMod" /></a>
<a href="https://github.com/xCss/Valine" target="_blank"><img src="https://img.shields.io/badge/Valine-sys-yellow?style=flat-square" alt="Valine" /></a>
</p>

## 介绍

经过多次修改之后决定使用[hugo](https://gohugo.io/)来搭建博客，主要是因为构建速度快，正如官网那句 [The world’s fastest framework for building websites](https://gohugo.io/)，本博客是通过对[PaperMod](https://github.com/adityatelange/hugo-PaperMod)主题修改而来。

使用[valine](https://valine.js.org/)，并做了一些样式修改引入评论系统。

无意中发现[Vercel](https://vercel.com/)平台能够实现对github项目的自动化部署，并提供url来访问，所以便有了这个仓库的诞生！


## DIV & TIPS

- 图片视频之类的都在`static`目录下，这个即为根目录，在config或者自定义css中都可以引用
- 通过下面的方式，使得`assets/js/extended/`路径下的js文件全部压缩后打包成一整个js文件
```html
{{- $extendJS := (resources.Match "js/extended/*.js") | resources.Concat "assets/js/extended/extend.js" | fingerprint | minify }} 
<script src="{{ $extendJS.RelPermalink }}"></script>
```
## TimeLine

✅ 基本结构做完，带评论。< Wed Mar 9>

✅ 初步优化，首页修改，资源引入使用阿里云(不然慢😥)(暂时)。但是gotop莫名其妙报错😑。 <Fri Mar 18>

✅ 首页添加花里胡哨的随机线条功能，手机端不再设置不能显示主页，改成profile不再透明。 <Sat Mar 19>

✅ 更改首页video加载方式防止嗅探 <Mon Mar 21>

✅ 新增首页背景图用Blob加密，优化代码结构 <Thu Mar 31>

✅ 代码结构优化，新增bilibili个平台视频解析 <Mon Apr 04>

- bilibili：`{{< bilibili AV号或BV号 >}} {{< bilibili AV号或BV号 分P号 >}}`
- tencent：`{{< tencent b31563j0jqw >}}`
- 自定义视频：`{{< video src="./video.mp4" autoplay="true" poster="./video-poster.png" >}}`

✅引入[animate.min.css](https://animate.style/)加入动效，评论区优化;引入[font-awesome.min.css](http://www.fontawesome.com.cn/),优化图标展示，而不是用png格式的图标 <Tue Apr 05>

✅ 在文章列表页面，通过列表的footer尾注信息进行比较判断，筛选出`pinned`和`newest`文章，并为其添加相应样式 <Fri Apr 08>

✅黑暗模式适配✨ ✨ ！！<Sat Apr 09>

✅ 使用[vercel](https://vercel.com/)实现自动化部署 <Thu Apr 28>

## 关于commit

- 📑 => 发表新文章
- ✨ => 优化样式
- 🛠️=> 修复bug