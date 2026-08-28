/**获取资源 blob 类型
 * 说明：本文件为后台视频等静态资源的 Blob 加载工具，独立 IIFE 包裹避免污染全局作用域，
 *       内部函数按需挂到 window 供 mobile.js 调用（保持原有跨文件依赖）。
 */
(function () {
    'use strict';

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
        if (!vid) return;
        let profile = document.getElementsByClassName("profile")[0];
        if (profile && vid) {
            vid.style.display = "block";
            // window.document.body.setAttribute('style', "background:url(" + URL.createObjectURL(blobRes) + ") no-repeat  center/cover fixed")
        }
        vid.setAttribute("src", URL.createObjectURL(blobRes));
    }

    // 挂到 window，供 mobile.js 等后续拼接脚本调用（保持原有依赖关系）
    window.getSetAllResource = getSetAllResource;
    window.setBgvidCallBack = setBgvidCallBack;
})();
