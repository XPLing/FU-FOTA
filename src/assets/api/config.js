/**
 * Created by XPL on 2018/3/20.
 */

const testing = process.env.NODE_ENV === 'production_testing';
export let commonParams = {};
export let options = {
    param: 'jsonpCallback'
};

export let removePending = (config, obj) => {
    for (let p in obj) {
        if (obj[p].u === config.url + '&' + config.method) { // 当当前请求在数组中存在时执行函数体
            obj[p].f(); //  执行取消操作
            obj.splice(p, 1); //  把这条记录从数组中移除
        }
    }
};

export const ERR_OK = 200;
export const ERR_LOGINAGAIN = 401;
export const ERR_OK_STR = 'ok';
export const REQUEST_PREFIX = testing ? 'https://server.dev.eeidm.com/api' : 'https://server.eeidm.com/api';

export let thirdParty = {
    wechat: {
        url: 'https://open.weixin.qq.com/connect/qrconnect',
        webUrl: 'https://open.weixin.qq.com/connect/oauth2/authorize',
        reUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        webReUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        appId: 'wxb7044f7a7d3f8a78', // wxef3355d78cfc7a3d
        devAppId: 'wxb7044f7a7d3f8a78', // "wxa6b9e9095db32224"
        devUri: 'http://open.dev.tech2real.com/m-web/user/mobilebind',
        uri: 'http://open.tech2real.com/m-web/user/mobilebind',
        devBindUri: 'http://open.dev.tech2real.com/m-web/me/setting/safety/bindMobile',
        bindUri: 'http://open.tech2real.com/m-web/me/setting/safety/bindMobile'
    },
    qq: {
        url: 'https://graph.qq.com/oauth2.0/authorize',
        webUrl: 'https://graph.qq.com/moc2/authorize',
        reUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        webReUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        devAppId: '101367357',
        appId: '101367357',
        devUri: 'http://open.dev.tech2real.com/m-web/user/mobilebind',
        uri: 'http://open.tech2real.com/m-web/user/mobilebind',
        devBindUri: 'http://open.dev.tech2real.com/m-web/me/setting/safety/bindMobile',
        bindUri: 'http://open.tech2real.com/m-web/me/setting/safety/bindMobile'
    },
    weibo: {
        url: 'https://api.weibo.com/oauth2/authorize',
        webUrl: 'https://open.weibo.cn/oauth2/authorize',
        reUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        webReUrl: 'https://api.weixin.qq.com/sns/oauth2/refresh_token',
        devAppId: '182034898',
        appId: '182034898',
        devUri: 'http://weibo.tech2real.com/m-web/user/mobilebind',
        uri: 'http://weibo.tech2real.com/m-web/user/mobilebind',
        devBindUri: 'http://weibo.tech2real.com/m-web/me/setting/safety/bindMobile',
        bindUri: 'http://open.tech2real.com/m-web/me/setting/safety/bindMobile'
    }
};
export let share = {
    appUrl: 'https://open.dev.tech2real.com/m-web/',
    appDevUrl: 'https://open.dev.tech2real.com/m-web/',
    title: '硬见|智慧连接硬件创新', // 分享标题
    desc: '硬见|智慧连接硬件创新', // 分享理由
    summary: '硬见|智慧连接硬件创新', // 分享描述
    cover: 'https://dn-funnymeet.qbox.me/FucweAr6nX1IOpWpBz4nJMbugmHE?e=1803029570&token=u0R-dgswbXXA1PMGqJlkEIo8pc_iWtp5OuM67d94:XUF4SCL1atopTWdsDM639V8Kv04=', // 分享封面
    source: '硬见' // 分享来源
};
export let storageVTime = {
    orderInfo: 1 * 60 * 60 * 1000
};
