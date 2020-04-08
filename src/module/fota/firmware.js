import { calculateWH, loading, finish, mesgTip, deserialization, serialization, formatDate } from '../common/util';
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
const statusMap = ['In-Use', 'Expired'];
const stageMap = ['Beta', 'Release', 'Specific'];

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
  const datagrid = new InitDataGrid(table, {
    // method: 'GET',
    singleSelect: true,
    pagination: true,
    toolbar: '#firmwareTabTool',
    columns: [[
      { field: 'firmwareVersion', title: $.i18n.prop('MESS_Firmware_Version') },
      {
        field: 'deviceTypes',
        title: $.i18n.prop('MESS_Device_Type'),
        formatter: function (value, row, index) {
          const map = deviceTypeMap || [];
          let deviceTypes;
          if (value) {
            deviceTypes = value.map((val) => {
              let res;
              for (let i = 0, len = map.length; i < len; i++) {
                const item = map[i];
                if (item.value == val) {
                  res = item;
                  break;
                }
              }
              return res ? res.label : '';
            });
          }
          return deviceTypes ? deviceTypes.join(',') : '';
        }
      },
      {
        field: 'firmwareStage',
        align: 'center',
        title: $.i18n.prop('MESS_Firmware_Stage'),
        formatter: function (value, row, index) {
          return `<span class="">${stageMap[--value]}</span>`;
        }
      },
      { field: 'fileSize', title: $.i18n.prop('MESS_File_Size') },
      { field: 'addBy', title: $.i18n.prop('MESS_Add_By') },
      { field: 'description', title: $.i18n.prop('MESS_Description') },
      {
        field: 'status',
        align: 'center',
        title: $.i18n.prop('MESS_Status'),
        formatter: function (value, row, index) {
          return `<span class="${value === 1 ? 'txt-success' : 'txt-danger'}">${statusMap[--value]}</span>`;
        }
      },
      {
        field: 'createTime',
        title: $.i18n.prop('MESS_Create_Time'),
        formatter: function (value, row, index) {
          return `<span class="">${formatDate(value, 'yyyy-MM-dd hh:mm:ss')}</span>`;
        }
      },
      {
        field: 'lastUpdateTime',
        title: $.i18n.prop('MESS_Last_Update'),
        formatter: function (value, row, index) {
          return `<span class="">${formatDate(value, 'yyyy-MM-dd hh:mm:ss')}</span>`;
        }
      },
      {
        field: 'Operation',
        align: 'center',
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
  initDialogCombox(stageMap, $('#FWFormStage'));
  initDialogCombox(statusMap, $('#FWFormStatus'), 400, 60);
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
    $('#FWFormFirmware').combobox({
      width: '100%',
      panelHeight: calculateWH(150),
      editable: false,
      valueField: 'value',
      textField: 'label',
      data: res,
      value: res[0].value
    });
    // initSelectOptions(res, $('#FWFormFirmware'), true);
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: e.message || 'Get Firmware Version List: load failed'
    });
  }).finally(() => {
    finish();
  });
}

// initial firmware Dialog

function initDialogCombox (data, ele, width = 400, height = 80) {
  const dataMap = data.map((val, index) => {
    return {
      value: index + 1,
      label: val
    };
  });
  if (!ele.siblings('.combo')[0]) {
    ele.combobox({
      width: calculateWH(width),
      panelHeight: calculateWH(height),
      editable: false,
      valueField: 'value',
      textField: 'label',
      data: dataMap,
      value: dataMap[0].value
    });
  }
}

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
      initFirmwareInfo(null, dialog);
    } else {
      dialog.find('.c-form-group').filter('[data-scope="edit"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('enableValidation');
      }).show();
      title = $.i18n.prop('MESS_Edit_Firmware');
      const row = dialog.data('row');
      initFirmwareInfo(row, dialog);
      dialog.find('form').form('validate');
    }
    dialog.dialog('setTitle', title);
  };
}

