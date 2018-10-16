; (function () {
  var ID = "ResRemoteUrl";
  var REGEX = /^\w+:\/\/.*/;

  var ResRemoteUrl = window.ResRemoteUrl = function () {
    this.id = ID;
    this.async = true;
    this.pipeline = null;
    this.REMOTE_SERVER_ROOT = '';
  };

  ResRemoteUrl.ID = ID;
  ResRemoteUrl.prototype.handle = function (item, callback) {
    console.log("#######item:", item);
    //callback(null, null);
    //return;

    if(!!!Partner.CDN_HOST) {
      callback(null, null);
      return;
    }

    if (REGEX.test(item.url)) {
      callback(null, null);
      return;
    }

    item.url = Partner.CDN_HOST + "res/" + item.url;
    callback(null, null);
    return;

    // 如果是jsb
    if (window.jsb) {
      if (window.RESOURCE_ENCRYPT) {
        //var ext = item.url.slice((item.url.lastIndexOf(".") - 1 >>> 0) + 2);
        //item.url = cc.DYMix.mixString(item.url) + "." + ext;
        item.url = cc.DYMix.mixString(item.url);
        if (item.type === "mp3") {
          item.url = item.url + ".mp3";
        }
        item.rawUrl = item.url;
      }
      //console.log("##############item:", item);
      //console.log("#######mix url:", item.url, "=>", jsb.fileUtils.isFileExist(item.url));
      callback(null, item);
      return;
    }


    var strBuff = new DyGame.MixStringBuffer();
    strBuff.setOri(item.url);
    var pathKey = strBuff.toString();
    //console.log(item.url, "====>", pathKey);
    if (window._DYMappings) {
      var relUrl = window._DYMappings[pathKey];
      if (!!relUrl) {
        item.url = Partner.CDN_HOST + "res/" + relUrl;
        callback(null, item);
        return;
      }
    }

    callback(null, item);
  }

  //插入新的pipeline 可以综合处理不同平台的资源加载
  var resRemoteUrl = window.resRemoteUrl = new ResRemoteUrl();
  var prevPipe = cc.loader.md5Pipe || cc.loader.assetLoader;
  cc.loader.insertPipeAfter(prevPipe, resRemoteUrl);
}());
