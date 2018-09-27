//车位多边形(相对中车位中心)
var park_py = [ cc.v2(10,50),
				cc.v2(86,5),
				cc.v2(-10,-50),
				cc.v2(-86,-5)];
//每秒收益 当前等级速度*2.11=下一等级
var BasicCoin_s = 2; 
//基础金币(每圈), 当前等级*2 = 下一等级
var BasecCoin = 25;
cc.Class({
    extends: cc.Component,

    properties: {
    	car_prefab:cc.Prefab,
    	parkNode:cc.Node,
    	huishouNode:cc.Node,
    	runwaystart:[],
    	json_sc_config:cc.JsonAsset,
    	prefabMallItem:cc.Prefab,
    	prefabJB:cc.Prefab,
    	jb_node:cc.Node,
    	prefabJB_lbl:cc.Prefab,
    	lbl_jb_meiquan:cc.Label,
    	lbl_jb_count:cc.Label,
    	lbl_jb_count2:cc.Label,
    	lbl_jb_maiche:cc.Label,
    	lbl_running:cc.Label,
    	prefab_sc:cc.Prefab,
    	lbl_zs:cc.Label,

    	cj_time:0,
    	cj_time_lbl:cc.Label,

        sp_qipao_1:cc.SpriteFrame,
        sp_qipao_2:cc.SpriteFrame,
        ly_qipao:cc.Node,

        lbl_jiasu:cc.Label,
        running:0,
        park:null,
        js_time:0,
        jiasu_lizi:cc.Node,

        lbl_jb_top:cc.Label,
        lbl_jb_bottom:cc.Label,
        b_jb_act_isend:true, //金币动画结束标志

        kunsConfig:cc.JsonAsset,
    },

    start () {
        this.kunsConfig = this.kunsConfig.json;
    	//加速
    	cc.gg.jiasu = 1;
    	//计算出每一等级的速度,金币收益
    	cc.gg.coin = [BasecCoin];
    	for(let i=0;i<35;i++){
    		cc.gg.coin.push(parseInt(cc.gg.coin[i]*2));
    	}
    	cc.gg.level_times = [12,11.9,11.8,11.7,11.6,11.5,11.4,11.3,11.2,11.1,11,10.9,10.8,10.7,10.6,10.5,10.4,10.3,10.2,10.1,10,9.9,9.8,9.7,9.6,9.5,9.4,9.3,9.2,9.1,9,8.9,8.8,8.7];
    	//console.log(cc.gg.coin_s);
    	//console.log(cc.gg.coin);
    	cc.gg.sceneNode = this.node;
    	this.runwaystart.push(cc.v2(-282,-199));
    	this.runwaystart.push(cc.v2(-282,256));
    	this.init();
    	this.initEventHandlers();
    	

    	this.JB_ShowCount();
    	this.JB_ShowMeiQuan();
    	this.ZS_ShowCount();
    	this.lbl_jb_maiche.string = cc.gg.getNumString(cc.gg.userData.buy_coin[0]);

        let self = this;
        cc.game.on(cc.game.EVENT_HIDE, function () {
            console.log("hide");
            self.savedata();
        });
        cc.game.on(cc.game.EVENT_SHOW, function () {
            console.log("show");
            self.huanyuan();
            
        });

        //随机显示一个看视频的按钮
        cc.find("Canvas/Buttons/sp" + cc.gg.randomNum(1,2)).active = true;

        this.onXinShou();
        //每5分钟保存一次数据
        this.schedule(this.savedata,60);

        return;
        //获取世界排行榜
        let data = {
            openid:cc.gg.userData.openid,
            id:cc.gg.userData.id,
            t:cc.gg.userData.t,
            token:cc.gg.userData.token
        }
        cc.gg.http.sendRequest("/worldrank",data,function(ret){
            self.initworldrank(ret.data);
            
        });
        

    },
    init(){
    	this.parkNode = cc.find("Canvas/park");
    	if(!this.parkNode){
    		console.log("未找到节点：park");
    		return;
    	}
    	this.park = [];
    	let a_x = [-156,3,156];
    	let a_y = [280,176,83,-22,-120,-220];
    	for(let y=0;y<6;y++){
    		for(let x=0;x<3;x++){
    			this.park.push({
    					car:null,
    					pos:cc.v2(a_x[x],a_y[y])
    				})
    		}
    	}
    	//还原小车
        cc.gg.userData.mqcoin = 0;
        for(let i=0;i<cc.gg.userData.park.length;i++){
            let c = cc.gg.userData.park[i];
            let n = cc.instantiate(this.car_prefab);
            n.parent = this.parkNode;
            this.park[c.index].car = n.getComponent("car");
            this.park[c.index].car.init(c.index,this.park[c.index].pos,c.carid);
            if(c.b_isRunning){
                this.park[c.index].car.copy();
                /*this.park[c.index].car.wayid = c.wayid;
                this.angle = c.angle;
                n.rotation = c.r;
                n.setPosition(c.pos);
                */
                this.park[c.index].car.wayid = cc.gg.randomNum(0,1)==1 ? 2:0;
                if(this.park[c.index].car.wayid==0){
                    n.setPosition(cc.v2(-282,cc.gg.randomNum(-144,213)));
                }else{
                    n.setPosition(cc.v2(282,cc.gg.randomNum(-144,213)));
                    n.rotation = 180;
                }


                               
                this.park[c.index].car.run();
                cc.gg.userData.mqcoin += this.park[c.index].car.coin_quan;
                this.showRunningCount(1);
                console.log("+1")
            }
        }
        this.JB_ShowMeiQuan();
        this.huanyuan();
    },

    savedata(){
    	console.log("savedata");
        let self = this;
        let s = self.getParkObj();
        cc.gg.userData.park = JSON.parse(s);
        cc.gg.saveUserData("park",s);
        cc.gg.saveUserData("gem",cc.gg.userData.gem);
        cc.gg.saveUserData("coin",cc.gg.userData.coin);
        cc.gg.userData.lixiantime = Date.now();
        cc.gg.saveUserData("lixiantime",cc.gg.userData.lixiantime);
        cc.gg.userData.jiasu_endtime = Date.now()+self.js_time*1000;
        cc.gg.saveUserData("jiasu_endtime",cc.gg.userData.jiasu_endtime);
        cc.gg.userData.ad_time = Date.now()+self.cj_time*1000;
        cc.gg.saveUserData("ad_time",cc.gg.userData.ad_time);
        cc.gg.saveUserData("level",cc.gg.userData.level);
        cc.gg.saveUserData("buy_coin",JSON.stringify(cc.gg.userData.buy_coin));

    },

    onback(){
        	//存储数据后返回
        this.savedata();
    	cc.director.loadScene("car_start");

    },
    onJiaSu(jiasutime){
        
        if(jiasutime==0){
            cc.gg.jiasu = 1;
            this.jiasu_lizi.active = false;
        }else{
            cc.gg.jiasu = 2;
            this.jiasu_lizi.active = true;
        }
        this.JB_ShowMeiQuan();
    },

    huanyuan(){
        //计算离线后的加速时间
        let jst =  cc.gg.userData.jiasu_endtime>cc.gg.userData.lixiantime ? parseInt((cc.gg.userData.jiasu_endtime-cc.gg.userData.lixiantime)/1000) : 0;
        let lxt = parseInt((Date.now()-cc.gg.userData.lixiantime)/1000);
        let num = 0;
        let self = this;
        if(lxt>jst){
            //加速时间在离线时用完了.分别计算收益
            num = cc.gg.userData.mqcoin*jst + cc.gg.userData.mqcoin/2*(lxt-jst);
            jst = 0;            
        }else{
            //加速还没有用完,继续显示加速效果
            num = cc.gg.userData.mqcoin * lxt;
            jst = jst-lxt;
        }
        num = parseInt(num);
        //显示离线收益
        this.showLiXianShouYi(num);
        cc.gg.userData.coin += num;
        //还原加速状态及时间
        if(jst>2){
            this.js_time = jst;
            
            this.scheduleOnce(()=>{
                self.onJiaSu(1);
            },1)
        }else{
            this.lbl_jiasu.string = "";
            this.js_time = 0;
            cc.gg.userData.jiasu_endtime = 0;
            this.scheduleOnce(()=>{
                self.onJiaSu(0);
            },1)

        }
        //显示抽奖倒计时
        this.cj_time = (cc.gg.userData.ad_time - Date.now())/1000;
        if(this.cj_time<=0) {
            this.cj_time_lbl.string = "";
            cc.gg.userData.ad_time = 0;
        }
    },

    JB_ShowCount(){
       	this.lbl_jb_count2.string = cc.gg.getNumString(cc.gg.userData.coin);
       	if(this.b_jb_act_isend){
       		this.b_jb_act_isend = false;
       		let newstr = this.lbl_jb_count2.string;
       		let oldstr = this.lbl_jb_count.string;
       		let s0 = "",st="",sb="";
       		let n = oldstr.length<newstr.length ? oldstr.length:newstr.length
       		for(let i=0;i<n;i++){
       			if(newstr[i]!=oldstr[i]){
       				s0 = s0 + "  ";
       				st = st + oldstr[i];
       				sb = sb + newstr[i];
       			}else{
       				s0 = s0 + oldstr[i];
       				st = st + "  ";
       				sb = sb + "  ";
       			}
       		}
       		if(oldstr.length>newstr.length) st = st + oldstr.substring(n,oldstr.length);
       		else sb = sb + newstr.substring(n,newstr.length);
       		let self = this;
       		this.lbl_jb_count.string = s0;
       		this.lbl_jb_top.string = st;
       		this.lbl_jb_bottom.string = sb;
       		this.lbl_jb_top.node.runAction(cc.moveBy(0.1,cc.v2(0,32)));
       		this.lbl_jb_bottom.node.runAction(cc.sequence(cc.moveBy(0.1,cc.v2(0,32)),cc.callFunc(()=>{
       			self.lbl_jb_top.string = "";
       			self.lbl_jb_bottom.string = "";
       			self.lbl_jb_count.string = newstr;
       			self.lbl_jb_bottom.node.y -= 32;
       			self.lbl_jb_top.node.y -=32;
       			self.b_jb_act_isend = true;
       		})))
       	}

    },
    JB_ShowMeiQuan(){
    	this.lbl_jb_meiquan.string = cc.gg.getNumString(cc.gg.userData.mqcoin*cc.gg.jiasu) + "/秒";
    },
    ZS_ShowCount(){
    	this.lbl_zs.string = cc.gg.userData.gem;
    },

    showRunningCount(i){
        if(this.running>=10 && i>0)return;
        this.running+= i;
        this.lbl_running.string = this.running+ "/10";
        if(i>0){
            this.ly_qipao.children[this.running-1].getComponent(cc.Sprite).spriteFrame = this.sp_qipao_2;
        }else{
            this.ly_qipao.children[this.running].getComponent(cc.Sprite).spriteFrame = this.sp_qipao_1;
        }
    },

    initEventHandlers(){

    	//拖动汽车结束事件
    	this.node.on("car_touch_start",data=>{
    		this.huishouNode.color = cc.color(255,137,137);
    	},this);
    	this.node.on("car_touch_end",this.onTouchCar,this);
    	//增加金币
    	this.node.on("gold_add",this.onAddGold,this);
    	//停车
    	this.node.on("car_stop",data=>{
    		cc.gg.userData.mqcoin -= data;
    		this.JB_ShowMeiQuan();   
            this.showRunningCount(-1);		
    	},this)
    },

    onAddGold(data){
    	cc.gg.audioMgr.playSFX("addjb");
    	let jb = cc.instantiate(this.prefabJB);
    	let jblbl = cc.instantiate(this.prefabJB_lbl);    	
    	jblbl.getComponent(cc.Label).string = "+" + cc.gg.coin[data]; 
    	jblbl.parent = this.jb_node;
    	jblbl.active = true;
    	jblbl.setPosition(cc.v2(cc.gg.randomNum(-30,30),10));
    	jblbl.runAction(cc.sequence(cc.spawn(cc.moveBy(1,cc.v2(0,98)),cc.fadeTo(1.1,0)),cc.callFunc(()=>{
    		jblbl.destroy();
    	}) ));
		jb.parent = this.jb_node;
    	jb.active = true;
    	cc.gg.userData.coin += cc.gg.coin[data]; 
    	this.JB_ShowCount();
    },

    onTouchCar(data){
    	let self = this;
    	this.huishouNode.color = cc.color(255,255,255);
    	//判断是否回收
    	let hspos = cc.v2(253,-543);

    	if(hspos.fuzzyEquals(data.pos,60)){
    		console.log("回收鱼鱼");
    		data.car.huishou();
    		cc.gg.userData.coin += 200;  //回收价格
    		this.JB_ShowCount();
    		this.park[data.car.index].car  = null;
    		return;
    	}
		//判断当前坐标是否在某个车位上面 data.pos.fuzzyEquals(this.park[i].pos,30)
		//vec2.fuzzyEquals 判断两点是否邻近
		//cc.Intersection.pointInPolygon 判断一个点是否在一个多边形中
		let isInPark = false;
		for(let i=0;i<18;i++){
			let p = this.park[i].pos;
			if(i!=data.car.index && cc.Intersection.pointInPolygon(data.pos,[p.add(park_py[0]),p.add(park_py[1]),p.add(park_py[2]),p.add(park_py[3])])){
				isInPark = true;
				if(this.park[i].car){
					//有车了,判断该车位车与拖动的车是否相同
					if(this.park[i].car.carid == data.car.carid && !this.park[i].car.b_isRunning){
						//合并汽车,拖动的车执行从两边向中间合拢的动画
						
						this.park[data.car.index].car = null;
						data.car.merge();
                        //目标车放大淡出,并升级
                        this.park[i].car.upgrade();
                        //是否解锁汽车
                        if(data.car.carid==cc.gg.userData.level){
                        	cc.gg.userData.level = data.car.carid+1;
                        	this.initMallItem();
                        	//cc.gg.showTip("解锁新车,暂时用这个提示",1);
                        	this.scheduleOnce(()=>{
                        		let node = cc.find("Canvas/panel/unlockcar/jc");
                        		node.getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/" + (cc.gg.userData.level+1) +".png",cc.SpriteFrame);
								self.onOpenDialog(null,"unlockcar");
                        	},0.3);
                        	
                        }
					}else{
                        data.car.replace();
                    }
					return;
				}else{
					//车位无车,直接放置
					this.park[data.car.index].car = null;    					
					data.car.index = i;
					data.car.parkpos = this.park[i].pos;
					this.park[i].car = data.car;
				}
				break;
			}
		}
		if(isInPark){
			data.car.replace();
		}else{
			//如果没在车位上面,则判断是否是跑道起点
			if(this.running<10 && cc.Intersection.pointLineDistance(data.pos,this.runwaystart[0],this.runwaystart[1],true)<=30){
				//开跑    				
				let p = cc.gg.getFootOfPerpendicular(data.pos,this.runwaystart[0],this.runwaystart[1]);
				data.car.node.setPosition(p);
				data.car.run();
				//修改每圈金币数
				cc.gg.userData.mqcoin += data.car.coin_quan;
				this.showRunningCount(1);
                this.JB_ShowMeiQuan();			
			}else{
				data.car.replace();
			}
		}
    },

    onBuyCar(event,id = 0,coin =null){
    	coin = coin==null ? cc.gg.userData.buy_coin[id] : coin;
    	if(cc.gg.userData.coin<coin){
    		console.log("金币不足");
    		cc.gg.showTip("金币不足",1);
    		return;
    	}
		for(let i=0;i<18;i++){
			cc.gg.audioMgr.playSFX("move");
			if(!this.park[i].car){	
				cc.gg.userData.coin -= 	coin;		
	    		let n = cc.instantiate(this.car_prefab);
	    		n.parent = this.parkNode;
	    		this.park[i].car = n.getComponent("car");
	    		this.park[i].car.init(i,this.park[i].pos,id);
	    		cc.gg.userData.buy_coin[id] = parseInt(cc.gg.userData.buy_coin[id] * 1.07);
	    		this.lbl_jb_maiche.string = cc.gg.getNumString(cc.gg.userData.buy_coin[id]);
	    		this.JB_ShowCount();
	    		return;
	    	}
    	}
    	//显示无车位
    	cc.gg.showTip("没有地方可以放置了.",1);
    },

    onOpenDialog(event,data){
    	if(data === "maiche")this.initMallItem();
    	else if(data=="choujiang" && this.cj_time>0) return;
        let node  = cc.find("Canvas/panel/" + data);
        node.active = true;
        node.scale = 0.1;
        node.runAction(cc.scaleTo(0.1,1).easing(cc.easeBounceOut()));
        return node;
    },
    onCloseDialog(event,data){
        let node  = event.target.parent;
        node.active = false;
        if(node.name == "choujiang"){
            node.getChildByName("choujiang").rotation = 0;
            node.getChildByName("choujiang").stopAllActions();
        }

    },
    initMallItem(py = null){
    	  let sc = cc.find("Canvas/panel/maiche/listbg/sv_list").getComponent(cc.ScrollView);
	      let list = cc.find("Canvas/panel/maiche/listbg/sv_list/view/content");
	      list.removeAllChildren();
	      
	      let zslevel = JSON.parse('{"7":20,"13":60,"16":100,"19":150,"22":200,"25":250,"28":300,"31":350,"33":400,"35":500}');

	      for(let i=0;i<this.kunsConfig.length;i++){
	        let n = cc.instantiate(this.prefabMallItem);
	        n.getChildByName("sp_icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/"+(i+1) + ".png",cc.SpriteFrame);

	        n.active = true;
	        n.parent = list;
	        //图标是否隐藏
	        if(i>cc.gg.userData.level){
	        	n.getChildByName("sp_icon").color = cc.color(0,0,0);
	        	n.opacity = 188;
	        }

	        if(i==0 || i+4<=cc.gg.userData.level) {  
	        	//已解锁
	        	let b1 = null;
	        	let itemcoin =  this.kunsConfig[i].coin;
	        	//let iszs = zslevel.hasOwnProperty(i+1);

	        	if(cc.gg.userData.buy_coin.length<=i){
	        		cc.gg.userData.buy_coin.push(itemcoin)
	        	}else{
	        		itemcoin = cc.gg.userData.buy_coin[i];
	        	}  

	        	// if(iszs) {
	        	// 	b1 = n.getChildByName("btn_buy_zs");
	        	// 	itemcoin = zslevel[i+1] ;
	        	// }else{
	        		b1 = n.getChildByName("btn_buy");	        		
	        	//} 
	        	b1.active = true; 
	        	b1.getChildByName("num").getComponent(cc.Label).string = cc.gg.getNumString(itemcoin,3);  
	        	let money = itemcoin;
	        	
		        b1.on("touchstart",function(){
                    this.onBuyCar(null,i,money);
		        	//购买
		        	//if(!iszs)this.onBuyCar(null,i,money);
		        //     else{
		        //     	if(cc.gg.userData.gem<money){
		        //     		cc.gg.showTip("钻石数量不足");
		        //     		return;
		        //     	}else{
		        //     		cc.gg.userData.gem -= money;
		        //     		this.onBuyCar(null,i,0);
		        //     		this.ZS_ShowCount();

		        //     	}
		        //    //}
		             this.initMallItem(sc.getScrollOffset());

		        },this);
		    }else{
		    	//未解锁	    	
		    	let lock = n.getChildByName("lockbut");
		    	lock.active = true;
		    	if(i<this.kunsConfig.length-4){
		    		lock.getChildByName("icon").getComponent(cc.Sprite).spriteFrame = cc.loader.getRes("cars/"+(i+5) + ".png",cc.SpriteFrame);
		    		lock.getChildByName("level").getComponent(cc.Label).string = i+5;
		    	}else{
		    		lock.getChildByName("level").getComponent(cc.Label).string = "?";
		    	}
		    	
		    }

	        //itemcoin = parseInt(itemcoin*2);//1.175
	        //if(i==6) itemcoin = 20; //8级车20个钻石
	        
	      }
	      if(py)sc.scrollToOffset(py);

    },


    onChouJiang(event,id){
        if(this.cj_time>0){
        	cc.gg.showTip("不要心急,还在冷却中哦...");
        	return;
        }
        //随机一个奖励
        if(id==2){
            cc.gg.showTip("获得加速效果.");
            this.js_time = 150;
            this.onJiaSu(1);
        }else{
            cc.gg.showTip("获得50钻石");
            cc.gg.userData.gem += 50;
            this.ZS_ShowCount();
        }
        this.cj_time = 180;
        if(cc.gg.randomNum(1,2)!=id){
            event.target.active = false;
            event.target.parent.getChildByName("sp" + (3-id)).active = true;
        }

        
    },
    getParkObj(){
        let park = [];
        for(let i=0;i<18;i++){
            if(!this.park[i].car)continue;
            park.push({
                index:this.park[i].car.index,
                carid:this.park[i].car.carid,
                b_isRunning:this.park[i].car.b_isRunning,
                wayid:this.park[i].car.wayid,
                pos:this.park[i].car.node.getPosition(),
                r:this.park[i].car.node.rotation,
                angle:this.park[i].car.angle
            })
        }
        //console.log(park);
        return JSON.stringify(park);
    },

    showLiXianShouYi(num){
        if(!num)return;
        let node = this.onOpenDialog(null,"lixian");
        cc.gg.audioMgr.playSFX("addjb");
        cc.find("ly_num/num",node).getComponent(cc.Label).string = cc.gg.getNumString(num);
    },

    //显示时间(加速时间/抽奖时间)
    showTime(dt){
        if(this.js_time>=0){
            this.lbl_jiasu.string = cc.gg.formatTime(this.js_time.toFixed(0));
            this.js_time-=dt;
            if(this.js_time<=0 ){
                this.lbl_jiasu.string = "";
                this.js_time=0 ;
                this.onJiaSu(0);
            }
        }
        if(this.cj_time>=0){
            this.cj_time_lbl.string = cc.gg.formatTime(this.cj_time.toFixed(0));
            this.cj_time-=dt;
            if(this.cj_time<=0 ){
                this.cj_time_lbl.string = "";
                this.cj_time=0;
            }
        }
    },

    //点击起跑区
    onClickQiPao(){
        for(let i=0;i<18;i++){
            if(this.park[i].car)this.park[i].car.onJiaSu();
        }
    },

    onShangCheng_click(event,id){
        let time = [60,120,240,600,1200,3000]; //分钟
        let gem  = [100,200,400,1000,2000,5000]; //花费钻石
        if(cc.gg.userData.gem<gem[id]){
            cc.gg.showTip("钻石数量不足");
            return;
        }
        cc.gg.userData.gem -= gem[id];
        /*if(id<3){
            //加速
            if(!cc.gg.userData.jiasu_endtime)  cc.gg.userData.jiasu_endtime = Date.now() + time[id]*60000;
            else cc.gg.userData.jiasu_endtime += time[id]*60000;
            this.js_time = (cc.gg.userData.jiasu_endtime-Date.now())/1000;
            cc.gg.audioMgr.playSFX("run");
            this.onJiaSu(1);
        }else{*/
            //离线收益
            let num = parseInt(cc.gg.userData.mqcoin/2*time[id]*60);
            cc.gg.userData.coin += num;
            this.showLiXianShouYi(num);
            this.JB_ShowCount();

        //}
        this.ZS_ShowCount();


    },
    onXinShou(){
        if(cc.gg.userData.buy_coin[0]!=100) return;
        let hand = cc.find("Canvas/panel/xinshou/hand");
        let quan = cc.find("Canvas/panel/xinshou/quan");
        quan.scale = 0.5;
        hand.setPosition(cc.v2(30,50));
        hand.scale = 2;
        hand.active = true;
        let self = this;
        hand.runAction(cc.sequence(cc.spawn(cc.moveTo(0.5,cc.v2(0,0)),cc.scaleTo(0.5,0.8)),cc.callFunc(()=>{
            quan.active = true;
            quan.opacity = 255;
            quan.runAction(cc.spawn(cc.scaleTo(0.5,1.5), cc.fadeTo(0.5,0)));
        }),cc.scaleTo(0.2,1),cc.delayTime(1) ,cc.callFunc(()=>{
            hand.active = false;
            self.scheduleOnce(self.onXinShou,1);
        })));
    },

    update(dt){
    	this.showTime(dt);
    }
});
