/**
 * Created by XPL on 2020/3/31.
 */
import './themes/default/easyui.css';
import './themes/icon.css';
import 'jquery-easyui';

var originView = $.fn.datagrid.defaults.view;
var originRenderRow = $.fn.datagrid.defaults.view.renderRow;
$.fn.datagrid.defaults.view = $.extend({}, $.fn.datagrid.defaults.view, {
  renderRow: function (target, fields, frozen, rowIndex, rowData) {
    var res = originRenderRow.call(originView, target, fields, frozen, rowIndex, rowData);
    var $div = $('<div></div>');
    $div.html(res);
    if (target) {
      if ($(target).datagrid('getColumnOption', 'checkbox')) {
        if (rowData.status === 0) {
          $div.find('[field="checkbox"] input[type="checkbox"]').css('opacity', 0.3).each(function () {
            $(this).checked = false;
          });
        }
      }
    }
    return $div.html();
  }
});
var originCheckAll = $.fn.datagrid.methods.checkAll;

$.fn.datagrid.methods = $.extend({}, $.fn.datagrid.methods, {
  checkAll: function (...arg) {
    console.log(...arg);
    // var res = originCheckAll.call(originView, ...arg);
    // console.log(...arg);
    // var _817 = $.data(_815, 'datagrid');
    // var opts = _817.options;
    // var rows = opts.finder.getRows(_815);
  }
});

