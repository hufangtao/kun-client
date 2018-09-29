const {ccclass, property} = cc._decorator;

@ccclass
export default class choujiang extends cc.Component {

    private id: number = 0;

    public onChouJiang(id) {
        this.id = id;
    }

    public onReSet() {
        this.node.rotation = 0;
    }

    public update(dt) {

    }
}
