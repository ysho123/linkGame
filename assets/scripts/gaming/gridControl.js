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
        gridPrefab :{
            default: null,
            type: cc.Prefab
        },
        pointCursor : {
            default :null,
            type : cc.Node
        },
        hintIcon : {
            default :null,
            type : cc.Node
        },
        //存game对象的引用
        game : {
            default : null,
            serializable: false
        },
        stepNumLabel : {
            default : null,
            type : cc.Label
        }
    },

    onLoad () {
        this.updateFlag = false; //update里更新的时候有一个遍历，但是这时候还在等待回调，会报迭代错误

        this.gridPool = new cc.NodePool();//建立一个对象池，每一关不用重新生成格子对象
    },

    startGame(data,skinSource){
        // this.node.removeAllChildren();
        if(skinSource){
            this.skinSource = skinSource;//将皮肤信息存下来，页面不关闭，不用重复获取资源
        }
        
        this.cursorPointPosition = [0,0];//当前鼠标的位置
        this.cursorColor = '';

        this.curNode = {};//手指当前所在节点
        this.preNode = {};//手指上一个所在节点
        this.AnswerMap = new Map();//存放当前已连接点的序列
        this.canMove = false; // 是否点击了原点或终点，可以开始拖动

        this.baseWorldPosition = this.node.convertToWorldSpace(this.node.getPosition()); // 左下角的点相对于世界坐标系

        this.baseWorldPosition.y -= 109; //减去一个固定偏移量

        this.startTime = new Date().getTime();//开始游戏的时间(毫秒)
        this.stepNum = 0 ;//计算步数

        // 1、生成格子节点，并添加到界面
        this.generateGrid(data);

        this.updateFlag = true;

        //2、开始监听
        this.registListener();
    },

    resetGame(){
        this.cursorPointPosition = [0,0];//当前鼠标的位置
        this.cursorColor = '';

        this.curNode = {};//手指当前所在节点
        this.preNode = {};//手指上一个所在节点
        this.updateFlag = false;
        this.AnswerMap = new Map();//存放当前已连接点的序列
        this.canMove = false; // 是否点击了原点或终点，可以开始拖动

        this.startTime = new Date().getTime();//开始游戏的时间(毫秒)
        this.stepNum = 0 ;//重置步数
        this.stepNumLabel.string = 0 ;

        //遍历所有已有节点，reset
        this.node.children.forEach((item) => {
            item.getComponent('grid').reset();
            if(item.getComponent('grid').isOrigin){
               this.AnswerMap.set(item.getComponent('grid').gridValue, new Array()) 
            }
        });

        this.updateFlag = true;
    },

    registListener(){
        //按下监听
        this.node.on(cc.Node.EventType.TOUCH_START,this.touchStart,this);
        //移动监听
        this.node.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove,this);

        this.node.on(cc.Node.EventType.TOUCH_END,this.touchEnd,this);

        this.node.on(cc.Node.EventType.TOUCH_CANCEL,this.touchCancel,this);
    },

    touchStart(event){
        //限时模式下，还没有开始计时
        if(common.gameInfo.gameType == 2  && !common.gameInfo.timeCoutStart ){
            this.game.timeStart();   
            common.gameInfo.timeCoutStart = true;
        }

        //按下事件
        this.curNode = this.getCurrentPoint(event.currentTouch._point.x-this.baseWorldPosition.x,event.currentTouch._point.y-this.baseWorldPosition.y);
        //鼠标位置
        this.cursorPointPosition = [event.currentTouch._point.x-this.baseWorldPosition.x-this.node.width/2,event.currentTouch._point.y-this.baseWorldPosition.y-this.node.height/2+109];
        
        if(!this.curNode.nodeObj){
            return;
        }

        let curNodeScript = this.curNode.nodeObj.getComponent('grid');

        if(curNodeScript.gridValue == 0){
            return;
        }

        //提示出来的，不可改变
        if(curNodeScript.isHinted){
            return;
        }

        this.cursorColor = util.colorMap.get(curNodeScript.gridValue).bgColor;

        this.canMove = true;

        let curArr = this.AnswerMap.get(curNodeScript.gridValue);

        if( curArr.length == 0 ){
            curArr.push(curNodeScript.itemIndex);
            return;
        }

        if( curNodeScript.preAction == null && !curNodeScript.isOrigin){
            //没有交叉过的断点，并且不是起点
            return;
        }

        if(curNodeScript.isOrigin){
            //如果是起点或终点，清空当前数组内所有格子，头和尾另外处理
            for(let [index, item] of curArr.entries()){
                if(this.node.children[item].getComponent('grid').isOrigin){
                    this.node.children[item].getComponent('grid').clearAllStyle();
                    this.node.children[item].getComponent('grid').addCircle();
                    let arr = [];
                    arr.push(this.curNode.nodeObj.getComponent('grid').itemIndex);
                    this.AnswerMap.set(curNodeScript.gridValue, arr);
                }else{
                    this.node.children[item].getComponent('grid').gridValue = 0;
                    this.node.children[item].getComponent('grid').clearAllStyle();
                }
            }
        }else{
            //是普通被连过的点，不是起点和终点
            let deleteIndex = curArr.indexOf(curNodeScript.itemIndex) + 1 ;//不包含自己
            let deleteLength = curArr.length - deleteIndex;
            let deleteArr = curArr.splice(deleteIndex,deleteLength);    

            //当前点后面那一部分的样式要变为空      
            for(let [index, item] of deleteArr.entries()){
               if(this.node.children[item].getComponent('grid').isOrigin){
                    this.node.children[item].getComponent('grid').clearAllStyle();
                    this.node.children[item].getComponent('grid').addCircle();
                }else{
                    this.node.children[item].getComponent('grid').gridValue = 0;
                    this.node.children[item].getComponent('grid').clearAllStyle();
                } 
            }

            this.AnswerMap.set(curNodeScript.gridValue, curArr); //修改原数组

            let lastArrNode = this.node.children[curArr[curArr.length - 2]];
            let lastAction = lastArrNode.getComponent('grid').curAction.name;//函数的方法名

            //清掉当前点的属性
            curNodeScript.clearAllStyle();

            if(lastAction == 'addLeftTunner'){
                curNodeScript.addRightTunner(curNodeScript.gridColor);
            }else if(lastAction == 'addRightTunner'){
                curNodeScript.addLeftTunner(curNodeScript.gridColor);
            }else if(lastAction == 'addUpTunner'){
                curNodeScript.addDownTunner(curNodeScript.gridColor);
            }else if(lastAction == 'addDownTunner'){
                curNodeScript.addUpTunner(curNodeScript.gridColor);
            }

        }

    },

    touchMove(event){
        if(this.canMove){
            this.cursorPointPosition = [event.currentTouch._point.x-this.baseWorldPosition.x-this.node.width/2,event.currentTouch._point.y-this.baseWorldPosition.y-this.node.height/2+109];

            let nextNode_tmp = this.getCurrentPoint(event.currentTouch._point.x-this.baseWorldPosition.x,event.currentTouch._point.y-this.baseWorldPosition.y);
            if(event.currentTouch._point.x-this.baseWorldPosition.x <= 0 
                || event.currentTouch._point.x-(this.baseWorldPosition.x+this.gridNum*this.gridSize)>= 0
                || event.currentTouch._point.y-this.baseWorldPosition.y <=0 
                || event.currentTouch._point.y-(this.baseWorldPosition.y + this.gridNum*this.gridSize) >=0 ){
                //如果移动的格子不存在(移出了屏幕)
                return;
            }

            if(nextNode_tmp.nodeObj.name == this.curNode.nodeObj.name){
                //如果移动的格子还是在当前格子，则不处理
                return;   
            }

            //提示出来的，不可改变
            if(nextNode_tmp.nodeObj.getComponent('grid').isHinted){
                return;
            }

            this.moveHandler(nextNode_tmp);
        }
    },

    touchEnd(event){
        if(this.canMove){
            this.stepNum ++ ;
        }

        this.canMove = false;
        this.pointCursor.active = false;
    },

    touchCancel(event){
        if(this.canMove){
            this.stepNum ++ ;
        }

        this.canMove = false;
        this.pointCursor.active = false;
    },

    //拆出来，提示的时候，这一块能复用
    moveHandler(nextNode_tmp){
        //判断移动的方向，并处理跨格子移动的筛选(只能移动到相邻的)
        let moveDirection = this.judgetMoveDirection(this.curNode,nextNode_tmp);

        if( moveDirection == 'unOrderMove'){
            //不合法移动，不处理
            return ;
        }

        //当前的赋给上一个，下一个赋给当前
        this.preNode = this.curNode;
        this.curNode = nextNode_tmp;

        let result = this.NodeDataHandler();

        //改变Pre和Cur的样式
        if(result == 'backMyPoint' || result == 'inOthersPoint'){
            return
        }

        this.changeStyle(moveDirection);
    },

    //提示答案的方法
    hintAnswer(){
        //已经做出来的，不能再提示
        for(let i=0;i<this.realAnswer.length;i++){
            let breakout = false;
            for(let [key,arr_tmp] of this.AnswerMap){
                if(this.compareArr(this.realAnswer[i],arr_tmp)){
                    breakout = true;
                    break;//break只退出最内存循环 
                }
            }
            if(breakout){
                continue;
            }
            //开始提示

            //首先清理掉当前有的答案数组 并将第一个点推入数组
            let curFirstNodeScript = this.node.children[this.realAnswer[i][0]].getComponent('grid');
            let curAnswerArr = this.AnswerMap.get(curFirstNodeScript.gridValue);

            //清除掉当前走过的序列
            curAnswerArr.forEach((node_index) => {
                if(this.node.children[node_index].getComponent('grid').isOrigin){
                    this.node.children[node_index].getComponent('grid').clearAllStyle();
                    this.node.children[node_index].getComponent('grid').addCircle();
                }else{
                    this.node.children[node_index].getComponent('grid').gridValue = 0;
                    this.node.children[node_index].getComponent('grid').gridColor = '';
                    this.node.children[node_index].getComponent('grid').clearAllStyle();
                }
            });

            //将第一个点推入
            this.AnswerMap.set(curFirstNodeScript.gridValue,[parseInt(this.realAnswer[i][0])]);

            //开始填充答案格子
            for(let index=0;index<this.realAnswer[i].length-1;index++){
                //提示改动的格子，无法再修改，
                this.node.children[this.realAnswer[i][index]].getComponent('grid').isHinted = true;

                let grid_x = this.realAnswer[i][index] % this.gridNum;//m*m的格子，m=6
                let grid_y = parseInt(this.realAnswer[i][index] / this.gridNum);

                this.curNode = {
                    index : {grid_x,grid_y},
                    nodeObj  : this.node.children[this.realAnswer[i][index]]
                }

                let grid_x_tempNext = this.realAnswer[i][index+1] % this.gridNum;//m*m的格子，m=6
                let grid_y_tempNext = parseInt(this.realAnswer[i][index+1] / this.gridNum);

                let nextNode_tmp = {
                    index : {'grid_x' : grid_x_tempNext, 'grid_y' :grid_y_tempNext},
                    nodeObj  : this.node.children[this.realAnswer[i][index+1]]
                }

                this.moveHandler(nextNode_tmp);
            }

            //填充头和尾的提示图标(尾部在遍历的时候没有取到的，所以单独拿出来)
            this.node.children[this.realAnswer[i][0]].getComponent('grid').addHint();
            this.node.children[this.realAnswer[i][this.realAnswer[i].length-1]].getComponent('grid').addHint();
            this.node.children[this.realAnswer[i][this.realAnswer[i].length-1]].getComponent('grid').isHinted = true;

            break;//本次提示结束
        }
    },

    //比较两个数组是否相等
    compareArr(arr1,arr2){
        if(arr1.length != arr2.length){
            return false;
        }

        if( arr1.toString() != arr2.toString() && arr1.reverse().toString() != arr2.toString() ){
            return false;
        }

        return true;
    },

    /**处理节点类型的不同情况，
        1、当前点是别人的起点或终点，不可去 ----------- 修正：这一点的处理，放到judgetMoveDirection()里去处理，防止当前与上一个的改变
        1、由自己去了别人的起点或终点，再回来，this.preNode == this.curNode，这时，不处理变化，直接返回 ------- 修正：这一点，在判断是否移动的是在当前格子内处理过了
        
        2、当前点是自己的终点，连上就结束
        3、当前节点是空点，可以去
        
        4、当前点是别人连过了的点  : 当前点变成自己的，这个点的前一点变成上一次行为的点

        5、当前点是自己上一个点，回退
        6、当前点是自己曾经去过的点，

        修正 ： 4.5.6可以合并成一个，只要是去到曾经被人去过的点(包含自己)，都清除掉答案数组中从那个点往后的所有点，消除样式与value
        再修正 : 并不能合并成一个处理，5、6可以合并，4不能，还是得分开
    */
    NodeDataHandler(){
        let preNodeScript = this.preNode.nodeObj.getComponent('grid');
        let curNodeScript = this.curNode.nodeObj.getComponent('grid');
        //情景2 自己的终点(非起点)
        if(curNodeScript.isOrigin 
            && curNodeScript.gridValue == preNodeScript.gridValue
            && this.AnswerMap.get(preNodeScript.gridValue).indexOf(curNodeScript.itemIndex) != 0){
            //不可再移动了
            this.canMove = false;
            this.stepNum ++;
            this.pointCursor.active = false;
            this.AnswerMap.get(curNodeScript.gridValue).push(curNodeScript.itemIndex);

            let linkedNum = 0;
            //检查是否所有线都连上了起点和终点
            for(let [key,arr] of this.AnswerMap){
               if( arr.length < 2 ){
                    //如果有一个为空数组，或者数组本身只有一个起点，退出检查
                    break;
                }

                let firstOrigin = this.node.children[arr[0]].getComponent('grid').isOrigin;
                let lastOrigin = this.node.children[arr[arr.length-1]].getComponent('grid').isOrigin ;

                if(firstOrigin && lastOrigin){
                    linkedNum++;
                }
            }

            if( linkedNum == this.AnswerMap.size ){
                // 如果头尾相连的条数，等于答案数组的长度
                this.checkGameOver();
            }
            
            return;
        }

        //情景3 空节点
        if(curNodeScript.gridValue == 0){
            curNodeScript.gridValue = preNodeScript.gridValue;
            curNodeScript.gridColor = preNodeScript.gridColor;
            this.AnswerMap.get(curNodeScript.gridValue).push(curNodeScript.itemIndex);
            return;
        }

        //情景4 自己去过的点(不会是终点，已处理过)
        if(this.AnswerMap.get(preNodeScript.gridValue).includes(curNodeScript.itemIndex)){
            let nodeIndex = this.AnswerMap.get(preNodeScript.gridValue).indexOf(curNodeScript.itemIndex);

            let myArr = this.AnswerMap.get(preNodeScript.gridValue);
            let deleteIndex = myArr.indexOf(curNodeScript.itemIndex) + 1 ;//自己不包括
            let deleteLength = myArr.length - deleteIndex;

            let deleteArr = myArr.splice(deleteIndex,deleteLength);

            this.AnswerMap.set(curNodeScript.gridValue, myArr); //这一句不一定需要

            //自己后面那一部分的样式要变
            for(let [index, item] of deleteArr.entries()){
                this.node.children[item].getComponent('grid').gridValue = 0;
                this.node.children[item].getComponent('grid').gridColor = '';
                this.node.children[item].getComponent('grid').clearAllStyle();
            }

            //改gridValue
            if(nodeIndex == 0){
                //到了起点
                curNodeScript.clearAllStyle();
                curNodeScript.addCircle();
            }else{
                //非起点
                curNodeScript.clearAllStyle();
                curNodeScript.preAction(curNodeScript.gridColor);
            }

            return 'backMyPoint';
        }

        //情景5 别人去过的点(其他筛选条件不用)
        if(curNodeScript.gridValue != 0 && curNodeScript.gridValue != preNodeScript.gridValue){
            let deleteArr = this.AnswerMap.get(curNodeScript.gridValue);

            let deleteIndex = deleteArr.indexOf(curNodeScript.itemIndex);//包含自己
            let deleteLength = deleteArr.length - deleteIndex;

            let deleteArr_splice = deleteArr.splice(deleteIndex,deleteLength);            

            //删除后的倒数第一个元素要变短
            if(deleteArr.length == 1){
                //到了终点
                this.node.children[deleteArr[deleteArr.length-1]].getComponent('grid').clearAllStyle();
                this.node.children[deleteArr[deleteArr.length-1]].getComponent('grid').addCircle();
            }else{
                this.node.children[deleteArr[deleteArr.length-1]].getComponent('grid').clearAllStyle();
                this.node.children[deleteArr[deleteArr.length-1]].getComponent('grid').preAction(this.node.children[deleteArr[deleteArr.length-1]].getComponent('grid').gridColor);
            }

            this.AnswerMap.set(curNodeScript.gridValue, deleteArr); //这一句不一定需要

            //他后面那一部分的样式要变为空
            for(let [index, item] of deleteArr_splice.entries()){
                if(this.node.children[item].getComponent('grid').isOrigin){
                    this.node.children[item].getComponent('grid').clearAllStyle();
                    this.node.children[item].getComponent('grid').addCircle();
                }else{
                    this.node.children[item].getComponent('grid').gridValue = '';
                    this.node.children[item].getComponent('grid').gridValue = 0;
                    this.node.children[item].getComponent('grid').clearAllStyle();
                }
            }

            //改自己gridValue
            curNodeScript.gridValue = preNodeScript.gridValue;
            curNodeScript.gridColor = preNodeScript.gridColor;

            this.AnswerMap.get(curNodeScript.gridValue).push(curNodeScript.itemIndex);
        }
        return;
    },

    changeStyle(moveDirection){
        let preNodeScript = this.preNode.nodeObj.getComponent('grid');
        let curNodeScript = this.curNode.nodeObj.getComponent('grid');
        switch(moveDirection){
            case 'toRight' : 
                preNodeScript.addRightTunner(preNodeScript.gridColor);
                curNodeScript.addLeftTunner(curNodeScript.gridColor);
                break;
            case 'toLeft' : 
                preNodeScript.addLeftTunner(preNodeScript.gridColor);
                curNodeScript.addRightTunner(curNodeScript.gridColor);
                break;
            case 'toDown' : 
                preNodeScript.addDownTunner(preNodeScript.gridColor);
                curNodeScript.addUpTunner(curNodeScript.gridColor);
                break;
            case 'toUp' : 
                preNodeScript.addUpTunner(preNodeScript.gridColor);
                curNodeScript.addDownTunner(curNodeScript.gridColor);
                break;
        }
    },

    cancelListener(){
        //取消监听
        this.node.off(cc.Node.EventType.TOUCH_START,this.touchStart,this);
        //移动监听
        this.node.off(cc.Node.EventType.TOUCH_MOVE,this.touchMove,this);

        this.node.off(cc.Node.EventType.TOUCH_END,this.touchEnd,this);

        this.node.off(cc.Node.EventType.TOUCH_CANCEL,this.touchCancel,this);
    },

    checkGameOver(){
        let sumItems = 0;

        for(let [index,arr] of this.AnswerMap){
            sumItems += arr.length;
        }

        if(sumItems == this.gridNum*this.gridNum){
            this.endTime = new Date().getTime();

            this.gameTime = (this.endTime - this.startTime) / 1000;

            let data = {
                openid : this.openid,
                lv : this.lv,
                num : this.num,
                step : this.stepNum,
                sec : this.gameTime
            }

            this.updateFlag = false;

            this.cancelListener();

            //显示等待提示
            wx.showLoading({
                title : '网络请求中，请稍后',
                mask : true
            });

            //提交答案
            this.game.submitAnswer(data,()=>{
                //格子回收
                let children = this.node.children;
                for (var i = children.length-1 ; i >=0 ; i-- ) {
                    let curNode = children[i];
                    curNode.getComponent('grid').init();//重新初始化
                    this.gridPool.put(children[i]);
                }

                wx.hideLoading();
            });
        }else{
            //弹窗提示  
            this.game.showTips();
        }
    },

    judgetMoveDirection(curNode,nextNode){
        let offSetX = nextNode.index.grid_x - curNode.index.grid_x ;
        let offSetY = nextNode.index.grid_y - curNode.index.grid_y ;

        if(nextNode.nodeObj.getComponent('grid').isOrigin && nextNode.nodeObj.getComponent('grid').gridValue != curNode.nodeObj.getComponent('grid').gridValue){
            //用于修正，详情见NodeDataHandler()注释
            return 'unOrderMove';
        }
        //只处理4种情况，上下左右移,其他情况(直接斜移或跨格子跳)不处理
        if( offSetX == 1 && offSetY ==0 ){
            return 'toRight';
        }
        if( offSetX == -1 && offSetY ==0 ){
            return 'toLeft';
        }
        if(offSetX == 0 && offSetY == 1 ){
            return 'toDown';
        }
        if(offSetX == 0 && offSetY == -1 ){
            return 'toUp';
        }
        return 'unOrderMove';
    },

    //获取当前指针指向哪个格子
    getCurrentPoint(x,y){
        //假设格子宽都是100(6*6)
        let grid_x = Math.floor(x/this.gridSize); //100是m，m是格子的宽或高
        let grid_y = this.gridNum - 1 - Math.floor(y/this.gridSize);
        let grid_index = grid_x + this.gridNum*grid_y;

        return {
            index : {grid_x,grid_y},
            nodeObj  : this.node.children[grid_index]
        }
    },

    NodePoolGet(){
        //从对象池获得对象，换关卡时回收
        if(this.gridPool.size() > 0){
            return this.gridPool.get();
        }else{
            return cc.instantiate(this.gridPrefab);
        }
    },

    generateGrid(res){
            // 数据格式 一维数组 index 坐标    item 
            this.openid = common.userInfo.openid;
            this.lv = common.gameInfo.lv;
            this.num = common.gameInfo.num;

            let data = res.data.question;

            let gridNum = res.data.length;

            for(let i=0;i<data.length;i++)
            {   
                let gridNode = this.NodePoolGet();//从对象池拿
                gridNode.name = 'node' + i;

                gridNode.getComponent('grid').gridValue = data[i];
                //当前点位对于当前序列的索引
                gridNode.getComponent('grid').itemIndex = i ;
                gridNode.getComponent('grid').clearAllStyle();

                if(this.skinSource){
                    //加载当前皮肤
                    gridNode.getComponent(cc.Sprite).spriteFrame = this.skinSource.gzFrame;
                    gridNode.getChildByName('tunner_up').getComponent(cc.Sprite).spriteFrame = this.skinSource.tubeFrame;
                    gridNode.getChildByName('tunner_down').getComponent(cc.Sprite).spriteFrame = this.skinSource.tubeFrame;
                    gridNode.getChildByName('tunner_left').getComponent(cc.Sprite).spriteFrame = this.skinSource.tubeFrame;
                    gridNode.getChildByName('tunner_right').getComponent(cc.Sprite).spriteFrame = this.skinSource.tubeFrame;
                }

                if(data[i] != "0"){
                    //加载当前皮肤
                    if(this.skinSource){
                        gridNode.getChildByName('circle').getComponent(cc.Sprite).spriteFrame = this.skinSource.circleFrames.get(data[i]);
                    }

                    gridNode.getComponent('grid').addCircle(util.colorMap.get(data[i]).itemColor);
                    //设置，起点或终点
                    gridNode.getComponent('grid').isOrigin = true;
                    //创建答案Map
                    this.AnswerMap.set(gridNode.getComponent('grid').gridValue, new Array());
                }

                let gridSize = parseInt(648/gridNum);

                this.gridNum = parseInt(gridNum);
                this.gridSize = parseInt(gridSize);

                gridNode.width = gridSize;
                gridNode.height = gridSize;

                //修改大小(适配不同的棋盘大小)
                this.changeSize(gridNode,gridNum);
           
                this.node.addChild(gridNode);
            }

            if(res.data.answer){
                //答案数组
                this.realAnswer = res.data.answer;
            }else{
                this.hintIcon.active = false;
            }
    },

    changeSkin(){
        if(common.userInfo.skinInfo){
            let skinNum = common.userInfo.skinInfo.item || 0 ; //默认0

            let self = this;

            cc.loader.loadRes( "skin" + skinNum, cc.SpriteAtlas, function (err, atlas) {
                //更换现有皮肤
                self.node.children.forEach((item) => {
                    item.getChildByName('tunner_up').getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                    item.getChildByName('tunner_down').getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                    item.getChildByName('tunner_left').getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                    item.getChildByName('tunner_right').getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                    item.getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_gz')

                    if(item.getComponent('grid').isOrigin){
                        item.getChildByName('circle').getComponent(cc.Sprite).spriteFrame = atlas.getSpriteFrame('skin' + skinNum + '_item_' + item.getComponent('grid').gridValue);
                    }
                });

                //更换当前资源，下一关的时候不用重新加载资源
                let tubeFrame = atlas.getSpriteFrame('skin' + skinNum + '_tube');
                let gzFrame = atlas.getSpriteFrame('skin' + skinNum + '_gz');
                let circleFrames = new Map();
                for(let i=1;i<=10;i++){
                    circleFrames.set(i.toString(),atlas.getSpriteFrame('skin' + skinNum + '_item_' + i));
                }
                self.skinSource = {
                    tubeFrame,
                    gzFrame,
                    circleFrames
                }
            });
        }
    },

    changeSize(gridNode,gridNum){
        let circleNode = gridNode.getChildByName('circle'); 
        let tunnerUpNode = gridNode.getChildByName('tunner_up');
        let tunnerDownNode = gridNode.getChildByName('tunner_down');
        let tunnerLeftNode = gridNode.getChildByName('tunner_left');
        let tunnerRightNode = gridNode.getChildByName('tunner_right');
        let HintIconNode = gridNode.getChildByName('hintIcon');

        circleNode.width = util.gridSize[gridNum].circle;
        circleNode.height = util.gridSize[gridNum].circle;

        tunnerUpNode.width = util.gridSize[gridNum].link.width;
        tunnerUpNode.height = util.gridSize[gridNum].link.height;
        tunnerUpNode.setPositionY(util.gridSize[gridNum].link.offset);

        tunnerDownNode.width = util.gridSize[gridNum].link.width;
        tunnerDownNode.height = util.gridSize[gridNum].link.height;
        tunnerDownNode.setPositionY(-util.gridSize[gridNum].link.offset); 

        tunnerLeftNode.width = util.gridSize[gridNum].link.width;
        tunnerLeftNode.height = util.gridSize[gridNum].link.height;
        tunnerLeftNode.setPositionX(-util.gridSize[gridNum].link.offset); 

        tunnerRightNode.width = util.gridSize[gridNum].link.width;
        tunnerRightNode.height = util.gridSize[gridNum].link.height;
        tunnerRightNode.setPositionX(util.gridSize[gridNum].link.offset);     

        HintIconNode.width = util.gridSize[gridNum].icon.width;
        HintIconNode.height = util.gridSize[gridNum].icon.height;
    },

    // start () {

    // },

    update (dt) {
        //干两个事：
        //1、维护跟着鼠标跑的圈圈
        if(this.canMove){
            this.pointCursor.active = true;
            this.pointCursor.color = cc.color(this.cursorColor);
            this.pointCursor.setPosition(this.cursorPointPosition[0],this.cursorPointPosition[1]);
        }

        //2、维护连接上了的线的阴影 
        if(this.updateFlag){
            for(let [key,ansArr] of this.AnswerMap.entries()){
                if(ansArr.length <= 1){
                    continue;
                }
                let firstNodeScript = this.node.children[ansArr[0]].getComponent('grid');
                let lastNodeScript = this.node.children[ansArr[ansArr.length-1]].getComponent('grid');
                if(firstNodeScript.isOrigin && lastNodeScript.isOrigin){
                    //将阴影加上
                    ansArr.forEach((index)=>{
                        this.node.children[index].color = cc.color(util.colorMap.get(firstNodeScript.gridValue).bgColor);
                    });
                }
            }
        }

        //维护步数
        if(this.stepNum){
            this.stepNumLabel.string = this.stepNum ;
        }
        
    }
});
