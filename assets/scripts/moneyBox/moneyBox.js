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
        btn1SpriteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        btn2SpriteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        btn3SpriteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        money1SpriteFrame :{
            default : null,
            type : cc.SpriteFrame
        },
        money2SpriteFrame :{
            default : null,
            type : cc.SpriteFrame
        },
        money3SpriteFrame :{
            default : null,
            type : cc.SpriteFrame
        },
        btn  : {
            default : null,
            type : cc.Sprite
        },
        money  : {    
            default : null,
            type : cc.Sprite
        },
        coinLabel : {
            default : null,
            type : cc.Label
        },
        topLabel : {
            default : null,
            type : cc.Label
        },
        middleLabel : {
            default : null,
            type : cc.Label
        },
        isChoujiang : Boolean,//是否从结果页点击进来的
        gameScript : Object
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
         let sysData = common.userInfo.sysData;

         if(!sysData){
            sysData = wx.getSystemInfoSync() ;
            common.userInfo.sysData = sysData;
            // sysData
         }

         let version = sysData.SDKVersion;
         this.version = version.replace(/\./g, "");
         this.sysData = sysData ;

        this.boxContent = 1 ; //1 直接领金币  2分享领金币  3看视频领金币
        this.openid = common.userInfo.openid;
    },

    start () {

    },

    onEnable(){
        let num = 0;

        if(parseInt(this.version) >= 210){
            //版本符合 可以放视频
            num = parseInt(Math.random()*4); 
        }else{
            num = parseInt(Math.random()*3); 
        }

        if(this.isChoujiang){
            if(num == 3 || num == 2){
                //4分之2的看视频 +150
                this.boxContent = 3 ;
                this.btn.spriteFrame = this.btn3SpriteFrame;
                this.money.spriteFrame = this.money3SpriteFrame;
                this.topLabel.string = '观看视频获得金币';
                this.middleLabel.string = '+150';
            }else if(num == 0 ){
                //4分之1的直接领 +20
                this.boxContent = 1 ;
                this.btn.spriteFrame = this.btn1SpriteFrame;
                this.money.spriteFrame = this.money1SpriteFrame;
                this.topLabel.string = '恭喜获得金币';
                this.middleLabel.string = '+20';
            }else{
                //4分之1的分享领 +50
                this.boxContent = 2 ;
                this.btn.spriteFrame = this.btn2SpriteFrame;
                this.money.spriteFrame = this.money2SpriteFrame;
                this.topLabel.string = '分享获得金币';
                this.middleLabel.string = '+50';
            }
        }else{
            if(num == 3){//num == 3
                //4分之1的看视频 +150
                this.boxContent = 3 ;
                this.btn.spriteFrame = this.btn3SpriteFrame;
                this.money.spriteFrame = this.money3SpriteFrame;
                this.topLabel.string = '观看视频获得金币';
                this.middleLabel.string = '+150';
            }else if(num == 0 || num == 1){
                //4分之2的直接领 +20
                this.boxContent = 1 ;
                this.btn.spriteFrame = this.btn1SpriteFrame;
                this.money.spriteFrame = this.money1SpriteFrame;
                this.topLabel.string = '恭喜获得金币';
                this.middleLabel.string = '+20';
            }else{
                //4分之1的分享领 +50
                this.boxContent = 2 ;
                this.btn.spriteFrame = this.btn2SpriteFrame;
                this.money.spriteFrame = this.money2SpriteFrame;
                this.topLabel.string = '分享获得金币';
                this.middleLabel.string = '+50';
            }
        }
    
        this.gameScript.stopButtons();
    },

    onDisable(){
        this.isChoujiang = false;
        this.gameScript.activeButtons();
    },

    confirm(){
        switch(this.boxContent){
            case 3 :
                this.showVideo();
                break;
            case 2 : 
                this.shareAccept();
                break;
            case 1 :
                this.accept();
                break;
        }
    },

    accept(){
        util.pullRequest('addCoinByNum',{openid : this.openid , addNum : 20},(res)=>{
            if(res.code == 1){
               this.coinLabel.string = res.data.score; 
               util.recordShareNum('boxAccept',this.openid);
            }
        },()=>{},()=>{
            this.closePop();
        })
    },

    shareAccept(){
        let shareData = util.getShareContent();

        wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic
        });

        util.pullRequest('addCoinByNum',{openid : this.openid , addNum : 50},(res)=>{
            if(res.code == 1){
                this.coinLabel.string = res.data.score; 
                util.recordShareNum('boxShare',this.openid);
            }
        },()=>{},()=>{
            this.closePop();
        })
    },

    showVideo(){
        let self = this;
        //游戏结束地方跳转过来的看视频1
        util.showVedioAd1(this.openid,150,()=>{
            self.closePop();
        },(res)=>{
            if(self.coinLabel){
                self.coinLabel.string = res.data.score; 
            }
            util.recordShareNum(this.isChoujiang ? 'boxVedio_result' : 'boxVedio_flyBox' , self.openid);
        });
    },

    closePop(){
        this.node.getChildByName('content').runAction(util.zoomOutAction(()=>{
                this.node.active = false;
            }
        ));
    },

    // update (dt) {},
});
