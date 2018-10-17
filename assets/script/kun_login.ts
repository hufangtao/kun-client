import Define from "./Define";
import global from "./global";
import HTTP from "./HTTP";
import DotAnimation from "./DotAnimation";
const {ccclass, property} = cc._decorator;

@ccclass
export default class kun_login extends cc.Component {

	@property(cc.Node)
	private nodAccInput: cc.Node = null;

	@property(cc.Node)
	private nodRelogin: cc.Node = null;

	@property(cc.EditBox)
	private edbAccount: cc.EditBox = null;

	private loadingAnimation: DotAnimation = null;

	// @property(cc.EditBox)
	// private pw: cc.EditBox = null;


	public start() {
		global.myLog("kun_login 进入登录场景");

		cc.director.preloadScene("car_main");

		const dotAnimation = DotAnimation.NewDotAnimation();
		dotAnimation.node.setParent(this.node);
		dotAnimation.node.position.y = -458;
		this.loadingAnimation = dotAnimation;

		Partner.doAccAuthorize((data: Partner.LoginData) => {
			// 账号登录成功
			// console.log("kun_login::start", data);
			this.requestLogin(data);
		}, (howTo: number) => {
			// 怎么展示ui
			this.showAccInput(howTo);
		}, this.existSavedGameAccount());
	}

	public hideLoading() {
		if (this.loadingAnimation) {
		  this.loadingAnimation.node.active = false;
		}
	  }
	
	  public showLoading() {
		if (this.loadingAnimation) {
		  this.loadingAnimation.node.active = true;
		}
	  }

	// 登录按钮
	public onBtnLogin() {
		const accId = this.edbAccount.string;
		if ( accId === "") {
			return;
		}
		const data: any = {};
		data.openid = accId;
		data.openkey = accId;
		data.platform = "Dev";
		data.params = "";
		Partner.didAccAuthorize(data);
	}

	// 重新登录按钮
	public onBtnRelogin() {
		this.showLoading();

		// 调用第三方合作商进行账号授权操作
		Partner.doAccAuthorize((data: Partner.LoginData) => {
			// 账号登录成功
			this.requestLogin(data);
		}, (howTo: number) => {
			// 怎么展示ui
			this.showAccInput(howTo);
		}, this.existSavedGameAccount());
	}

	/*
		howTo
		0: 输入账号、登录按钮都不显示
		1: 显示输入账号界面 这个仅在开发环境才会有
		2: 显示重新登录按钮 用于新触发第三方登录逻辑
	*/
   	public showAccInput(howTo: number) {
		if (howTo === 0) {
		this.nodAccInput.active = false;
		this.nodRelogin.active = false;
		} else if (howTo === 1) {
		this.hideLoading();
		this.nodAccInput.active = true;
		} else if (howTo === 2) {
		this.hideLoading();
		this.nodRelogin.active = true;
		}
	}

	// 请求登录
	public requestLogin(accParam: Partner.LoginData) {
		const gameAccount = this.getGameAccount();
		const gameAccountId: string = gameAccount.game_open_id;
		const gameAccountSign: string = gameAccount.game_open_id_sign;
		// 发送登陆协议
		const sendData: any = {};
		sendData.platform 		= accParam.platform;
		sendData.openId			= accParam.openid;
		sendData.openKey		= accParam.openkey;
		sendData.param			= accParam.params;
		sendData.serverAccId	= gameAccountId;
		sendData.serverAccSign	= gameAccountSign;
		
		HTTP.sendRequestPost("/login", sendData, (ret) => {
			if (ret.errcode === 0) {
				// console.log("xxxxxxxxxxxxxxxxxxxxxxxxxx");

				Define.userData = ret.data;
				if (Define.userData.park !== null && Define.userData.park !== "") { 
					Define.userData.park = JSON.parse(ret.data.park); 
				} else { 
					Define.userData.park = []; 
				}
				
				if (Define.userData.buy_coin !== null && Define.userData.buy_coin !== "") {
					Define.userData.buy_coin = JSON.parse(Define.userData.buy_coin); 
				} else { 
					Define.userData.buy_coin = [100]; 
				}

				this.saveGameAccount(ret.data.serverAccId, ret.data.serverAccSign);
				cc.director.loadScene("car_start");
				Define.online = true;
			} else {
				// console.log(ret.errmsg);
				global.showTip(ret.errmsg);
				if (Partner.getPlatform() !== "Base") {
					this.showAccInput(2);
				}
			}
		}, null);
	}

	// 是否存在保存的游戏账号信息
   	public existSavedGameAccount(): boolean {
		const gameAccount = this.getGameAccount();
		const gameOpenId: string = gameAccount.game_open_id;
		const gameOpenSign: string = gameAccount.game_open_id_sign;
		return gameOpenId !== "" && gameOpenSign !== "";
  	}

  	private saveGameAccount(openId: string, openIdSign: string) {
		const key = "game_account";
		const gameAccount = {
			game_open_id: openId,
			game_open_id_sign: openIdSign,
		};
		const data: string = JSON.stringify(gameAccount);
		// console.log("###saveGameAccount:" + data);
		cc.sys.localStorage.setItem(key, data);
  	}

  	private getGameAccount() {
		const key = "game_account";
		const gameAccount = {
			game_open_id: "",
			game_open_id_sign: "",
		};
		const data: string = cc.sys.localStorage.getItem(key);
		// console.log("###getGameAccount:" + data);
		try {
		if (data) {
			const savedData = JSON.parse(data);
			if (savedData.game_open_id) {
			gameAccount.game_open_id = savedData.game_open_id;
			gameAccount.game_open_id_sign = savedData.game_open_id_sign;
			}
		}
		} catch (e) {
		cc.warn("faild parse account data");
		}
		return gameAccount;
	}
		
	// public onBtnLogin() {
	// 	Define.online = false;
	// 	// if (this.account.string === "" ||  "" === this.pw.string) {
	// 	// 	return; 
	// 	// }
	// 	if (this.edbAccount.string === "") {
	// 		return; 
	// 	}
	// 	// HTTP.sendRequest("/login", {account: this.account.string, pw: this.pw.string}, (ret) => {
	// 	HTTP.sendRequestPost("/login", {account: this.edbAccount.string}, (ret) => {
	// 		if (ret.errcode === 0) {
	// 			Define.userData = ret.data;
	// 			if (Define.userData.park !== null && Define.userData.park !== "") { 
	// 				Define.userData.park = JSON.parse(ret.data.park); 
	// 			} else { 
	// 				Define.userData.park = []; 
	// 			}
				
	// 			if (Define.userData.buy_coin === null || Define.userData.buy_coin === "") {
	// 				Define.userData.buy_coin = [100]; 
	// 			} else { 
	// 				Define.userData.buy_coin = JSON.parse(Define.userData.buy_coin); 
	// 			}
	// 			cc.director.loadScene("car_start");
	// 			Define.online = true;
	// 		} else {
	// 			console.log(ret.errmsg);
	// 			global.showTip(ret.errmsg);
	// 		}
	// 	}, null);
	// }
	
	// public onregist() {
	// 	if (this.edbAccount.string === "" ||  "" === this.pw.string) {
	// 		return; 
	// 	}
	// 	HTTP.sendRequestGet("/regist", {account: this.edbAccount.string, pw: this.pw.string}, (ret) => {
	// 		if (ret.errcode === 0) {
	// 			console.log("注册成功");
	// 			global.showTip("注册成功,请登陆.");
	// 		} else {
	// 			console.log(ret.errmsg);
	// 			global.showTip(ret.errmsg);
	// 		}
	// 	}, null);
	// }
}

