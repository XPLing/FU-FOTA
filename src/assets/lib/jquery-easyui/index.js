/**
 * Created by XPL on 2020/3/31.
 */
import './themes/default/easyui.css';
import './themes/icon.css';
import 'jquery-easyui';

var originView = $.fn.datagrid.defaults.view;
var originRenderRow = $.fn.datagrid.defaults.view.renderRow;
// change the default checkbox status to disable
$.fn.datagrid.defaults.view = $.extend({}, $.fn.datagrid.defaults.view, {
  renderRow: function (target, fields, frozen, rowIndex, rowData) {
    var res = originRenderRow.call(originView, target, fields, frozen, rowIndex, rowData);
    var $div = $(document.createDocumentFragment().appendChild(document.createElement('div')));
    $div.html(res);
    if (target) {
      if ($(target).datagrid('getColumnOption', 'checkbox')) {
        if ([0, 1, 2].includes(rowData.status)) {
          $div.find('[field="checkbox"] input[type="checkbox"]').addClass('ignore-checkbox').attr('disabled', true).css('opacity', 0.5).each(function () {
            $(this).checked = false;
          });
        }
      }
    }
    return $div.html();
  }
});

