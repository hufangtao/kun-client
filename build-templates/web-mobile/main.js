// QQPlay window need to be inited first
if (false) {
    BK.Script.loadlib('GameRes://libs/qqplay-adapter.js');
}

window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;

    if ( !settings.debug ) {
        var uuids = settings.uuids;

        var rawAssets = settings.rawAssets;
        var assetTypes = settings.assetTypes;
        var realRawAssets = settings.rawAssets = {};
        for (var mount in rawAssets) {
            var entries = rawAssets[mount];
            var realEntries = realRawAssets[mount] = {};
            for (var id in entries) {
                var entry = entries[id];
                var type = entry[1];
                // retrieve minified raw asset
                if (typeof type === 'number') {
                    entry[1] = assetTypes[type];
                }
                // retrieve uuid
                realEntries[uuids[id] || id] = entry;
            }
        }

        var scenes = settings.scenes;
        for (var i = 0; i < scenes.length; ++i) {
            var scene = scenes[i];
            if (typeof scene.uuid === 'number') {
                scene.uuid = uuids[scene.uuid];
            }
        }

        var packedAssets = settings.packedAssets;
        for (var packId in packedAssets) {
            var packedIds = packedAssets[packId];
            for (var j = 0; j < packedIds.length; ++j) {
                if (typeof packedIds[j] === 'number') {
                    packedIds[j] = uuids[packedIds[j]];
                }
            }
        }
    }

    function setLoadingDisplay () {
        // Loading splash scene
        var splash = document.getElementById('splash');
        var progressBar = splash.querySelector('.progress-bar span');
        // cc.loader.onProgress = function (completedCount, totalCount, item) {
        //     var percent = 100 * completedCount / totalCount;
        //     if (progressBar) {
        //         progressBar.style.width = percent.toFixed(2) + '%';
        //     }
        // };
        splash.style.display = 'block';
        progressBar.style.width = '80%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = 'none';
        });
    }

    var onStart = function () {
        cc.loader.downloader._subpackages = settings.subpackages;

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (!false && !false) {
            if (cc.sys.isBrowser) {
                setLoadingDisplay();
            }

            if (cc.sys.isMobile) {
                if (settings.orientation === 'landscape') {
                    cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE);
                }
                else if (settings.orientation === 'portrait') {
                    cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
                }
                cc.view.enableAutoFullScreen([
                    cc.sys.BROWSER_TYPE_BAIDU,
                    cc.sys.BROWSER_TYPE_WECHAT,
                    cc.sys.BROWSER_TYPE_MOBILE_QQ,
                    cc.sys.BROWSER_TYPE_MIUI,
                ].indexOf(cc.sys.browserType) < 0);
            }

            // Limit downloading max concurrent task to 2,
            // more tasks simultaneously may cause performance draw back on some android system / browsers.
            // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
            if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
                cc.macro.DOWNLOAD_MAX_CONCURRENT = 2;
            }
        }

        // init assets
        cc.AssetLibrary.init({
            libraryPath: 'res/import',
            rawAssetsBase: 'res/raw-',
            rawAssets: settings.rawAssets,
            packedAssets: settings.packedAssets,
            md5AssetsMap: settings.md5AssetsMap
        });

        var launchScene = settings.launchScene;

        // load scene
        cc.director.loadScene(launchScene, null,
            function () {
                if (cc.sys.isBrowser) {
                    // show canvas
                    var canvas = document.getElementById('GameCanvas');
                    canvas.style.visibility = '';
                    var div = document.getElementById('GameDiv');
                    if (div) {
                        div.style.backgroundImage = '';
                    }
                }
                cc.loader.onProgress = null;
                console.log('Success to load scene: ' + launchScene);
            }
        );
    };

    // jsList
    var jsList = settings.jsList;

    if (false) {
        BK.Script.loadlib();
    }
    else {
        var bundledScript = settings.debug ? 'src/project.dev.js' : 'src/project.js';
        if (jsList) {
            jsList = jsList.map(function (x) {
                return 'src/' + x;
            });
            jsList.push(bundledScript);
        }
        else {
            jsList = [bundledScript];
        }
    }

    // ANYS scripts
    if (cc.sys.isNative && cc.sys.isMobile) {
        jsList = jsList.concat(['src/ANYS/jsb_ANYS.js', 'src/ANYS/jsb_ANYS_constants.js']);
    }

    // xlchen 2018-10-09 不让引擎去加载，自己来控制加载文件
    jsList = [];

    var option = {
        id: 'GameCanvas',
        scenes: settings.scenes,
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: !false && settings.debug,
        frameRate: 60,
        jsList: jsList,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    }

    cc.game.run(option, onStart);
};

