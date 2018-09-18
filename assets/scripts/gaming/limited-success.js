// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        gameScript : Object,
        rankInfoLabel : {
            type : cc.Label,
            default : null
        },
        timeshowLabel : {
            type : cc.Label,
            default : null
        },
        resultData : {
            type : Object,
            set : function(value){
                this.rankInfoLabel.string = value.now_lv_name + '  ' + '第' + value.now_num + '关' ;
                this.timeshowLabel.string = value.limitCostTime;
            }
        },
        biaoqingControl1 : {
            type : cc.Node,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onEnable(){
        this.gameScript.stopButtons();

        //随机产生表情包
        this.biaoqingControl1.getComponent('biaoqingControl').randomBiaoqing();
    },

    onDisable(){
        this.gameScript.activeButtons();
    }
});
