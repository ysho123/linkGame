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
        gameScript : Object,
        clockAnimation : {
            type : cc.Animation,
            default : null
        },
        timeLabel : {
            type : cc.Label,
            default : null
        },
        timeData : {
            type : Number,
            set : function(data){
                this.gameTime = data;
                this.timeLabel.string = data || 0 ;
            }
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
    },

    start () {

    },

    timeStart(){
        this.time = this.gameTime; //值传递  用来计算每一次重试的倒计时时间 很重要

        //开始播放时钟动画
        this.clockAnimation.play();

        //直接减一秒
        this.timeLabel.string = this.time --;

        this.callback = function(){
             if( this.time <= 0 ){
                //时间到
                //停止时钟动画
                this.clockAnimation.stop();
                //停止计时的标记
                common.gameInfo.timeCoutStart = false;

                this.gameScript.showTimeOutPage();
                //取消定时器        
                this.unschedule(this.callback);
             }
             this.timeLabel.string = this.time --;
        }

        //注册定时器
        this.schedule(this.callback, 1);
    },

    timeOutReplay(){
        //重置界面的计时器数值
        this.gameScript.resetLimitGame();
        this.timeLabel.string = this.gameTime || 0 ;
    },

    back(){
        cc.director.loadScene("Index");
    },

    //提交答案后正确  停止计时  
    stopTimeClock(){
        this.clockAnimation.stop();
        //停止计时的标记
        common.gameInfo.timeCoutStart = false;
        //取消定时器        
        this.unschedule(this.callback);
    }

    // update (dt) {},
});
