import Define from "./Define";
import global from "./global";
import HTTP from "./HTTP";
const { ccclass, property } = cc._decorator;

@ccclass
export default class car_main extends cc.Component {

    @property(cc.Prefab)
    private pfbCar: cc.Prefab = null;

    @property(cc.Node)
    private nodHuiShouNode: cc.Node = null;

    @property(cc.Prefab)
    private pfbMallItem: cc.Prefab = null;

    @property(cc.Prefab)
    private pfbJB: cc.Prefab = null;

    @property(cc.Node)
    private nodJb: cc.Node = null;

    @property(cc.Prefab)
    private pfbJbAdd: cc.Prefab = null;

    @property(cc.Label)
    private labJbMeiQuan: cc.Label = null;

    @property(cc.Label)
    private labJbCount: cc.Label = null;

    @property(cc.Label)
    private labJbCount2: cc.Label = null;

    @property(cc.Label)
    private labJbMaiche: cc.Label = null;

    @property(cc.Label)
    private labRunning: cc.Label = null;

    @property(cc.Label)
    private labZs: cc.Label = null;

    @property(cc.Label)
    private labCjTime: cc.Label = null;

    @property(cc.SpriteFrame)
    private sprQiPao1: cc.SpriteFrame = null;

    @property(cc.SpriteFrame)
    private sprQiPao2: cc.SpriteFrame = null;

    @property(cc.Node)
    private nodLyQiPao: cc.Node = null;

    @property(cc.Label)
    private labJiaSu: cc.Label = null;

    @property(cc.Node)
    private parJiaSu: cc.Node = null;

    @property(cc.Label) 
    private labJbTop: cc.Label = null;

    @property(cc.Label) 
    private labJbBottom: cc.Label = null;

    @property(cc.JsonAsset) 
    private mJsoKuns: cc.JsonAsset = null;

    @property(cc.SpriteAtlas)
    private atlasFish: cc.SpriteAtlas = null;

    private mArrRunwayStart: cc.Vec2[] = []; // 跑道起点
    private mNumCjTime: number = 0;
    private mNumRunning: number = 0;
    private mArrPark: any[] = null;
    private mNumJsTime: number = 0;
    private mIsAnimEnd: boolean = true; // 金币动画结束标志
    private mLastId = 0;
    private mNodParkNode: cc.Node = null;
    private mConKunsConfig: any = null;

    public start() {
        this.mConKunsConfig = this.mJsoKuns.json;
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
        this.mArrRunwayStart.push(cc.v2(-282, -199));
        this.mArrRunwayStart.push(cc.v2(-282, 256));
        this.init();
        this.initEventHandlers();


        this.JB_ShowCount();
        this.JB_ShowMeiQuan();
        this.ZS_ShowCount();
        this.labJbMaiche.string = global.getNumString(Define.userData.buy_coin[0]);

        const self = this;
        cc.game.on(cc.game.EVENT_HIDE, function() {
            // console.log("hide");
            self.savedata();
        });
        cc.game.on(cc.game.EVENT_SHOW, function() {
            // console.log("show");
            self.huanyuan();

        });

        // 随机显示一个看视频的按钮
        cc.find("Canvas/sp" + global.randomNum(1, 2)).active = true;

        this.onXinShou();
        // 每5分钟保存一次数据
        // this.schedule(this.savedata, 10);

        return;

        // // 获取世界排行榜
        // const data = {
        //     openid: Define.userData.openid,
        //     id: Define.userData.id,
        //     t: Define.userData.t,
        //     token: Define.userData.token,
        // };
        // HTTP.sendRequestGet("/worldrank", data, function(ret) {
        //     // self.initworldrank(ret.data);   
        // }, null);

    }

