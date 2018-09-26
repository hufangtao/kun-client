cc.Class({
    extends: cc.Component,

    properties: {
    	account:cc.EditBox,
    	pw:cc.EditBox,

    },


    start () {
    	cc.director.preloadScene("car_main");
    },

    onlogin(){
        cc.gg.online = false;
    	if(this.account.string=="" ||  ""==this.pw.string)return;
    	cc.gg.http.sendRequest("/login",{account:this.account.string,pw:this.pw.string},ret=>{
    		if(ret.errcode==0){
    			cc.gg.userData = ret.data;
    			if(cc.gg.userData.park!=null && cc.gg.userData.park !="") cc.gg.userData.park = JSON.parse(ret.data.park);
    			else cc.gg.userData.park = [];
    			if(cc.gg.userData.buy_coin==null || cc.gg.userData.buy_coin=="")cc.gg.userData.buy_coin=[100];
    			else cc.gg.userData.buy_coin = JSON.parse(cc.gg.userData.buy_coin);
    			cc.director.loadScene("car_start");
                cc.gg.online = true;
    		}else{
    			console.log(ret.errmsg);
                cc.gg.showTip(ret.errmsg);
    		}
    	})
    },

    onregist(){
    	if(this.account.string=="" ||  ""==this.pw.string)return;
    	cc.gg.http.sendRequest("/regist",{account:this.account.string,pw:this.pw.string},ret=>{
    		if(ret.errcode==0){
    			console.log("注册成功");
                cc.gg.showTip("注册成功,请登陆.");
    		}else{
    			console.log(ret.errmsg);
                cc.gg.showTip(ret.errmsg);
    		}
    	})
    },
});
