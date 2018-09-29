import Define from "./Define";
import global from "./global";
import HTTP from "./HTTP";
const { ccclass, property } = cc._decorator;

@ccclass
export default class car_main extends cc.Component {


    private runwaystart: cc.Vec2[] = [];
    private cj_time: number = 0;
    private running: number = 0;
    private park: any[] = null;
    private js_time: number = 0;
    private b_jb_act_isend: boolean = true; // 金币动画结束标志

    @property(cc.Prefab)
    private car_prefab: cc.Prefab = null;

    @property(cc.Node)
    private parkNode: cc.Node = null;

    @property(cc.Node)
    private huishouNode: cc.Node = null;

    @property(cc.JsonAsset)
    private json_sc_config: cc.JsonAsset = null;

    @property(cc.Prefab)
    private prefabMallItem: cc.Prefab = null;

    @property(cc.Prefab)
    private prefabJB: cc.Prefab = null;

    @property(cc.Node)
    private jb_node: cc.Node = null;

    @property(cc.Prefab)
    private prefabJB_lbl: cc.Prefab = null;

    @property(cc.Label)
    private lbl_jb_meiquan: cc.Label = null;

    @property(cc.Label)
    private lbl_jb_count: cc.Label = null;

    @property(cc.Label)
    private lbl_jb_count2: cc.Label = null;

    @property(cc.Label)
    private lbl_jb_maiche: cc.Label = null;

    @property(cc.Label)
    private lbl_running: cc.Label = null;

    @property(cc.Prefab)
    private prefab_sc: cc.Prefab = null;

    @property(cc.Label)
    private lbl_zs: cc.Label = null;

    @property(cc.Label)
    private cj_time_lbl: cc.Label = null;

    @property(cc.SpriteFrame)
    private sp_qipao_1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private sp_qipao_2: cc.SpriteFrame = null;

    @property(cc.Node)
    private ly_qipao: cc.Node = null;

    @property(cc.Label)
    private lbl_jiasu: cc.Label = null;

    @property(cc.Node)
    private jiasu_lizi: cc.Node = null;

    @property(cc.Label)
    private lbl_jb_top: cc.Label = null;

    @property(cc.Label)
    private lbl_jb_bottom: cc.Label = null;

    @property(cc.JsonAsset)
    private kunsJsonAsset: cc.JsonAsset = null;

    private kunsConfig: any = null;

    public start() {
        this.kunsConfig = this.kunsJsonAsset.json;
        // 加速
        Define.jiasu = 1;
        // 计算出每一等级的速度, 金币收益
        Define.coin = [Define.BasecCoin];
        for (let i = 0; i < 35; i++) {
            Define.coin.push(Math.floor(Define.coin[i] * 2));
        }
        Define.level_times = [12, 11.82, 11.65, 11.47, 11.29, 11.12, 10.94, 10.76, 10.59, 10.41, 10.24, 10.06, 9.88, 9.71, 9.53, 9.35, 9.18, 9, 8.82, 8.65, 8.47, 8.29, 8.12, 7.94, 7.76, 7.59, 7.41, 7.24, 7.06, 6.88, 6.71, 6.53, 6.35, 6.18, 6];
        // console.log(Define.coin_s);
        // console.log(Define.coin);
        Define.sceneNode = this.node;
        this.runwaystart.push(cc.v2(-282, -199));
        this.runwaystart.push(cc.v2(-282, 256));
        this.init();
        this.initEventHandlers();


        this.JB_ShowCount();
        this.JB_ShowMeiQuan();
        this.ZS_ShowCount();
        this.lbl_jb_maiche.string = global.getNumString(Define.userData.buy_coin[0]);

        const self = this;
        cc.game.on(cc.game.EVENT_HIDE, function() {
            console.log("hide");
            self.savedata();
        });
        cc.game.on(cc.game.EVENT_SHOW, function() {
            console.log("show");
            self.huanyuan();

        });

        // 随机显示一个看视频的按钮
        cc.find("Canvas/Buttons/sp" + global.randomNum(1, 2)).active = true;

        this.onXinShou();
        // 每5分钟保存一次数据
        this.schedule(this.savedata, 60);

        return;

        // 获取世界排行榜
        const data = {
            openid: Define.userData.openid,
            id: Define.userData.id,
            t: Define.userData.t,
            token: Define.userData.token,
        };
        HTTP.sendRequestGet("/worldrank", data, function(ret) {
            // self.initworldrank(ret.data);   
        }, null);

    }

