import { calculateWH, loading, finish, mesgTip, deserialization, formatDate } from '../common/util';
import {
  getDeviceType,
  InitDataGrid,
  searchClickHank,
  initSelectOptions,
  initCheckboxList, getInitParams, initSearchBox
} from './common';
import {
  getFirmwareList,
  getFirmwareInfoList,
  updateFirmware,
  creatrFirmware
} from 'src/assets/api/index';

let deviceTypeMap;

export function initFirmwareTable () {
  deviceTypeMap = getDeviceType();
  initCheckboxList(deviceTypeMap, $('#FWFormDeviceType'), 'deviceType');
  const table = $('#firmwareTable'), search = $('#firmwareSearch'), tab = $('.firmware-tab');
  // device type filter
  $('#firmwareFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    multiple: true,
    data: deviceTypeMap,
    value: deviceTypeMap[0].value,
    onChange: function (newValue, oldValue) {
      table.datagrid('load');
    }
  });
  // table
  const statusMap = ['In-Use', 'Expired'];
  const stageMap = ['Beta', 'Release', 'Specific'];
  const datagrid = new InitDataGrid(table, {
    // method: 'GET',
    singleSelect: true,
    pagination: true,
    toolbar: '#firmwareTabTool',
    columns: [[
      { field: 'firmwareVersion', title: $.i18n.prop('MESS_Firmware_Version') },
      {
        field: 'deviceType',
        title: $.i18n.prop('MESS_Device_Type'),
        formatter: function (value, row, index) {
          const map = deviceTypeMap || [];
          const res = map.filter(val => {
            if (val.value == value) {
              return val;
            }
          });
          return `<span class="">${res.label}</span>`;
        }
      },
      {
        field: 'firmwareStage',
        title: $.i18n.prop('MESS_Firmware_Stage'),
        formatter: function (value, row, index) {
          return `<span class="">${stageMap[value--]}</span>`;
        }
      },
      { field: 'fileSize', title: $.i18n.prop('MESS_File_Size') },
      { field: 'addBy', title: $.i18n.prop('MESS_Add_By') },
      { field: 'description', title: $.i18n.prop('MESS_Description') },
      {
        field: 'status',
        title: $.i18n.prop('MESS_Status'),
        formatter: function (value, row, index) {
          return `<span class="${value === 1 ? 'txt-danger' : 'txt-success'}">${statusMap[value--]}</span>`;
        }
      },
      {
        field: 'createTime',
        title: $.i18n.prop('MESS_Create_Time'),
        formatter: function (value, row, index) {
          return `<span class="">${statusMap[formatDate(value, 'yyyy-MM-dd hh:mm:ss')]}</span>`;
        }
      },
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

        firmwareVersion: 'IDD_213G01_S B2.4.3.2_True_J1939T',
        deviceType: '3',
        firmwareStage: 2,
        fileSize: 222952,
        addBy: 39124,
        description: 'IDD_213G01_S B2.4.3.2_True_J1939T',
        status: 1,
        createTime: 1585516590393,
        lastUpdateTime: 1585545445738
      },
      {
        firmwareVersion: 'IDD_213G01_S V2.5.1_True_J1708_20191030_01',
        deviceType: '3',
        firmwareStage: 2,
        fileSize: 225788,
        addBy: 39124,
        description: 'IDD_213G01_S V2.5.1_True_J1708_20191030_01',
        status: 1,
        createTime: 1585516960108,
        lastUpdateTime: 1585516960108
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
  // search box
  initSearchBox(table, $('#firmwareTabTool'));
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
    res = res.map((val) => {
      return {
        label: val,
        value: val
      };
    });
    initSelectOptions(res, $('#FWFormFirmware'), true);
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
      const row = dialog.data('row');
      Object.keys(row).forEach(val => {
        dialog.find(`[name="${val}"]`).val(row[val]);
      });
      dialog.find('form').form('validate');
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
  const deviceTypeCheckbox = form.find('[type="checkbox"][name="deviceType"]');
  console.log(deviceTypeCheckbox);
  const deviceType = [];
  deviceTypeCheckbox.each(function () {
    if (this.checked) {
      deviceType.push($(this).val());
    }
  });
  if (deviceType.length === 0) {
    mesgTip('error', {
      msg: 'Please select device type!'
    });
    return false;
  }
  if (validate) {
    const data = deserialization(form.serialize());
    console.log(data);
    console.log(row);
    data.deviceType = deviceType.join(',');
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
  const { page, rows } = params;
  const tab = $('.firmware-tab');
  const { deviceType, firmwareVersion } = getInitParams(tab);
  return getFirmwareList(deviceType, { firmwareVersion, offset: page, limit: rows }).then(res => {
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
