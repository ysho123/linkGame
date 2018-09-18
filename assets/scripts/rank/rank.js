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
        contentNode :{
            default : null,
            type : cc.Node
        },
        rankItem : {
            default : null,
            type : cc.Prefab
        },
        resetbtn : {
            default : null,
            type : cc.Node
        },
        resetPop : {
            default : null,
            type : cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        //场景值
        common.sceneValue = 1;
        
        let openid = common.userInfo.openid;
        let url = '';
        let gameTypeName = '';

        //判断模式
        if( common.gameInfo.gameType == 1 ){
            url = 'getLevelList';
            gameTypeName = 'normalRankInfo';
        }else if( common.gameInfo.gameType == 2 ){
            url = 'getTimelList';
            gameTypeName = 'limitedRankInfo';
        }

        if(common.rankInfo[gameTypeName]){
            let res = common.rankInfo[gameTypeName];
            this.fillGameList(res);
        }else{
            this.getRankInfo(url,openid);
        }

        if(common.button){
           common.button.hide(); 
        }

        //获取皮肤商店信息
        if(common.skinShopInfo){
            
        }else{
            util.pullRequest('getSkin',{openid},(res)=>{
                if(res.code == 1){
                    common.skinShopInfo = res.data;
                }
            });
        }

        //预加载游戏场景
        cc.director.preloadScene("Game", function () {
            console.log("Game scene preloaded");
        });

        // 加广告
        let systemInfo = wx.getSystemInfoSync();
        let bannerWidth = systemInfo.windowWidth;
        let bannerHeight = 80;
        common.bannerAd = wx.createBannerAd({
          adUnitId: 'adunit-ef9525c7559afc5c',
          style: {
            left: 0,
            top: systemInfo.windowHeight - bannerHeight,
            width: bannerWidth
          }
        })
        common.bannerAd.show();
        common.bannerAd.onResize(res => {
            common.bannerAd.style.top = systemInfo.windowHeight - common.bannerAd.style.realHeight;
        })
    },

    getRankInfo(url,openid){
        wx.showLoading({
            title : '网络请求中',
        });

        util.pullRequest(url,{openid},(res)=>{
            if(res.code == 1){
                wx.hideLoading({});
                this.fillGameList(res);
            }      
        },(err)=>{
            console.log('拉取关卡信息失败，重新拉取',err);
            if(common.sceneValue == 1){
                this.getRankInfo(url,openid);
            }else{
                wx.hideLoading();
            }
        });
    },

    fillGameList(res){
        if(res.list){
            this.contentNode.height = res.list.length * 238 + 40;
        }

        res.list.forEach((item,index)=>{
            let node = cc.instantiate(this.rankItem);
            node.getComponent('rankItem').item_date = item;
            node.parent = this.contentNode;
        });

        //添加一个未完待续的说明
        let endLabelNode = new cc.Node('endLabel');
        let endLabel = endLabelNode.addComponent(cc.Label);
        endLabel.string = '马上出新题，稍等稍等......';

        this.contentNode.addChild(endLabelNode);

        //是否显示重置按钮
        if(res.list[res.list.length-1].lock == 0){
            this.resetbtn.active = true
        }
    },

    back(){
        common.bannerAd.hide();
        cc.director.loadScene("Index");
    },

    showResetPop(){
        this.resetPop.active = true;

        this.resetPop.getChildByName('container').runAction(util.zoomInAction()); 
    },

    closeResetPop(){
        this.resetPop.getChildByName('container').runAction(util.zoomOutAction( ()=>{
            this.resetPop.active = false;
        }));
    },

    ensureReset(){
        let openid = common.userInfo.openid;
        let type = common.gameInfo.gameType;

        util.pullRequest('resetUserSlefGameLog',{openid,type},(res)=>{
            util.pullRequest('add500Coin',{openid},(res)=>{

            });

            wx.showToast({
                title : res.msg,
                duration : 800,
                icon : res.code == 1 ? "success" : "loading",
                mask : 1,
                success : ()=>{
                    cc.director.loadScene("Index");
                }
            });
        })

    },

    start () {

    },

    // update (dt) {},
});
