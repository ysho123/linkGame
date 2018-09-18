// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        picSprite : {
            type : cc.Sprite,
            default : null
        },
        buyInfoSprite : {
            type : cc.Sprite,
            default : null
        },
        priceLabel : {
            type : cc.Label,
            default : null
        },
        nameLabel : {
            type : cc.Label,
            default : null
        },
        goodsInfo : {
            type : Object,
            set : function(value){
                this.id = value.id ; 
                this.price = value.shop_price;
                this.type_name = value.type_name;
                this.index = value.index;//在数组中的序号
                this.nameLabel.string = value.shop_title || '连线哟';
                this.is_buy = value.is_buy;
            }
        },
        is_buy : {
            type : Boolean,
            set : function(value){
                if(value){
                     this._is_buy = 1;
                     this.ownSkin();
                }else{
                    this._is_buy = 0;
                    this.notOWnSkin();
                }
            },
            get : function(){
                return this._is_buy;
            }
        },
        is_set : {
            type : Boolean,
            set : function(value){
                if(value){
                    this.chooseCurSkin();
                    this._is_set = 1;
                }else{
                    this.unChooseCurSkin();
                    this._is_set = 0;
                }
            },
            get : function(){
                return this._is_set;
            }
        },
        chooseSpriteFrame : {
            type : cc.SpriteFrame,
            default : null
        },
        unChooseSpriteFrame : {
            type : cc.SpriteFrame,
            default : null
        },
        OwnSpriteFrame : {
            type : cc.SpriteFrame,
            default : null
        },
        NotOwnSpriteFrame : {
            type : cc.SpriteFrame,
            default : null
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {

    },

    chooseCurSkin(){
        this.picSprite.spriteFrame = this.chooseSpriteFrame;
    },

    unChooseCurSkin(){
        this.picSprite.spriteFrame = this.unChooseSpriteFrame;
    },

    ownSkin(){
        this.buyInfoSprite.spriteFrame = this.OwnSpriteFrame;
        this.priceLabel.string = '已获得';
    },

    notOWnSkin(){
        this.buyInfoSprite.spriteFrame = this.NotOwnSpriteFrame;
        this.priceLabel.string = this.price;
    },

    buyCurSkin(){
        let self = this;
        if(self.is_buy){
            //如果已经购买，再点购买没有效果
            return;
        }

        let eventCustom = new cc.Event.EventCustom('buy-skin', true);
        eventCustom.detail = {
              sid : self.id,
              price : self.price,
              type_name : self.type_name,
              index : self.index
        };
        
        this.node.dispatchEvent(eventCustom);
    },

    setCurSkin(){
        let self = this;

        if(!self.is_buy){
            wx.showToast({
                title : '请先购买皮肤',
                duration : 800,
                // icon : '',
                mask : 1
            });

            return;
        }

        if(self.is_set){
            //如果已经设置，再点没有效果
            return;
        }

        let eventCustom = new cc.Event.EventCustom('set-skin', true);

        eventCustom.detail = {
              sid : self.id,
              type_name : self.type_name,
              index : self.index
        };
        
        this.node.dispatchEvent(eventCustom);
    },

    start () {

    },

    // update (dt) {},
});
