/**
 * Created by XPL on 2020/3/31.
 */

import { languageMap, languageConfig } from './config';

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
    callback: function () {}
  }, opt);
  $.i18n.properties(opts);
}

/**
 * setLocaleTo
 * @param $ jquery
 * @param langVal 语言值
 * @param opt 其他i18n配置
 */
export function setLocaleTo ($, langVal, opt) {
  loadProperties($, langVal, opt);
  $('.translate').each(function () {
    var args = [], $this = $(this);
    console.log(this);
    // if ($this.data('args'))
    //   args = $this.data('args').split(',');
    // $this.html($.i18n.prop(args[0]));
  });
}
