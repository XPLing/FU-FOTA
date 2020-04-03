/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'easyui';
import '1i8n';
import 'assets/style/common';
import './fota.scss';
import { loading, finish, loadProperties, mesgTip } from 'src/module/common/util';
import { initFOTATable } from 'src/module/fota/FOTA';
import { store } from 'src/module/fota/common';
import { initFirmwareTable } from 'src/module/fota/firmware';
import { getDeviceType, getFotaList } from 'src/assets/api/index';

$(function () {
  init();
  loadProperties($);
  loading();
  getDeviceType().then((res) => {
    store.deviceType = res;
    initTabs();
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: $.i18n.prop('MESS_DeviceType_errorMsg')
    });
  }).finally(() => {
    finish();
  });

});

function init () {
  if (window.parent) {
    // set parent frame nav active status
    // console.log(window.parent.changeTopFrameBarStyle);
    // window.parent.changeTopFrameBarStyle && window.parent.changeTopFrameBarStyle('FOTATD');
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
            initFOTATable();
            break;
          case 1: // firmware
            initFirmwareTable();
            break;
        }
      }
    }
  });
}

