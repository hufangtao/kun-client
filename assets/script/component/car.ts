import Define from "../Define";

const {ccclass,  property} = cc._decorator;

@ccclass
export default class car extends cc.Component {

    @property(cc.Prefab)
    private pb_hecheng: cc.Prefab = null;

    private index: number = 0;
    private carid: number = 0;        
    private car_copy: cc.Node = null;
    private parkpos: cc.Vec2 = null;
    private b_isRunning: boolean = false;
    private wayid: number = 0;
    private speed: number = 300;
    private state: number = 0; //  状态: 0 停车状态;1: 运行状态
    private coin_quan: number = 0;
    private bsetime: number = 1;
    private angle: number = null;
    private js_time: number = 0;
    private js_num: number = 0;

    public onLoad() {
        
    }

    public init(parkid, pos, carid) {
        this.node.on("touchstart", this.onTouchStart, this);
        this.node.on("touchmove", this.onTouchMove, this);
        this.node.on("touchend", this.onTouchEnd, this);
        this.node.active = true;
        this.parkpos = pos;
        this.node.setPosition(pos);
        this.index = parkid;
        this.carid = carid;
        this.setSkin();
    } 

    public copy() {
        this.car_copy = cc.instantiate(this.node);
        this.car_copy.setParent(this.node.getParent());
        this.car_copy.setPosition(this.parkpos);
        this.car_copy.active = true;
        this.car_copy.opacity = 110;
        this.node.zIndex = 999;
    } 

