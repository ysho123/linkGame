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
        circle : {
            default : null,
            type : cc.Node
        },
        tunner_up : {
            default : null,
            type : cc.Node
        },
        tunner_down : {
            default : null,
            type : cc.Node
        },
        tunner_left : {
            default : null,
            type : cc.Node
        },
        tunner_right : {
            default : null,
            type : cc.Node
        },
        hintIcon :{
            default : null,
            type : cc.Node
        },
        gezi : {
            default : null,
            type : cc.Sprite
        },
        isOrigin : false,
        gridValue : 0 ,
        gridColor : '',
        isHinted  : false
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad () {
        this.preAction = null; //上一行为
        this.curAction = null; //本次行为
    },

    start () {

    },

    // update (dt) {
    //     // console.log(this.getComponent(cc.Sprite));

    // },

    addCircle(color){
        this.circle.active = true;

        if(color){
            this.gridColor = color;
        }

        this.preAction = this.curAction;
        this.curAction = this.addCircle;

        return this;
    },

    addLeftTunner(color){
        this.tunner_left.active = true;
        this.tunner_left.color = cc.color(color) ;

        this.gridColor = color;
        this.preAction = this.curAction;
        this.curAction = this.addLeftTunner;

        return this;
    },

    addRightTunner(color){
        this.tunner_right.active = true;
        this.tunner_right.color = cc.color(color) ;

        this.gridColor = color;
        this.preAction = this.curAction;
        this.curAction = this.addRightTunner;

        return this;
    },

    addUpTunner(color){
        this.tunner_up.active = true;
        this.tunner_up.color = cc.color(color) ;

        this.gridColor = color;
        this.preAction = this.curAction;
        this.curAction = this.addUpTunner;

        return this;
    },

    addDownTunner(color){
        this.tunner_down.active = true;
        this.tunner_down.color = cc.color(color) ;
        this.gridColor = color;
        this.preAction = this.curAction;
        this.curAction = this.addDownTunner;

        return this;
    },

    addHint(){
        this.hintIcon.active = true;

        return this;
    },

    clearAllStyle(){
        this.node.color = cc.color('#ffffff');

        this.tunner_up.active = false;
        this.tunner_down.active = false;
        this.tunner_left.active = false;
        this.tunner_right.active = false;
        this.hintIcon.active = false;
        this.circle.active = false;
        return this;
    },

    //点击重玩按钮的reset
    reset(){
        if(this.isOrigin){
            this.tunner_up.active = false;
            this.tunner_down.active = false;
            this.tunner_left.active = false;
            this.tunner_right.active = false
            this.hintIcon.active = false;;
            this.node.color = cc.color('#ffffff');
        }else{
            this.gridColor =  '';     
            this.gridValue = 0 ;
            this.clearAllStyle();
        }
        this.isHinted = false;
        this.preAction = null; 
        this.curAction = null; 
    },

    //点下一关的初始化
    init(){
        this.isOrigin = false;
        this.gridValue = 0 ;
        this.gridColor = '';
        this.isHinted = false;
        this.preAction = null; //上一行为
        this.curAction = null; //本次行为

        this.clearAllStyle();
    }

});
