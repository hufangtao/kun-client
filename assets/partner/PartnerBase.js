; (function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined'
		? module.exports = factory(global)
		: typeof define === 'function' && define.amd
			? define(factory) : factory(global)
}((
	typeof self !== 'undefined' ? self
		: typeof window !== 'undefined' ? window
			: typeof global !== 'undefined' ? global
				: this
), function (global) {

	var Partner = global.Partner || {};
	var emptyFunc = function () { }

	Object.setPrototypeOf = Object.setPrototypeOf || function (obj, proto) {
		obj.__proto__ = proto;
		return obj;
	}

	Partner.PARTNER_NAME = "通用";

	Partner.extends = function () {
		var obj = {};
		Object.setPrototypeOf(obj, Partner)
		obj.super = Partner;
		return obj;
	};

	Partner.getPlatform = function () {
		return Partner.PARTNER_NAME;
	}

	// 注册授权的回调
	Partner.doAccAuthorize = function(didAccAuthorizeCallback, inputAccountCallback, existSaved) {
		Partner.didAccAuthorizeCallback = didAccAuthorizeCallback;
		Partner.inputAccountCallback	= inputAccountCallback;
		Partner.initPlatform();
	}

	// 成功获取的账号授权
	Partner.didAccAuthorize = function(accData) {
		Partner.didAccAuthorizeCallback(accData);
	}

	/**
	 * type 控制登录ui显示，值如下：
	 * 0：第三方sdk，调用登录接口，等待登录结果 -- 账号输入不显示 + 重新登录按钮不显示；
	 * 1：开发阶段，自己的账号系统 	-- 账号输入框显示
	 * 2：第三方sdk，登录失败，需要重新拉起登录--显示重新登录按钮；
	 */
	Partner.inputAccount = function(howTo) {
		Partner.inputAccountCallback(howTo);
	}

	// 不同平台需要 override，做个性化初始工作
	Partner.initPlatform =function() {
		Partner.inputAccount(1);

		// 开发阶段
		
	}

	global.Partner = Partner;
}));
