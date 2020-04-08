import axios from 'axios';
// axios.defaults.withCredentials = true // 让ajax携带cookie
const whiteList = '';
export const pending = []; //  声明一个数组用于存储每个ajax请求的取消函数和ajax标识
const CancelToken = axios.CancelToken;

const DEFULT = {
  whiteList: '',
  pending: []
};

export const removePending = (config, obj) => {
  for (const p in obj) {
    const reg = new RegExp(config.url);
    if (obj[p].u === config.url + '&' + config.method && !reg.test(whiteList) && !(config.other && config.other.concurrent)) { // 当当前请求在数组中存在时执行函数体
      obj[p].f(); //  执行取消操作
      obj.splice(p, 1); //  把这条记录从数组中移除
    }
  }
};

class Axios {
  constructor () {
    this.config = DEFULT;
  }

  init (config, dConf) {
    Object.assign({}, this.config, dConf);
    const instance = axios.create(config);
    //  添加请求拦截器
    instance.interceptors.request.use(config => {
      removePending(config, this.config.pending); // 在一个ajax发送前执行一下取消操作
      config.cancelToken = new CancelToken((c) => {
        // 这里的ajax标识我是用请求地址&请求方式拼接的字符串，当然你可以选择其他的一些方式
        pending.push({ u: config.url + '&' + config.method, f: c });
        if (config.other && config.other.cancelSource) {
          config.other.cancelSource.cancel = c;
        }
      });
      return config;
    }, error => {
      return Promise.reject(error);
    });
    // 添加响应拦截器
    instance.interceptors.response.use(res => {
      removePending(res.config, pending); // 在一个ajax响应后再执行一下取消操作，把已经完成的请求从pending中移除
      return res;
    }, err => {
      if (err && err.response) {
        switch (err.response.status) {
          case 400:
            err.message = '请求错误';
            break;
          case 401:
            err.message = '未授权，请登录';
            break;

          case 403:
            err.message = '拒绝访问';
            break;

          case 404:
            err.message = `请求地址出错: ${err.response.config.url}`;
            break;

          case 408:
            err.message = '请求超时';
            break;

          case 500:
            err.message = '服务器内部错误';
            break;

          case 501:
            err.message = '服务未实现';
            break;

          case 502:
            err.message = '网关错误';
            break;

          case 503:
            err.message = '服务不可用';
            break;

          case 504:
            err.message = '网关超时';
            break;

          case 505:
            err.message = 'HTTP版本不受支持';
            break;
          default:
        }
      }
      // console.log(err.response);
      console.log(err.message);
      var errRes = {
        code: err.response ? err.response.status : err.response,
        message: err.response.data,
        typeMsg: err.message
      };
      if (err.__CANCEL__) {
        errRes.isCancel = true;
      }
      return Promise.reject(errRes); // 返回一个空对象，主要是防止控制台报错
    });

    return instance(config);
  }
}

export default new Axios();
