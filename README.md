## hugo_papermod主题
√ 基本结构做完，带评论。< Wed Mar 9> 

√ 初步优化，首页修改，资源引入使用阿里云(不然慢😥)(暂时)。但是gotop莫名其妙报错😑。 <Fri Mar 18>

√ 首页添加花里胡哨的随机线条功能，手机端不再设置不能显示主页，改成profile不再透明。 <Sat Mar 19>

√ 更改首页video加载方式防止嗅探 <Mon Mar 21>

√ 新增首页背景图用Blob加密，优化代码结构 <Thu Mar 31>

√ 代码结构优化，新增bilibili个平台视频解析 <Mon Apr 04>

- bilibili：`{{< bilibili AV号或BV号 >}} {{< bilibili AV号或BV号 分P号 >}}`
- tencent：`{{< tencent  b31563j0jqw >}}`
- 自定义视频：`{{< video src="./video.mp4" autoplay="true" poster="./video-poster.png" >}}`

√ 引入[animate.min.css](https://animate.style/)加入动效，评论区优化;引入[font-awesome.min.css](http://www.fontawesome.com.cn/),优化图标展示，而不是用png格式的图标 <Tue Apr 05>

√ 在文章列表页面，通过列表的footer尾注信息进行比较判断，筛选出`pinned`和`newest`文章，并为其添加相应样式 <Fri Apr 08>

√  黑暗模式适配✨ ✨ ！！<Sat Apr 09>

□ 想做个音乐播放器组件😛

□ Ajax请求是否会进行缓存，想利用本地缓存Blob对象，结果无法实现😑。因为Blob中存在function，所以无法JSON.stringify


## 🥸

- 图片视频之类的都在static目录下，这个即为根目录，在config或者自定义css中都可以引用
- 通过下面的方式，使得`assets/js/extended/`路径下的js文件全部压缩后打包成一整个js文件
```html
{{- $extendJS := (resources.Match "js/extended/*.js") | resources.Concat "assets/js/extended/extend.js" | fingerprint | minify }} 
<script src="{{ $extendJS.RelPermalink }}"></script>
```
- 对`font-awesome.min.css`做了略微修改，与官网不同的是，通过给class添加`fab fa-xxx`才能使得字体图标生效