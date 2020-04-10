/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'easyui';
import '1i8n';
import 'assets/style/common';
import './fota.scss';
import { loading, finish, loadProperties, mesgTip } from 'src/module/common/util';
import { store } from 'src/module/fota/common';
// import { initFirmwareTable } from 'src/module/fota/firmware';
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
