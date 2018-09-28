declare module Partner {
  class LoginData {
    platform: string;
    openid:   string;
    openkey:  string;
    params?:  string;
  }
  
  declare const SERVER_GROUP: string;
  declare const PARTNER_NAME: string;
  declare const CHANNEL: number;
  declare const CDN_HOST: string;
  declare const HEAD_IMG_HOST: string;
  declare const userInfo: any;
  declare const SHOW_GM: boolean;

  // 注册zip文件的下载和加载处理
  function registerZipLoad();

  // 资源更新
  function resUpdate(callback: Function);

  function registerToastCallback(callback: Function);
}
