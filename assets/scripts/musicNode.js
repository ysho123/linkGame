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
let util = require('util');

cc.Class({
    extends: cc.Component,

    properties: {
        audio: {
            url: cc.AudioClip,
            default: null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.game.addPersistRootNode(this.node);

        if(common.musicOn){
            util.pullRequest('getMusic',{},(res)=>{
                if(res.code == 1){
                    this.src = res.link; 
                }
            },null,()=>{
                //在请求完成里做
                this.src = this.src || 'https://xcx-base.oss-cn-hangzhou.aliyuncs.com/line_game_20180809/backgroundMusic1.mp3'

                this.InnerAudioContext = wx.createInnerAudioContext();
                this.InnerAudioContext.src = this.src;
                this.InnerAudioContext.loop = true;
                
                this.InnerAudioContext.onCanplay((res)=>{
                    this.InnerAudioContext.play()
                });
            });
            // //第一次进游戏 musicOn = true
            // this.bgAudioId = cc.audioEngine.play(this.audio, true,1);
        }else{
            // cc.audioEngine.pause(this.bgAudioId);
            this.InnerAudioContext.stop();
        }
    },

    start () {

    },

    modiMusic(){
        if(common.musicOn){
            // this.bgAudioId = cc.audioEngine.play(this.audio, true,1);
            this.InnerAudioContext.play()
        }else{
            // cc.audioEngine.pause(this.bgAudioId);
            this.InnerAudioContext.pause();
        }
    },
    // update (dt) {},
});
