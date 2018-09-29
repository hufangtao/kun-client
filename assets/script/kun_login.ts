import Define from "./Define";
import global from "./global";
import HTTP from "./HTTP";
const {ccclass, property} = cc._decorator;

@ccclass
export default class kun_login extends cc.Component {

	@property(cc.EditBox)
	private account: cc.EditBox = null;

	@property(cc.EditBox)
	private pw: cc.EditBox = null;


	public start() {
		cc.director.preloadScene("car_main");
	}

	public onlogin() {
		Define.online = false;
		// if (this.account.string === "" ||  "" === this.pw.string) {
		// 	return; 
		// }
		if (this.account.string === "") {
			return; 
		}
		// HTTP.sendRequest("/login", {account: this.account.string, pw: this.pw.string}, (ret) => {
		HTTP.sendRequestGet("/login", {account: this.account.string}, (ret) => {
			if (ret.errcode === 0) {
				Define.userData = ret.data;
				if (Define.userData.park !== null && Define.userData.park !== "") { 
					Define.userData.park = JSON.parse(ret.data.park); 
				} else { 
					Define.userData.park = []; 
				}
				
				if (Define.userData.buy_coin === null || Define.userData.buy_coin === "") {
					Define.userData.buy_coin = [100]; 
				} else { 
					Define.userData.buy_coin = JSON.parse(Define.userData.buy_coin); 
				}
				cc.director.loadScene("car_start");
				Define.online = true;
			} else {
				console.log(ret.errmsg);
				global.showTip(ret.errmsg);
			}
		}, null);
	}

	public onregist() {
		if (this.account.string === "" ||  "" === this.pw.string) {
			return; 
		}
		HTTP.sendRequestGet("/regist", {account: this.account.string, pw: this.pw.string}, (ret) => {
			if (ret.errcode === 0) {
				console.log("注册成功");
				global.showTip("注册成功,请登陆.");
			} else {
				console.log(ret.errmsg);
				global.showTip(ret.errmsg);
			}
		}, null);
	}
}

