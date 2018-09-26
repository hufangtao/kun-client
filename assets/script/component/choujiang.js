
cc.Class({
    extends: cc.Component,

    properties: {
        id:0,
    },

    onChouJiang(id){
        this.id = id;
    },
    onReSet(){
        this.node.rotation = 0;
    },

     update (dt) {},
});
