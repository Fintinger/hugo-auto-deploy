// const lists=require("./lists.json");
Vue.use(VueResource);
Vue.config.productionTip = false;

let app= new Vue({
    el: "#app",
    data:{
        lists:[]
    },
    created() {
        this.$http.get('./dist/lists.json',).then((response) => {
            this.lists = JSON.parse(response.bodyText); // 获取到数据
        })
    },
})
