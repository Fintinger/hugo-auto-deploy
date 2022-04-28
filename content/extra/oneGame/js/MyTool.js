(function (w) {
    w.myTool = {
        $: function (id) {
            return typeof id === 'string' ? document.getElementById(id) : null;
        },
        hasClassName: function (obj, cs) {
            var reg = new RegExp('\\b' + cs + '\\b');
            return reg.test(obj.className);
        },
        addClassName: function (obj, cs) {
            if(!this.hasClassName(obj,cs)){
                obj.className += ' ' + cs;
            }
        },
        removeClassName: function (obj, cs) {
            var reg = new RegExp('\\b' + cs + '\\b');
            // 删除class
            obj.className = obj.className.replace(reg, '');
        },
        toggleClassName: function (obj, cs) {
            if(this.hasClassName(obj,cs)){
                // 有， 删除
                this.removeClassName(obj,cs);
            }else {
                // 没有，则添加
                this.addClassName(obj,cs);
            }
        },
        scroll: function() {
            if(window.pageYOffset !== null){ // 最新的浏览器
                return {
                    "top": window.pageYOffset,
                    "left": window.pageXOffset
                }
            }else if(document.compatMode === 'CSS1Compat'){ // W3C
                return {
                    "top": document.documentElement.scrollTop,
                    "left": document.documentElement.scrollLeft
                }
            }
            return {
                "top": document.body.scrollTop,
                "left": document.body.scrollLeft
            }
        },
        show:function (ele) {
            ele.style.display='block';
        },
        hide:function (ele) {
            ele.style.display='none';
        },
        /**
         * 返回顶部
         * @param{object} ele
         */
        goTop:function (ele) {
            var begin=0,end=0,intervalId=null;
            window.addEventListener('scroll',function (ev1) {
                myTool.scroll().top>=10?myTool.show(ele):myTool.hide(ele);
                begin=myTool.scroll().top;
            });
            ele.addEventListener('click',function (ev1) {
                clearInterval(intervalId);
                intervalId=setInterval(function () {
                    begin+=(end-begin)*0.2;
                    window.scrollTo(0,begin);
                    if (end===Math.round(begin)){
                        clearInterval(intervalId);
                    }
                },20);
            })
        },
        /**
         * 获取元素css样式
         * @param{Object} obj
         * @param{String} attr
         * @returns {string}
         */
        getStyleAttr:function (obj, attr) {
            if(obj.currentStyle){ // IE 和 opera
                return obj.currentStyle[attr];
            }else {
                return window.getComputedStyle(obj, null)[attr];
            }
        },
        /**
         * 改变CSS样式
         * @param{Object} eleObj
         * @param{String}attr
         * @param{String|Number} value
         */
        changeCssStyle: function (eleObj, attr, value) {
            eleObj.style[attr] = value;
        },
        /**
         *  缓动动画函数
         * @param {Object}eleObj
         * @param {Object}json
         * @param {Function}fn
         */
        buffer:function(eleObj, json, fn) {
            // 1.1 先清后设
            clearInterval(eleObj.timer);

            // 1.2 定义变量
            var speed = 0, begin = 0, target = 0, flag = false;

            // 1.3 设置定时器
            eleObj.timer = setInterval(function () {
                // 标志 (标签的所有属性有没有执行完动画)
                flag = true;
                for(var key in json){
                    // 获取要做动画属性的初始值
                    if(key === 'opacity'){
                        begin = parseInt(myTool.getStyleAttr(eleObj, key) * 100) || 100;
                        target = parseInt(json[key]* 100);
                    }else {
                        begin = parseInt(myTool.getStyleAttr(eleObj, key)) || 0;
                        target = parseInt(json[key]);
                    }

                    // 2.3 求出步长
                    speed = (target - begin) * 0.2;
                    speed = (target > begin) ? Math.ceil(speed) : Math.floor(speed);

                    // 2.4  动起来
                    if(key === 'opacity'){
                        eleObj.style.opacity = (begin + speed) / 100;
                    }else {
                        eleObj.style[key] = begin + speed + 'px';
                    }

                    // 2.5 判断
                    if (begin !== target) {
                        flag = false;
                    }
                }

                // 1.4 清除定时器
                if(flag){
                    clearInterval(eleObj.timer);
                    // 开启另一组动画
                    /* if(fn){
                         fn();
                     }*/
                    fn && fn();
                }
            }, 40);
        }
    }
})(window);