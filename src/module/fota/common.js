import { calculateWH, deserialization, serialization, isType, uuid } from '../common/util';

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
  const filterList = searchBox.find('.search-filter');
  const data = deserialization(serialization(searchBox));
  console.log(data);
  // if (searchBox.eq(0).hasClass('firmware-filter-form')) {
  //   filterList.each(function (el) {
  //     const dataEl = $(el).find('.data-ele');
  //     const key = dataEl.attr('name');
  //     data[key] = dataEl.val();
  //   });
  // } else {
  //   // fota
  //    data.deviceType = filterList.combobox('getValues').join(',');
  //     filterList.each(function (el) {
  //       const dataEl = $(el).siblings('.textbox.combo').find('.textbox-value');
  //       const key = dataEl.attr('name');
  //       data[key] = dataEl.val();
  //     });
  // }
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

const mulCheckOpts = {
  table: null,
  container: null,
  dataMap: [],
  fieldName: '',
  onSubmit: null,
  allowNull: false,
  defaultVal: []
};
const mulCheckMap = new WeakSet();

/**
 * MulCheck
 * @param container 复选组件容器
 * @param table 复选相关联table
 */
class MulCheck {
  constructor (container, opts) {
    this.id = uuid(8, 16);
    this.container = container;
    this.viewer = container.find('.select-view .cont');
    this.optsWrapper = container.find('.select-opts');
    this.optsCont = this.optsWrapper.find('.cont');
    this.opts = Object.assign({}, mulCheckOpts, opts);
    this.init();
  }

  init () {
    const { dataMap, fieldName, onSubmit, defaultVal, allowNull } = this.opts;
    if (!this.container) {
      console.error('filter view init failed, missing the viewer container');
      return false;
    }
    const container = this.container;
    const viewer = this.viewer;
    const optsWrapper = this.optsWrapper;
    const optsCont = this.optsCont;
    let str = '';
    dataMap.forEach((val, index) => {
      let className = 'item';
      if (defaultVal.includes(val.value)) {
        className += ' active';
      }
      container.find('.data-ele').val(defaultVal.join(','));
      str += `<li class="${className}" data-val="${val.value}">${val.label}</li>`;
    });
    viewer.html(str);
    // dialog opts
    this.initCheckboxList(dataMap, optsCont, fieldName, defaultVal);
    // bind base handle
    this.initHandle();
    this.container.data('mulCheck', this);
    this.collection();
  }

  initHandle () {
    const $this = this;
    const container = $this.container;
    const viewer = $this.viewer;
    const optsCont = $this.optsCont;
    const optsWrapper = $this.optsWrapper;
    const allowNull = $this.opts.allowNull;
    const fieldName = $this.opts.fieldName;
    // checkbox handle
    $this.optsWrapper.find('.select-opts-cont').on('change', '[name="' + fieldName + '"]', function (e) {
      const $target = $(this);
      const res = $this.getCheckVals(optsCont, '' + fieldName + '').join(',');
      if (!res && !allowNull) {
        $target[0].checked = true;
        return false;
      }
    });
    // add select btn handle
    viewer.closest('.select-view').find('.select-btn').on('click', function () {
      $this.dialogShow();
    });
    optsWrapper.find('.btn[data-operate]').on('click', function () {
      $this.dialogOperateHandle(this, {
        container,
        fieldName
      });
    });
  }

  collection () {
    mulCheckMap.add(this);
  }

  dialogOperateHandle (e, { container, fieldName }) {
    const $el = $(e);
    const type = $el.data('operate');
    switch (type) {
      case 'submit':
        this.mulCheckSubmit();
        this.opts.onSumbit && this.opts.onSumbit();
        break;
      case 'cancel':
        break;
    }
    this.dialogHide();
  }

  dialogShow () {
    this.optsWrapper.show();
  }

  dialogHide () {
    this.optsWrapper.hide();
  }

  initCheckboxList (data, ele, name, defaultVal) {
    if (!data) {
      return false;
    }
    let dom = '';
    data.forEach((val, index) => {
      let select = '';
      if (defaultVal.includes(val.value)) {
        select = 'checked';
      }
      dom += '<label>' +
        '<input ' + select + ' type="checkbox" name="' + name + '" value="' + val.value + '" />' +
        val.label +
        '</label>';
    });
    ele.html(dom);
  }

