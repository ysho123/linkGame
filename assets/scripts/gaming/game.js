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
        NormalResultPage :{
            default : null,
            type : cc.Node
        },
        SpecialResultPage : {
            default : null,
            type : cc.Node
        },
        rankNumLabel : {
            default : null,
            type : cc.Label
        },
        stepNumLabel : {
            default : null,
            type : cc.Label
        },
        coinNumLabel : {
            default : null,
            type : cc.Label
        },
        backButton : {
            default : null,
            type : cc.Node
        },
        resetButton : {
            default : null,
            type : cc.Node 
        },
        hintButton : {
            default : null,
            type : cc.Node 
        },
        //格子控制器
        gridControl : {
            default : null,
            type : cc.Node
        },
        noCoinPop : {
            default : null,
            type : cc.Node
        },
        tipsNode : {
            default : null,
            type : cc.Node
        },
        clockNode : {
        	default : null,
            type : cc.Node
        },
        timeOutPage : {
            default : null,
            type : cc.Node
        },
        timeSuccessPage : {
            default : null,
            type : cc.Node
        },
        skinButton : {
            default : null,
            type : cc.Node
        },
        skinShopNode :{
            default : null,
            type : cc.Node
        },
        moneyBoxAnimation :{
            default : null,
            type : cc.Animation
        },
        moneyBoxPopNode : {
            default : null,
            type : cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        //场景值
        common.sceneValue = 2;

        this.levelData = null; //初始化当前关卡信息

        this.gridScript = this.gridControl.getComponent('gridControl');
        this.timeScript = this.clockNode.getComponent('timeclock');
        //把自己传过去让那边控制
        this.gridScript.game = this;

        this.NormalResultPage.getComponent('normalResult').gameScript = this;
        this.SpecialResultPage.getComponent('specialResult').gameScript = this;
        this.noCoinPop.getComponent('noCoinPop').gameScript = this;
        this.tipsNode.getComponent('smallTips').gameScript = this;
        this.timeScript.gameScript = this;
        this.timeOutPage.getComponent('limited-timeout').gameScript = this;
        this.timeSuccessPage.getComponent('limited-success').gameScript = this;
        this.skinShopNode.getComponent('skinshop').gameScript = this;
        this.moneyBoxPopNode.getComponent('moneyBox').gameScript = this;


        //开始游戏
        if(common.userInfo.skinInfo){
             let skinNum = common.userInfo.skinInfo.item || 0 ; //默认0
             
             //加载皮肤信息
             let self = this;
             cc.loader.loadRes( "skin" + skinNum, cc.SpriteAtlas, function (err, atlas) {
                let tubeFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                let gzFrame = atlas.getSpriteFrame('skin' + skinNum + '_gz');
                let circleFrames = new Map();
                for(let i=1;i<=10;i++){
                    circleFrames.set(i.toString(),atlas.getSpriteFrame('skin' + skinNum + '_item_' + i));
                }
                self.startGame({
                    tubeFrame,
                    gzFrame,
                    circleFrames
                })
            });
        }else{
            this.startGame();
        }

        //预加载首页场景
        cc.director.preloadScene("Index", function () {
            console.log("Index scene preloaded");
        });

        util.judgetWhereFrom(common.userInfo.openid);//判断是不是跳转来的，从哪个小程序跳转来的
    },

    // start () {},

    // update (dt) {},

    startGame(skinSource){
        //请求题目信息
        this.openid = common.userInfo.openid;
        this.lv = common.gameInfo.lv;
        this.num = common.gameInfo.num;

        let requestData = {
            openid : this.openid,
            lv : this.lv,
            num : this.num
        }

        this.getGameItemsRequest(requestData,skinSource);

    },

    getGameItemsRequest(requestData,skinSource){
        let url = '';
        if( common.gameInfo.gameType == 1 ){
            url = 'getGameItems';
        }else if( common.gameInfo.gameType == 2 ){
            url = 'getGameTimeItems';
        }

        util.pullRequest(url,requestData,(res)=>{
            if(res.code == 1){
                //修改当前关卡、步数、金币
                this.coinNumLabel.string = res.score;
                this.rankNumLabel.string = '第' + this.num + '关';
                this.stepNumLabel.string = 0 ; //重置步数

                if(common.gameInfo.gameType == 2){
                    this.clockNode.active = true;
                    this.timeScript.timeData = res.data.time;
                }

				//所有参数传过去，只是在这边请求
                this.gridScript.startGame(res,skinSource);

                this.showMoneyBox();
            }
        },(err)=>{
            console.log('获得题目请求失败，重新请求',err);
            if(common.sceneValue == 2){
                this.getGameItemsRequest(requestData,skinSource);
            }
        });
    },

    //限时模式下，开始倒计时
    timeStart(){    
        this.timeScript.timeStart();
    },

    //限时模式   时间到弹窗
    showTimeOutPage(){
        this.gridScript.cancelListener();

        this.timeOutPage.active = true;

        this.timeOutPage.getChildByName('container').runAction(util.zoomInAction()); 
    },

    //限时模式 过关弹窗
    showTimeSuccessPage(data){
        this.timeSuccessPage.getComponent('limited-success').resultData = data;

        this.timeSuccessPage.active = true;

        this.timeSuccessPage.getChildByName('container').runAction(util.zoomInAction()); 
    },

    //格子不满的提示
    showTips(){
        this.tipsNode.active = true;

        this.tipsNode.getChildByName('tips').runAction(util.zoomInAction()); 
    },

    closeTips(){
        this.tipsNode.getChildByName('tips').runAction(util.zoomOutAction( ()=>{
            this.tipsNode.active = false;
        }));
    },

    //重启限时游戏模式
    resetLimitGame(){
        this.timeOutPage.getChildByName('container').runAction(util.zoomOutAction( ()=>{
            this.gridScript.registListener();

            this.timeOutPage.active = false;
            this.resetGame();
        }));
    },

    //重启正常模式
    resetGame(){
        this.gridScript.resetGame();
    },

    //提交答案
    submitAnswer( data , callback ){
        let url = '';
        if(common.gameInfo.gameType == 2){
            url = 'completeTimeLevel';
            //停止计时
            this.timeScript.stopTimeClock();
        }else if(common.gameInfo.gameType == 1){
            url = 'completeLevel'
        }
        
        util.pullRequest(url,data,(res)=>{
            if(res.code == 1){
                this.levelData = res.data; 
                //普通模式提交答案
                if(common.gameInfo.gameType == 1){
                    wx.setUserCloudStorage({
                        KVDataList : [ {key: 'score', value: res.data.pass_num.toString()}]
                    });

                    if(this.levelData.least_num && this.levelData.is_least && this.levelData.least_num % 5 == 0 ){
                        this.showSpecialResult(this.levelData);
                    }else{
                        this.showNormalResult(this.levelData);
                    }
                }
                //限时模式提交答案
                else if(common.gameInfo.gameType == 2){
                    this.levelData.limitCostTime = this.timeScript.gameTime - this.timeScript.time - 1;
                    this.showTimeSuccessPage(this.levelData);
                }

                callback && callback();
            }
        },(err)=>{
            console.log('提交答案请求失败重新请求',err);
            if(common.sceneValue == 2){
                this.submitAnswer(data , callback);
            }else{
                wx.hideLoading();
            }
        });
    },  

    //展示普通过关
    showNormalResult(data){
        common.bannerAd.hide();
        this.NormalResultPage.getComponent('normalResult').resultData = data;

        this.NormalResultPage.active = true;

        this.NormalResultPage.getChildByName('container').runAction(util.zoomInAction());
        
    },

    //满五次的过关
    showSpecialResult(data){
        common.bannerAd.hide();
        this.SpecialResultPage.getComponent('specialResult').resultData = data;

        this.SpecialResultPage.active = true;

        this.SpecialResultPage.getChildByName('container').runAction(util.zoomInAction()); 
        
    },

    //下一关按钮
    nextRank(event,gametype){
        if(this.levelData && this.levelData.lv_finish){
            //如果本级别所有都完成

            //拿到关卡信息 存全局 (需求改了，游戏界面直接跳首页，首页也会走一个这个接口)
            util.pullRequest('getLevelList',{openid : this.openid},(res)=>{
                if(res.code == 1){
                    common.rankInfo = res;
                    cc.director.loadScene("Rank"); 
                }
            });
        }else{
            common.bannerAd.show();
            //修改全局中的关卡数，作为下一关参数
            common.gameInfo.lv = this.levelData.next_lv;
            common.gameInfo.num = this.levelData.next_num;

            //普通模式
            if(common.gameInfo.gameType == 1){
                //无差别关闭
                this.NormalResultPage.getChildByName('container').runAction(util.zoomOutAction( ()=>{
                    this.NormalResultPage.active = false;
                }));
                this.SpecialResultPage.getChildByName('container').runAction(util.zoomOutAction( ()=>{
                    this.SpecialResultPage.active = false;
                }));
            }
            //限时模式
            else if(common.gameInfo.gameType == 2){
                this.timeSuccessPage.getChildByName('container').runAction(util.zoomOutAction( ()=>{
                    this.timeSuccessPage.active = false;
                    this.timeOutPage.active = false;
                }));
            }

            this.startGame();
        }
    },

    //飞过去的钱箱子
    showMoneyBox(){
        let animState = this.moneyBoxAnimation.getAnimationState('moneyBox');

        if(animState.isPlaying){ //如果正在播放
            return ;
        }

        let num = parseInt(Math.random()*2);
        let modeNum = parseInt(Math.random()*7);

        if(num == 1){ //随机生成，2分之一的几率出现
            animState.wrapMode = (modeNum % 2 == 0) ? cc.WrapMode.Normal : cc.WrapMode.Reverse; 
            this.moneyBoxAnimation.play();
        }
    },

    moneyBoxClick(event){        
        this.moneyBoxPopNode.active = true ; 

        this.moneyBoxPopNode.getChildByName('content').runAction(util.zoomInAction());
    },

    //提示
    getHint(){
        util.pullRequest('userGetTips',{'openid' : this.openid},(res)=>{
            if(res.code == 1){
                this.coinNumLabel.string = res.score;
                this.gridScript.hintAnswer();
            }else if(res.code == -1){
                //钱不够，去分享
                this.noCoinPop.active = true;
                this.noCoinPop.getChildByName('container').runAction(util.zoomInAction()); 
            }
        });
    },

    share(){
        let shareData = util.getShareContent();

         wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic
        });

        util.recordShareNum('challengeFriendShare',this.openid);
    },

    showoffShare(){
        let shareData = util.getShareContent();

        wx.shareAppMessage({
            title : shareData.word,
            imageUrl : shareData.pic
        });

        util.pullRequest('userSendShare',{openid : this.openid , best : 1},(res)=>{
            wx.showToast({
                title : res.msg,
                icon : res.code==1 ? 'success' : 'loading',
                duration : 1000,
                success : ()=>{
                    this.coinNumLabel.string = res.score;
                    util.recordShareNum('boastShare',this.openid);
                }
            });
        });
    },

    backToIndex(){
        if(common.gameInfo.gameType == 2){
            common.gameInfo.timeCoutStart = false;
        }
        common.bannerAd.hide();
        cc.director.loadScene("Index");
    },

    stopButtons(){
        this.backButton.getComponent(cc.Button).interactable = false;
        this.resetButton.getComponent(cc.Button).interactable = false;
        this.hintButton.getComponent(cc.Button).interactable = false;
        this.skinButton.getComponent(cc.Button).interactable = false;

    },

    activeButtons(){
        this.backButton.getComponent(cc.Button).interactable = true;
        this.resetButton.getComponent(cc.Button).interactable = true;
        this.hintButton.getComponent(cc.Button).interactable = true;
        this.skinButton.getComponent(cc.Button).interactable = true;
    }
});
