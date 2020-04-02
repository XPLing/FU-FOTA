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

export class InitDataGrid {
  constructor (table, opt) {
    this.id = InitDataGrid.COLLECTIONID;
    this.table = table;
    table.data('gridId', this.id);
    this.opts = Object.assign({}, {}, opt);
    const tablePanel = table.datagrid(this.opts);
    this.tablePanel = tablePanel.datagrid('getPanel');
    this.collection(this);
  }

  collection (target) {
    InitDataGrid.COLLECTION.push(target);
    InitDataGrid.COLLECTIONID++;
  }

  getCollection (id) {
    return InitDataGrid.COLLECTION.filter(val => val.id === id);
  }
}

InitDataGrid.COLLECTION = [];
InitDataGrid.COLLECTIONID = 1;
