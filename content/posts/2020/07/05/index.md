---
date: 2020-07-05
title: JavaScript生成图片文件路径json
tags:
  - Javascript
  - Node.js
categories:
  - 后端
---

在写小demo的过程中，经常需要把某个文件夹的图片文件的路径给引入，除非全部重命名成有序的数字，不然不好处理，这就用到了node中的fs和path模块，还没学...

```javascript
const path=require("path");
const fs = require('fs');

fs.stat('../images',(err)=>{//图片文件所在目录
    if (err)return;
    var  result='{'
    fs.readdir("../images",(err,data)=>{//图片文件所在目录
        for(var i=0;i<Object.keys(data).length;i++){
            let ImgPath="\"images/"+data[i]+"\"";
            result+="\""+i+"\":"+ImgPath+",";
        }
        result=result.substring(0,result.length-1);
       let length="\""+"length"+"\""+":"+"\""+Object.keys(data).length+"\""//文件数量
        result+=","+length+'}'
        fs.writeFile("../data/imgPath.json",result,(err)=>{
            if(err)return;
            console.log("写入文件成功，一共"+Object.keys(data).length+"个文件");
        });
    });
});
```

生成的文件大概就是这样的一个json数据

```json
{"0":"images/1.jpg","1":"images/10.jpg","2":"images/100.jpg","3":"images/101.jpg","4":"images/102.jpg","5":"images/103.jpg","6":"images/104.jpg","7":"images/105.jpg","8":"images/106.jpg","9":"images/107.jpg","10":"images/108.jpg","length":"109"}
```



