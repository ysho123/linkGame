//工具类

const URL = {
    login : 'https://www.xc82.cn/line/User/login',
    saveUser : 'https://www.xc82.cn/line/User/saveUser',
    register : 'https://www.xc82.cn/line/User/getSignList',
    addSign : 'https://www.xc82.cn/line/User/addSign',
    getLevelList : 'https://www.xc82.cn/line/Game/getLevelList',
    getGameItems : 'https://www.xc82.cn/line/Game/getGameItems',
    completeLevel : 'https://www.xc82.cn/line/Game/completeLevel',
    userGetTips : 'https://www.xc82.cn/line/Game/userGetTips',
    userSendShare : 'https://www.xc82.cn/line/Game/userSendShare',
    userGetShareStatus : 'https://www.xc82.cn/line/Game/userGetShareStatus',
    getOtherXcxInfo : 'https://www.xc82.cn/line/Index/getOtherXcxInfo',
    userLikeLevel : 'https://www.xc82.cn/line/Game/userLikeLevel',
    userAdd10Coin : 'https://www.xc82.cn/line/Game/userAddCoin',
    getTimelList : 'https://www.xc82.cn/line/Game/getTimelList',//限时模式获取关卡列表
    getGameTimeItems : 'https://www.xc82.cn/line/Game/getGameTimeItems',//限时模式获取题目
    completeTimeLevel : 'https://www.xc82.cn/line/Game/completeTimeLevel',//限时模式完成关卡
    getTzxcxInfo : 'https://www.xc82.cn/line/Index/getTzxcxInfo',//计算从别处进来的量
    getUserSkinInfo : 'https://www.xc82.cn/line/Index/getUserSkinInfo',
    getSkin : 'https://www.xc82.cn/line/Index/getSkin',
    setbuy : 'https://www.xc82.cn/line/Index/setbuy',
    getOtherMiniProgramInfo : 'https://www.xc82.cn/line/Index/getOtherMiniProgramInfo',
    setUserSkinInfo : 'https://www.xc82.cn/line/Index/setUserSkinInfo',
    resetUserSlefGameLog : 'https://www.xc82.cn/line/Game/resetUserSlefGameLog',//重置用户关卡信息
    add500Coin : 'https://www.xc82.cn/line/Game/add500Coin',//加500金币
    addInviteRecord : 'https://www.xc82.cn/line/User/addUserInviteLog',//添加用户邀请记录
    getInviteRecord : 'https://www.xc82.cn/line/User/getUserInviteLog',//用户获取邀请记录
    addCoinByNum : 'https://www.xc82.cn/line/Game/addCoinByNum',//自定义加多少钱
    addshareRecord : 'https://www.xc82.cn/line/Game/shareRecord',//记录用户分享记录
    getMusic : 'https://www.xc82.cn/line/Game/getMusic',//获取背景音乐
};

const KEY = 'link';
const XID = 22 ;
const noop = function() {};


//拉起请求
function pullRequest(urlName,data,successCallback,FailCallBack = noop,completeCallback = noop ){
    wx.request({
        url : URL[urlName],
        method : 'POST',
        data : data ,
        success : (res) =>{
            successCallback(res.data);
        },
        fail : (err) =>{
            console.log(err);
            FailCallBack(err);
        },
        complete : ()=>{
            completeCallback();
        }
    })
}

function getOpenId(callback){
    let openId = wx.getStorageSync(KEY);

    if(openId){
        callback(openId);
    }else{
        wx.login({
            success : (data)=>{
                wx.request({
                    url : URL['login'],
                    method : 'POST',  
                    data : {code : data.code , xid  : XID},
                    success : (res) =>{
                        console.log(res.data);
                        if(res.data.code == 1){
                            //存入缓存
                            wx.setStorageSync(KEY,res.data.data.openid);
                            //调登录接口，openId已经入库
                            callback(res.data.data.openid);
                        }
                    }               
                });
            }
        });
    }
}


const gridSize = {
    5 : {
        circle : 98,
        link :{
            width : 33,
            height : 82,
            offset : 24.5
        },
        icon : {
            width : 52,
            height : 38
        }
    },
    6 : {
        circle : 82,
        link :{
            width : 28,
            height : 68,
            offset : 21.5
        },
        icon : {
            width : 44,
            height : 32
        }
    },
    7 : {
        circle : 70,
        link :{
            width : 23,
            height : 57,
            offset : 18.5
        },
        icon : {
            width : 37,
            height : 27
        }
    },
    8 : {   
        circle : 61.5,
        link :{
            width : 21,
            height : 51,
            offset : 16.5
        },
        icon : {
            width : 33,
            height : 24
        }
    },
    9 : {   
        circle : 54,
        link :{
            width : 18,
            height : 45,
            offset : 14.5
        },
        icon : {
            width : 22,
            height : 16
        }
    }
}

const colorMap = new Map();

