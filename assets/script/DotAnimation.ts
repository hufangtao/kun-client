const { ccclass, property } = cc._decorator;

@ccclass
export default class DotAnimation extends cc.Component {

  public static NewDotAnimation(): DotAnimation {
    const animationNode: cc.Node = new cc.Node();
    const dotAnimation = animationNode.addComponent(DotAnimation);
    return dotAnimation;
  }

  // 画点graph节点
  private dotGraphic: cc.Graphics = null;
  private dotNode: cc.Node = null;

  // 变量提示点的数目
  private dotNum: number = 0;

  // 背景graph节点
  private bgGraphic: cc.Graphics = null;



  public onLoad() {
    /*
    // 创建渲染背景的组件
    this.bgGraphic = this.node.addComponent(cc.Graphics);
    this.drawBackground();
    */ 

    // 创建渲染dot的节点
    this.dotNode = new cc.Node();
    this.node.addChild(this.dotNode);
    this.dotGraphic = this.dotNode.addComponent(cc.Graphics);

    const self = this;
    this.schedule(function() {
      self.updateDots();
    }, 0.5);
  }

  public updateDots() {
    const gap = 25;
    if (this.dotNum < 3) {
      this.drawDot(this.dotNum * gap - gap, 0, 7);
      this.dotNum++;
    } else {
      this.dotNum = 0;
      this.dotGraphic.clear();
    }
  }

  public drawDot(posX: number, posY: number, size: number) {
    this.dotGraphic.circle(posX, posY, size);
    this.dotGraphic.stroke();
    this.dotGraphic.fill();
  }

  private drawBackground() {
    const width = 200;
    const height = 40;
    this.bgGraphic.rect(-(width / 2), -(height / 2), width, height);
    this.bgGraphic.fillColor = new cc.Color(0, 0, 0, 0);
    this.bgGraphic.stroke();
    this.bgGraphic.fill();
  }
}
