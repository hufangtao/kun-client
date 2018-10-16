import Define from "./Define";
import audio from "./AudioMgr";
import global from "./global";

const {ccclass, property} = cc._decorator;

@ccclass
export default class car_loading extends cc.Component {

    @property(cc.Label)
    private tipLabel: cc.Label = null;

    @property(cc.ProgressBar)
    private prg: cc.ProgressBar = null;

    private _stateStr: string = "";
    private _progress: number = 0;
    private _isLoading: boolean = false;
    private CompleteCount: number = 0;


    public start() {    
        // cc.gg = require("global");
        // cc.gg.http = require("HTTP");
        cc.debug.setDisplayStats(false);
        Define.audioMgr = new audio();
        Define.audioMgr.init();
        // cc.args = this.urlParse();
        Define.userData = null;


        Define.touchid = -1;
        this.tipLabel.string = this._stateStr;
        this.prg.progress = 0;
        this.prg.node.active = false;
        this.startPreloading();
        // cc.director.preloadScene("car_start");
    }

  
    public startPreloading() {
        this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        const self = this;
        this.prg.node.active = true;
        
        const onProgress = (completedCount, totalCount, item) => {
            self._progress = completedCount / totalCount;
            // self._stateStr = "资源加载中..."; // + completedCount +"/" + totalCount;
        };
        /*
        cc.loader.loadRes("cars.json",cc.JsonAsset, ( err, assets) {
             cc.gg.carsConfig = assets.json;

        }); 
        */
        cc.loader.loadResDir("/cars", cc.SpriteFrame, onProgress, (err, assets) => {
            if (err) {
                global.myLog("car_loading /cars/... 下载出错");
            } else {
                global.myLog("car_loading /cars/... 下载完成,开始进入登录场景");
                cc.director.loadScene("car_login");
            }
        }); 

        cc.loader.loadResDir("/sounds", cc.AudioClip, (err, assets) => {
            if (err) {
                console.error("car_loading /sounds/... 下载出错");
            }
            // cc.director.loadScene("car_start");
            // global.myLog(assets);
        }); 
    }


    // called every frame, uncomment this t o activate update callback
    public update(dt) {
        if (this._isLoading) {
           this.tipLabel.string = Math.floor(this._progress * 100) + "%";   // 显示百分比
           this.prg.progress = this._progress;
        }

    }
}
