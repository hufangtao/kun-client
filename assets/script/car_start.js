
cc.Class({
    extends: cc.Component,

    properties: {


    },


    start () {
    	cc.director.preloadScene("car_main");
    },

    onStartGame(){
        if(cc.gg.online)   cc.director.loadScene("car_main");
        else {
            cc.gg.showTip("请先登陆.");
            this.scheduleOnce(()=>{
                cc.director.loadScene("car_login")
            },2)
        }
    },

    onBtn_OtherGame(){
    	//更多游戏事件
    },
    onBtn_Rank(){	
    	//排行榜事件

    },
    onBtn_Share(){
    	//分享按钮事件

    }

});
