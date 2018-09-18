// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let util = require('util');
let common = require('common');

cc.Class({
    extends: cc.Component,

    properties: {
	    atlas : {
            type : cc.SpriteAtlas,
            default : null
        },
        biaoSprite1 : {
        	type : cc.Sprite,
        	default : null
        },
        biaoSprite2 : {
        	type : cc.Sprite,
        	default : null
        },
        biaoSprite3 : {
        	type : cc.Sprite,
        	default : null
        },
        moneyBagSprite : {
            type : cc.SpriteFrame,
            default : null
        },
        moneyBoxPopNode : {
            type : cc.Node,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {
    	
    // },

    randomBiaoqing(){
        this.point = Math.floor(Math.random()*5) + 1; //初始化抽表情包时的指针数字(1-6)=>5分之3几率出箱子

        this.biaoSprite1.spriteFrame = this.atlas.getSpriteFrame(Math.floor(Math.random()*30) + 1);
        this.biaoSprite2.spriteFrame = this.atlas.getSpriteFrame(Math.floor(Math.random()*30) + 1);
        this.biaoSprite3.spriteFrame = this.atlas.getSpriteFrame(Math.floor(Math.random()*30) + 1);

        if( this.point <= 3 ){
            this['biaoSprite'+ this.point].spriteFrame = this.moneyBagSprite;
        }

    	this.NotAccept = true;//初始化能够领取金币
    },

    choujiang(event,data){
    	if(this.NotAccept){
	    	if(data == this.point){
                this.moneyBoxPopNode.getComponent('moneyBox').isChoujiang = true ;

                this.moneyBoxPopNode.active = true; 

                this.moneyBoxPopNode.getChildByName('content').runAction(util.zoomInAction());

                this.NotAccept = false;//未领过 置false
	    	}
    	}
    },

    start () {

    },

    // update (dt) {},
});
