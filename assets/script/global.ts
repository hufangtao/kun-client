import Define from "./define";
import HTTP from "./HTTP";

const {ccclass, property} = cc._decorator;

@ccclass
export default class global extends cc.Component {

    //  路线 左右两段线段357 * 2,  上面两个半圆长: 1771, 半径 282,  总路线长度2521
    // 
    //  最高点(0, 495), 半径282,  左-282, 213,   右282, 213    画圆角度270->90
    // 
    //  最低点(0, -426),  左-282, -144,  右282, -144  画圆角度 90->-90
    // 
    // 
    // 
    //  way:[cc.v2(-282, 213), 
    //          {y:213, r:282},    // 线段上面y坐标和圆半径
    //          cc.v2(282, -144), 
    //          {y:-144, r:282},    // 线段上面y坐标和圆半径
    //          cc.v2(0, -426), 
    //          cc.v2(-278, -168)         

    //  ], 
    /** 
     *  计算两点间的距离
     *  @param  {[type]} p1 点1坐标
     *  @param  {[type]} p2 点2坐标
     *  @return {[type]}    [description]
     */

    public static getPtoPdistance(p1, p2) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
    }

    /** 
     *  计算点到直线的垂足
     *  @param  cc.v2 point 直线外一点
     *  @param  cc.v2 p1    直线点1
     *  @param  cc.v2 p2    直线点2
     *  @return cc.v2       垂足坐标
     */
    public static getFootOfPerpendicular(point, p1, p2) {
        // 计算直线公式一般式 Ax+By+c=0
        const A = p2.y - p1.y;
        const B = p1.x - p2.x;
        const C = p2.x * p1.y - p1.x * p2.y;
        // console.log(A, B, C);
        const x = (  B * B * point.x - A * B * point.y - A * C  ) / ( A * A + B * B );
        const y = ( -A * B * point.x + A * A * point.y - B * C  ) / ( A * A + B * B );
        return cc.v2(x, y);
    }

    public static getNumString(num, l = 4) {
        let s = num.toString();
        const n = Math.floor((s.length - 1) / 3);
        const dw = "KMGTPEZYB";
        if (n > 0) { 
            s = s.slice(0, s.length - n * 3) + dw[n - 1]; 
        }
        return s;           
    }

    /** 
     *  返回min-max之间的随机整数
     *  @return {[type]}     [description]
     */
    public static randomNum(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    }

    public static showmessage(title, content, callback = null, yes = "确 定", no = null, nocallback = null) {
        cc.loader.loadRes("prefab/alertbox",  (err,  prefab) => {
            const msg = cc.instantiate(prefab);
            cc.director.getScene().getChildByName("Canvas").addChild(msg);
            msg.setPosition(cc.v2(0, 100));
            msg.zIndex = cc.macro.MAX_ZINDEX;
            msg.runAction(cc.moveTo(0.1, cc.v2(0, 0)).easing(cc.easeBackOut()));
            msg.getComponent("alert").show(title,  content,  callback, yes, no, nocallback);
        });

    }
    public static showTip(content, time = 1.5) {
            cc.loader.loadRes("prefab/alertbox",  (err,  prefab) => {
            const msg = cc.instantiate(prefab);
            cc.director.getScene().getChildByName("Canvas").addChild(msg);
            msg.setPosition(cc.v2(0, 200));
            msg.zIndex = cc.macro.MAX_ZINDEX;
            msg.scale = .1;
            msg.runAction(cc.scaleTo(0.1, 1).easing(cc.easeBackOut()));
            msg.getComponent("alert").showTip(content,  time);
        });
    }

    // 将秒数转换为  *  * : *  * : *  *  的格式
    public static formatTime(sec) {
        let ret = "";
        const h = Math.floor(sec / 3600);
        sec = sec - h * 3600;
        const m = Math.floor(sec / 60);
        sec = sec - m * 60;
        if (h > 0) { ret = h + ":"; }
        if (m > 0 || h > 0) { ret = ret + m + ":"; }
        ret = ret + sec;
        return ret;
    }

    public static myLog(message?: any, ...optionalParams: any[]) {
        console.log(message, optionalParams);
      }
    
      public static myError(message?: any, ...optionalParams: any[]) {
        // console.error(message, optionalParams);
      }
      
    public static saveUserData(k, v, callback = null) {
        if (!Define.online) { 
            return; 
        }
        const data = {
            account: Define.userData.account, 
            id: Define.userData.id, 
            token: Define.userData.token, 
            key: k, 
            value: v,
        };
        HTTP.sendRequestPost("/setinfo", data, function(ret) {
            if (ret.errcode === 102 || ret.errcode === 103) {
                global.showTip("已断开连接!", 5);
                Define.online = false;
                this.scheduleOnce(() => {
                    cc.director.loadScene("car_login");
                },  5);
            }
            if (callback) {
                if (ret.errcode === 0) {
                    callback(true); 
                } else { 
                    callback(false);
                }
            }                
            
        }, null);
    }
}
