/**
 * Created by XPL on 2019/8/7.
 */
import 'babel-polyfill';
import 'assets/style/base';
import './index.scss';
import 'easyui';
import '1i8n';
import { setLocaleTo } from 'src/module/common/util';

console.log(process.env);
function init(){
  if (window.parent) {
    // set parent frame nav active status
    console.log(window.parent.changeTopFrameBarStyle);
    window.parent.changeTopFrameBarStyle('FOTATD');
  }
}
$(function () {
  init();
  setLocaleTo($);
  $('#firmwareTable').datagrid({
    columns: [[
      { field: 'code', title: 'Code', width: 100 },
      { field: 'name', title: 'Name', width: 100 },
      { field: 'price', title: 'Price', width: 100, align: 'right' }
    ]],
    data: [
      { code: 'value11', name: 'value12', price: 12 },
      { code: 'value11', name: 'value12', price: 12 }
    ]
  });
});
