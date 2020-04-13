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
  InitDataGrid,
  getDeviceType,
  getInitParams,
  initSearchBox, initDialog
} from './common';
import { getFotaList, getFirmwareVersionList, upgradeFota } from 'src/assets/api/index';

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
    selectOnCheck: true,
    fitColumns: true,
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'devId', title: $.i18n.prop('MESS_Device_ID') },
      {
        field: 'license',
        title: $.i18n.prop('MESS_Vehicle#Asset#'),
        formatter: function (value, row, index) {
          const vals = value ? ellipsis(value, 15) : 'N/A';
          return `<span title="${vals}"></span>`;
        }
      },
      {
        field: 'percentage',
        align: 'center',
        title: $.i18n.prop('MESS_Status'),
        formatter: function (value, row, index) {
          return `<span>${value === '100%' ? 'Done' : (value || '')}</span>`;
        }
      },
      { field: 'upgradingFirmware', title: $.i18n.prop('MESS_UpgradingFW') },
      { field: 'currentFirmware', title: $.i18n.prop('MESS_Current_Firmware') },
      { field: 'operatorName', align: 'center', title: $.i18n.prop('MESS_OperatedBy') },
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
            let operationStatus = 'disable';
            if (row.status !== 0) {
              operationStatus = '';
            }
            return `<span class="c-icon icon-reload operate ${operationStatus}" title="${$.i18n.prop('MESS_Upgrade')}" data-operate="upgrading" data-index=${index}></span>`;
          }
        }
      }
    ]],
    rowStyler: function (index, row) {
      if (fwVersion && row.status === 0) {
        return 'background-color:#eee;';
      }
    },
    onCheck: function (rowIndex, rowData) {
      if (rowData.status === 0 || !fwVersion) {
        $(this).datagrid('uncheckRow', rowIndex);
      }
    },
    onSelect: function (rowIndex, rowData) {
      if (rowData.status === 0 || !fwVersion) {
        $(this).datagrid('unselectRow', rowIndex);
      }
    },
    onCheckAll: function (rowIndex, rows) {
      const ignoreCheckbox = table.datagrid('getPanel').panel('body').find('.datagrid-view').find('.ignore-checkbox');
      ignoreCheckbox.each(function () {
        $(this).prop('checked', false);
      });
    },
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
  initDialog($('#FOTAUpgradeDialog'), table, {
    title: $.i18n.prop('MESS_Create_Firmware'),
    onClose: dialogClose,
    onBeforeOpen: dialogBeforeOpen,
    onOpen: dialogOpen,
    confirmFn: dialogConfirmFn
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
    if (!res || !res.length) {
      // mesgTip('error', {
      //   msg: 'This device type has no firmware version!'
      // });
      return false;
    }
    res = res.map((val) => {
      return {
        label: val.firmwareVersion,
        value: val.firmwareVersion,
        id: val.firmwareId
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
        if (combox.hasClass('datePicker')) {
          const option = combox.datetimebox('options');
          combox.datetimebox('setValue', formatDate(row[val] || option.value, 'MM/dd/yyyy hh:mm:ss'));
        } else {
          const option = combox.combobox('options');
          combox.combobox('setValue', row[val] || option.value);
        }
      }
    });
  }
}

function dialogBeforeOpen (table, dialog) {
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
  let res;
  if (validate) {
    const data = deserialization(serialization(form));
    const upgradingFWComboxData = form.find(`[comboname=upgradingFirmware]`).combobox('getData');
    let firmwareId = '';
    if (upgradingFWComboxData) {
      for (let i = 0, len = upgradingFWComboxData.length; i < len; i++) {
        const item = upgradingFWComboxData[i];
        if (data.upgradingFirmware === item.value) {
          firmwareId = item.id;
        }
      }
    }
    res = row.map(val => {
      const { devId, deviceType, upgradingFirmware, commandExpireDate, currentFirmware } = Object.assign({}, val, data);
      return {
        devId,
        deviceType,
        upgradingFirmware,
        currentFirmware,
        firmwareId,
        commandExpireDate: new Date(commandExpireDate).getTime()
      };
    });
    console.log(res);
    $.messager.confirm('Confirm', 'Are you sure to upgrade those devices?', function (r) {
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
      if ($this.hasClass('disable')) {
        return false;
      }
      const row = table.datagrid('getRows')[$this.data('index')];
      initDialogFirmwareVList([row], this);
    }
  });
}

function addToolHandle (table) {
  $('.batch-upgrade').on('click', function () {
    let row = table.datagrid('getChecked');
    row = row.filter((val) => {
      return val.status !== 0;
    });
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

