import { calculateWH, loading, finish, mesgTip, deserialization } from '../common/util';
import {
  getDeviceType,
  getRequestUrl,
  InitDataGrid,
  searchClickHank,
  initSelectOptions,
  initCheckboxList
} from './common';
import {
  getFirmwareUrl,
  getFirmwareList,
  getFirmwareInfoList,
  updateFirmware,
  creatrFirmware
} from 'src/assets/api/index';

let deviceTypeMap;

export function initFirmwareTable () {
  deviceTypeMap = getDeviceType();
  initCheckboxList(deviceTypeMap, $('#FTAFormDeviceType'), 'deviceType');
  const table = $('#firmwareTable'), search = $('#firmwareSearch'), tab = $('.firmware-tab');
  // search box
  search.searchbox({
    width: calculateWH(280),
    searcher (value, name) {
      table.datagrid('load');
    },
    menu: '#firmwareSearchMenu',
    prompt: $.i18n.prop('MESS_Input_Value')
  });
  searchClickHank(tab.find('.searchbox'), search.searchbox('menu'));
  // device type filter
  $('#firmwareFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    multiple: true,
    data: deviceTypeMap,
    onChange: function (newValue, oldValue) {
      table.datagrid('load');
    }
  });
  // table
  const datagrid = new InitDataGrid(table, {
    // method: 'GET',
    pagination: true,
    toolbar: '#firmwareTabTool',
    columns: [[
      { field: 'companyName', title: $.i18n.prop('MESS_Firmware') },
      { field: 'deviceId', title: $.i18n.prop('MESS_Device_Type') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Firmware_Stage') },
      { field: 'UpgradingFW', title: $.i18n.prop('MESS_File_Size') },
      { field: 'CurrentFW', title: $.i18n.prop('MESS_Add_By') },
      { field: 'OperatedBy', title: $.i18n.prop('MESS_Description') },
      { field: 'status', title: $.i18n.prop('MESS_Status') },
      { field: 'Create_Time', title: $.i18n.prop('MESS_Create_Time') },
      { field: 'Last_Update', title: $.i18n.prop('MESS_Last_Update') },
      {
        field: 'Operation',
        title: $.i18n.prop('MESS_Operation'),
        formatter: function (value, row, index) {
          return `<p class="operation-tool">
                    <span class="c-icon icon-edit operate" title="${$.i18n.prop('MESS_Firmware_Edit')}" data-operate="edit" data-index=${index}></span>
                    <span class="c-icon icon-download operate" title="${$.i18n.prop('MESS_Firmware_Download')}" data-operate="download" data-index=${index}></span>
                    <span class="c-icon icon-time operate" title="${$.i18n.prop('MESS_Firmware_EditExpireDate')}" data-operate="expire" data-index=${index}></span>
                  </p>`;
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
    // loader: function (params, success, error) {
    //   loadData(params, success, error);
    // },
    // onLoadSuccess: function (data) {},
    // onLoadError: function () {
    //   console.log('error');
    //   // $(this).datagrid('loadData', []);
    // }
  });
  addToolHandle(table);
  const tablePanel = datagrid.tablePanel;
  if (tablePanel[0]) {
    addOperateHandle(tablePanel, table);
  }
  initDialog(table, dialogBeforeOpen, dialogOpen, dialogConfirmFn, {
    onClose: dialogClose
  });
  initExpireDialog(table, expireConfirmFn);
}

function initFirmwareVList () {
  loading();
  return getFirmwareInfoList().then(res => {
    if (!res) {
      return false;
    }
    initSelectOptions(res, $('#firmwareName'), true);
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: 'Get Firmware Version List: load failed'
    });
  }).finally(() => {
    finish();
  });
}

// initial firmware Dialog
function initExpireDialog (table, confirmFn, other) {
  const dialog = $('#firmwareExpireDialog');
  const opts = Object.assign({}, {
    title: $.i18n.prop('MESS_Confirm'),
    width: calculateWH(300),
    height: calculateWH(150),
    closed: true,
    cache: false,
    modal: true,
    buttons: [
      {
        text: 'Ok',
        iconCls: 'icon-ok',
        handler: function () {
          confirmFn && confirmFn(table, dialog);
        }
      },
      {
        text: 'Cancel',
        iconCls: 'icon-no',
        handler: function () {
          dialog.dialog('close');
        }
      }
    ]
  }, other);
  dialog.dialog(opts);
}

function initDialog (table, beforeOpenFn, openFn, confirmFn, other) {
  const dialog = $('#firmwareDialog');
  dialog.find('form').form();
  if (other) {
    Object.keys(other).forEach(key => {
      if (Object.prototype.toString.apply(other[key]).indexOf('Function') !== -1) {
        other[key] = other[key](table, dialog);
      }
    });
  }
  const opts = Object.assign({}, {
    title: $.i18n.prop('MESS_Create_Firmware'),
    width: calculateWH(500),
    height: calculateWH(350),
    closed: true,
    cache: false,
    modal: true,
    onBeforeOpen: beforeOpenFn(table, dialog),
    onOpen: openFn(table, dialog),
    buttons: [
      {
        text: 'Submit',
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

function dialogBeforeOpen (table, dialog) {
  return () => {
    const target = dialog.data('target');
    let title;
    if (target.indexOf('operate') === -1) {
      dialog.find('.c-form-group').filter('[data-scope="edit"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('disableValidation');
      }).hide();
      title = $.i18n.prop('MESS_Create_Firmware');
    } else {
      dialog.find('.c-form-group').filter('[data-scope="edit"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('enableValidation');
      }).show();
      title = $.i18n.prop('MESS_Edit_Firmware');
    }
    dialog.dialog('setTitle', title);
  };
}

function dialogOpen (table, dialog) {
  return () => {
    const row = dialog.data('row');
    console.log(row);
  };
}

function dialogConfirmFn (table, dialog) {
  const form = dialog.find('form');
  const type = dialog.data('target');
  const row = dialog.data('row');
  const validate = form.form('validate');
  if (validate) {
    const data = deserialization(form.serialize());
    console.log(data);
    console.log(row);
    let promise;
    if (type.indexOf('operate')) {
      // promise = updateHandle()
    } else {
      // promise = createHandle();
    }
    // promise.then(() => {
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

function expireConfirmFn (table, dialog) {

}

function loadData (params, success, error) {
  const tab = $('.firmware-tab');
  const requestUrl = getRequestUrl(getFirmwareUrl, tab);
  return getFirmwareList(requestUrl).then(res => {
    console.log(res);
    success(res);
  }).catch(e => {
    console.log(e);
    error();
  });
}

function addOperateHandle (tablePanel, table) {
  tablePanel.on('click', '[data-operate]', function () {
    const $this = $(this), type = $this.data('operate');
    const row = table.datagrid('getRows')[$this.data('index')];
    if (type === 'edit') {
      if (!$('#FWFormFirmware').children('option').length) {
        initFirmwareVList().then(res => {
          $('#firmwareDialog').data({ row: row, target: this.className }).dialog('open');
        });
      } else {
        $('#firmwareDialog').data({ row: row, target: this.className }).dialog('open');
      }
    } else if (type === 'expire') {
      $('#firmwareExpireDialog').data({ row: row }).dialog('open');
    }
  });
}

function addToolHandle (table) {
  $('.firmware-new').on('click', function () {
    const $this = $(this);
    if (!$('#FWFormFirmware').children('option').length) {
      initFirmwareVList().then(res => {
        $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
      });
    } else {
      $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
    }
  });
}

function updateHandle () {
  loading();
  return updateFirmware().then(res => {
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: 'Update Firmware failed!'
    });
  }).finally(() => {
    finish();
  });
}

function createHandle () {
  loading();
  return creatrFirmware().then(res => {
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: 'Create Firmware failed!'
    });
  }).finally(() => {
    finish();
  });
}
