/**
 * Created by XPL on 2020/3/31.
 */

import { languageMap, languageConfig, baseConfig } from './config';

function getLanguage (langVal) {
  langVal = ~~langVal;
  return languageMap[langVal] || languageMap[0];
}

/**
 * loadProperties
 * @param $ jquery
 * @param langVal 语言值
 * @param opt 其他i18n配置
 */
export function loadProperties (langVal = 0, opt) {
  const lang = getLanguage(langVal);
  const opts = Object.assign({}, {
    name: 'message',
    path: languageConfig.url,
    mode: 'map',
    language: lang,
    callback: function () {
      try {
        $('[data-trans-placeholder]').each(function () {
          let args = [];
          const $this = $(this);
          if ($this.data('trans-placeholder')) {
            args = $this.data('trans-placeholder').split(',');
            const text = $.i18n.prop(args[0]);
            $this.attr('placeholder', text);
          }
        });
        $('[data-trans-text]').each(function () {
          let args = [];
          const $this = $(this);
          if ($this.data('trans-text')) {
            args = $this.data('trans-text').split(',');
            const text = $.i18n.prop(args[0]);
            $this.html(text);
          }
        });
        $('[data-trans-value]').each(function () {
          let args = [];
          const $this = $(this);
          if ($this.data('trans-value')) {
            args = $this.data('trans-value').split(',');
            const text = $.i18n.prop(args[0]);
            $this.val(text);
          }
        });
      } catch (e) {
        console.log(e);
      }
    }
  }, opt);
  $.i18n.properties(opts);
}

export function calculateWH (num) {
  var windowW = parseInt(window.outerWidth || window.innerWidth || window.screen.width);
  windowW = windowW > 1550 ? 1550 / 10 : windowW / 10;
  return num / baseConfig.originWidth * windowW;
}

class Loading {
  constructor (ele, opts) {
    this.options = Object.assign({}, new.target.DEFAULT, opts);
    this.$ele = ele;
    this.init();
  }

  init () {
    this.$ele.data('load-id', Loading.COLLECTORINDEX);
    this.putData(this);
  }

  setOption (opts) {
    this.options = Object.assign({}, this.options, opts);
  }

  show () {
    const style = {
      'background-color': `rgba(${colorRgb(this.options.bgColor)},${this.options.opacity})`
    };
    if (this.options.opacity === 1) {
      style.top = this.options.top;
    }
    if (this.options.msg) {
      this.$ele.find('.panel-loading').html(this.options.msg);
    }
    this.$ele.addClass('active').css(style);
  }

  hide () {
    this.options.opacity = Loading.DEFAULT.opacity;
    this.options.msg = Loading.DEFAULT.msg;
    const style = {
      'background-color': `rgba(${colorRgb(this.options.bgColor)},${Loading.DEFAULT.opacity})`,
      top: 0
    };
    this.$ele.removeClass('active').css(style);
  }

  dispatch (event, ...arg) {
    this[event](...arg);
  }

  getData () {
    const id = this.$ele.data('load-id');
    let data;
    for (let i = 0, len = Loading.COLLECTOR.length; i < len; i++) {
      const item = Loading.COLLECTOR[i];
      if (item.id === id) {
        data = item;
        break;
      }
    }
    return data;
  }

  putData (instance) {
    Loading.COLLECTOR.push({
      id: Loading.COLLECTORINDEX,
      data: instance
    });
    Loading.COLLECTORINDEX++;
  }
}

Loading.DEFAULT = {
  ele: $('.c-loading'),
  opacity: 0.5,
  bgColor: '#fff',
  top: '33px',
  msg: 'loading<em class="c-dot"></em>'
};
Loading.COLLECTOR = [];
Loading.COLLECTORINDEX = 1;
Loading.INIT = (ele, opts) => {
  let hasInstance = Loading.GETDATA(ele, opts);
  if (!hasInstance) {
    hasInstance = new Loading(ele, opts);
  } else {
    if (Object.prototype.toString.apply(ele).indexOf('String') !== -1) {
      hasInstance.dispatch(ele, opts);
    }
  }
  return hasInstance;
};
Loading.GETDATA = (ele, opts) => {
  if (!(ele instanceof $)) {
    ele = (opts && opts.ele) || Loading.DEFAULT.ele;
  }
  const id = ele.data('load-id');
  let data;
  for (let i = 0, len = Loading.COLLECTOR.length; i < len; i++) {
    const item = Loading.COLLECTOR[i];
    if (item.id === id) {
      data = item;
      break;
    }
  }
  return data && data.data;
};

export function loading (load = $('.c-loading'), ...arg) {
  const instance = Loading.INIT(load, ...arg);
  instance.show();
}

export function finish (load = $('.c-loading'), ...arg) {
  const instance = Loading.INIT(load, ...arg);
  instance.hide();
}

export function mesgTip (type, opts) {
  switch (type) {
    case 'error':
      errorTip(opts);
      break;
    case 'success':
      successTip(opts);
      break;
  }
}

