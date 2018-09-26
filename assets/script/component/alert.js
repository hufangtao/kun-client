cc.Class({
    extends: cc.Component,

    properties: {
        lbl_title:cc.Label,
        lbl_content:cc.RichText,
        lbl_ok_tip:cc.Label,
        lbl_cancel_tip:cc.Label,
        _onokclick:null,
        _oncancelclick:null,

    },

    
    showTip: function(content,time){
        this.lbl_content.string = "<color=#323232>" + content + "</c>";
        this.schedule(()=>{
            this.node.destroy();
            this.destroy();
        },time)
    },
    
    on_ok_btn_click: function(){

        if(this._onokclick !== null){
            this._onokclick();
        }
        this.onclose();
    },
    
    on_cancel_click:function(){
        if(this._oncancelclick !== null){
            this._oncancelclick();
        }
        this.onclose(); 
    },

    onclose:function(){
        this.node.runAction(cc.sequence(cc.scaleTo(0,2,0),cc.callFunc(()=>{
            this.node.removeFromParent();
            this.node.destroy();
        })))
    },
    
});
