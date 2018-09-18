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
        againBtn : {
            type : cc.Node,
            default : null
        },
        tipsBtn : { 
            type : cc.Node,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.changeSkin();
    },

    changeSkin(){
        if(common.userInfo.skinInfo){

            let skinNum = common.userInfo.skinInfo.btn || 0 ; //默认0

            switch(skinNum){
                case 0 : 
                    this.againBtn.width = 218;
                    this.againBtn.height = 106;
                    this.tipsBtn.width = 250;
                    this.tipsBtn.height = 106;
                    this.againBtn.positionY = 0;
                    this.tipsBtn.positionY = 0;
                    break;
                case 1 : 
                    this.againBtn.width = 226;
                    this.againBtn.height = 82;
                    this.tipsBtn.width = 240;
                    this.tipsBtn.height = 82;
                    this.againBtn.positionY = 0;
                    this.tipsBtn.positionY = 0;                    
                    break;
                case 2 : 
                    this.againBtn.width = 218;
                    this.againBtn.height = 106;
                    this.tipsBtn.width = 250;
                    this.tipsBtn.height = 106;
                    this.againBtn.positionY = 0;
                    this.tipsBtn.positionY = 0;                    
                    break;
                case 3 : 
                    this.againBtn.width = 208 ;
                    this.againBtn.height = 87;
                    this.tipsBtn.width = 241;
                    this.tipsBtn.height = 87;
                    this.againBtn.positionY = 0;
                    this.tipsBtn.positionY = 0;                    
                    break;
            }

            let self = this;

            cc.loader.loadRes( "skin" + skinNum, cc.SpriteAtlas, function (err, atlas) {
                let againBtnFrame = atlas.getSpriteFrame('skin' + skinNum + '_btn_again');
                let tipsBtnFrame = atlas.getSpriteFrame('skin' + skinNum + '_btn_point');

                self.againBtn.getComponent(cc.Sprite).spriteFrame = againBtnFrame;
                self.tipsBtn.getComponent(cc.Sprite).spriteFrame = tipsBtnFrame;
            });
        }
    },

    start () {

    },

    // update (dt) {},
});