colorMap.set('0',{bgColor : '',itemColor : ''})  
.set('1',{bgColor : '#fa92b4',itemColor : '#ff2069'}) 
.set('2',{bgColor : '#ffc9c1',itemColor : '#ff806d'})
.set('3',{bgColor : '#b4fdfd',itemColor : '#4ee4e3'})
.set('4',{bgColor : '#ffe991',itemColor : '#fdc322'})
.set('5',{bgColor : '#b8e1ff',itemColor : '#78c1f6'})
.set('6',{bgColor : '#eeffd5',itemColor : '#bcf568'})
.set('7',{bgColor : '#ffceeb',itemColor : '#fe67c0'})
.set('8',{bgColor : '#78d1c4',itemColor : '#25a08e'})
.set('9',{bgColor : '#d99dfe',itemColor : '#a028ec'})
.set('10',{bgColor : '#dcd7fe',itemColor : '#8474f3'});

    /**
     * 出现动作
     * @param {func} finished 回调函数
     */
    const zoomInAction = function (finished = noop) {
        let callFunc = cc.callFunc(function(){
            finished && finished()
        })

        return cc.sequence(
            cc.fadeTo(-0.01, 1),
            cc.scaleTo(-0.01, 0.3),
            cc.fadeIn(0.3),
            cc.scaleTo(0.3, 1, 1),
            callFunc  
        )
    }

    /**
     * 消失动作
     * @param {func} finished 回调函数
     */
    const zoomOutAction = function (finished = noop) {
        var callFunc = cc.callFunc(function(){
            finished && finished()
        });

        var seq = cc.spawn(
            cc.scaleTo(0.3, 0.4, 0.4),
            cc.fadeOut(0.5)
        )
        return cc.sequence(seq, callFunc);
    }


    const judgetWhereFrom = function(openid){
        let hasCounted = wx.getStorageSync('ENTER');

        if(hasCounted){
            return;
        }
        else{
            let enterData = wx.getLaunchOptionsSync();

            let scene = enterData.scene;
            let query = enterData.query;
            var queryArr = Object.getOwnPropertyNames(query);

            if(queryArr.length == 0){
                console.log('no参数,啥都不干')
            }else{
                let data = {
                    cxid : XID,
                    tzid : query.tzid,
                    scene : scene,  //场景来源
                    openid : openid 
                }
                pullRequest('getTzxcxInfo',data,(res)=>{
                    if(res.errcode == 1){
                        wx.setStorageSync('ENTER',true);
                    }
                });
            }
        }
    }

    const judgeWhoInvitesMe = function(come_openid){
        let enterData = wx.getLaunchOptionsSync();

        let invite_openid = enterData.query.invite_openid || '';

        if(invite_openid){
            pullRequest('addInviteRecord',{come_openid,invite_openid},(res)=>{
                console.log('给别人加钱成功');
            },
            (err)=>{
               console.log(err); 
            });
        }
    }

    const recordShareNum = function(key,openid){
        pullRequest('addshareRecord',{key,openid},(res)=>{
        });
    }

    const SharePic = [
    "https://img.xc65.cn/uploads/read/20180731171728_5532.png",
    "https://img.xc65.cn/uploads/read/20180731171759_5174.png",
    "https://img.xc65.cn/uploads/read/20180731171822_1714.png",
    "https://img.xc65.cn/uploads/read/20180731171845_5383.png",
    "https://img.xc65.cn/uploads/read/20180731171901_8591.png",
    "https://img.xc65.cn/uploads/read/20180731171926_7645.png",
    "https://img.xc65.cn/uploads/read/20180731171945_5130.png",
    "https://img.xc65.cn/uploads/read/20180731171958_1056.png",
    "https://img.xc65.cn/uploads/read/20180731172008_8888.png"]

    const ShareWord = [
        "吃瓜瓜瓜连连连",
        "吃瓜连连线，姐款游戏藕在王",
        "帮我点一下，这关我过不去了",
        "快！抬我一手，我连不上了",
        "我离拥有皮肤就差100金币了，帮我点一下",
        "我还是个孩子啊！！死活过不了关啊！",
        "嘤嘤嘤，帮人家点一下嘛",
        "帮我点一下，大不了，你想怎么样都行嘛@",
        "你不点我不点，和谐社会怎构建？",
        "你也连我也连，美好世界看得见!"
    ]

    const getShareContent = function(){
        let pic = SharePic[parseInt(Math.random()*9)];
        let word = ShareWord[parseInt(Math.random()*10)];

        return {
            pic,
            word
        }
    }

    let videoAdInstance1 = null;

    const showVedioAd1 =function(openid,addNum,callback1,callback){
        if(!videoAdInstance1){
            videoAdInstance1 = wx.createRewardedVideoAd({
                adUnitId: 'adunit-594d53c872cbeef6'
            });

            videoAdInstance1.onClose((res)=>{
                if(res.isEnded){ 
                    pullRequest('addCoinByNum',{openid , addNum},(res)=>{
                        if(res.code == 1){
                            callback(res);

                            wx.showToast({
                                title : '领取成功',
                                icon : 'success',
                                duration : 1000,
                            })
                        }
                    },(err)=>{
                        wx.showToast({
                            title : '网络失败',
                            icon : 'loading',
                            duration : 1000,
                        })
                    },);
                }else{
                    wx.showToast({
                        title : '观看不完整',
                        icon : 'loading',
                        duration : 1000,
                    })
                }
            });
        }

        videoAdInstance1.load() 
        .then(() => {
            videoAdInstance1.show();
            callback1();                
        })
        .catch((err) => {
             wx.showToast({
                title : '今日已上限',
                icon : 'loading',
                duration : 1000,
                success : () => callback1()
            })
        });
    }

    /**
     * 从远程加载图片
     * @param {图片路径} imgPath
     * @param {当前节点} targetNode
     */
    const loadRemoteImage = function (imgPath, targetNode, cb) {
        if (!imgPath) return
        let type = imgPath.slice(imgPath.lastIndexOf('.') + 1) || 'png'
        cc.loader.load({url: imgPath, type: type}, function (error, texture) {
            targetNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture)
            cb && cb()
        })
    }

module.exports = {
    getOpenId : getOpenId,
    pullRequest : pullRequest,
    gridSize : gridSize,
    colorMap : colorMap,
    zoomInAction : zoomInAction,
    zoomOutAction : zoomOutAction,
    judgetWhereFrom : judgetWhereFrom,
    judgeWhoInvitesMe : judgeWhoInvitesMe,
    recordShareNum : recordShareNum,
    getShareContent :getShareContent,
    showVedioAd1,
    loadRemoteImage
}

