import { calculateWH, loading, finish, mesgTip, deserialization, formatDate } from '../common/util';
import { getRequestUrl, InitDataGrid, searchClickHank, getDeviceType, initSelectOptions } from './common';
import { getFotaListUrl, getFotaList, getFirmwareInfoList, upgradeFota } from 'src/assets/api/index';

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
  const statusMap = ['Beta', 'Release', 'Specific'];
  const datagrid = new InitDataGrid(table, {
    // method: 'GET',
    pagination: true,
    toolbar: '#FOTATabTool',
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'devId', title: $.i18n.prop('MESS_Device_ID') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Vehicle#Asset#') },
      {
        field: 'status',
        title: $.i18n.prop('MESS_Status'),
        formatter: function (value, row, index) {
          return `<span class="">${statusMap[value--]}</span>`;
        }
      },
      { field: 'upgradingFirmware', title: $.i18n.prop('MESS_UpgradingFW') },
      { field: 'currentFirmware', title: $.i18n.prop('MESS_Current_Firmware') },
      { field: 'operatedBy', title: $.i18n.prop('MESS_OperatedBy') },
      {
        field: 'lastUpdateTime',
        title: $.i18n.prop('MESS_Last_Update'),
        formatter: function (value, row, index) {
          return `<span class="">${statusMap[formatDate(value, 'yyyy-MM-dd hh:mm:ss')]}</span>`;
        }
      },
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
        devId: '213GL2016004769jl',
        upgradingFirmware: 'IDD_213G01_S V2.5.1_True_J1708_20191030_01',
        messageCount: 225788,
        messageIndex: 0,
        status: 0,
        operatedBy: 39124,
        lastUpdateTime: 1585517040506
      },
      {
        devId: '213GL2016004579jl',
        upgradingFirmware: 'IDD_213G01_S V2.5.1_True_J1708_20191030_01',
        messageCount: 225788,
        messageIndex: 0,
        status: 0,
        operatedBy: 39124,
        lastUpdateTime: 1585517040956
      }
    ]
    // loader: function (params, success, error) {
    //   // loadData(params, success, error);
    // },
    // onLoadSuccess: function (data) {},
    // onLoadError: function () {
    //   console.log('error');
    //   // $(this).datagrid('loadData', []);
    // }
  });
  addToolHandle(table);
  const tablePanel = datagrid.tablePanel;
  addOperateHandle(tablePanel, table);
  initFOTAUpgradeDialog(table, FOTAUpgradeDialogBeforeOpen, FOTAUpgradeDialogOpen, FOTAUpgradeConfirmFn, {
    onClose: dialogClose
  });
}

function initFirmwareVList () {
  loading();
  return getFirmwareInfoList().then(res => {
    if (!res) {
      return false;
    }
    initSelectOptions(res, $('#FTAFormNewFW'), true);
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: 'Get Firmware Version List: load failed'
    });
  }).finally(() => {
    finish();
  });
}

// initial FOTA Upgrade Dialog
function initFOTAUpgradeDialog (table, beforeOpenFn, openFn, confirmFn, other) {
  const dialog = $('#FOTAUpgradeDialog');
  dialog.find('form').form();
  if (other) {
    Object.keys(other).forEach(key => {
      if (Object.prototype.toString.apply(other[key]).indexOf('Function') !== -1) {
        other[key] = other[key](table, dialog);
      }
    });
  }
  const opts = Object.assign({}, {
    title: 'FOTA Upgrading',
    width: calculateWH(500),
    height: calculateWH(300),
    closed: true,
    cache: false,
    modal: true,
    onBeforeOpen: beforeOpenFn(table, dialog),
    onOpen: openFn(table, dialog),
    buttons: [
      {
        text: 'Upgrade',
        handler: function () {
          confirmFn && confirmFn(table, dialog);
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

function FOTAUpgradeDialogBeforeOpen (table, dialog) {
  return () => {
    const target = dialog.data('target');
    if (target.indexOf('operate') === -1) {
      dialog.find('.c-form-group').not('[data-scope="batch"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('disableValidation');
      }).hide();
    } else {
      dialog.find('.c-form-group').not('[data-scope="batch"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('enableValidation');
      }).show();
      const row = dialog.data('row')[0];
      Object.keys(row).forEach(val => {
        dialog.find(`[name="${val}"]`).val(row[val]);
      });
      dialog.find('form').form('validate');
    }
  };
}

function FOTAUpgradeDialogOpen (table, dialog) {
  return () => {
    const row = dialog.data('row');
    console.log(row);
  };
}

function FOTAUpgradeConfirmFn (table, dialog) {
  const form = dialog.find('form');
  const type = dialog.data('target');
  const row = dialog.data('row');
  const validate = form.form('validate');
  if (validate) {
    const data = deserialization(form.serialize());
    console.log(data);
    console.log(row);
    row.forEach(val => {
      val = Object.assign({}, val, data);
    });
    console.log(row);
    // upgrade(row).then(() => {
    //   dialog.dialog('close');
    //   table.datagrid('load');
    // });
  }
}

function dialogClose (table, dialog) {
  return () => {
    const form = dialog.find('form');
    form[0].reset();
  };
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
      initDialogFirmwareVList([row], this);
    }
  });
}

function addToolHandle (table) {
  const $this = $(this);
  $('.batch-upgrade').on('click', function () {
    const row = table.datagrid('getChecked');
    if (!row || !row.length) {
      $.messager.alert('Warning', $.i18n.prop('MESS_CheckMultiple_ErrorMsg'));
      return false;
    }
    initDialogFirmwareVList(row, this);
  });
}

function initDialogFirmwareVList (row, _this) {
  if (!$('#FTAFormNewFW').children('option').length) {
    initFirmwareVList().then(res => {
      $('#FOTAUpgradeDialog').data({ row: row, target: _this.className }).dialog('open');
    });
  } else {
    $('#FOTAUpgradeDialog').data({ row: row, target: _this.className }).dialog('open');
  }
}

function upgrade (params) {
  return upgradeFota(params);
}

function batchUpgrade () {

}
