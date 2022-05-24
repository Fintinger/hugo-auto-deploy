//获取资源blob类型
function blobAjax(url) {
    return new Promise((reslove, reject) => {
        let x = new XMLHttpRequest()
        x.open("GET", url, true)
        x.responseType = 'blob';
        x.send()
        x.onreadystatechange = function () {
            if (x.readyState === 4) {
                if (x.status >= 200 && x.status < 300) {
                    reslove(x.response)
                } else {
                    reject("加载失败")
                }
            }
        }
        x.onerror = function () {
            reject("其它错误")
        }
    })
}

//发送get请求并将获取到的资源用回调处理
function getSetAllResource(resourceArr) {
    resourceArr.forEach(resource => {
        blobAjax(resource.url).then(data => resource.callBack(data))
    })
}

//处理背景视频的回调
function setBgvidCallBack(blobRes) {
    let vid = document.getElementById("liveBgBox");
    let profile = document.getElementsByClassName("profile")[0];
    if (profile && vid) {
        vid.style.display = "block";
        // window.document.body.setAttribute('style', "background:url(" + URL.createObjectURL(blobRes) + ") no-repeat  center/cover fixed")
    }
    vid.setAttribute("src", URL.createObjectURL(blobRes));
}
