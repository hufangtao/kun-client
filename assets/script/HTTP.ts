// const URL = "http://132.232.82.31:9000";
// URL = "http://192.168.20.84:9000";

const {ccclass, property} = cc._decorator;

@ccclass
export default class HTTP extends cc.Component {

    public static sessionId: number = 0;
    public static userId: number = 0;
    public static master_url: URL = null;
    // public static url: string = "http://192.168.20.173:9000";
    public static url: string = "https://fish-gate.dayukeji.com:9001";

    public static sendRequestGet(path, data, handler, extraUrl = null) {
        const xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        let str = "?";
        for (const k in data) {
            if (data.hasOwnProperty(k))  {
                if ( str !== "?") {
                    str += "&";
                }
                str += k + "=" + data[k];
            }
        }
        if (extraUrl === null) {
            extraUrl = HTTP.url;
        }
        const requestURL = extraUrl + path + encodeURI(str);
        //  console.log("RequestURL:" + requestURL);
        xhr.open("GET", requestURL, true);
        if (cc.sys.isNative) {
            // xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate");
        }
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                // console.log("http res("+ xhr.responseText.length + "):" + xhr.responseText);
                try {
                    const ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        // console.log(ret);
                        handler(ret);
                    }                     
                } catch (e) {
                    console.log("err:" + e);
                    // handler(null);
                } finally {
                    // console.log("error");
                }
            }
        };
        
        xhr.send();
        return xhr;
    }

    public static sendRequestPost(path, data, handler, extraUrl = null) {
        const xhr = cc.loader.getXMLHttpRequest();
        xhr.timeout = 5000;
        if (extraUrl === null) {
            extraUrl = HTTP.url;
        }
        const requestURL = extraUrl + path;
        xhr.open("POST", requestURL, true);
        xhr.setRequestHeader("Content-Type", "application/json;charset=utf-8");
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && (xhr.status >= 200 && xhr.status < 300)) {
                try {
                    // console.log("~~~~~~~~~~~~~~~~~~~~http get data~~~~~~~~~~~~~~~~~~~~", xhr);
                    const ret = JSON.parse(xhr.responseText);
                    if (handler !== null) {
                        handler(ret);
                    }                     
                } catch (e) {
                    console.log("err:" + e);
                } finally {
                }
            }
        };
        // console.log("~~~~~~~~~~~~~~~~~~~~http send data~~~~~~~~~~~~~~~~~~~~", JSON.stringify(data));
        xhr.send(JSON.stringify(data));
        return xhr;
    }
}
