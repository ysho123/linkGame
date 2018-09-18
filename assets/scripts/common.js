/**
    存放信息数据 
*/

let userInfo = {
    openid : '',
    skinInfo : null,
    coin : 0 ,
    sysData : null
}

let skinShopInfo = null;//初始皮肤信息为空

let gameInfo = {
    lv : '' ,
    num : '',
    gameType : 1 , //gameType = 1 普通模式  2 限时模式
    timeCoutStart : false
}

let rankInfo = {
    normalRankInfo : null,
    limitedRankInfo  : null
};

let musicOn = true;

let Advertisement = [];
let AdvertisementTimes = 0;

let button = null;

let sceneValue = 0 ; // 场景值 0 首页   1  关卡界面    2 游戏界面

let otherMiniProgramInfo = null ;

let bannerAd;

module.exports = {
    userInfo,
    gameInfo,
    rankInfo,
    musicOn : musicOn,
    Advertisement : Advertisement,
    AdvertisementTimes : AdvertisementTimes,
    button : button,
    sceneValue : sceneValue,
    skinShopInfo,
    otherMiniProgramInfo,
    bannerAd
}