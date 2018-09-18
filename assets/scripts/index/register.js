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
        day1 : {
            default : null,
            type : cc.Node
        },
        day2 : {
            default : null,
            type : cc.Node
        },
        day3 : {
            default : null,
            type : cc.Node
        },
        day4 : {
            default : null,
            type : cc.Node
        },
        day5 : {
            default : null,
            type : cc.Node
        },
        day6 : {
            default : null,
            type : cc.Node
        },
        day7 : {
            default : null,
            type : cc.Node
        },
        registerData :{
            default : null,
            type : Object
        },
        registerBtn : {
            default : null,
            type : cc.Node
        },
        hasAcceptSp : {
            default : null,
            type : cc.SpriteFrame
        },
        acceptSp : {
            default : null,
            type : cc.SpriteFrame
        },
        indexScript : Object,

    },

    onLoad () {

    },

    start () {

    },

    //签到
    sign_up(){
        let that = this;
        if(this.registerData.is_sign){
            //已经签过了，关闭签到
            this.node.getChildByName('register_bk').runAction(util.zoomOutAction(()=>{
                this.node.active = false;
            }));
        }else{
            util.pullRequest('addSign',{'openid' : this.registerData.openid , 'sign' : this.registerData.sign},(res)=>{
                if(res.code == 1){
                    wx.showToast({
                        title : '签到成功',
                        icon : 'success',
                        duration : 1500,
                        success : ()=>{
                            this['day' + this.registerData.sign].getChildByName('register_draw').active = true ;
                            this.registerData.is_sign = true;
                            this.registerData.sign = (this.registerData.sign + 1) % 7 ;

                            this.node.getChildByName('register_bk').runAction(util.zoomOutAction( ()=>{
                                this.node.active = false;
                            }));
                        }
                    });
                }
            });
        }
    },

    //生命周期函数 ： 当组件的active从false ->true的时候触发
    onEnable(){
        if(this.registerData.is_sign){
            this.registerBtn.getComponent(cc.Sprite).spriteFrame = this.hasAcceptSp ;
        }

        this.registerData['list'].forEach((item)=>{
            let dayLabel = this['day' +  item.day].getChildByName('dayLabel').getComponent(cc.Label);
            let coinLabel = this['day' +  item.day].getChildByName('coinLabel').getComponent(cc.Label);
            if(dayLabel && coinLabel){
                dayLabel.string = '第' +  item.day + '天';
                coinLabel.string = '+' + item.coin;
            }

            //Sign 将要去签到日期 展示逻辑 ： 第一天没签 sign = 1 ，第一天签了 sign = 2  ...  第七天 没签 sign =7 ,签了 sign = 1
            if(this.registerData.is_sign){
                if( this.registerData.sign == 1 ){
                    //已经签了7天了
                    let shadowNode = this['day' +  item.day].getChildByName('register_draw');
                    shadowNode.active = true ;
                    return;
                }
                if(item.day < this.registerData.sign){
                    //这里sign不可能等于7
                    let shadowNode = this['day' +  item.day].getChildByName('register_draw');
                    shadowNode.active = true ;         
                }
            }else{
                if(item.day < this.registerData.sign){
                    let shadowNode = this['day' +  item.day].getChildByName('register_draw');
                    shadowNode.active = true ;         
                }
            }
        });

        this.indexScript.stopButtons();
    },

    onDisable(){
        this.indexScript.activeButtons();
    }

    // update (dt) {},
});