  mulCheckSubmit () {
    const optsCont = this.optsCont;
    const fieldName = this.opts.fieldName;
    const res = this.getCheckVals(optsCont, fieldName);
    this.render(res);
  }

  render (res) {
    const viewerCont = this.viewer.find('li');
    viewerCont.removeClass('active');
    if (res && res.length) {
      res.forEach((val) => {
        viewerCont.each(function () {
          const item = $(this);
          const data = item.data('val');
          if (data == val) {
            item.addClass('active');
          }
        });
      });
    }
    this.container.find('.data-ele').val(res.join(','));
  }

  getCheckVals (scope, name) {
    const deviceTypeArr = [];
    scope.find('[name="' + name + '"]:checked').each(function () {
      deviceTypeArr.push($(this).val());
    });
    return deviceTypeArr;
  }

  reset () {
    this.render(this.opts.defaultVal);
    const defaultVal = this.opts.defaultVal.map(item => item.toString());
    if (this.opts.defaultVal.length) {
      this.optsCont.find('input[type="checkbox"]').each((index, item) => {
        const $item = $(item);
        const val = $item.val();
        if (defaultVal.includes(val) && !$item[0].checked) {
          $item[0].checked = true;
        } else if (!defaultVal.includes(val) && $item[0].checked) {
          $item[0].checked = false;
        }
      });
      this.opts.defaultVal.forEach((item) => {
        const input = this.optsCont.find('input[type="checkbox"][value="' + item + '"]')[0];
        if (input) {
          input.checked = true;
        }
      });
    } else {
      this.optsCont.find('input[type="checkbox"]:checked').each(function () {
        this.checked = false;
      });
    }
  }
}

MulCheck.getInstance = function (id) {
  return mulCheckMap.filter(function (item) {
    return item.id === id;
  })[0];
};

MulCheck.Init = function (container, ...arg) {
  const data = container.data('mulCheck');
  if (data) {
    return data;
  } else {
    return new MulCheck(container, ...arg);
  }
};

export function filterViewBase (...arg) {
  MulCheck.Init(...arg);
}

function getCheckVals (scope, name) {
  const deviceTypeArr = [];
  scope.find('[name="' + name + '"]:checked').each(function () {
    deviceTypeArr.push($(this).val());
  });
  return deviceTypeArr;
}

export function initCheckboxList (data, ele, name, defaultVal = []) {
  if (!data) {
    return false;
  }
  let dom = '';
  data.forEach((val, index) => {
    let select = '';
    if (defaultVal.includes(val.value)) {
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

export function initSearchBox (table, searchbox, { onSubmit, onRest } = {}) {
  searchbox.find('input[name]').each(function () {
    $(this).siblings('input.textbox-text[type="text"]').on('keydown', function (e) {
      if (e && e.keyCode == 13) {
        table.datagrid('load');
      }
    });
  });
  searchbox.find('.submit-btn').on('click', function (e) {
    onSubmit && onSubmit();
    table.datagrid('load');
  });
  searchbox.find('.reset-btn').on('click', function (e) {
    resetSearch(searchbox.find('form'));
    onRest && onRest();
    table.datagrid('load');
  });
}

function resetSearch (form) {
  form[0].reset();
  form.find('input[comboname]').each((index, item) => {
    const target = $(item);
    const fieldName = target.attr('comboname');
    const opts = target.combobox('options');
    const defaultVal = opts.value;
    const data = opts.data;
    const textbox = target.siblings('.textbox.combo');
    let defaultText = data.filter(item => item.value == defaultVal)[0];
    defaultText = defaultText ? defaultText.label : '';
    textbox.find('.textbox-text').val(defaultText);
    textbox.find('[name="' + fieldName + '"]').val(defaultVal);
  });
  form.find('input[textboxname]').not('[comboname]').each((index, item) => {
    const target = $(item);
    target.textbox('reset');
  });
  form.find('.c-mul-select').each((index, item) => {
    const mulCheck = $(item).data('mulCheck');
    if (mulCheck) {
      mulCheck.reset();
    }
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


