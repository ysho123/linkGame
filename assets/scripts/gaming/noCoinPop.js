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
        coinLabel : {
            default : null,
            type : cc.Label
        },
        gameScript : Object
    },

    closePop(){
        this.node.getChildByName('container').runAction(util.zoomOutAction( ()=>{
            this.node.active = false;
        }));
    },

    share(){
        let shareData = util.getShareContent();

        wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic
        });

        util.pullRequest('addCoinByNum',{openid : this.openid , addNum : 20},(res)=>{
            if(res.code == 1){
               this.coinLabel.string = res.data.score; 
               util.recordShareNum('boxAccept',this.openid);
            }
        },()=>{},()=>{
            this.closePop();
        });

    },

    showVedio(){
        let self = this;

        util.showVedioAd1(this.openid,150,()=>{
            self.closePop();
        },(res)=>{
            if(self.coinLabel){
                self.coinLabel.string = res.data.score; 
            }
            util.recordShareNum('boxVedio_hint',self.openid);
        });
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.openid = common.userInfo.openid;
    },

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
