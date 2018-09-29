import Define from "./Define";
import global from "./global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class car_start extends cc.Component {
    public onLoad() {
        cc.director.preloadScene("car_main");
    }

    public onStartGame() {
        if (Define.online) {   
            cc.director.loadScene("car_main"); 
        } else {
            global.showTip("请先登陆.");
            this.scheduleOnce(() => {
                cc.director.loadScene("car_login");
            }, 2);
        }
    }

    public onBtn_OtherGame() {
        // 更多游戏事件
    }
    public onBtn_Rank() {	
        // 排行榜事件
    }
    public onBtn_Share() {
        // 分享按钮事件
    }
}

