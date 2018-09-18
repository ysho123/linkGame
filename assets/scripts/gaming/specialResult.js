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
        identityLabel :{
            default : null,
            type : cc.Label
        },
        rankLabel : {
            default : null,
            type : cc.Label
        },
        leastNumLabel : {
            default : null,
            type : cc.Label
        },
        gameScript : Object,
        resultData : {
            type : Object,
            set : function(value){
                this.identityLabel.string = value.now_lv_name;
                this.rankLabel.string = '第' + value.now_num + '关';
                this.leastNumLabel.string = value.least_num + '次';
            }
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onEnable(){
        this.gameScript.stopButtons();
    },

    onDisable(){
        this.gameScript.activeButtons();
    }
});