function dialogOpen (table, dialog) {
  return () => {
    const row = dialog.data('row');
  };
}

function dialogConfirmFn (table, dialog) {
  const form = dialog.find('form');
  const type = dialog.data('target');
  const row = dialog.data('row');
  const validate = form.form('validate');
  const deviceTypeCheckbox = form.find('[type="checkbox"][name="deviceType"]');
  const deviceTypes = [];
  deviceTypeCheckbox.each(function () {
    if (this.checked) {
      deviceTypes.push($(this).val());
    }
  });
  if (deviceTypes.length === 0) {
    mesgTip('error', {
      msg: 'Please select device type!'
    });
    return false;
  }
  if (validate) {
    const data = deserialization(serialization(form));
    data.deviceType = deviceTypes.join(',');
    const { deviceType, firmwareStage, description, addBy, firmwareVersion, status, firmwareList: firmware } = Object.assign({}, row, data);
    let promise;
    if (type.indexOf('operate') !== -1) {
      promise = updateHandle(firmwareVersion, {
        deviceType,
        firmwareStage,
        description,
        deviceTypes: deviceType,
        firmware,
        status
      });
    } else {
      promise = createHandle({
        firmwareVersion,
        deviceTypes: deviceType,
        firmwareStage,
        description,
        firmware
      });
    }
    loading();
    promise.then(() => {
      dialog.dialog('close');
      table.datagrid('load');
    }).catch(e => {
      console.log(e);
      mesgTip('error', {
        msg: e.message || 'Operate failed!'
      });
    }).finally(() => {
      finish();
    });
  }
}

function dialogClose (table, dialog) {
  return () => {
    const form = dialog.find('form');
    form[0].reset();
    form.find('.c-input-text').val('');
    dialog.find(`[type="checkbox"][name="deviceType"]`).prop('checked', false);
    form.find('[comboname]').each(function () {
      $(this).combobox('clear');
    });
  };
}

function expireConfirmFn (table, dialog) {

}

function loadData (params, success, error) {
  const { page, rows } = params;
  const tab = $('.firmware-tab');
  const { deviceType, firmwareVersion } = getInitParams(tab);
  return getFirmwareList(deviceType, { firmwareVersion, offset: page, limit: rows }).then(res => {
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
      if (!$('#FWFormFirmware').siblings('.combo')[0]) {
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
    if (!$('#FWFormFirmware').siblings('.combo')[0]) {
      initFirmwareVList().then(res => {
        $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
      });
    } else {
      $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
    }
  });
}

function updateHandle (fwVersion, params) {
  return updateFirmware(fwVersion, params).then(res => {
    mesgTip('success', {
      msg: 'Update Firmware successful'
    });
  });
}

function createHandle (params) {
  return creatrFirmware(params).then(res => {
    mesgTip('success', {
      msg: 'Create Firmware successful'
    });
  });
}

function initFirmwareInfo (row, dialog) {
  if (!row) {
    dialog.find('[comboname]').each(function () {
      const combo = $(this);
      const option = combo.combobox('options');
      combo.combobox('setValue', option.value);
    });
  } else {
    Object.keys(row).forEach(val => {
      dialog.find(`[name="${val}"]`).val(row[val]);
      const combox = dialog.find(`[comboname="${val}"]`);
      if (combox[0]) {
        const option = combox.combobox('options');
        const value = row[val] || option.value;
        combox.combobox('setValue', value);
      }
    });
    const { deviceTypes } = row;
    if (deviceTypes) {
      deviceTypes.forEach((val) => {
        const checkbox = dialog.find(`[type="checkbox"][value="${val}"]`)[0];
        if (checkbox) {
          checkbox.checked = true;
        }
      });
    }
    const firmware = dialog.find(`[comboname="firmwareList"]`);
    const firmwareOption = firmware.combobox('options');
    firmware.combobox('setValue', firmwareOption.value);
  }
}
