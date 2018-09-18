// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let common = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
        bg : {
            type : cc.Sprite,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.changeSkin();//换皮肤
    },

    changeSkin(){
        if(common.userInfo.skinInfo){

            let skinNum = common.userInfo.skinInfo.bg || 0 ; //默认0
            let self = this;

            cc.loader.loadRes( "skin" + skinNum + '_bg' ,cc.SpriteFrame, function (err, spriteFrame ) {
                self.bg.spriteFrame  = spriteFrame ;
            });
        }
    },

    start () {

    },

    // update (dt) {},
});
