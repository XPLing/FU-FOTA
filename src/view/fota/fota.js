/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'easyui';
import '1i8n';
import 'assets/style/common';
import './fota.scss';
import 'src/module/plugin/easyui';
import { loading, finish, loadProperties, toHTML } from 'src/module/common/util';
import { store } from 'src/module/fota/common';
import { getDeviceType } from 'src/assets/api/index';

let systemLanguage = 0;
$(function () {
  init();
  loadProperties(systemLanguage);
  loading();
  getDeviceType().then((res) => {
    store.deviceType = res;
    initTabs();
  }).catch(e => {
    console.log(e);
    // mesgTip('error', {
    //   msg: $.i18n.prop('MESS_DeviceType_errorMsg')
    // });
    finish();
  });

});

function init () {
  const OPTESTLan = localStorage.getItem('OPTEST_LAN');
  if (OPTESTLan) {
    systemLanguage = (~~OPTESTLan) - 1;
  }
  // rest jquery.fn.val for XXS
  var rreturn = /\r/g;
  $.fn.extend({
    val: function (value) {
      var hooks, ret, isFunction,
        elem = this[0];

      if (!arguments.length) {
        if (elem) {
          hooks = $.valHooks[elem.type] ||
            $.valHooks[elem.nodeName.toLowerCase()];

          if (
            hooks &&
            'get' in hooks &&
            (ret = hooks.get(elem, 'value')) !== undefined
          ) {
            return ret;
          }

          ret = elem.value;

          return typeof ret === 'string' ? ret.replace(rreturn, '') : ret == null ? '' : ret;
        }

        return;
      }

      isFunction = $.isFunction(value);

      return this.each(function (i) {
        var val;

        if (this.nodeType !== 1) {
          return;
        }

        if (isFunction) {
          val = value.call(this, i, $(this).val());
        } else {
          val = value;
        }

        // Treat null/undefined as ""; convert numbers to string
        if (val == null) {
          val = '';
        } else if (typeof val === 'number') {
          val += '';
        } else if ($.isArray(val)) {
          val = $.map(val, function (value) {
            return value == null ? '' : value + '';
          });
        }

        hooks = $.valHooks[this.type] || $.valHooks[this.nodeName.toLowerCase()];

        // If set returns undefined, fall back to normal setting
        if (!hooks || !('set' in hooks) || hooks.set(this, val, 'value') === undefined) {
          this.value = toHTML(val);
        }
      });
    }
  });
}

function initTabs () {
  // initial tab
  const FOTATabs = $('#FOTATabs');
  FOTATabs.tabs({
    onSelect: function (title, index) {
      const tab = FOTATabs.tabs('getTab', index);
      const isFirst = tab.data('first');
      if (isFirst != 1) {
        tab.data('first', 1);
        switch (index) {
          case 0: // FOTA
            loading('setOption', {
              opacity: 1
            });
            import(/* webpackChunkName: "FOTAModule" */'src/module/fota/FOTA').then(({ initFOTATable }) => {
              initFOTATable();
            }).finally(e => {
              finish();
            });
            break;
          case 1: // firmware
            loading('setOption', {
              opacity: 1
            });
            import(/* webpackChunkName: "firmwareModule" */'src/module/fota/firmware').then(({ initFirmwareTable }) => {
              initFirmwareTable();
            }).finally(e => {
              finish();
            });
            break;
          default:
            finish();
            break;
        }
      }
    }
  });
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (data) {
    if (data.language) {
      systemLanguage = data.language - 1;
      loadProperties(data.language);
    }
  }
});
