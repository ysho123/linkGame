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

cc.Class({
    extends: cc.Component,

    properties: {
        mainSpriteNode : {
            default : null,
            type : cc.Node 
        },
        normalSpriteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        leastStepSpriteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        identityLabel : {
            default : null,
            type : cc.Label
        },
        rankLabel :{
            default : null,
            type : cc.Label   
        },
        stepsLabel : {
            default : null,
            type : cc.Label 
        },
        seclabel : {
            default : null,
            type : cc.Label 
        },
        percentLabel :{
            default : null,
            type : cc.Label 
        },
        progressNode : {
            default : null,
            type : cc.Node            
        },
        progressLabel : {
            default : null,
            type : cc.Label 
        },
        gameScript : Object,
        resultData : {
            type : Object,
            set : function(value){
                this.now_lv = value.now_lv;
                this.now_num = value.now_num;

                if(value.is_least){
                    this.mainSpriteNode.getComponent(cc.Sprite).spriteFrame = this.leastStepSpriteFrame;
                }else{
                    this.mainSpriteNode.getComponent(cc.Sprite).spriteFrame = this.normalSpriteFrame;
                }
                this.identityLabel.string = value.now_lv_name ;
                this.rankLabel.string = '第' + value.now_num + '关';
                this.stepsLabel.string = value.step ; 
                this.seclabel.string = value.sec ;
                this.percentLabel.string = value.desc + '%';
                let step = value.least_num % 5 ;
                this.progressLabel.string = step + '/5';
                this.progressNode.getComponent(cc.ProgressBar).progress = step/5 ;
            }
        },
        biaoqingControl : {
            type : cc.Node,
            default : null
        },
        skinPopNode : {
            type : cc.Node,
            default : null   
        },
        nextbtn : {
            type : cc.Button,
            default : null   
        },
        backbtn : {
            type : cc.Button,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},

    onEnable(){
        //第一次玩游戏的提示
        if( this.now_lv == 1 && this.now_num == 1 ){
            this.skinPopNode.active = true;

            this.skinPopNode.getChildByName('content').runAction(util.zoomInAction(
                ()=>{
                    this.nextbtn.interactable = false;
                    this.backbtn.interactable = false;
                }
            ));
        }

        //防止游戏界面击穿
        this.gameScript.stopButtons();

        //随机产生表情包
        this.biaoqingControl.getComponent('biaoqingControl').randomBiaoqing();        
    },

    closeTipsPop(){
        this.skinPopNode.getChildByName('content').runAction(util.zoomOutAction(()=>{
                this.nextbtn.interactable = true;
                this.backbtn.interactable = true;
                this.skinPopNode.active = false;
            }
        ));
    },

    onDisable(){
        this.gameScript.activeButtons();
    }
});
