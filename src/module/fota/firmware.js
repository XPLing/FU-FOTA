import {
  calculateWH,
  loading,
  finish,
  mesgTip,
  deserialization,
  serialization,
  formatDate,
  toTXT,
  formatSize
} from '../common/util';
import {
  getDeviceType,
  InitDataGrid,
  initCheckboxList, getInitParams, initSearchBox, initDialog
} from './common';
import {
  getFirmwareList,
  getFirmwareInfoList,
  updateFirmware,
  creatrFirmware
} from 'src/assets/api/index';

let deviceTypeMap;
const statusMap = ['Active', 'Expired'];
const stageMap = ['Beta', 'Release', 'Specific'];

export function initFirmwareTable () {
  deviceTypeMap = getDeviceType();

  const table = $('#firmwareTable'), search = $('#firmwareSearch'), tab = $('.firmware-tab');
  initCheckboxList(deviceTypeMap, $('#FWFormDeviceType'), 'deviceType');
  // device type filter
  initCheckboxList(deviceTypeMap, $('#firmwareFilter'), 'filterDeviceType', true);
  initFilterView(table);
  // $('#firmwareFilter').combobox({
  //   width: calculateWH(100),
  //   panelHeight: calculateWH(150),
  //   editable: false,
  //   valueField: 'value',
  //   textField: 'label',
  //   multiple: true,
  //   data: deviceTypeMap,
  //   value: deviceTypeMap[0].value,
  //   onChange: function (newValue, oldValue) {
  //     $(this).combobox('hidePanel');
  //     if (newValue.length) {
  //       table.datagrid('load');
  //     } else {
  //       $(this).combobox('setValue', oldValue);
  //     }
  //   }
  // });
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
      {
        field: 'fileSize',
        title: $.i18n.prop('MESS_File_Size'),
        align: 'right',
        formatter: function (value, row, index) {
          return formatSize(value);
        }
      },
      { field: 'updaterName', title: $.i18n.prop('MESS_Add_By') },
      {
        field: 'description',
        title: $.i18n.prop('MESS_Description'),
        formatter: function (value, row, index) {
          return toTXT(value);
        }
      },
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
          let expireClass = '';
          if (row.status === 2) {
            expireClass = 'disable';
          }
          const url = `/operator/admin/fota/firmware/${row.firmwareId}/download`;
          return `<p class="operation-tool">
                    <span class="c-icon icon-edit operate" title="${$.i18n.prop('MESS_Firmware_Edit')}" data-operate="edit" data-index=${index}></span>
                    <a href="${url}" download="${row.firmwareVersion}" class="c-icon icon-download operate" title="${$.i18n.prop('MESS_Firmware_Download')}" data-operate="download" data-index=${index}></a>
                    <span class="c-icon icon-expired operate ${expireClass}" title="${$.i18n.prop('MESS_Firmware_EditExpireDate')}" data-operate="expire" data-index=${index}></span>
                  </p>`;
        }
      }
    ]],
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
  initDialog($('#firmwareDialog'), table, {
    title: $.i18n.prop('MESS_Create_Firmware'),
    onClose: dialogClose,
    onBeforeOpen: dialogBeforeOpen,
    onOpen: dialogOpen,
    confirmFn: dialogConfirmFn
  });
  // Expire Dialog
  initDialog($('#firmwareExpireDialog'), table, {
    width: calculateWH(400),
    height: calculateWH(150),
    title: $.i18n.prop('MESS_Confirm'),
    buttonsOpts: [
      {
        text: 'Ok',
        iconCls: 'icon-ok'
      },
      {
        text: 'Cancel',
        iconCls: 'icon-no'
      }
    ],
    confirmFn: expireDialogConfirmFn
  });
  // init dialog Stage and Status dropdown menu
  initDialogCombox(stageMap, $('#FWFormStage'));
  // initDialogCombox(statusMap, $('#FWFormStatus'), 400, 60);
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

function initFilterView (table) {
  const viewer = $('#firmwareFilterView');
  const checkWrapper = viewer.closest('.c-mul-select');
  const optsWrapper = checkWrapper.find('.select-opts');
  let str = '';
  deviceTypeMap.forEach((val, index) => {
    let className = 'item';
    if (index === 0) {
      className += ' active';
      checkWrapper.find('.data-ele').val(val.value);
    }
    str += `<li class="${className}" data-val="${val.value}">${val.label}</li>`;
  });
  viewer.html(str);

  // checkbox handle
  optsWrapper.find('.select-opts-cont').on('change', '[name="filterDeviceType"]', function (e) {
    const $this = $(this);
    const res = getCheckDeviceType($('#firmwareFilter'), 'filterDeviceType').join(',');
    if (!res) {
      $this[0].checked = true;
      return false;
    }
  });
  // add select btn handle
  viewer.closest('.select-view').find('.select-btn').on('click', function () {
    optsWrapper.show();
  });
  optsWrapper.find('.btn[data-operate]').on('click', function () {
    const $this = $(this);
    const type = $this.data('operate');
    switch (type) {
      case 'submit':
        mulCheckSubmit(table);
        break;
      case 'cancel':
        break;
    }
    optsWrapper.hide();
  });
}