    public init() {
        this.mNodParkNode = cc.find("Canvas/park");
        if (!this.mNodParkNode) {
            console.log("未找到节点：park");
            return;
        }
        this.mArrPark = [];
        const a_x = [-156, 3, 156];
        const a_y = [280, 176, 83, -22, -120, -220];
        for (let y = 0; y < 6; y++) {
            for (let x = 0; x < 3; x++) {
                this.mArrPark.push({
                    car: null,
                    pos: cc.v2(a_x[x], a_y[y]),
                });
            }
        }
        // 还原小车
        Define.userData.mqcoin = 0;
        for (let i = 0; i < Define.userData.park.length; i++) {
            const c = Define.userData.park[i];
            const n = cc.instantiate(this.pfbCar);
            n.setParent(this.mNodParkNode);
            this.mArrPark[c.index].car = n.getComponent("car");
            this.mArrPark[c.index].car.init(c.index, this.mArrPark[c.index].pos, c.carid);
            if (c.b_isRunning) {
                this.mArrPark[c.index].car.copy();
                /*this.mArrPark[c.index].car.wayid = c.wayid;
                this.angle = c.angle;
                n.rotation = c.r;
                n.setPosition(c.pos);
                */
                this.mArrPark[c.index].car.wayid = global.randomNum(0, 1) === 1 ? 2 : 0;
                if (this.mArrPark[c.index].car.wayid === 0) {
                    n.setPosition(cc.v2(-282, global.randomNum(-144, 213)));
                } else {
                    n.setPosition(cc.v2(282, global.randomNum(-144, 213)));
                    n.rotation = 180;
                }

                this.mArrPark[c.index].car.run();
                Define.userData.mqcoin += this.mArrPark[c.index].car.coin_quan;
                this.showRunningCount(1);
                // console.log("+1");
            }
        }
        this.JB_ShowMeiQuan();
        this.huanyuan();
    }

    public savedata() {
        global.myLog("savedata");
        const self = this;
        const s = self.getParkObj();
        Define.userData.park = JSON.parse(s);
        // global.saveUserData("park", s);
        // global.saveUserData("gem", Define.userData.gem);
        // global.saveUserData("coin", Define.userData.coin);
        Define.userData.lixiantime = Date.now();
        // global.saveUserData("lixiantime", Define.userData.lixiantime);
        Define.userData.jiasu_endtime = Date.now() + self.mNumJsTime * 1000;
        // global.saveUserData("jiasu_endtime", Define.userData.jiasu_endtime);
        Define.userData.ad_time = Date.now() + self.mNumCjTime * 1000;
        // global.saveUserData("ad_time", Define.userData.ad_time);
        // global.saveUserData("level", Define.userData.level);
        // global.saveUserData("buy_coin", JSON.stringify(Define.userData.buy_coin));

        if (!Define.online) { 
            return; 
        }
        const sendData: any = {};
        sendData.account        = Define.userData.account;
        sendData.id             = Define.userData.id;
        sendData.token          = Define.userData.serverAccSign;
        sendData.park           = s;
        sendData.gem            = Define.userData.gem;
        sendData.coin           = Define.userData.coin;
        global.myLog("金币 - 上传数据", Define.userData.coin);
        sendData.lixiantime     = Define.userData.lixiantime;
        sendData.jiasu_endtime  = Define.userData.jiasu_endtime;
        sendData.ad_time        = Define.userData.ad_time;
        sendData.level          = Define.userData.level;
        sendData.buy_coin       = JSON.stringify(Define.userData.buy_coin);

        HTTP.sendRequestPost("/setinfo", sendData, function(ret) {
            if (ret.errcode === 102 || ret.errcode === 103) {
                global.showTip("已断开连接!", 5);
                Define.online = false;
                this.scheduleOnce(() => {
                    cc.director.loadScene("car_login");
                },  5);
            }
        }, null);
    }

    public onback() {
        // 存储数据后返回
        this.savedata();
        cc.director.loadScene("car_start");

    }
    public onJiaSu(jiasutime) {

        if (jiasutime === 0) {
            Define.jiasu = 1;
            this.parJiaSu.active = false;
        } else {
            Define.jiasu = 2;
            this.parJiaSu.active = true;
        }
        this.JB_ShowMeiQuan();
    }