// main.js is qqplay and jsb platform entry file, so we must leave platform init code here
if (false) {
    BK.Script.loadlib('GameRes://src/settings.js');
    BK.Script.loadlib();
    BK.Script.loadlib('GameRes://libs/qqplay-downloader.js');

    var ORIENTATIONS = {
        'portrait': 1,
        'landscape left': 2,
        'landscape right': 3
    };
    BK.Director.screenMode = ORIENTATIONS[window._CCSettings.orientation];
    initAdapter();
    cc.game.once(cc.game.EVENT_ENGINE_INITED, function () {
        initRendererAdapter();
    });

    qqPlayDownloader.REMOTE_SERVER_ROOT = "";
    var prevPipe = cc.loader.md5Pipe || cc.loader.assetLoader;
    cc.loader.insertPipeAfter(prevPipe, qqPlayDownloader);

    window.boot();
}
else if (window.jsb) {
    require('src/settings.js');
    require('src/cocos2d-jsb.js');
    require('jsb-adapter/engine/index.js');
    window.boot();
}

if (window.document) {
      // open web debugger console
      if (typeof VConsole !== 'undefined') {
        window.vConsole = new VConsole();
      }

      var splash = document.getElementById('splash');
      splash.style.display = 'block';

    //   var cocos2d = document.createElement('script');
    //   cocos2d.async = true;
    //   cocos2d.src = window._CCSettings.debug ? 'cocos2d-js.js' : 'cocos2d-js-min.js';

    //   var engineLoaded = function () {
    //     document.body.removeChild(cocos2d);
    //     cocos2d.removeEventListener('load', engineLoaded, false);
    //     window.boot();
    //   };
    //   cocos2d.addEventListener('load', engineLoaded, false);
    //   document.body.appendChild(cocos2d);

    //dynamic-load-all-script-begin
    var loadScript = function (list, callback) {
      var loaded = 0;
      var loadNext = function () {
        loadSingleScript(list[loaded], function () {
          loaded++;
          if (loaded >= list.length) {
            callback();
          } else {
            loadNext();
          }
        })
      };
      loadNext();
    };
    //dynamic-load-all-script-end

    var loadSingleScript = function (src, callback) {
      var s = document.createElement('script');
      s.async = false;
      s.src = src;

      var singleCallback = (function _single() {
        s.parentNode.removeChild(s);
        s.removeEventListener('load', singleCallback, false);
        callback();
      });
      s.addEventListener('load', singleCallback, false);
    //   console.log("loadSingleScript", src);
      document.body.appendChild(s);
    };

    //dynamic-load-animal-script-begin
    var jsList = [];
    var cocos2dJs = window._CCSettings.debug ? './cocos2d-js.js' : './cocos2d-js-min.js';
    var webdownloaderdJS = "./src/assets/resources/jsLib/res-remote-url.js";
    var base64JS = "./src/assets/resources/jsLib/base64.min.js";
    var zipJS = "./src/assets/resources/jsLib/jszip/jszip.min.js";
    var partnerJs = "./src/assets/partner/PartnerBase.js";
    var partnerQZoneJs = "./Partners/PartnerQZone.js";
    var dygameJs = "./src/assets/resources/jsLib/dy-game.js";
    var projectJs = window._CCSettings.debug ? './src/project.dev.js' : './src/project.js';
    jsList.push(cocos2dJs);
    jsList.push(webdownloaderdJS);
    jsList.push(base64JS);
    jsList.push(zipJS);
    jsList.push(partnerJs);
    jsList.push(partnerQZoneJs);
    jsList.push(dygameJs);
    jsList.push(projectJs);
    //dynamic-load-animal-script-end

    loadScript(jsList, function() {
    //   //插入新的pipeline 可以综合处理不同平台的资源加载
    //   var prevPipe = cc.loader.md5Pipe || cc.loader.assetLoader;
    //   resRemoteUrl.REMOTE_SERVER_ROOT = ANIMAL_RES_REMOTE_SERVER_ROOT;
    //   cc.loader.insertPipeAfter(prevPipe, resRemoteUrl);
      window.boot();
    });
}