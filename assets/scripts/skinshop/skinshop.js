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

const dictionary = ['bg','gridbg','item','btn']

cc.Class({
    extends: cc.Component,

    properties: {
        goodsPrefab : {
            type : cc.Prefab,
            default : null
        },
        bg_goodsNode : {
            type : cc.Node,
            default : null
        },
        gridbg_goodsNode : {
            type : cc.Node,
            default : null
        },
        item_goodsNode : {
            type : cc.Node,
            default : null
        },
        btn_goodsNode : {
            type : cc.Node,
            default : null
        },
        contentNode : {
            type : cc.Node,
            default : null
        },
        gameScript : Object,
        confirmPopup : {
            type : cc.Node,
            default : null
        },
        //控制更换皮肤
        bgControl : {
            type : cc.Node,
            default : null
        },
        itemControl : {
            type : cc.Node,
            default : null
        },
        gridbgControl : {
            type : cc.Node,
            default : null
        },
        btnControl : {
            type : cc.Node,
            default : null
        },

        //当前金币
        coinLabel : {
            type : cc.Label,
            default : null
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        let self = this;

        this.contentNode.width = (160+10)*common.skinShopInfo.bg.length + 10;//本身距离+间隔 + 左边外边距

        cc.loader.loadRes("skinShop", cc.SpriteAtlas, function (err, atlas) {
            for(let [key,className] of dictionary.entries()){
            //便利四个类别
                if( common.skinShopInfo[className] ){
                    for(let [key,item] of common.skinShopInfo[className].entries()){
                        //便利每一个商品节点
                        let goods = cc.instantiate(self.goodsPrefab);
                        goods.name = 'goods' + key ;
                        let goodsScript = goods.getComponent('goods');

                        goodsScript.unChooseSpriteFrame = atlas.getSpriteFrame(className + '_' + key);
                        goodsScript.chooseSpriteFrame = atlas.getSpriteFrame(className + '_' + key + '_check');

                        goodsScript.OwnSpriteFrame = atlas.getSpriteFrame('paly_btn_yes');
                        
                        goodsScript.NotOwnSpriteFrame = atlas.getSpriteFrame('paly_btn_no');

                        if( key == common.userInfo.skinInfo[className] ){
                            //当前商品值是设定值
                            goodsScript.is_set = 1;
                        }else{
                            goodsScript.is_set = 0;
                        }

                        item.index = key;
                        goodsScript.goodsInfo = item;

                        self[className + '_goodsNode'].addChild(goods);
                    }
                }
            }
            
        });

        //注册购买皮肤监听
        this.node.on('buy-skin',this.buySkinPop,this);
        //注册设定皮肤监听
        this.node.on('set-skin',this.setSkin,this);

    },

    buySkinPop(event){
        event.stopPropagation();

        this.confirmPopup.active = true ;

        this.curBuyId = event.detail.sid;
        this.curBuyPrice = event.detail.price;
        this.curBuyType = event.detail.type_name;
        this.curBuyIndex = event.detail.index;
    },

    buyskin_yes(){
        util.pullRequest('setbuy',{openid : common.userInfo.openid,sid : this.curBuyId },(res)=>{
            wx.showToast({
                title : res.msg,
                duration : 800,
                icon : res.code == 1 ? "success" : "loading",
                mask : 1
            });

            let curBuyGood = this[this.curBuyType + '_goodsNode'].getChildByName('goods' + this.curBuyIndex);

            if(res.code == 1 ){
                common.skinShopInfo[this.curBuyType][this.curBuyIndex].is_buy = 1;
                curBuyGood.getComponent('goods').is_buy = 1;
                this.coinLabel.string -= this.curBuyPrice;
            }

            this.confirmPopup.active = false;
        });
    },

    buyskin_no(){
        this.confirmPopup.active = false ;
    },

    setSkin(event){ 
        event.stopPropagation();

        this.curSetId = event.detail.sid;
        this.curSetType = event.detail.type_name;
        this.curSetIndex = event.detail.index;

        util.pullRequest('setUserSkinInfo',{openid : common.userInfo.openid,sid : this.curSetId ,type : this.curSetType, index : this.curSetIndex},(res)=>{
            wx.showToast({
                title : res.msg,
                duration : 800,
                icon : res.code == 1 ? "success" : "loading",
                mask : 1
            });

            if(res.code == 1){
                let preSetGood = this[this.curSetType + '_goodsNode'].getChildByName('goods' + common.userInfo.skinInfo[this.curSetType]); //将同一类别的上一个设定改成灰色
                preSetGood.getComponent('goods').is_set = 0;

                let curSetGood = this[this.curSetType + '_goodsNode'].getChildByName('goods' + this.curSetIndex); //将同一类别的上一个设定改成灰色
                curSetGood.getComponent('goods').is_set = 1;

                common.userInfo.skinInfo[this.curSetType] = this.curSetIndex;

                this.changeSkinAction(this.curSetType);
            }
  
        });
    },

    changeSkinAction(skin_class){
       switch(skin_class){
            case 'bg' :         
                this.bgControl.getComponent('bgSkin').changeSkin();
                break;
            case 'item' :
                this.itemControl.getComponent('gridControl').changeSkin();
                break;      
            case 'gridbg' : 
                this.gridbgControl.getComponent('gridbgSkin').changeSkin();
                break;
            case 'btn' : 
                this.btnControl.getComponent('btnSkin').changeSkin();            
                break;      
       }
    },

    showSkinShop(){
        this.node.active = true;
        common.bannerAd.hide();
        this.node.getChildByName('container').runAction(util.zoomInAction()); 
    },

    closeSkinShop(){
        common.bannerAd.show();
        this.node.getChildByName('container').runAction(util.zoomOutAction(()=>{
            this.node.active = false;
        }));
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
