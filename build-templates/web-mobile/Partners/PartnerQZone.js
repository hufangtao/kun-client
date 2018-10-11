Partner = Partner.extends();

Partner.PARTNER_NAME = "QZone";

Partner.initPlatform = function() {

    // 账号输入框和登录按钮都不显示
    Partner.inputAccount(0);

    // 异步方式获取登录态 
    window.getOpenKey(function(d) {
        alert(JSON.stringify(d));
        console.log("Qzone 登录态", d);

        var jsonParam = {
            appid   = window.OPEN_DATA.appid,
            pf      = window.OPEN_DATA.pf,
            device  = window.OPEN_DATA.platform,      // 2-IOS，1-安卓
        }
        var param = JSON.stringify(jsonParam);

        // 登录参数
        var accData = {};
        accData.openid      = window.OPEN_DATA.openid;
        accData.openkey     = window.OPEN_DATA.openke;
        accData.platform    = Partner.PARTNER_NAME;
        accData.params      = param;
        Partner.didAccAuthorize(accData);
    });
};