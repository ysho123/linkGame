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
        playerControl :{
            default : null,
            type : cc.Node
        },
        inviteBtn: {
            default : null,
            type: cc.Node
        },
        countNum : {
            default : null,
            type: cc.Label
        },
        hasInviteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        noInviteFrame : {
            default : null,
            type : cc.SpriteFrame
        },
        hasInviteFrame1 : {
            default : null,
            type : cc.SpriteFrame
        },
        noInviteFrame1 : {
            default : null,
            type : cc.SpriteFrame
        },

        indexScript: Object
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.openid =  common.userInfo.openid;

    },

    start () {

    },

    // 关闭邀请
    closeInvite(){
        this.node.getChildByName('invite_bk').runAction(util.zoomOutAction(()=>{
                this.node.active = false;
        }));
    },

    // 添加用户邀请记录接口
    addInvite (){
        let shareData = util.getShareContent();

        wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic,
            query : 'invite_openid=' + this.openid
        });

        util.recordShareNum('invite6People',this.openid);
    },

    // 用户获取邀请记录接口
    getInvite (openid){
        util.pullRequest('getInviteRecord',{openid},(res)=>{
            if(res.code == 1){
                let results = res.data;
                if(results){
                    this.countNum.string = results.num || 0;

                    let playerNodeArr = this.playerControl.children;

                    playerNodeArr.forEach((item,key)=>{
                        if( key < results.num ){
                            item.getChildByName('invie_ex').getComponent('cc.Sprite').spriteFrame = this.hasInviteFrame;
                            item.getChildByName('invite_no').getComponent('cc.Sprite').spriteFrame = this.hasInviteFrame1;
                        }else{
                            item.getChildByName('invie_ex').getComponent('cc.Sprite').spriteFrame = this.noInviteFrame;
                            item.getChildByName('invite_no').getComponent('cc.Sprite').spriteFrame = this.noInviteFrame1;
                        }
                    });

                    if( results.num >= 6 ){
                        this.inviteBtn.interactable = false;
                    }else{
                        this.inviteBtn.interactable = true;
                    }
                }
                
            }
        })
    },

    onEnable(){
        this.getInvite(this.openid);

        this.indexScript.stopButtons();
    },

    onDisable(){
        this.indexScript.activeButtons();
    }

    // update (dt) {},
});
