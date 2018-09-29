import AudioMgr from "./AudioMgr";

export default class Define {
    public static coin: number[]  = [];
    public static touchid: number = 0;
    public static jiasu: number = 0;
    public static sceneNode: cc.Node = null;
    public static userData: any = null;
    public static online: boolean = false;
    public static audioMgr: AudioMgr = null;

    // 每秒收益 当前等级速度*2.11=下一等级
    public static BasicCoin_s = 2; 
    
    // 基础金币(每圈),  当前等级*2 = 下一等级
    public static BasecCoin = 25;

    public static level_times: number[] = [12, 11.9, 11.8, 11.7, 11.6, 11.5, 11.4, 11.3, 11.2, 11.1, 11, 10.9, 10.8, 10.7, 10.6, 10.5, 10.4, 10.3, 10.2, 10.1, 10, 9.9, 9.8, 9.7, 9.6, 9.5, 9.4, 9.3, 9.2, 9.1, 9, 8.9, 8.8, 8.7];

    public static way: any = [
        cc.v2(-282,  213),
        {y: 213, r: 282},   // 线段上面y坐标和圆半径
        cc.v2(282, -144),
        {y: -144, r: 282},   // 线段上面y坐标和圆半径
        cc.v2(0, -426),
        cc.v2(-278, -168),
   ];

    // 车位多边形(相对中车位中心)
    public static park_py = [ 
        cc.v2(10, 50), 
        cc.v2(86, 5), 
        cc.v2(-10, -50), 
        cc.v2(-86, -5)]
    ;
}