    public huanyuan() {
        // 测死
        // 计算离线后的加速时间
        let jst = Define.userData.jiasu_endtime > Define.userData.lixiantime ? Math.floor((Define.userData.jiasu_endtime - Define.userData.lixiantime) / 1000) : 0;
        const lxt = Math.floor((Date.now() - Define.userData.lixiantime) / 1000);
        let num = 0;
        const self = this;
        global.myLog("金币 - 离线收益 前1", Define.userData, lxt, jst);
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
        global.myLog("金币 - 离线收益 前2", Define.userData.coin, num);
        Define.userData.coin += num;
        global.myLog("金币 - 离线收益 后", Define.userData.coin);
        // 还原加速状态及时间
        if (jst > 2) {
            this.mNumJsTime = jst;

            this.scheduleOnce(() => {
                self.onJiaSu(1);
            }, 1);
        } else {
            this.labJiaSu.string = "";
            this.mNumJsTime = 0;
            Define.userData.jiasu_endtime = 0;
            this.scheduleOnce(() => {
                self.onJiaSu(0);
            }, 1);

        }
        // 显示抽奖倒计时
        this.mNumCjTime = (Define.userData.ad_time - Date.now()) / 1000;
        if (this.mNumCjTime <= 0) {
            this.labCjTime.string = "";
            Define.userData.ad_time = 0;
        }
    }

    public JB_ShowCount() {
        global.myLog("金币 - 显示金币", Define.userData.coin);
        this.labJbCount2.string = global.getNumString(Define.userData.coin);
        if (this.mIsAnimEnd) {
            this.mIsAnimEnd = false;
            const newstr = this.labJbCount2.string;
            const oldstr = this.labJbCount.string;
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
            this.labJbCount.string = s0;
            this.labJbTop.string = st;
            this.labJbBottom.string = sb;
            this.labJbTop.node.runAction(cc.moveBy(0.1, cc.v2(0, 32)));
            this.labJbBottom.node.runAction(cc.sequence(cc.moveBy(0.1, cc.v2(0, 32)), cc.callFunc(() => {
                self.labJbTop.string = "";
                self.labJbBottom.string = "";
                // self.labJbCount.string = newstr;
                global.myLog("newstr", newstr);
                self.labJbCount.string = global.getNumString(Define.userData.coin);
                self.labJbBottom.node.y -= 32;
                self.labJbTop.node.y -= 32;
                self.mIsAnimEnd = true;
            })));
        }
    }

    public JB_ShowMeiQuan() {
        this.labJbMeiQuan.string = global.getNumString(Define.userData.mqcoin * Define.jiasu) + "/秒";
        // this.labJbMeiQuan.string = Define.userData.mqcoin * Define.jiasu + "/秒";
    }

    public ZS_ShowCount() {
        this.labZs.string = Define.userData.gem;
    }

    public showRunningCount(i) {
        if (this.mNumRunning >= 10 && i > 0) {
            return;
        }
        this.mNumRunning += i;
        this.labRunning.string = this.mNumRunning + "/10";
        if (i > 0) {
            this.nodLyQiPao.children[this.mNumRunning - 1].getComponent(cc.Sprite).spriteFrame = this.sprQiPao2;
        } else {
            this.nodLyQiPao.children[this.mNumRunning].getComponent(cc.Sprite).spriteFrame = this.sprQiPao1;
        }
    }

