import { calculateWH, loading, finish } from '../common/util';
import { getRequestUrl, InitDataGrid, searchClickHank, getDeviceType } from './common';
import { getFotaListUrl, getFotaList } from 'src/assets/api/index';

let deviceTypeMap;

export function initFOTATable () {
  deviceTypeMap = getDeviceType();
  const table = $('#FOTATable'), search = $('#FOTASearch'), tab = $('.FOTA-tab');
  search.searchbox({
    width: calculateWH(280),
    searcher (value, name) {
      table.datagrid('load');
    },
    menu: '#FOTASearchMenu',
    prompt: $.i18n.prop('MESS_Input_Value')
  });
  searchClickHank(tab.find('.searchbox'), search.searchbox('menu'));
  $('#FOTAFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    data: deviceTypeMap,
    onChange: function (newValue, oldValue) {
      table.datagrid('load');
    }
  });
  const datagrid = new InitDataGrid(table, {
    method: 'GET',
    pagination: true,
    toolbar: '#FOTATabTool',
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'deviceId', title: $.i18n.prop('MESS_Device_ID') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Vehicle#Asset#') },
      { field: 'status', title: $.i18n.prop('MESS_Status') },
      { field: 'UpgradingFW', title: $.i18n.prop('MESS_UpgradingFW') },
      { field: 'CurrentFW', title: $.i18n.prop('MESS_Current_Firmware') },
      { field: 'OperatedBy', title: $.i18n.prop('MESS_OperatedBy') },
      { field: 'Last_Update', title: $.i18n.prop('MESS_Last_Update') },
      {
        field: 'Operation',
        title: $.i18n.prop('MESS_Operation'),
        formatter: function (value, row, index) {
          return `<span class="c-icon icon-reload operate" title="${$.i18n.prop('MESS_Upgrade')}" data-operate="upgrading" data-index=${index}></span>`;
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
    ],
    loader: function (params, success, error) {
      loadData(params, success, error);
    },
    onLoadSuccess: function (data) {},
    onLoadError: function () {
      console.log('error');
      // $(this).datagrid('loadData', []);
    }
  });
  addToolHandle(table);
  const tablePanel = datagrid.tablePanel;
  addOperateHandle(tablePanel, table);
  const pager = datagrid.pager;
  initPageHandle(pager, table);
  if (pager[0]) {

  }
  initFOTAUpgradeDialog(FOTAUpgradeDialogBeforeOpen, FOTAUpgradeDialogOpen, FOTAUpgradeConfirmFn);
}

// initial FOTA Upgrade Dialog
function initFOTAUpgradeDialog (beforeOpenFn, openFn, confirmFn, other) {
  const dialog = $('#FOTAUpgradeDialog');
  const opts = Object.assign({}, {
    title: 'FOTA Upgrading',
    width: calculateWH(500),
    height: calculateWH(300),
    closed: true,
    cache: false,
    modal: true,
    onBeforeOpen: beforeOpenFn(dialog),
    onOpen: openFn(dialog),
    buttons: [
      {
        text: 'Upgrade',
        handler: function () {
          confirmFn && confirmFn(dialog);
        }
      },
      {
        text: 'Cancel',
        handler: function () {
          dialog.dialog('close');
        }
      }
    ]
  }, other);
  dialog.dialog(opts);
}

function FOTAUpgradeDialogBeforeOpen (dialog) {
  return () => {
    const target = dialog.data('target');
    if (target.indexOf('operate') === -1) {
      dialog.find('.c-form-group').not('[data-scope="batch"]').hide();
    } else {
      dialog.find('.c-form-group').filter(':hidden').show();
    }
  };
}

function FOTAUpgradeDialogOpen (dialog) {
  return () => {
    const row = dialog.data('row');
    console.log(row);
  };
}

function FOTAUpgradeConfirmFn (dialog) {

}

function loadData (params, success, error) {
  const tab = $('.FOTA-tab');
  const requestUrl = getRequestUrl(getFotaListUrl, tab);
  return getFotaList(requestUrl).then(res => {
    console.log(res);
    success(res);
  }).catch(e => {
    console.log(e);
    error();
  });
}

function addOperateHandle (tablePanel, table) {
  if (!tablePanel[0]) {
    return false;
  }
  tablePanel.on('click', '[data-operate]', function () {
    const $this = $(this), type = $this.data('operate');
    if (type === 'upgrading') {
      const row = table.datagrid('getRows')[$this.data('index')];
      $('#FOTAUpgradeDialog').data({ row: row, target: this.className }).dialog('open');
    }
  });
}

function initPageHandle (pager, table) {
  if (!pager[0]) {
    return false;
  }
}

function addToolHandle (table) {
  const $this = $(this);
  $('.batch-upgrade').on('click', function () {
    const row = table.datagrid('getChecked');
    if (!row || !row.length) {
      $.messager.alert('Warning', $.i18n.prop('MESS_CheckMultiple_ErrorMsg'));
      return false;
    }
    $('#FOTAUpgradeDialog').data({ row: row, target: $this.attr('class') }).dialog('open');
  });
}
