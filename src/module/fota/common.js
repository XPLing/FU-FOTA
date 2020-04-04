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

export function initCheckboxList (data, ele, name) {
  if (!data) {
    return false;
  }
  let dom = '';
  data.forEach(val => {
    dom += '<label>' +
      '<input type="checkbox" name="' + name + '" value="' + val.value + '" />' +
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
    dom += `<option ${select} value="${val}">${val}</option>`;
  });
  ele.html(dom);
}

export function formatterFormData () {

}
