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

	Partner.PARTNER_NAME = "Dev";

	Partner.extends = function () {
		var obj = {};
		Object.setPrototypeOf(obj, Partner)
		obj.super = Partner;
		return obj;
	};

	Partner.getPlatform = function () {
		return Partner.PARTNER_NAME;
  }
  
	global.Partner = Partner;
}));
