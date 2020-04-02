/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'easyui';
import '1i8n';
import 'assets/style/common';
import './index.scss';
import { loadProperties, calculateWH } from 'src/module/common/util';
import { initFOTATable } from 'src/module/index/FOTA';
import { initFirmwareTable } from 'src/module/index/firmware';
import { getDeviceType, getFotaList } from 'src/assets/api/index';

$(function () {
  init();
  loadProperties($);
  initTabs();
  // getDeviceType().then((res) => {
  //   console.log(res);
  // }).catch(e => {
  //   console.log(e);
  // });
});

function init () {
  if (window.parent) {
    // set parent frame nav active status
    console.log(window.parent.changeTopFrameBarStyle);
    window.parent.changeTopFrameBarStyle && window.parent.changeTopFrameBarStyle('FOTATD');
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

