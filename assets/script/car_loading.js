
cc.Class({
    extends: cc.Component,

    properties: {
        tipLabel:cc.Label,
        _stateStr:'',
        _progress:0.0,
        _isLoading:false,
        prg:cc.ProgressBar,
        CompleteCount:0,
    },


    start:function(){    
        cc.gg = require("global");
        let audio = require("AudioMgr");
        cc.gg.http = require("HTTP");
        cc.gg.audioMgr = new audio();
        cc.gg.audioMgr.init();
        //cc.args = this.urlParse();
        cc.gg.userData=null;


        cc.gg.touchid = -1;
       // this.tipLabel.string = this._stateStr;
        this.prg.progress = 0;
        this.prg.node.active = false;
        this.startPreloading();
        cc.director.preloadScene("car_start");

        console.log(Partner.getPlatform());
    },

  
    startPreloading:function(){
        //this._stateStr = "正在加载资源，请稍候";
        this._isLoading = true;
        var self = this;
        this.prg.node.active = true;
        
        let onProgress = function ( completedCount, totalCount,  item ){
            self._progress = completedCount/totalCount;
           // self._stateStr = "资源加载中...";// + completedCount +"/" + totalCount;
            //console.log(completedCount,totalCount,self._progress);
        };
        /*
        cc.loader.loadRes("cars.json",cc.JsonAsset, function (err, assets) {
             cc.gg.carsConfig = assets.json;

        }); 
        */
        cc.loader.loadResDir("/cars",cc.SpriteFrame, onProgress,function (err, assets) {
            cc.director.loadScene("car_login");

        }); 

        cc.loader.loadResDir("/sounds",cc.AudioClip,function (err, assets) {
            //cc.director.loadScene("car_start");
            console.log(assets);

        }); 


    },


    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        if(this._isLoading){
           // this.tipLabel.string += Math.floor(this._progress * 100) + "%";   //显示百分比
            this.prg.progress = this._progress;
            
        }

    }
});