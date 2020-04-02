import { calculateWH, InitDataGrid } from '../common/util';
import { getFirmwareUrl } from 'src/assets/api/index';

export function initFirmwareTable () {
  const table = $('#firmwareTable');
  // search box
  $('#firmwareSearch').searchbox({
    width: calculateWH(280),
    searcher (value, name) {
      console.log(value + ',' + name);
    },
    menu: '#firmwareSearchMenu',
    prompt: $.i18n.prop('MESS_Input_Value')
  });
  // device type filter
  $('#firmwareFilter').combobox({
    width: calculateWH(100),
    panelHeight: calculateWH(150),
    editable: false,
    valueField: 'value',
    textField: 'label',
    multiple: true,
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
  // table
  const datagrid = new InitDataGrid(table, {
    url: getFirmwareUrl,
    pagination: true,
    toolbar: [
      {
        iconCls: 'icon-add',
        text: $.i18n.prop('MESS_New'),
        handler: function () {
        }
      }
    ],
    columns: [[
      { field: 'companyName', title: $.i18n.prop('MESS_Firmware') },
      { field: 'deviceId', title: $.i18n.prop('MESS_Device_Type') },
      { field: 'VehicleAsset', title: $.i18n.prop('MESS_Firmware_Stage') },
      { field: 'UpgradingFW', title: $.i18n.prop('MESS_File_Size') },
      { field: 'CurrentFW', title: $.i18n.prop('MESS_Add_By') },
      { field: 'OperatedBy', title: $.i18n.prop('MESS_Description') },
      { field: 'status', title: $.i18n.prop('MESS_SubTap_Status') },
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
  });
  const tablePanel = datagrid.tablePanel;
  if (tablePanel[0]) {
    tablePanel.on('click', '[data-operate]', function () {
      const $this = $(this), type = $this.data('operate');
    });
  }
}
