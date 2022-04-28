let app = new Vue({
    el: "#app",
    data: {
        keyword: "",
        songs: [],
        play_src: "",
        mvsrc: "",
        this_lyric: ""
    },
    methods: {
        do_search: function () {
            this.songs = []
            let me = this

            $.ajax({
                url: "/search?limit=40&keywords=" + this.keyword,
                success: function (data) {
                    // console.log(data);
                    $.each(data.result.songs, (index, value) => {
                        me.songs.push({
                            songName: value.name,
                            id: value.id,
                            mvid: value.mvid,
                            artist: "",
                        })
                        me.songs = JSON.parse(JSON.stringify(me.songs))
                        //演唱
                        $.each(value.artists, (i, v) => me.songs[index].artist += v.name + " ")
                        //获取封面
                        $.ajax({
                            url: "/album?id=" + value.album.id,
                            success: (data) => {
                                me.songs[index].picUrl = data.album.blurPicUrl
                                me.songs = JSON.parse(JSON.stringify(me.songs))
                                // console.log(JSON.parse(JSON.stringify(me.songs)))
                            }
                        })
                        //歌词
                        $.ajax({
                            url: "/lyric?id=" + value.id,
                            success: (data) => {
                                if (data.uncollected || data.nolyric) {
                                    // console.log(index);
                                    me.songs[index].lyric = "不好意思，暂无歌词..."
                                } else {//解析歌词
                                    let array = data.lrc.lyric.split("\n")
                                    let res, result = ""
                                    $.each(array, (i, e) => {
                                        res = /[^\]]+(?!.*\])/.exec(e)
                                        if (res == null) return true
                                        result += res + "\n"
                                        // console.log(index + "-" + i + "." + res);
                                    })
                                    // console.log(lrcArr)
                                    me.songs[index].lyric = result
                                }
                                // console.log(data.lrc.lyric);
                            }
                        })
                    })
                },
            })
        },
        change_style: function (index) {
            $(".song_list li").css({
                fontWeight: "normal",
                color: "#333"
            }).eq(index).css({
                fontWeight: "bold",
                color: "#000"
            });
            $(".mask_pic").css({
                background: "url(" + this.songs[index].picUrl + ") no-repeat center center /cover"
            })
        },
        play_music: function (id, index) {
            this.change_style(index);
            this.mvsrc = ""
            this.this_lyric = ""
            $.ajax({
                url: "/song/url?id=" + id,
                success: (data) => {
                    this.play_src = data.data[0].url
                    this.this_lyric = this.songs[index].lyric
                },
                error: (err) => console.log(err)
            });
        },
        play_mv: function (mvid, index) {
            this.change_style(index);
            this.play_src = ""
            this.mvsrc = ""
            $.ajax({
                url: "/mv/url?id=" + mvid,
                success: (data) => this.mvsrc = data.data.url
            })
        },
        close:function (){
            $("#app").hide(500)
        },
        show:function (){
            $("#app").show(500)
        }
    },
})