// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let common  = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
        indexScript : Object,

       displaySprite : cc.Sprite
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {
        this.tex = new cc.Texture2D();
    },

    update (dt) {
        this._updateSubDomainCanvas();
    },

    _updateSubDomainCanvas () {
        if (!this.tex) {
            return;
        }
        this.tex.initWithElement(sharedCanvas);
        this.tex.handleLoadedTexture();
        this.displaySprite.spriteFrame = new cc.SpriteFrame(this.tex);
    },

    onDisable(){
        this.indexScript.activeButtons();

        if(common.button){
           common.button.show(); 
        }
    },

    onEnable(){
        this.indexScript.stopButtons();

        if(common.button){
           common.button.hide(); 
        }
    }
});
