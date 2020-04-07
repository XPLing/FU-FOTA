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
export function loadProperties ($, langVal = 0, opt) {
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

export function loading (load = $('.c-loading'), msg = 'loading...') {
  load.addClass('active').find('.panel-loading').html(msg);
}

export function finish (load = $('.c-loading')) {
  load.removeClass('active');
}

export function mesgTip (type, opts) {
  switch (type) {
    case 'error':
      errorTip(opts);
      break;
    case 'success':
      errorTip(opts);
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
      top: '20%',
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
      top: '20%',
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
      res[item[0]] = item[1];
    });
    return res;
  } else {
    return false;
  }
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
