import { calculateWH, deserialization, serialization, isType } from '../common/util';

export var store = {};

export function getRequestUrl (url, scope) {
  if (!url) {
    return '';
  }
  if (!scope) {
    return url;
  }
  let params = '';
  const searchBox = scope.find('.search-box');
  const filter = $(`#${searchBox.data('ftarget')}`);
  if (filter) {
    const filterVal = filter.searchbox('getValue');
    if (filterVal) {
      params += `/${filterVal}`;
    }
  }
  const keyword = $(`#${searchBox.data('starget')}`);
  if (keyword) {
    const keywordVal = keyword.searchbox('getValue');
    if (keywordVal) {
      params += `/${keywordVal}`;
    }
  }
  return url + params;
}

export function getInitParams (scope) {
  if (!scope) {
    return '';
  }
  const searchBox = scope.find('.search-box');
  const deviceType = searchBox.find('.search-filter');
  const data = deserialization(serialization(searchBox));
  if (searchBox.hasClass('firmware-filter-form')) {
    // const deviceTypeArr = [];
    // deviceType.find('[name="filterDeviceType"]:checked').each(function () {
    //   deviceTypeArr.push($(this).val());
    // });
    data.deviceType = searchBox.find('.data-ele').val();
  } else {
    data.deviceType = deviceType.combobox('getValues').join(',');
  }
  return data;
}

export class InitDataGrid {
  constructor (table, opt) {
    this.id = InitDataGrid.COLLECTIONID;
    this.table = table;
    table.data('gridId', this.id);
    this.opts = Object.assign({}, {}, opt);
    const tablePanel = table.datagrid(this.opts);
    this.tablePanel = tablePanel.datagrid('getPanel');
    this.pager = tablePanel.datagrid('getPager');
    this.collection(this);
  }

  collection (target) {
    InitDataGrid.COLLECTION.push(target);
    InitDataGrid.COLLECTIONID++;
  }

  getCollection (id) {
    return InitDataGrid.COLLECTION.filter(val => val.id === id);
  }
}

InitDataGrid.COLLECTION = [];
InitDataGrid.COLLECTIONID = 1;

export function searchClickHank (searchbox, menu) {
  searchbox.children('a').on('click', function () {
    menu.menu('show');
  });
}

export function getDeviceType () {
  let arr = [];
  const deviceType = store.deviceType;
  if (deviceType) {
    arr = deviceType.map(val => {
      return {
        label: val.externalCode,
        value: val.internalCode
      };
    });
    return arr.length ? arr : false;
  }
  return false;
}

export function initCheckboxList (data, ele, name, defaultSelect, defaultVal = 0) {
  if (!data) {
    return false;
  }
  let dom = '';
  data.forEach((val, index) => {
    let select = '';
    if (defaultSelect && index === defaultVal) {
      select = 'checked';
    }
    dom += '<label>' +
      '<input ' + select + ' type="checkbox" name="' + name + '" value="' + val.value + '" />' +
      val.label +
      '</label>';
  });
  ele.html(dom);
}

export function initSelectOptions (data, ele, defaultSelect, defaultVal = 0) {
  if (!data) {
    return false;
  }
  let dom = '';
  data.forEach((val, index) => {
    let select = '';
    if (defaultSelect && index === defaultVal) {
      select = 'selected';
    }
    dom += `<option ${select} value="${val.value}">${val.label}</option>`;
  });
  ele.html(dom);
}

export function formatterFormData () {

}

export function initSearchBox (table, searchbox) {
  searchbox.find('input[name]').each(function () {
    $(this).siblings('input.textbox-text[type="text"]').on('keydown', function (e) {
      if (e && e.keyCode == 13) {
        table.datagrid('load');
      }
    });
  });
  searchbox.find('.submit-btn').on('click', function (e) {
    table.datagrid('load');
  });
}

export function initDialog (dialog, table, other) {
  if (!dialog) {
    return false;
  }
  dialog.find('form').form();
  if (other) {
    Object.keys(other).forEach(key => {
      if (/^on/.test(key) && isType(other[key], 'Function')) {
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
    buttons: [
      {
        text: (other.buttonsOpts && other.buttonsOpts[0].text) || 'Submit',
        iconCls: (other.buttonsOpts && other.buttonsOpts[0].iconCls) || '',
        handler: function () {
          other.confirmFn && other.confirmFn(table, dialog);
        }
      },
      {
        text: (other.buttonsOpts && other.buttonsOpts[1].text) || 'Cancel',
        iconCls: (other.buttonsOpts && other.buttonsOpts[1].iconCls) || '',
        handler: function () {
          other.cancelFn && other.cancelFn(table, dialog);
          dialog.dialog('close');
        }
      }
    ]
  }, other);
  dialog.dialog(opts);
}


