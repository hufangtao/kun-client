declare module Partner {
  class LoginData {
    platform: string;
    openid:   string;
    openkey:  string;
    params?:  string;
  }
  
  // declare const SERVER_GROUP: string;
  declare const PARTNER_NAME: string;
  declare const SERVER_URL: string;
  // declare const CHANNEL: number;
  // declare const CDN_HOST: string;
  // declare const HEAD_IMG_HOST: string;
  // declare const userInfo: any;
  // declare const SHOW_GM: boolean;
  // declare const SHOW_TEST_BTN: boolean;
  // declare const SHOW_SERVER_LIST: boolean;
  // // 请求版本信息API
  // declare const VERSION_API_HOST: string;

  	// 注册授权的回调
	function doAccAuthorize(didAccAuthorizeCallback: (data: LoginData) =>any, inputAccountCallback: (howTo: number) => void, existSaved:  boolean = false);

	// 成功获取的账号授权
	function didAccAuthorize(data: LoginData);

	/**
	 * howTo 控制登录ui显示，值如下：
	 * 0：第三方sdk，调用登录接口，等待登录结果 -- 账号输入不显示 + 重新登录按钮不显示；
	 * 1：开发阶段，自己的账号系统 	-- 账号输入框显示
	 * 2：第三方sdk，登录失败，需要重新拉起登录--显示重新登录按钮；
	 */
	function inputAccount(howTo: number);

	// 不同平台需要 override，做个性化初始工作
	function initPlatform();
  
  // 平台
  function getPlatform(): string;
}
