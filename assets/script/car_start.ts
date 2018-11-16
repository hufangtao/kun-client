import Define from "./Define";
import global from "./global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class car_start extends cc.Component {

    @property(cc.Label)
    private labQQ: cc.Label = null;

    @property(cc.Label)
    private labDocument: cc.Label = null;

    @property(cc.Label)
    private labVersion: cc.Label = null;


    public onLoad() {
        global.myLog("car_start 进入开始场景");

        // 客服信息
        this.labQQ.string = "客服QQ：2556502015"; 
            
        // 文本
        const text = "抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n\
适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。\n\
软件著作权登记证号：2018SR735246 \n\
著作权人：苏州大禹网络科技有限公司";
        this.labDocument.string = text;

        // 版本
        this.labVersion.string =  "" + global.getNumString(1046929258152998400); // "0.0.1";
        // this.labVersion.string =  "0.0.2";

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

