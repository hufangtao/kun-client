const {ccclass, property} = cc._decorator;

@ccclass
export default class alert extends cc.Component {

    // @property(cc.Label)
    // private lbl_title: cc.Label = null;

    @property(cc.RichText)
    private lbl_content: cc.RichText = null;
    
    // @property(cc.Label)
    // private lbl_ok_tip: cc.Label = null;

    // @property(cc.Label)
    // private lbl_cancel_tip: cc.Label = null;


    private _onokclick: Function = null;
    private _oncancelclick: Function = null;

    
    public showTip(content, time) {
        this.lbl_content.string = "<color=#323232>" + content + "</c>";
        this.schedule(() => {
            this.node.destroy();
            this.destroy();
        }, time);
    }
    
    public on_ok_btn_click() {

        if (this._onokclick !== null) {
            this._onokclick();
        }
        this.onclose();
    }
    
    public on_cancel_click() {
        if (this._oncancelclick !== null) {
            this._oncancelclick();
        }
        this.onclose(); 
    }

    public onclose() {
        this.node.runAction(cc.sequence(
            cc.scaleTo(0, 2, 0), 
            cc.callFunc(() => {
            this.node.removeFromParent();
            this.node.destroy();
        })));
    }
    
}
