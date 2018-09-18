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
let common = require('common');  //单例

cc.Class({
    extends: cc.Component,

    properties: {
        registerNode : {
            default : null,
            type : cc.Node
        },
        startBtn : {
            default : null,
            type : cc.Node
        },
        musicNode : {
            default : null,
            type : cc.Node
        },
        musicOnSprite : {
            default : null,
            type : cc.SpriteFrame
        },
        musicOffSprite : {
            default : null,
            type : cc.SpriteFrame
        },
        friendNode : {
            default : null,
            type : cc.Node
        },
        buttonControl : {
            default : null,
            type : cc.Node
        },
        limitedPlayBtn : {
            default : null,
            type : cc.Node
        },
        inviteNode : {
            default : null,
            type : cc.Node
        },
        tipsNode : {
            default : null,
            type : cc.Node
        },
        //随机背景图
        bg1Frame : {
            default : null,
            type : cc.SpriteFrame
        },
        bg2Frame : {
            default : null,
            type : cc.SpriteFrame
        },
        bg3Frame : {
            default : null,
            type : cc.SpriteFrame
        },
        bg4Frame : {
            default : null,
            type : cc.SpriteFrame
        },
        bg5Frame : {
            default : null,
            type : cc.SpriteFrame
        },
        bgSprite : {
            default : null,
            type : cc.Sprite
        },

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //场景值
        common.sceneValue = 0;

        //随机展示一个背景图
        this.randomBgFrame();
        
        //1、拿openId
        util.getOpenId(
            (openid)=>{
                this.openid = openid;

                //存全局，不使用常驻节点
                common.userInfo.openid = openid ;
                
                //2、签到接口
                util.pullRequest('register',{openid},(res)=>{
                    if(res.code == 1){
                        //将值传给签到节点，修改节点渲染属性(钱数与天数)
                        this.registerNode.getComponent('register').registerData = {
                            'is_sign' : res.is_sign , 
                            'list' : res.list,
                            'openid' : openid,
                            'sign' : res.sign
                        };


                        this.registerNode.getComponent('register').indexScript = this;
                        
                        if(!res.is_sign){
                            //还没签
                            //3、签到节点展示
                            this.showRegister();
                        }
                    }
                });

                //3、拿到关卡信息 存全局 
                //拿普通模式
                util.pullRequest('getLevelList',{openid},(res)=>{
                    if(res.code == 1){
                        common.rankInfo.normalRankInfo = res
                    }
                });
                // 拿限时模式
                util.pullRequest('getTimelList',{openid},(res)=>{
                    if(res.code == 1){
                        common.rankInfo.limitedRankInfo = res
                    }
                });

                // 4、拿用户皮肤设置
                if(common.userInfo.skinInfo){
                    //没啥事
                }else{
                    util.pullRequest('getUserSkinInfo',{openid},(res)=>{
                        console.log(res);
                        if(res.code == 1 ){
                            common.userInfo.skinInfo = res.data;
                        }
                    }); 
                }

                // 5、如果有人邀请了自己，加钱
                util.judgeWhoInvitesMe(openid);
             
            }); 

        this.friendNode.getComponent('rankDisplay').indexScript = this;
		this.inviteNode.getComponent('invite').indexScript = this;

        //拿广告信息存全局
        this.getAdvertisement();
        //拿其他小程序信息村全局
        this.getOtherMiniProgramInfo();

        //分享暂时设置
        wx.showShareMenu({});

        wx.onShareAppMessage(
          () => {
            let shareData = util.getShareContent();

            return {
                title : shareData.word,
                imageUrl: shareData.pic,
            }
        })

        // 游戏圈出现    
        if(common.button){
            common.button.show()
        }else{
            wx.getSystemInfo({
                success : (res)=>{
                    let version = res.SDKVersion;
                    let versionNum = version.replace(/\./g, "");
                    if(parseInt(versionNum) >= 203){
                        common.button = wx.createGameClubButton({
                            icon: 'light',
                            style: {
                                left: res.screenWidth - 40,
                                top: 350,
                                width: 40,
                                height: 40
                            }
                        });
                    }
                }
            })            
        }

        //预加载关卡列表场景
        cc.director.preloadScene("Rank", function () {
            console.log("Rank scene preloaded");
        });
    },

    //跳转到其他小程序
    navigateToOtherMiniProgram(){
        let defaultObject = {
            "appId": "wx16b0f4e75c0020e1",
            "path": "?tzid=linkGame",
            "extraData" : {
              "tzid" : 'linkGame'
            }
        }

        let navigateInfo = common.OtherMiniProgramInfo || defaultObject ;

        wx.navigateToMiniProgram({
            appId : navigateInfo.appId ,
            path : navigateInfo.path,
            extraData : navigateInfo.extraData
        })
    },

    getOtherMiniProgramInfo(callback){
        util.pullRequest('getOtherMiniProgramInfo',null,(res)=>{
            if(res.code == 1){
                common.OtherMiniProgramInfo = res.data;
            }
        }); 
    },

    //随机切换背景
    randomBgFrame(){
        let num = Math.floor(Math.random()*5)+ 1 ;

        this.bgSprite.spriteFrame = this['bg' + num + 'Frame'];
    },

    //展示排行榜 
    showFriendRank(){
        this.friendNode.active = true;
    },

    closeFriendRank(){
        this.friendNode.active = false;
    },

    showRegister(){
        this.registerNode.active = true;

        this.registerNode.getChildByName('register_bk').runAction(util.zoomInAction()); 
    },

    start () {
        //这里只控制界面元素，不控制音频，音频去常驻节点里弄
        if(common.musicOn){
            this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicOnSprite;
        }else{
            this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicOffSprite;
        }
    },

    startGame(event,gameType){ //gameType = 1 普通模式  2 限时模式 按钮触发时带的事件
        common.gameInfo.gameType = gameType ;

        cc.director.loadScene("Rank");
    },

    update (dt) {

    },

    modiMusicControl(){
        common.musicOn = !common.musicOn ;

        if(common.musicOn){
            this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicOnSprite;
        }else{
            this.musicNode.getComponent(cc.Sprite).spriteFrame = this.musicOffSprite;
        }

        var persistNodeScript = cc.director.getScene().getChildByName('MusicNode').getComponent('musicNode');

        persistNodeScript.modiMusic();
    },

    stopButtons(){
        this.startBtn.getComponent(cc.Button).interactable = false;
        this.buttonControl.children.forEach((item)=>{
            item.getComponent(cc.Button).interactable = false;
        });
        this.limitedPlayBtn.getComponent(cc.Button).interactable = false;
    },

    activeButtons(){
        this.startBtn.getComponent(cc.Button).interactable = true;
        this.buttonControl.children.forEach((item)=>{
            item.getComponent(cc.Button).interactable = true;
        });
        this.limitedPlayBtn.getComponent(cc.Button).interactable = true;
    },

    getAdvertisement(callback){
        if(common.Advertisement && common.Advertisement.length != 0 ){
            return common.Advertisement;
        }else{
            util.pullRequest('getOtherXcxInfo',null,(res)=>{
                if(res.code == 1){
                    common.Advertisement = res.data.image;
                    return res.data.image;
                }
            }); 
        }
    },

    showAdvertisement(){
        let imgArray = this.getAdvertisement();//可能异步，但是暂不处理
        common.AdvertisementTimes += 1 ;
        let current = common.AdvertisementTimes % imgArray.length;

        wx.previewImage({
            current : imgArray[current],
            urls : imgArray
        })
    },

    // 邀请
    showInvite(){
        this.inviteNode.active = true;

        this.inviteNode.getChildByName('invite_bk').runAction(util.zoomInAction()); 
    },

    showTips(){
        this.tipsNode.active = true;

        this.tipsNode.getChildByName('content').runAction(util.zoomInAction()); 
    },

    closeTips(){
       this.tipsNode.getChildByName('content').runAction(util.zoomOutAction( ()=>{
            this.tipsNode.active = false;
        }));
    }
});
