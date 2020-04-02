import { calculateWH, InitDataGrid } from '../common/util';
import { getFotaListUrl } from 'src/assets/api/index';

export function initFOTATable () {
  const table = $('#FOTATable');
  $('#FOTASearch').searchbox({
    width: calculateWH(280),
    searcher (value, name) {
      console.log(value + ',' + name);
    },
    menu: '#FOTASearchMenu',
    prompt: $.i18n.prop('MESS_Input_Value')
  });
  $('#FOTAFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    data: [
      {
        label: '2GL',
        value: 2
      },
      {
        label: '3NW',
        value: 3
      }
    ]
  });
  const datagrid = new InitDataGrid(table, {
    // url: getFotaListUrl,
    method: 'GET',
    pagination: true,
    // toolbar: '#FOTATabTool',
    toolbar: [
      {
        iconCls: 'icon-reload batch-upgrade',
        text: $.i18n.prop('MESS_Batch_Upgrade'),
        handler: function () {
          const $this = $(this);
          const row = table.datagrid('getChecked');
          if (!row || !row.length) {
            $.messager.alert('Warning', $.i18n.prop('MESS_CheckMultiple_ErrorMsg'));
            return false;
          }
          $('#FOTAUpgradeDialog').data({ row: row, target: $this.attr('class') }).dialog('open');
        }
      }
    ],
    columns: [[
      { field: 'checkbox', checkbox: true },
      { field: 'companyName', title: $.i18n.prop('MESS_Company_Name') },
      { field: 'deviceId', title: $.i18n.prop('MESS_Device_ID') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Vehicle#Asset#') },
      { field: 'status', title: $.i18n.prop('MESS_SubTap_Status') },
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
    ]
  });
  const tablePanel = datagrid.tablePanel;
  if (tablePanel[0]) {
    tablePanel.on('click', '[data-operate]', function () {
      const $this = $(this), type = $this.data('operate');
      if (type === 'upgrading') {
        const row = table.datagrid('getRows')[$this.data('index')];
        $('#FOTAUpgradeDialog').data({ row: row, target: this.className }).dialog('open');
      }
    });
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