function errorTip (opts) {
  opts = Object.assign({}, {
    title: 'Error',
    msg: 'System has no response.',
    timeout: 1500,
    showType: 'fade',
    style: {
      right: '',
      bottom: ''
    }
  }, opts);
  $.messager.show(opts);
}

function successTip (opts) {
  opts = Object.assign({}, {
    title: 'Message',
    msg: 'Modify successful.',
    timeout: 1000,
    showType: 'fade',
    style: {
      right: '',
      bottom: ''
    }
  }, opts);
  $.messager.show(opts);
}

export function deserialization (data) {
  const res = {};
  data = data.split('&');
  if (data && data.length) {
    data.forEach(val => {
      const item = val.split('=');
      res[decodeURIComponent(item[0])] = decodeURIComponent(item[1]);
    });
    return res;
  } else {
    return false;
  }
}

export function serialization (form) {
  return form.serialize().replace(/\+/g, ' ');
}

export function formatDate (timeStamp, fmt) {
  if (!timeStamp) {
    return '';
  }
  var time = new Date(timeStamp);
  var y, m, d, h, min, second, result;
  y = time.getFullYear();
  m = time.getMonth() + 1;
  d = time.getDate();
  h = time.getHours();
  min = time.getMinutes();
  second = time.getSeconds();

  var res;
  if (/(y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (y + '').substr(4 - RegExp.$1.length));
  }

  var o = {
    'M+': time.getMonth() + 1,
    'd+': time.getDate(),
    'h+': time.getHours(),
    'm+': time.getMinutes(),
    's+': time.getSeconds()
  };
  for (var k in o) {
    var reg = new RegExp('(' + k + ')');
    if (reg.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? o[k] : padLeftZero((o[k] + '')));
    }

  }
  return fmt;
}

function padLeftZero (str) {
  return ('00' + str).substr(str.length);
}

export function ellipsis (str, limit) {
  if (str && (str.length > limit)) {
    str = `${str.substr(0, limit)}...`;
  }
  return str;
}

// HTML 转字符串
export function toTXT (str) {
  if (!str || typeof str !== 'string') {
    return str;
  }
  // var RexStr = /\<|\>|\/|\\|\&|　| /g;
  // eslint-disable-next-line no-useless-escape
  var RexStr = /\<|\>|/g;
  str = str.replace(RexStr,
    function (MatchStr) {
      switch (MatchStr) {
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case '\'':
          return '&#39;';
        case '&':
          return '&amp;';
        case '/':
          return '&frasl;';
        case ' ':
          return '&ensp;';
        case '　':
          return '&emsp;';
        default:
          return '';
      }
    }
  );
  return str;
}

// HTML 转字符串
export function toHTML (str) {
  if (!str || typeof str !== 'string') {
    return str;
  }
  // var RexStr = /\<|\>|\/|\\|\&|　| /g;
  // eslint-disable-next-line no-useless-escape
  var RexStr = /&lt;|&gt;|&amp;|&ensp;|&emsp;|/g;
  str = str.replace(RexStr,
    function (MatchStr) {
      switch (MatchStr) {
        case '&lt;':
          return '<';
        case '&gt;':
          return '>';
        case '&quot;':
          return '"';
        case '&#39;':
          return '\'';
        case '&amp;':
          return '&';
        case '&ensp;':
          return ' ';
        case '&emsp;':
          return '　';
        case '&frasl;':
          return '/';
        default:
          return '';
      }
    }
  );
  return str;
}

// 16进制转换为RGB
function colorRgb (str) {
  // 16进制颜色值的正则
  var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
  // 把颜色值变成小写
  var color = str.toLowerCase();
  if (reg.test(color)) {
    // 如果只有三位的值，需变成六位，如：#fff => #ffffff
    if (color.length === 4) {
      var colorNew = '#';
      for (let i = 1; i < 4; i += 1) {
        colorNew += color.slice(i, i + 1).concat(color.slice(i, i + 1));
      }
      color = colorNew;
    }
    // 处理六位的颜色值，转为RGB
    var colorChange = [];
    for (let i = 1; i < 7; i += 2) {
      colorChange.push(parseInt('0x' + color.slice(i, i + 2)));
    }
    return colorChange.join(',');
  } else {
    return color;
  }
}

// 校验对象的类型
export function isType (target, type) {
  if (type) {
    type = type.toLocaleLowerCase();
  }
  return Object.prototype.toString.apply(target).toLocaleLowerCase().indexOf(type) !== -1;
}

// 文件大小格式化
export function formatSize (bytes) {
  var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (!bytes) return 0;
  var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
};

export function download (url) {
  let iframe = document.createElement('iframe');
  iframe.style.display = 'none';
  iframe.src = url;
  document.body.appendChild(iframe);
  iframe.onload = function () {
    document.body.removeChild(iframe);
    iframe = null;
  };
}