    public init() {
        this.parkNode = cc.find("Canvas/park");
        if (!this.parkNode) {
            console.log("未找到节点：park");
            return;
        }
        this.park = [];
        const a_x = [-156, 3, 156];
        const a_y = [280, 176, 83, -22, -120, -220];
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 3; x++) {
                this.park.push({
                    car: null,
                    pos: cc.v2(a_x[x], a_y[y]),
                });
            }
        }
        // 还原小车
        Define.userData.mqcoin = 0;
        for (let i = 0; i < Define.userData.park.length; i++) {
            const c = Define.userData.park[i];
            const n = cc.instantiate(this.car_prefab);
            n.setParent(this.parkNode);
            this.park[c.index].car = n.getComponent("car");
            this.park[c.index].car.init(c.index, this.park[c.index].pos, c.carid);
            if (c.b_isRunning) {
                this.park[c.index].car.copy();
                /*this.park[c.index].car.wayid = c.wayid;
                this.angle = c.angle;
                n.rotation = c.r;
                n.setPosition(c.pos);
                */
                this.park[c.index].car.wayid = global.randomNum(0, 1) === 1 ? 2 : 0;
                if (this.park[c.index].car.wayid === 0) {
                    n.setPosition(cc.v2(-282, global.randomNum(-144, 213)));
                } else {
                    n.setPosition(cc.v2(282, global.randomNum(-144, 213)));
                    n.rotation = 180;
                }

                this.park[c.index].car.run();
                Define.userData.mqcoin += this.park[c.index].car.coin_quan;
                this.showRunningCount(1);
                console.log("+1");
            }
        }
        this.JB_ShowMeiQuan();
        this.huanyuan();
    }

    public savedata() {
        console.log("savedata");
        const self = this;
        const s = self.getParkObj();
        Define.userData.park = JSON.parse(s);
        global.saveUserData("park", s);
        global.saveUserData("gem", Define.userData.gem);
        global.saveUserData("coin", Define.userData.coin);
        Define.userData.lixiantime = Date.now();
        global.saveUserData("lixiantime", Define.userData.lixiantime);
        Define.userData.jiasu_endtime = Date.now() + self.js_time * 1000;
        global.saveUserData("jiasu_endtime", Define.userData.jiasu_endtime);
        Define.userData.ad_time = Date.now() + self.cj_time * 1000;
        global.saveUserData("ad_time", Define.userData.ad_time);
        global.saveUserData("level", Define.userData.level);
        global.saveUserData("buy_coin", JSON.stringify(Define.userData.buy_coin));
    }

    public onback() {
        // 存储数据后返回
        this.savedata();
        cc.director.loadScene("car_start");

    }
    public onJiaSu(jiasutime) {

        if (jiasutime === 0) {
            Define.jiasu = 1;
            this.jiasu_lizi.active = false;
        } else {
            Define.jiasu = 2;
            this.jiasu_lizi.active = true;
        }
        this.JB_ShowMeiQuan();
    }

    public huanyuan() {
        // 计算离线后的加速时间
        let jst = Define.userData.jiasu_endtime > Define.userData.lixiantime ? Math.floor((Define.userData.jiasu_endtime - Define.userData.lixiantime) / 1000) : 0;
        const lxt = Math.floor((Date.now() - Define.userData.lixiantime) / 1000);
        let num = 0;
        const self = this;
        if (lxt > jst) {
            // 加速时间在离线时用完了.分别计算收益
            num = Define.userData.mqcoin * jst + Define.userData.mqcoin / 2 * (lxt - jst);
            jst = 0;
        } else {
            // 加速还没有用完, 继续显示加速效果
            num = Define.userData.mqcoin * lxt;
            jst = jst - lxt;
        }
        num = Math.floor(num);
        // 显示离线收益
        this.showLiXianShouYi(num);
        Define.userData.coin += num;
        // 还原加速状态及时间
        if (jst > 2) {
            this.js_time = jst;

            this.scheduleOnce(() => {
                self.onJiaSu(1);
            }, 1);
        } else {
            this.lbl_jiasu.string = "";
            this.js_time = 0;
            Define.userData.jiasu_endtime = 0;
            this.scheduleOnce(() => {
                self.onJiaSu(0);
            }, 1);

        }
        // 显示抽奖倒计时
        this.cj_time = (Define.userData.ad_time - Date.now()) / 1000;
        if (this.cj_time <= 0) {
            this.cj_time_lbl.string = "";
            Define.userData.ad_time = 0;
        }
    }

    public JB_ShowCount() {
        this.lbl_jb_count2.string = global.getNumString(Define.userData.coin);
        if (this.b_jb_act_isend) {
            this.b_jb_act_isend = false;
            const newstr = this.lbl_jb_count2.string;
            const oldstr = this.lbl_jb_count.string;
            let s0 = "";
            let st = "";
            let sb = "";
            const n = oldstr.length < newstr.length ? oldstr.length : newstr.length;
            for (let i = 0; i < n; i++) {
                if (newstr[i] !== oldstr[i]) {
                    s0 = s0 + "  ";
                    st = st + oldstr[i];
                    sb = sb + newstr[i];
                } else {
                    s0 = s0 + oldstr[i];
                    st = st + "  ";
                    sb = sb + "  ";
                }
            }
            if (oldstr.length > newstr.length) {
                st = st + oldstr.substring(n, oldstr.length);
            } else {
                sb = sb + newstr.substring(n, newstr.length);
            }
            const self = this;
            this.lbl_jb_count.string = s0;
            this.lbl_jb_top.string = st;
            this.lbl_jb_bottom.string = sb;
            this.lbl_jb_top.node.runAction(cc.moveBy(0.1, cc.v2(0, 32)));
            this.lbl_jb_bottom.node.runAction(cc.sequence(cc.moveBy(0.1, cc.v2(0, 32)), cc.callFunc(() => {
                self.lbl_jb_top.string = "";
                self.lbl_jb_bottom.string = "";
                self.lbl_jb_count.string = newstr;
                self.lbl_jb_bottom.node.y -= 32;
                self.lbl_jb_top.node.y -= 32;
                self.b_jb_act_isend = true;
            })));
        }
    }

    public JB_ShowMeiQuan() {
        this.lbl_jb_meiquan.string = global.getNumString(Define.userData.mqcoin * Define.jiasu) + "/秒";
        // this.lbl_jb_meiquan.string = Define.userData.mqcoin * Define.jiasu + "/秒";
    }

    public ZS_ShowCount() {
        this.lbl_zs.string = Define.userData.gem;
    }

    public showRunningCount(i) {
        if (this.running >= 10 && i > 0) {
            return;
        }
        this.running += i;
        this.lbl_running.string = this.running + "/10";
        if (i > 0) {
            this.ly_qipao.children[this.running - 1].getComponent(cc.Sprite).spriteFrame = this.sp_qipao_2;
        } else {
            this.ly_qipao.children[this.running].getComponent(cc.Sprite).spriteFrame = this.sp_qipao_1;
        }
    }

    public initEventHandlers() {

        // 拖动汽车结束事件
        this.node.on("car_touch_start", (data) => {
            this.huishouNode.color = cc.color(255, 137, 137);
        }, this);
        this.node.on("car_touch_end", this.onTouchCar, this);
        // 增加金币
        this.node.on("gold_add", this.onAddGold, this);
        // 停车
        this.node.on("car_stop", (data) => {
            Define.userData.mqcoin -= data;
            this.JB_ShowMeiQuan();
            this.showRunningCount(-1);
        }, this);
    }

    public onAddGold(data) {
        Define.audioMgr.playSFX("addjb");
        const jb = cc.instantiate(this.prefabJB);
        const jblbl = cc.instantiate(this.prefabJB_lbl);
        jblbl.getComponent(cc.Label).string = "+" + Define.coin[data];
        jblbl.setParent(this.jb_node);
        jblbl.active = true;
        jblbl.setPosition(cc.v2(global.randomNum(-30, 30), 10));
        jblbl.runAction(cc.sequence(cc.spawn(cc.moveBy(1, cc.v2(0, 98)), cc.fadeTo(1.1, 0)), cc.callFunc(() => {
            jblbl.destroy();
        })));
        jb.setParent(this.jb_node);
        jb.active = true;
        Define.userData.coin += Define.coin[data];
        this.JB_ShowCount();
    }

    public onTouchCar(data) {
        const self = this;
        this.huishouNode.color = cc.color(255, 255, 255);
        // 判断是否回收
        const hspos = cc.v2(253, -543);

        if (hspos.fuzzyEquals(data.pos, 60)) {
            console.log("回收鱼鱼");
            data.car.huishou();
            Define.userData.coin += 200;  // 回收价格
            this.JB_ShowCount();
            this.park[data.car.index].car = null;
            return;
        }

        // 判断当前坐标是否在某个车位上面 data.pos.fuzzyEquals(this.park[i].pos, 30)
        // vec2.fuzzyEquals 判断两点是否邻近
        // cc.Intersection.pointInPolygon 判断一个点是否在一个多边形中
        let isInPark = false;
        for (let i = 0; i < 18; i++) {
            const p = this.park[i].pos;
            if (i !== data.car.index && cc.Intersection.pointInPolygon(data.pos, [p.add(Define.park_py[0]), p.add(Define.park_py[1]), p.add(Define.park_py[2]), p.add(Define.park_py[3])])) {
                isInPark = true;
                if (this.park[i].car) {
                    // 有车了, 判断该车位车与拖动的车是否相同
                    if (this.park[i].car.carid === data.car.carid && !this.park[i].car.b_isRunning) {
                        // 合并汽车, 拖动的车执行从两边向中间合拢的动画

                        this.park[data.car.index].car = null;
                        data.car.merge();
                        // 目标车放大淡出, 并升级
                        this.park[i].car.upgrade();
                        // 是否解锁汽车
                        if (data.car.carid === Define.userData.level) {
                            Define.userData.level = data.car.carid + 1;
                            this.initMallItem();
                            // Define.showTip("解锁新车, 暂时用这个提示", 1);
                            this.scheduleOnce(() => {
                                const node = cc.find("Canvas/panel/unlockcar/jc");
                                node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (Define.userData.level + 1) + ".png", cc.SpriteFrame);
                                self.onOpenDialog(null, "unlockcar");
                            }, 0.3);

                        }
                    } else {
                        data.car.replace();
                    }
                    return;
                } else {
                    // 车位无车, 直接放置
                    this.park[data.car.index].car = null;
                    data.car.index = i;
                    data.car.parkpos = this.park[i].pos;
                    this.park[i].car = data.car;
                }
                break;
            }
        }
        if (isInPark) {
            data.car.replace();
        } else {
            // 如果没在车位上面, 则判断是否是跑道起点
            if (this.running < 10 && cc.Intersection.pointLineDistance(data.pos, this.runwaystart[0], this.runwaystart[1], true) <= 30) {
                // 开跑    				
                const p = global.getFootOfPerpendicular(data.pos, this.runwaystart[0], this.runwaystart[1]);
                data.car.node.setPosition(p);
                data.car.run();
                // 修改每圈金币数
                Define.userData.mqcoin += data.car.coin_quan;
                this.showRunningCount(1);
                this.JB_ShowMeiQuan();
            } else {
                data.car.replace();
            }
        }
    }

    public onBuyCar(event, id = 0, coin = null) {
        coin = coin === null ? Define.userData.buy_coin[id] : coin;
        if (Define.userData.coin < coin) {
            console.log("金币不足");
            global.showTip("金币不足", 1);
            return;
        }
        for (let i = 0; i < 18; i++) {
            Define.audioMgr.playSFX("move");
            if (!this.park[i].car) {
                Define.userData.coin -= coin;
                const n = cc.instantiate(this.car_prefab);
                n.setParent(this.parkNode);
                this.park[i].car = n.getComponent("car");
                this.park[i].car.init(i, this.park[i].pos, id);
                Define.userData.buy_coin[id] = Math.floor(Define.userData.buy_coin[id] * 1.07);
                this.lbl_jb_maiche.string = global.getNumString(Define.userData.buy_coin[id]);
                this.JB_ShowCount();
                return;
            }
        }
        // 显示无车位
        global.showTip("没有地方可以放置了.", 1);
    }

    public onOpenDialog(event, data) {
        if (data === "maiche") {
            this.initMallItem();
        } else if (data === "choujiang" && this.cj_time > 0) {
            return;
        }
        const node = cc.find("Canvas/panel/" + data);
        node.active = true;
        node.scale = 0.1;
        node.runAction(cc.scaleTo(0.1, 1).easing(cc.easeBounceOut()));
        return node;
    }
    public onCloseDialog(event, data) {
        const node = event.target.parent;
        node.active = false;
        if (node.name === "choujiang") {
            node.getChildByName("choujiang").rotation = 0;
            node.getChildByName("choujiang").stopAllActions();
        }

    }
    public initMallItem(py = null) {
        const sc = cc.find("Canvas/panel/maiche/listbg/sv_list").getComponent(cc.ScrollView);
        const list = cc.find("Canvas/panel/maiche/listbg/sv_list/view/content");
        list.removeAllChildren();

        const zslevel = JSON.parse('{"7":20, "13":60, "16":100, "19":150, "22":200, "25":250, "28":300, "31":350, "33":400, "35":500}');

        for (let i = 0; i < this.kunsConfig.length; i++) {
            const n = cc.instantiate(this.prefabMallItem);
            n.getChildByName("sp_icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (i + 1) + ".png", cc.SpriteFrame);

            n.active = true;
            n.setParent(list);

            // 图标是否隐藏
            if (i > Define.userData.level) {
                n.getChildByName("sp_icon").color = cc.color(0, 0, 0);
                n.opacity = 188;
            }

            if (i === 0 || i + 4 <= Define.userData.level) {
                // 已解锁
                let b1 = null;
                let itemcoin = this.kunsConfig[i].coin;
                const iszs = zslevel.hasOwnProperty(i + 1);

                if (Define.userData.buy_coin.length <= i) {
                    Define.userData.buy_coin.push(itemcoin);
                } else {
                    itemcoin = Define.userData.buy_coin[i];
                }
                // 有钻石购买逻辑
                // if (iszs) {
                //     b1 = n.getChildByName("btn_buy_zs");
                //     itemcoin = zslevel[i + 1] ;
                // } else {
                //     b1 = n.getChildByName("btn_buy");	        		
                // } 

                // 无钻石购买逻辑
                b1 = n.getChildByName("btn_buy");

                b1.active = true;
                b1.getChildByName("num").getComponent(cc.Label).string = global.getNumString(itemcoin, 3);
                const money = itemcoin;

                b1.on("touchstart", () => {
                    // 有钻石购买逻辑
                    // 购买
                    // if (!iszs) {
                    //     this.onBuyCar(null, i, money); 
                    // } else {
                    //     if (Define.userData.gem < money) {
                    //         global.showTip("钻石数量不足");
                    //         return;
                    //     } else {
                    //         Define.userData.gem -= money;
                    //         this.onBuyCar(null, i, 0);
                    //         this.ZS_ShowCount();
                    //     }
                    // }

                    // 无钻石购买逻辑
                    this.onBuyCar(null, i, money); 


                    this.initMallItem(sc.getScrollOffset());

                }, this);
            } else {
                // 未解锁	    	
                const lock = n.getChildByName("lockbut");
                lock.active = true;
                if (i < this.kunsConfig.length - 4) {
                    lock.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (i + 5) + ".png", cc.SpriteFrame);
                    lock.getChildByName("level").getComponent(cc.Label).string = "" + (i + 5);
                } else {
                    lock.getChildByName("level").getComponent(cc.Label).string = "?";
                }

            }

            // itemcoin = parseInt(itemcoin*2);//1.175
            // if (i === 6) itemcoin = 20; //8级车20个钻石

        }
        if (py) {
            sc.scrollToOffset(py);
        }

    }


    public onChouJiang(event, id) {
        if (this.cj_time > 0) {
            global.showTip("不要心急, 还在冷却中哦...");
            return;
        }
        // 随机一个奖励
        if (id === 2) {
            global.showTip("获得加速效果.");
            this.js_time = 150;
            this.onJiaSu(1);
        } else {
            global.showTip("获得50钻石");
            Define.userData.gem += 50;
            this.ZS_ShowCount();
        }
        this.cj_time = 180;
        if (global.randomNum(1, 2) !== id) {
            event.target.active = false;
            event.target.parent.getChildByName("sp" + (3 - id)).active = true;
        }


    }
    public getParkObj() {
        const park = [];
        for (let i = 0; i < 18; i++) {
            if (!this.park[i].car) { continue; }
            park.push({
                index: this.park[i].car.index,
                carid: this.park[i].car.carid,
                b_isRunning: this.park[i].car.b_isRunning,
                wayid: this.park[i].car.wayid,
                pos: this.park[i].car.node.getPosition(),
                r: this.park[i].car.node.rotation,
                angle: this.park[i].car.angle,
            });
        }
        // console.log(park);
        return JSON.stringify(park);
    }

    public showLiXianShouYi(num) {
        if (!num) { return; }
        const node = this.onOpenDialog(null, "lixian");
        Define.audioMgr.playSFX("addjb");
        cc.find("ly_num/num", node).getComponent(cc.Label).string = global.getNumString(num);
    }

    // 显示时间(加速时间/抽奖时间)
    public showTime(dt) {
        if (this.js_time >= 0) {
            this.lbl_jiasu.string = global.formatTime(this.js_time.toFixed(0));
            this.js_time -= dt;
            if (this.js_time <= 0) {
                this.lbl_jiasu.string = "";
                this.js_time = 0;
                this.onJiaSu(0);
            }
        }
        if (this.cj_time >= 0) {
            this.cj_time_lbl.string = global.formatTime(this.cj_time.toFixed(0));
            this.cj_time -= dt;
            if (this.cj_time <= 0) {
                this.cj_time_lbl.string = "";
                this.cj_time = 0;
            }
        }
    }

    // 点击起跑区
    public onClickQiPao() {
        for (let i = 0; i < 18; i++) {
            if (this.park[i].car) { this.park[i].car.onJiaSu(); }
        }
    }

    public onShangCheng_click(event, id) {
        const time = [60, 120, 240, 600, 1200, 3000]; // 分钟
        const gem = [100, 200, 400, 1000, 2000, 5000]; // 花费钻石
        if (Define.userData.gem < gem[id]) {
            global.showTip("钻石数量不足");
            return;
        }
        Define.userData.gem -= gem[id];
        /*if (id<3) {
            //加速
            if (!Define.userData.jiasu_endtime)  Define.userData.jiasu_endtime = Date.now() + time[id]*60000;
            else Define.userData.jiasu_endtime += time[id]*60000;
            this.js_time = (Define.userData.jiasu_endtime-Date.now())/1000;
            Define.audioMgr.playSFX("run");
            this.onJiaSu(1);
        } else {*/
        // 离线收益
        const num = Math.floor(Define.userData.mqcoin / 2 * time[id] * 60);
        Define.userData.coin += num;
        this.showLiXianShouYi(num);
        this.JB_ShowCount();

        // }
        this.ZS_ShowCount();


    }
    public onXinShou() {
        if (Define.userData.buy_coin[0] !== 100) { return; }
        const hand = cc.find("Canvas/panel/xinshou/hand");
        const quan = cc.find("Canvas/panel/xinshou/quan");
        quan.scale = 0.5;
        hand.setPosition(cc.v2(30, 50));
        hand.scale = 2;
        hand.active = true;
        const self = this;
        hand.runAction(cc.sequence(cc.spawn(cc.moveTo(0.5, cc.v2(0, 0)), cc.scaleTo(0.5, 0.8)), cc.callFunc(() => {
            quan.active = true;
            quan.opacity = 255;
            quan.runAction(cc.spawn(cc.scaleTo(0.5, 1.5), cc.fadeTo(0.5, 0)));
        }), cc.scaleTo(0.2, 1), cc.delayTime(1), cc.callFunc(() => {
            hand.active = false;
            self.scheduleOnce(self.onXinShou, 1);
        })));
    }

    public update(dt) {
        this.showTime(dt);
    }
}

