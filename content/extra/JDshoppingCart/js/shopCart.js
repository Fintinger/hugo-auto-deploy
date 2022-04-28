Vue.config.productionTip = false
new Vue({
    el: "#shoppingCart",
    data: {
        shopListData: [],
        isSelected: false,
        totalPrice: 0,
        totalNumber:0,
        isHideMask:true,
        deleteShop:''
    },
    //组件加载完毕，请求数据，业务处理
    mounted() {
        //请求本地json
        this.getLocalData();
    },
    filters: {
        //让价格格式化输出
        priceFormat: function (p) {
            return "￥" + p.toFixed(2);
        }
    },
    methods: {
        getLocalData: function () {
            // GET /someUrl
            this.$http.get('data/cart.json').then(response => {
                // get body data
                const res = response.body;
                this.shopListData = res.allShop.shopList;
            }, response => {
                // error callback
                alert("请求失败!")
            });
        },
        //商品数量加减
        shopNum: function (shop, flag) {
            if (flag) {//加
                shop.shopNumber += 1
            } else {
                shop.shopNumber <= 1 ? shop.shopNumber = 1 : shop.shopNumber -= 1
            }
            this.countTotalPN()
        },
        //是否全选
        selectAll: function (flag) {
            //总控制
            this.isSelected = !flag;
            //遍历所有商品改变selected
            this.shopListData.forEach((value, index) => {
                if (typeof value.isSelect === 'undefined') {
                    this.$set(value, 'isSelect', !flag)
                } else {
                    value.isSelect = !flag
                }
            });
            this.countTotalPN()
        },
        //计算总价和总数
        countTotalPN: function () {
            let tPrice = 0,tNum=0;
            this.shopListData.forEach((value, index) => {
                if (value.isSelect) {//选中
                    tPrice += value.shopNumber * value.shopPrice;
                    tNum += value.shopNumber;
                }
                this.totalPrice=tPrice;
                this.totalNumber=tNum;
            })
        },
        //选中某个商品
        singleShopSelect: function (shop) {
            shop.isSelect = !shop.isSelect;
            this.countTotalPN()
        },
        //面板的显示隐藏
        maskHS:function (shop) {
            this.isHideMask=false;
            this.deleteShop=shop
        },
        //删除某个商品
        isDeleteShop:function () {
            this.isHideMask=true;
            let ind=this.shopListData.indexOf(this.deleteShop);
            this.shopListData.splice(ind,1);
            this.countTotalPN()
        }
    },
});