/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'easyui';
import '1i8n';
import 'assets/style/base';
import './index.scss';
import { loadProperties } from 'src/module/common/util';

$(function () {
  init();
  loadProperties($);
  // initial tab
  $('#FOTATabs').tabs({});
  initFOTATable();

});

function init () {
  if (window.parent) {
    // set parent frame nav active status
    console.log(window.parent.changeTopFrameBarStyle);
    window.parent.changeTopFrameBarStyle && window.parent.changeTopFrameBarStyle('FOTATD');
  }
}

function initFOTATable () {
  const FOTATable = $('#FOTATable');
  $('#FOTASearch').searchbox({
    width: 300,
    searcher (value, name) {
      console.log(value + ',' + name);
    },
    menu: '#FOTASearchMenu',
    prompt: 'Please Input Value'
  });
  const FOTATablePanel = FOTATable.datagrid({
    // toolbar: '#FOTATabTool',
    toolbar: [
      {
        iconCls: 'icon-reload batch-upgrade',
        text: 'Batch Upgrade',
        handler: function () {}
      }
    ],
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'deviceId', title: $.i18n.prop('MESS_Device_ID') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Vehicle#Asset#') },
      { field: 'status', title: $.i18n.prop('MESS_SubTap_Status') },
      { field: 'UpgradingFW', title: $.i18n.prop('MESS_UpgradingFW') },
      { field: 'CurrentFW', title: $.i18n.prop('MESS_CurrentFW') },
      { field: 'OperatedBy', title: $.i18n.prop('MESS_OperatedBy') },
      { field: 'Last_Update', title: $.i18n.prop('MESS_Last_Update') },
      {
        field: 'Operation',
        title: $.i18n.prop('MESS_Operation'),
        formatter: function (value, row, index) {
          return `<span class="c-icon icon-reload operate" data-operate="upgrading" data-index=${index}></span>`;
        }
      }
    ]],
    data: [
      {
        companyName: 'value11',
        deviceId: 'value12',
        VehicleAsset: 12,
        UpgradingFW: 22,
        CurrentFW: 20,
        status: '85%Or300/475',
        OperatedBy: 'Brett',
        Last_Update: '2020-03-16T16:30:00Z',
        Operation: '123'
      },
      {
        companyName: 'value11',
        deviceId: 'value12',
        VehicleAsset: 12,
        UpgradingFW: 23,
        status: '85%Or300/475',
        OperatedBy: 'Brett',
        Last_Update: '2020-03-16T16:30:00Z'
      }
    ]
  }).datagrid('getPanel');
  if (FOTATablePanel[0]) {
    FOTATablePanel.on('click', '[data-operate]', function () {
      const $this = $(this), type = $this.data('operate');
      if (type === 'upgrading') {
        const row = FOTATable.datagrid('getRows')[$this.data('index')];
        $('#FOTAUpgradeDialog').data('row', row).dialog('open');
      }
    });
  }
  initFOTAUpgradeDialog(FOTAUpgradeDialogOpen);
}

// initial FOTA Upgrade Dialog
function initFOTAUpgradeDialog (openFn, other) {
  const dialog = $('#FOTAUpgradeDialog');
  const opts = Object.assign({}, {
    title: 'FOTA Upgrading',
    width: 400,
    height: 200,
    closed: true,
    cache: false,
    modal: true,
    onOpen: openFn(dialog)
  }, other);
  dialog.dialog(opts);
}

function FOTAUpgradeDialogOpen (dialog) {
  return () => {
    const row = dialog.data('row');
    console.log(row);
  };
}
