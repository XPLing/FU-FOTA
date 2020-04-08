import {
  calculateWH,
  loading,
  finish,
  mesgTip,
  deserialization,
  serialization,
  formatDate,
  ellipsis
} from '../common/util';
import {
  getRequestUrl,
  InitDataGrid,
  searchClickHank,
  getDeviceType,
  initSelectOptions,
  getInitParams,
  initSearchBox
} from './common';
import { getFotaListUrl, getFotaList, getFirmwareVersionList, upgradeFota } from 'src/assets/api/index';

let deviceTypeMap;
let fwVersion = true;

export function initFOTATable () {
  deviceTypeMap = getDeviceType();
  // initSelectOptions(deviceTypeMap, $('#FTAFormDeviceType'), true);
  const table = $('#FOTATable'), search = $('#FOTASearch'), tab = $('.FOTA-tab');

  $('#FOTAFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    data: deviceTypeMap,
    value: deviceTypeMap[0].value,
    onChange: async function (newValue, oldValue) {
      const res = await initFirmwareVList(newValue);
      if (res && res.length) {
        fwVersion = true;
      } else {
        fwVersion = false;
      }
      table.datagrid('load');
    }
  });
  const datagrid = new InitDataGrid(table, {
    // method: 'GET',
    pagination: true,
    toolbar: '#FOTATabTool',
    fitColumns: true,
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'devId', title: $.i18n.prop('MESS_Device_ID') },
      {
        field: 'license',
        title: $.i18n.prop('MESS_Vehicle#Asset#'),
        formatter: function (value, row, index) {
          return `<span title="${value}">${ellipsis(value, 15)}</span>`;
        }
      },
      {
        field: 'status',
        align: 'center',
        title: $.i18n.prop('MESS_Status'),
        formatter: function (value, row, index) {
          return `<span>${value === '100%' ? 'Done' : (value || '')}</span>`;
        }
      },
      { field: 'upgradingFirmware', title: $.i18n.prop('MESS_UpgradingFW') },
      { field: 'currentFirmware', title: $.i18n.prop('MESS_Current_Firmware') },
      { field: 'operatedBy', align: 'center', title: $.i18n.prop('MESS_OperatedBy') },
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
          if (fwVersion) {
            return `<span class="c-icon icon-reload operate" title="${$.i18n.prop('MESS_Upgrade')}" data-operate="upgrading" data-index=${index}></span>`;
          }
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
  initSearchBox(table, $('#FOTATabTool'));
  addToolHandle(table);
  const tablePanel = datagrid.tablePanel;
  addOperateHandle(tablePanel, table);
  initFOTAUpgradeDialog(table, FOTAUpgradeDialogBeforeOpen, FOTAUpgradeDialogOpen, FOTAUpgradeConfirmFn, {
    onClose: dialogClose
  });
  // init calendar
  $('#FOTAUpgradeDialog').find('.datePicker').datetimebox({
    current: new Date(),
    editable: false
    // parser: function (data) {
    //   console.log(data);
    //   var t = Date.parse(data);
    //   if (!isNaN(t)) {
    //     return new Date(t);
    //   } else {
    //     return new Date();
    //   }
    // },
    // onSelect: function (data) {
    //   console.log(data);
    // }
  });
}

function initFirmwareVList (deviceType) {
  loading();
  return getFirmwareVersionList(deviceType).then(res => {
    if (!res) {
      return false;
    }
    res = res.map((val) => {
      return {
        label: val.firmwareVersion,
        value: val.firmwareVersion
      };
    });
    const ele = $('#FTAFormNewFW');
    if (ele[0].hasAttribute('comboname')) {
      ele.combobox('loadData', res);
    } else {
      ele.combobox({
        width: '100%',
        panelHeight: calculateWH(150),
        editable: false,
        valueField: 'value',
        textField: 'label',
        data: res,
        value: res[0].value
      });
    }
    return res;
    // initSelectOptions(res, $('#FTAFormNewFW'), true);
  }).catch(e => {
    console.log(e);
    mesgTip('error', {
      msg: e.message || 'Get Firmware Version List: load failed'
    });
    return [];
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
    const deviceType = deviceTypeMap.filter((val) => {
      if ($('#FOTAFilter').val() == val.value) {
        return val;
      }
    })[0];
    if (target.indexOf('operate') === -1) {
      dialog.find('.c-form-group').not('[data-scope="batch"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('disableValidation');
      }).hide();
      initFOTAInfo(null, dialog);
    } else {
      dialog.find('.c-form-group').not('[data-scope="batch"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('enableValidation');
      }).show();
      const row = dialog.data('row')[0];
      initFOTAInfo(row, dialog);
      dialog.find('form').form('validate');
    }
    dialog.find(`[name="deviceTypeVal"]`).val(deviceType && deviceType.label);
    dialog.find(`[name="deviceType"]`).val(deviceType && deviceType.value);
  };
}

function initFOTAInfo (row, dialog) {
  if (!row) {
    dialog.find('[comboname]').each(function () {
      const combo = $(this);
      if (combo.hasClass('datePicker')) {
        combo.datetimebox('clear');
      } else {
        const option = combo.combobox('options');
        combo.combobox('setValue', option.value);
      }
    });
  } else {
    Object.keys(row).forEach(val => {
      dialog.find(`[name="${val}"]`).val(row[val]);
      const combox = dialog.find(`[comboname="${val}"]`);
      if (combox[0]) {
        const option = combox.combobox('options');
        combox.combobox('setValue', row[val] || option.value);
      }
    });
  }
}

function FOTAUpgradeDialogOpen (table, dialog) {
  return () => {
    const row = dialog.data('row');
  };
}

function FOTAUpgradeConfirmFn (table, dialog) {
  const form = dialog.find('form');
  const type = dialog.data('target');
  const row = dialog.data('row');
  const validate = form.form('validate');
  let res;
  if (validate) {
    const data = deserialization(serialization(form));
    res = row.map(val => {
      const { devId, deviceType, upgradingFirmware } = Object.assign({}, val, data);
      return {
        devId,
        deviceType,
        upgradingFirmware
      };
    });
    console.log(res);
    $.messager.confirm('Confirm', 'Are you sure to upgrade this FOTA?', function (r) {
      if (r) {
        loading();
        upgrade(res).then(() => {
          mesgTip('success', {
            msg: 'Upgrade FOTA successful'
          });
          dialog.dialog('close');
          table.datagrid('load');
        }).catch(e => {
          console.log(e);
          mesgTip('error', {
            msg: e.message || 'Upgrade FOTA failed'
          });
        }).finally(() => {
          finish();
        });
      }
    });
  }
}

function dialogClose (table, dialog) {
  return () => {
    const form = dialog.find('form');
    form.find('.c-input-text').val('');
    form.find('[comboname]').each(function () {
      const $this = $(this);
      if ($this.hasClass('datePicker')) {
        $this.datetimebox('clear');
      } else {
        $this.combobox('clear');
      }
    });
  };
}

function loadData (params, success, error) {
  const { page, rows } = params;
  const tab = $('.FOTA-tab');
  const { deviceType, firmwareVersion, companyName } = getInitParams(tab);
  return getFotaList(deviceType, { firmwareVersion, companyName, offset: page, limit: rows }).then(res => {
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
  if (!$('#FTAFormNewFW').siblings('.combo')[0]) {
    initFirmwareVList($('#FOTAFilter').combobox('getValue')).then(res => {
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
