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
        banner1 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner2 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner3 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner4 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner5 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner6 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner7 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner8 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner9 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner10 : {
            default : null,
            type : cc.SpriteFrame
        },
        banner11 : {
            default : null,
            type : cc.SpriteFrame
        },
        medel_win :{
            default : null,
            type : cc.SpriteFrame
        },
        item_date :{
            type : Object,
            set : function (value) {
                let spriteFrameNum = parseInt(value.lv) % 11 + 1;
                this.node.getComponent(cc.Sprite).spriteFrame = this['banner' + spriteFrameNum];
                this.node.getChildByName('classLabel').getComponent(cc.Label).string = value.name;
                this.node.getChildByName('progressLabel').getComponent(cc.Label).string = '当前第' + value.pass_num + '关/' + value.num + '关';

                if(value.lock){
                    this.node.getChildByName('progressLabel').active = false;
                    this.node.getChildByName('coverNode').getChildByName('cover_tip').getComponent(cc.Label).string = value.lv_desc;
                    this.node.getChildByName('coverNode').active = true;
                }

                if(value.pass_num >= value.num){
                    this.node.getChildByName('medals').getComponent(cc.Sprite).spriteFrame = this.medel_win;
                }
                
                this.curRoomInfo = value;
            }
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    enterGame(){
        if(this.curRoomInfo.lock){
            return;
        }

        common.gameInfo.lv = this.curRoomInfo.lv;
        common.gameInfo.num = this.curRoomInfo.go_num;

        cc.director.loadScene("Game");
    },

    // update (dt) {},
});