    public initEventHandlers() {

        // 拖动汽车结束事件
        this.node.on("car_touch_start", (data) => {
            this.nodHuiShouNode.color = cc.color(255, 137, 137);
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
        const jb = cc.instantiate(this.pfbJB);
        const jblbl = cc.instantiate(this.pfbJbAdd);
        jblbl.getComponent(cc.Label).string = "+" + global.getNumString(Define.coin[data]);
        jblbl.setParent(this.nodJb);
        jblbl.active = true;
        jblbl.setPosition(cc.v2(global.randomNum(-30, 30), 10));
        jblbl.runAction(cc.sequence(cc.spawn(cc.moveBy(1, cc.v2(0, 98)), cc.fadeTo(1.1, 0)), cc.callFunc(() => {
            jblbl.destroy();
        })));
        jb.setParent(this.nodJb);
        jb.active = true;
        global.myLog("金币 - 增加金币 前", Define.userData.coin, Define.coin[data]);
        Define.userData.coin += Define.coin[data];
        global.myLog("金币 - 增加金币 后", Define.userData.coin);
        this.JB_ShowCount();
    }

    public onTouchCar(data) {
        const self = this;
        this.nodHuiShouNode.color = cc.color(255, 255, 255);
        // 判断是否回收
        const hspos = cc.v2(253, -543);

        if (hspos.fuzzyEquals(data.pos, 60)) {
            // console.log("回收鱼鱼");
            data.car.huishou();
            global.myLog("金币 - onTouchCar 前", Define.userData.coin);
            Define.userData.coin += 200;  // 回收价格
            global.myLog("金币 - onTouchCar 后", Define.userData.coin);
            this.JB_ShowCount();
            this.mArrPark[data.car.index].car = null;
            return;
        }

        // 判断当前坐标是否在某个车位上面 data.pos.fuzzyEquals(this.park[i].pos, 30)
        // vec2.fuzzyEquals 判断两点是否邻近
        // cc.Intersection.pointInPolygon 判断一个点是否在一个多边形中
        let isInPark = false;
        for (let i = 0; i < 18; i++) {
            const p = this.mArrPark[i].pos;
            if (i !== data.car.index && cc.Intersection.pointInPolygon(data.pos, [p.add(Define.park_py[0]), p.add(Define.park_py[1]), p.add(Define.park_py[2]), p.add(Define.park_py[3])])) {
                isInPark = true;
                if (this.mArrPark[i].car) {
                    // 有车了, 判断该车位车与拖动的车是否相同
                    if (this.mArrPark[i].car.carid === data.car.carid && !this.mArrPark[i].car.b_isRunning) {
                        // 合并汽车, 拖动的车执行从两边向中间合拢的动画

                        if (data.car.carid >= Define.cardIdMax) {
                            global.showTip("最高一级不能合成");
                            data.car.replace();
                            return;    
                        }

                        this.mArrPark[data.car.index].car = null;
                        data.car.merge();
                        // 目标车放大淡出, 并升级
                        this.mArrPark[i].car.upgrade();
                        // 是否解锁汽车
                        if (data.car.carid === Define.userData.level) {
                            Define.userData.level = data.car.carid + 1;
                            this.initMallItem();
                            // Define.showTip("解锁新车, 暂时用这个提示", 1);
                            this.scheduleOnce(() => {
                                const node = cc.find("Canvas/panel/unlockcar/jc");
                                // node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (Define.userData.level + 1) + ".png", cc.SpriteFrame);
                                node.getComponent(cc.Sprite).spriteFrame = this.atlasFish.getSpriteFrame("ui-pack-fish-" + (Define.userData.level + 1));
                                self.onOpenDialog(null, "unlockcar");
                            }, 0.3);

                        }
                    } else {
                        data.car.replace();
                    }
                    return;
                } else {
                    // 车位无车, 直接放置
                    this.mArrPark[data.car.index].car = null;
                    data.car.index = i;
                    data.car.parkpos = this.mArrPark[i].pos;
                    this.mArrPark[i].car = data.car;
                }
                break;
            }
        }
        if (isInPark) {
            data.car.replace();
        } else {
            // 如果没在车位上面, 则判断是否是跑道起点
            if (this.mNumRunning < 10 && cc.Intersection.pointLineDistance(data.pos, this.mArrRunwayStart[0], this.mArrRunwayStart[1], true) <= 30) {
                // 开跑    				
                const p = global.getFootOfPerpendicular(data.pos, this.mArrRunwayStart[0], this.mArrRunwayStart[1]);
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

    public onBuyCar(event, id = null, coin = null) {
        if (id === null) {
            id = this.mLastId;
        }
        coin = coin === null ? Define.userData.buy_coin[id] : coin;
        if (Define.userData.coin < coin) {
            // console.log("金币不足");
            global.showTip("金币不足", 1);
            return;
        }
        for (let i = 0; i < 18; i++) {
            Define.audioMgr.playSFX("move");
            if (!this.mArrPark[i].car) {
                global.myLog("金币 - onBuyCar 前", Define.userData.coin);
                Define.userData.coin -= coin;
                global.myLog("金币 - onBuyCar 后", Define.userData.coin);
                const n = cc.instantiate(this.pfbCar);
                n.setParent(this.mNodParkNode);
                this.mArrPark[i].car = n.getComponent("car");
                this.mArrPark[i].car.init(i, this.mArrPark[i].pos, id);
                Define.userData.buy_coin[id] = Math.floor(Define.userData.buy_coin[id] * 1.07);
                this.labJbMaiche.string = global.getNumString(Define.userData.buy_coin[id]);
                this.mLastId = id;
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
        } else if (data === "choujiang" && this.mNumCjTime > 0) {
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

        for (let i = 0; i < this.mConKunsConfig.length; i++) {
            const n = cc.instantiate(this.pfbMallItem);
            // n.getChildByName("sp_icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (i + 1) + ".png", cc.SpriteFrame);
            n.getChildByName("sp_icon").getComponent(cc.Sprite).spriteFrame = this.atlasFish.getSpriteFrame("ui-pack-fish-" + (i + 1));

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
                let itemcoin = this.mConKunsConfig[i].coin;
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
                if (i < this.mConKunsConfig.length - 4) {
                    // lock.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (i + 5) + ".png", cc.SpriteFrame);
                    lock.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = this.atlasFish.getSpriteFrame("ui-pack-fish-" + (i + 5));
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
        if (this.mNumCjTime > 0) {
            global.showTip("不要心急, 还在冷却中哦...");
            return;
        }
        // 随机一个奖励
        if (parseInt(id, 0) === 2) {
            global.showTip("获得加速效果.");
            this.mNumJsTime = 150;
            this.onJiaSu(1);
        } else {
            global.showTip("获得50钻石");
            Define.userData.gem += 50;
            this.ZS_ShowCount();
        }
        this.mNumCjTime = 180;
        if (global.randomNum(1, 2) !== id) {
            event.target.active = false;
            event.target.parent.getChildByName("sp" + (3 - id)).active = true;
        }


    }
    public getParkObj() {
        const park = [];
        for (let i = 0; i < 18; i++) {
            if (!this.mArrPark[i].car) { continue; }
            park.push({
                index: this.mArrPark[i].car.index,
                carid: this.mArrPark[i].car.carid,
                b_isRunning: this.mArrPark[i].car.b_isRunning,
                wayid: this.mArrPark[i].car.wayid,
                pos: this.mArrPark[i].car.node.getPosition(),
                r: this.mArrPark[i].car.node.rotation,
                angle: this.mArrPark[i].car.angle,
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
        if (this.mNumJsTime >= 0) {
            this.labJiaSu.string = global.formatTime(this.mNumJsTime.toFixed(0));
            this.mNumJsTime -= dt;
            if (this.mNumJsTime <= 0) {
                this.labJiaSu.string = "";
                this.mNumJsTime = 0;
                this.onJiaSu(0);
            }
        }
        if (this.mNumCjTime >= 0) {
            this.labCjTime.string = global.formatTime(this.mNumCjTime.toFixed(0));
            this.mNumCjTime -= dt;
            if (this.mNumCjTime <= 0) {
                this.labCjTime.string = "";
                this.mNumCjTime = 0;
            }
        }
    }

    // 点击起跑区
    public onClickQiPao() {
        for (let i = 0; i < 18; i++) {
            if (this.mArrPark[i].car) { this.mArrPark[i].car.onJiaSu(); }
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
            this.mNumJsTime = (Define.userData.jiasu_endtime-Date.now())/1000;
            Define.audioMgr.playSFX("run");
            this.onJiaSu(1);
        } else {*/
        // 离线收益
        const num = Math.floor(Define.userData.mqcoin / 2 * time[id] * 60);
        global.myLog("金币 - onShangCheng_click 前", Define.userData.coin);
        Define.userData.coin += num;
        global.myLog("金币 - onShangCheng_click 后", Define.userData.coin);
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

