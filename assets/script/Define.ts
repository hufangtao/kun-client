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

    public static level_times: number[] = [
        12, 11.82, 11.65, 11.47, 11.29, 11.12, 
        10.94, 10.76, 10.59, 10.41, 10.24, 10.06, 
        9.88, 9.71, 9.53, 9.35, 9.18, 9, 8.82, 8.65, 
        8.47, 8.29, 8.12, 7.94, 7.76, 7.59, 7.41, 
        7.24, 7.06, 6.88, 6.71, 6.53, 6.35, 6.18, 6,
    ];

    public static way: any = [
        cc.v2(-282, 213),
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