    public setSkin() {
        this.node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (this.carid + 1) + ".png", cc.SpriteFrame);
        this.coin_quan = Math.floor(Define.coin[this.carid] / Define.level_times[this.carid]);
        this.speed = 3950 / Define.level_times[this.carid];       

    } 

    public onTouchStart(event) {        
        if (this.b_isRunning || Define.touchid > -1) {
            return;
        }
        Define.sceneNode.emit("car_touch_start", this);
        this.copy();
        Define.touchid = this.index;
    } 
    public onTouchMove(event) {
        if (this.b_isRunning || Define.touchid !== this.index) {
            return; 
        }
        const delta = event.touch.getDelta(); 
        this.node.x += delta.x;
        this.node.y += delta.y;

    } 
    public onTouchEnd(event) {
        if (this.b_isRunning) {
            this.onJiaSu();
            return;
        }
        this.node.zIndex = 1;
        Define.sceneNode.emit("car_touch_end", {car: this, pos: this.node.getPosition()});
    } 
    // 复位
    public replace() {
        Define.audioMgr.playSFX("move");
        this.node.setPosition(this.parkpos);
        this.node.zIndex = this.index;
        this.car_copy.destroy();
        Define.touchid = -1;
    } 
    // 回收
    public huishou() {
        this.node.destroy();
        if (this.car_copy) {this.car_copy.destroy(); }
        Define.touchid = -1;
        this.destroy();
    } 
    // 合并(拖动车动画)
    public merge() {
        const pos = this.node.getPosition();
        this.car_copy.opacity = 255;
        this.car_copy.zIndex = 999;
        this.car_copy.setPosition(pos);
        const self = this;
        this.node.runAction(cc.sequence(cc.moveBy(0.2, cc.v2(-150, 0)).easing(cc.easeOut(2.0)), cc.moveBy(0.2, cc.v2(150, 0)).easing(cc.easeIn(3.0)), cc.callFunc(() => {
            // 合并动画完成, 删除原来的车辆
            self.node.destroy();
            self.car_copy.destroy();
            Define.touchid = -1;
        })));
        this.car_copy.runAction(cc.sequence(cc.moveBy(0.2, cc.v2(150, 0)).easing(cc.easeOut(2.0)), cc.moveBy(0.2, cc.v2(-150, 0)).easing(cc.easeIn(3.0))));
    } 
    // 升级(目标车放大淡出并更新图片)
    public upgrade() {
        const self = this;
        this.node.runAction(cc.sequence(cc.delayTime(0.2),  cc.spawn(cc.scaleTo(0.2, 0.8), cc.fadeTo(0.2, 0)), cc.callFunc(() => {
            Define.audioMgr.playSFX("hecheng");
            self.carid ++;
            self.setSkin();
            self.node.scale = 0.1;
            self.node.opacity = 255;
            // 显示粒子效果
            const node = cc.instantiate(this.pb_hecheng);
            node.setParent(this.node.getParent());
            node.active = true;
            node.zIndex = 9999;
            node.setPosition(this.node.getPosition());
        }), cc.scaleTo(0.3, 2), cc.scaleTo(0.3, 1).easing(cc.easeBounceOut())));

    } 

    public run() {
        // 开始运行
        console.log("run");
        const pngname = this.carid + 1;
        this.node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + pngname + "_.png", cc.SpriteFrame);
        Define.audioMgr.playSFX("run");
        this.b_isRunning = true;
        this.car_copy.on("touchstart", (event) => {
            this.b_isRunning = false;
            Define.sceneNode.emit("car_stop", this.coin_quan);
            this.node.scaleX = 1;
            this.node.scaleY = 1;
            this.replace();            
            this.wayid = 0;
            this.setSkin();
            this.node.rotation = 0;
        }, this);
        Define.touchid = -1;
        // this.node.scale = 0.6;
    } 

    public onJiaSu() {
        if (!this.b_isRunning || this.node.x !== -282) { return; }
        this.js_time = 2;
        this.js_num = 0.5;
    } 

    public update(dt) {
        if (!this.b_isRunning) {return; }
        if (this.js_time > 0) {
            this.js_time -= dt;
            if (this.js_time <= 0) { this.js_num = 0; }
        }
        // 计算下一点坐标
        const d = dt * this.speed * (Define.jiasu + this.js_num);
        const p = this.node.getPosition();
        let radian = 0;
        let angle = 0;
        let hudu = 0;
        let x = 0;
        let y = 0;
        switch (this.wayid) {
            case 0: // 左边, 向上
                p.y += d;
                if (p.y < Define.way[this.wayid].y) {
                  this.node.setPosition(p);
                  break;
                }
                // 超出线段范围, 则判断角度  Define.way[1] : 左线段上面y坐标和圆半径
                radian = Math.atan((p.y - Define.way[1].y) / Define.way[1].r);
                angle = radian * 180 / 3.14;
                this.angle = 270 - angle;

                hudu = (2 * Math.PI / 360) * this.angle;
                x = 0 + Math.sin(hudu) * Define.way[1].r;
                y = Define.way[1].y - Math.cos(hudu) * Define.way[1].r;
                this.node.rotation = angle;
                this.node.setPosition(cc.v2(x, y)) ;
                
                this.wayid = 1;
                break;

            case 1: // 上面半圆
                this.angle -= d * 0.20328; // 1像素=0.20328度
                if (this.angle < 90) {
                    this.node.rotation = 180;
                    this.node.setPosition(cc.v2(Define.way[2].x, p.y - d));
                    this.wayid = 2;
                    break;
                }
                hudu = (2 * Math.PI / 360) * this.angle;
                x = 0 + Math.sin(hudu) * Define.way[1].r;
                y = Define.way[1].y - Math.cos(hudu) * Define.way[1].r;
                this.node.rotation = 270 - this.angle;
                this.node.setPosition(cc.v2(x, y)) ;               
                break;

            case 2: // 右边向下
                p.y -= d;
                if (p.y > Define.way[this.wayid].y) {
                    this.node.setPosition(p);
                    break;                                  
                }
                // 超出线段范围, 则判断角度  Define.way[3] : 左线段上面y坐标和圆半径
                // console.log(p);
                radian = Math.atan((p.y - Define.way[3].y) / Define.way[3].r);
                angle = radian * 180 / 3.14;
                this.angle = 90 - angle;
                // console.log(angle, this.angle);

                hudu = (2 * Math.PI / 360) * this.angle;
                x = 0 + Math.sin(hudu) * Define.way[3].r;
                y = Define.way[3].y + Math.cos(hudu) * Define.way[3].r;
                this.node.rotation = 180 - angle;
                this.node.setPosition(cc.v2(x, y)) ;                
                this.wayid = 3;
                // 增加金币
                Define.sceneNode.emit("gold_add", this.carid);
                break;
            case 3: // 下面半圆
                this.angle += d * 0.20328; // 1像素=0.20328度
                if (this.angle > 270) {
                    this.node.rotation = 0;
                    this.node.setPosition(cc.v2(Define.way[0].x, p.y + d));
                    this.wayid = 0;
                    break;
                }
                hudu = (2 * Math.PI / 360) * this.angle;
                x = 0 + Math.sin(hudu) * Define.way[3].r;
                y = Define.way[3].y + Math.cos(hudu) * Define.way[3].r;
                this.node.rotation = this.angle + 90;
                this.node.setPosition(cc.v2(x, y)) ;                
                break;
        }
        return;
        
/*

        a = Math.atan((p2.y-p.y)/(p2.x-p.x));
        const x, y;
        const isleft = [0, 1, 2, 3, 4, 11].indexOf(this.wayid)>=0;
        if ( (a<0 && isleft) || (a>0 && !isleft) ) {
            x = p.x - Math.cos(a)*d;
            y = p.y - Math.sin(a)*d;
        }else{
            x = p.x + Math.cos(a)*d;
            y = p.y + Math.sin(a)*d;
        }
        if ((isleft && y>p2.y) || (!isleft && y<p2.y)) {
            // 转弯了
          //   console.log("转弯了", this.wayid);
            if (this.wayid==4) {
               console.log("这里应该切换皮肤");
            }else if (this.wayid==10) {
                // 切换皮肤并通知显示金币
                Define.sceneNode.emit("gold_add", this.carid);
            }
            this.node.scaleX = - this.node.scaleX;
            this.wayid++;
            this.wayid = this.wayid>11 ? 0:this.wayid;
            this.node.setPosition(p2);

            return;
            
        }
        this.node.setPosition(cc.v2(x, y));
        */
    }

}