function mulCheckSubmit (table) {
  const optsCont = $('#firmwareFilter');
  const checkWrapper = optsCont.closest('.c-mul-select');
  const viewer = checkWrapper.find('.select-view');
  const viewerCont = viewer.find('li');
  const res = getCheckDeviceType(optsCont, 'filterDeviceType');
  if (res && res.length) {
    viewerCont.removeClass('active');
    res.forEach((val) => {
      viewerCont.each(function () {
        const item = $(this);
        const data = item.data('val');
        if (data == val) {
          item.addClass('active');
        }
      });
    });
    checkWrapper.find('.data-ele').val(res.join(','));
    table.datagrid('load');
  }
}

function getCheckDeviceType (scope, name) {
  const deviceTypeArr = [];
  scope.find('[name="' + name + '"]:checked').each(function () {
    deviceTypeArr.push($(this).val());
  });
  return deviceTypeArr;
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

function dialogBeforeOpen (table, dialog) {
  return () => {
    const target = dialog.data('target');
    let title;
    const firmwareLocation = dialog.find(`[name="firmwareLocation"]`);
    if (target.indexOf('operate') === -1) {
      dialog.find('.c-form-group').filter('[data-scope="edit"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('disableValidation');
      }).hide();
      title = $.i18n.prop('MESS_Create_Firmware');
      initFirmwareInfo(null, dialog);
      firmwareLocation.removeAttr('disabled');
    } else {
      dialog.find('.c-form-group').filter('[data-scope="edit"]').each(function () {
        const field = $(this).find('.easyui-validatebox');
        field.validatebox('enableValidation');
      }).show();
      title = $.i18n.prop('MESS_Edit_Firmware');
      const row = dialog.data('row');
      initFirmwareInfo(row, dialog);
      firmwareLocation.attr('disabled', true);
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
  const validate = form.form('validate');
  if (validate) {
    const data = deserialization(serialization(form));
    data.deviceType = deviceTypes.join(',');
    const { deviceType, firmwareStage, description, firmwareId, firmwareVersion, status, firmwareLocation } = Object.assign({}, row, data);
    let promise;
    if (type.indexOf('operate') !== -1) {
      promise = updateHandle(firmwareId, {
        firmwareVersion,
        firmwareStage,
        description,
        deviceTypes: deviceType,
        status
      });
    } else {
      promise = createHandle({
        firmwareVersion,
        deviceTypes: deviceType,
        firmwareStage,
        description,
        firmwareLocation
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

function expireDialogConfirmFn (table, dialog) {
  const form = dialog.find('form');
  const row = dialog.data('row');
  const { deviceTypes, firmwareStage, description, firmwareId, firmwareVersion } = row;
  loading();
  updateHandle(firmwareId, {
    firmwareVersion,
    firmwareStage,
    description,
    deviceTypes: deviceTypes.join(','),
    status: 2
  }).then(() => {
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
      // if (!$('#FWFormFirmware').siblings('.combo')[0]) {
      //   initFirmwareVList().then(res => {
      //     $('#firmwareDialog').data({ row: row, target: this.className }).dialog('open');
      //   });
      // } else {
      // }
      $('#firmwareDialog').data({ row: row, target: this.className }).dialog('open');
    } else if (type === 'expire') {
      if ($this.hasClass('disable')) {
        return false;
      }
      $('#firmwareExpireDialog').data({ row: row }).dialog('open');
    }
  });
}

function addToolHandle (table) {
  $('.firmware-new').on('click', function () {
    const $this = $(this);
    // if (!$('#FWFormFirmware').siblings('.combo')[0]) {
    //   initFirmwareVList().then(res => {
    //     $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
    //   });
    // } else {
    //
    // }
    $('#firmwareDialog').data({ target: $this.attr('class') }).dialog('open');
  });
}

function updateHandle (fwId, params) {
  return updateFirmware(fwId, params).then(res => {
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
      let displayVal = row[val];
      if (val === 'status') {
        displayVal = statusMap[row[val] - 1];
      }
      dialog.find(`[name="${val}"]`).val(displayVal);
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
    // const firmware = dialog.find(`[comboname="firmwareLocation"]`);
    // const firmwareOption = firmware.combobox('options');
    // firmware.combobox('setValue', firmwareOption.value);
  }
}


